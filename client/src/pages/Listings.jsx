/* src/pages/Listings.jsx */
import React, { useState } from 'react';
import ResultsGrid from '../components/ListingsPage/ResultsGrid';

const Listings = () => {
  const [location,setLocation]=useState("");
  return (
    <div className="min-h-screen">
      <div className='bg-gray-50'>

      </div>
      {/* No more fixed sidebar - everything is now integrated into ResultsGrid */}
      <ResultsGrid />
    </div>
  );
};

export default Listings;
