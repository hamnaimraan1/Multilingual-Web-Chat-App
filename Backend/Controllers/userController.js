import catchAsync from '../middlewares/async.js';
import User from '../Models/userModel.js';
import bcrypt from 'bcryptjs';
import sendTok from '../utils/token.js';

// Register
export const register = catchAsync(async (req, res) => {
  const { name, email, password, profilePic, status, preferredLanguage } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({
      message: "Name, email, and password are required",
      error: true,
    });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return res.status(400).json({
      message: "Invalid email format",
      error: true,
    });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({
      message: "User already registered with this email",
      error: true,
    });
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const user = await User.create({
    name,
    email,
    password: hashedPassword,
    profilePic,
    status,
    preferredLanguage,
  });

  sendTok(user, 200, res);
});

// Login
export const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      message: "Email and password are required",
      error: true,
    });
  }

  const user = await User.findOne({ email }).select("+password");
  if (!user) {
    return res.status(400).json({
      message: "User not found",
      error: true,
    });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(400).json({
      message: "Invalid password",
      error: true,
    });
  }

  sendTok(user, 200, res);
});

// Logout
export const logout = catchAsync(async (req, res) => {
  const cookieOpt = {
    httpOnly: true,
    secure: true,
    samesite: "None",
    expires: new Date(0),
  };
  return res.cookie("token", "", cookieOpt).status(200).json({
    message: "Successfully Logged out",
    success: true,
  });
});

// Get user info
export const userinfo = catchAsync(async (req, res) => {
  const user = req.user;
  return res.status(200).json({
    message: "User Info",
    user,
  });
});

// Update user
// export const updateuser = catchAsync(async (req, res) => {
//   const { userID, name, profilePic, preferredLanguage } = req.body;

//   const updated = await User.updateOne(
//     { _id: userID },
//     { name, profilePic, preferredLanguage }
//   );

//   if (updated.modifiedCount === 0) {
//     return res.status(200).json({
//       success: true,
//       message: "Saved successfully.",
//     });
//   }

//   if (updated.modifiedCount === 1) {
//     const user = await User.findById(userID);
//     return res.status(200).json({
//       success: true,
//       message: "User updated successfully",
//     });
//   }
// });
export const updateuser = catchAsync(async (req, res) => {
  const { userID, name, profilePic, preferredLanguage } = req.body;

  await User.updateOne(
    { _id: userID },
    {
      $set: {
        name,
        profilePic,
        preferredLanguage,
      },
    }
  );

  const user = await User.findById(userID);
console.log("Updating user:", req.body);

  return res.status(200).json({
    success: true,
    message: "User updated successfully",
    user,
  });
});


// Search users
export const searchuser = catchAsync(async (req, res) => {
  const { searchRes } = req.body;
  const q = new RegExp(searchRes, "i");

  const users = await User.find({
    $or: [{ name: { $regex: q } }, { email: { $regex: q } }],
  });

  return res.status(200).json({
    message: "All Users",
    users,
    success: true,
  });
});
