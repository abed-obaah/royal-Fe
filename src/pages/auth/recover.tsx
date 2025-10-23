import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";
import logo from "../../assets/RoyaFi_2.png";

export default function Recover() {
  const [email, setEmail] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleContinue = async () => {
    if (email.trim() === "") {
      setError("Please enter your email address.");
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
      
      // Simulate API call - replace with actual password recovery API
      // await api.post('/password/recover', { email: email.trim() });
      
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setEmailSubmitted(true);
    } catch (err) {
      setError("Failed to send recovery email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setEmail("");
    setEmailSubmitted(false);
    setError("");
  };

  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* Left Section - Recover Form */}
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
            Recover Password
          </h1>
          
          <Card className="bg-transparent border-0 shadow-none">
            <CardContent className="space-y-4 p-0">
              {!emailSubmitted ? (
                <>
                  <p className="text-gray-400 text-sm sm:text-base mb-4 text-center lg:text-left">
                    Enter your email address and we'll send you instructions to reset your password.
                  </p>
                  
                  {/* Email Field */}
                  <div className="flex items-center gap-2 bg-gray-800 rounded px-3 h-12 sm:h-14">
                    <Mail className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 flex-shrink-0" />
                    <Input
                      type="email"
                      placeholder="Enter your email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="bg-transparent border-none text-white focus:ring-0 h-full flex-1 placeholder-gray-400 text-sm sm:text-base"
                      disabled={loading}
                    />
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
                        onClick={handleContinue}
                        disabled={loading}
                        className="hover:bg-[#20475bcf] w-full sm:w-48 lg:w-56 xl:w-64 h-11 sm:h-12 text-sm sm:text-base inline-flex items-center justify-center rounded-full bg-[#20475a] px-4 py-2 font-medium text-[#009ad2] disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200"
                      >
                        {loading ? (
                          <span className="flex items-center">
                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            Sending...
                          </span>
                        ) : (
                          "Send Recovery Email"
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
                  </div>
                </>
              ) : (
                /* Success State */
                <div className="text-center space-y-6">
                  <div className="w-16 h-16 bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"></path>
                    </svg>
                  </div>
                  
                  <h2 className="text-xl sm:text-2xl font-semibold text-green-400">
                    Check Your Email
                  </h2>
                  
                  <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
                    If an account exists with <span className="text-blue-300 font-medium">{email}</span>, 
                    we've sent password recovery instructions to your email address.
                  </p>
                  
                  <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4 mt-4">
                    <p className="text-blue-300 text-xs sm:text-sm">
                      💡 <strong>Tip:</strong> Check your spam folder if you don't see the email within a few minutes.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center pt-4">
                    <Button
                      onClick={handleReset}
                      className="hover:bg-[#20475bcf] w-full sm:w-auto px-6 h-11 text-sm sm:text-base inline-flex items-center justify-center rounded-full bg-[#20475a] font-medium text-[#009ad2] transition-colors duration-200"
                    >
                      Reset Another Email
                    </Button>
                    
                    <Link to="/" className="w-full sm:w-auto">
                      <Button
                        variant="secondary"
                        className="bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-full w-full sm:w-auto px-6 h-11 text-sm sm:text-base transition-colors duration-200"
                      >
                        Return to Login
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Additional Help Info */}
          {!emailSubmitted && (
            <div className="mt-6 p-4 bg-gray-800/30 border border-gray-700 rounded-lg">
              <h3 className="text-sm font-semibold text-gray-300 mb-2 flex items-center gap-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                Need help?
              </h3>
              <p className="text-xs text-gray-400">
                If you're having trouble recovering your account, please contact our support team at{" "}
                <span className="text-blue-400">support@royafi.com</span>
              </p>
            </div>
          )}
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
              <h3 className="text-xl font-bold mb-4">Account Security</h3>
              <div className="space-y-4 text-left text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">🔒</div>
                  <div>
                    <p className="font-semibold">Secure Recovery</p>
                    <p className="opacity-90">We use encrypted email links to protect your account</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">⏱️</div>
                  <div>
                    <p className="font-semibold">Quick Process</p>
                    <p className="opacity-90">Recovery links expire after 1 hour for security</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">📧</div>
                  <div>
                    <p className="font-semibold">Check Spam</p>
                    <p className="opacity-90">If you don't see our email, check your spam folder</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Mobile-friendly security info */}
            <div className="lg:hidden bg-white/10 rounded-lg p-4 backdrop-blur-sm">
              <h3 className="text-base font-bold mb-3">Secure Recovery</h3>
              <div className="grid grid-cols-1 gap-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-xs">🔒</span>
                  <span>Encrypted recovery links</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs">⏱️</span>
                  <span>Links expire in 1 hour</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs">📧</span>
                  <span>Check spam folder if needed</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}