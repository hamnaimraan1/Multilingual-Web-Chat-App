
import express from "express";
import { Server } from "socket.io";
import http from "http";
import { translate } from "@vitalets/google-translate-api";
import fs from "fs";
import Group from "../Models/groupModel.js"; 

import User from "../Models/userModel.js";
import msgModel from "../Models/msgModel.js";
import convModel from "../Models/convModel.js";
import getUserByTok from "../utils/getUserByTok.js";
import getConv from "../utils/getConv.js";
import { downloadAudioFile, transcribeAudio, translateText } from "../utils/voiceTranslate.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.Frontend_url || "http://localhost:3000",
    credentials: true,
  },
});

const online = new Set();

io.on("connect", async (socket) => {
  const tok = socket.handshake.auth.token;
  const user = await getUserByTok(tok);

  if (!user) {
    console.log("Unauthorized socket connection");
    socket.disconnect(true);
    return;
  }
  

  const userId = user._id.toString();
  socket.userId = userId;
  socket.join(userId);
  online.add(userId);

  // Send initial conversation list
  const conv = await getConv(userId);
  socket.emit("conv", conv);

  io.emit("online", Array.from(online));

  // Sidebar conversation refresh
  socket.on("side", async (userId) => {
    const conv = await getConv(userId);
    socket.emit("conv", conv);
  });

  // Load messages for a chat
  socket.on("msgPage", async (chatUserId) => {
    const chatRoom = [socket.userId, chatUserId].sort().join("-");
    socket.join(chatRoom);

    const chatUser = await User.findById(chatUserId);
    if (chatUser) {
      socket.emit("userInfo", {
        _id: chatUser._id,
        name: chatUser.name,
        email: chatUser.email,
        profilePic: chatUser.profilePic,
        online: online.has(chatUser._id.toString()),
      });

      const getMsgs = await convModel.findOne({
        $or: [
          { sender: chatUser._id, receiver: socket.userId },
          { sender: socket.userId, receiver: chatUser._id },
        ],
      })
        .populate("original_messages")
        .populate("translated_messages");

      socket.emit("message", {
        chatWith: chatUser._id.toString(),
        original: getMsgs?.original_messages || [],
        translated: getMsgs?.translated_messages || [],
      });
    }
  });

  // Handle new messages
  socket.on("newMsg", async (data) => {
    if (!data.sender || !data.receiver || !data.messageType) return;

    let conv = await convModel.findOne({
      $or: [
        { sender: data.sender, receiver: data.receiver },
        { sender: data.receiver, receiver: data.sender },
      ],
    });

    if (!conv) {
      conv = new convModel({ sender: data.sender, receiver: data.receiver });
      await conv.save();
    }

    // let translatedText = null;
    // if (data.messageType === "text" && data.text) {
    //   const receiver = await User.findById(data.receiver);
    //   const preferredLang = receiver?.preferredLanguage || "en";
    //   try {
    //     const res = await translate(data.text, { to: preferredLang });
    //     translatedText = res.text;
    //   } catch (err) {
    //     console.error("Translation error:", err.message);
    //   }
    // }
let translatedText = null;

if (data.messageType === "text" && data.text) {
  // Text message translation
  const receiver = await User.findById(data.receiver);
  const preferredLang = receiver?.preferredLanguage || "en";
  try {
    const res = await translate(data.text, { to: preferredLang });
    translatedText = res.text;
  } catch (err) {
    console.error("Translation error:", err.message);
  }

} else if (data.messageType === "voice" && data.audioUrl) {
  // Voice message: transcribe + translate
  try {
    const filePath = await downloadAudioFile(data.audioUrl);
    const transcription = await transcribeAudio(filePath);

    const receiver = await User.findById(data.receiver);
    const preferredLang = receiver?.preferredLanguage || "en";
    translatedText = await translateText(transcription, preferredLang);

    // Store the transcription as the text so it's saved in DB
    data.text = transcription;

    fs.unlinkSync(filePath);
  } catch (err) {
    console.error("Voice processing error:", err.message);
  }
}

    const message = new msgModel({
      msgByUser: data.sender,
      messageType: data.messageType,
      text: data.text || null,
      translatedMessage: translatedText || null,
      imageUrl: data.imageUrl || null,
      videoUrl: data.videoUrl || null,
      audioUrl: data.audioUrl || null,
    });

    await message.save();

    conv.original_messages.push(message);
    if (translatedText) conv.translated_messages.push(message);
    await conv.save();

    // Fetch conversation with both original and translated messages
const updatedConv = await convModel.findById(conv._id)
  .populate("original_messages")
  .populate("translated_messages");

// Send to sender
io.to(data.sender).emit("message", {
  chatWith: data.receiver,
  original: updatedConv.original_messages,
  translated: updatedConv.translated_messages,
});

// Send to receiver
io.to(data.receiver).emit("message", {
  chatWith: data.sender,
  original: updatedConv.original_messages,
  translated: updatedConv.translated_messages,
});

    const sendConversation = await getConv(data.sender);
    const recConversation = await getConv(data.receiver);

    io.to(data.sender).emit("conv", sendConversation);
    io.to(data.receiver).emit("conv", recConversation);
  });

  // Seen messages event
  socket.on("seen", async ({ senderId, receiverId }) => {
    try {
      const convo = await convModel.findOne({
        $or: [
          { sender: senderId, receiver: receiverId },
          { sender: receiverId, receiver: senderId },
        ],
      }).populate("original_messages");

      if (!convo) return;

      const messageIds = convo.original_messages
        .filter((msg) => msg.msgByUser.toString() === senderId && !msg.seen)
        .map((msg) => msg._id);

      if (messageIds.length > 0) {
        await msgModel.updateMany(
          { _id: { $in: messageIds } },
          { $set: { seen: true } }
        );

        const chatRoom = [senderId, receiverId].sort().join("-");
        io.to(chatRoom).emit("seenStatusUpdate", messageIds);
      }

      const updatedSenderConv = await getConv(senderId);
      const updatedReceiverConv = await getConv(receiverId);

      io.to(senderId).emit("conv", updatedSenderConv);
      io.to(receiverId).emit("conv", updatedReceiverConv);
    } catch (err) {
      console.error("Error in seenMessages handler:", err.message);
    }
  });

  // 🎙 Voice translation feature (moved outside "seen")
 socket.on("translateVoice", async ({ audioUrl, receiverId, messageId }) => {
  try {
    if (!audioUrl) throw new Error("Audio URL is missing");
    const filePath = await downloadAudioFile(audioUrl);

    const transcription = await transcribeAudio(filePath);

    // const receiver = await User.findById(receiverId);
    // const preferredLang = receiver?.preferredLanguage || "en";
    // const translated = await translateText(transcription, preferredLang);
    // Find the message to know who sent it
const message = await msgModel.findById(messageId).populate("msgByUser");

// Find the conversation that contains this message
const conv = await convModel.findOne({ original_messages: messageId });

if (!conv) throw new Error("Conversation not found");

// Determine receiverId based on conversation
const receiverId = (conv.sender.toString() === message.msgByUser._id.toString())
  ? conv.receiver
  : conv.sender;

// Get receiver's preferred language
const receiver = await User.findById(receiverId);
const preferredLang = receiver?.preferredLanguage || "en";

// Now translate to receiver's language
const translated = await translateText(transcription, preferredLang);

    await msgModel.findByIdAndUpdate(messageId, {
  translatedVoiceText: translated,
    voiceTranscription: transcription, // 🆕 save original transcription

});


    fs.unlinkSync(filePath); // delete temp file

    // Send translation result back with messageId
    socket.emit("voiceTranslationResult", {
      messageId,
      originalText: transcription,
      translatedText: translated,
    });
  } catch (err) {
    console.error("Voice translation error:", err);
    socket.emit("voiceTranslationError", {
      messageId,
      error: "Failed to translate voice message",
    });
  }
});


  // Handle disconnect
  socket.on("disconnect", () => {
    if (socket.userId) {
      online.delete(socket.userId);
      io.emit("online", Array.from(online));
    }
  });
});

export { app, server };
