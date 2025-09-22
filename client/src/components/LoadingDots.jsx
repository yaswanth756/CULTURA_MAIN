/* src/components/LoadingDots.jsx */
import React from "react";

const LoadingDots = () => {
  return (
    <div className="flex justify-center items-center h-[500px]">
      <div className="relative w-8 h-8">
        <div className="absolute inset-0 rounded-full border-2 border-gray-200"></div>
        <div className="absolute inset-0 rounded-full border-2 border-black border-t-transparent animate-spin"></div>
      </div>
      
      <style jsx>{`
        .animate-spin {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default LoadingDots;
