"use client";

import React, { useEffect, useState } from "react";

type SensorReading = {
  id: string;
  timestamp: string;
  temperature: number;
  humidity: number;
  sound: number;
};

interface SensorTableProps {
  timeRange: "5m" | "15m" | "1h" | "1d";
}

const parseTimeRange = (range: string): number => {
  switch (range) {
    case "5m":
      return 5;
    case "15m":
      return 15;
    case "1h":
      return 60;
    case "1d":
      return 1440;
    default:
      return 5;
  }
};

const SensorTable: React.FC<SensorTableProps> = ({ timeRange }) => {
  const [data, setData] = useState<SensorReading[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReadings = async () => {
      try {
        setLoading(true);
        const minutes = parseTimeRange(timeRange);
        const res = await fetch(`/api/sensor?minutes=${minutes}`);
        const json: SensorReading[] = await res.json();
        setData(json);
      } catch (error) {
        console.error("Error fetching table data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReadings();
  }, [timeRange]);

  if (loading) return <p className="text-gray-500">Loading table...</p>;
  if (!data.length) return <p className="text-gray-500">No data available</p>;

  return (
    <div className="overflow-x-auto rounded-xl shadow border border-gray-200">
      <table className="min-w-full text-sm text-left text-gray-700">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-3">Time</th>
            <th className="px-4 py-3">Temperature (°C)</th>
            <th className="px-4 py-3">Humidity (%)</th>
            <th className="px-4 py-3">Sound (dB)</th>
          </tr>
        </thead>
        <tbody>
          {data.map((reading) => (
            <tr
              key={reading.id}
              className="border-t hover:bg-gray-50 transition"
            >
              <td className="px-4 py-2">
                {new Date(reading.timestamp).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </td>
              <td className="px-4 py-2">{reading.temperature}</td>
              <td className="px-4 py-2">{reading.humidity}</td>
              <td className="px-4 py-2">{reading.sound}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SensorTable;
