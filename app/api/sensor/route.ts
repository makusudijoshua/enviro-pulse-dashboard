import { NextRequest, NextResponse } from "next/server";

type Reading = {
  temperature: number;
  humidity: number;
  sound: number;
  timestamp: string;
};

let readings: Reading[] = [];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const { temperature, humidity, sound } = body;

    if (
      typeof temperature !== "number" ||
      typeof humidity !== "number" ||
      typeof sound !== "number"
    ) {
      return NextResponse.json(
        { error: "Invalid data format" },
        { status: 400 },
      );
    }

    const timestamp = new Date().toISOString();
    const newReading: Reading = { temperature, humidity, sound, timestamp };

    readings.push(newReading);
    if (readings.length > 1000) readings.shift();

    return NextResponse.json({ success: true });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to parse JSON" },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const minutes = Number(searchParams.get("minutes") || "5");
  const now = Date.now();
  const cutoff = now - minutes * 60 * 1000;

  const result = readings.filter(
    (r) => new Date(r.timestamp).getTime() >= cutoff,
  );
  return NextResponse.json(result);
}
