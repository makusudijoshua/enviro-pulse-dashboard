import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/common/lib/prisma";

// === GET: Fetch Sensor Data ===
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
      orderBy: { timestamp: "desc" },
      select: {
        timestamp: true,
        temperature: true,
        humidity: true,
        sound: true,
        soundPeakToPeak: true,
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
      select: {
        timestamp: true,
        temperature: true,
        humidity: true,
        sound: true,
        soundPeakToPeak: true,
      },
    });

    let readingsToReturn: typeof rawReadings = [];

    if (minutes === 0 || minutes === 5) {
      // Live and 5m → last 20 raw readings
      readingsToReturn = rawReadings.slice(-20);
    } else {
      // Spacing logic for longer ranges
      let intervalMs = 5 * 60 * 1000; // default for 15m

      if (minutes === 15) intervalMs = 5 * 60 * 1000;
      else if (minutes === 60) intervalMs = 60 * 1000;
      else if (minutes === 1440) intervalMs = 60 * 60 * 1000;

      const spacedReadings = [];
      let nextAllowedTime = new Date(fromTimestamp);

      for (const reading of rawReadings) {
        if (reading.timestamp >= nextAllowedTime) {
          spacedReadings.push(reading);
          nextAllowedTime = new Date(reading.timestamp.getTime() + intervalMs);
        }
      }

      // Fallback to latest 20 if spaced result too short
      readingsToReturn =
        spacedReadings.length >= 2 ? spacedReadings : rawReadings.slice(-20);
    }

    return NextResponse.json({
      live: latestReading,
      readings: readingsToReturn,
    });
  } catch (err) {
    console.error("❌ GET /api/sensor error:", err);
    return NextResponse.json(
      { error: "Failed to fetch sensor readings" },
      { status: 500 },
    );
  }
}
