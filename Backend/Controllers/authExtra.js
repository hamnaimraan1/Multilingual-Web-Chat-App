import dotenv from "dotenv";
dotenv.config();

import bcrypt from "bcryptjs";
import catchAsync from "../middlewares/async.js";
import User from "../Models/userModel.js";
import OtpCode from "../Models/otpCode.js";
import { sendOtpEmail } from "../utils/mailer.js";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const OTP_LEN = 6;
const OTP_TTL_MIN = 10; // minutes
const RESEND_COOLDOWN_SEC = 60;
const MAX_SENDS_PER_WINDOW = 5;
const MAX_VERIFY_ATTEMPTS = 5;

function generateOtp(len = OTP_LEN) {
  return Array.from({ length: len }, () => Math.floor(Math.random() * 10)).join("");
}

/* --- Check if email exists --- */
export const checkEmail = catchAsync(async (req, res) => {
  const { email } = req.body || {};
  if (!EMAIL_RE.test(email || "")) return res.status(200).json({ exists: false });

  const user = await User.findOne({ email }).select("_id").lean();
  return res.status(200).json({ exists: !!user });
});

/* --- Send OTP --- */
export const sendOtp = catchAsync(async (req, res) => {
  const { email } = req.body || {};
  console.log("📨 sendOtp request for:", email);

  if (!EMAIL_RE.test(email || "")) {
    return res.status(400).json({ message: "Invalid email format", error: true });
  }

  let existing = await OtpCode.findOne({ email, purpose: "signup" });

  if (existing) {
    const diffSec = Math.floor((Date.now() - existing.lastSentAt.getTime()) / 1000);
    if (diffSec < RESEND_COOLDOWN_SEC) {
      return res.status(429).json({
        message: `Please wait ${RESEND_COOLDOWN_SEC - diffSec}s before requesting a new OTP`,
        error: true,
      });
    }
    if (existing.sendCount >= MAX_SENDS_PER_WINDOW) {
      return res.status(429).json({ message: "Too many OTP requests. Try later.", error: true });
    }
  }

  const code = generateOtp();
  const otpHash = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + OTP_TTL_MIN * 60 * 1000);

  if (!existing) {
    await OtpCode.create({
      email,
      purpose: "signup",
      otpHash,
      expiresAt,
      sendCount: 1,
      lastSentAt: new Date(),
    });
  } else {
    existing.otpHash = otpHash;
    existing.expiresAt = expiresAt;
    existing.lastSentAt = new Date();
    existing.sendCount += 1;
    existing.attempts = 0;
    await existing.save();
  }

  try {
    const info = await sendOtpEmail({ to: email, code });
    console.log(` OTP code for ${email}: ${code}`);
    return res.status(200).json({ success: true, message: "OTP sent" });
  } catch (err) {
    console.error(" sendOtpEmail failed:", err.message);
    return res.status(500).json({ message: "Failed to send OTP email", error: true });
  }
});

