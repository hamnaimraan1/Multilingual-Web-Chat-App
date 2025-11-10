// import User from "../Models/userModel.js";
// import catchAsync from "../middlewares/async.js";
// import jwt from "jsonwebtoken";

// // export const auth = catchAsync(async (req, res, next) => {
// //   const { token } = req.cookies;

// //   if (!token) {
// //     return res.status(400).json({
// //       message: "Please login first",
// //       error: true,
// //     });
// //   }

// //   const decode = jwt.verify(token, process.env.JWT_SECRET_KEY);

// //   req.user = await User.findById(decode.id);

// //   if (!req.user) {
// //     return res.status(401).json({ message: "User not found. Unauthorized." });
// //   }

// //   next();
// // });
// export const auth = catchAsync(async (req, res, next) => {
//   let token = req.cookies.token;

//   if (!token && req.headers.authorization?.startsWith("Bearer ")) {
//     token = req.headers.authorization.split(" ")[1];
//   }

//   if (!token) {
//     return res.status(400).json({ message: "Please login first", error: true });
//   }

//   const decode = jwt.verify(token, process.env.JWT_SECRET_KEY);
//   req.user = await User.findById(decode.id);

//   if (!req.user) {
//     return res.status(401).json({ message: "User not found. Unauthorized." });
//   }

//   next();
// });
import User from "../Models/userModel.js";
import catchAsync from "../middlewares/async.js";
import jwt from "jsonwebtoken";

export const auth = catchAsync(async (req, res, next) => {
  let token = req.cookies?.token;

  // Also allow `Authorization: Bearer <token>`
  if (!token && req.headers.authorization?.startsWith("Bearer ")) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      message: "Please login first",
      error: true,
    });
  }

  let decode;
  try {
    decode = jwt.verify(token, process.env.JWT_SECRET_KEY);
  } catch (err) {
    // 🔒 Token is present but not valid anymore
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        message: "Session expired. Please log in again.",
        error: true,
      });
    }

    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({
        message: "Invalid token. Please log in again.",
        error: true,
      });
    }

    // Anything else → let catchAsync/global handler deal with it
    throw err;
  }

  // Find user from decoded id
  req.user = await User.findById(decode.id);

  if (!req.user) {
    return res.status(401).json({
      message: "User not found. Unauthorized.",
      error: true,
    });
  }

  next();
});
