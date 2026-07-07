"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  AccountState,
  INITIAL_ACCOUNT_STATE,
  applyTransfer,
  TransferInput,
} from "@/lib/accounts";
import { BRAND } from "@/lib/brand";

const IS_DEMO_SHELL = BRAND.slug !== "emerie-first-bank";

type Mode = "chat" | "voice";

type ChatRole = "user" | "assistant";

type ToolUse = { type: "tool_use"; id: string; name: string; input: { page?: string } };
type TextBlock = { type: "text"; text: string };
type AssistantBlock = TextBlock | ToolUse;

type ChatMessage =
  | { role: "user"; content: string }
  | { role: "assistant"; content: AssistantBlock[] };

type VoiceStatus =
  | "disconnected"
  | "disconnecting"
  | "connecting"
  | "idle"
  | "listening"
  | "thinking"
  | "speaking";

type Transcript = {
  text: string;
  isFinal: boolean;
  speaker: "user" | "agent";
  medium: "voice" | "text";
};

const VALID_PAGES = ["/", "/personal", "/business", "/loans", "/locations", "/about"];

const SUGGESTIONS = [
  "What are your checking account fees?",
  "Where are you located?",
  "I need a car loan",
  "Tell me about your CDs",
];

export default function ChatWidget() {
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false);
  const [mode, setMode] = useState<Mode>("chat");

  // ---------- Chat state ----------
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [streaming, setStreaming] = useState(false);
  const [chatError, setChatError] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Per-session account state. Reset on page reload. Shared with the voice
  // mode via a ref so transfers made in either mode are visible in the other
  // mode within the same page session.
  const [accountState, setAccountState] = useState<AccountState>(
    INITIAL_ACCOUNT_STATE
  );
  const accountStateRef = useRef<AccountState>(INITIAL_ACCOUNT_STATE);
  useEffect(() => {
    accountStateRef.current = accountState;
  }, [accountState]);

  // ---------- Voice state ----------
  const [voiceStatus, setVoiceStatus] = useState<VoiceStatus>("disconnected");
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [voiceError, setVoiceError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sessionRef = useRef<any>(null);
  const voiceActive =
    voiceStatus !== "disconnected" && voiceStatus !== "disconnecting";
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streaming]);

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcripts]);

  // ---------- Chat: send a message ----------
  const sendMessage = useCallback(
    async (text: string) => {
      if (!text.trim() || streaming) return;
      setChatError(null);
      const userMsg: ChatMessage = { role: "user", content: text.trim() };
      const next = [...messages, userMsg];
      setMessages(next);
      setInput("");
      setStreaming(true);

      const assistantBlocks: AssistantBlock[] = [];
      // Push a placeholder assistant message we'll mutate as chunks arrive
      setMessages((m) => [...m, { role: "assistant", content: assistantBlocks }]);

      const apiMessages = next.map((m) => {
        if (m.role === "user") return { role: "user" as const, content: m.content };
        return {
          role: "assistant" as const,
          content: m.content.map((b) =>
            b.type === "text" ? { type: "text" as const, text: b.text } : b
          ),
        };
      });

      try {
        const res = await fetch("/api/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            messages: apiMessages,
            accountState: accountStateRef.current,
          }),
        });
        if (!res.ok || !res.body) {
          const err = await res.json().catch(() => ({ error: "Request failed" }));
          throw new Error(err.error || `HTTP ${res.status}`);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";
        let currentText: TextBlock | null = null;

        const flushAssistant = () => {
          setMessages((m) => {
            const copy = [...m];
            copy[copy.length - 1] = {
              role: "assistant",
              content: [...assistantBlocks],
            };
            return copy;
          });
        };

        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() || "";
          for (const line of lines) {
            if (!line.trim()) continue;
            let event: Record<string, unknown>;
            try {
              event = JSON.parse(line);
            } catch {
              continue;
            }
            if (event.type === "text") {
              if (!currentText) {
                currentText = { type: "text", text: "" };
                assistantBlocks.push(currentText);
              }
              currentText.text += (event.text as string) || "";
              flushAssistant();
            } else if (event.type === "tool_use") {
              currentText = null;
              const tu: ToolUse = {
                type: "tool_use",
                id: event.id as string,
                name: event.name as string,
                input: (event.input as { page?: string }) || {},
              };
              assistantBlocks.push(tu);
              flushAssistant();
              if (
                !IS_DEMO_SHELL &&
                tu.name === "navigate_to_page" &&
                typeof tu.input.page === "string" &&
                VALID_PAGES.includes(tu.input.page)
              ) {
                router.push(tu.input.page);
              }
            } else if (event.type === "state") {
              const incoming = event.accountState as AccountState | undefined;
              if (incoming) setAccountState(incoming);
            } else if (event.type === "error") {
              throw new Error((event.error as string) || "Stream error");
            }
          }
        }
      } catch (err) {
        setChatError(err instanceof Error ? err.message : "Failed to send");
      } finally {
        setStreaming(false);
        // Refocus input so the customer can keep typing without re-clicking.
        requestAnimationFrame(() => inputRef.current?.focus());
      }
    },
    [messages, streaming, router]
  );

  // ---------- Voice ----------
  const startVoice = useCallback(async () => {
    setVoiceError(null);
    setTranscripts([]);
    try {
      const res = await fetch("/api/ultravox", { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create call");
      }
      const { joinUrl } = await res.json();
      const { UltravoxSession } = await import("ultravox-client");
      const session = new UltravoxSession();
      sessionRef.current = session;
      session.registerToolImplementation(
        "navigateToPage",
        (params: { page?: string }) => {
          const page = params.page || "/";
          if (IS_DEMO_SHELL) {
            // In demo-shell mode we don't actually change routes (the whole
            // page is a screenshot). Just acknowledge back to the model.
            return `Done. Told the visitor about ${page}. Do NOT repeat what you already said. Just ask a brief follow-up question.`;
          }
          if (VALID_PAGES.includes(page)) {
            router.push(page);
            return `Done. Page is now showing ${page}. Do NOT repeat what you already said. Just ask a brief follow-up question.`;
          }
          return `Invalid page: ${page}. Continue the conversation without navigating.`;
        }
      );

      // Funds-transfer tool for voice. Same logic as the chat agent uses
      // server-side, applied to the shared accountStateRef so transfers
      // started on a voice call carry into a follow-up text chat (and
      // vice versa) within the same page session.
      session.registerToolImplementation(
        "transferFunds",
        (params: { from?: string; to?: string; amount?: number }) => {
          const input: TransferInput = {
            from: (params.from as TransferInput["from"]) ?? "checking",
            to: (params.to as TransferInput["to"]) ?? "savings",
            amount: Number(params.amount ?? 0),
          };
          const result = applyTransfer(accountStateRef.current, input);
          if (!result.ok) {
            return `Transfer rejected: ${result.error}`;
          }
          accountStateRef.current = result.balances;
          setAccountState(result.balances);
          return result.summary;
        }
      );
      session.addEventListener("status", () => {
        setVoiceStatus(session.status as VoiceStatus);
      });
      session.addEventListener("transcripts", () => {
        setTranscripts([...session.transcripts] as Transcript[]);
      });
      session.joinCall(joinUrl);
    } catch (err) {
      setVoiceError(err instanceof Error ? err.message : "Failed to start call");
    }
  }, [router]);

  const endVoice = useCallback(async () => {
    if (sessionRef.current) {
      await sessionRef.current.leaveCall();
      sessionRef.current = null;
    }
    setVoiceStatus("disconnected");
  }, []);

  const toggleMic = useCallback(() => {
    if (!sessionRef.current) return;
    sessionRef.current.toggleMicMute();
  }, []);

  const voiceStatusLabel: Record<VoiceStatus, string> = {
    disconnected: "Tap the phone to talk with Alex",
    disconnecting: "Ending call…",
    connecting: "Connecting…",
    idle: "Connected",
    listening: "Listening…",
    thinking: "Thinking…",
    speaking: "Speaking…",
  };

  // ---------- Floating button ----------
  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gold hover:bg-gold-dark text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105"
        aria-label="Open chat assistant"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        <span className="absolute inset-0 rounded-full bg-gold/40 animate-ping" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[380px] max-w-[calc(100vw-2rem)] h-[600px] max-h-[calc(100vh-3rem)] bg-white rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-navy px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gold flex items-center justify-center text-navy font-semibold text-sm">
            A
          </div>
          <div>
            <div className="text-white text-sm font-medium">Alex</div>
            <div className="text-white/60 text-xs">{BRAND.name} assistant</div>
          </div>
        </div>
        <button
          onClick={() => setIsOpen(false)}
          className="text-white/60 hover:text-white transition-colors"
          aria-label="Minimize"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Mode toggle */}
      <div className="flex border-b border-border bg-cream/50">
        <button
          onClick={() => setMode("chat")}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
            mode === "chat"
              ? "text-navy border-b-2 border-gold"
              : "text-body-light hover:text-body"
          }`}
        >
          Chat
        </button>
        <button
          onClick={() => setMode("voice")}
          className={`flex-1 py-2.5 text-sm font-medium transition-colors ${
            mode === "voice"
              ? "text-navy border-b-2 border-gold"
              : "text-body-light hover:text-body"
          }`}
        >
          Talk
          {voiceActive && (
            <span className="inline-block ml-2 w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
          )}
        </button>
      </div>

      {mode === "chat" ? (
        <>
          {/* Chat thread */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-cream/30">
            {messages.length === 0 && (
              <div className="space-y-3">
                <div className="bg-white border border-border rounded-2xl rounded-tl-sm px-4 py-3 text-sm text-body">
                  Hi! I&apos;m Alex. Ask me anything about {BRAND.name} — accounts, rates, fees, branches, you name it.
                </div>
                <div className="flex flex-wrap gap-2 pt-2">
                  {SUGGESTIONS.map((s) => (
                    <button
                      key={s}
                      onClick={() => sendMessage(s)}
                      className="text-xs px-3 py-1.5 rounded-full bg-white border border-border text-body hover:bg-gold/10 hover:border-gold transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((m, i) => {
              if (m.role === "user") {
                return (
                  <div key={i} className="flex justify-end">
                    <div className="max-w-[85%] px-3.5 py-2 rounded-2xl rounded-br-sm bg-navy text-white text-sm whitespace-pre-wrap">
                      {m.content}
                    </div>
                  </div>
                );
              }
              const textBlocks = m.content.filter(
                (b): b is TextBlock => b.type === "text"
              );
              const toolBlocks = m.content.filter(
                (b): b is ToolUse => b.type === "tool_use"
              );
              const text = textBlocks.map((b) => b.text).join("");
              return (
                <div key={i} className="flex justify-start">
                  <div className="max-w-[85%] space-y-1.5">
                    {text && (
                      <div className="px-3.5 py-2 rounded-2xl rounded-tl-sm bg-white border border-border text-sm text-body prose prose-sm max-w-none prose-p:my-1.5 prose-ul:my-1.5 prose-ol:my-1.5 prose-li:my-0">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                          {text}
                        </ReactMarkdown>
                      </div>
                    )}
                    {toolBlocks.map((t) => (
                      <div
                        key={t.id}
                        className="text-xs text-body-light italic px-3"
                      >
                        ↗ Taking you to {t.input.page}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}

            {streaming && messages[messages.length - 1]?.role === "assistant" &&
              (messages[messages.length - 1] as { content: AssistantBlock[] })
                .content.length === 0 && (
                <div className="flex justify-start">
                  <div className="px-3.5 py-2.5 rounded-2xl rounded-tl-sm bg-white border border-border">
                    <div className="flex gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-body-light animate-bounce" />
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-body-light animate-bounce"
                        style={{ animationDelay: "0.15s" }}
                      />
                      <span
                        className="w-1.5 h-1.5 rounded-full bg-body-light animate-bounce"
                        style={{ animationDelay: "0.3s" }}
                      />
                    </div>
                  </div>
                </div>
              )}

            {chatError && (
              <div className="text-center text-xs text-red-600">{chatError}</div>
            )}

            <div ref={chatEndRef} />
          </div>

          {/* Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              sendMessage(input);
            }}
            className="p-3 bg-white border-t border-border flex gap-2"
          >
            <input
              ref={inputRef}
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={streaming ? "Alex is typing…" : "Ask Alex anything…"}
              className="flex-1 px-3 py-2 text-sm rounded-full border border-border bg-cream/50 focus:outline-none focus:ring-2 focus:ring-gold/50 focus:bg-white"
              autoFocus
            />
            <button
              type="submit"
              disabled={streaming || !input.trim()}
              className="w-9 h-9 rounded-full bg-gold hover:bg-gold-dark disabled:opacity-40 disabled:hover:bg-gold text-white flex items-center justify-center transition-colors"
              aria-label="Send"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
            </button>
          </form>
        </>
      ) : (
        <>
          {/* Voice transcripts */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-cream/30">
            {transcripts.length === 0 && !voiceError && (
              <div className="text-center text-sm text-body-light pt-8">
                {voiceActive
                  ? voiceStatusLabel[voiceStatus]
                  : "Tap the phone button to start a voice conversation with Alex."}
              </div>
            )}
            {voiceError && (
              <div className="text-center text-sm text-red-600 pt-8">
                {voiceError}
              </div>
            )}
            {transcripts.map((t, i) => (
              <div
                key={i}
                className={`flex ${t.speaker === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] px-3.5 py-2 rounded-2xl text-sm ${
                    t.speaker === "user"
                      ? "bg-navy text-white rounded-br-sm"
                      : "bg-white text-body border border-border rounded-tl-sm"
                  } ${!t.isFinal ? "opacity-60" : ""}`}
                >
                  {t.text}
                </div>
              </div>
            ))}
            <div ref={transcriptEndRef} />
          </div>

          {/* Voice controls */}
          <div className="px-4 py-3 bg-white border-t border-border flex items-center justify-between">
            <span className="text-xs text-body-light">{voiceStatusLabel[voiceStatus]}</span>
            <div className="flex items-center gap-2">
              {voiceActive && (
                <button
                  onClick={toggleMic}
                  className="w-9 h-9 rounded-full bg-cream border border-border flex items-center justify-center text-body hover:bg-gray-100 transition-colors"
                  aria-label="Toggle microphone"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                    />
                  </svg>
                </button>
              )}
              <button
                onClick={voiceActive ? endVoice : startVoice}
                className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
                  voiceActive
                    ? "bg-red-500 hover:bg-red-600 text-white"
                    : "bg-gold hover:bg-gold-dark text-white"
                }`}
                aria-label={voiceActive ? "End call" : "Start call"}
              >
                {voiceActive ? (
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="6" y="6" width="12" height="12" rx="1" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
