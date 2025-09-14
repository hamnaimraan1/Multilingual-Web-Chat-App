// utils/tokens.js
import crypto from "crypto";

export function makeEmailVerifyToken() {
  const token = crypto.randomBytes(32).toString("hex"); // raw token for link
  const hash = crypto.createHash("sha256").update(token).digest("hex");
  const exp = new Date(Date.now() + 15 * 60 * 1000);   // 15 minutes
  return { token, hash, exp };
}
