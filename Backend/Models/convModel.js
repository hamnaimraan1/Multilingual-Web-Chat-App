// import mongoose from "mongoose";

// const { Schema, model } = mongoose;

// const convschema = new Schema({
//   sender: {
//     type: Schema.ObjectId,
//     ref: "User",
//   },
//   receiver: {
//     type: Schema.ObjectId,
//     ref: "User",
//   },
//   original_messages: [
//     {
//       type: Schema.ObjectId,
//       ref: "msg",
//     },
//   ],
//   translated_messages: [
//     {
//       type: Schema.ObjectId,
//       ref: "msg",
//     },
//   ],
// });

// export default model("convo", convschema);
import mongoose from "mongoose";

const { Schema, model } = mongoose;

const convschema = new Schema(
  {
    sender: {
      type: Schema.ObjectId,
      ref: "User",
    },
    receiver: {
      type: Schema.ObjectId,
      ref: "User",
    },
    original_messages: [
      {
        type: Schema.ObjectId,
        ref: "msg",
      },
    ],
    translated_messages: [
      {
        type: Schema.ObjectId,
        ref: "msg",
      },
    ],

    
    isMuted: { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
    isPinned: { type: Boolean, default: false },
    deletedFor: [{ type: Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

export default model("Convo", convschema);
