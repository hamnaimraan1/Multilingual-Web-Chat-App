import { Router } from "express";
const router = Router();
import { register, login, logout, userinfo, updateuser, searchuser } from "../Controllers/userController.js";
import { auth } from "../middlewares/auth.js";

// User routes
router.post("/register", register);
router.post("/login", login);
router.get("/logout", logout);
router.get("/userinfo", auth, userinfo);
// router.get("/languages", getSupportedLanguages);
router.put("/updateuser", updateuser);
router.post("/searchuser", searchuser);




export default router;
