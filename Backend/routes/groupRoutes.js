
import { Router } from "express";
import { auth } from "../middlewares/auth.js";
import {
  createGroup,
  updateGroup,        // 👈 add
  addMember,
  removeMember,
  addAdmin,
  leaveGroup,
  deleteGroup,
  getGroupDetails,
  getMyGroups,
  togglePinGroup,
  toggleArchiveGroup,
  toggleMuteGroup,
  getGroupLastMessage,
  getPastMembers,     // 👈 add
} from "../Controllers/groupController.js";

const router = Router();

router.post("/create", auth, createGroup);
router.put("/update", auth, updateGroup);             
router.put("/add-member", auth, addMember);
router.put("/remove-member", auth, removeMember);
router.put("/add-admin", auth, addAdmin);
router.put("/leave", auth, leaveGroup);
router.delete("/delete", auth, deleteGroup);
router.get("/:groupId/past-members", auth, getPastMembers); 
router.put("/:groupId/pin", auth, togglePinGroup);
router.put("/:groupId/archive", auth, toggleArchiveGroup);
router.put("/:groupId/mute", auth, toggleMuteGroup);
router.get("/:groupId", auth, getGroupDetails);
router.get("/:groupId/last", auth, getGroupLastMessage); 

router.get("/", auth, getMyGroups);

export default router;
