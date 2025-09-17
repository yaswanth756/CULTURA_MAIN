import React, { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import VideoCard from "./VideoCard";
import VideoModal from "./VideoModal";
import AOS from "aos";
import "aos/dist/aos.css";

const dummyData = [
  {
    id: 1,
    title: "Cinematic Wedding Highlights",
    thumb: "https://images.unsplash.com/photo-1519741497674-611481863552?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
    src: "https://player.vimeo.com/external/397882790.sd.mp4?s=31c68e4d76caef8a8b667a6dcbb0b9e7b6dce99d&profile_id=164&oauth2_token_id=57447761",
    duration: "2:45",
    vendorName: "Eternal Moments Studio",
    rating: 4.9,
    isVerified: true,
    completedBookings: 342
  },
  {
    id: 2,
    title: "Corporate Event Coverage",
    thumb: "https://images.unsplash.com/photo-1515187029135-18ee286d815b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
    src: "https://player.vimeo.com/external/342571552.sd.mp4?s=c52d82b4dd026e6a9d2b7b235362ef8c5d7c0b5c&profile_id=164&oauth2_token_id=57447761",
    duration: "1:58",
    vendorName: "ProEvent Films",
    rating: 4.7,
    isVerified: true,
    completedBookings: 189
  },
  {
    id: 3,
    title: "Birthday Celebration Reel",
    thumb: "https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
    src: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    duration: "1:24",
    vendorName: "Joyful Memories Co.",
    rating: 4.6,
    isVerified: false,
    completedBookings: 145
  },
  {
    id: 4,
    title: "Luxury Reception Highlights",
    thumb: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
    duration: "3:12",
    vendorName: "Elegant Affairs Media",
    rating: 4.8,
    isVerified: true,
    completedBookings: 267
  },
  {
    id: 5,
    title: "Engagement Photo Session",
    thumb: "https://images.unsplash.com/photo-1606216794074-735e91aa2c92?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
    src: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4",
    duration: "0:52",
    vendorName: "Captured Hearts Studio",
    rating: 4.5,
    isVerified: true,
    completedBookings: 98
  },
  {
    id: 6,
    title: "Garden Party Festivities",
    thumb: "https://images.unsplash.com/photo-1530103862676-de8c9debad1d?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
    duration: "1:38",
    vendorName: "Outdoor Productions",
    rating: 4.4,
    isVerified: false,
    completedBookings: 76
  },
  {
    id: 7,
    title: "Traditional Ceremony Coverage",
    thumb: "https://images.unsplash.com/photo-1596701062351-8c2c14d1fdd0?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
    src: "https://player.vimeo.com/external/294738792.sd.mp4?s=45a4de0c2bba3b8cb8aae1fe07a2cd7c9a3b1c2e&profile_id=164&oauth2_token_id=57447761",
    duration: "2:15",
    vendorName: "Heritage Films",
    rating: 4.9,
    isVerified: true,
    completedBookings: 156
  },
  {
    id: 8,
    title: "Destination Wedding Story",
    thumb: "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&q=80",
    src: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4",
    duration: "4:20",
    vendorName: "Wanderlust Weddings",
    rating: 4.8,
    isVerified: true,
    completedBookings: 223
  }
];


const WorkShowcase = ({ items = dummyData }) => {
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const scrollRef = useRef(null);
  const autoScrollRef = useRef(null);

  useEffect(() => {
    AOS.init({ duration: 800, easing: "ease-out-cubic", once: true });
  }, []);

  const openModal = (idx) => {
    setSelectedIndex(idx);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedIndex(null);
  };

  const goNext = () => {
    setSelectedIndex((s) => (s === null ? 0 : (s + 1) % items.length));
  };

  const goPrev = () => {
    setSelectedIndex((s) =>
      s === null ? 0 : (s - 1 + items.length) % items.length
    );
  };

  const scrollBy = (direction = 1) => {
    const el = scrollRef.current;
    if (!el) return;
    const scrollAmount = 320;
    el.scrollBy({ left: direction * scrollAmount, behavior: "smooth" });
  };

  // Auto-scroll
  

  // Keyboard navigation
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") closeModal();
      if (e.key === "ArrowRight") goNext();
      if (e.key === "ArrowLeft") goPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <div className="w-full max-w-8xl  px-10 py-20" id="work">
      {/* Header */}
      <div data-aos="fade-up" className="flex items-center justify-between mb-8">
        <div>
          <h2 className="text-3xl font-medium text-gray-900">Work Showcase</h2>
          <p className="text-gray-600 mt-1">
            Discover amazing work from our verified vendors
          </p>
        </div>
      </div>

      {/* Video Section with Side Scroll Buttons */}
      <div className="relative">
        <button
          data-aos="fade-left"
          onClick={() => scrollBy(-1)}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg hover:bg-white hover:shadow-xl -ml-4"
          aria-label="scroll left"
        >
          <ChevronLeft className="w-6 h-6 text-gray-700" />
        </button>

        <button
          data-aos="fade-right"
          onClick={() => scrollBy(1)}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 p-3 rounded-full bg-white/90 backdrop-blur-sm border border-gray-200 shadow-lg hover:bg-white hover:shadow-xl -mr-4"
          aria-label="scroll right"
        >
          <ChevronRight className="w-6 h-6 text-gray-700" />
        </button>

        {/* Horizontal Video Scroll */}
        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide"
          style={{ scrollBehavior: "smooth" }}
        >
          {items.map((item, idx) => (
            <div key={item.id} data-aos="fade-up" data-aos-delay={idx * 100}>
              <VideoCard item={item} onPlay={() => openModal(idx)} />
            </div>
          ))}
        </div>
      </div>

      {/* Video Modal */}
      <VideoModal
        isOpen={isModalOpen}
        onClose={closeModal}
        currentItem={selectedIndex !== null ? items[selectedIndex] : null}
        currentIndex={selectedIndex}
        totalItems={items.length}
        onNext={goNext}
        onPrev={goPrev}
      />

      <style jsx>{`
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .line-clamp-1 {
          overflow: hidden;
          display: -webkit-box;
          -webkit-box-orient: vertical;
          -webkit-line-clamp: 1;
        }
      `}</style>
    </div>
  );
};

export default WorkShowcase;

