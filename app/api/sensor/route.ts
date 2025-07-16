import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { temperature, humidity, sound, peakToPeak } = body;

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
      reading: {
        ...saved,
        peakToPeak: typeof peakToPeak === "number" ? peakToPeak : null,
      },
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

    if (isNaN(minutes) || minutes <= 0) {
      return NextResponse.json(
        { error: "Invalid 'minutes' query parameter" },
        { status: 400 },
      );
    }

    const now = new Date();
    const cutoff = new Date(now.getTime() - minutes * 60 * 1000);

    const readings = await prisma.sensorReading.findMany({
      where: {
        timestamp: {
          gte: cutoff,
        },
      },
      orderBy: {
        timestamp: "asc",
      },
    });

    return NextResponse.json(readings);
  } catch (err) {
    console.error("GET /api/sensor error:", err);
    return NextResponse.json(
      { error: "Failed to fetch sensor readings" },
      { status: 500 },
    );
  }
}
