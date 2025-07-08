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

const SensorTable: React.FC<SensorTableProps> = ({ timeRange }) => {
  const [data, setData] = useState<SensorReading[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReadings = async () => {
      try {
        const minutes = timeRange === "15m" ? 15 : 5;
        const res = await fetch(`/api/sensor?minutes=${minutes}`);
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error("Error fetching table data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReadings();
  }, [timeRange]);

  if (loading) return <p>Loading table...</p>;

  return (
    <div className="overflow-x-auto rounded-xl shadow border border-gray-200">
      <table className="min-w-full text-sm text-left text-gray-700">
        <thead className="bg-gray-100">
          <tr>
            <th className="px-4 py-2">Time</th>
            <th className="px-4 py-2">Temperature (°C)</th>
            <th className="px-4 py-2">Humidity (%)</th>
            <th className="px-4 py-2">Sound (dB)</th>
          </tr>
        </thead>
        <tbody>
          {data.map((reading) => (
            <tr key={reading.id} className="border-t">
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
