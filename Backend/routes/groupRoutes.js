// import { Router } from "express";
// import { auth } from "../middlewares/auth.js";
// import {
//   createGroup,
//   addMember,
//   removeMember,
//   addAdmin,        // ✅ use addAdmin instead
//   leaveGroup,
//   deleteGroup,
//   getGroupDetails,
//   getMyGroups,
//    updateGroup,        // 👈 add
//   getPastMembers,  
// } from "../Controllers/groupController.js";


// const router = Router();

// // Group routes
// router.post("/create", auth, createGroup);
// router.put("/add-member", auth, addMember);
// router.put("/remove-member", auth, removeMember);
// router.put("/add-admin", auth, addAdmin);
// router.put("/leave", auth, leaveGroup);
// router.delete("/delete", auth, deleteGroup);
// router.get("/:groupId", auth, getGroupDetails);
// router.get("/", auth, getMyGroups);      
// router.put("/update", auth, updateGroup);                    // 👈 new
// router.get("/:groupId/past-members", auth, getPastMembers);  // 👈 new

// export default router;
// routes/groupRoutes.js
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
  getPastMembers,     // 👈 add
} from "../Controllers/groupController.js";

const router = Router();

router.post("/create", auth, createGroup);
router.put("/update", auth, updateGroup);             // 👈 new
router.put("/add-member", auth, addMember);
router.put("/remove-member", auth, removeMember);
router.put("/add-admin", auth, addAdmin);
router.put("/leave", auth, leaveGroup);
router.delete("/delete", auth, deleteGroup);
router.get("/:groupId/past-members", auth, getPastMembers); // 👈 new
router.get("/:groupId", auth, getGroupDetails);
router.get("/", auth, getMyGroups);

export default router;
