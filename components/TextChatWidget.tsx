"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";

type SessionStatus =
  | "disconnected"
  | "disconnecting"
  | "connecting"
  | "idle"
  | "listening"
  | "thinking"
  | "speaking";

interface Transcript {
  text: string;
  isFinal: boolean;
  speaker: "user" | "agent";
  medium: "voice" | "text";
}

const VALID_PAGES = ["/", "/personal", "/business", "/loans", "/locations", "/about"];

export default function TextChatWidget() {
  const router = useRouter();
  const [status, setStatus] = useState<SessionStatus>("disconnected");
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sessionRef = useRef<any>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isActive = status !== "disconnected" && status !== "disconnecting";
  const isAgentTyping =
    isActive &&
    (status === "thinking" || status === "speaking") &&
    transcripts.length > 0 &&
    transcripts[transcripts.length - 1]?.speaker === "user";

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcripts]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        handleMinimize();
      }
    };
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen]);

  const startChat = useCallback(async () => {
    setError(null);
    setTranscripts([]);
    setStatus("connecting");

    try {
      const res = await fetch("/api/ultravox", { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create chat session");
      }
      const { joinUrl } = await res.json();

      const { UltravoxSession, Medium } = await import("ultravox-client");
      const session = new UltravoxSession();
      sessionRef.current = session;

      session.registerToolImplementation(
        "navigateToPage",
        (params: { page?: string }) => {
          const page = params.page || "/";
          if (VALID_PAGES.includes(page)) {
            router.push(page);
            return `Navigated to ${page}`;
          }
          return `Invalid page: ${page}`;
        }
      );

      session.addEventListener("status", () => {
        setStatus(session.status as SessionStatus);
      });

      session.addEventListener("transcripts", () => {
        setTranscripts([...session.transcripts] as Transcript[]);
      });

      session.joinCall(joinUrl);

      // Mute mic and set output to text for text-only chat
      try { session.toggleMicMute(); } catch {}
      try { session.setOutputMedium(Medium.TEXT); } catch {}
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start chat");
      setStatus("disconnected");
    }
  }, [router]);

  const endChat = useCallback(async () => {
    if (sessionRef.current) {
      await sessionRef.current.leaveCall();
      sessionRef.current = null;
    }
    setStatus("disconnected");
  }, []);

  const sendMessage = useCallback(() => {
    const text = inputText.trim();
    if (!text || !sessionRef.current || !isActive) return;
    sessionRef.current.sendText(text);
    setInputText("");
  }, [inputText, isActive]);

  const handleMinimize = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleClose = useCallback(async () => {
    setIsOpen(false);
    await endChat();
    setTranscripts([]);
    setError(null);
  }, [endChat]);

  const handleOpen = useCallback(() => {
    setIsOpen(true);
    if (!isActive) startChat();
  }, [isActive, startChat]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (sessionRef.current) {
        sessionRef.current.leaveCall();
        sessionRef.current = null;
      }
    };
  }, []);

  if (!isOpen) {
    return (
      <button
        onClick={handleOpen}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-navy hover:bg-navy-light text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105"
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
        <span className="absolute inset-0 rounded-full bg-gold/30 animate-ping" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-[calc(100vw-3rem)] sm:w-96 bg-white rounded-2xl shadow-2xl border border-border overflow-hidden flex flex-col">
      {/* Header */}
      <div className="bg-navy px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              isActive ? "bg-green-400 animate-pulse" : "bg-gray-400"
            }`}
          />
          <span className="text-white text-sm font-medium">Chat with Emerie</span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleMinimize}
            className="text-white/60 hover:text-white transition-colors p-1"
            aria-label="Minimize chat"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>
          <button
            onClick={handleClose}
            className="text-white/60 hover:text-white transition-colors p-1"
            aria-label="Close chat"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>

      {/* Messages area */}
      <div className="h-80 overflow-y-auto p-4 space-y-3 bg-cream/50" role="log" aria-live="polite">
        {transcripts.length === 0 && !error && (
          <div className="text-center text-sm text-body-light pt-8">
            {status === "connecting"
              ? "Connecting..."
              : isActive
                ? "Connected. How can I help you today?"
                : "Starting chat..."}
          </div>
        )}

        {error && (
          <div className="text-center text-sm text-red-600 pt-8">{error}</div>
        )}

        {transcripts.map((t, i) => (
          <div
            key={i}
            className={`flex ${t.speaker === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] px-3 py-2 rounded-xl text-sm ${
                t.speaker === "user"
                  ? "bg-gold/10 text-navy"
                  : "bg-white text-body border border-border"
              } ${!t.isFinal ? "opacity-60" : ""}`}
            >
              {t.text}
            </div>
          </div>
        ))}

        {isAgentTyping && (
          <div className="flex justify-start">
            <div className="bg-white border border-border rounded-xl px-4 py-3 flex items-center gap-1.5">
              <span className="typing-dot w-2 h-2 rounded-full bg-body-light" />
              <span className="typing-dot w-2 h-2 rounded-full bg-body-light" />
              <span className="typing-dot w-2 h-2 rounded-full bg-body-light" />
            </div>
          </div>
        )}

        <div ref={transcriptEndRef} />
      </div>

      {/* Input area */}
      <div className="px-3 py-3 bg-white border-t border-border flex items-center gap-2 shrink-0">
        <input
          ref={inputRef}
          type="text"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          placeholder={isActive ? "Type a message..." : "Connecting..."}
          disabled={!isActive}
          className="flex-1 px-3 py-2 text-sm rounded-lg border border-border bg-cream/30 focus:outline-none focus:ring-2 focus:ring-gold/40 focus:border-gold disabled:opacity-50 disabled:cursor-not-allowed placeholder:text-body-light/60"
          aria-label="Chat message input"
        />
        <button
          onClick={sendMessage}
          disabled={!isActive || !inputText.trim()}
          className="w-9 h-9 rounded-lg bg-gold hover:bg-gold-dark text-white flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
          aria-label="Send message"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
