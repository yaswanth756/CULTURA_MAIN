import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from './pages/Home';
import MainLayout from './components/MainLayout';
import Test from './pages/Test';
import Listings from './pages/Listings';
function App() {

  return (
    
    <MainLayout>
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/test" element={<Test/>} />
          <Route path="/browse" element={<Listings/>} />
        
        </Routes>
    </MainLayout>

  
  );
}

export default App
