"use client";

import React from "react";

const timeOptions = ["Live", "5m", "15m", "1h", "1d"] as const;
const views = ["Grid", "Chart"] as const; // Removed "Table"
const sensors = ["Temperature", "Humidity", "Sound Level"] as const;

export type TimeOption = (typeof timeOptions)[number];
export type ViewOption = (typeof views)[number];
export type SensorOption = (typeof sensors)[number];

export type FilterState = {
  selectedTime: TimeOption;
  selectedView: ViewOption;
  selectedSensors: SensorOption[];
};

type FilterBarProps = {
  filters: FilterState;
  onChange: (updated: FilterState) => void;
};

export default function FilterBar({ filters, onChange }: FilterBarProps) {
  const handleTimeChange = (time: TimeOption) => {
    onChange({ ...filters, selectedTime: time });
  };

  const handleViewChange = (view: ViewOption) => {
    const chartRestrictedTimes = ["Live", "5m", "15m"];
    if (
      chartRestrictedTimes.includes(filters.selectedTime) &&
      view === "Chart"
    ) {
      return;
    }
    onChange({ ...filters, selectedView: view });
  };

  const toggleSensor = (sensor: SensorOption) => {
    const updatedSensors = filters.selectedSensors.includes(sensor)
      ? filters.selectedSensors.filter((s) => s !== sensor)
      : [...filters.selectedSensors, sensor];

    onChange({ ...filters, selectedSensors: updatedSensors });
  };

  const realTimeLabel = (() => {
    switch (filters.selectedTime) {
      case "Live":
        return "Live: updates every 5 seconds";
      case "5m":
        return "Past 5 minutes (20 readings)";
      case "15m":
        return "Every 5 minutes after latest";
      case "1h":
        return "Every 1 minute after latest";
      case "1d":
        return "Every 1 hour after latest";
      default:
        return "";
    }
  })();

  const isChartDisabled = ["Live", "5m", "15m"].includes(filters.selectedTime);

  return (
    <div className="flex flex-col gap-6 p-6 bg-white shadow-md rounded-xl">
      <div className="flex w-full justify-between items-center">
        <div className="flex flex-wrap gap-3">
          {timeOptions.map((option) => (
            <button
              key={option}
              onClick={() => handleTimeChange(option)}
              className={`px-3 py-1 rounded-md text-sm ${
                filters.selectedTime === option
                  ? "bg-blue-600 text-white"
                  : "bg-gray-100 text-gray-800"
              }`}
            >
              {option}
            </button>
          ))}

          {views.map((view) => {
            const disabled = isChartDisabled && view === "Chart";

            return (
              <button
                key={view}
                onClick={() => handleViewChange(view)}
                disabled={disabled}
                aria-disabled={disabled}
                className={`px-3 py-1 rounded-md text-sm transition-colors ${
                  filters.selectedView === view
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-800"
                } ${disabled ? "opacity-50 cursor-not-allowed" : ""}`}
              >
                {view}
              </button>
            );
          })}
        </div>
        <div className="text-xs text-gray-600 hidden md:block">
          {realTimeLabel}
        </div>
      </div>

      <div className="flex flex-wrap gap-5">
        {sensors.map((sensor) => (
          <label key={sensor} className="flex items-center gap-1 text-sm">
            <input
              type="checkbox"
              checked={filters.selectedSensors.includes(sensor)}
              onChange={() => toggleSensor(sensor)}
              className="accent-blue-600"
            />
            {sensor}
          </label>
        ))}
      </div>
    </div>
  );
}
