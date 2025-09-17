import React, { useState } from 'react'
import Navbar from './Navbar'
import LoginModal from './LoginModel';

const MainLayout = ({ children }) => {
  const [isModelOpen, setModelOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">{children}</main>

      {/* Pass props */}
      <LoginModal isModelOpen={isModelOpen}  setModelOpen={setModelOpen} />
    </div>
  )
}

export default MainLayout
