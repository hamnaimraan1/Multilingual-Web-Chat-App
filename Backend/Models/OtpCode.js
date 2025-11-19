import mongoose from "mongoose";

const OtpCodeSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, index: true },
    
    otpHash: { type: String, required: true },
    
    purpose: { type: String, default: "signup" },
    
    sendCount: { type: Number, default: 1 },
    lastSentAt: { type: Date, default: Date.now },
    attempts: { type: Number, default: 0 },
    
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);


OtpCodeSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

export default mongoose.model("OtpCode", OtpCodeSchema);