/* --- Verify OTP --- */
export const verifyOtp = catchAsync(async (req, res) => {
  const { email, otp } = req.body || {};
  console.log("🔍 verifyOtp request for:", email);

  if (!EMAIL_RE.test(email || "")) {
    return res.status(400).json({ message: "Invalid email format", error: true });
  }
  if (!otp) {
    return res.status(400).json({ message: "Invalid OTP", error: true });
  }

  const rec = await OtpCode.findOne({ email, purpose: "signup" });
  if (!rec) return res.status(400).json({ message: "OTP not found or expired", error: true });

  if (rec.expiresAt < new Date()) {
    await rec.deleteOne();
    return res.status(400).json({ message: "OTP expired", error: true });
  }

  if (rec.attempts >= MAX_VERIFY_ATTEMPTS) {
    await rec.deleteOne();
    return res.status(429).json({ message: "Too many attempts. Request new OTP.", error: true });
  }

  const ok = await bcrypt.compare(String(otp), rec.otpHash);
  rec.attempts += 1;

  if (!ok) {
    await rec.save();
    return res.status(400).json({ message: "Invalid OTP", error: true });
  }

  await rec.deleteOne();
  console.log(` OTP verified for ${email}`);
  return res.status(200).json({ success: true, message: "OTP verified" });
});
/* --- Forgot Password (send OTP for password reset) --- */
export const forgotPassword = catchAsync(async (req, res) => {
  const { email } = req.body || {};
  console.log("📨 forgotPassword (reset OTP) request for:", email);

  if (!EMAIL_RE.test(email || "")) {
    return res.status(400).json({ message: "Invalid email format", error: true });
  }

  // use a different purpose so we don't conflict with signup codes
  const PURPOSE = "reset-password";

  let existing = await OtpCode.findOne({ email, purpose: PURPOSE });

  if (existing) {
    const diffSec = Math.floor((Date.now() - existing.lastSentAt.getTime()) / 1000);
    if (diffSec < RESEND_COOLDOWN_SEC) {
      return res.status(429).json({
        message: `Please wait ${RESEND_COOLDOWN_SEC - diffSec}s before requesting a new OTP`,
        error: true,
      });
    }
    if (existing.sendCount >= MAX_SENDS_PER_WINDOW) {
      return res.status(429).json({ message: "Too many OTP requests. Try later.", error: true });
    }
  }

  const code = generateOtp();
  const otpHash = await bcrypt.hash(code, 10);
  const expiresAt = new Date(Date.now() + OTP_TTL_MIN * 60 * 1000);

  if (!existing) {
    await OtpCode.create({
      email,
      purpose: PURPOSE,
      otpHash,
      expiresAt,
      sendCount: 1,
      lastSentAt: new Date(),
    });
  } else {
    existing.otpHash = otpHash;
    existing.expiresAt = expiresAt;
    existing.lastSentAt = new Date();
    existing.sendCount += 1;
    existing.attempts = 0;
    await existing.save();
  }

  try {
    // reuse your existing email util – template can stay same for now
    await sendOtpEmail({ to: email, code });
    console.log(`🔐 Reset OTP code for ${email}: ${code}`);
    return res
      .status(200)
      .json({ success: true, message: "Reset OTP sent if this email exists." });
  } catch (err) {
    console.error(" sendOtpEmail (reset) failed:", err.message);
    return res
      .status(500)
      .json({ message: "Failed to send reset OTP email", error: true });
  }
});

/* --- Reset Password using OTP --- */
export const resetPassword = catchAsync(async (req, res) => {
  const { email, otp, password } = req.body || {};
  console.log("🔁 resetPassword request for:", email);

  if (!EMAIL_RE.test(email || "")) {
    return res.status(400).json({ message: "Invalid email format", error: true });
  }
  if (!otp) {
    return res.status(400).json({ message: "Invalid OTP", error: true });
  }
  if (!password || String(password).length < 6) {
    return res
      .status(400)
      .json({ message: "Password must be at least 6 characters", error: true });
  }

  const PURPOSE = "reset-password";

  const rec = await OtpCode.findOne({ email, purpose: PURPOSE });
  if (!rec) {
    return res.status(400).json({ message: "OTP not found or expired", error: true });
  }

  if (rec.expiresAt < new Date()) {
    await rec.deleteOne();
    return res.status(400).json({ message: "OTP expired", error: true });
  }

  if (rec.attempts >= MAX_VERIFY_ATTEMPTS) {
    await rec.deleteOne();
    return res
      .status(429)
      .json({ message: "Too many attempts. Request a new OTP.", error: true });
  }

  const ok = await bcrypt.compare(String(otp), rec.otpHash);
  rec.attempts += 1;

  if (!ok) {
    await rec.save();
    return res.status(400).json({ message: "Invalid OTP", error: true });
  }

  // OTP correct -> reset password
  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    // security: still remove OTP but generic message
    await rec.deleteOne();
    return res
      .status(400)
      .json({ message: "User not found for this email", error: true });
  }

  const hashed = await bcrypt.hash(String(password), 10);
  user.password = hashed;
  await user.save();
  await rec.deleteOne();

  console.log(`✅ Password reset successful for ${email}`);
  return res
    .status(200)
    .json({ success: true, message: "Password reset successful" });
});
