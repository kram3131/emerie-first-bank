import { NextResponse } from "next/server";

const AGENT_ID = "9fe642c1-c4a3-439b-9861-da362c910cce";

const navigateTool = {
  temporaryTool: {
    modelToolName: "navigateToPage",
    description:
      "Navigates the user's browser to a page on the Emerie First Bank website. Use this when the user asks about a topic that has a dedicated page, or when you want to show them relevant information. Always tell the user you're navigating them before calling this tool.",
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

export async function POST() {
  const apiKey = process.env.ULTRAVOX_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Missing API key" }, { status: 500 });
  }

  // Step 1: Fetch agent config to get system prompt, model, voice, etc.
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

  // Step 2: Create call via generic endpoint with agent config + navigation tool
  const callBody: Record<string, unknown> = {
    systemPrompt: tpl.systemPrompt,
    medium: { webRtc: {} },
    firstSpeakerSettings: tpl.firstSpeakerSettings || { agent: {} },
    selectedTools: [...(tpl.selectedTools || []), navigateTool],
  };

  if (tpl.model) callBody.model = tpl.model;
  if (tpl.voice) callBody.voice = tpl.voice;
  if (tpl.languageHint) callBody.languageHint = tpl.languageHint;
  if (tpl.temperature != null) callBody.temperature = tpl.temperature;
  if (tpl.maxDuration) callBody.maxDuration = tpl.maxDuration;
  if (tpl.initialOutputMedium) callBody.initialOutputMedium = tpl.initialOutputMedium;
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
