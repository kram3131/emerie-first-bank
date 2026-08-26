import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { loadKnowledgeBase } from "@/lib/kb";
import { CHAT_SYSTEM_PROMPT } from "@/lib/systemPrompt";
import { BRAND } from "@/lib/brand";
import {
  DEMO_ACCOUNT_NUMBER,
  DEMO_SSN_LAST4,
  DEMO_SMS_CODE,
} from "@/lib/sharedPrompt";
import {
  AccountState,
  INITIAL_ACCOUNT_STATE,
  VerificationState,
  INITIAL_VERIFICATION_STATE,
  isFullyVerified,
  applyTransfer,
  describeFullAccountInfo,
  TransferInput,
} from "@/lib/accounts";

// Defense in depth: the prompt tells the model never to echo the account
// number, SSN digits, or SMS code back, but that's a soft instruction the
// model could still slip on (e.g. narrating a failed attempt: "you entered
// 1234567"). Redact those exact values out of the streamed text
// server-side so a prompt slip-up can never actually reach the client.
const SENSITIVE_VALUES = new Set([
  DEMO_ACCOUNT_NUMBER,
  DEMO_SSN_LAST4,
  DEMO_SMS_CODE,
]);

// What verify_identity_step actually checks a submitted value against. This
// is the real gate — the model's own read of whether a value "looks right"
// counts for nothing; only this server-side comparison flips a verification
// flag to true.
const VERIFICATION_EXPECTED: Record<keyof VerificationState, string> = {
  accountNumber: DEMO_ACCOUNT_NUMBER,
  ssnLast4: DEMO_SSN_LAST4,
  smsCode: DEMO_SMS_CODE,
};
const VERIFICATION_STEP_KEYS: Record<string, keyof VerificationState> = {
  account_number: "accountNumber",
  ssn_last4: "ssnLast4",
  sms_code: "smsCode",
};

// Text streams in arbitrary-sized chunks — a value can land split across
// deltas (even one digit per delta), and matching against each delta in
// isolation misses that. So instead of pattern-matching each chunk, buffer
// only a trailing run of contiguous digits (never real prose, so this adds
// no perceptible delay) and decide once a non-digit character or the stream
// end confirms the run is complete. A same-length coincidental digit run
// (e.g. part of a dollar amount) isn't touched — only an exact match.
function createStreamRedactor() {
  let digitRun = "";
  const flushDigitRun = () => {
    if (!digitRun) return "";
    const value = digitRun;
    digitRun = "";
    return SENSITIVE_VALUES.has(value) ? "•".repeat(value.length) : value;
  };
  return {
    push(chunk: string): string {
      let out = "";
      for (const ch of chunk) {
        if (ch >= "0" && ch <= "9") {
          digitRun += ch;
        } else {
          out += flushDigitRun() + ch;
        }
      }
      return out;
    },
    flush(): string {
      return flushDigitRun();
    },
  };
}

export const runtime = "nodejs";

const MODEL = "claude-haiku-4-5-20251001";
const MAX_TOOL_ITERATIONS = 6;

const VALID_PAGES = ["/", "/personal", "/business", "/loans", "/locations", "/about"];

const USE_ULTRAVOX_CORPUS = !!BRAND.ultravoxCorpusId;
const IS_DEMO_SHELL = BRAND.slug !== "emerie-first-bank";

const NAVIGATE_TOOL: Anthropic.Tool = {
  name: "navigate_to_page",
  description: `Navigate the visitor's browser to a page on the ${BRAND.name} website. Use whenever a topic has a dedicated page so they can see the full details. Briefly tell the visitor first.`,
  input_schema: {
    type: "object",
    properties: {
      page: {
        type: "string",
        enum: VALID_PAGES,
        description: "The page path to navigate to.",
      },
    },
    required: ["page"],
  },
};

