"use client";

import React from "react";

interface ViewToggleProps {
  view: "chart" | "table";
  onChange: (view: "chart" | "table") => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ view, onChange }) => {
  const baseClasses =
    "px-4 py-1 transition-colors duration-200 focus:outline-none focus:ring-1";

  return (
    <div className="inline-flex border rounded-lg overflow-hidden text-sm shadow-sm">
      <button
        onClick={() => onChange("chart")}
        aria-pressed={view === "chart"}
        className={`${baseClasses} ${
          view === "chart" ? "bg-gray-800 text-white" : "bg-white text-gray-800"
        } border-r border-gray-300`}
      >
        Chart
      </button>
      <button
        onClick={() => onChange("table")}
        aria-pressed={view === "table"}
        className={`${baseClasses} ${
          view === "table" ? "bg-gray-800 text-white" : "bg-white text-gray-800"
        }`}
      >
        Table
      </button>
    </div>
  );
};

export default ViewToggle;
