import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Home from './pages/Home';
import MainLayout from './components/MainLayout';
import Test from './pages/Test';

function App() {

  return (
    
    <MainLayout>
        <Routes>
          <Route path="/" element={<Home/>} />
          <Route path="/" element={<Test/>} />
        </Routes>
    </MainLayout>

  
  );
}

export default App
