
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

const { Schema, model } = mongoose;

const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      select: false, // Ensures password is not returned in queries unless explicitly selected
    },
    profilePic: {
      type: String,
      default: "",
    },
    status: {
      type: String,
      enum: ["online", "offline", "busy"],
      default: "offline",
    },
    preferredLanguage: {
      type: String,
      default: "en",
    },
  },
  { timestamps: true }
);

UserSchema.methods.getJWTToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d", // Default to 7 days if undefined
  });
};

export default model("User", UserSchema);

