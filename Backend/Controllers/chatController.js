
import Convo from "../Models/convModel.js";
import Pref from "../Models/prefModel.js";


const requireOwner = (req, res) => {
  const me = req?.user?._id;
  if (!me) {
    res.status(401).json({ message: "Auth required" });
    return null;
  }
  return me;
};


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
