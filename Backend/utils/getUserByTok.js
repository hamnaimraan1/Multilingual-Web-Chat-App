// import jwt from "jsonwebtoken"; 
// import User from "../Models/userModel.js";

// const getUserByTok = async (tok) => {
//   if (!tok) {
//     return {
//       message: "Token expired",
//       logout: true,
//     };
//   }
//   try {
//     const decode = jwt.verify(tok, process.env.JWT_SECRET_KEY);
//     const user = await User.findById(decode.id);
//     return user;
//   } catch (error) {
//     return {
//       message: "Invalid token",
//       logout: true,
//     };
//   }
// };

// export default getUserByTok;
import jwt from "jsonwebtoken"; 
import User from "../Models/userModel.js";

const getUserByTok = async (tok) => {
  if (!tok) return null;

  try {
    const decode = jwt.verify(tok, process.env.JWT_SECRET_KEY);
    const user = await User.findById(decode.id);
    return user || null; // return null if user not found
  } catch (error) {
    return null; // return null on error
  }
};

export default getUserByTok;
