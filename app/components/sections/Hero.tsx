"use client";

import React, { useEffect, useState } from "react";
import Card from "@/app/components/ui/Card";
import TableView from "@/app/components/ui/TableView";
import ChartView from "@/app/components/ui/ChartView";
import FilterBar, { FilterState } from "@/app/components/ui/FilterBar";
import { AudioLines, ThermometerSun, Waves } from "lucide-react";
import { Reading } from "@/app/common/types/reading";

const initialFilters: FilterState = {
  selectedTime: "5m",
  selectedView: "Grid",
  selectedSensors: ["Temperature", "Humidity", "Sound Level"],
};

const Hero = () => {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [latest, setLatest] = useState<Reading | null>(null);
  const [previous, setPrevious] = useState<Reading | null>(null);

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
          setLatest(data.live);
          setReadings(data.readings);
          setPrevious(data.readings[0] ?? null);
        } else {
          console.warn("Unexpected API response:", data);
          setLatest(null);
          setReadings([]);
          setPrevious(null);
        }
      } catch (err) {
        console.error("Failed to fetch sensor data", err);
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

  return (
    <section className="pt-20 flex flex-col gap-8">
      <FilterBar filters={filters} onChange={setFilters} />

      {filters.selectedView === "Grid" && (
        <div className="flex flex-col gap-16 md:flex-row md:gap-6">
          {filters.selectedSensors.includes("Temperature") && (
            <Card
              currentReading={latest?.temperature ?? null}
              previousReading={previous?.temperature ?? null}
              icon={icons["Temperature"]}
              title="Temperature"
              type="temperature"
            />
          )}
          {filters.selectedSensors.includes("Humidity") && (
            <Card
              currentReading={latest?.humidity ?? null}
              previousReading={previous?.humidity ?? null}
              icon={icons["Humidity"]}
              title="Humidity"
              type="humidity"
            />
          )}
          {filters.selectedSensors.includes("Sound Level") && (
            <Card
              currentReading={latest?.sound ?? null}
              previousReading={previous?.sound ?? null}
              icon={icons["Sound Level"]}
              title="Sound"
              type="sound"
            />
          )}
        </div>
      )}

      {filters.selectedView === "Chart" && readings.length > 0 && (
        <div className="w-full">
          <ChartView sensors={filters.selectedSensors} data={readings} />
        </div>
      )}

      {filters.selectedView === "Table" && readings.length > 0 && (
        <div className="w-full">
          <TableView sensors={filters.selectedSensors} data={readings} />
        </div>
      )}
    </section>
  );
};

export default Hero;
