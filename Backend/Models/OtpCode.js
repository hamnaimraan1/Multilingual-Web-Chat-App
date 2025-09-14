import mongoose from "mongoose";

const OtpCodeSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, index: true },
    // store bcrypt-hashed OTP for security
    otpHash: { type: String, required: true },
    // optional: signup / login / etc. (lets you re-use this infra later)
    purpose: { type: String, default: "signup" },
    // naive throttle / anti-spam helpers
    sendCount: { type: Number, default: 1 },
    lastSentAt: { type: Date, default: Date.now },
    attempts: { type: Number, default: 0 },
    // TTL expiry (MongoDB index will auto-remove after this time)
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

// TTL index (OTP valid for 10 minutes)
OtpCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("OtpCode", OtpCodeSchema);
