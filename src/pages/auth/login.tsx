import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/RoyaFi_2.png";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store";
import { setCredentials } from "../../slices/userSlice";
import api from "../../services/axios";

interface LoginResponse {
  success: boolean;
  data: {
    user: {
      id: number;
      name: string;
      email: string;
      role: string;
      created_at: string;
      updated_at: string;
      email_verified_at: string;
    };
    token: string;
  };
}

export default function Login() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleContinue = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (email.trim() === "" || password.trim() === "") {
      setError("Please fill in both email and password.");
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }

    try {
      setError("");
      setLoading(true);

      const response = await api.post("/login", { email, password });

      if (process.env.NODE_ENV === 'development') {
        console.log("Full response:", response);
        console.log("Response data:", response.data);
      }

      const { user, token } = response.data;
      
      if (process.env.NODE_ENV === 'development') {
        console.log("Token extracted:", token);
        console.log("User data:", user);
        console.log("Is admin:", user.role);
      }
      
      if (!token) {
        setError("Invalid response from server.");
        return;
      }

      dispatch(setCredentials({ user, token }));

      if (user.role === "admin") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }
    } catch (err: any) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Login error:", err);
        console.error("Error response:", err.response);
      }
      setError(err.response?.data?.message || "Login failed. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Section - Login Form */}
      <div className="w-full lg:w-1/2 bg-gradient-to-b from-[#1c2024] via-[#1d2125] to-[#1e2226] text-white flex flex-col justify-center px-4 sm:px-8 md:px-12 lg:px-16 xl:px-20 py-8 lg:py-0">
        {/* Logo for mobile - shown above form */}
        <div className="lg:hidden flex justify-center mb-6">
          <img
            src={logo}
            alt="RoyaFi Logo"
            className="h-24 w-24 object-contain"
          />
        </div>

        <div className="max-w-md mx-auto w-full lg:max-w-none">
          <h1 className="text-2xl sm:text-3xl font-semibold mb-4 sm:mb-6 text-center lg:text-left">
            Login
          </h1>
          
          <Card className="bg-transparent border-0 shadow-none">
            <CardContent className="space-y-4 p-0">
              <form onSubmit={handleContinue} className="space-y-4">
                {/* Email Field */}
                <div className="flex items-center gap-2 bg-gray-800 rounded px-3 h-12 sm:h-14">
                  <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                  <Input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="bg-transparent border-none text-white focus:ring-0 h-full flex-1 placeholder-gray-400 text-sm sm:text-base"
                  />
                </div>

                {/* Password Field */}
                <div className="flex items-center gap-2 bg-gray-800 rounded px-3 h-12 sm:h-14 relative">
                  <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="bg-transparent border-none text-white focus:ring-0 h-full flex-1 pr-10 placeholder-gray-400 text-sm sm:text-base"
                  />
                  <div className="absolute right-3">
                    {showPassword ? (
                      <EyeOff
                        className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 cursor-pointer"
                        onClick={() => setShowPassword(false)}
                        aria-label="Hide password"
                      />
                    ) : (
                      <Eye
                        className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 cursor-pointer"
                        onClick={() => setShowPassword(true)}
                        aria-label="Show password"
                      />
                    )}
                  </div>
                </div>

                {/* Error Message */}
                {error && (
                  <p className="text-red-500 text-sm text-center lg:text-left">
                    {error}
                  </p>
                )}

                <div className="flex flex-col items-center space-y-4 mt-6">
                  <Link
                    to="/recover"
                    className="text-sm text-gray-400 hover:underline cursor-pointer text-center"
                  >
                    Recover your password
                  </Link>

                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center w-full">
                    <Button
                      type="submit"
                      disabled={loading}
                      className="hover:bg-[#20475bcf] w-full sm:w-48 lg:w-56 xl:w-64 h-11 sm:h-12 text-base sm:text-lg inline-flex items-center justify-center rounded-full bg-[#20475a] px-4 py-2 font-medium text-[#009ad2] transition-colors duration-200"
                    >
                      {loading ? (
                        <span className="flex items-center">
                          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                          </svg>
                          Loading...
                        </span>
                      ) : (
                        "Continue"
                      )}
                    </Button>

                    <Link to="/register" className="w-full sm:w-auto">
                      <Button
                        variant="secondary"
                        className="bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-full w-full sm:w-48 lg:w-56 xl:w-64 h-11 sm:h-12 text-base sm:text-lg transition-colors duration-200"
                      >
                        Sign Up
                      </Button>
                    </Link>
                  </div>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Right Section - Brand Area */}
      <div className="w-full lg:w-1/2 bg-gradient-to-r from-[#1d6c8f] via-[#167da8] to-[#0197cd] flex items-center justify-center py-8 lg:py-0 min-h-[40vh] lg:min-h-screen">
        <div className="text-center text-white px-4">
          {/* Logo for desktop - hidden on mobile since it's shown above form */}
          <div className="hidden lg:flex items-center justify-center">
            <img
              src={logo}
              alt="RoyaFi Logo"
              className="h-36 w-36 xl:h-48 xl:w-48 object-contain transition-transform duration-300 hover:scale-105"
            />
          </div>
          
          {/* Optional: Add welcome text for larger screens */}
          <div className="hidden xl:block mt-6">
            <h2 className="text-2xl font-light">Welcome to RoyaFi</h2>
            <p className="text-lg mt-2 opacity-90">Your financial future starts here</p>
          </div>
        </div>
      </div>
    </div>
  );
}