import React from "react";

const ScrollButton = ({ direction = "left", onClick }) => {
  return (
    <button
      onClick={onClick}
      className="p-2 bg-gray-200 rounded-full shadow hover:bg-gray-300 transition"
    >
      {direction === "left" ? "←" : "→"}
    </button>
  );
};

export default ScrollButton;
