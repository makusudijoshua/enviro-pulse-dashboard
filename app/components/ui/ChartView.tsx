"use client";

import React from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  ReferenceLine,
} from "recharts";
import { Reading } from "@/app/common/types/reading";

type ChartViewProps = {
  data: Reading[];
  sensors: string[];
};

const formatDateTime = (timestamp: string) => {
  const options: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  };
  return new Date(timestamp).toLocaleString(undefined, options);
};

const formatShortTime = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString(undefined, {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
};

const formatUnit = (key: string, value: number) => {
  if (key === "temperature") return `${value} °C`;
  if (key === "humidity") return `${value} %`;
  if (key === "sound") return `${value} dB`;
  return value;
};

const getPeakToPeak = (data: Reading[], key: string): number | null => {
  if (!data || data.length === 0) return null;
  const values = data
    .map((d) => d[key as keyof Reading])
    .filter((v) => typeof v === "number");
  if (values.length === 0) return null;

  const min = Math.min(...values);
  const max = Math.max(...values);
  return parseFloat((max - min).toFixed(2));
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="rounded-md bg-white p-3 shadow-md border border-gray-200">
        <p className="text-xs text-gray-500">{formatDateTime(label)}</p>
        {payload.map((entry: any, i: number) => (
          <p key={i} className="text-sm text-gray-800">
            {entry.name}: {formatUnit(entry.dataKey, entry.value)}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function ChartView({ data, sensors }: ChartViewProps) {
  const temperaturePeakToPeak = sensors.includes("Temperature")
    ? getPeakToPeak(data, "temperature")
    : null;

  const humidityPeakToPeak = sensors.includes("Humidity")
    ? getPeakToPeak(data, "humidity")
    : null;

  const soundPeakToPeak = sensors.includes("Sound Level")
    ? getPeakToPeak(data, "sound")
    : null;

  const tempMax = Math.max(...data.map((d) => d.temperature ?? -Infinity));
  const tempMin = Math.min(...data.map((d) => d.temperature ?? Infinity));

  const humMax = Math.max(...data.map((d) => d.humidity ?? -Infinity));
  const humMin = Math.min(...data.map((d) => d.humidity ?? Infinity));

  const soundMax = Math.max(...data.map((d) => d.sound ?? -Infinity));
  const soundMin = Math.min(...data.map((d) => d.sound ?? Infinity));

  return (
    <div className="w-full h-[440px] bg-white p-6 rounded-xl shadow-md">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 20, right: 20, left: 0, bottom: 40 }}
        >
          <CartesianGrid strokeDasharray="3 3" />

          <XAxis
            dataKey="timestamp"
            tickFormatter={formatShortTime}
            angle={-45}
            textAnchor="end"
            interval="preserveStartEnd"
            tick={{ fontSize: 12 }}
            height={60}
          />

          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />

          {/* Peak-to-peak reference lines */}
          {sensors.includes("Temperature") && (
            <>
              <ReferenceLine
                y={tempMax}
                stroke="#3b82f6"
                strokeDasharray="3 3"
                label={{ value: "Temp Max", fill: "#3b82f6", fontSize: 10 }}
              />
              <ReferenceLine
                y={tempMin}
                stroke="#3b82f6"
                strokeDasharray="3 3"
                label={{ value: "Temp Min", fill: "#3b82f6", fontSize: 10 }}
              />
            </>
          )}
          {sensors.includes("Humidity") && (
            <>
              <ReferenceLine
                y={humMax}
                stroke="#10b981"
                strokeDasharray="3 3"
                label={{ value: "Hum Max", fill: "#10b981", fontSize: 10 }}
              />
              <ReferenceLine
                y={humMin}
                stroke="#10b981"
                strokeDasharray="3 3"
                label={{ value: "Hum Min", fill: "#10b981", fontSize: 10 }}
              />
            </>
          )}
          {sensors.includes("Sound Level") && (
            <>
              <ReferenceLine
                y={soundMax}
                stroke="#f97316"
                strokeDasharray="3 3"
                label={{ value: "Sound Max", fill: "#f97316", fontSize: 10 }}
              />
              <ReferenceLine
                y={soundMin}
                stroke="#f97316"
                strokeDasharray="3 3"
                label={{ value: "Sound Min", fill: "#f97316", fontSize: 10 }}
              />
            </>
          )}

          {/* Main signal lines */}
          {sensors.includes("Temperature") && (
            <Line
              type="monotone"
              dataKey="temperature"
              stroke="#3b82f6"
              name="Temperature"
            />
          )}
          {sensors.includes("Humidity") && (
            <Line
              type="monotone"
              dataKey="humidity"
              stroke="#10b981"
              name="Humidity"
            />
          )}
          {sensors.includes("Sound Level") && (
            <Line
              type="monotone"
              dataKey="sound"
              stroke="#f97316"
              name="Sound Level"
            />
          )}
          {sensors.includes("Filter Level") && (
            <Line
              type="monotone"
              dataKey="filterLevel"
              stroke="#8b5cf6"
              name="Filter Level"
              connectNulls
              isAnimationActive={false}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
