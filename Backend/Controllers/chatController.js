// Controllers/chatController.js
import Convo from "../Models/convModel.js";

// Mute / Unmute chat
export const toggleMuteChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const chat = await Convo.findById(chatId);
    if (!chat) return res.status(404).json({ message: "Convo not found" });

    chat.isMuted = !chat.isMuted;
    await chat.save();

    // return flags for easy UI updates
    res.json({ success: true, isMuted: chat.isMuted, chatId: chat._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Archive / Unarchive chat
export const toggleArchiveChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const chat = await Convo.findById(chatId);
    if (!chat) return res.status(404).json({ message: "Convo not found" });

    chat.isArchived = !chat.isArchived;
    await chat.save();

    res.json({ success: true, isArchived: chat.isArchived, chatId: chat._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Pin / Unpin chat
export const togglePinChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    const chat = await Convo.findById(chatId);
    if (!chat) return res.status(404).json({ message: "Convo not found" });

    chat.isPinned = !chat.isPinned;
    await chat.save();

    res.json({ success: true, isPinned: chat.isPinned, chatId: chat._id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Delete chat (simple delete)
export const deleteChat = async (req, res) => {
  try {
    const { chatId } = req.params;
    await Convo.findByIdAndDelete(chatId);
    res.json({ success: true, message: "Convo deleted successfully", chatId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
