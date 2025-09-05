
// export { Sockets, GetSocket };
import { useLocalStorage } from "@mantine/hooks";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import io from "socket.io-client";

const SocketContext = createContext();

export const GetSocket = () => useContext(SocketContext);

export const Sockets = ({ children }) => {
  const [user] = useLocalStorage({
    key: "userData",
    defaultValue: {},
  });
console.log("🛂 Token in socket setup:", user?.token);

  const [socket, setSocket] = useState(null);

useEffect(() => {
  // Avoid running if token is still missing
  if (!user?.token) return;

  console.log("🛂 Token in socket setup:", user.token);

  const newSocket = io("http://localhost:5000", {
    auth: { token: user.token },
    withCredentials: true,
    transports: ["websocket"],
  });

  setSocket(newSocket);

  newSocket.on("connect", () => {
    console.log("✅ Socket connected:", newSocket.id);
  });

  newSocket.on("connect_error", (err) => {
    console.error(" Socket error:", err.message);
  });

  return () => {
    newSocket.disconnect();
  };
}, [user?.token]);

  return (
    <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
  );
};
