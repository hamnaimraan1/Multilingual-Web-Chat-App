
// // export default Homepage;
// import { useLocalStorage } from "@mantine/hooks";
// import React, { useEffect } from "react";
// import DashboardLayout from "./DashboardLayout";
// import { GetSocket } from "../utils/Sockets";

// const Homepage = () => {
//   const socket = GetSocket();
//   const [, setOnlineUser] = useLocalStorage({
//     key: "onlineUser",
//     defaultValue: [],
//   });

//   useEffect(() => {
//     if (socket) {
//       socket.on("onlineUser", (data) => {
//         console.log(data, "onlineUser");
//         setOnlineUser(data);
//       });

//       return () => {
//         socket.off("onlineUser"); // ✅ correct way to cleanup
//       };
//     }
//   }, [socket]);

//   return (
//     <DashboardLayout>
//       <div className="w-full h-full flex justify-center items-center bg-secondary text-white overflow-auto">
//         <div className="text-center max-w-lg px-6 py-12">
//           <img
//             src="/images/myImage.png"
//             alt="Welcome to CrossPing"
//             className="mx-auto w-40 h-40 rounded-full object-cover shadow-lg mb-6"
//           />
//           <h1 className="text-3xl font-bold mb-3">
//             Welcome to <span className="text-primary">CrossPing</span>
//           </h1>
//           <p className="text-lg text-gray-300">
//             Your multilingual chat solution.<br />
//             Connect across languages – anytime, anywhere.
//           </p>
//         </div>
//       </div>
//     </DashboardLayout>
//   );
// };

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
        socket.off("onlineUser");
      };
    }
  }, [socket]);

  return (
    <DashboardLayout>
      <div className="flex h-full w-full items-center justify-center bg-[#0b0d11] text-zinc-200">
        <div className="mx-4 my-8 w-full max-w-2xl rounded-2xl bg-[#121418] p-8 text-center shadow-lg border border-zinc-800">
          {/* Logo / Image */}
          <div className="flex justify-center mb-6">
            <img
              src="/images/myImage.png"
              alt="Welcome to CrossPing"
              className="w-32 h-32 sm:w-40 sm:h-40 rounded-full object-cover shadow-md border border-zinc-700"
            />
          </div>

          {/* Heading */}
          <h1 className="text-2xl sm:text-3xl font-bold mb-3">
            Welcome to{" "}
            <span className="text-emerald-500">CrossPing</span>
          </h1>

          {/* Subtitle */}
          <p className="text-sm sm:text-base text-zinc-400 leading-relaxed">
            Your multilingual chat solution.<br />
            Connect across languages – anytime, anywhere.
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default Homepage;
