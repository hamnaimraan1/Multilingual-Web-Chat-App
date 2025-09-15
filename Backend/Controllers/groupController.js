// // Controllers/groupController.js
// import Group from "../Models/groupModel.js";
// import Msg from "../Models/msgModel.js";

// /* ---------- helpers ---------- */
// const toStr = (id) => id?.toString?.() || String(id || "");
// const isAdmin = (group, userId) => (group.admins || []).some((id) => toStr(id) === toStr(userId));
// const isMember = (group, userId) => (group.members || []).some((id) => toStr(id) === toStr(userId));

// /* 1) Create Group */
// export const createGroup = async (req, res) => {
//   try {
//     const { name, members = [], profilePic = "" } = req.body;
//     const me = req.user._id;

//     const uniqueMembers = Array.from(new Set([...members.map(String), String(me)]));

//     const group = await Group.create({
//       name: name?.trim(),
//       createdBy: me,
//       admins: [me],
//       members: uniqueMembers,
//       profilePic,
//     });

//     res.status(201).json({ success: true, group });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// /* 2) Update Group (name / profilePic) */
// export const updateGroup = async (req, res) => {
//   try {
//     const { groupId, name, profilePic } = req.body;
//     const group = await Group.findById(groupId);
//     if (!group) return res.status(404).json({ message: "Group not found" });
//     if (!isAdmin(group, req.user._id))
//       return res.status(403).json({ message: "Only admins can update group" });

//     if (typeof name === "string" && name.trim()) group.name = name.trim();
//     if (typeof profilePic === "string") group.profilePic = profilePic;

//     await group.save();
//     const populated = await Group.findById(groupId)
//       .populate("admins", "name email")
//       .populate("members", "name email");
//     res.json({ success: true, group: populated });
//   } catch (e) {
//     res.status(500).json({ success: false, message: e.message });
//   }
// };

// /* 3) Add Member */
// export const addMember = async (req, res) => {
//   try {
//     const { groupId, userId } = req.body;
//     const group = await Group.findById(groupId);
//     if (!group) return res.status(404).json({ message: "Group not found" });
//     if (!isAdmin(group, req.user._id))
//       return res.status(403).json({ message: "Only admins can add members" });
//     if (isMember(group, userId))
//       return res.status(400).json({ message: "User already in group" });

//     group.members.push(userId);
//     // if the user was a past member, remove that log
//     group.pastMembers = (group.pastMembers || []).filter(
//       (pm) => toStr(pm.user) !== toStr(userId)
//     );

//     await group.save();
//     const populated = await Group.findById(groupId)
//       .populate("admins", "name email")
//       .populate("members", "name email");
//     res.json({ success: true, message: "Member added", group: populated });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// /* 4) Remove Member (logs to pastMembers) */
// export const removeMember = async (req, res) => {
//   try {
//     const { groupId, userId } = req.body;
//     const group = await Group.findById(groupId);
//     if (!group) return res.status(404).json({ message: "Group not found" });
//     if (!isAdmin(group, req.user._id))
//       return res.status(403).json({ message: "Only admins can remove members" });

//     const userIdStr = toStr(userId);
//     group.members = group.members.filter((id) => toStr(id) !== userIdStr);
//     group.admins  = group.admins.filter((id)  => toStr(id) !== userIdStr);
//     group.pastMembers = [...(group.pastMembers || []), { user: userId, removedAt: new Date() }];

//     // ensure at least 1 admin if members remain
//     if (group.admins.length === 0 && group.members.length > 0) {
//       group.admins = [group.members[0]];
//     }

//     await group.save();
//     const populated = await Group.findById(groupId)
//       .populate("admins", "name email")
//       .populate("members", "name email");
//     res.json({ success: true, message: "Member removed", group: populated });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// /* 5) Add Admin (multiple admins supported) */
// export const addAdmin = async (req, res) => {
//   try {
//     const { groupId, newAdminId } = req.body;
//     const group = await Group.findById(groupId);
//     if (!group) return res.status(404).json({ message: "Group not found" });
//     if (!isAdmin(group, req.user._id))
//       return res.status(403).json({ message: "Only admins can add new admins" });
//     if (!isMember(group, newAdminId))
//       return res.status(400).json({ message: "New admin must be a group member" });