const BASE_TOOLS: Anthropic.Tool[] = [
  {
    name: "verify_identity_step",
    description:
      "Submit ONE identity verification factor for server-side validation. Call this for each of the three verification steps (account_number, ssn_last4, sms_code), in that order, right after the visitor answers — never decide yourself whether a value matches. The result tells you whether that step passed and whether all three are now complete.",
    input_schema: {
      type: "object",
      properties: {
        step: {
          type: "string",
          enum: ["account_number", "ssn_last4", "sms_code"],
          description: "Which verification factor this value is for.",
        },
        value: {
          type: "string",
          description: "The raw value the visitor just provided for this factor.",
        },
      },
      required: ["step", "value"],
    },
  },
  {
    name: "get_account_info",
    description:
      "Retrieve the customer's current, authoritative account balances, recent transactions, and loan details. This is the ONLY source of those numbers — they are never given to you in the system prompt. Only works once identity verification is fully complete; call it right after verification passes, and again any time you need a current figure (e.g. after a transfer).",
    input_schema: {
      type: "object",
      properties: {},
    },
  },
  {
    name: "transfer_funds",
    description:
      "Move money between the customer's own accounts. ONLY call after identity verification has passed AND the customer has explicitly confirmed the from-account, to-account, and amount. Allowed routes: checking<->savings, and checking->auto_loan (as a loan payment). Will be rejected server-side if verification isn't complete, regardless of what the conversation implies.",
    input_schema: {
      type: "object",
      properties: {
        from: {
          type: "string",
          enum: ["checking", "savings"],
          description: "Source account.",
        },
        to: {
          type: "string",
          enum: ["checking", "savings", "auto_loan"],
          description: "Destination account.",
        },
        amount: {
          type: "number",
          description: "Dollar amount to move. Must be positive and >= 0.01.",
        },
      },
      required: ["from", "to", "amount"],
    },
  },
];

const CORPUS_TOOL: Anthropic.Tool = {
  name: "query_corpus",
  description: `Retrieve up-to-date content from the ${BRAND.name} knowledge base. Use for ANY factual question about products, rates, fees, hours, locations, or policies — the base system prompt does NOT contain those details. Call this first, read the returned chunks, then answer the visitor. Do not answer product/rate questions from memory.`,
  input_schema: {
    type: "object",
    properties: {
      query: {
        type: "string",
        description:
          "A short natural-language question or phrase to search the knowledge base for. Optimize for retrieval (e.g. 'checking account monthly fee', not 'hello can you tell me about fees').",
      },
    },
    required: ["query"],
  },
};

const TOOLS: Anthropic.Tool[] = [
  // Navigation only when we actually have real pages to route to (not
  // when the whole "site" is a screenshot in demo-shell mode).
  ...(IS_DEMO_SHELL ? [] : [NAVIGATE_TOOL]),
  ...BASE_TOOLS,
  ...(USE_ULTRAVOX_CORPUS ? [CORPUS_TOOL] : []),
];

async function queryUltravoxCorpus(query: string): Promise<string> {
  const key = process.env.ULTRAVOX_API_KEY;
  if (!key || !BRAND.ultravoxCorpusId) {
    return "error: knowledge base not configured";
  }
  try {
    const res = await fetch(
      `https://api.ultravox.ai/api/corpora/${BRAND.ultravoxCorpusId}/query`,
      {
        method: "POST",
        headers: {
          "X-API-Key": key,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ query, max_results: 3 }),
      }
    );
    if (!res.ok) {
      const body = await res.text();
      return `error: corpus query failed (${res.status}): ${body.slice(0, 200)}`;
    }
    const data = (await res.json()) as Array<{ content?: string; documentUrl?: string }>;
    if (!Array.isArray(data) || data.length === 0) {
      return "No matching content found in the knowledge base for that query.";
    }
    return data
      .map((chunk, i) => {
        const src = chunk.documentUrl ? ` (source: ${chunk.documentUrl})` : "";
        return `## Result ${i + 1}${src}\n\n${chunk.content?.trim() || ""}`;
      })
      .join("\n\n---\n\n");
  } catch (err) {
    return `error: ${err instanceof Error ? err.message : "unknown"}`;
  }
}

