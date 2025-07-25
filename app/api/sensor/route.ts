import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma";

const prisma = new PrismaClient();

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

    const saved = await prisma.sensorReading.create({
      data: {
        temperature,
        humidity,
        sound,
      },
    });

    return NextResponse.json({
      success: true,
      reading: saved,
    });
  } catch (err) {
    console.error("POST /api/sensor error:", err);
    return NextResponse.json(
      { error: "Failed to save to database" },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const minutesParam = searchParams.get("minutes") || "5";
    const minutes = Number(minutesParam);

    if (isNaN(minutes) || minutes < 0) {
      return NextResponse.json(
        { error: "Invalid 'minutes' query parameter" },
        { status: 400 },
      );
    }

    const latestReading = await prisma.sensorReading.findFirst({
      orderBy: {
        timestamp: "desc",
      },
    });

    if (!latestReading) {
      return NextResponse.json({ live: null, readings: [] });
    }

    const now = latestReading.timestamp;
    const fromTimestamp = new Date(now.getTime() - minutes * 60 * 1000);

    const rawReadings = await prisma.sensorReading.findMany({
      where: {
        timestamp: {
          gte: fromTimestamp,
        },
      },
      orderBy: {
        timestamp: "asc",
      },
    });

    // Compute spacing interval
    let intervalMs = 5 * 60 * 1000; // default = 5 min
    if (minutes === 15) intervalMs = 15 * 60 * 1000;
    else if (minutes === 60) intervalMs = 1 * 60 * 1000;
    else if (minutes === 1440) intervalMs = 60 * 60 * 1000;

    // Reduce to spaced readings
    const spacedReadings = [];
    let nextAllowedTime = new Date(fromTimestamp);

    for (const reading of rawReadings) {
      if (reading.timestamp >= nextAllowedTime) {
        spacedReadings.push(reading);
        nextAllowedTime = new Date(reading.timestamp.getTime() + intervalMs);
      }
    }

    return NextResponse.json({
      live: latestReading,
      readings: spacedReadings,
    });
  } catch (err) {
    console.error("GET /api/sensor error:", err);
    return NextResponse.json(
      { error: "Failed to fetch sensor readings" },
      { status: 500 },
    );
  }
}
