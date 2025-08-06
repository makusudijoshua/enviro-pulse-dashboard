"use client";

import React from "react";
import clsx from "clsx";
import { LineChart, Line, ResponsiveContainer } from "recharts";

interface SensorCardProps {
  type: "temperature" | "humidity" | "sound";
  currentReading: number | null;
  previousReading?: number | null;
  title: string;
  icon: React.ReactNode;
  recentPeakToPeakData?: number[]; // <-- New prop
}

const getUnit = (type: string) => {
  switch (type) {
    case "temperature":
      return "°C";
    case "humidity":
      return "%";
    case "sound":
      return "dB";
    default:
      return "";
  }
};

const formatValue = (value: number | null, type: string) => {
  if (value === null) return "No data";
  const formatted = new Intl.NumberFormat().format(value);
  return `${formatted} ${getUnit(type)}`;
};

const getBarStyle = (type: string, value: number | null) => {
  if (value === null) return { width: "0%", color: "bg-gray-300" };

  switch (type) {
    case "temperature":
      if (value <= 18) return { width: "33%", color: "bg-blue-500" };
      if (value <= 28) return { width: "66%", color: "bg-yellow-500" };
      return { width: "100%", color: "bg-red-500" };
    case "humidity":
      if (value <= 30) return { width: "33%", color: "bg-blue-500" };
      if (value <= 60) return { width: "66%", color: "bg-yellow-500" };
      return { width: "100%", color: "bg-green-500" };
    case "sound":
      if (value <= 40) return { width: "33%", color: "bg-green-500" };
      if (value <= 70) return { width: "66%", color: "bg-orange-400" };
      return { width: "100%", color: "bg-red-500" };
    default:
      return { width: "0%", color: "bg-gray-300" };
  }
};

const getTags = (type: string) => {
  switch (type) {
    case "temperature":
      return [
        { label: "Cool", color: "bg-blue-500" },
        { label: "Moderate", color: "bg-yellow-500" },
        { label: "Hot", color: "bg-red-500" },
      ];
    case "humidity":
      return [
        { label: "Low", color: "bg-blue-500" },
        { label: "Medium", color: "bg-yellow-500" },
        { label: "High", color: "bg-green-500" },
      ];
    case "sound":
      return [
        { label: "Quiet", color: "bg-green-500" },
        { label: "Normal", color: "bg-orange-400" },
        { label: "Loud", color: "bg-red-500" },
      ];
    default:
      return [];
  }
};

const Card: React.FC<SensorCardProps> = ({
  icon,
  type,
  title,
  currentReading,
  previousReading,
  recentPeakToPeakData,
}) => {
  const bar = getBarStyle(type, currentReading);
  const tags = getTags(type);

  return (
    <div
      role="region"
      aria-label={`${title} sensor card`}
      className="p-6 rounded-2xl shadow-md bg-white w-full text-gray-900"
    >
      <div className="flex items-center justify-between border-gray-200 border-b pb-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="text-gray-400">{icon}</div>
          <h6 className="font-medium">{title}</h6>
        </div>
      </div>

      <div className="text-5xl font-semibold mb-2">
        {formatValue(currentReading, type)}
      </div>

      <div className="text-xs text-gray-400 mb-4">
        {typeof previousReading === "number"
          ? `${formatValue(previousReading, type)} · 5 min before latest`
          : "No reading 5 min before latest"}
      </div>

      <div className="h-2 w-full rounded-full bg-gray-200 overflow-hidden mb-3">
        <div
          className={clsx(
            "h-full rounded-full transition-all duration-500",
            bar.color,
          )}
          style={{ width: bar.width }}
        />
      </div>

      <div className="flex justify-between items-center text-xs text-gray-600">
        {tags.map((tag) => (
          <div className="flex items-center gap-1" key={tag.label}>
            <span className={clsx("w-2 h-2 rounded-full", tag.color)} />
            {tag.label}
          </div>
        ))}
      </div>

      {/* Peak-to-Peak Mini Chart */}
      {type === "sound" &&
        recentPeakToPeakData &&
        recentPeakToPeakData.length > 0 && (
          <div className="mt-4">
            <h6 className="text-xs text-gray-500 mb-1">
              Peak-to-Peak Amplitude
            </h6>
            <div className="h-20 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={recentPeakToPeakData.map((value, index) => ({
                    index,
                    value,
                  }))}
                >
                  <Line
                    type="monotone"
                    dataKey="value"
                    stroke="#f97316"
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}
    </div>
  );
};

export default Card;