export async function POST(req: NextRequest) {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return new Response(
      JSON.stringify({ error: "Missing ANTHROPIC_API_KEY" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  const auth = req.cookies.get("efb-auth")?.value;
  if (auth !== "authenticated") {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  let body: {
    messages?: Anthropic.MessageParam[];
    accountState?: Partial<AccountState>;
    verificationState?: Partial<VerificationState>;
  };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Bad JSON" }), { status: 400 });
  }
  const incomingMessages = body.messages || [];
  if (!Array.isArray(incomingMessages) || incomingMessages.length === 0) {
    return new Response(JSON.stringify({ error: "messages required" }), {
      status: 400,
    });
  }

  // Server-side mutable state for THIS request. Seeded from the client's
  // current state so transfers (and verification progress) compose across
  // turns within a page session. Note: since this route is stateless and
  // has no session store, this state round-trips through the client like
  // accountState does — it closes the failure mode we actually observed
  // (the model itself skipping or fabricating a verification pass), but
  // isn't a substitute for server-held session state against a client
  // that deliberately forges the request body. Fine for a demo; a real
  // deployment would key this off a server-side session instead.
  const accountState: AccountState = {
    ...INITIAL_ACCOUNT_STATE,
    ...(body.accountState || {}),
  };
  const verificationState: VerificationState = {
    ...INITIAL_VERIFICATION_STATE,
    ...(body.verificationState || {}),
  };

  const client = new Anthropic({ apiKey });
  // When BRAND.ultravoxCorpusId is set, grounding comes from the Ultravox
  // corpus via the query_corpus tool (fresh, matches voice mode). Otherwise
  // (Emerie default) fall back to the inline local kb/*.md files.
  const kb = USE_ULTRAVOX_CORPUS ? null : loadKnowledgeBase();

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
      };

      try {
        // Working message list — we append assistant + tool_result turns
        // as the agent loop runs.
        const messages: Anthropic.MessageParam[] = [...incomingMessages];

        for (let i = 0; i < MAX_TOOL_ITERATIONS; i++) {
          const anthropicStream = client.messages.stream({
            model: MODEL,
            max_tokens: 1024,
            system: [
              { type: "text", text: CHAT_SYSTEM_PROMPT },
              kb
                ? {
                    type: "text",
                    text: `# Knowledge Base\n\n${kb}`,
                    cache_control: { type: "ephemeral" },
                  }
                : {
                    type: "text",
                    text: `# Knowledge Base\n\nUse the \`query_corpus\` tool for ANY product, rate, fee, hours, location, or policy question. Do not answer from memory — always retrieve first. Give a brief natural acknowledgement before calling it and pull only the specific fact the visitor asked about.`,
                  },
            ],
            tools: TOOLS,
            messages,
          });

          const redactor = createStreamRedactor();
          anthropicStream.on("text", (delta) => {
            const safe = redactor.push(delta);
            if (safe) send({ type: "text", text: safe });
          });

          const final = await anthropicStream.finalMessage();
          const remaining = redactor.flush();
          if (remaining) send({ type: "text", text: remaining });

          if (final.stop_reason !== "tool_use") {
            // Done — model finished without (or after) tool calls.
            send({
              type: "state",
              accountState,
              verificationState,
            });
            send({
              type: "done",
              stop_reason: final.stop_reason,
              usage: final.usage,
            });
            controller.close();
            return;
          }

          // Append the assistant message verbatim (so tool_use ids stay intact),
          // then build a user message with tool_result blocks for each call.
          messages.push({ role: "assistant", content: final.content });

          const toolResults: Anthropic.ToolResultBlockParam[] = [];
          for (const block of final.content) {
            if (block.type !== "tool_use") continue;

            if (block.name === "navigate_to_page") {
              const page =
                typeof (block.input as { page?: string })?.page === "string"
                  ? (block.input as { page: string }).page
                  : "/";
              // Tell the client to navigate
              send({
                type: "tool_use",
                id: block.id,
                name: "navigate_to_page",
                input: { page },
              });
              toolResults.push({
                type: "tool_result",
                tool_use_id: block.id,
                content: VALID_PAGES.includes(page)
                  ? `ok. Browser navigated to ${page}.`
                  : `error: ${page} is not a valid page.`,
              });
            } else if (block.name === "query_corpus") {
              const query =
                typeof (block.input as { query?: string })?.query === "string"
                  ? (block.input as { query: string }).query
                  : "";
              const result = query
                ? await queryUltravoxCorpus(query)
                : "error: query is required";
              toolResults.push({
                type: "tool_result",
                tool_use_id: block.id,
                content: result,
              });
            } else if (block.name === "verify_identity_step") {
              const input = block.input as { step?: string; value?: string };
              const stepKey = input.step ? VERIFICATION_STEP_KEYS[input.step] : undefined;
              if (!stepKey) {
                toolResults.push({
                  type: "tool_result",
                  tool_use_id: block.id,
                  is_error: true,
                  content: `error: unknown verification step "${input.step}".`,
                });
              } else {
                const submitted = (input.value ?? "").trim();
                const matches = submitted === VERIFICATION_EXPECTED[stepKey];
                if (matches) verificationState[stepKey] = true;
                const complete = isFullyVerified(verificationState);
                toolResults.push({
                  type: "tool_result",
                  tool_use_id: block.id,
                  content: matches
                    ? complete
                      ? "match: this step passed. All three verification steps are now complete — the visitor is fully verified."
                      : "match: this step passed. Continue to the next verification step."
                    : "no_match: this value does not match what's on file for this step. Do not reveal which step or why — just ask the visitor to re-enter it, per the retry rules.",
                });
              }
            } else if (block.name === "get_account_info") {
              if (!isFullyVerified(verificationState)) {
                toolResults.push({
                  type: "tool_result",
                  tool_use_id: block.id,
                  is_error: true,
                  content:
                    "error: identity verification is not complete yet. Do not share any account info. Continue (or restart) the verification steps first.",
                });
              } else {
                toolResults.push({
                  type: "tool_result",
                  tool_use_id: block.id,
                  content: describeFullAccountInfo(accountState),
                });
              }
            } else if (block.name === "transfer_funds") {
              if (!isFullyVerified(verificationState)) {
                toolResults.push({
                  type: "tool_result",
                  tool_use_id: block.id,
                  is_error: true,
                  content:
                    "error: identity verification is not complete — transfers are not allowed yet. Complete all three verification steps first, then ask the customer to reconfirm the transfer.",
                });
                continue;
              }
              const input = block.input as TransferInput;
              const result = applyTransfer(accountState, input);
              if (result.ok) {
                accountState.checking = result.balances.checking;
                accountState.savings = result.balances.savings;
                accountState.autoLoanBalance = result.balances.autoLoanBalance;
                toolResults.push({
                  type: "tool_result",
                  tool_use_id: block.id,
                  content: result.summary,
                });
              } else {
                toolResults.push({
                  type: "tool_result",
                  tool_use_id: block.id,
                  is_error: true,
                  content: result.error,
                });
              }
            } else {
              toolResults.push({
                type: "tool_result",
                tool_use_id: block.id,
                is_error: true,
                content: `Unknown tool: ${block.name}`,
              });
            }
          }

          messages.push({ role: "user", content: toolResults });
          // Loop and let the model narrate the result.
        }

        // Iteration cap reached
        send({
          type: "error",
          error: "Too many tool iterations.",
        });
        send({ type: "state", accountState, verificationState });
        controller.close();
      } catch (err) {
        send({
          type: "error",
          error: err instanceof Error ? err.message : "Unknown error",
        });
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}
