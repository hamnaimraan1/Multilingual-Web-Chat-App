import { json } from "express";
import cors from "cors";
import dotenv from "dotenv";
dotenv.config();
import cookieParser from "cookie-parser";
import conn from "./config/connection.js";
import router from "./routes/route.js";
import chatRoutes from "./routes/chatRoutes.js";
import groupRoutes from "./routes/groupRoutes.js";


import { app, server } from "./socket/index.js";

app.use(
    cors({
    origin: process.env.Frontend_url,
    credentials: true,
})
);
app.use(json());
app.use(cookieParser());
app.use("/api",router);
// app.use("/api/chats", chatRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/groups", groupRoutes);
const port = process.env.PORT|| 5000;
conn().then(()=>{

server.listen(port,()=>{
    console.log("server is running on http://localhost:5000");

});

});

