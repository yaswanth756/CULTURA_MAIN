import React from 'react'
import HeroSection from '../components/HomePage/HeroSection'
import Services from '../components/HomePage/Services'
import WorkShowcase from '../components/HomePage/WorkShowcase'
import AboutUs from '../components/HomePage/AboutUs'
import Footer from '../components/Footer'
const Home = () => {
  return (
    <>
      <HeroSection/>
      <Services/>
      <WorkShowcase/>
      <AboutUs/>
      <Footer/>
    </>
  )
}
export default Home;
