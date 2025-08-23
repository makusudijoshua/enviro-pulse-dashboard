import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const minutesParam = searchParams.get("minutes") || "live";

    const latestReading = await prisma.sensorReading.findFirst({
      orderBy: {
        timestamp: "desc",
      },
    });

    if (!latestReading) {
      return NextResponse.json({ live: null, readings: [] });
    }

    // LIVE MODE: return the latest reading only
    if (minutesParam === "live") {
      return NextResponse.json({
        live: latestReading,
        readings: [latestReading],
      });
    }

    // Convert string like "5", "15", "60", "1440" to number
    const minutes = Number(minutesParam);
    if (isNaN(minutes)) {
      return NextResponse.json(
        { error: "Invalid 'minutes' parameter" },
        { status: 400 },
      );
    }

    // Target time = live timestamp + X minutes
    const targetTime = new Date(
      new Date(latestReading.timestamp).getTime() + minutes * 60 * 1000,
    );

    const now = new Date();

    // Not enough time has passed → return empty readings
    if (now < targetTime) {
      return NextResponse.json({
        live: latestReading,
        readings: [],
      });
    }

    // Search for the reading closest to the target time ± 30s window
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

    return NextResponse.json({
      live: latestReading,
      readings: closestReading ? [closestReading] : [],
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
