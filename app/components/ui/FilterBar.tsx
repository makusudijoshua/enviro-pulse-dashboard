"use client";

import React, { useEffect } from "react";

const timeOptions = ["Live", "5m", "15m", "1h", "1d"] as const;
const views = ["Grid", "Chart"] as const;
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
  wifiConnected: boolean;
  ipAddress: string;
};

export default function FilterBar({
  filters,
  onChange,
  wifiConnected,
  ipAddress,
}: FilterBarProps) {
  // 🔁 Force Chart view for 1h and 1d
  useEffect(() => {
    if (filters.selectedTime === "1h" || filters.selectedTime === "1d") {
      if (filters.selectedView !== "Chart") {
        onChange({ ...filters, selectedView: "Chart" });
      }
    }
  }, [filters.selectedTime]);

  const handleTimeChange = (time: TimeOption) => {
    const forcedChart = ["1h", "1d"].includes(time);
    const newView: ViewOption = forcedChart ? "Chart" : filters.selectedView;

    onChange({ ...filters, selectedTime: time, selectedView: newView });
  };

  const handleViewChange = (view: ViewOption) => {
    const isLockedToChart = ["1h", "1d"].includes(filters.selectedTime);
    if (isLockedToChart && view !== "Chart") return;

    onChange({ ...filters, selectedView: view });
  };

  const toggleSensor = (sensor: SensorOption) => {
    const updatedSensors = filters.selectedSensors.includes(sensor)
      ? filters.selectedSensors.filter((s) => s !== sensor)
      : [...filters.selectedSensors, sensor];

    onChange({ ...filters, selectedSensors: updatedSensors });
  };

  const isChartForced = ["1h", "1d"].includes(filters.selectedTime);
  const isChartDisabled = ["Live", "5m", "15m"].includes(filters.selectedTime);

  return (
    <div className="flex flex-col gap-6 p-6 bg-white shadow-md rounded-xl">
      {/* Time + View Buttons */}
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
            const disabled =
              (isChartDisabled && view === "Chart") ||
              (isChartForced && view !== "Chart");

            return (
              <button
                key={view}
                onClick={() => handleViewChange(view)}
                disabled={disabled}
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
      </div>

      {/* Sensor Checkboxes */}
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

      {/* Wi-Fi Status */}
      <div className="flex items-center gap-3 text-sm text-gray-700 pt-3 border-t border-gray-200">
        <span
          className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${
            wifiConnected
              ? "bg-green-100 text-green-700"
              : "bg-red-100 text-red-700"
          }`}
        >
          <span
            className={`h-2 w-2 rounded-full ${
              wifiConnected ? "bg-green-500" : "bg-red-500"
            }`}
          ></span>
          {wifiConnected ? "Wi-Fi Connected" : "Wi-Fi Disconnected"}
        </span>

        <span className="text-xs text-gray-500 ml-auto">
          IP: {ipAddress || "N/A"}
        </span>
      </div>
    </div>
  );
}
