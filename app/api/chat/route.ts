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

const TOOLS: Anthropic.Tool[] = [
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
  const kb = loadKnowledgeBase();

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
              {
                type: "text",
                text: `# Knowledge Base\n\n${kb}`,
                cache_control: { type: "ephemeral" },
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
