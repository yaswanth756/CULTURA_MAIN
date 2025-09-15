import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import AOS from "aos";
import "aos/dist/aos.css";

const rotatingWords = ["creative", "special", "trusted", "seamless"];
const colors = [
  "text-purple-500",
  "text-pink-500",
  "text-anzac-500",
  "text-blue-500",
];

export default function AboutUs() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    // Initialize AOS once
    AOS.init({
      duration: 1000, // animation duration
      once: true, // animate only once
      easing: "ease-in-out",
    });

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % rotatingWords.length);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative w-full bg-gray-50 py-16 px-6 md:px-12 lg:px-20" id="about">
      <div className="grid md:grid-cols-2 items-center gap-20">
        {/* Left Image */}
        <div className="flex justify-center h-full" data-aos="fade-right">
          <img
            src="https://images.pexels.com/photos/3184418/pexels-photo-3184418.jpeg?_gl=1*1sny3y1*_ga*NzUzNDgzOTI3LjE3NTYwOTcwODg.*_ga_8JE65Q40S6*czE3NTc5MTc5ODQkbzgkZzEkdDE3NTc5MTgwMjkkajE1JGwwJGgw"
            alt="About Us"
            className="w-full h-full object-cover rounded-md max-h-[420px] shadow-lg"
          />
        </div>

        {/* Right Content */}
        <div
          className="flex flex-col justify-center h-full max-h-[420px]"
          data-aos="fade-left"
        >
          <p className="text-sm font-semibold text-anzac-500 tracking-wider mb-2">
            WHO WE ARE
          </p>

          <h2 className="text-3xl sm:text-4xl font-medium mb-8 flex items-center flex-wrap gap-3">
            We’re
            <span className="relative inline-block min-w-[200px] overflow-hidden h-[40px]">
              <AnimatePresence mode="wait">
                <motion.span
                  key={index}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -40 }}
                  transition={{ duration: 0.6, ease: "easeInOut" }}
                  className={`absolute left-0 font-medium ${colors[index % colors.length]}`}
                >
                  {rotatingWords[index]}
                </motion.span>
              </AnimatePresence>
            </span>
          </h2>

          <p className="text-gray-600 leading-relaxed mb-4" data-aos="fade-up">
            We bring together trusted vendors and event planners all in one
            place – making it simple for you to discover, compare, and book
            everything you need for weddings, birthdays, and special
            celebrations.
          </p>

          <p className="text-gray-600 leading-relaxed mb-4" data-aos="fade-up" data-aos-delay="200">
            Our mission is to save you time and stress while giving vendors a
            platform to showcase their best work. From venues to catering, décor,
            and photography – we help turn every moment into a lasting memory.
          </p>
        </div>
      </div>
    </section>
  );
}
