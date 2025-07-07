import { NextRequest, NextResponse } from "next/server";
import { PrismaClient } from "@/app/generated/prisma";

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { temperature, humidity, sound, filterLevel } = body;

    if (
      typeof temperature !== "number" ||
      typeof humidity !== "number" ||
      typeof sound !== "number" ||
      typeof filterLevel !== "number"
    ) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 });
    }

    const newReading = await prisma.sensorReading.create({
      data: {
        temperature,
        humidity,
        sound,
        filterLevel,
      },
    });

    return NextResponse.json(newReading, { status: 201 });
  } catch (error) {
    console.error("Error creating sensor reading:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const minutes = parseInt(searchParams.get("minutes") || "5", 10);
    const since = new Date(Date.now() - minutes * 60 * 1000);

    const readings = await prisma.sensorReading.findMany({
      where: {
        timestamp: {
          gte: since,
        },
      },
      orderBy: {
        timestamp: "desc",
      },
    });

    return NextResponse.json(readings);
  } catch (error) {
    console.error("Error fetching sensor data:", error);
    return NextResponse.json(
      { error: "Failed to fetch data" },
      { status: 500 },
    );
  }
}
