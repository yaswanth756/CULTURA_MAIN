import React, { useState } from "react";
import axios from "axios";
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

  // ================= HANDLE INPUT =================
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  // ================= VALIDATION =================
  const validateEmail = (email) => /^\S+@\S+\.\S+$/.test(email);

  // ================= SEND OTP =================
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
        "http://localhost:3000/api/auth/send-otp",
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

  // ================= VERIFY OTP =================
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
        "http://localhost:3000/api/auth/verify-otp",
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

      const redirectPath = location.pathname || "/";
      navigate(redirectPath, { replace: true });
      window.location.reload(); 
    } catch (err) {
      setError(err.response?.data?.message || "Failed to verify OTP");
    } finally {
      setLoading(false);
    }
  };

  // ================= HANDLE GOOGLE LOGIN =================
  const handleGoogleLogin = () => {
    // Logic will be added later (OAuth / Firebase / Backend)
    alert("Google login clicked");
  };

  return (
    <div className="w-full max-w-md mx-auto bg-white py-6">
      <form
        onSubmit={step === 1 ? handleSendOtp : handleSubmit}
        className="space-y-5"
      >
        {error && (
          <p className="text-red-600 text-sm rounded-md">{error}</p>
        )}

        {step === 1 ? (
          // EMAIL FIELD
          <div className="relative">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <div className="flex items-center">
              <Mail className="absolute left-3 top-9 w-5 h-5 text-gray-400" />
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-anzac-500 text-gray-800 text-sm sm:text-base disabled:bg-gray-100"
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
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                OTP
              </label>
              <div className="flex items-center">
                <Lock className="absolute left-3 top-9 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  id="otp"
                  name="otp"
                  value={formData.otp}
                  onChange={handleChange}
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-anzac-500 text-gray-800 text-sm sm:text-base disabled:bg-gray-100"
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
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Name
                  </label>
                  <div className="flex items-center">
                    <User className="absolute left-3 top-9 w-5 h-5 text-gray-400" />
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-anzac-500 text-gray-800 text-sm sm:text-base disabled:bg-gray-100"
                      placeholder="Enter your name"
                      disabled={loading}
                    />
                  </div>
                </div>

                {/* PHONE */}
                <div className="relative">
                  <label
                    htmlFor="phone"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Phone
                  </label>
                  <div className="flex items-center">
                    <Phone className="absolute left-3 top-9 w-5 h-5 text-gray-400" />
                    <input
                      type="tel"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={handleChange}
                      className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-anzac-500 text-gray-800 text-sm sm:text-base disabled:bg-gray-100"
                      placeholder="Enter your phone number"
                      disabled={loading}
                    />
                  </div>
                </div>
                <p className="text-sm text-gray-600 mb-4">
                  OTP sent to{" "}
                  <span className="font-medium text-anzac-600">
                    {formData.email}
                  </span>
                </p>
              </>
            )}

            {/* BACK BUTTON */}
            <button
              type="button"
              onClick={() => (setStep(1), setError(""), setSuccess(""))}
              className="w-full py-2 px-4 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-full transition duration-200 text-sm sm:text-base flex items-center justify-center"
              disabled={loading}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Email
            </button>
          </>
        )}

        {/* SUBMIT BUTTON */}
        <button
          type="submit"
          className="w-full py-2 px-4 bg-anzac-500 text-white rounded-full transition duration-200 text-sm sm:text-base flex items-center justify-center hover:bg-anzac-600"
          disabled={loading}
        >
          {loading ? (
            "Processing..."
          ) : step === 1 ? (
            <>
              <Send className="w-5 h-5 mr-2" />
              Send OTP
            </>
          ) : isSignup ? (
            <>
              <UserPlus className="w-5 h-5 mr-2" />
              Sign Up
            </>
          ) : (
            <>
              <LogIn className="w-5 h-5 mr-2" />
              Login
            </>
          )}
        </button>
      </form>

      {/* OR SEPARATOR */}
      <div className="flex items-center my-4">
        <div className="flex-grow h-px bg-gray-300"></div>
        <span className="px-3 text-sm text-gray-500">or</span>
        <div className="flex-grow h-px bg-gray-300"></div>
      </div>

      {/* GOOGLE LOGIN BUTTON */}
      <button
        onClick={handleGoogleLogin}
        className="w-full py-2 px-4 border border-gray-300 rounded-full flex items-center justify-center space-x-2 hover:bg-gray-50 transition duration-200 text-sm sm:text-base"
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
