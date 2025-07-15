"use client";

import React from "react";
import { Reading } from "@/app/common/types/reading";

type Props = {
  sensors: string[];
  data: Reading[];
};

const TableView: React.FC<Props> = ({ sensors, data }) => {
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  return (
    <div className="overflow-x-auto rounded-xl shadow-md bg-white">
      <table className="w-full table-auto text-sm text-gray-800">
        <thead className="bg-gray-100 border-b text-left">
          <tr>
            <th className="px-4 py-2">Time</th>
            {sensors.includes("Temperature") && (
              <th className="px-4 py-2">Temperature (°C)</th>
            )}
            {sensors.includes("Humidity") && (
              <th className="px-4 py-2">Humidity (%)</th>
            )}
            {sensors.includes("Sound Level") && (
              <th className="px-4 py-2">Sound (dB)</th>
            )}
            {sensors.includes("Filter Level") && (
              <th className="px-4 py-2">Filter Level (%)</th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((entry, index) => (
            <tr
              key={index}
              className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
            >
              <td className="px-4 py-2">{formatTime(entry.timestamp)}</td>
              {sensors.includes("Temperature") && (
                <td className="px-4 py-2">
                  {entry.temperature?.toFixed(1) ?? "--"}
                </td>
              )}
              {sensors.includes("Humidity") && (
                <td className="px-4 py-2">
                  {entry.humidity?.toFixed(1) ?? "--"}
                </td>
              )}
              {sensors.includes("Sound Level") && (
                <td className="px-4 py-2">{entry.sound ?? "--"}</td>
              )}
              {sensors.includes("Filter Level") && (
                <td className="px-4 py-2">
                  {entry.filterLevel !== undefined ? entry.filterLevel : "--"}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default TableView;
