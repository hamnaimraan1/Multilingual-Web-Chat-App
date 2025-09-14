// // Controllers/chatController.js
// import Convo from "../Models/convModel.js";

// // Mute / Unmute chat
// export const toggleMuteChat = async (req, res) => {
//   try {
//     const { chatId } = req.params;
//     const chat = await Convo.findById(chatId);
//     if (!chat) return res.status(404).json({ message: "Convo not found" });

//     chat.isMuted = !chat.isMuted;
//     await chat.save();

//     // return flags for easy UI updates
//     res.json({ success: true, isMuted: chat.isMuted, chatId: chat._id });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // Archive / Unarchive chat
// export const toggleArchiveChat = async (req, res) => {
//   try {
//     const { chatId } = req.params;
//     const chat = await Convo.findById(chatId);
//     if (!chat) return res.status(404).json({ message: "Convo not found" });

//     chat.isArchived = !chat.isArchived;
//     await chat.save();

//     res.json({ success: true, isArchived: chat.isArchived, chatId: chat._id });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // Pin / Unpin chat
// export const togglePinChat = async (req, res) => {
//   try {
//     const { chatId } = req.params;
//     const chat = await Convo.findById(chatId);
//     if (!chat) return res.status(404).json({ message: "Convo not found" });

//     chat.isPinned = !chat.isPinned;
//     await chat.save();

//     res.json({ success: true, isPinned: chat.isPinned, chatId: chat._id });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };

// // Delete chat (simple delete)
// export const deleteChat = async (req, res) => {
//   try {
//     const { chatId } = req.params;
//     await Convo.findByIdAndDelete(chatId);
//     res.json({ success: true, message: "Convo deleted successfully", chatId });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// };
// Controllers/chatController.js
import Convo from "../Models/convModel.js";
import Pref from "../Models/prefModel.js";

/**
 * Ensure we have a logged-in user (needs auth middleware on the route!).
 */
const requireOwner = (req, res) => {
  const me = req?.user?._id;
  if (!me) {
    res.status(401).json({ message: "Auth required" });
    return null;
  }
  return me;
};

/**
 * Get or create a per-user pref doc for a DM (scope='dm', target=<chatId>).
 */
const getPrefDM = async (ownerId, chatId) => {
  let pref = await Pref.findOne({ owner: ownerId, scope: "dm", target: chatId });
  if (!pref) {
    pref = await Pref.create({
      owner: ownerId,
      scope: "dm",
      target: chatId,
      isPinned: false,
      isMuted: false,
      isArchived: false,
      hidden: false,
    });
  }
  return pref;
};

/**
 * Return a small, uniform payload for UI.
 */
const outFlags = (chatId, pref) => ({
  success: true,
  chatId,
  isPinned: !!pref?.isPinned,
  isMuted: !!pref?.isMuted,
  isArchived: !!pref?.isArchived,
  hidden: !!pref?.hidden,
});

/**
 * Toggle Mute (per user)
 * PUT /api/chat/:chatId/mute
 */
export const toggleMuteChat = async (req, res) => {
  try {
    const me = requireOwner(req, res);
    if (!me) return;

    const { chatId } = req.params;
    const convo = await Convo.findById(chatId);
    if (!convo) return res.status(404).json({ message: "Convo not found" });

    const pref = await getPrefDM(me, chatId);
    pref.isMuted = !pref.isMuted;
    await pref.save();

    return res.json({ ...outFlags(chatId, pref), isMuted: pref.isMuted });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Toggle Archive (per user)
 * PUT /api/chat/:chatId/archive
 */
export const toggleArchiveChat = async (req, res) => {
  try {
    const me = requireOwner(req, res);
    if (!me) return;

    const { chatId } = req.params;
    const convo = await Convo.findById(chatId);
    if (!convo) return res.status(404).json({ message: "Convo not found" });

    const pref = await getPrefDM(me, chatId);
    pref.isArchived = !pref.isArchived;
    // When archived, it should also be unpinned (WhatsApp behavior). Optional:
    if (pref.isArchived) pref.isPinned = false;
    await pref.save();

    return res.json({ ...outFlags(chatId, pref), isArchived: pref.isArchived });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Toggle Pin (per user)
 * PUT /api/chat/:chatId/pin
 */
export const togglePinChat = async (req, res) => {
  try {
    const me = requireOwner(req, res);
    if (!me) return;

    const { chatId } = req.params;
    const convo = await Convo.findById(chatId);
    if (!convo) return res.status(404).json({ message: "Convo not found" });

    const pref = await getPrefDM(me, chatId);
    // Pinned chats should not be archived
    pref.isPinned = !pref.isPinned;
    if (pref.isPinned) pref.isArchived = false;
    await pref.save();

    return res.json({ ...outFlags(chatId, pref), isPinned: pref.isPinned });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

/**
 * Delete chat for ME (soft-delete via Pref.hidden)
 * DELETE /api/chat/:chatId/delete
 *
 * NOTE: This does not delete the conversation globally. It hides it for this user,
 * like WhatsApp's "Clear/Hide" semantics. If you truly want to delete the convo,
 * that should be a separate admin/mod action.
 */
export const deleteChat = async (req, res) => {
  try {
    const me = requireOwner(req, res);
    if (!me) return;

    const { chatId } = req.params;
    const convo = await Convo.findById(chatId);
    if (!convo) return res.status(404).json({ message: "Convo not found" });

    const pref = await getPrefDM(me, chatId);
    pref.hidden = true;           // hide for this user
    pref.isPinned = false;        // also drop pin
    pref.isArchived = false;      // and archive flag
    await pref.save();

    return res.json({ ...outFlags(chatId, pref), message: "Chat hidden for you" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
