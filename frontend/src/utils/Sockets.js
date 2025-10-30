
// // export { Sockets, GetSocket };
// import { useLocalStorage } from "@mantine/hooks";
// import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
// import io from "socket.io-client";

// const SocketContext = createContext();

// export const GetSocket = () => useContext(SocketContext);

// export const Sockets = ({ children }) => {
//   const [user] = useLocalStorage({
//     key: "userData",
//     defaultValue: {},
//   });
// console.log("🛂 Token in socket setup:", user?.token);

//   const [socket, setSocket] = useState(null);

// useEffect(() => {
//   // Avoid running if token is still missing
//   if (!user?.token) return;

//   console.log("🛂 Token in socket setup:", user.token);

//   const newSocket = io("http://localhost:5000", {
//     auth: { token: user.token },
//     withCredentials: true,
//     transports: ["websocket"],
//   });

//   setSocket(newSocket);

//   newSocket.on("connect", () => {
//     console.log("✅ Socket connected:", newSocket.id);
//   });

//   newSocket.on("connect_error", (err) => {
//     console.error(" Socket error:", err.message);
//   });

//   return () => {
//     newSocket.disconnect();
//   };
// }, [user?.token]);

//   return (
//     <SocketContext.Provider value={socket}>{children}</SocketContext.Provider>
//   );
// };
// export { Sockets, GetSocket };
import { useLocalStorage } from "@mantine/hooks";
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import io from "socket.io-client";

const SocketContext = createContext(null);
export const GetSocket = () => useContext(SocketContext);

export const Sockets = ({ children }) => {
  const [user] = useLocalStorage({ key: "userData", defaultValue: {} });
  const [socket, setSocket] = useState(null);

  // Resolve backend WS endpoint without using import.meta (CRA-safe)
  // Prefer REACT_APP_SOCKET_URL when present; otherwise choose based on page protocol.
  const endpoint = useMemo(() => {
    const envCRA = (typeof process !== "undefined" && process.env && process.env.REACT_APP_SOCKET_URL)
      ? String(process.env.REACT_APP_SOCKET_URL).trim()
      : "";

    if (envCRA) return envCRA;

    const isHttps = typeof window !== "undefined" && window.location?.protocol === "https:";
    const host = (typeof window !== "undefined" && window.location?.hostname) || "localhost";

    // Your backend HTTPS runs on 8443 (wss), HTTP on 5000 (ws)
    return isHttps ? `https://${host}:8443` : `http://${host}:5000`;
  }, []);

  useEffect(() => {
    if (!user?.token) return;

    const s = io(endpoint, {
      auth: { token: user.token },
      withCredentials: true,
      transports: ["websocket"],
      path: "/socket.io",
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 500,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      secure: endpoint.startsWith("https://"),
    });

    setSocket(s);

    s.on("connect", () => {
      console.log("✅ Socket connected:", s.id, "→", endpoint);
    });

    s.on("connect_error", (err) => {
      console.error("❌ Socket connect_error:", err?.message || err);
    });

    s.on("error", (err) => {
      console.error("❌ Socket error:", err?.message || err);
    });

    return () => {
      try { s.disconnect(); } catch {}
      setSocket(null);
    };
  }, [user?.token, endpoint]);

  return (
    <SocketContext.Provider value={socket}>
      {children}
    </SocketContext.Provider>
  );
};
