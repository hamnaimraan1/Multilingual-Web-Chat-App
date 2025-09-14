// Routes/chatRoutes.js
import { Router } from "express";
import {
  toggleMuteChat,
  toggleArchiveChat,
  togglePinChat,
  deleteChat,
} from "../Controllers/chatController.js";
import {auth} from "../middlewares/auth.js"
const router = Router();

// No auth / token (as requested)
// router.put("/:chatId/mute", toggleMuteChat);
// router.put("/:chatId/archive", toggleArchiveChat);
// router.put("/:chatId/pin", togglePinChat);
// router.delete("/:chatId/delete", deleteChat);
router.put("/:chatId/mute",     auth, toggleMuteChat);
router.put("/:chatId/archive",  auth, toggleArchiveChat);
router.put("/:chatId/pin",      auth, togglePinChat);
router.delete("/:chatId/delete",auth, deleteChat);

export default router;
