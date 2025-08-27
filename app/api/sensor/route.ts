import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const minutesParam = searchParams.get("minutes") || "live";

    const latestReading = await prisma.sensorReading.findFirst({
      orderBy: { timestamp: "desc" },
    });

    if (!latestReading) {
      return NextResponse.json({ live: null, readings: [] });
    }

    // LIVE MODE
    if (minutesParam === "live") {
      return NextResponse.json({
        live: latestReading,
        readings: [latestReading],
      });
    }

    const minutes = Number(minutesParam);
    if (isNaN(minutes)) {
      return NextResponse.json(
        { error: "Invalid 'minutes' parameter" },
        { status: 400 },
      );
    }

    const startTime = new Date(
      new Date(latestReading.timestamp).getTime() - minutes * 60 * 1000,
    );

    const rawReadings = await prisma.sensorReading.findMany({
      where: {
        timestamp: {
          gte: startTime,
          lte: latestReading.timestamp,
        },
      },
      orderBy: {
        timestamp: "asc",
      },
    });

    let spacedReadings = rawReadings;

    // For 1h → return readings spaced by 1 minute
    // For 1d → return readings spaced by 1 hour
    if (minutes === 60 || minutes === 1440) {
      const spacingMs = minutes === 60 ? 60 * 1000 : 60 * 60 * 1000;
      let lastTimestamp = 0;

      spacedReadings = rawReadings.filter((reading) => {
        const current = new Date(reading.timestamp).getTime();
        if (current - lastTimestamp >= spacingMs) {
          lastTimestamp = current;
          return true;
        }
        return false;
      });
    }

    // For 5m and 15m → return closest reading to target time
    if (minutes === 5 || minutes === 15) {
      const targetTime = new Date(
        new Date(latestReading.timestamp).getTime() - minutes * 60 * 1000,
      );
      const lowerBound = new Date(targetTime.getTime() - 30 * 1000);
      const upperBound = new Date(targetTime.getTime() + 30 * 1000);

      const closestReading = await prisma.sensorReading.findFirst({
        where: {
          timestamp: {
            gte: lowerBound,
            lte: upperBound,
          },
        },
        orderBy: {
          timestamp: "asc",
        },
      });

      spacedReadings = closestReading ? [closestReading] : [];
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

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();

    const {
      temperature,
      humidity,
      sound,
      soundPeakToPeak,
      wifiConnected,
      ipAddress,
    } = data;

    if (
      typeof temperature !== "number" ||
      typeof humidity !== "number" ||
      typeof sound !== "number" ||
      typeof soundPeakToPeak !== "number" ||
      typeof wifiConnected !== "boolean" ||
      typeof ipAddress !== "string"
    ) {
      return NextResponse.json(
        { error: "Invalid payload structure" },
        { status: 400 },
      );
    }

    const newReading = await prisma.sensorReading.create({
      data: {
        temperature,
        humidity,
        sound,
        soundPeakToPeak,
        wifiConnected,
        ipAddress,
      },
    });

    return NextResponse.json(
      { success: true, data: newReading },
      { status: 201 },
    );
  } catch (err) {
    console.error("POST /api/sensor error:", err);
    return NextResponse.json(
      { error: "Failed to store sensor reading" },
      { status: 500 },
    );
  }
}
