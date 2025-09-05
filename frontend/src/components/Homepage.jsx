
// export default Homepage;
import { useLocalStorage } from "@mantine/hooks";
import React, { useEffect } from "react";
import DashboardLayout from "./DashboardLayout";
import { GetSocket } from "../utils/Sockets";

const Homepage = () => {
  const socket = GetSocket();
  const [, setOnlineUser] = useLocalStorage({
    key: "onlineUser",
    defaultValue: [],
  });

  useEffect(() => {
    if (socket) {
      socket.on("onlineUser", (data) => {
        console.log(data, "onlineUser");
        setOnlineUser(data);
      });

      return () => {
        socket.off("onlineUser"); // ✅ correct way to cleanup
      };
    }
  }, [socket]);

  return (
    <DashboardLayout>
      <div className="w-full h-full flex justify-center items-center bg-secondary text-white overflow-auto">
        <div className="text-center max-w-lg px-6 py-12">
          <img
            src="/images/myImage.png"
            alt="Welcome to CrossPing"
            className="mx-auto w-40 h-40 rounded-full object-cover shadow-lg mb-6"
          />
          <h1 className="text-3xl font-bold mb-3">
            Welcome to <span className="text-primary">CrossPing</span>
          </h1>
          <p className="text-lg text-gray-300">
            Your multilingual chat solution.<br />
            Connect across languages – anytime, anywhere.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Homepage;
