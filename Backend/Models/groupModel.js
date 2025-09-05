// Models/groupModel.js
import mongoose from "mongoose";

const { Schema, model } = mongoose;

// subdocument so we can track when someone left/was removed
const PastMemberSchema = new Schema(
  {
    user: { type: Schema.Types.ObjectId, ref: "User", required: true },
    removedAt: { type: Date, default: Date.now },
  },
  { _id: false }
);

const GroupSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },

    createdBy: { type: Schema.Types.ObjectId, ref: "User" },

    members: [{ type: Schema.Types.ObjectId, ref: "User" }],

    admins: [{ type: Schema.Types.ObjectId, ref: "User" }], // multiple admins

    profilePic: { type: String, default: "" },

    isGroup: { type: Boolean, default: true },

    // matches your msg model name: model("msg", msgschema)
    lastMessage: { type: Schema.Types.ObjectId, ref: "msg", default: null },
    

    // keep this INSIDE the schema object
    pastMembers: [PastMemberSchema],
  },
  { timestamps: true }
);

export default model("Group", GroupSchema);
