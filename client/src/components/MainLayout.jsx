import React from 'react';
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import LoginModal from './Login/LoginModel';
import CoinsCampaignModal from './CoinsCampaignModal'; // 🔥 Add this

const MainLayout = () => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />

      {/* All nested routes will render here */}
      <main className="flex-grow">
        <Outlet />
      </main>

      {/* Modals */}
      <LoginModal />
      <CoinsCampaignModal /> {/* 🔥 Add this */}
    </div>
  );
};

export default MainLayout;
