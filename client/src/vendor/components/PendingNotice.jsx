// src/vendor/components/PendingNotice.jsx
import React from 'react';

const PendingNotice = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 bg-gray-50">
      <img
        src="https://ik.imagekit.io/jezimf2jod/ChatGPT%20Image%20Sep%2024,%202025,%2009_45_36%20AM.png"
        alt="Pending Notice"
        className="w-full max-w-md rounded-lg shadow-lg"
      />
      <h2 className="mt-6 text-xl font-semibold text-gray-700 text-center">
        Your request is under review
      </h2>
      <p className="mt-2 text-gray-500 text-center">
        We are processing your submission. Please check back later.
      </p>
    </div>
  );
};

export default PendingNotice;
