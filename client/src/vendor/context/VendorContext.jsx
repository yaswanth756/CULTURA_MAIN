import React, { createContext, useContext, useState, useEffect } from "react";
import axios, { AxiosError } from "axios";
import { buildApiUrl } from "../../utils/api";

const VendorContext = createContext(null);

export const VendorProvider = ({ children }) => {
  const [vendor, setVendor] = useState(null);
  const [isLoading, setIsLoading] = useState(true);  // ✅ start true

  useEffect(() => {
    const token = localStorage.getItem("vendorToken");
    
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      fetchUser();
    } else {
      setIsLoading(false); // no token → not loading
    }
  }, []);

  const fetchUser = async () => {
    try {
      const response = await axios.get(buildApiUrl("/api/vendor/profile"));
      
      setVendor(response.data.data);
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error("Error fetching user profile:", error.response?.data || error.message);
      } else {
        console.error("Error fetching user profile:", error);

      }

       
      // logout(); // optional
    } finally {
      setIsLoading(false); // ✅ always stop loading
    }
  };

  const logout = () => {
    localStorage.removeItem("vendorToken");
    setVendor(null);
    window.location.href = "/vendor/login";
  };

  return (
    <VendorContext.Provider value={{ vendor, logout, isLoading }}>
      {children}
    </VendorContext.Provider>
  );
};


// custom hook
export const useVendor = () => useContext(VendorContext);
