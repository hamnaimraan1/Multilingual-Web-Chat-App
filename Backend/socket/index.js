

// import express from "express";
// import { Server } from "socket.io";
// import http from "http";
// import { translate } from "@vitalets/google-translate-api";
// import fs from "fs";
// import mongoose from "mongoose";

// import Group from "../Models/groupModel.js";
// import User from "../Models/userModel.js";
// import msgModel from "../Models/msgModel.js";
// import convModel from "../Models/convModel.js";
// import getUserByTok from "../utils/getUserByTok.js";
// import getConv from "../utils/getConv.js";
// import {
//   downloadAudioFile,
//   transcribeAudio,
//   translateText,
// } from "../utils/voiceTranslate.js";

// const app = express();
// const server = http.createServer(app);

// const io = new Server(server, {
//   cors: {
//     origin: process.env.Frontend_url || "http://localhost:3000",
//     credentials: true,
//   },
// });

// const online = new Set();
// const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

// /* ---------- helpers ---------- */
// const toPlain = (doc) => (doc?.toObject ? doc.toObject() : doc);

// /** Infer message type from URL extension when client doesn't send a type */
// const inferTypeFromUrl = (url = "") => {
//   const u = String(url || "").toLowerCase();
//   if (!u) return "text";
//   if (/\.(png|jpe?g|gif|webp|bmp|svg)(\?|$)/.test(u)) return "image";
//   if (/\.(mp3|wav|m4a|ogg|webm)(\?|$)/.test(u)) return "audio";
//   if (/\.(mp4|mov|webm|mkv)(\?|$)/.test(u)) return "video";
//   return "file";
// };

// /** Normalize message out to clients: keep url, messageType, filename & size */
// const normalizeMsgForClient = (doc, extra = {}) => {
//   const o = toPlain(doc) || {};

//   const url =
//     o.imageUrl || o.audioUrl || o.videoUrl || o.fileUrl || extra.url || null;

//   const messageType =
//     o.messageType ||
//     extra.messageType ||
//     inferTypeFromUrl(url || "");

//   // Filename/size: prefer stored values, but allow extra for optimistic ACKs
//   const fileName = o.fileName ?? extra.fileName ?? null;

//   const fileSize =
//     typeof o.fileSize === "number"
//       ? o.fileSize
//       : typeof extra.size === "number"
//       ? extra.size
//       : Number.isFinite(Number(extra.size))
//       ? Number(extra.size)
//       : null;

//   return {
//     ...o,
//     url,
//     messageType,
//     fileName,
//     fileSize,
//     size: fileSize, // alias for client code that expects "size"
//     clientNonce: extra.clientNonce ?? o.clientNonce ?? null,
//   };
// };

// const normalizeGroupForClient = (groupDoc) => {
//   const g = toPlain(groupDoc) || {};
//   const adminIds = (g.admins || []).map((a) =>
//     typeof a === "string" ? a : a?._id?.toString()
//   );
//   return { ...g, adminIds };
// };

// /* ---------- sockets ---------- */
// io.on("connect", async (socket) => {
//   const tok = socket.handshake.auth.token;
//   const user = await getUserByTok(tok);

//   if (!user) {
//     console.log("Unauthorized socket connection");
//     socket.disconnect(true);
//     return;
//   }

//   const userId = user._id.toString();
//   socket.userId = userId;
//   socket.join(userId);
//   online.add(userId);

//   // initial conversations
//   const conv = await getConv(userId);
//   socket.emit("conv", conv);
//   io.emit("online", Array.from(online));

//   /* sidebar refresh */
//   socket.on("side", async (userId) => {
//     const conv = await getConv(userId);
//     socket.emit("conv", conv);
//   });

//   /* 1-1: load messages */
//   socket.on("msgPage", async (chatUserId) => {
//     if (!isValidObjectId(chatUserId)) return;

//     const chatRoom = [socket.userId, chatUserId].sort().join("-");
//     socket.join(chatRoom);

//     const chatUser = await User.findById(chatUserId);
//     if (!chatUser) return;

//     socket.emit("userInfo", {
//       _id: chatUser._id,
//       name: chatUser.name,
//       email: chatUser.email,
//       profilePic: chatUser.profilePic,
//       online: online.has(chatUser._id.toString()),
//     });

