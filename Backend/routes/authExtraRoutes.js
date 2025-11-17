import express from "express";
import { checkEmail, sendOtp, verifyOtp,forgotPassword,resetPassword } from "../Controllers/authExtra.js";

const router = express.Router();

router.post("/check-email", checkEmail);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);
router.post("/forgot-password", forgotPassword);   // send reset OTP
router.post("/reset-password", resetPassword);     // verify OTP + change password

export default router;
