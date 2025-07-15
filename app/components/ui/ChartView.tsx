
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

export default function ChartView({ data, sensors }: ChartViewProps) {
  return (
    <div className="w-full h-[400px] bg-white p-6 rounded-xl shadow-md">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={data}
          margin={{ top: 20, right: 20, left: 0, bottom: 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
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
