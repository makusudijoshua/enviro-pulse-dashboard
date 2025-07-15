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

    await prisma.sensorReading.create({
      data: {
        temperature,
        humidity,
        sound,
      },
    });

    return NextResponse.json({ success: true });
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
    const now = Date.now();
    const cutoff = new Date(now - minutes * 60 * 1000);

    // Define time bucket size
    let bucketMs = 5 * 60_000;
    if (minutes === 15) bucketMs = 15 * 60_000;
    else if (minutes === 60) bucketMs = 60 * 60_000;
    else if (minutes >= 1440) bucketMs = 24 * 60 * 60_000;

    const all = await prisma.sensorReading.findMany({
      where: { timestamp: { gte: cutoff } },
      orderBy: { timestamp: "asc" },
    });

    const buckets = new Map<number, (typeof all)[0]>();

    for (const r of all) {
      const time = new Date(r.timestamp).getTime();
      const bucket = Math.floor(time / bucketMs) * bucketMs;
      if (!buckets.has(bucket)) {
        buckets.set(bucket, r);
      }
    }

    const sampled = Array.from(buckets.values()).sort(
      (a, b) =>
        new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
    );

    return NextResponse.json(sampled);
  } catch (err) {
    console.error("GET /api/sensor error:", err);
    return NextResponse.json(
      { error: "Failed to fetch sampled readings" },
      { status: 500 },
    );
  }
}