//     if (!isAdmin(group, newAdminId)) group.admins.push(newAdminId);
//     await group.save();

//     const populated = await Group.findById(groupId)
//       .populate("admins", "name email")
//       .populate("members", "name email");
//     res.json({ success: true, message: "Admin added", group: populated });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// /* 6) Leave Group (logs to pastMembers) */
// export const leaveGroup = async (req, res) => {
//   try {
//     const { groupId } = req.body;
//     const me = req.user._id;
//     const group = await Group.findById(groupId);
//     if (!group) return res.status(404).json({ message: "Group not found" });

//     const meStr = toStr(me);
//     group.members = group.members.filter((id) => toStr(id) !== meStr);
//     group.admins  = group.admins.filter((id)  => toStr(id) !== meStr);
//     group.pastMembers = [...(group.pastMembers || []), { user: me, removedAt: new Date() }];

//     if (group.admins.length === 0 && group.members.length > 0) {
//       group.admins = [group.members[0]];
//     }

//     await group.save();
//     res.json({ success: true, message: "You left the group" });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// /* 7) Get my groups */
// // export const getMyGroups = async (req, res) => {
// //   try {
// //     const groups = await Group.find({ members: req.user._id })
// //       .populate("admins", "name email")
// //       .populate("members", "name email")
// //       .sort({ updatedAt: -1 });
// //     res.json({ groups });
// //   } catch (e) {
// //     res.status(500).json({ message: e.message });
// //   }
// // };
// /* 7) Get my groups (populate lastMessage + add lightweight fields) */
// /* 7) Get my groups (populate lastMessage + lightweight preview fields) */
// export const getMyGroups = async (req, res) => {
//   try {
//     const groups = await Group.find({ members: req.user._id })
//       .select("name profilePic updatedAt createdAt pinned muted archived lastMessage")
//       .populate({
//         path: "lastMessage",
//         // IMPORTANT: include all media URL fields so we can infer kind client-side
//         select:
//           "text message messageType createdAt msgByUser imageUrl videoUrl audioUrl fileUrl fileName fileSize",
//         populate: { path: "msgByUser", select: "name profilePic" },
//       })
//       .sort({ updatedAt: -1 })
//       .lean();

//     // If lastMessage isn't populated (null) or is not enough, backfill with a single query
//     const ensureLastFor = async (g) => {
//       if (g.lastMessage) return g;

//       const last = await Msg.findOne({ groupId: g._id })
//         .sort({ createdAt: -1 })
//         .select(
//           "text message messageType createdAt msgByUser imageUrl videoUrl audioUrl fileUrl fileName fileSize"
//         )
//         .populate({ path: "msgByUser", select: "name profilePic" })
//         .lean();

//       return { ...g, lastMessage: last || null };
//     };

//     const withLast = await Promise.all(groups.map(ensureLastFor));

//     // Build lightweight preview fields the frontend uses
//     const out = withLast.map((g) => {
//       const m = g.lastMessage;

//       // robust kind detection
//       const kind =
//         m?.messageType ||
//         (m?.imageUrl ? "image" :
//          m?.videoUrl ? "video" :
//          m?.audioUrl ? "audio" :
//          m?.fileUrl  ? "file"  :
//          (m ? "text" : "none"));

//       // robust text extraction (only for text messages)
//       const text =
//         kind === "text"
//           ? (m?.text || m?.message || "")
//           : ""; // leave empty for media so the UI shows "Image/Video/File"

//       return {
//         ...g,
//         lastMessageText: text,
//         lastMessageType: kind,
//         lastMessageAt: m?.createdAt || g.updatedAt || g.createdAt,
//         lastMessageSenderId: m?.msgByUser?._id || null,
//         lastMessageSenderName: m?.msgByUser?.name || "",
//       };
//     });

//     return res.json({ groups: out });
//   } catch (e) {
//     return res.status(500).json({ message: e.message });
//   }
// };

// /* X) Get last message of a group (fallback for client enrichment) */
// export const getGroupLastMessage = async (req, res) => {
//   try {
//     const { groupId } = req.params;
//     // NOTE: your message model uses "groupId" (not "group") in getGroupDetails,
//     // so we query by { groupId } here too.
//     const last = await Msg.findOne({ groupId })
//       .sort({ createdAt: -1 })
//       .select("message messageType createdAt msgByUser imageUrl videoUrl audioUrl fileUrl fileName")
//       .populate({ path: "msgByUser", select: "name profilePic" })
//       .lean();

