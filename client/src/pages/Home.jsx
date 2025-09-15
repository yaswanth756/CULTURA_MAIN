import React from 'react'
import HeroSection from '../components/HeroSection'
import Services from '../components/Services'
import WorkShowcase from '../components/WorkShowcase'
import AboutUs from '../components/AboutUs'
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
