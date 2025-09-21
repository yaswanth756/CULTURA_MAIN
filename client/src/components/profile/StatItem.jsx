import React from "react";

const StatItem = ({ label, value }) => (
  <div className="flex justify-between items-center">
    <span className="text-gray-600 text-sm">{label}</span>
    <span className="font-semibold">{value}</span>
  </div>
);

export default StatItem;
