import React from "react";
import AOS from "aos";
import "aos/dist/aos.css";
//import herobg from "../../assets/hero-bg.avif";
import SearchForm from "./SearchFrom";

const herobg="https://img.freepik.com/premium-vector/gilded-harmony-intricate-line-mandala-with-gold-accents-blank-horizontal-vector-background-design_179530-1254.jpg?w=2000"
AOS.init(); // Initialize once

const HeroSection = () => {
  return (
    <section
      className="relative h-[65vh] sm:h-[75vh] md:h-[90vh] flex items-center justify-center bg-cover bg-center"
      style={{ backgroundImage: `url(${herobg})` }} //https://www.freepik.com/free-vector/background-template-with-mandala-pattern-design_8390437.htm#fromView=keyword&page=2&position=3&uuid=2955fe4f-fc5f-4989-a461-30d940c92e83&query=Decorative+background
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/20"></div>

      {/* Content */}
      <div
        className="relative z-10 text-center text-white px-4"
        data-aos="fade-up"
        data-aos-duration="1000"
      >
        <h1 className="text-3xl md:text-6xl font-bold mb-4">
          Find Everything for Your Event
        </h1>
        <p className="text-base md:text-xl mb-6">
          Discover vendors, book instantly, celebrate endlessly.
        </p>

        {/* Extracted Search Form */}
        <SearchForm />
      </div>
    </section>
  );
};

export default HeroSection;
