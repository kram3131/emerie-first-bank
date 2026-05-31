import { NextRequest } from "next/server";
import Anthropic from "@anthropic-ai/sdk";
import { loadKnowledgeBase } from "@/lib/kb";
import { CHAT_SYSTEM_PROMPT } from "@/lib/systemPrompt";

export const runtime = "nodejs";

const MODEL = "claude-haiku-4-5-20251001";

const VALID_PAGES = ["/", "/personal", "/business", "/loans", "/locations", "/about"];

type IncomingMessage = {
  role: "user" | "assistant";
  content:
    | string
    | Array<
        | { type: "text"; text: string }
        | { type: "tool_use"; id: string; name: string; input: unknown }
        | { type: "tool_result"; tool_use_id: string; content: string }
      >;
};

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

  let body: { messages?: IncomingMessage[] };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: "Bad JSON" }), { status: 400 });
  }
  const messages = body.messages || [];
  if (!Array.isArray(messages) || messages.length === 0) {
    return new Response(JSON.stringify({ error: "messages required" }), { status: 400 });
  }

  // Anthropic requires every assistant `tool_use` to be followed by a user
  // `tool_result` in the next message. Our navigate_to_page tool is handled
  // client-side and has no meaningful return value, so inject synthetic
  // tool_result blocks wherever they're missing.
  const normalized: IncomingMessage[] = [];
  for (let i = 0; i < messages.length; i++) {
    const msg = messages[i];
    normalized.push(msg);
    if (msg.role !== "assistant" || typeof msg.content === "string") continue;
    const toolUses = msg.content.filter(
      (b): b is { type: "tool_use"; id: string; name: string; input: unknown } =>
        b.type === "tool_use"
    );
    if (toolUses.length === 0) continue;
    const next = messages[i + 1];
    const nextResultIds = new Set<string>();
    if (next && next.role === "user" && Array.isArray(next.content)) {
      for (const b of next.content) {
        if (b.type === "tool_result") nextResultIds.add(b.tool_use_id);
      }
    }
    const missing = toolUses.filter((tu) => !nextResultIds.has(tu.id));
    if (missing.length === 0) continue;
    const syntheticResults = missing.map((tu) => ({
      type: "tool_result" as const,
      tool_use_id: tu.id,
      content: "ok",
    }));
    if (next && next.role === "user" && Array.isArray(next.content)) {
      // Merge into the existing next user message
      const merged: IncomingMessage = {
        role: "user",
        content: [...syntheticResults, ...next.content],
      };
      normalized.push(merged);
      i++; // skip original next
    } else {
      normalized.push({ role: "user", content: syntheticResults });
    }
  }

  const client = new Anthropic({ apiKey });
  const kb = loadKnowledgeBase();

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: Record<string, unknown>) => {
        controller.enqueue(encoder.encode(JSON.stringify(event) + "\n"));
      };

      try {
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
          ],
          tools: [
            {
              name: "navigate_to_page",
              description:
                "Navigate the visitor's browser to a page on the Emerie First Bank website. Use whenever a topic has a dedicated page so they can see the full details. Briefly tell the visitor first.",
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
          ],
          messages: normalized as Anthropic.MessageParam[],
        });

        anthropicStream.on("text", (delta) => {
          send({ type: "text", text: delta });
        });

        anthropicStream.on("contentBlock", (block) => {
          if (block.type === "tool_use") {
            send({
              type: "tool_use",
              id: block.id,
              name: block.name,
              input: block.input,
            });
          }
        });

        const final = await anthropicStream.finalMessage();
        send({
          type: "done",
          stop_reason: final.stop_reason,
          usage: final.usage,
        });
      } catch (err) {
        send({
          type: "error",
          error: err instanceof Error ? err.message : "Unknown error",
        });
      } finally {
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
