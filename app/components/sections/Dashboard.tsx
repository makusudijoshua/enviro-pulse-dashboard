"use client";

import React, { useState } from "react";
import SensorChart from "@/app/components/ui/SensorChart";
import SensorTable from "@/app/components/ui/SensorTable";
import ViewToggle from "@/app/components/ui/ViewToggle";

type TimeRange = "5m" | "15m" | "1h" | "1d";
type ViewMode = "chart" | "table";

const Dashboard = () => {
  const [timeRange, setTimeRange] = useState<TimeRange>("5m");
  const [view, setView] = useState<ViewMode>("table");

  const handleTimeRangeChange = (range: TimeRange) => {
    setTimeRange(range);

    if (range === "5m" || range === "15m") {
      setView("table");
    } else {
      setView("chart");
    }
  };

  const ranges: TimeRange[] = ["5m", "15m", "1h", "1d"];

  return (
    <section className="px-6 py-10">
      <div className="mb-6 flex justify-between items-center">
        <div className="flex gap-2">
          {ranges.map((range) => (
            <button
              key={range}
              onClick={() => handleTimeRangeChange(range)}
              className={`px-4 py-1 rounded font-medium transition ${
                timeRange === range
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              {range}
            </button>
          ))}
        </div>
        <ViewToggle view={view} onChange={setView} />
      </div>

      {view === "chart" ? (
        <SensorChart timeRange={timeRange} />
      ) : (
        <SensorTable timeRange={timeRange} />
      )}
    </section>
  );
};

export default Dashboard;
