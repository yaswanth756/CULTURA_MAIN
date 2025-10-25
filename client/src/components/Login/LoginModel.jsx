// LoginSignUpModal.jsx - RESPONSIVE OPTIMIZED
import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import LoginForm from './LoginForm';
import { useEventContext } from "../../context/EventContext";

const LoginModal = () => {
  const {isModelOpen, setModelOpen} = useEventContext();
  
  if(!isModelOpen){
    return null;
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-xl py-3 sm:py-4 w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="relative flex items-center justify-center border-b p-3 sm:p-4">
          {/* X button on the left */}
          <button 
            className="absolute left-4 sm:left-6 lg:left-8 min-w-[44px] min-h-[44px] flex items-center justify-center" 
            onClick={() => {setModelOpen(false)}}
            aria-label="Close modal"
          >
            <X className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>

          {/* Centered title */}
          <h2 className="text-base sm:text-lg font-semibold">Login or Signup</h2>
        </div>

        {/* Modal body */}
        <div className="py-4 sm:py-5 px-6 sm:px-8 lg:px-10 space-y-3">
          <h1 className='text-xl sm:text-2xl font-semibold'>
            Welcome to <span className='text-anzac-500'>Utsavlokam</span>
          </h1>

          <LoginForm setModelOpen={setModelOpen} />
        </div>

        {/* Footer */}
        <div className="px-6 sm:px-8 py-3 sm:py-4 bg-gray-50 border-t border-gray-100 rounded-b-2xl">
          <p className="text-xs text-gray-500 text-center leading-relaxed">
            By continuing, you agree to our{' '}
            <a href="/terms-and-conditions" target="_blank" rel="noopener noreferrer" className="text-anzac-500 hover:text-anzac-600 underline">
              Terms of Service
            </a>
            {' '}and{' '}
            <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-anzac-500 hover:text-anzac-600 underline">
              Privacy Policy
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginModal;