//     return res.json({ message: last || null });
//   } catch (e) {
//     return res.status(500).json({ message: e.message });
//   }
// };

// /* 8) Delete Group */
// export const deleteGroup = async (req, res) => {
//   try {
//     const { groupId } = req.body;
//     const group = await Group.findById(groupId);
//     if (!group) return res.status(404).json({ message: "Group not found" });
//     if (!isAdmin(group, req.user._id))
//       return res.status(403).json({ message: "Only admins can delete group" });

//     await Msg.deleteMany({ groupId });
//     await group.deleteOne();
//     res.json({ success: true, message: "Group deleted" });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };

// /* 9) Group details + messages (attach generic `url` for media) */
// export const getGroupDetails = async (req, res) => {
//   try {
//     const { groupId } = req.params;
//     const group = await Group.findById(groupId)
//       .populate("admins", "name email")
//       .populate("members", "name email")
//       .lean();
//     if (!group) return res.status(404).json({ message: "Group not found" });

//     const messages = await Msg.find({ groupId })
//       .populate("msgByUser", "name email")
//       .sort({ createdAt: 1 })
//       .lean();

//     // normalize: give frontend a single `url` field so previews don't disappear
//     const normalized = messages.map((m) => ({
//       ...m,
//       url: m.imageUrl || m.audioUrl || m.videoUrl || m.fileUrl || null,  fileName: m.fileName || null,
//   fileSize: typeof m.fileSize === "number" ? m.fileSize : null,
//   // keep messageType as-is so the UI renders correct bubble
//   messageType: m.messageType || (m.fileUrl ? "file" : m.imageUrl ? "image" : m.audioUrl ? "audio" : m.videoUrl ? "video" : "text"),
//     }));

//     res.json({ success: true, group, messages: normalized });
//   } catch (error) {
//     res.status(500).json({ success: false, message: error.message });
//   }
// };
// export const togglePinGroup = async (req, res) => {
//   const { groupId } = req.params;
//   const { pinned } = req.body; // boolean
//   const doc = await Group.findByIdAndUpdate(
//     groupId,
//     { $set: { pinned: !!pinned } },
//     { new: true }
//   );
//   if (!doc) return res.status(404).json({ message: "Group not found" });
//   return res.json({ pinned: doc.pinned });
// };

// export const toggleArchiveGroup = async (req, res) => {
//   const { groupId } = req.params;
//   const { archived } = req.body;
//   const doc = await Group.findByIdAndUpdate(
//     groupId,
//     { $set: { archived: !!archived } },
//     { new: true }
//   );
//   if (!doc) return res.status(404).json({ message: "Group not found" });
//   return res.json({ archived: doc.archived });
// };

// export const toggleMuteGroup = async (req, res) => {
//   const { groupId } = req.params;
//   const { muted } = req.body;
//   const doc = await Group.findByIdAndUpdate(
//     groupId,
//     { $set: { muted: !!muted } },
//     { new: true }
//   );
//   if (!doc) return res.status(404).json({ message: "Group not found" });
//   return res.json({ muted: doc.muted });
// };
// /* 10) Past members endpoint */
// export const getPastMembers = async (req, res) => {
//   try {
//     const { groupId } = req.params;
//     const group = await Group.findById(groupId)
//       .populate("pastMembers.user", "name email")
//       .lean();
//     if (!group) return res.status(404).json({ message: "Group not found" });

//     res.json({
//       success: true,
//       pastMembers: (group.pastMembers || []).map((pm) => ({
//         _id: pm.user?._id,
//         name: pm.user?.name,
//         email: pm.user?.email,
//         removedAt: pm.removedAt,
//       })),
//     });
//   } catch (e) {
//     res.status(500).json({ success: false, message: e.message });
//   }
// };
// Controllers/groupController.js
import Group from "../Models/groupModel.js";
import Msg from "../Models/msgModel.js";
import Pref from "../Models/prefModel.js";

