// import mongoose from "mongoose";
// const { Schema, model } = mongoose;

// const chatSchema = new Schema(
//   {
//     participants: [{ type: Schema.Types.ObjectId, ref: "User" }],
//     messages: [{ type: Schema.Types.ObjectId, ref: "msg" }],

//     isMuted: { type: Boolean, default: false },
//     isArchived: { type: Boolean, default: false },
//     isPinned: { type: Boolean, default: false },
//     deletedFor: [{ type: Schema.Types.ObjectId, ref: "User" }], // store user IDs who deleted the chat
//   },
//   { timestamps: true }
// );

// export default model("Chat", chatSchema);