//     const getMsgs = await convModel
//       .findOne({
//         $or: [
//           { sender: chatUser._id, receiver: socket.userId },
//           { sender: socket.userId, receiver: chatUser._id },
//         ],
//       })
//       .populate("original_messages")
//       .populate("translated_messages");

//     socket.emit("message", {
//       chatWith: chatUser._id.toString(),
//       original: getMsgs?.original_messages || [],
//       translated: getMsgs?.translated_messages || [],
//     });
//   });

//   /* group: load messages */
//   socket.on("msgPageGroup", async (groupId) => {
//     if (!isValidObjectId(groupId)) {
//       socket.emit("error", { msg: "Invalid group ID" });
//       return;
//     }

//     try {
//       const group = await Group.findById(groupId)
//         .populate("members", "name email profilePic")
//         .populate("admins", "name email");

//       if (!group) {
//         socket.emit("error", { msg: "Group not found" });
//         return;
//       }

//       socket.join(groupId.toString());

//       const messages = await msgModel
//         .find({ groupId })
//         .populate("msgByUser", "name email profilePic")
//         .sort({ createdAt: 1 });

//       const groupOut = normalizeGroupForClient(group);
//       const messagesOut = messages.map((m) =>
//         normalizeMsgForClient(m /* stored values already have fileName/fileSize */)
//       );

//       socket.emit("groupInfo", groupOut);
//       socket.emit("groupMessages", { groupId, messages: messagesOut });
//     } catch (err) {
//       console.error("Error loading group messages:", err.message);
//       socket.emit("error", { msg: "Failed to load group messages" });
//     }
//   });
// // Translate a single group message (text or audio transcription) for the requesting user
// socket.on("translateGroupMessage", async ({ groupId, messageId, to }) => {
//   if (!isValidObjectId(groupId) || !isValidObjectId(messageId)) return;

//   try {
//     const msg = await msgModel.findById(messageId);
//     if (!msg || String(msg.groupId) !== String(groupId)) {
//       throw new Error("Message not found for this group");
//     }

//     // Determine target language: explicit 'to' > user's preferredLanguage > 'en'
//     const me = await User.findById(socket.userId);
//     const targetLang =
//       (typeof to === "string" && to) || me?.preferredLanguage || "en";

//     // What to translate: for audio you already placed the transcription in msg.text
//     const source = msg.text || msg.caption || "";
//     if (!source) throw new Error("No text to translate");

//     const translated = await translateText(source, targetLang);

//     socket.emit("groupTranslationResult", {
//       groupId: String(groupId),
//       messageId: String(messageId),
//       translatedText: translated,
//     });
//   } catch (err) {
//     console.error("translateGroupMessage error:", err.message);
//     socket.emit("groupTranslationError", {
//       groupId,
//       messageId,
//       error: "Failed to translate",
//     });
//   }
// });

//   /* group: new message */
//   socket.on("newGroupMsg", async (data, ack) => {
//     try {
//       if (!data?.sender || !data?.groupId) return;
//       if (!isValidObjectId(data.sender) || !isValidObjectId(data.groupId)) return;

//       // Normalize type
//       const mapType = (t) => {
//         const x = String(t || "").toLowerCase();
//         if (x === "voice") return "audio";
//         if (["document","doc","docx","pdf","ppt","pptx","xls","xlsx","sheet"].includes(x)) return "file";
//         return x;
//       };

//       // Pick the URL sent by client
//       const incomingUrl =
//         data.url || data.imageUrl || data.audioUrl || data.videoUrl || data.fileUrl || null;

//       const messageType = mapType(
//         data.messageType || data.type || inferTypeFromUrl(incomingUrl)
//       );

//       // ---- filename & size: accept common aliases; coerce to number ----
//       const originalName = data.fileName ?? data.filename ?? data.name ?? null;
//       const rawSize = data.size ?? data.fileSize ?? null;
//       const sizeNum = typeof rawSize === "number" ? rawSize : Number(rawSize);
//       const finalSize = Number.isFinite(sizeNum) ? sizeNum : null;

//       // Optional: transcription for audio
//       let translatedText = null;
//       if (messageType === "audio" && (data.audioUrl || incomingUrl)) {
//         try {
//           const filePath = await downloadAudioFile(data.audioUrl || incomingUrl);
//           const transcription = await transcribeAudio(filePath);
//           translatedText = await translateText(transcription, "en");
//           data.text = transcription;
//           fs.unlinkSync(filePath);
//         } catch (err) {
//           console.error("Voice processing error:", err.message);
//         }
//       }

