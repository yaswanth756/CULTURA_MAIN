// LoginSignUpModal.jsx
import React, { useEffect } from 'react';
import { X } from 'lucide-react';
import LoginForm from './LoginForm';
import { useEventContext } from "../../context/EventContext";
const LoginModal = () => {
  // Handle ESC key press
  const {isModelOpen,setModelOpen}=useEventContext();
  if(!isModelOpen){
    return " ";
  }
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/50 ">
  <div className="bg-white rounded-3xl shadow-xl py-4 w-full max-w-md">
    {/* Header */}
    <div className="relative flex items-center justify-center border-b p-4">
      {/* X button on the left */}
      <button className="absolute left-0 pl-8" onClick={()=>{setModelOpen(false)}}>
        <X className="h-5 w-5" />
      </button>

      {/* Centered title */}
      <h2 className="text-lg font-semibold">Login or Signup</h2>
      </div>

    {/* Your modal body goes here */}
    <div className="py-5 px-10 space-y-3">
      <h1 className='text-2xl'>Welcome to <span className='text-anzac-500'>Utsavlokam</span></h1>

      <LoginForm setModelOpen={setModelOpen} />

    </div>
  </div>
    </div>

  
  );
};

export default LoginModal;
