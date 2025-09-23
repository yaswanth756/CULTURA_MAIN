import React, { createContext, useContext, useState, useEffect } from "react";
import axios, { AxiosError } from "axios";

const VendorContext = createContext(null);

export const VendorProvider = ({ children }) => {
  const [vendor, setVendor] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("vendorToken");
    
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`;
      fetchUser();
    } else {
      setIsLoading(false);
    }
  }, []);

  const fetchUser = async () => {
    try {
      setIsLoading(true);
      const response = await axios.get("http://localhost:3000/api/vendor/profile");
      setVendor(response.data.data)  // ✅ store just vendor object

    } catch (error) {
      if (error instanceof AxiosError) {
        console.error("Error fetching user profile:", error.response?.data || error.message);
      } else {
        console.error("Error fetching user profile:", error);
      }
        //logout();
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("vendorToken");
    setVendor(null);
    window.location.href = "/vendor/login"; // Redirect to login page
  };

  return (
    <VendorContext.Provider value={{vendor, logout, isLoading,setIsLoading }}>
      {children}
    </VendorContext.Provider>
  );
};

// custom hook
export const useVendor = () => useContext(VendorContext);
