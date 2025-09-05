// Routes/chatRoutes.js
import { Router } from "express";
import {
  toggleMuteChat,
  toggleArchiveChat,
  togglePinChat,
  deleteChat,
} from "../Controllers/chatController.js";

const router = Router();

// No auth / token (as requested)
router.put("/:chatId/mute", toggleMuteChat);
router.put("/:chatId/archive", toggleArchiveChat);
router.put("/:chatId/pin", togglePinChat);
router.delete("/:chatId/delete", deleteChat);

export default router;
