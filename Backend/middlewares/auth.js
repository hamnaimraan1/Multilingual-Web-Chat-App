import User from "../Models/userModel.js";
import catchAsync from "../middlewares/async.js";
import jwt from "jsonwebtoken";

// export const auth = catchAsync(async (req, res, next) => {
//   const { token } = req.cookies;

//   if (!token) {
//     return res.status(400).json({
//       message: "Please login first",
//       error: true,
//     });
//   }

//   const decode = jwt.verify(token, process.env.JWT_SECRET_KEY);

//   req.user = await User.findById(decode.id);

//   if (!req.user) {
//     return res.status(401).json({ message: "User not found. Unauthorized." });
//   }

//   next();
// });
export const auth = catchAsync(async (req, res, next) => {
  let token = req.cookies.token;

  if (!token && req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(400).json({ message: "Please login first", error: true });
  }

  const decode = jwt.verify(token, process.env.JWT_SECRET_KEY);
  req.user = await User.findById(decode.id);

  if (!req.user) {
    return res.status(401).json({ message: "User not found. Unauthorized." });
  }

  next();
});
