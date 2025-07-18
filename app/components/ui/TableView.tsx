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
    return date.toLocaleTimeString(undefined, {
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    });
  };

  const hasData = Array.isArray(data) && data.length > 0;

  return (
    <div className="overflow-x-auto rounded-xl shadow-md bg-white">
      {hasData ? (
        <table className="w-full table-auto text-sm text-gray-800">
          <thead className="bg-gray-100 border-b text-left">
            <tr>
              <th className="px-4 py-2">Time</th>
              {sensors.includes("Temperature") && (
                <th className="px-4 py-2">Temperature</th>
              )}
              {sensors.includes("Humidity") && (
                <th className="px-4 py-2">Humidity</th>
              )}
              {sensors.includes("Sound Level") && (
                <th className="px-4 py-2">Sound Level</th>
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
                    {entry.temperature !== null &&
                    entry.temperature !== undefined
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
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="p-6 text-center text-gray-400">
          No readings available.
        </div>
      )}
    </div>
  );
};

export default TableView;
