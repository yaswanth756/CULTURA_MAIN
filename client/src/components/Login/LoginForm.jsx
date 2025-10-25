// LoginForm.jsx - RESPONSIVE OPTIMIZED
import React, { useState } from "react";
import axios from "axios";
import { buildApiUrl } from "../../utils/api";
import { useGoogleLogin } from '@react-oauth/google';
import {
  Mail,
  Lock,
  User,
  Phone,
  Send,
  UserPlus,
  LogIn,
  ArrowLeft,
} from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const LoginForm = ({ setModelOpen }) => {
  const [formData, setFormData] = useState({
    email: "",
    otp: "",
    name: "",
    phone: "",
  });
  const navigate = useNavigate();
  const location = useLocation();
  const [step, setStep] = useState(1);
  const [isSignup, setIsSignup] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  // Google Login Handler
  const googleLogin = useGoogleLogin({
    onSuccess: async (tokenResponse) => {
      try {
        setLoading(true);
        
        const userInfoResponse = await axios.get(
          'https://www.googleapis.com/oauth2/v3/userinfo',
          {
            headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
          }
        );

        const { email, name, picture, sub } = userInfoResponse.data;

        const { data } = await axios.post(
          buildApiUrl("/api/auth/google-auth"),
          { 
            email,
            name,
            picture,
            googleId: sub
          }
        );

        localStorage.setItem("token", data.token);
        setSuccess(data.message);

        setFormData({ email: "", otp: "", name: "", phone: "" });
        setStep(1);
        setIsSignup(false);
        setModelOpen(false);

        const redirectUrl = localStorage.getItem('redirectUrl');
        if (redirectUrl) {
          localStorage.removeItem('redirectUrl');
          navigate(redirectUrl, { replace: true });
        } else {
          navigate(location.pathname || "/", { replace: true });
        }

        window.location.reload();
      } catch (err) {
        console.error('Google login error:', err);
        setError(err.response?.data?.message || "Failed to login with Google");
      } finally {
        setLoading(false);
      }
    },
    onError: () => {
      setError("Google login failed. Please try again.");
    }
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const validateEmail = (email) => /^\S+@\S+\.\S+$/.test(email);

  const handleSendOtp = async (e) => {
    e.preventDefault();
    if (!formData.email) {
      setError("Email is required.");
      return;
    }
    if (!validateEmail(formData.email)) {
      setError("Please enter a valid email address.");
      return;
    }

    setLoading(true);
    try {
      const { data } = await axios.post(
        buildApiUrl("/api/auth/send-otp"),
        { email: formData.email },
        { headers: { "Content-Type": "application/json" } }
      );

      setIsSignup(!data.isExistingUser);
      setStep(2);
      setSuccess(data.message);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");
  
    if (!formData.email || !formData.otp) {
      setError("All required fields must be filled.");
      return;
    }
  
    if (isSignup && (!formData.name || !formData.phone)) {
      setError("Name and Phone are required for signup.");
      return;
    }
  
    setLoading(true);
    try {
      const { data } = await axios.post(
        buildApiUrl("/api/auth/verify-otp"),
        {
          email: formData.email,
          otp: formData.otp,
          firstName: formData.name,
          phone: formData.phone,
        },
        { headers: { "Content-Type": "application/json" } }
      );
  
      localStorage.setItem("token", data.token);
      setSuccess(data.message);
  
      setFormData({ email: "", otp: "", name: "", phone: "" });
      setStep(1);
      setIsSignup(false);
      setModelOpen(false);
  
      const redirectUrl = localStorage.getItem('redirectUrl');
      
      if (redirectUrl) {
        localStorage.removeItem('redirectUrl');
        navigate(redirectUrl, { replace: true });
      } else {
        const redirectPath = location.pathname || "/";
        navigate(redirectPath, { replace: true });
      }
      
      window.location.reload();
      
    } catch (err) {
      setError(err.response?.data?.message || "Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    googleLogin();
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white py-4 sm:py-6">
      <form
        onSubmit={step === 1 ? handleSendOtp : handleSubmit}
        className="space-y-4 sm:space-y-5"
      >
        {error && (
          <p className="text-red-600 text-xs sm:text-sm bg-red-50 p-3 rounded-lg border border-red-200">
            {error}
          </p>
        )}

        {step === 1 ? (
          // EMAIL FIELD
          <div className="relative">
            <label
              htmlFor="email"
              className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2"
            >
              Email
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 sm:pl-11 pr-3 sm:pr-4 py-2.5 sm:py-3 min-h-[48px] border border-gray-300 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-anzac-500 focus:border-transparent text-gray-800 text-sm sm:text-base disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
                placeholder="Enter your email"
                disabled={loading}
              />
            </div>
          </div>
        ) : (
          <>
            {/* OTP FIELD */}
            <div className="relative">
              <label
                htmlFor="otp"
                className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2"
              >
                OTP
              </label>
              <div className="relative flex items-center">
                <Lock className="absolute left-3 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none" />
                <input
                  type="text"
                  id="otp"
                  name="otp"
                  value={formData.otp}
                  onChange={handleChange}
                  className="w-full pl-10 sm:pl-11 pr-3 sm:pr-4 py-2.5 sm:py-3 min-h-[48px] border border-gray-300 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-anzac-500 focus:border-transparent text-gray-800 text-sm sm:text-base disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
                  placeholder="Enter the OTP"
                  disabled={loading}
                />
              </div>
            </div>

            {/* SIGNUP EXTRA FIELDS */}
            {isSignup && (
              <>
                {/* NAME */}
                <div className="relative">
                  <label
                    htmlFor="name"
                    className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2"
                  >
                    Name
                  </label>
                  <div className="relative flex items-center">
                    <User className="absolute left-3 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none" />
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full pl-10 sm:pl-11 pr-3 sm:pr-4 py-2.5 sm:py-3 min-h-[48px] border border-gray-300 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-anzac-500 focus:border-transparent text-gray-800 text-sm sm:text-base disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
                      placeholder="Enter your name"
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* PHONE */}
                <div className="relative">
                  <label
                    htmlFor="phone"
                    className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5 sm:mb-2"
                  >
                    Phone
                  </label>
                  <div className="relative flex items-center">
                    <Phone className="absolute left-3 w-4 h-4 sm:w-5 sm:h-5 text-gray-400 pointer-events-none" />
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full pl-10 sm:pl-11 pr-3 sm:pr-4 py-2.5 sm:py-3 min-h-[48px] border border-gray-300 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-anzac-500 focus:border-transparent text-gray-800 text-sm sm:text-base disabled:bg-gray-100 disabled:cursor-not-allowed transition-all"
                      placeholder="Enter your phone number"
                      disabled={loading}
                    />
                  </div>
                </div>
              </>
            )}

            {/* BACK BUTTON */}
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setError("");
                setSuccess("");
              }}
              className="w-full min-h-[48px] py-2.5 sm:py-3 px-4 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-xl sm:rounded-full transition duration-200 text-sm sm:text-base flex items-center justify-center font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={loading}
            >
              <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Back to Email
            </button>
          </>
        )}

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          className="w-full min-h-[48px] py-2.5 sm:py-3 px-4 bg-anzac-500 text-white rounded-xl sm:rounded-full hover:bg-anzac-600 transition duration-200 text-sm sm:text-base flex items-center justify-center font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
          disabled={loading}
        >
          {loading ? (
            "Processing..."
          ) : step === 1 ? (
            <>
              <Send className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Send OTP
            </>
          ) : isSignup ? (
            <>
              <UserPlus className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Sign Up
            </>
          ) : (
            <>
              <LogIn className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
              Login
            </>
          )}
        </button>
      </form>

      {/* OR SEPARATOR */}
      <div className="flex items-center my-4 sm:my-5">
        <div className="flex-grow h-px bg-gray-300"></div>
        <span className="px-3 text-xs sm:text-sm text-gray-500">or</span>
        <div className="flex-grow h-px bg-gray-300"></div>
      </div>

      {/* GOOGLE LOGIN BUTTON */}
      <button
        onClick={handleGoogleLogin}
        type="button"
        disabled={loading}
        className="w-full min-h-[48px] py-2.5 sm:py-3 px-4 border border-gray-300 rounded-xl sm:rounded-full flex items-center justify-center space-x-2 hover:bg-gray-50 transition duration-200 text-sm sm:text-base disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
      >
        <img
          src="https://www.gstatic.com/marketing-cms/assets/images/d5/dc/cfe9ce8b4425b410b49b7f2dd3f3/g.webp=s96-fcrop64=1,00000000ffffffff-rw"
          alt="Google logo"
          className="w-5 h-5"
        />
        <span className="text-gray-700 font-medium">Continue with Google</span>
      </button>
    </div>
  );
};

export default LoginForm;
