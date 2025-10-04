import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [emailSubmitted, setEmailSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleContinue = () => {
    if (email.trim() === "") {
      setError("Please enter your email address.");
      return;
    }
    setError("");
    setEmailSubmitted(true);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Section */}
      <div className="w-1/2 bg-gradient-to-b from-[#1c2024] via-[#1d2125] to-[#1e2226] text-white flex flex-col justify-center px-20">
        <h1 className="text-3xl font-semibold mb-6 text-center">Recover</h1>
        <Card className="bg-transparent border-0 shadow-none">
          <CardContent className="space-y-4">
            <div className="flex flex-col gap-2">
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
              {error && <p className="text-red-500 text-sm">{error}</p>}
              {emailSubmitted && !error && (
                <p className="text-green-500 text-sm">
                  Check your inbox, if this email exists, we'll send you a recovery email.
                </p>
              )}
            </div>

            <div className="flex flex-col items-center space-y-4 mt-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {!emailSubmitted && (
                  <Button
                    onClick={handleContinue}
                    className="hover:bg-[#20475bcf] w-64 h-12 text-lg inline-flex items-center rounded-full bg-[#20475a] px-2 py-1 font-medium text-[#009ad2]"
                  >
                    Continue
                  </Button>
                )}
                 <Link to="/">
                    <Button
                    variant="secondary"
                    className="bg-gray-700 hover:bg-gray-600 text-gray-300 rounded-full w-64 h-12 text-lg"
                    >
                    Login
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
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-12 w-12"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 11c0 .28-.11.53-.29.71-.18.18-.43.29-.71.29-.28 0-.53-.11-.71-.29A1.003 1.003 0 0111 11a1 1 0 011-1z"
              />
            </svg>
            <span className="text-3xl font-bold">RHKM</span>
          </div>
        </div>
      </div>
    </div>
  );
}
