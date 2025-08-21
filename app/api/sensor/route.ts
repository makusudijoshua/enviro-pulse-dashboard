import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/app/common/lib/prisma";

// POST /api/sensor
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const {
      temperature,
      humidity,
      sound,
      soundPeakToPeak,
      wifiConnected,
      ipAddress,
    } = body;

    const created = await prisma.sensorReading.create({
      data: {
        temperature,
        humidity,
        sound,
        soundPeakToPeak,
        wifiConnected,
        ipAddress,
      },
    });

    return NextResponse.json({ success: true, created }, { status: 201 });
  } catch (err) {
    console.error("❌ POST /api/sensor error:", err);
    return NextResponse.json(
      { error: "Failed to save sensor reading" },
      { status: 500 },
    );
  }
}

// GET /api/sensor?minutes=5
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
        wifiConnected: true,
        ipAddress: true,
      },
    });

    if (!latestReading) {
      return NextResponse.json({ live: null, readings: [] });
    }

    const now = latestReading.timestamp;
    const fromTimestamp = new Date(now.getTime() - minutes * 60 * 1000);

    if (minutes === 0) {
      return NextResponse.json({
        live: latestReading,
        readings: [latestReading],
      });
    }

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
          wifiConnected: true,
          ipAddress: true,
        },
      });

      return NextResponse.json({
        live: latestReading,
        readings: readingAfterInterval ? [readingAfterInterval] : [],
      });
    }

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
        wifiConnected: true,
        ipAddress: true,
      },
    });

    let intervalMs = 60 * 1000;
    if (minutes === 1440) intervalMs = 60 * 60 * 1000;

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
