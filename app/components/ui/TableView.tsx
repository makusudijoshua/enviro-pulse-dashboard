"use client";

import React from "react";
import { Reading } from "@/app/common/types/reading";

type Props = {
  sensors: string[];
  data: Reading[];
};

const TableView: React.FC<Props> = ({ sensors, data }) => {
  const formatDateTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: true,
    });
  };

  return (
    <div className="overflow-x-auto rounded-xl shadow-md bg-white">
      <table className="w-full table-auto text-sm text-gray-800">
        <thead className="bg-gray-100 border-b text-left">
          <tr>
            <th className="px-4 py-2">Timestamp</th>
            {sensors.includes("Temperature") && (
              <th className="px-4 py-2">Temperature</th>
            )}
            {sensors.includes("Humidity") && (
              <th className="px-4 py-2">Humidity</th>
            )}
            {sensors.includes("Sound Level") && (
              <th className="px-4 py-2">Sound Level</th>
            )}
            {sensors.includes("Filter Level") && (
              <th className="px-4 py-2">Filter Level</th>
            )}
          </tr>
        </thead>
        <tbody>
          {data.map((entry, index) => (
            <tr
              key={index}
              className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
            >
              <td className="px-4 py-2">{formatDateTime(entry.timestamp)}</td>
              {sensors.includes("Temperature") && (
                <td className="px-4 py-2">
                  {entry.temperature !== null && entry.temperature !== undefined
                    ? `${entry.temperature.toFixed(1)} °C`
                    : "--"}
                </td>
              )}
              {sensors.includes("Humidity") && (
                <td className="px-4 py-2">
                  {entry.humidity !== null && entry.humidity !== undefined
                    ? `${entry.humidity.toFixed(1)} %`
                    : "--"}
                </td>
              )}
              {sensors.includes("Sound Level") && (
                <td className="px-4 py-2">
                  {entry.sound !== null && entry.sound !== undefined
                    ? `${entry.sound} dB`
                    : "--"}
                </td>
              )}
              {sensors.includes("Filter Level") && (
                <td className="px-4 py-2">
                  {entry.filterLevel !== undefined && entry.filterLevel !== null
                    ? `${entry.filterLevel} %`
                    : "--"}
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
