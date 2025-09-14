import React from 'react'
import Navbar from './Navbar'
const MainLayout = ({children}) => {
  return (
    <div className='flex flex-col min-h-screen'>
      <Navbar/>
      <main className="flex-grow">{children}</main>
    </div>
  )
}

export default MainLayout