//       // Build message document (persist original name/size)
//       const doc = {
//         msgByUser: data.sender,
//         groupId: data.groupId,
//         messageType,
//         text: messageType === "text" ? (data.text || null) : null,
//         imageUrl: messageType === "image" ? incomingUrl : null,
//         audioUrl: messageType === "audio" ? incomingUrl : null,
//         videoUrl: messageType === "video" ? incomingUrl : null,
//         fileUrl:  messageType === "file"  ? incomingUrl : null,
//         fileName: messageType === "file"  ? originalName : null,
//         fileSize: messageType === "file"  ? finalSize   : null,
//         translatedMessage: translatedText || null,
//       };

//       const saved = await msgModel.create(doc);

//       // Update group's last message pointer
// await Group.findByIdAndUpdate(
//   data.groupId,
//   { lastMessage: saved._id, updatedAt: saved.createdAt },
//   { new: false }
// );
//       // Normalized payload that ALWAYS carries fileName/size/url
//       const savedMessage = normalizeMsgForClient(saved, {
//         url: incomingUrl,
//         fileName: originalName,
//         size: finalSize,
//         clientNonce: data.clientNonce || null,
//         messageType,
//       });

//       // -------- BROADCASTS --------
//       // 1) Group room (people who have the group open)
//       io.to(String(data.groupId)).emit("receive-group-msg", savedMessage);
//       io.to(String(data.groupId)).emit("groupMessages", {
//         groupId: String(data.groupId),
//         messages: [savedMessage],
//       });

//       // 2) Members’ personal rooms (so they receive it even if the group view isn't open)
//       const grp = await Group.findById(data.groupId).select("members");
//       const memberIds = (grp?.members || []).map((m) => m.toString());
//       for (const uid of memberIds) {
//         io.to(uid).emit("receive-group-msg", savedMessage);
//         io.to(uid).emit("groupMessages", {
//           groupId: String(data.groupId),
//           messages: [savedMessage],
//         });
//       }

//       // ACK for the sender’s optimistic UI
//       if (typeof ack === "function") ack({ savedMessage });
//     } catch (err) {
//       console.error("Error in newGroupMsg:", err.message);
//       if (typeof ack === "function") ack({ error: err.message });
//     }
//   });

//   /* group: seen */
//   socket.on("seenGroup", async ({ groupId, userId }) => {
//     if (!isValidObjectId(groupId) || !isValidObjectId(userId)) return;
//     try {
//       const unseenMessages = await msgModel.find({
//         groupId,
//         msgByUser: { $ne: userId },
//         seen: false,
//       });

//       const ids = unseenMessages.map((m) => m._id);
//       if (ids.length > 0) {
//         await msgModel.updateMany({ _id: { $in: ids } }, { $set: { seen: true } });
//         io.to(groupId).emit("seenGroupUpdate", { groupId, seenBy: userId, messageIds: ids });
//       }
//     } catch (err) {
//       console.error("Error in seenGroup:", err.message);
//     }
//   });

//   /* 1-1 message (kept as you had it) */
//   socket.on("newMsg", async (data) => {
//     if (
//       !data.sender ||
//       !data.receiver ||
//       !data.messageType ||
//       !isValidObjectId(data.sender) ||
//       !isValidObjectId(data.receiver)
//     )
//       return;

//     let conv = await convModel.findOne({
//       $or: [
//         { sender: data.sender, receiver: data.receiver },
//         { sender: data.receiver, receiver: data.sender },
//       ],
//     });
//     if (!conv) {
//       conv = new convModel({ sender: data.sender, receiver: data.receiver });
//       await conv.save();
//     }

