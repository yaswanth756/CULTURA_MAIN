/* src/components/LoadingDots.jsx */
import React from "react";

const LoadingDots = () => {
  return (
    <div className="flex justify-center items-center h-[500px]">
      <div className="flex gap-2">
        <div className="w-3 h-3 bg-[#E0B646] rounded-full animate-[bounce_1.4s_infinite_ease-in-out] [animation-delay:0s]"></div>
        <div className="w-3 h-3 bg-[#E0B646] rounded-full animate-[bounce_1.4s_infinite_ease-in-out] [animation-delay:0.2s]"></div>
        <div className="w-3 h-3 bg-[#E0B646] rounded-full animate-[bounce_1.4s_infinite_ease-in-out] [animation-delay:0.4s]"></div>
      </div>
      
      <style jsx>{`
        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
};

export default LoadingDots;
