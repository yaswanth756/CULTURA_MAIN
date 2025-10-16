
import React, { useEffect, useState, useCallback } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X, Coins } from 'lucide-react';

const SHOW_KEY = 'coinsCampaignLastShown';

const CoinsCampaignModal = () => {
  const [open, setOpen] = useState(false);

  const shouldShowToday = useCallback(() => {
    const last = localStorage.getItem(SHOW_KEY);
    const today = new Date().toDateString();
    return last !== today;
  }, []);

  useEffect(() => {
    if (!shouldShowToday()) return;
    const t = setTimeout(() => setOpen(true), 100);
    return () => clearTimeout(t);
  }, [shouldShowToday]);

  const close = () => {
    localStorage.setItem(SHOW_KEY, new Date().toDateString());
    setOpen(false);
  };

  if (!open) return null;

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="coins-modal"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4 backdrop-blur-[0.5px]"
          style={{ backgroundColor: 'rgba(0,0,0,0.35)' }}
          onClick={close}
          aria-label="Coins campaign backdrop"
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="coins-title"
            onClick={(e) => e.stopPropagation()}
            initial={{ opacity: 0, y: 10, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 260, damping: 22 }}
            className="relative w-full max-w-sm rounded-2xl bg-white shadow-2xl ring-1 ring-slate-200"
          >
            {/* Close */}
            <button
              onClick={close}
              className="absolute right-3.5 top-3.5 inline-flex h-8 w-8 items-center justify-center rounded-full text-black hover:bg-slate-100 hover:text-slate-700 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>

            {/* Header */}
       
<div className="px-6 pt-10 pb-8 text-center">
  <motion.div
    animate={{ rotateY: [0, 180, 360] }}
    transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
    className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-amber-100"
  >
    <Coins className="h-8 w-8 text-amber-600" />
  </motion.div>
  
  <h2 id="coins-title" className="text-2xl font-semibold text-slate-900">
    Utsav Coins
  </h2>
  <p className="mt-3 text-base text-gray-600">
    Give a review after your booking — get coins.
  </p>
  <p className="mt-3 text-base text-gray-600">
  Designed to add real value.
  </p>
</div>



            {/* Actions */}
            <div className="px-6 pb-6">
              <button
                onClick={close}
                className="w-full rounded-full border border-black px-6 py-3 text font-medium  focus-visible:ring-2  transition-all duration-200"
              >
                Got it
              </button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CoinsCampaignModal;

