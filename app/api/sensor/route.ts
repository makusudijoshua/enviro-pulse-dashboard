import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/common/lib/prisma";

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

    // Latest reading (baseline for all)
    const latestReading = await prisma.sensorReading.findFirst({
      orderBy: { timestamp: "desc" },
      select: {
        timestamp: true,
        temperature: true,
        humidity: true,
        sound: true,
        soundPeakToPeak: true,
        batteryVoltage: true,
        batteryPercentage: true,
      },
    });

    if (!latestReading) {
      return NextResponse.json({ live: null, readings: [] });
    }

    const now = latestReading.timestamp;
    const fromTimestamp = new Date(now.getTime() - minutes * 60 * 1000);

    // Case: Live – return only latest
    if (minutes === 0) {
      return NextResponse.json({
        live: latestReading,
        readings: [latestReading],
      });
    }

    // Case: 5m or 15m – return reading X minutes after the latest timestamp
    if (minutes === 5 || minutes === 15) {
      const targetTime = new Date(
        latestReading.timestamp.getTime() + minutes * 60 * 1000,
      );
      const readingAfterInterval = await prisma.sensorReading.findFirst({
        where: {
          timestamp: {
            gte: targetTime,
          },
        },
        orderBy: { timestamp: "asc" },
        select: {
          timestamp: true,
          temperature: true,
          humidity: true,
          sound: true,
          soundPeakToPeak: true,
          batteryVoltage: true,
          batteryPercentage: true,
        },
      });

      return NextResponse.json({
        live: latestReading,
        readings: readingAfterInterval ? [readingAfterInterval] : [],
      });
    }

    // Case: 1h or 1d – return spaced readings for chart view
    const rawReadings = await prisma.sensorReading.findMany({
      where: {
        timestamp: {
          gte: fromTimestamp,
        },
      },
      orderBy: { timestamp: "asc" },
      select: {
        timestamp: true,
        temperature: true,
        humidity: true,
        sound: true,
        soundPeakToPeak: true,
        batteryVoltage: true,
        batteryPercentage: true,
      },
    });

    let intervalMs = 60 * 1000; // default 1 minute for 1h

    if (minutes === 1440) {
      intervalMs = 60 * 60 * 1000; // 1 hour for 1d
    }

    const spacedReadings = [];
    let nextAllowedTime = new Date(fromTimestamp);

    for (const reading of rawReadings) {
      if (reading.timestamp >= nextAllowedTime) {
        spacedReadings.push(reading);
        nextAllowedTime = new Date(reading.timestamp.getTime() + intervalMs);
      }
    }

    const readingsToReturn =
      spacedReadings.length >= 2 ? spacedReadings : rawReadings.slice(-20);

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
