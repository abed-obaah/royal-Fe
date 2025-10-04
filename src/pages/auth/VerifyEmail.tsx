// src/pages/auth/VerifyEmail.tsx
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import api from "@/services/axios";

export default function VerifyEmail() {
  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const location = useLocation();
  const navigate = useNavigate();
  
  const email = location.state?.email || "";

  const handleVerify = async () => {
    if (!otp.trim()) {
      setError("Please enter the OTP");
      return;
    }

    try {
      setLoading(true);
      setError("");
      
      // Call your verification API endpoint
      const response = await api.post("/verify-email", {
        email,
        otp
      });
      
      if (response.data.success) {
        // Verification successful, redirect to login
        alert("Email verified successfully! You can now login.");
        navigate("/");
      }
    } catch (err: any) {
      setError(err.response?.data?.message || "Verification failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <Card className="w-full max-w-md">
        <CardContent className="space-y-4 p-6">
          <h2 className="text-2xl font-bold text-center">Verify Email</h2>
          <p className="text-gray-400 text-center">
            Enter the OTP sent to {email}
          </p>
          
          <Input
            type="text"
            placeholder="Enter OTP"
            value={otp}
            onChange={(e) => setOtp(e.target.value)}
            className="text-center text-lg"
          />
          
          {error && <p className="text-red-500 text-sm">{error}</p>}
          
          <Button
            onClick={handleVerify}
            disabled={loading}
            className="w-full"
          >
            {loading ? "Verifying..." : "Verify Email"}
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}