import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import Forminputs from "./Forminputs";
import SubmitButton from "./SubmitButton";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    try {
      setLoading(true);
      await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/auth/forgot-password`,
        { email }
      );

      toast.success(
        "If this email exists, an OTP has been sent. Please check your inbox."
      );

      // go to reset page with the email in query string
      navigate(`/reset-password?email=${encodeURIComponent(email)}`);
    } catch (err) {
      toast.error("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid place-content-center min-h-screen bg-[#0a0f14] text-zinc-100 px-4">
      <div className="w-full max-w-md rounded-2xl p-8 shadow-xl border border-zinc-800/70 bg-[#0b1016]">
        <h2 className="text-center text-2xl font-bold mb-1 text-zinc-200">
          Forgot Password
        </h2>
        <p className="text-center text-sm text-zinc-400 mb-6">
          Enter your email. We&apos;ll send you a 6-digit OTP to reset your password.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Forminputs
            label="Email"
            name="email"
            type="email"
            value={email}
            placeholder="you@example.com"
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <SubmitButton loading={loading}>
            Send OTP
          </SubmitButton>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-400">
          Remember your password?{" "}
          <Link
            to="/login"
            className="text-emerald-400 hover:text-emerald-300 hover:underline font-medium"
          >
            Back to login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPassword;
