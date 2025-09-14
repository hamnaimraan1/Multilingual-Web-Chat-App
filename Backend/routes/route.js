// import { Router } from "express";
// const router = Router();
// import { register, login, logout, userinfo, updateuser, searchuser, verifyEmail, resendVerification, checkUsername, checkEmail} from "../Controllers/userController.js";
// import { auth } from "../middlewares/auth.js";

// // User routes

// router.post("/register", register);
// router.post("/login", login);
// router.get("/logout", logout);
// router.get("/userinfo", auth, userinfo);
// // router.get("/languages", getSupportedLanguages);
// router.put("/updateuser", updateuser);
// router.post("/searchuser", searchuser);
// router.get("/verify-email", verifyEmail);
// router.post("/resend-verification", resendVerification);
// router.get("/check-username", checkUsername);

// router.get("/check-email", checkEmail);

// export default router;
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
