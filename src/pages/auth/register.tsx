// src/components/Register.tsx
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, Lock, Eye, EyeOff, User, MapPin, Users, CheckCircle, XCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import logo from "../../assets/RoyaFi_2.png";
import { useDispatch } from "react-redux";
import { AppDispatch } from "../../store";
import { setCredentials } from "../../slices/userSlice";
import { register, checkReferralCode } from "../../api/auth";

export default function Register() {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const [searchParams] = useSearchParams();

  const [showPassword, setShowPassword] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [country, setCountry] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [agree, setAgree] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [referrerName, setReferrerName] = useState("");
  const [validatingReferral, setValidatingReferral] = useState(false);
  const [referralValid, setReferralValid] = useState<boolean | null>(null);

  // Check for referral code in URL parameters
  useEffect(() => {
    const refCode = searchParams.get('ref');
    if (refCode) {
      setReferralCode(refCode);
      validateReferralCode(refCode);
    }
  }, [searchParams]);

  const validateReferralCode = async (code: string) => {
    if (!code.trim()) {
      setReferralValid(null);
      setReferrerName("");
      return;
    }

    setValidatingReferral(true);
    setReferralValid(null);
    setReferrerName("");

    try {
      const response = await checkReferralCode(code);
      
      if (response.valid) {
        setReferralValid(true);
        setReferrerName(response.referrer_name);
        setError(""); // Clear any previous errors
      } else {
        setReferralValid(false);
        setReferrerName("");
        setError("Invalid referral code. Please check and try again.");
      }
    } catch (error: any) {
      console.error('Error validating referral code:', error);
      setReferralValid(false);
      setReferrerName("");
      if (error.response?.status === 404) {
        setError("Invalid referral code. Please check and try again.");
      } else {
        setError("Error validating referral code. Please try again.");
      }
    } finally {
      setValidatingReferral(false);
    }
  };

  const handleReferralCodeChange = (value: string) => {
    const code = value.toUpperCase(); // Convert to uppercase for consistency
    setReferralCode(code);
    setReferralValid(null);
    setReferrerName("");
    setError(""); // Clear errors when user types
    
    // Validate after a short delay to avoid too many API calls
    const timeoutId = setTimeout(() => {
      if (code.trim() !== "") {
        validateReferralCode(code);
      } else {
        setReferralValid(null);
        setValidatingReferral(false);
      }
    }, 500);

    return () => clearTimeout(timeoutId);
  };

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
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
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

    // If referral code is provided but invalid, prevent registration
    if (referralCode.trim() !== "" && referralValid === false) {
      setError("Please fix the invalid referral code or remove it before registering.");
      return;
    }

    // If still validating referral code, wait
    if (referralCode.trim() !== "" && validatingReferral) {
      setError("Please wait while we validate your referral code.");
      return;
    }

    try {
      setError("");
      setLoading(true);

      const response = await register({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
        password_confirmation: passwordConfirmation,
        country: country.trim() || undefined,
        referral_code: referralCode.trim() || undefined,
      });

      console.log("Registration response:", response);

      // Handle successful registration
      if (response.message && (response.message.includes("User registered") || response.message.includes("successfully"))) {
        let successMessage = "Registration successful! Please check your email for verification OTP.";
        
        // Add referral-specific success message
        if (response.referred_by) {
          successMessage += " You were referred by a friend!";
        } else if (response.referral_code) {
          successMessage += ` Your referral code: ${response.referral_code}`;
        }
        
        alert(successMessage);
        navigate("/verify-email", { state: { email: email.trim().toLowerCase() } });
        return;
      }

      // If we get here, check for other success cases
      if (response.message) {
        alert("Registration successful! Please check your email for verification OTP.");
        navigate("/verify-email", { state: { email: email.trim().toLowerCase() } });
      } else {
        setError("Registration failed. Please try again.");
      }
    } catch (err: any) {
      console.error("Registration error:", err);
      
      // Handle the specific "Account not verified" error
      if (err.response?.status === 403 && err.response.data?.message === "Account not verified") {
        alert("Registration successful! Please check your email for verification OTP.");
        navigate("/verify-email", { state: { email: email.trim().toLowerCase() } });
        return;
      }
      
      // Handle case where registration succeeds but something else fails
      if (err.response?.status === 403 && err.response.data?.message?.includes("not verified")) {
        alert("Registration successful! Please check your email for verification OTP.");
        navigate("/verify-email", { state: { email: email.trim().toLowerCase() } });
        return;
      }
      
      // Handle validation errors
      if (err.response?.status === 422) {
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
        setError(err.response.data?.message || "Invalid request. Please check your inputs.");
      } else if (err.response?.status === 401) {
        setError(err.response.data?.message || "Authentication failed.");
      } else if (err.response?.status === 409) {
        setError(err.response.data?.message || "User already exists with this email.");
      } else if (err.response?.status === 500) {
        setError("Server error. Please try again later.");
      } else if (err.code === 'NETWORK_ERROR' || err.message === 'Network Error') {
        setError("Network error. Please check your connection and try again.");
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const clearReferralCode = () => {
    setReferralCode("");
    setReferralValid(null);
    setReferrerName("");
    setError("");
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Section - Registration Form */}
      <div className="w-full lg:w-1/2 bg-gradient-to-b from-[#1c2024] via-[#1d2125] to-[#1e2226] text-white flex flex-col justify-center px-4 sm:px-6 md:px-12 lg:px-16 xl:px-20 py-8 lg:py-12">
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
            Sign up
          </h1>
          
          {/* Referral Banner */}
          {referrerName && (
            <div className="mb-4 p-3 sm:p-4 bg-green-900/30 border border-green-600 rounded-lg">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 flex-shrink-0" />
                <span className="text-green-400 font-medium text-sm sm:text-base">
                  You were referred by {referrerName}!
                </span>
              </div>
            </div>
          )}

          <Card className="bg-transparent border-0 shadow-none">
            <CardContent className="space-y-3 sm:space-y-4 p-0">
              {/* Name Field */}
              <div className="flex items-center gap-2 bg-gray-800 rounded px-3 h-12 sm:h-14">
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                <Input
                  type="text"
                  placeholder="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="bg-transparent border-none text-white focus:ring-0 h-full flex-1 placeholder-gray-400 text-sm sm:text-base"
                  disabled={loading}
                />
              </div>

              {/* Email Field */}
              <div className="flex items-center gap-2 bg-gray-800 rounded px-3 h-12 sm:h-14">
                <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                <Input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="bg-transparent border-none text-white focus:ring-0 h-full flex-1 placeholder-gray-400 text-sm sm:text-base"
                  disabled={loading}
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
                  className="border-none text-white focus:ring-0 h-full flex-1 pr-10 placeholder-gray-400 text-sm sm:text-base"
                  disabled={loading}
                />
                <div className="absolute right-3">
                  {showPassword ? (
                    <EyeOff
                      className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 cursor-pointer"
                      onClick={() => setShowPassword(false)}
                    />
                  ) : (
                    <Eye
                      className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 cursor-pointer"
                      onClick={() => setShowPassword(true)}
                    />
                  )}
                </div>
              </div>

              {/* Password Confirmation Field */}
              <div className="flex items-center gap-2 bg-gray-800 rounded px-3 h-12 sm:h-14">
                <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                <Input
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirm Password"
                  value={passwordConfirmation}
                  onChange={(e) => setPasswordConfirmation(e.target.value)}
                  className="border-none text-white focus:ring-0 h-full flex-1 placeholder-gray-400 text-sm sm:text-base"
                  disabled={loading}
                />
              </div>

              {/* Country of Residence Field */}
              <div className="flex items-center gap-2 bg-gray-800 rounded px-3 h-12 sm:h-14">
                <MapPin className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                <Input
                  type="text"
                  placeholder="Country of Residence (Optional)"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="bg-transparent border-none text-white focus:ring-0 h-full flex-1 placeholder-gray-400 text-sm sm:text-base"
                  disabled={loading}
                />
              </div>

              {/* Referral Code Field */}
              <div className="relative">
                <div className="flex items-center gap-2 bg-gray-800 rounded px-3 h-12 sm:h-14">
                  <Users className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                  <Input
                    type="text"
                    placeholder="Referral Code (Optional)"
                    value={referralCode}
                    onChange={(e) => handleReferralCodeChange(e.target.value)}
                    className="bg-transparent border-none text-white focus:ring-0 h-full flex-1 placeholder-gray-400 text-sm sm:text-base"
                    disabled={loading || validatingReferral}
                  />
                  <div className="flex items-center gap-1">
                    {referralCode && (
                      <button
                        onClick={clearReferralCode}
                        className="text-gray-400 hover:text-white transition-colors p-1"
                        disabled={loading}
                      >
                        <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                      </button>
                    )}
                    {validatingReferral && (
                      <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                    )}
                    {referralValid === true && (
                      <CheckCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400" />
                    )}
                    {referralValid === false && (
                      <XCircle className="w-4 h-4 sm:w-5 sm:h-5 text-red-400" />
                    )}
                  </div>
                </div>
                
                {/* Referral validation status */}
                {validatingReferral && (
                  <p className="text-blue-400 text-xs sm:text-sm mt-1 flex items-center gap-1">
                    <div className="w-3 h-3 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
                    Validating referral code...
                  </p>
                )}
                {referralValid === true && referrerName && (
                  <p className="text-green-400 text-xs sm:text-sm mt-1 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                    Valid! Referred by {referrerName}
                  </p>
                )}
                {referralValid === false && (
                  <p className="text-red-400 text-xs sm:text-sm mt-1 flex items-center gap-1">
                    <XCircle className="w-3 h-3 sm:w-4 sm:h-4" />
                    Invalid referral code
                  </p>
                )}
              </div>

              {/* Terms of Service */}
              <div className="flex items-start space-x-2 pt-2">
                <input
                  type="checkbox"
                  checked={agree}
                  onChange={(e) => setAgree(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-600 bg-gray-700 text-blue-600 focus:ring-blue-500 focus:ring-offset-gray-800 mt-0.5 flex-shrink-0"
                  disabled={loading}
                />
                <label className="text-xs sm:text-sm text-gray-400 leading-tight">
                  I have read and agree to the{" "}
                  <span className="text-[#009ad2] underline cursor-pointer">
                    Terms of Service
                  </span>
                </label>
              </div>

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-900/30 border border-red-600 rounded-lg">
                  <p className="text-red-400 text-xs sm:text-sm flex items-start gap-2">
                    <XCircle className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0 mt-0.5" />
                    {error}
                  </p>
                </div>
              )}

              <div className="flex flex-col items-center space-y-4 mt-6">
                <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center w-full">
                  <Button
                    onClick={handleRegister}
                    disabled={loading || (referralCode && validatingReferral) || (referralCode && referralValid === false)}
                    className="hover:bg-[#20475bcf] w-full sm:w-48 lg:w-56 xl:w-64 h-11 sm:h-12 text-sm sm:text-base inline-flex items-center justify-center rounded-full bg-[#20475a] px-4 py-2 font-medium text-[#009ad2] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                  >
                    {loading ? (
                      <span className="flex items-center">
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Creating Account...
                      </span>
                    ) : (
                      "Create Account"
                    )}
                  </Button>

                  <Link to="/" className="w-full sm:w-auto">
                    <Button
                      variant="secondary"
                      className="bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-full w-full sm:w-48 lg:w-56 xl:w-64 h-11 sm:h-12 text-sm sm:text-base transition-colors duration-200"
                      disabled={loading}
                    >
                      Back to Login
                    </Button>
                  </Link>
                </div>

                <Link
                  to="/recover"
                  className="text-xs sm:text-sm text-gray-400 hover:underline cursor-pointer text-center"
                >
                  Recover your password
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Referral Program Info - Mobile */}
          <div className="lg:hidden mt-6 p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
            <h3 className="text-base sm:text-lg font-semibold text-blue-400 mb-2 flex items-center gap-2">
              <Users className="w-4 h-4 sm:w-5 sm:h-5" />
              Share & Earn Program
            </h3>
            <p className="text-blue-300 text-xs sm:text-sm mb-3">
              After registration, you'll get your own referral code to share with friends and earn commissions!
            </p>
            <ul className="text-xs text-blue-400 space-y-1">
              <li className="flex items-start gap-2">
                <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center text-xs mt-0.5 flex-shrink-0">1</div>
                <span>Invest $20+ to become eligible for referrals</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center text-xs mt-0.5 flex-shrink-0">2</div>
                <span>Share your unique code with friends</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-4 h-4 bg-blue-600 rounded-full flex items-center justify-center text-xs mt-0.5 flex-shrink-0">3</div>
                <span>Earn 10% commission when they invest $10+</span>
              </li>
            </ul>
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
          
          {/* Referral Info */}
          <div className="max-w-md mx-auto">
            <div className="hidden lg:block p-6 bg-white/10 rounded-lg backdrop-blur-sm">
              <h3 className="text-xl font-bold mb-4">Invite Friends & Earn</h3>
              <div className="space-y-4 text-left">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">1</div>
                  <div>
                    <p className="font-semibold">Become Eligible</p>
                    <p className="text-sm opacity-90">Invest $20+ in any asset to unlock referral rewards</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">2</div>
                  <div>
                    <p className="font-semibold">Share Your Code</p>
                    <p className="text-sm opacity-90">Send friends your unique 6-character referral code</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">3</div>
                  <div>
                    <p className="font-semibold">Earn Commission</p>
                    <p className="text-sm opacity-90">Get 10% of their first investment when they invest $10+</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 p-4 bg-white/5 rounded-lg">
                <p className="text-sm font-semibold mb-2">Example:</p>
                <p className="text-sm opacity-90">
                  Friend invests $100 → You earn <span className="text-green-300 font-bold">$10</span> commission!
                </p>
              </div>
            </div>

            {/* Mobile-friendly referral info */}
            <div className="lg:hidden bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <h3 className="text-lg font-bold mb-3">Start Earning</h3>
              <div className="grid grid-cols-1 gap-3 text-sm">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">1</div>
                  <span>Invest $20+ to unlock referrals</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">2</div>
                  <span>Share your code</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0">3</div>
                  <span>Earn 10% commission</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}