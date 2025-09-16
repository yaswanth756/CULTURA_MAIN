// src/context/EventContext.jsx
import { createContext, useContext, useState } from "react";

const EventContext = createContext();

export const EventProvider = ({ children }) => {
  const [formData, setFormData] = useState({
    location: "",
    date: "",
    eventType: "",
  });

  const value = {
    formData,
    setFormData,
  };

  return <EventContext.Provider value={value}>{children}</EventContext.Provider>;
};

export const useEventContext = () => useContext(EventContext);
