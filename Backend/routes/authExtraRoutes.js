import express from "express";
import { checkEmail, sendOtp, verifyOtp } from "../Controllers/authExtra.js";

const router = express.Router();

router.post("/check-email", checkEmail);
router.post("/send-otp", sendOtp);
router.post("/verify-otp", verifyOtp);

export default router;
