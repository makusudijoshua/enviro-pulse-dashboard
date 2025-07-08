"use client";

import { useEffect, useState } from "react";

export type Reading = {
  temperature: number;
  humidity: number;
  sound: number;
  timestamp: string;
};

export const useLatestReading = () => {
  const [data, setData] = useState<Reading | null>(null);

  const fetchLatest = async () => {
    try {
      const res = await fetch("/api/sensor?minutes=1");
      const json = await res.json();
      if (Array.isArray(json) && json.length > 0) {
        setData(json[0]);
      }
    } catch (error) {
      console.error("Failed to fetch latest sensor reading:", error);
    }
  };

  useEffect(() => {
    fetchLatest();
    const interval = setInterval(fetchLatest, 5000); // poll every 5s
    return () => clearInterval(interval);
  }, []);

  return data;
};
