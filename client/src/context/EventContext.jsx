// src/context/EventContext.jsx
import { createContext, useContext, useState } from "react";

const EventContext = createContext();

export const EventProvider = ({ children }) => {
  const [formData, setFormData] = useState({
    location: "",
    date: "",
    eventType: "",
  });
  const [isModelOpen,setModelOpen]=useState(false);
  const value = {
    formData,
    setFormData,
    isModelOpen,
    setModelOpen
  };

  return <EventContext.Provider value={value}>{children}</EventContext.Provider>;
};

export const useEventContext = () => useContext(EventContext);
