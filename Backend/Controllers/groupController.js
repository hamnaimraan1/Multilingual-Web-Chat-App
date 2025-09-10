// Controllers/groupController.js
import Group from "../Models/groupModel.js";
import Msg from "../Models/msgModel.js";

/* ---------- helpers ---------- */
const toStr = (id) => id?.toString?.() || String(id || "");
const isAdmin = (group, userId) => (group.admins || []).some((id) => toStr(id) === toStr(userId));
const isMember = (group, userId) => (group.members || []).some((id) => toStr(id) === toStr(userId));

/* 1) Create Group */
export const createGroup = async (req, res) => {
  try {
    const { name, members = [], profilePic = "" } = req.body;
    const me = req.user._id;

    const uniqueMembers = Array.from(new Set([...members.map(String), String(me)]));

    const group = await Group.create({
      name: name?.trim(),
      createdBy: me,
      admins: [me],
      members: uniqueMembers,
      profilePic,
    });

    res.status(201).json({ success: true, group });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
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

/* 7) Get my groups */
export const getMyGroups = async (req, res) => {
  try {
    const groups = await Group.find({ members: req.user._id })
      .populate("admins", "name email")
      .populate("members", "name email")
      .sort({ updatedAt: -1 });
    res.json({ groups });
  } catch (e) {
    res.status(500).json({ message: e.message });
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

/* 9) Group details + messages (attach generic `url` for media) */
export const getGroupDetails = async (req, res) => {
  try {
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

    // normalize: give frontend a single `url` field so previews don't disappear
    const normalized = messages.map((m) => ({
      ...m,
      url: m.imageUrl || m.audioUrl || m.videoUrl || m.fileUrl || null,  fileName: m.fileName || null,
  fileSize: typeof m.fileSize === "number" ? m.fileSize : null,
  // keep messageType as-is so the UI renders correct bubble
  messageType: m.messageType || (m.fileUrl ? "file" : m.imageUrl ? "image" : m.audioUrl ? "audio" : m.videoUrl ? "video" : "text"),
    }));

    res.json({ success: true, group, messages: normalized });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
export const togglePinGroup = async (req, res) => {
  const { groupId } = req.params;
  const { pinned } = req.body; // boolean
  const doc = await Group.findByIdAndUpdate(
    groupId,
    { $set: { pinned: !!pinned } },
    { new: true }
  );
  if (!doc) return res.status(404).json({ message: "Group not found" });
  return res.json({ pinned: doc.pinned });
};

export const toggleArchiveGroup = async (req, res) => {
  const { groupId } = req.params;
  const { archived } = req.body;
  const doc = await Group.findByIdAndUpdate(
    groupId,
    { $set: { archived: !!archived } },
    { new: true }
  );
  if (!doc) return res.status(404).json({ message: "Group not found" });
  return res.json({ archived: doc.archived });
};

export const toggleMuteGroup = async (req, res) => {
  const { groupId } = req.params;
  const { muted } = req.body;
  const doc = await Group.findByIdAndUpdate(
    groupId,
    { $set: { muted: !!muted } },
    { new: true }
  );
  if (!doc) return res.status(404).json({ message: "Group not found" });
  return res.json({ muted: doc.muted });
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
