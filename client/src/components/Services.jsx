import React, { useEffect } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';

const Services = () => {
  useEffect(() => {
    AOS.init({
      duration: 1200,
      easing: 'ease-out-cubic',
      once: false,
      mirror: false,
      offset: 50,
      delay: 0,
      disable: false,
      startEvent: 'DOMContentLoaded',
      initClassName: 'aos-init',
      animatedClassName: 'aos-animate',
      useClassNames: false,
      disableMutationObserver: false,
      debounceDelay: 50,
      throttleDelay: 99,
    });

    // Refresh AOS when component updates
    return () => AOS.refresh();
  }, []);

  const services = [
    {
      title: "Birthday",
      slug: "birthday",
      image: "https://plus.unsplash.com/premium_photo-1692880429643-c0f3c9489046?w=900&auto=format&fit=crop&q=60",
      subcategories: ["Rooms", "Catering", "Cakes", "Decorations"],
    },
    {
      title: "Wedding", 
      slug: "wedding",
      image: "https://plus.unsplash.com/premium_photo-1663076211121-36754a46de8d?w=900&auto=format&fit=crop&q=60",
      subcategories: ["Venues", "Photography", "Makeup", "Decor"],
    },
    {
      title: "House Ceremony",
      slug: "house-ceremony", 
      image: "https://media.istockphoto.com/id/1279427161/photo/boiling-the-milk-for-indian-traditional-housewarming.jpg?s=612x612&w=0&k=20&c=K8yBqA4b9TgZstapFToWbsAtgP_gT_ufpH5104Ghp1w=",
      subcategories: ["Priests", "Catering", "Mandap", "Music"],
    },
  ];

  return (
    <>
      <style jsx>{`
        /* Ultra-smooth custom CSS */
        [data-aos] {
          transition-property: transform, opacity, filter;
          transition-timing-function: cubic-bezier(0.25, 0.46, 0.45, 0.94);
          will-change: transform, opacity;
          backface-visibility: hidden;
          perspective: 1000px;
          transform-style: preserve-3d;
        }

        .smooth-card {
          transform: translateZ(0);
          transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        }

        .smooth-card:hover {
          transform: translateZ(0) translateY(-8px);
          box-shadow: 0 25px 50px rgba(0, 0, 0, 0.15);
        }

        /* Custom smooth animations */
        [data-aos="smooth-fade-up"] {
          transform: translate3d(0, 60px, 0);
          opacity: 0;
        }

        [data-aos="smooth-fade-up"].aos-animate {
          transform: translate3d(0, 0, 0);
          opacity: 1;
        }

        [data-aos="smooth-scale"] {
          transform: scale3d(0.8, 0.8, 1);
          opacity: 0;
        }

        [data-aos="smooth-scale"].aos-animate {
          transform: scale3d(1, 1, 1);
          opacity: 1;
        }

        /* Smooth stagger effect */
        .stagger-container > * {
          transition-delay: calc(var(--stagger-delay, 0) * 0.1s);
        }
      `}</style>

      <div className="py-16 px-6 bg-gray-50 pb-28">
        <div 
          className="mb-14 space-y-2" 
          data-aos="smooth-fade-up"
          data-aos-duration="1000"
          data-aos-easing="ease-out-cubic"
        >
          <h2 className="text-3xl font-medium text-center text-gray-800">
            Celebrate in Style
          </h2>
          <div 
            className="w-32 h-1 mx-auto mb-14 bg-gradient-to-r from-anzac-400 via-anzac-500 to-anzac-600 rounded-full"
            data-aos="smooth-scale"
            data-aos-delay="300"
            data-aos-duration="800"
          />
        </div>

        <div className="grid md:grid-cols-3 gap-8 stagger-container">
          {services.map((service, index) => (
            <div
              key={index}
              data-aos="smooth-fade-up"
              data-aos-delay={index * 150}
              data-aos-duration="1000"
              data-aos-easing="ease-out-cubic"
              className="smooth-card relative bg-gradient-to-tr from-anzac-50 via-white to-anzac-100 rounded-2xl shadow-lg overflow-hidden group"
              style={{ '--stagger-delay': index }}
            >
              <div className="h-56 overflow-hidden">
                <img
                  src={service.image}
                  alt={service.title}
                  className="w-full h-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
                />
              </div>

              <div className="p-6 text-center">
                <h3 className="text-xl font-semibold text-gray-800 mb-4">
                  {service.title}
                </h3>

                <div className="flex flex-wrap justify-center gap-2 mb-6">
                  {service.subcategories.map((sub, i) => (
                    <span
                      key={i}
                      className="px-4 py-1 text-sm bg-anzac-50 text-anzac-700 rounded-full border border-anzac-200 hover:bg-anzac-100 transition-all duration-300"
                    >
                      {sub}
                    </span>
                  ))}
                </div>

                <button
                  onClick={() => (window.location.href = `/browse?type=${service.slug}`)}
                  className="px-6 py-2 bg-anzac-500 text-white rounded-full shadow-md hover:bg-anzac-600 hover:scale-105 transition-all duration-300 ease-out"
                >
                  Plan Now
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
};

export default Services;
