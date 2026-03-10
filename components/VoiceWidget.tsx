"use client";

import { useState, useCallback, useRef, useEffect } from "react";

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

export default function VoiceWidget() {
  const [status, setStatus] = useState<SessionStatus>("disconnected");
  const [transcripts, setTranscripts] = useState<Transcript[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sessionRef = useRef<any>(null);
  const transcriptEndRef = useRef<HTMLDivElement>(null);

  const isActive = status !== "disconnected" && status !== "disconnecting";

  useEffect(() => {
    transcriptEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [transcripts]);

  const startCall = useCallback(async () => {
    setError(null);
    setTranscripts([]);

    try {
      // Step 1: Get joinUrl from our API route
      const res = await fetch("/api/ultravox", { method: "POST" });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create call");
      }
      const { joinUrl } = await res.json();

      // Step 2: Dynamically import and join call
      const { UltravoxSession } = await import("ultravox-client");
      const session = new UltravoxSession();
      sessionRef.current = session;

      session.addEventListener("status", () => {
        setStatus(session.status as SessionStatus);
      });

      session.addEventListener("transcripts", () => {
        setTranscripts([...session.transcripts] as Transcript[]);
      });

      session.joinCall(joinUrl);
      setIsOpen(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to start call");
    }
  }, []);

  const endCall = useCallback(async () => {
    if (sessionRef.current) {
      await sessionRef.current.leaveCall();
      sessionRef.current = null;
    }
    setStatus("disconnected");
  }, []);

  const toggleMic = useCallback(() => {
    if (!sessionRef.current) return;
    sessionRef.current.toggleMicMute();
  }, []);

  const statusLabel: Record<SessionStatus, string> = {
    disconnected: "Start a conversation",
    disconnecting: "Ending call...",
    connecting: "Connecting...",
    idle: "Connected",
    listening: "Listening...",
    thinking: "Thinking...",
    speaking: "Speaking...",
  };

  // Floating button when widget is closed
  if (!isOpen) {
    return (
      <button
        onClick={() => {
          setIsOpen(true);
          if (!isActive) startCall();
        }}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-gold hover:bg-gold-dark text-white rounded-full shadow-lg flex items-center justify-center transition-all hover:scale-105"
        aria-label="Open voice assistant"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
          />
        </svg>
        {/* Pulse ring when not active */}
        <span className="absolute inset-0 rounded-full bg-gold/40 animate-ping" />
      </button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 z-50 w-80 bg-white rounded-2xl shadow-2xl border border-border overflow-hidden">
      {/* Header */}
      <div className="bg-navy px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div
            className={`w-2.5 h-2.5 rounded-full ${
              isActive ? "bg-green-400 animate-pulse" : "bg-gray-400"
            }`}
          />
          <span className="text-white text-sm font-medium">Emerie Assistant</span>
        </div>
        <button
          onClick={() => {
            setIsOpen(false);
            if (!isActive) {
              setTranscripts([]);
              setError(null);
            }
          }}
          className="text-white/60 hover:text-white transition-colors"
          aria-label="Minimize"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>

      {/* Transcript area */}
      <div className="h-56 overflow-y-auto p-4 space-y-3 bg-cream/50">
        {transcripts.length === 0 && !error && (
          <div className="text-center text-sm text-body-light pt-8">
            {isActive
              ? statusLabel[status]
              : "Tap the microphone to talk with our AI assistant."}
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
        <div ref={transcriptEndRef} />
      </div>

      {/* Controls */}
      <div className="px-4 py-3 bg-white border-t border-border flex items-center justify-between">
        <span className="text-xs text-body-light">{statusLabel[status]}</span>
        <div className="flex items-center gap-2">
          {isActive && (
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
            onClick={isActive ? endCall : startCall}
            className={`w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
              isActive
                ? "bg-red-500 hover:bg-red-600 text-white"
                : "bg-gold hover:bg-gold-dark text-white"
            }`}
            aria-label={isActive ? "End call" : "Start call"}
          >
            {isActive ? (
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
    </div>
  );
}
