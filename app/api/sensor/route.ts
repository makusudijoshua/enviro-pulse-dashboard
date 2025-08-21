import { NextRequest, NextResponse } from "next/server";
import { PrismaClient, type SensorReading } from "@/app/generated/prisma";

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const minutes = Number(searchParams.get("minutes") || 5);
    const now = new Date();
    const from = new Date(now.getTime() - minutes * 60 * 1000);

    const rawReadings = await prisma.sensorReading.findMany({
      where: {
        timestamp: {
          gte: from,
          lte: now,
        },
      },
      orderBy: {
        timestamp: "desc",
      },
    });

    const latestReading = await prisma.sensorReading.findFirst({
      orderBy: {
        timestamp: "desc",
      },
    });

    let spacedReadings = rawReadings;

    if (["1h", "1d"].includes(searchParams.get("minutes") || "")) {
      const interval = minutes === 60 ? 60 * 1000 : 60 * 60 * 1000;
      let lastTimestamp = 0;

      spacedReadings = rawReadings.filter((reading: SensorReading) => {
        const current = new Date(reading.timestamp).getTime();
        if (current - lastTimestamp >= interval) {
          lastTimestamp = current;
          return true;
        }
        return false;
      });
    }

    const readingsToReturn =
      spacedReadings.length >= 2 ? spacedReadings : rawReadings.slice(-20);

    return NextResponse.json({
      live: latestReading,
      readings: readingsToReturn,
    });
  } catch (err) {
    console.error("GET /api/sensor error:", err);
    return NextResponse.json(
      { error: "Failed to fetch sensor readings" },
      { status: 500 },
    );
  }
}