//     let translatedText = null;
//     if (data.messageType === "text" && data.text) {
//       const receiver = await User.findById(data.receiver);
//       const preferredLang = receiver?.preferredLanguage || "en";
//       try {
//         const res = await translate(data.text, { to: preferredLang });
//         translatedText = res.text;
//       } catch (err) {
//         console.error("Translation error:", err.message);
//       }
//     } else if (data.messageType === "voice" && data.audioUrl) {
//       try {
//         const filePath = await downloadAudioFile(data.audioUrl);
//         const transcription = await transcribeAudio(filePath);
//         const receiver = await User.findById(data.receiver);
//         const preferredLang = receiver?.preferredLanguage || "en";
//         translatedText = await translateText(transcription, preferredLang);
//         data.text = transcription;
//         fs.unlinkSync(filePath);
//       } catch (err) {
//         console.error("Voice processing error:", err.message);
//       }
//     }

//     const message = new msgModel({
//       msgByUser: data.sender,
//       messageType: data.messageType,
//       text: data.text || null,
//       translatedMessage: translatedText || null,
//       imageUrl: data.imageUrl || null,
//       videoUrl: data.videoUrl || null,
//       audioUrl: data.audioUrl || null,
//      fileUrl:  data.fileUrl  || null,
// fileName: data.fileName || null,
// fileSize: data.fileSize || null,
// // seen:false,
//     // translatedMessage: translatedText || null,
//     clientNonce: data.clientNonce || null,
//     });

//     await message.save();

//     conv.original_messages.push(message);
//     if (translatedText) conv.translated_messages.push(message);
//     await conv.save();

//     const updatedConv = await convModel
//       .findById(conv._id)
//       .populate("original_messages")
//       .populate("translated_messages");

//     io.to(data.sender).emit("message", {
//       chatWith: data.receiver,
//       original: updatedConv.original_messages,
//       translated: updatedConv.translated_messages,
//     });
//     io.to(data.receiver).emit("message", {
//       chatWith: data.sender,
//       original: updatedConv.original_messages,
//       translated: updatedConv.translated_messages,
//     });

//     const sendConversation = await getConv(data.sender);
//     const recConversation = await getConv(data.receiver);
//     io.to(data.sender).emit("conv", sendConversation);
//     io.to(data.receiver).emit("conv", recConversation);
//   });

//   /* 1-1 seen */
//   socket.on("seen", async ({ senderId, receiverId }) => {
//     if (!isValidObjectId(senderId) || !isValidObjectId(receiverId)) return;
//     try {
//       const convo = await convModel
//         .findOne({
//           $or: [
//             { sender: senderId, receiver: receiverId },
//             { sender: receiverId, receiver: senderId },
//           ],
//         })
//         .populate("original_messages");

//       if (!convo) return;

//       const messageIds = convo.original_messages
//         .filter((m) => m.msgByUser.toString() === senderId && !m.seen)
//         .map((m) => m._id);

//       if (messageIds.length > 0) {
//         await msgModel.updateMany({ _id: { $in: messageIds } }, { $set: { seen: true } });
//         const chatRoom = [senderId, receiverId].sort().join("-");
//         io.to(chatRoom).emit("seenStatusUpdate", messageIds);
//       }

//       const updatedSenderConv = await getConv(senderId);
//       const updatedReceiverConv = await getConv(receiverId);
//       io.to(senderId).emit("conv", updatedSenderConv);
//       io.to(receiverId).emit("conv", updatedReceiverConv);
//     } catch (err) {
//       console.error("Error in seenMessages handler:", err.message);
//     }
//   });

//   /* voice translation (unchanged) */
//   socket.on("translateVoice", async ({ audioUrl, receiverId, messageId }) => {
//     if (!isValidObjectId(receiverId) || !isValidObjectId(messageId)) return;

//     try {
//       if (!audioUrl) throw new Error("Audio URL is missing");
//       const filePath = await downloadAudioFile(audioUrl);
//       const transcription = await transcribeAudio(filePath);

//       const message = await msgModel.findById(messageId).populate("msgByUser");
//       const conv = await convModel.findOne({ original_messages: messageId });
//       if (!conv) throw new Error("Conversation not found");

//       const finalReceiverId =
//         conv.sender.toString() === message.msgByUser._id.toString()
//           ? conv.receiver
//           : conv.sender;

//       const receiver = await User.findById(finalReceiverId);
//       const preferredLang = receiver?.preferredLanguage || "en";
//       const translated = await translateText(transcription, preferredLang);

//       await msgModel.findByIdAndUpdate(messageId, {
//         translatedVoiceText: translated,
//         voiceTranscription: transcription,
//       });

//       fs.unlinkSync(filePath);

