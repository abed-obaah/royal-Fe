import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../assets/RoyaFi_2.png";
import { resetPassword, ResetPasswordRequest } from "@/api/auth";

export default function ResetPassword() {
  const [formData, setFormData] = useState({
    email: "",
    code: "",
    password: "",
    password_confirmation: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.email || !formData.code || !formData.password || !formData.password_confirmation) {
      setError("All fields are required.");
      return;
    }

    if (formData.password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    if (formData.password !== formData.password_confirmation) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setError("");
      setLoading(true);
      
      const requestData: ResetPasswordRequest = {
        email: formData.email.trim(),
        code: formData.code,
        password: formData.password,
        password_confirmation: formData.password_confirmation
      };
      
      await resetPassword(requestData);
      setSuccess(true);
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate("/");
      }, 3000);
      
    } catch (err: any) {
      console.error("Password reset error:", err);
      
      if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("Failed to reset password. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen flex flex-col lg:flex-row">
        <div className="w-full lg:w-1/2 bg-gradient-to-b from-[#1c2024] via-[#1d2125] to-[#1e2226] text-white flex flex-col justify-center px-4 sm:px-6 md:px-12 lg:px-16 xl:px-20 py-8 lg:py-0">
          <div className="max-w-md mx-auto w-full text-center">
            <div className="w-20 h-20 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
              </svg>
            </div>
            
            <h1 className="text-2xl sm:text-3xl font-semibold mb-4 text-green-400">
              Password Reset Successfully!
            </h1>
            
            <p className="text-gray-300 text-sm sm:text-base mb-8">
              Your password has been updated successfully. You will be redirected to the login page shortly.
            </p>
            
            <Link to="/">
              <Button className="hover:bg-[#20475bcf] w-full sm:w-64 h-12 text-sm sm:text-base rounded-full bg-[#20475a] font-medium text-[#009ad2] transition-colors duration-200">
                Go to Login
              </Button>
            </Link>
          </div>
        </div>
        
        {/* Right Section */}
        <div className="w-full lg:w-1/2 bg-gradient-to-r from-[#1d6c8f] via-[#167da8] to-[#0197cd] flex items-center justify-center py-8 lg:py-0 min-h-[40vh] lg:min-h-screen">
          <div className="text-center text-white">
            <img src={logo} alt="RoyaFi Logo" className="h-24 w-24 lg:h-32 lg:w-32 mx-auto mb-4" />
            <h2 className="text-xl font-bold">Welcome Back!</h2>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Section - Reset Form */}
      <div className="w-full lg:w-1/2 bg-gradient-to-b from-[#1c2024] via-[#1d2125] to-[#1e2226] text-white flex flex-col justify-center px-4 sm:px-6 md:px-12 lg:px-16 xl:px-20 py-8 lg:py-0">
        {/* Logo for mobile */}
        <div className="lg:hidden flex justify-center mb-6">
          <img
            src={logo}
            alt="RoyaFi Logo"
            className="h-20 w-20 sm:h-24 sm:w-24 object-contain"
          />
        </div>

        <div className="max-w-md mx-auto w-full lg:max-w-none">
          <h1 className="text-2xl sm:text-3xl font-semibold mb-4 sm:mb-6 text-center lg:text-left">
            Reset Password
          </h1>
          
          <Card className="bg-transparent border-0 shadow-none">
            <CardContent className="p-0">
              <form onSubmit={handleSubmit} className="space-y-4">
                <p className="text-gray-400 text-sm sm:text-base mb-4 text-center lg:text-left">
                  Enter your email, the OTP code you received, and your new password.
                </p>
                
                {/* Email Field */}
                <div className="flex items-center gap-2 bg-gray-800 rounded px-3 h-12 sm:h-14">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                  <Input
                    type="email"
                    name="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={handleChange}
                    className="bg-transparent border-none text-white focus:ring-0 h-full flex-1 placeholder-gray-400 text-sm sm:text-base"
                    disabled={loading}
                    required
                  />
                </div>

                {/* OTP Code Field */}
                <div className="flex items-center gap-2 bg-gray-800 rounded px-3 h-12 sm:h-14">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0 flex items-center justify-center">
                    <span className="text-xs">#</span>
                  </div>
                  <Input
                    type="text"
                    name="code"
                    placeholder="Enter 6-digit OTP code"
                    value={formData.code}
                    onChange={handleChange}
                    className="bg-transparent border-none text-white focus:ring-0 h-full flex-1 placeholder-gray-400 text-sm sm:text-base"
                    disabled={loading}
                    maxLength={6}
                    required
                  />
                </div>

                {/* New Password Field */}
                <div className="flex items-center gap-2 bg-gray-800 rounded px-3 h-12 sm:h-14">
                  <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="New password (min. 6 characters)"
                    value={formData.password}
                    onChange={handleChange}
                    className="bg-transparent border-none text-white focus:ring-0 h-full flex-1 placeholder-gray-400 text-sm sm:text-base"
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-gray-400 hover:text-gray-300 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Confirm Password Field */}
                <div className="flex items-center gap-2 bg-gray-800 rounded px-3 h-12 sm:h-14">
                  <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                  <Input
                    type={showConfirmPassword ? "text" : "password"}
                    name="password_confirmation"
                    placeholder="Confirm new password"
                    value={formData.password_confirmation}
                    onChange={handleChange}
                    className="bg-transparent border-none text-white focus:ring-0 h-full flex-1 placeholder-gray-400 text-sm sm:text-base"
                    disabled={loading}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="text-gray-400 hover:text-gray-300 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                {/* Error Message */}
                {error && (
                  <div className="p-3 bg-red-900/30 border border-red-600 rounded-lg">
                    <p className="text-red-400 text-sm flex items-center gap-2">
                      <span className="w-2 h-2 bg-red-400 rounded-full flex-shrink-0"></span>
                      {error}
                    </p>
                  </div>
                )}

                <div className="flex flex-col items-center space-y-4 mt-6">
                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center w-full">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="hover:bg-[#20475bcf] w-full sm:w-48 lg:w-56 xl:w-64 h-11 sm:h-12 text-sm sm:text-base inline-flex items-center justify-center rounded-full bg-[#20475a] px-4 py-2 font-medium text-[#009ad2] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                    >
                      {loading ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Resetting...
                        </span>
                      ) : (
                        "Reset Password"
                      )}
                    </Button>

                    <Link to="/" className="w-full sm:w-auto">
                      <Button
                        type="button"
                        variant="secondary"
                        className="bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-full w-full sm:w-48 lg:w-56 xl:w-64 h-11 sm:h-12 text-sm sm:text-base transition-colors duration-200"
                        disabled={loading}
                      >
                        Back to Login
                      </Button>
                    </Link>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Additional Help Info */}
          <div className="mt-6 p-4 bg-gray-800/30 border border-gray-700 rounded-lg">
            <h3 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
              Remember your OTP?
            </h3>
            <p className="text-xs text-gray-400">
              The OTP code was sent to your email and is valid for 15 minutes. Need a new code?{" "}
              <Link to="/recover" className="text-blue-400 hover:text-blue-300 underline">
                Request a new OTP
              </Link>
            </p>
          </div>
        </div>
      </div>

      {/* Right Section - Brand Area */}
      <div className="w-full lg:w-1/2 bg-gradient-to-r from-[#1d6c8f] via-[#167da8] to-[#0197cd] flex items-center justify-center py-8 lg:py-0 min-h-[40vh] sm:min-h-[50vh] lg:min-h-screen">
        <div className="text-center text-white px-4 sm:px-8">
          {/* Logo for desktop */}
          <div className="hidden lg:flex items-center justify-center mb-8">
            <img
              src={logo}
              alt="RoyaFi Logo"
              className="h-32 w-32 xl:h-48 xl:w-48 object-contain transition-transform duration-300 hover:scale-105"
            />
          </div>
          
          {/* Security Info */}
          <div className="max-w-md mx-auto">
            <div className="hidden lg:block p-6 bg-white/10 rounded-lg backdrop-blur-sm">
              <h3 className="text-xl font-bold mb-4">Secure Password Reset</h3>
              <div className="space-y-4 text-left text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">🔐</div>
                  <div>
                    <p className="font-semibold">Strong Password</p>
                    <p className="opacity-90">Use at least 6 characters for better security</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">⏱️</div>
                  <div>
                    <p className="font-semibold">Quick Process</p>
                    <p className="opacity-90">OTP codes expire after 15 minutes</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">✓</div>
                  <div>
                    <p className="font-semibold">Instant Access</p>
                    <p className="opacity-90">Login immediately after reset</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile-friendly security info */}
            <div className="lg:hidden bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <h3 className="text-base font-bold mb-3">Secure Reset</h3>
              <div className="grid grid-cols-1 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-xs">🔐</span>
                  <span>Use 6+ character password</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs">⏱️</span>
                  <span>OTP valid for 15 minutes</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs">✓</span>
                  <span>Login immediately after reset</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}