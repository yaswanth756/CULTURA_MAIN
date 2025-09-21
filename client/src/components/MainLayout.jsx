import React, { useState } from 'react'
import Navbar from './Navbar'
import LoginModal from './Login/LoginModel';

const MainLayout = ({ children }) => {
 

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">{children}</main>

      {/* Pass props */}
      <LoginModal />
    </div>
  )
}

export default MainLayout