//       socket.emit("voiceTranslationResult", {
//         messageId,
//         originalText: transcription,
//         translatedText: translated,
//       });
//     } catch (err) {
//       console.error("Voice translation error:", err);
//       socket.emit("voiceTranslationError", {
//         messageId,
//         error: "Failed to translate voice message",
//       });
//     }
//   });

//   socket.on("disconnect", () => {
//     if (socket.userId) {
//       online.delete(socket.userId);
//       io.emit("online", Array.from(online));
//     }
//   });
// });

// export { app, server };
import express from "express";
import { Server } from "socket.io";
import http from "http";
import { translate } from "@vitalets/google-translate-api";
import fs from "fs";
import mongoose from "mongoose";

import Group from "../Models/groupModel.js";
import User from "../Models/userModel.js";
import msgModel from "../Models/msgModel.js";
import convModel from "../Models/convModel.js";
import getUserByTok from "../utils/getUserByTok.js";
import getConv from "../utils/getConv.js";
import {
  downloadAudioFile,
  transcribeAudio,
  translateText,
} from "../utils/voiceTranslate.js";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: process.env.Frontend_url || "http://localhost:3000",
    credentials: true,
  },
});

const online = new Set();
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/* ---------- helpers ---------- */
const toPlain = (doc) => (doc?.toObject ? doc.toObject() : doc);

/** Infer message type from URL extension when client doesn't send a type */
const inferTypeFromUrl = (url = "") => {
  const u = String(url || "").toLowerCase();
  if (!u) return "text";
  if (/\.(png|jpe?g|gif|webp|bmp|svg)(\?|$)/.test(u)) return "image";
  if (/\.(mp3|wav|m4a|ogg|webm)(\?|$)/.test(u)) return "audio";
  if (/\.(mp4|mov|webm|mkv)(\?|$)/.test(u)) return "video";
  return "file";
};

/** Normalize message out to clients: keep url, messageType, filename & size */
const normalizeMsgForClient = (doc, extra = {}) => {
  const o = toPlain(doc) || {};

  const url =
    o.imageUrl || o.audioUrl || o.videoUrl || o.fileUrl || extra.url || null;

  const messageType =
    o.messageType ||
    extra.messageType ||
    inferTypeFromUrl(url || "");

  // Filename/size: prefer stored values, but allow extra for optimistic ACKs
  const fileName = o.fileName ?? extra.fileName ?? null;

  const fileSize =
    typeof o.fileSize === "number"
      ? o.fileSize
      : typeof extra.size === "number"
      ? extra.size
      : Number.isFinite(Number(extra.size))
      ? Number(extra.size)
      : null;

  return {
    ...o,
    url,
    messageType,
    fileName,
    fileSize,
    size: fileSize, // alias for client code that expects "size"
    clientNonce: extra.clientNonce ?? o.clientNonce ?? null,
  };
};

const normalizeGroupForClient = (groupDoc) => {
  const g = toPlain(groupDoc) || {};
  const adminIds = (g.admins || []).map((a) =>
    typeof a === "string" ? a : a?._id?.toString()
  );
  return { ...g, adminIds };
};

