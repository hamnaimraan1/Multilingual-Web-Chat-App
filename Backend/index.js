// import { json } from "express";
// import cors from "cors";
// import dotenv from "dotenv";
// dotenv.config();
// import cookieParser from "cookie-parser";
// import conn from "./config/connection.js";
// import router from "./routes/route.js";
// import chatRoutes from "./routes/chatRoutes.js";
// import groupRoutes from "./routes/groupRoutes.js";
// import authExtraRoutes from "./routes/authExtraRoutes.js";

// import { app, server } from "./socket/index.js";

// app.use(
//     cors({
//     origin: process.env.Frontend_url ||process.env.FRONTEND_URL,
//     credentials: true,
// })
// );
// app.use(json());
// app.use(cookieParser());
// app.use("/api",router);
// // app.use("/api/chats", chatRoutes);
// app.use("/api/auth", authExtraRoutes);

// app.use("/api/chat", chatRoutes);
// app.use("/api/groups", groupRoutes);
// const port = process.env.PORT|| 5000;
// conn().then(()=>{

// server.listen(port,()=>{
//     console.log("server is running on http://localhost:5000");

// });

// });

import { json } from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import cookieParser from "cookie-parser";
import conn from "./config/connection.js";
import router from "./routes/route.js";
import chatRoutes from "./routes/chatRoutes.js";
import groupRoutes from "./routes/groupRoutes.js";
import authExtraRoutes from "./routes/authExtraRoutes.js";

import { app, server } from "./socket/index.js";

// --- CORS: allow your dev frontends (https) + env ---
const allowedOrigins = [
  process.env.FRONTEND_URL,
  process.env.Frontend_url,
  "https://localhost:5173", // Vite default
  "https://localhost:3000", // CRA default
].filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(json());
app.use(cookieParser());

// --- APIs ---
app.use("/api", router);
app.use("/api/auth", authExtraRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/groups", groupRoutes);

// --- Ports (HTTPS main, optional HTTP redirect defined in socket/index.js) ---
const HTTPS_PORT = process.env.HTTPS_PORT || 8443;

conn().then(() => {
  server.listen(HTTPS_PORT, () => {
    console.log(`✅ HTTPS server running at https://localhost:${HTTPS_PORT}`);
  });
});
