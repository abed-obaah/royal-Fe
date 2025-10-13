// src/pages/auth/VerifyEmail.tsx
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { verifyOtp, resendOtp } from "@/api/auth"; // Import the specific functions

export default function VerifyEmail() {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resending, setResending] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const email = location.state?.email || "";

  const handleChange = (value: string, index: number) => {
    if (!/^\d*$/.test(value)) return; // only numbers allowed
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleVerify = async () => {
    const code = otp.join("");
    if (code.length < 6) {
      setError("Please enter a valid 6-digit OTP");
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      // Use the correct endpoint and data structure
      await verifyOtp({ 
        email, 
        code: code // matches backend expectation
      });

      alert("✅ Email verified successfully! You can now login.");
      navigate("/"); // Redirect to login page
      
    } catch (err: any) {
      setError(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      setResending(true);
      setError("");
      
      await resendOtp({ email });
      alert("A new OTP has been sent to your email.");
      
    } catch (err: any) {
      setError(err.response?.data?.message || "Failed to resend OTP");
    } finally {
      setResending(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`);
      prevInput?.focus();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-gray-800 px-4">
      <Card className="w-full max-w-md bg-gray-950/70 backdrop-blur-lg border border-gray-800 rounded-2xl shadow-xl">
        <CardContent className="space-y-6 p-8">
          <h2 className="text-3xl font-semibold text-center text-white">
            Verify Your Email
          </h2>
          <p className="text-gray-400 text-center text-sm">
            Enter the 6-digit code sent to <br />
            <span className="text-indigo-400 font-medium">{email}</span>
          </p>

          {/* OTP Input Fields */}
          <div className="flex justify-center gap-3 mt-4">
            {otp.map((digit, i) => (
              <input
                key={i}
                id={`otp-${i}`}
                type="text"
                maxLength={1}
                value={digit}
                onChange={(e) => handleChange(e.target.value, i)}
                onKeyDown={(e) => handleKeyDown(e, i)}
                className="w-12 h-12 text-center text-xl bg-gray-800 text-white border border-gray-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            ))}
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}

          <Button
            onClick={handleVerify}
            disabled={loading}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 mt-4 rounded-xl transition-all duration-200"
          >
            {loading ? "Verifying..." : "Verify Email"}
          </Button>

          <div className="text-center mt-3">
            <p className="text-gray-400 text-sm">
              Didn't get a code?{" "}
              <button
                onClick={handleResend}
                disabled={resending}
                className="text-indigo-400 hover:text-indigo-500 font-medium disabled:opacity-50"
              >
                {resending ? "Resending..." : "Resend Code"}
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}