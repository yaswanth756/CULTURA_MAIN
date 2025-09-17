/* src/components/LoadingDots.jsx */
import React from "react";

const LoadingDots = () => {
  return (
    <div className="flex justify-center items-center h-[500px]">
      <span className="dot animate-bounce bg-anzac-500 w-3 h-3 rounded-full mx-1"></span>
      <span className="dot animate-bounce delay-150 bg-anzac-500 w-3 h-3 rounded-full mx-1"></span>
      <span className="dot animate-bounce delay-300 bg-anzac-500 w-3 h-3 rounded-full mx-1"></span>
      
      <style jsx>{`
        .dot {
          display: inline-block;
        }
        .animate-bounce {
          animation: bounce 0.6s infinite alternate;
        }
        .delay-150 {
          animation-delay: 0.15s;
        }
        .delay-300 {
          animation-delay: 0.3s;
        }
        @keyframes bounce {
          from { transform: translateY(0); opacity: 0.3; }
          to { transform: translateY(-10px); opacity: 1; }
        }
      `}</style>
    </div>
  );
};

export default LoadingDots;
