import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { loadKnowledgeBase } from "@/lib/kb";
import { CHAT_SYSTEM_PROMPT } from "@/lib/systemPrompt";
import { BRAND } from "@/lib/brand";
import {
  AccountState,
  INITIAL_ACCOUNT_STATE,
  applyTransfer,
  describeAccountState,
  TransferInput,
} from "@/lib/accounts";

export const runtime = "nodejs";

const MODEL = "claude-haiku-4-5-20251001";
const MAX_TOOL_ITERATIONS = 6;

const VALID_PAGES = ["/", "/personal", "/business", "/loans", "/locations", "/about"];

const USE_ULTRAVOX_CORPUS = !!BRAND.ultravoxCorpusId;

const BASE_TOOLS: Anthropic.Tool[] = [
  {
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
  },
  {
    name: "transfer_funds",
    description:
      "Move money between the customer's own accounts. ONLY call after identity verification has passed AND the customer has explicitly confirmed the from-account, to-account, and amount. Allowed routes: checking<->savings, and checking->auto_loan (as a loan payment).",
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

const TOOLS: Anthropic.Tool[] = USE_ULTRAVOX_CORPUS
  ? [...BASE_TOOLS, CORPUS_TOOL]
  : BASE_TOOLS;

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
  // current state so transfers compose across turns.
  const accountState: AccountState = {
    ...INITIAL_ACCOUNT_STATE,
    ...(body.accountState || {}),
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
              {
                type: "text",
                text: describeAccountState(accountState),
              },
            ],
            tools: TOOLS,
            messages,
          });

          anthropicStream.on("text", (delta) => {
            send({ type: "text", text: delta });
          });

          const final = await anthropicStream.finalMessage();

          if (final.stop_reason !== "tool_use") {
            // Done — model finished without (or after) tool calls.
            send({
              type: "state",
              accountState,
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
            } else if (block.name === "transfer_funds") {
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
        send({ type: "state", accountState });
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
