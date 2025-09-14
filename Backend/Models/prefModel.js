// Models/prefModel.js
import mongoose from "mongoose";

const PrefSchema = new mongoose.Schema(
  {
    // who owns this preference
    owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

    // what kind of thing this is about
    //  - "dm"    => target is a Convo _id
    //  - "group" => target is a Group _id
    scope: { type: String, enum: ["dm", "group"], required: true },

    // id of the convo or group
    target: { type: mongoose.Schema.Types.ObjectId, required: true },

    // flags
    isPinned:   { type: Boolean, default: false },
    isMuted:    { type: Boolean, default: false },
    isArchived: { type: Boolean, default: false },
    hidden:     { type: Boolean, default: false },
  },
  { timestamps: true }
);

// one doc per (user x scope x target)
PrefSchema.index({ owner: 1, scope: 1, target: 1 }, { unique: true });

export default mongoose.model("Pref", PrefSchema);
