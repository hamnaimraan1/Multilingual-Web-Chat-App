// import convModel from "../Models/convModel.js";
// import User from "../Models/userModel.js";

// const getConv = async (userId) => {
//   if (!userId) return [];

//   const userCon = await convModel.find({
//     $or: [{ sender: userId }, { receiver: userId }],
//   })
//     .populate("original_messages")
//     .populate("sender")
//     .populate("receiver")
//     .sort({ updatedAt: -1 });

//   const convo = userCon.map((conv) => {
//     const countUnseen = conv.original_messages.reduce((prev, msg) => {
//       const msgByID = msg.msgByUser.toString();
//       return msgByID !== userId && !msg.seen ? prev + 1 : prev;
//     }, 0);

//     return {
//       _id: conv._id,
//       sender: conv.sender,
//       receiver: conv.receiver,
//       unseen: countUnseen,
//     };
//   });

//   return convo;
// };

// export default getConv;
// utils/getConv.js
import mongoose from "mongoose";
import convModel from "../Models/convModel.js";
import Pref from "../Models/prefModel.js";

const toStr = (v) =>
  typeof v === "string" ? v : v?._id?.toString?.() || String(v || "");

const lastActivity = (c) => {
  const arr = c.original_messages || [];
  if (!arr.length) return new Date(c.updatedAt || c.createdAt || 0).getTime();
  const last = arr[arr.length - 1];
  return new Date(last?.createdAt || c.updatedAt || c.createdAt || 0).getTime();
};

/**
 * Return conversations for `me`, merged with per-user Pref flags.
 * Adds: isPinned, isMuted, isArchived, hidden, unseen
 * Filters out: hidden
 * Sorts: pinned first, then last activity desc
 */
export default async function getConv(me) {
  const meId = toStr(me);
  if (!mongoose.Types.ObjectId.isValid(meId)) return [];

  // Get basic convo list + messages for unseen + last activity
  const convos = await convModel
    .find({ $or: [{ sender: meId }, { receiver: meId }] })
    .populate({
      path: "original_messages",
      select:
        "seen createdAt msgByUser messageType text imageUrl videoUrl audioUrl fileUrl fileName fileSize",
    })
    .populate("sender", "name profilePic")
    .populate("receiver", "name profilePic")
    .lean();

  // Fetch this user's per-convo prefs in one shot
  const convoIds = convos.map((c) => c._id);
  const prefs = await Pref.find({
    owner: meId,
    scope: "dm",
    target: { $in: convoIds },
  }).lean();

  const prefByTarget = new Map(prefs.map((p) => [toStr(p.target), p]));

  // Merge flags + compute unseen
  const merged = convos
    .map((c) => {
      const p = prefByTarget.get(toStr(c._id)) || {};
      const unseen =
        (c.original_messages || []).filter(
          (m) => toStr(m.msgByUser) !== meId && !m.seen
        ).length || 0;

      return {
        _id: c._id,
        sender: c.sender,        // your sidebar expects sender/receiver here
        receiver: c.receiver,
        unseen,

        // Persisted, per-user flags from Pref
        isPinned: !!p.isPinned,
        isMuted: !!p.isMuted,
        isArchived: !!p.isArchived,
        hidden: !!p.hidden,

        // Keep for sorting
        _lastAt: lastActivity(c),
      };
    })
    // hide “deleted for me” chats
    .filter((c) => !c.hidden)
    // pinned first, then by recent activity
    .sort((a, b) => {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
      return b._lastAt - a._lastAt;
    })
    // don’t leak internal helper
    .map(({ _lastAt, ...rest }) => rest);

  return merged;
}
