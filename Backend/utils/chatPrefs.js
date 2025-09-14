// utils/chatPrefs.js
import ChatPref from "../models/chatPrefModel.js";

export async function togglePref(userId, targetType, targetId, field) {
  const now = new Date();
  const pref = await ChatPref.findOneAndUpdate(
    { userId, targetType, targetId },
    {
      $setOnInsert: { userId, targetType, targetId },
      $bit: { }, // placeholder to allow upsert + atomic set below
    },
    { new: true, upsert: true }
  );

  const next = !pref[field];
  pref[field] = next;
  if (field === "isPinned")   pref.pinnedAt   = next ? now : null;
  if (field === "isArchived") pref.archivedAt = next ? now : null;
  if (field === "isMuted")    pref.mutedUntil = null; // or set a duration window

  await pref.save();
  return pref.toObject();
}

export async function setDeleted(userId, targetType, targetId) {
  const pref = await ChatPref.findOneAndUpdate(
    { userId, targetType, targetId },
    { $set: { isDeleted: true, isPinned: false, isArchived: false } },
    { new: true, upsert: true }
  );
  return pref.toObject();
}
