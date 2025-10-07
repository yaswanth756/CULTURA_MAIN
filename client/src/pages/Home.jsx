import React from 'react'
import SEO from '../components/SEO'
import HeroSection from '../components/HomePage/HeroSection'
import Services from '../components/HomePage/Services'
import WorkShowcase from '../components/HomePage/WorkShowcase'
import AboutUs from '../components/HomePage/AboutUs'
import Footer from '../components/Footer'

const Home = () => {
  return (
    <>
      <SEO 
        title="Utsavlokam - Book Event Services | Photography, Catering, Venues & More"
        description="Find and book the best event services for your special occasions. Browse photographers, caterers, venues, decorators, and more. Trusted by thousands across India."
        keywords="event booking, wedding services, photography, catering, event venues, party planning, decorators, event management, wedding photographers, event planners India"
      />
      <HeroSection/>
      <Services/>
      <WorkShowcase/>
      <AboutUs/>
      <Footer/>
    </>
  )
}

export default Home;
