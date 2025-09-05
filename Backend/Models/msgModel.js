import mongoose from "mongoose";
import User from "./userModel.js";
const { Schema, model } = mongoose;

const msgschema = new Schema(
  {
    msgByUser: {
      type: Schema.ObjectId,
      ref: "User",
      required: true,
    },
    messageType: {
      type: String,
      enum: ["text", "image", "video", "audio", "file"],
      required: true,
    },
    text: { type: String, default: null },
    imageUrl: { type: String, default: null },
    videoUrl: { type: String, default: null },
    audioUrl: { type: String, default: null },
      fileUrl:  { type: String, default: null },     
        fileName: { type: String, default: null },   // ADD (original filename)
    fileSize: { type: Number, default: null },    

    translatedMessage: { type: String, default: null },
    translatedVoiceText: { type: String, default: null }, // ✅ for audio translations
  voiceTranscription: { type: String, default: null }, // 🆕 Add this
  groupId: {
  type: Schema.ObjectId,
  ref: "Group",
  default: null,
},


    seen: { type: Boolean, default: false },
     
  },
  {
    timestamps: true,
  }
);

export default model("msg", msgschema);
