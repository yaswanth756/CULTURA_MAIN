import React, { createContext, useContext, useState, useEffect } from "react";
import axios, { AxiosError } from "axios";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    
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
      const response = await axios.get("http://localhost:3000/api/auth/profile");
      setUser(response.data);
      console.log(response.data)
    } catch (error) {
      if (error instanceof AxiosError) {
        console.error("Error fetching user profile:", error.response?.data || error.message);
      } else {
        console.error("Error fetching user profile:", error);
      }
        logout();
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
    window.location.href = "/"; // Redirect to login page
  };

  return (
    <AuthContext.Provider value={{ user, logout, isLoading,setIsLoading }}>
      {children}
    </AuthContext.Provider>
  );
};

// custom hook
export const useAuth = () => useContext(AuthContext);
