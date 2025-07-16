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

const formatUnit = (key: string, value: number) => {
  if (key === "temperature") return `${value} °C`;
  if (key === "humidity") return `${value} %`;
  if (key === "sound") return `${value} dB`;
  return value;
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
  return (
    <div className="w-full h-[400px] bg-white p-6 rounded-xl shadow-md">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 20, right: 20, left: 0, bottom: 20 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis
            dataKey="timestamp"
            tickFormatter={formatDateTime}
            angle={-45}
            textAnchor="end"
            interval={0}
            tick={{ fontSize: 11 }}
            height={60}
          />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip content={<CustomTooltip />} />
          <Legend />

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