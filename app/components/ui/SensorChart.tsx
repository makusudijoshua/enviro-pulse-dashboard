"use client";

import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

type SensorReading = {
  timestamp: string;
  temperature: number;
  humidity: number;
  sound: number;
};

interface SensorChartProps {
  timeRange: "5m" | "15m" | "1h" | "1d";
}

const SensorChart: React.FC<SensorChartProps> = ({ timeRange }) => {
  const [data, setData] = useState<SensorReading[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReadings = async () => {
      try {
        const minutes = parseTimeRange(timeRange);
        const res = await fetch(`/api/sensor?minutes=${minutes}`);
        const json = await res.json();
        setData(json);
      } catch (error) {
        console.error("Failed to fetch sensor data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchReadings();
  }, [timeRange]);

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

  if (loading) return <p>Loading chart...</p>;

  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={data}>
        <XAxis
          dataKey="timestamp"
          tickFormatter={(t) =>
            new Date(t).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })
          }
        />
        <YAxis />
        <Tooltip labelFormatter={(label) => new Date(label).toLocaleString()} />
        <Legend />
        <Line
          type="monotone"
          dataKey="temperature"
          name="Temp (°C)"
          stroke="#f87171"
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="humidity"
          name="Humidity (%)"
          stroke="#60a5fa"
          dot={false}
        />
        <Line
          type="monotone"
          dataKey="sound"
          name="Sound (dB)"
          stroke="#a78bfa"
          dot={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default SensorChart;
