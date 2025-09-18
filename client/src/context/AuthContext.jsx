import React, { createContext, useContext, useState, useEffect } from "react";

import {jwtDecode} from "jwt-decode";

const AuthContext = createContext();



export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
    
const login = (token) => {
    try {
      const decoded = jwtDecode(token);
      localStorage.setItem("token", token);
      setUser(decoded);
  

      // Optional: Auto logout on token expiry
      const expiresIn = decoded.exp * 1000 - Date.now();
      setTimeout(() => {
        logout();
      }, expiresIn);
      
    } catch (err) {
      console.error("Invalid token", err);
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    window.location.href = "/"; // Redirect to login page
    setUser(null);
  };

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const decoded = jwtDecode(token);
        const isExpired = decoded.exp < Math.floor(Date.now() / 1000);

        if (isExpired) {
          logout();
        } else {
          setUser(decoded);
          console.log(decoded)
        }
      } catch (err) {
        logout();
      }
    }
    setTimeout(() => {
      setLoading(false);
    }, 1000); // Simulate loading delay
   
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

// custom hook
export const useAuth = () => useContext(AuthContext);
