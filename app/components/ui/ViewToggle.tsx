"use client";

import React from "react";

interface ViewToggleProps {
  view: "chart" | "table";
  onChange: (view: "chart" | "table") => void;
}

const ViewToggle: React.FC<ViewToggleProps> = ({ view, onChange }) => {
  return (
    <div className="inline-flex border rounded-lg overflow-hidden text-sm">
      <button
        className={`px-4 py-1 ${
          view === "chart" ? "bg-gray-800 text-white" : "bg-white text-gray-800"
        }`}
        onClick={() => onChange("chart")}
      >
        Chart
      </button>
      <button
        className={`px-4 py-1 ${
          view === "table" ? "bg-gray-800 text-white" : "bg-white text-gray-800"
        }`}
        onClick={() => onChange("table")}
      >
        Table
      </button>
    </div>
  );
};

export default ViewToggle;
