import React, { useEffect, useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";
import { toast } from "sonner";
import Forminputs from "./Forminputs";
import SubmitButton from "./SubmitButton";

const PASS_MIN = 6;

const ResetPassword = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const email = searchParams.get("email") || "";

  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!email) {
      toast.error("Email missing from reset link. Please start again.");
    }
  }, [email]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error("Email missing.");
      return;
    }
    if (!otp || otp.length < 4) {
      toast.error("Please enter the OTP sent to your email.");
      return;
    }
    if (!password || password.length < PASS_MIN) {
      toast.error(`Password must be at least ${PASS_MIN} characters.`);
      return;
    }
    if (password !== confirm) {
      toast.error("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      const { data } = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/api/auth/reset-password`,
        {
          email,
          otp,
          password,
        }
      );
      if (data?.success) {
        toast.success("Password reset successful. You can now log in.");
        navigate("/login");
      } else {
        toast.error(data?.message || "Reset failed.");
      }
    } catch (err) {
      toast.error(err.response?.data?.message || "Reset failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid place-content-center min-h-screen bg-[#0a0f14] text-zinc-100 px-4">
      <div className="w-full max-w-md rounded-2xl p-8 shadow-xl border border-zinc-800/70 bg-[#0b1016]">
        <h2 className="text-center text-2xl font-bold mb-1 text-zinc-200">
          Reset Password
        </h2>
        <p className="text-center text-sm text-zinc-400 mb-6">
          We&apos;ve sent an OTP to{" "}
          <span className="font-medium text-zinc-200">
            {email || "your email"}
          </span>
          . Enter the code and set a new password.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <Forminputs
            label="OTP"
            name="otp"
            type="text"
            value={otp}
            placeholder="6-digit code"
            onChange={(e) => setOtp(e.target.value)}
            required
          />
          <Forminputs
            label="New Password"
            name="password"
            type="password"
            value={password}
            placeholder="Enter new password"
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Forminputs
            label="Confirm Password"
            name="confirmPassword"
            type="password"
            value={confirm}
            placeholder="Re-enter new password"
            onChange={(e) => setConfirm(e.target.value)}
            required
          />

          <SubmitButton loading={loading}>
            Update password
          </SubmitButton>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-400">
          Back to{" "}
          <Link
            to="/login"
            className="text-emerald-400 hover:text-emerald-300 hover:underline font-medium"
          >
            Login
          </Link>
        </p>
      </div>
    </div>
  );
};

export default ResetPassword;