/* ---------- sockets ---------- */
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

  // initial conversations
  const conv = await getConv(userId);
  socket.emit("conv", conv);
  io.emit("online", Array.from(online));

  /* sidebar refresh */
  socket.on("side", async (userId) => {
    const conv = await getConv(userId);
    socket.emit("conv", conv);
  });

  /* 1-1: load messages */
  socket.on("msgPage", async (chatUserId) => {
    if (!isValidObjectId(chatUserId)) return;

    const chatRoom = [socket.userId, chatUserId].sort().join("-");
    socket.join(chatRoom);

    const chatUser = await User.findById(chatUserId);
    if (!chatUser) return;

    socket.emit("userInfo", {
      _id: chatUser._id,
      name: chatUser.name,
      email: chatUser.email,
      profilePic: chatUser.profilePic,
      online: online.has(chatUser._id.toString()),
    });

    const getMsgs = await convModel
      .findOne({
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
  });

  /* group: load messages */
  socket.on("msgPageGroup", async (groupId) => {
    if (!isValidObjectId(groupId)) {
      socket.emit("error", { msg: "Invalid group ID" });
      return;
    }

    try {
      const group = await Group.findById(groupId)
        .populate("members", "name email profilePic")
        .populate("admins", "name email");

      if (!group) {
        socket.emit("error", { msg: "Group not found" });
        return;
      }

      socket.join(groupId.toString());

      const messages = await msgModel
        .find({ groupId })
        .populate("msgByUser", "name email profilePic")
        .sort({ createdAt: 1 });

      const groupOut = normalizeGroupForClient(group);
      const messagesOut = messages.map((m) =>
        normalizeMsgForClient(m /* stored values already have fileName/fileSize */)
      );

      socket.emit("groupInfo", groupOut);
      socket.emit("groupMessages", { groupId, messages: messagesOut });
    } catch (err) {
      console.error("Error loading group messages:", err.message);
      socket.emit("error", { msg: "Failed to load group messages" });
    }
  });
const emitGroupPatched = async (groupId, msgDoc) => {
  const out = normalizeMsgForClient(msgDoc);
  io.to(String(groupId)).emit("groupMessagePatched", { groupId: String(groupId), message: out });

  // also to members' personal rooms so they update even if the group page is closed
  const grp = await Group.findById(groupId).select("members");
  for (const uid of (grp?.members || [])) {
    io.to(String(uid)).emit("groupMessagePatched", { groupId: String(groupId), message: out });
  }
};
socket.on("deleteGroupMsg", async ({ groupId, messageId }, ack) => {
  try {
    if (!isValidObjectId(groupId) || !isValidObjectId(messageId)) return;
    const msg = await msgModel.findByIdAndUpdate(
      messageId,
      { $addToSet: { deletedFor: socket.userId } },
      { new: true }
    );
    if (msg) await emitGroupPatched(groupId, msg);
    if (typeof ack === "function") ack({ ok: true });
  } catch (e) {
    if (typeof ack === "function") ack({ error: e.message });
  }
});
socket.on("editGroupMsg", async ({ groupId, messageId, text }, ack) => {
  try {
    if (!isValidObjectId(groupId) || !isValidObjectId(messageId)) return;
    const msg = await msgModel.findById(messageId);
    if (!msg) throw new Error("Message not found");
    if (String(msg.groupId) !== String(groupId)) throw new Error("Wrong group");
    if (String(msg.msgByUser) !== String(socket.userId)) throw new Error("Not your message");
    if ((msg.messageType || "text") !== "text") throw new Error("Only text messages can be edited");

    msg.text = typeof text === "string" ? text : "";
    msg.isEdited = true;
    msg.editedAt = new Date();
    await msg.save();

    await emitGroupPatched(groupId, msg);
    if (typeof ack === "function") ack({ ok: true });
  } catch (e) {
    if (typeof ack === "function") ack({ error: e.message });
  }
});

  /* Translate a single group message for the requesting user */
  socket.on("translateGroupMessage", async ({ groupId, messageId, to }) => {
    if (!isValidObjectId(groupId) || !isValidObjectId(messageId)) return;

    try {
      const msg = await msgModel.findById(messageId);
      if (!msg || String(msg.groupId) !== String(groupId)) {
        throw new Error("Message not found for this group");
      }

      // Determine target language: explicit 'to' > user's preferredLanguage > 'en'
      const me = await User.findById(socket.userId);
      const targetLang =
        (typeof to === "string" && to) || me?.preferredLanguage || "en";

      // Prefer stored voice transcription; fall back to text/caption; otherwise transcribe on-demand
      let source = msg.voiceTranscription || msg.text || msg.caption || "";
      if (!source && msg.audioUrl) {
        try {
          const filePath = await downloadAudioFile(msg.audioUrl);
          const transcription = await transcribeAudio(filePath);
          fs.unlinkSync(filePath);
          source = transcription || "";
          if (source) {
            await msgModel.findByIdAndUpdate(messageId, {
              voiceTranscription: source,
              text: msg.text || source,
            });
          }
        } catch (e) {
          console.warn("On-demand transcription failed:", e.message);
        }
      }

      if (!source) throw new Error("No text to translate");

      const translated = await translateText(source, targetLang);

      // Persist for future reuse
      await msgModel.findByIdAndUpdate(messageId, {
        translatedVoiceText: translated,
      });

      // Return only to requester
      socket.emit("groupTranslationResult", {
        groupId: String(groupId),
        messageId: String(messageId),
        translatedText: translated,
      });
    } catch (err) {
      console.error("translateGroupMessage error:", err.message);
      socket.emit("groupTranslationError", {
        groupId,
        messageId,
        error: "Failed to translate",
      });
    }
  });

  /* group: new message */
  socket.on("newGroupMsg", async (data, ack) => {
    try {
      if (!data?.sender || !data?.groupId) return;
      if (!isValidObjectId(data.sender) || !isValidObjectId(data.groupId)) return;

      // Normalize type
      const mapType = (t) => {
        const x = String(t || "").toLowerCase();
        if (x === "voice") return "audio";
        if (["document","doc","docx","pdf","ppt","pptx","xls","xlsx","sheet"].includes(x)) return "file";
        return x;
      };

      // Pick the URL sent by client
      const incomingUrl =
        data.url || data.imageUrl || data.audioUrl || data.videoUrl || data.fileUrl || null;

      const messageType = mapType(
        data.messageType || data.type || inferTypeFromUrl(incomingUrl)
      );

      // ---- filename & size: accept common aliases; coerce to number ----
      const originalName = data.fileName ?? data.filename ?? data.name ?? null;
      const rawSize = data.size ?? data.fileSize ?? null;
      const sizeNum = typeof rawSize === "number" ? rawSize : Number(rawSize);
      const finalSize = Number.isFinite(sizeNum) ? sizeNum : null;

      // For audio: transcribe only (do NOT auto-translate here)
      let transcription = null;
      if (messageType === "audio" && (data.audioUrl || incomingUrl)) {
        try {
          const filePath = await downloadAudioFile(data.audioUrl || incomingUrl);
          transcription = await transcribeAudio(filePath);
          fs.unlinkSync(filePath);
          data.text = transcription; // keep for UI fallback
        } catch (err) {
          console.error("Voice processing error:", err.message);
        }
      }

      // Build message document (persist original name/size + transcription)
      const doc = {
        msgByUser: data.sender,
        groupId: data.groupId,
        messageType,
        // keep transcription in text as well for UI toggles
        text:
          messageType === "audio"
            ? (transcription || null)
            : messageType === "text"
            ? (data.text || null)
            : null,
        imageUrl: messageType === "image" ? incomingUrl : null,
        audioUrl: messageType === "audio" ? incomingUrl : null,
        videoUrl: messageType === "video" ? incomingUrl : null,
        fileUrl:  messageType === "file"  ? incomingUrl : null,
        fileName: messageType === "file"  ? originalName : null,
        fileSize: messageType === "file"  ? finalSize   : null,
        // voice-specific fields:
        voiceTranscription: messageType === "audio" ? (transcription || null) : null,
        translatedVoiceText: null, // will be filled when user requests translation
        translatedMessage: null,   // don't auto-translate audio into this legacy field
        clientNonce: data.clientNonce || null,
      };

      const saved = await msgModel.create(doc);

      // Update group's last message pointer
      await Group.findByIdAndUpdate(
        data.groupId,
        { lastMessage: saved._id, updatedAt: saved.createdAt },
        { new: false }
      );

      // Normalized payload that ALWAYS carries fileName/size/url
      const savedMessage = normalizeMsgForClient(saved, {
        url: incomingUrl,
        fileName: originalName,
        size: finalSize,
        clientNonce: data.clientNonce || null,
        messageType,
      });

      // -------- BROADCASTS --------
      // 1) Group room (people who have the group open)
      io.to(String(data.groupId)).emit("receive-group-msg", savedMessage);
      io.to(String(data.groupId)).emit("groupMessages", {
        groupId: String(data.groupId),
        messages: [savedMessage],
      });

      // 2) Members’ personal rooms (so they receive it even if the group view isn't open)
      const grp = await Group.findById(data.groupId).select("members");
      const memberIds = (grp?.members || []).map((m) => m.toString());
      for (const uid of memberIds) {
        io.to(uid).emit("receive-group-msg", savedMessage);
        io.to(uid).emit("groupMessages", {
          groupId: String(data.groupId),
          messages: [savedMessage],
        });
      }

      // ACK for the sender’s optimistic UI
      if (typeof ack === "function") ack({ savedMessage });
    } catch (err) {
      console.error("Error in newGroupMsg:", err.message);
      if (typeof ack === "function") ack({ error: err.message });
    }
  });

  /* group: seen */
  socket.on("seenGroup", async ({ groupId, userId }) => {
    if (!isValidObjectId(groupId) || !isValidObjectId(userId)) return;
    try {
      const unseenMessages = await msgModel.find({
        groupId,
        msgByUser: { $ne: userId },
        seen: false,
      });

      const ids = unseenMessages.map((m) => m._id);
      if (ids.length > 0) {
        await msgModel.updateMany({ _id: { $in: ids } }, { $set: { seen: true } });
        io.to(groupId).emit("seenGroupUpdate", { groupId, seenBy: userId, messageIds: ids });
      }
    } catch (err) {
      console.error("Error in seenGroup:", err.message);
    }
  });

  /* 1-1 message (kept as you had it) */
  socket.on("newMsg", async (data) => {
    if (
      !data.sender ||
      !data.receiver ||
      !data.messageType ||
      !isValidObjectId(data.sender) ||
      !isValidObjectId(data.receiver)
    )
      return;

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

    let translatedText = null;
    if (data.messageType === "text" && data.text) {
      const receiver = await User.findById(data.receiver);
      const preferredLang = receiver?.preferredLanguage || "en";
      try {
        const res = await translate(data.text, { to: preferredLang });
        translatedText = res.text;
      } catch (err) {
        console.error("Translation error:", err.message);
      }
    } else if (data.messageType === "voice" && data.audioUrl) {
      try {
        const filePath = await downloadAudioFile(data.audioUrl);
        const transcription = await transcribeAudio(filePath);
        const receiver = await User.findById(data.receiver);
        const preferredLang = receiver?.preferredLanguage || "en";
        translatedText = await translateText(transcription, preferredLang);
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
      fileUrl:  data.fileUrl  || null,
      fileName: data.fileName || null,
      fileSize: data.fileSize || null,
      clientNonce: data.clientNonce || null,
    });

    await message.save();

    conv.original_messages.push(message);
    if (translatedText) conv.translated_messages.push(message);
    await conv.save();

    const updatedConv = await convModel
      .findById(conv._id)
      .populate("original_messages")
      .populate("translated_messages");

    io.to(data.sender).emit("message", {
      chatWith: data.receiver,
      original: updatedConv.original_messages,
      translated: updatedConv.translated_messages,
    });
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

  /* 1-1 seen */
  socket.on("seen", async ({ senderId, receiverId }) => {
    if (!isValidObjectId(senderId) || !isValidObjectId(receiverId)) return;
    try {
      const convo = await convModel
        .findOne({
          $or: [
            { sender: senderId, receiver: receiverId },
            { sender: receiverId, receiver: senderId },
          ],
        })
        .populate("original_messages");

      if (!convo) return;

      const messageIds = convo.original_messages
        .filter((m) => m.msgByUser.toString() === senderId && !m.seen)
        .map((m) => m._id);

      if (messageIds.length > 0) {
        await msgModel.updateMany({ _id: { $in: messageIds } }, { $set: { seen: true } });
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

  /* voice translation (1-1) */
  socket.on("translateVoice", async ({ audioUrl, receiverId, messageId }) => {
    if (!isValidObjectId(receiverId) || !isValidObjectId(messageId)) return;

    try {
      if (!audioUrl) throw new Error("Audio URL is missing");
      const filePath = await downloadAudioFile(audioUrl);
      const transcription = await transcribeAudio(filePath);

      const message = await msgModel.findById(messageId).populate("msgByUser");
      const conv = await convModel.findOne({ original_messages: messageId });
      if (!conv) throw new Error("Conversation not found");

      const finalReceiverId =
        conv.sender.toString() === message.msgByUser._id.toString()
          ? conv.receiver
          : conv.sender;

      const receiver = await User.findById(finalReceiverId);
      const preferredLang = receiver?.preferredLanguage || "en";
      const translated = await translateText(transcription, preferredLang);

      await msgModel.findByIdAndUpdate(messageId, {
        translatedVoiceText: translated,
        voiceTranscription: transcription,
      });

      fs.unlinkSync(filePath);

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

  socket.on("disconnect", () => {
    if (socket.userId) {
      online.delete(socket.userId);
      io.emit("online", Array.from(online));
    }
  });
});

export { app, server };
