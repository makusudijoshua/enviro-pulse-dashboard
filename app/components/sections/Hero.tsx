"use client";

import Card from "@/app/components/ui/Card";
import React, { useEffect, useState } from "react";
import { Reading } from "@/app/common/types/reading";
import TableView from "@/app/components/ui/TableView";
import ChartView from "@/app/components/ui/ChartView";
import { AudioLines, ThermometerSun, Waves } from "lucide-react";
import FilterBar, { FilterState } from "@/app/components/ui/FilterBar";

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
    const fetchReadings = async () => {
      const minutes = parseInt(filters.selectedTime);
      try {
        const res = await fetch(`/api/sensor?minutes=${minutes}`);
        const data = await res.json();

        if (Array.isArray(data)) {
          setReadings(data);
          setLatest(data[data.length - 1] ?? null);
          setPrevious(data[data.length - 2] ?? null);
        } else {
          console.warn("Unexpected API response:", data);
        }
      } catch (err) {
        console.error("Failed to fetch sensor data", err);
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
        <ChartView sensors={filters.selectedSensors} data={readings} />
      )}

      {filters.selectedView === "Table" && readings.length > 0 && (
        <TableView sensors={filters.selectedSensors} data={readings} />
      )}
    </section>
  );
};

export default Hero;
