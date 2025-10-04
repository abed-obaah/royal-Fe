import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo from "../../assets/RoyaFi_2.png";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store";
import { setCredentials } from "../../slices/userSlice"; // Changed import
import api from "../../services/axios";

// Add interface to match your API response
interface LoginResponse {
  success: boolean;
  data: {
    user: {
      id: number;
      name: string;
      email: string;
      is_admin: boolean;
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

const handleContinue = async () => {
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

    const response = await api.post("/login", {
      email,
      password,
    });

    console.log("Full response:", response);
    console.log("Response data:", response.data);

    const { user, token } = response.data.data;
    
    console.log("Token extracted:", token);
    console.log("User data:", user);
    console.log("Is admin:", user.is_admin); // Add this line to verify the value
    
    if (!token) {
      setError("Invalid response from server.");
      return;
    }

    dispatch(setCredentials({ user, token }));

    // ✅ Redirect based on user role
    if (user.is_admin) {
      navigate("/admin");
    } else {
      navigate("/dashboard");
    }
  } catch (err: any) {
    console.error("Login error:", err);
    console.error("Error response:", err.response);
    setError(err.response?.data?.message || "Login failed. Try again.");
  } finally {
    setLoading(false);
  }
};

  return (
    <div className="min-h-screen flex">
      {/* Left Section */}
      <div className="w-1/2 bg-gradient-to-b from-[#1c2024] via-[#1d2125] to-[#1e2226] text-white flex flex-col justify-center px-20">
        <h1 className="text-3xl font-semibold mb-6">Login</h1>
        <Card className="bg-transparent border-0 shadow-none">
          <CardContent className="space-y-4">
            {/* Email Field */}
            <div className="flex items-center gap-2 bg-gray-800 rounded px-3 h-14">
              <Mail className="w-5 h-5 text-gray-400" />
              <Input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="bg-transparent border-none text-white focus:ring-0 h-full"
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
                className="bg-transparent border-none text-white focus:ring-0 h-full flex-1"
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

            {/* Error Message */}
            {error && <p className="text-red-500 text-sm">{error}</p>}

            <div className="flex flex-col items-center space-y-4 mt-6">
              <Link
                to="/recover"
                className="text-sm text-gray-400 hover:underline cursor-pointer text-center"
              >
                Recover your password
              </Link>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={handleContinue}
                  disabled={loading}
                  className="hover:bg-[#20475bcf] w-64 h-12 text-lg inline-flex items-center rounded-full bg-[#20475a] px-2 py-1 font-medium text-[#009ad2]"
                >
                  {loading ? "Loadinga..." : "Continue"}
                </Button>

                <Link to="/register">
                  <Button
                    variant="secondary"
                    className="bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-full w-64 h-12 text-lg"
                  >
                    Sign Up
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Right Section */}
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
    </div>
  );
}