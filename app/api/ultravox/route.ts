import { NextResponse } from "next/server";

const AGENT_ID = "9fe642c1-c4a3-439b-9861-da362c910cce";

export async function POST() {
  const apiKey = process.env.ULTRAVOX_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "Missing API key" }, { status: 500 });
  }

  const response = await fetch(
    `https://api.ultravox.ai/api/agents/${AGENT_ID}/calls`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-API-Key": apiKey,
      },
      body: JSON.stringify({
        medium: { webRtc: {} },
        firstSpeakerSettings: { agent: {} },
      }),
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