/* ---------- helpers ---------- */
// const toStr = (id) => id?.toString?.() || String(id || "");
// const isAdmin = (group, userId) => (group.admins || []).some((id) => toStr(id) === toStr(userId));
// const isMember = (group, userId) => (group.members || []).some((id) => toStr(id) === toStr(userId));
// // helpers (top of controller)
// helpers (replace the old toStr/isAdmin/isMember)
const toStr = (id) => id?.toString?.() || String(id || "");
const pickId = (x) => (x && (x._id || x.id)) ? (x._id || x.id) : x;
const sameId = (a, b) => toStr(pickId(a)) === toStr(pickId(b));

const isAdmin  = (group, userId) => (group.admins  || []).some((x) => sameId(x, userId));
const isMember = (group, userId) => (group.members || []).some((x) => sameId(x, userId));


const requireOwner = (req, res) => {
  const me = req?.user?._id;
  if (!me) {
    res.status(401).json({ message: "Auth required" });
    return null;
  }
  return me;
};

const getPrefGroup = async (ownerId, groupId) => {
  let pref = await Pref.findOne({ owner: ownerId, scope: "group", target: groupId });
  if (!pref) {
    pref = await Pref.create({
      owner: ownerId,
      scope: "group",
      target: groupId,
      isPinned: false,
      isMuted: false,
      isArchived: false,
      hidden: false,
    });
  }
  return pref;
};

const mergeGroupWithPrefs = (groups, prefMapById) =>
  groups.map((g) => {
    const pid = toStr(g._id);
    const p = prefMapById.get(pid);
    return {
      ...g,
      pinned: !!p?.isPinned,
      muted: !!p?.isMuted,
      archived: !!p?.isArchived,
      hidden: !!p?.hidden,
    };
  });

/* 1) Create Group */
// controllers/groups.js  (createGroup)
export const createGroup = async (req, res) => {
  try {
    const { name, members = [], profilePic = "" } = req.body;
    const me = req.user._id;

    // Creator FIRST, then the rest (deduped)
    const uniqueMembers = Array.from(
      new Set([String(me), ...(members || []).map(String)])
    );

    const group = await Group.create({
      name: name?.trim(),
      createdBy: me,
      admins: [me],           // ← force creator as only admin
      members: uniqueMembers, // ← creator is index 0
      profilePic,
    });

    return res.status(201).json({ success: true, group });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};


/* 2) Update Group (name / profilePic) */
export const updateGroup = async (req, res) => {
  try {
    const { groupId, name, profilePic } = req.body;
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });
    if (!isAdmin(group, req.user._id))
      return res.status(403).json({ message: "Only admins can update group" });

    if (typeof name === "string" && name.trim()) group.name = name.trim();
    if (typeof profilePic === "string") group.profilePic = profilePic;

    await group.save();
    const populated = await Group.findById(groupId)
      .populate("admins", "name email")
      .populate("members", "name email");
    res.json({ success: true, group: populated });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};

