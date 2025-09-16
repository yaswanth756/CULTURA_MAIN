/* src/pages/Listings.jsx */
import React from 'react';
import ResultsGrid from '../components/ResultsGrid';

const Listings = () => {
  return (
    <div className="min-h-screen">
      {/* No more fixed sidebar - everything is now integrated into ResultsGrid */}
      <ResultsGrid />
    </div>
  );
};

export default Listings;
