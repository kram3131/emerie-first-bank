import { NextResponse } from "next/server";
import { loadKnowledgeBase } from "@/lib/kb";
import { VOICE_SYSTEM_PROMPT } from "@/lib/voiceSystemPrompt";
import { BRAND } from "@/lib/brand";

const AGENT_ID = "b265221e-661f-4e1f-8107-814f76351381";

const navigateTool = {
  temporaryTool: {
    modelToolName: "navigateToPage",
    description: `Navigates the user's browser to a page on the ${BRAND.name} website. Use this when the user asks about a topic that has a dedicated page. Tell the user you're navigating them BEFORE calling this tool. AFTER the tool returns, do NOT restate your previous answer — just ask a short follow-up question like 'Want me to walk you through the details?' or 'Anything specific you'd like to know?'`,
    dynamicParameters: [
      {
        name: "page",
        location: "PARAMETER_LOCATION_BODY",
        schema: {
          type: "string",
          description:
            "The page path to navigate to. Valid values: '/' (home), '/personal' (personal banking, checking, savings, CDs), '/business' (business banking, business checking, business lending), '/loans' (consumer loans, auto loans, mortgages, home equity), '/locations' (branch locations, contact info, hours), '/about' (about the bank, history, leadership, community)",
          enum: ["/", "/personal", "/business", "/loans", "/locations", "/about"],
        },
        required: true,
      },
    ],
    client: {},
  },
};

const transferFundsTool = {
  temporaryTool: {
    modelToolName: "transferFunds",
    description:
      "Move money between the customer's own accounts. ONLY call after identity verification has passed AND the customer has explicitly confirmed the from-account, to-account, and amount. Allowed routes: checking<->savings, and checking->auto_loan as a one-time loan payment. The tool result includes the new balances — read them back to the customer.",
    dynamicParameters: [
      {
        name: "from",
        location: "PARAMETER_LOCATION_BODY",
        schema: {
          type: "string",
          enum: ["checking", "savings"],
          description: "Source account.",
        },
        required: true,
      },
      {
        name: "to",
        location: "PARAMETER_LOCATION_BODY",
        schema: {
          type: "string",
          enum: ["checking", "savings", "auto_loan"],
          description: "Destination account.",
        },
        required: true,
      },
      {
        name: "amount",
        location: "PARAMETER_LOCATION_BODY",
        schema: {
          type: "number",
          description: "Dollar amount to move (positive number).",
        },
        required: true,
      },
    ],
    client: {},
  },
};

const FIRST_SPEAKER = {
  agent: {
    uninterruptible: true,
    text: `Hi there... I'm Alex, the virtual assistant for ${BRAND.name}... I'm here to help with anything you need — account info, rates, hours, you name it. What can I help you with?`,
    delay: "1.5s",
  },
};

export async function POST() {
  const apiKey = process.env.ULTRAVOX_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Missing API key" }, { status: 500 });
  }

  // Fetch agent config for model, voice, temperature, etc.
  const agentRes = await fetch(
    `https://api.ultravox.ai/api/agents/${AGENT_ID}`,
    {
      headers: { "X-API-Key": apiKey },
    }
  );

  if (!agentRes.ok) {
    const text = await agentRes.text();
    return NextResponse.json(
      { error: "Failed to fetch agent", details: text },
      { status: agentRes.status }
    );
  }

  const agent = await agentRes.json();
  const tpl = agent.callTemplate || {};

  // Build the voice system prompt. Two grounding paths:
  //
  //   1. If BRAND.ultravoxCorpusId is set, we've scraped and uploaded the
  //      target bank's site to an Ultravox-hosted corpus. Use their queryCorpus
  //      tool for RAG at speech latency, and skip injecting the full KB inline
  //      (saves tokens, faster first response). Chat still reads local kb/*.md
  //      inline — both modes are grounded in the same scraped source.
  //
  //   2. If no corpus id is set (default Emerie demo), inject the local kb/*.md
  //      files inline so voice and chat stay identical.
  //
  const useHostedCorpus = !!BRAND.ultravoxCorpusId;
  const systemPrompt = useHostedCorpus
    ? `${VOICE_SYSTEM_PROMPT}\n\n# Knowledge Base\n\nUse the queryCorpus tool for any product, rate, fee, hours, location, or policy question. Give a brief natural acknowledgement before calling it and pull only the specific fact the visitor asked about — don't dump everything.`
    : `${VOICE_SYSTEM_PROMPT}\n\n# Knowledge Base\n\n${loadKnowledgeBase()}`;

  // Drop tools that don't belong on the web widget:
  // - transferCall / hangUp: nonexistent on the widget, cause looping
  // - queryCorpus: we conditionally re-add below with our own corpus id
  const DROPPED_TOOLS = new Set(["transferCall", "hangUp", "queryCorpus"]);

  const queryCorpusTool = useHostedCorpus
    ? [
        {
          toolName: "queryCorpus",
          parameterOverrides: {
            corpus_id: BRAND.ultravoxCorpusId,
            max_results: 3,
          },
        },
      ]
    : [];

  const callBody: Record<string, unknown> = {
    systemPrompt,
    medium: { webRtc: {} },
    firstSpeakerSettings: FIRST_SPEAKER,
    selectedTools: [
      ...(tpl.selectedTools || []).filter((t: Record<string, unknown>) => {
        const tmp = t?.temporaryTool as Record<string, unknown> | undefined;
        const name = (tmp?.modelToolName as string) || (t?.toolName as string) || "";
        return !DROPPED_TOOLS.has(name);
      }),
      // In demo-shell mode the "page" is a screenshot — there's nothing to
      // navigate to, so don't expose the tool. Otherwise the model narrates
      // fake page changes.
      ...(BRAND.slug === "emerie-first-bank" ? [navigateTool] : []),
      transferFundsTool,
      ...queryCorpusTool,
    ],
  };

  if (tpl.model) callBody.model = tpl.model;
  if (tpl.voice) callBody.voice = tpl.voice;
  // Always force English to prevent TTS from slipping into other languages
  callBody.languageHint = "en";
  if (tpl.temperature != null) callBody.temperature = tpl.temperature;
  if (tpl.maxDuration) callBody.maxDuration = tpl.maxDuration;
  if (tpl.inactivityMessages) callBody.inactivityMessages = tpl.inactivityMessages;

  const response = await fetch(
    "https://api.ultravox.ai/api/calls",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
      },
      body: JSON.stringify(callBody),
    }
  );

  if (!response.ok) {
    const text = await response.text();
    return NextResponse.json(
      { error: "Ultravox API error", details: text },
      { status: response.status }
    );
  }

  const data = await response.json();
  return NextResponse.json({ joinUrl: data.joinUrl, callId: data.callId });
}
