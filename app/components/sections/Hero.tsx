"use client";

import React, { useEffect, useState } from "react";
import Card from "@/app/components/ui/Card";
import ChartView from "@/app/components/ui/ChartView";
import FilterBar, { FilterState } from "@/app/components/ui/FilterBar";
import { AudioLines, ThermometerSun, Waves } from "lucide-react";
import { Reading } from "@/app/common/types/reading";

const initialFilters: FilterState = {
  selectedTime: "Live",
  selectedView: "Grid",
  selectedSensors: ["Temperature", "Humidity", "Sound Level"],
};

const Hero = () => {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [latest, setLatest] = useState<Reading | null>(null);
  const [previous, setPrevious] = useState<Reading | null>(null);
  const [hasReceivedData, setHasReceivedData] = useState(false); // <-- NEW

  useEffect(() => {
    setFilters((prev) => {
      if (filters.selectedTime === "1h" || filters.selectedTime === "1d") {
        return { ...prev, selectedView: "Chart" };
      }

      if (
        ["Live", "5m", "15m"].includes(filters.selectedTime) &&
        prev.selectedView === "Chart"
      ) {
        return { ...prev, selectedView: "Grid" };
      }

      return prev;
    });
  }, [filters.selectedTime]);

  useEffect(() => {
    const fetchReadings = async () => {
      const minutesMap: Record<string, number> = {
        Live: 0,
        "5m": 5,
        "15m": 15,
        "1h": 60,
        "1d": 1440,
      };

      const minutes = minutesMap[filters.selectedTime] ?? 5;

      try {
        const res = await fetch(`/api/sensor?minutes=${minutes}`);
        const data = await res.json();

        if (
          data &&
          data.live &&
          Array.isArray(data.readings) &&
          data.readings.every((r: any) => r.timestamp)
        ) {
          setHasReceivedData(true); // <-- Set to true when valid readings are received
          setLatest(data.live);
          setReadings(data.readings);
          setPrevious(data.readings[0] ?? null);
        } else {
          setHasReceivedData(false);
          setLatest(null);
          setReadings([]);
          setPrevious(null);
        }
      } catch (err) {
        console.error("Failed to fetch sensor data", err);
        setHasReceivedData(false);
        setLatest(null);
        setReadings([]);
        setPrevious(null);
      }
    };

    fetchReadings();
    const interval = setInterval(fetchReadings, 5000);
    return () => clearInterval(interval);
  }, [filters.selectedTime]);

  const icons = {
    Temperature: <ThermometerSun className="h-6 w-6" />,
    Humidity: <Waves className="h-6 w-6" />,
    "Sound Level": <AudioLines className="h-6 w-6" />,
  };

  const getSafeValue = (value: number | null | undefined): number => {
    return hasReceivedData && typeof value === "number" ? value : 0;
  };

  return (
    <section className="pt-20 flex flex-col gap-8">
      <FilterBar
        filters={filters}
        onChange={setFilters}
        wifiConnected={latest?.wifiConnected ?? false}
        ipAddress={latest?.ipAddress ?? "Unknown IP"}
      />

      {filters.selectedView === "Grid" && (
        <div className="flex flex-col gap-16 md:flex-row md:gap-6">
          {filters.selectedSensors.includes("Temperature") && (
            <Card
              currentReading={getSafeValue(latest?.temperature)}
              previousReading={getSafeValue(previous?.temperature)}
              icon={icons["Temperature"]}
              title="Temperature"
              type="temperature"
              selectedTime={filters.selectedTime}
            />
          )}
          {filters.selectedSensors.includes("Humidity") && (
            <Card
              currentReading={getSafeValue(latest?.humidity)}
              previousReading={getSafeValue(previous?.humidity)}
              icon={icons["Humidity"]}
              title="Humidity"
              type="humidity"
              selectedTime={filters.selectedTime}
            />
          )}
          {filters.selectedSensors.includes("Sound Level") && (
            <Card
              type="sound"
              title="Sound"
              icon={icons["Sound Level"]}
              currentReading={getSafeValue(latest?.sound)}
              previousReading={getSafeValue(previous?.sound)}
              selectedTime={filters.selectedTime}
              recentPeakToPeakData={
                filters.selectedTime === "Live" && hasReceivedData
                  ? [
                      ...readings.slice(-29).map((r) => r.soundPeakToPeak),
                      latest?.soundPeakToPeak ?? 0,
                    ].filter((v): v is number => typeof v === "number")
                  : Array(30).fill(0) // Reset chart to 0s
              }
            />
          )}
        </div>
      )}

      {filters.selectedView === "Chart" &&
        hasReceivedData &&
        readings.length > 0 && (
          <div className="w-full">
            <ChartView sensors={filters.selectedSensors} data={readings} />
          </div>
        )}
    </section>
  );
};

export default Hero;
