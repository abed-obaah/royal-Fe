import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, Eye, EyeOff, User, MapPin } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/RoyaFi_2.png";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store";
import { setCredentials } from "../../slices/userSlice";
import { register } from "../../api/auth"; // Import the register function

export default function Register() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();

  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [country, setCountry] = useState("");
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Check screen size and set mobile state
  useEffect(() => {
    const checkScreenSize = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

const handleRegister = async () => {
  // Validation
  if (!name.trim() || !email.trim() || !password.trim() || !passwordConfirmation.trim()) {
    setError("All fields are required.");
    return;
  }
  
  if (password !== passwordConfirmation) {
    setError("Passwords do not match.");
    return;
  }
  
  if (!agree) {
    setError("You must agree to the Terms of Service.");
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

    const response = await register({
      name,
      email,
      password,
      password_confirmation: passwordConfirmation,
      country: country.trim() || undefined,
    });

    console.log("Registration response:", response);

    if (response.success) {
      if (response.data.token) {
        // Immediate login (no verification required)
        dispatch(setCredentials({ 
          user: response.data.user, 
          token: response.data.token 
        }));
        navigate("/dashboard");
      } else if (response.data.message) {
        // Verification required - PASS EMAIL AS STATE
        alert("Registration successful! Please check your email for verification OTP.");
        navigate("/verify-email", { state: { email } });
      }
    } else {
      setError("Registration failed. Please try again.");
    }
  } catch (err: any) {
    console.error("Registration error:", err);
    console.error("Error response:", err.response);
    console.error("Error data:", err.response?.data);
    
    // Detailed error handling
    if (err.response?.status === 422) {
      // Laravel validation errors (usually returns errors object)
      if (err.response.data?.errors) {
        const errors = err.response.data.errors;
        const errorMessages = Object.values(errors).flat();
        setError(errorMessages.join(', '));
      } else if (err.response.data?.message) {
        setError(err.response.data.message);
      } else {
        setError("Validation failed. Please check your inputs.");
      }
    } else if (err.response?.status === 400) {
      // Bad request
      setError(err.response.data?.message || "Invalid request. Please check your inputs.");
    } else if (err.response?.status === 401) {
      // Unauthorized
      setError(err.response.data?.message || "Authentication failed.");
    } else if (err.response?.status === 403) {
      // Forbidden
      setError(err.response.data?.message || "Access denied.");
    } else if (err.response?.status === 409) {
      // Conflict (user already exists)
      setError(err.response.data?.message || "User already exists with this email.");
    } else if (err.response?.status === 500) {
      // Server error
      setError("Server error. Please try again later.");
    } else if (err.code === 'NETWORK_ERROR' || err.message === 'Network Error') {
      // Network issues
      setError("Network error. Please check your connection and try again.");
    } else if (err.response?.data?.message) {
      // Generic error message from backend
      setError(err.response.data.message);
    } else if (err.message) {
      // Other error messages
      setError(err.message);
    } else {
      // Fallback error
      setError("Registration failed. Please try again.");
    }
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex">
      {/* Left Section */}
      <div className={`${isMobile ? "w-full" : "w-1/2"} bg-gradient-to-b from-[#1c2024] via-[#1d2125] to-[#1e2226] text-white flex flex-col justify-center px-8 md:px-20`}>
        <h1 className="text-3xl font-semibold mb-6 text-center">Sign up</h1>
        <Card className="bg-transparent border-0 shadow-none">
          <CardContent className="space-y-4">
            {/* Name Field */}
            <div className="flex items-center gap-2 bg-gray-800 rounded px-3 h-14">
              <User className="w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Full Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="bg-transparent border-none text-white focus:ring-0 h-full placeholder-gray-400 focus:bg-transparent active:bg-transparent"
              />
            </div>

            {/* Email Field */}
            <div className="flex items-center gap-2 bg-gray-800 rounded px-3 h-14">
              <Mail className="w-5 h-5 text-gray-400" />
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent border-none text-white focus:ring-0 h-full placeholder-gray-400 focus:bg-transparent active:bg-transparent"
              />
            </div>

            {/* Password Field */}
            <div className="flex items-center gap-2 bg-gray-800 rounded px-3 h-14">
              <Lock className="w-5 h-5 text-gray-400" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="border-none text-white focus:ring-0 h-full flex-1 bg-transparent placeholder-gray-400 focus:bg-transparent active:bg-transparent"
              />
              {showPassword ? (
                <EyeOff
                  className="w-5 h-5 text-gray-400 cursor-pointer"
                  onClick={() => setShowPassword(false)}
                />
              ) : (
                <Eye
                  className="w-5 h-5 text-gray-400 cursor-pointer"
                  onClick={() => setShowPassword(true)}
                />
              )}
            </div>

            {/* Password Confirmation Field */}
            <div className="flex items-center gap-2 bg-gray-800 rounded px-3 h-14">
              <Lock className="w-5 h-5 text-gray-400" />
              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Confirm Password"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                className="border-none text-white focus:ring-0 h-full flex-1 bg-transparent placeholder-gray-400 focus:bg-transparent active:bg-transparent"
              />
            </div>

            {/* Country of Residence Field */}
            <div className="flex items-center gap-2 bg-gray-800 rounded px-3 h-14">
              <MapPin className="w-5 h-5 text-gray-400" />
              <Input
                type="text"
                placeholder="Country of Residence (Optional)"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="bg-transparent border-none text-white focus:ring-0 h-full placeholder-gray-400 focus:bg-transparent active:bg-transparent"
              />
            </div>

            {/* Terms of Service */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={agree}
                onChange={(e) => setAgree(e.target.checked)}
                className="w-4 h-4"
              />
              <label className="text-sm text-gray-400">
                I have read and agree to the{" "}
                <span className="text-[#009ad2] underline cursor-pointer">
                  Terms of Service
                </span>
              </label>
            </div>

            {/* Error Message */}
            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="flex flex-col items-center space-y-4 mt-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={handleRegister}
                  disabled={loading}
                  className="hover:bg-[#20475bcf] w-64 h-12 text-lg inline-flex items-center rounded-full bg-[#20475a] px-2 py-1 font-medium text-[#009ad2]"
                >
                  {loading ? "Creating Account..." : "Create Account"}
                </Button>

                <Link to="/">
                  <Button
                    variant="secondary"
                    className="bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-full w-64 h-12 text-lg"
                  >
                    Back to Login
                  </Button>
                </Link>
              </div>

              <Link
                to="/recover"
                className="text-sm text-gray-400 hover:underline cursor-pointer text-center"
              >
                Recover your password
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Section - Hidden on mobile */}
      {!isMobile && (
        <div className="w-1/2 bg-gradient-to-r from-[#1d6c8f] via-[#167da8] to-[#0197cd] flex items-center justify-center">
          <div className="text-center text-white">
            <div className="flex items-center justify-center gap-4">
              <div className="flex items-center justify-center">
                <img
                  src={logo}
                  alt="RHKM Logo"
                  className="h-48 w-48 object-contain"
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}