/* 3) Add Member */
export const addMember = async (req, res) => {
  try {
    const { groupId, userId } = req.body;
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });
    if (!isAdmin(group, req.user._id))
      return res.status(403).json({ message: "Only admins can add members" });
    if (isMember(group, userId))
      return res.status(400).json({ message: "User already in group" });

    group.members.push(userId);
    // if the user was a past member, remove that log
    group.pastMembers = (group.pastMembers || []).filter(
      (pm) => toStr(pm.user) !== toStr(userId)
    );

    await group.save();
    const populated = await Group.findById(groupId)
      .populate("admins", "name email")
      .populate("members", "name email");
    res.json({ success: true, message: "Member added", group: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* 4) Remove Member (logs to pastMembers) */
export const removeMember = async (req, res) => {
  try {
    const { groupId, userId } = req.body;
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });
    if (!isAdmin(group, req.user._id))
      return res.status(403).json({ message: "Only admins can remove members" });

    const userIdStr = toStr(userId);
    group.members = group.members.filter((id) => toStr(id) !== userIdStr);
    group.admins  = group.admins.filter((id)  => toStr(id) !== userIdStr);
    group.pastMembers = [...(group.pastMembers || []), { user: userId, removedAt: new Date() }];

    // ensure at least 1 admin if members remain
    if (group.admins.length === 0 && group.members.length > 0) {
      group.admins = [group.members[0]];
    }

    await group.save();
    const populated = await Group.findById(groupId)
      .populate("admins", "name email")
      .populate("members", "name email");
    res.json({ success: true, message: "Member removed", group: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* 5) Add Admin (multiple admins supported) */
export const addAdmin = async (req, res) => {
  try {
    const { groupId, newAdminId } = req.body;
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });
    if (!isAdmin(group, req.user._id))
      return res.status(403).json({ message: "Only admins can add new admins" });
    if (!isMember(group, newAdminId))
      return res.status(400).json({ message: "New admin must be a group member" });

    if (!isAdmin(group, newAdminId)) group.admins.push(newAdminId);
    await group.save();

    const populated = await Group.findById(groupId)
      .populate("admins", "name email")
      .populate("members", "name email");
    res.json({ success: true, message: "Admin added", group: populated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* 6) Leave Group (logs to pastMembers) */
export const leaveGroup = async (req, res) => {
  try {
    const { groupId } = req.body;
    const me = req.user._id;
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const meStr = toStr(me);
    group.members = group.members.filter((id) => toStr(id) !== meStr);
    group.admins  = group.admins.filter((id)  => toStr(id) !== meStr);
    group.pastMembers = [...(group.pastMembers || []), { user: me, removedAt: new Date() }];

    if (group.admins.length === 0 && group.members.length > 0) {
      group.admins = [group.members[0]];
    }

    await group.save();
    res.json({ success: true, message: "You left the group" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* 7) Get my groups (populate lastMessage + merge per-user prefs) */
export const getMyGroups = async (req, res) => {
  try {
    const me = requireOwner(req, res);
    if (!me) return;

    // const groups = await Group.find({ members: me })
    // show groups where I'm a member, an admin, or the creator
   const groups = await Group.find({
     $or: [{ members: me }, { admins: me }, { createdBy: me }],
  })
      .select("name profilePic updatedAt createdAt lastMessage") // group-level flags removed (we use Pref)
      .populate({
        path: "lastMessage",
        select:
          "text message messageType createdAt msgByUser imageUrl videoUrl audioUrl fileUrl fileName fileSize",
        populate: { path: "msgByUser", select: "name profilePic" },
      })
      .sort({ updatedAt: -1 })
      .lean();

    // backfill lastMessage if needed
    const withLast = await Promise.all(
      groups.map(async (g) => {
        if (g.lastMessage) return g;
        const last = await Msg.findOne({ groupId: g._id })
          .sort({ createdAt: -1 })
          .select(
            "text message messageType createdAt msgByUser imageUrl videoUrl audioUrl fileUrl fileName fileSize"
          )
          .populate({ path: "msgByUser", select: "name profilePic" })
          .lean();
        return { ...g, lastMessage: last || null };
      })
    );

    // fetch this user's prefs for these groups
    const ids = withLast.map((g) => g._id);
    const prefs = await Pref.find({
      owner: me,
      scope: "group",
      target: { $in: ids },
    }).lean();

    const prefMap = new Map(prefs.map((p) => [toStr(p.target), p]));
    const merged = mergeGroupWithPrefs(withLast, prefMap);

    // build lightweight preview fields (same shape you already use)
    const out = merged.map((g) => {
      const m = g.lastMessage;

      const kind =
        m?.messageType ||
        (m?.imageUrl ? "image" :
         m?.videoUrl ? "video" :
         m?.audioUrl ? "audio" :
         m?.fileUrl  ? "file"  :
         (m ? "text" : "none"));

      const text = kind === "text" ? (m?.text || m?.message || "") : "";

      return {
        ...g,
        lastMessageText: text,
        lastMessageType: kind,
        lastMessageAt: m?.createdAt || g.updatedAt || g.createdAt,
        lastMessageSenderId: m?.msgByUser?._id || null,
        lastMessageSenderName: m?.msgByUser?.name || "",
      };
    });

    return res.json({ groups: out });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

/* X) Get last message of a group (fallback for client enrichment) */
export const getGroupLastMessage = async (req, res) => {
  try {
    const { groupId } = req.params;
    const last = await Msg.findOne({ groupId })
      .sort({ createdAt: -1 })
      .select("message messageType createdAt msgByUser imageUrl videoUrl audioUrl fileUrl fileName")
      .populate({ path: "msgByUser", select: "name profilePic" })
      .lean();

    return res.json({ message: last || null });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

/* 8) Delete Group */
export const deleteGroup = async (req, res) => {
  try {
    const { groupId } = req.body;
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });
    if (!isAdmin(group, req.user._id))
      return res.status(403).json({ message: "Only admins can delete group" });

    await Msg.deleteMany({ groupId });
    await group.deleteOne();
    res.json({ success: true, message: "Group deleted" });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/* 9) Group details + messages (attach generic `url` + include my flags) */
export const getGroupDetails = async (req, res) => {
  try {
    const me = requireOwner(req, res);
    if (!me) return;

    const { groupId } = req.params;
    const group = await Group.findById(groupId)
      .populate("admins", "name email")
      .populate("members", "name email")
      .lean();
    if (!group) return res.status(404).json({ message: "Group not found" });

    const messages = await Msg.find({ groupId })
      .populate("msgByUser", "name email")
      .sort({ createdAt: 1 })
      .lean();

    const normalized = messages.map((m) => ({
      ...m,
      url: m.imageUrl || m.audioUrl || m.videoUrl || m.fileUrl || null,
      fileName: m.fileName || null,
      fileSize: typeof m.fileSize === "number" ? m.fileSize : null,
      messageType:
        m.messageType ||
        (m.fileUrl
          ? "file"
          : m.imageUrl
          ? "image"
          : m.audioUrl
          ? "audio"
          : m.videoUrl
          ? "video"
          : "text"),
    }));

    // my prefs for this group
    const pref = await Pref.findOne({ owner: me, scope: "group", target: groupId }).lean();
    const flags = {
      pinned: !!pref?.isPinned,
      muted: !!pref?.isMuted,
      archived: !!pref?.isArchived,
      hidden: !!pref?.hidden,
    };

    res.json({ success: true, group: { ...group, ...flags }, messages: normalized });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Toggle Pin (per user)
 * PUT /api/groups/:groupId/pin
 * body: { pinned:Boolean } (optional). If not provided, it toggles.
 */
export const togglePinGroup = async (req, res) => {
  try {
    const me = requireOwner(req, res);
    if (!me) return;

    const { groupId } = req.params;
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const pref = await getPrefGroup(me, groupId);
    const desired = typeof req.body?.pinned === "boolean" ? !!req.body.pinned : !pref.isPinned;
    pref.isPinned = desired;
    if (desired) pref.isArchived = false; // unarchive when pinning
    await pref.save();

    return res.json({ pinned: pref.isPinned });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

/**
 * Toggle Archive (per user)
 * PUT /api/groups/:groupId/archive
 * body: { archived:Boolean } (optional). If not provided, it toggles.
 */
export const toggleArchiveGroup = async (req, res) => {
  try {
    const me = requireOwner(req, res);
    if (!me) return;

    const { groupId } = req.params;
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const pref = await getPrefGroup(me, groupId);
    const desired = typeof req.body?.archived === "boolean" ? !!req.body.archived : !pref.isArchived;
    pref.isArchived = desired;
    if (desired) pref.isPinned = false; // unpin when archiving
    await pref.save();

    return res.json({ archived: pref.isArchived });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

/**
 * Toggle Mute (per user)
 * PUT /api/groups/:groupId/mute
 * body: { muted:Boolean } (optional). If not provided, it toggles.
 */
export const toggleMuteGroup = async (req, res) => {
  try {
    const me = requireOwner(req, res);
    if (!me) return;

    const { groupId } = req.params;
    const group = await Group.findById(groupId);
    if (!group) return res.status(404).json({ message: "Group not found" });

    const pref = await getPrefGroup(me, groupId);
    const desired = typeof req.body?.muted === "boolean" ? !!req.body.muted : !pref.isMuted;
    pref.isMuted = desired;
    await pref.save();

    return res.json({ muted: pref.isMuted });
  } catch (e) {
    return res.status(500).json({ message: e.message });
  }
};

/* 10) Past members endpoint */
export const getPastMembers = async (req, res) => {
  try {
    const { groupId } = req.params;
    const group = await Group.findById(groupId)
      .populate("pastMembers.user", "name email")
      .lean();
    if (!group) return res.status(404).json({ message: "Group not found" });

    res.json({
      success: true,
      pastMembers: (group.pastMembers || []).map((pm) => ({
        _id: pm.user?._id,
        name: pm.user?.name,
        email: pm.user?.email,
        removedAt: pm.removedAt,
      })),
    });
  } catch (e) {
    res.status(500).json({ success: false, message: e.message });
  }
};
