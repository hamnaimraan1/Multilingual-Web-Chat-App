
// // export default Homepage;
// import React, { useEffect } from "react";
// import { useLocalStorage } from "@mantine/hooks";
// import DashboardLayout from "./DashboardLayout";
// import { GetSocket } from "../utils/Sockets";

// const Homepage = () => {
//   const socket = GetSocket();
//   const [, setOnlineUser] = useLocalStorage({
//     key: "onlineUser",
//     defaultValue: [],
//   });

//   useEffect(() => {
//     if (!socket) return;
//     const onOnline = (data) => setOnlineUser(data);
//     socket.on("onlineUser", onOnline);
//     return () => socket.off("onlineUser", onOnline);
//   }, [socket, setOnlineUser]);

//   return (
//     <DashboardLayout>
//       {/* Scene */}
//       <div className="relative isolate flex h-full w-full items-center justify-center overflow-hidden bg-[#0b0d11] text-zinc-100">
//         {/* Ambient gradients */}
//         <div
//           aria-hidden
//           className="pointer-events-none absolute -top-40 left-1/2 h-[46rem] w-[46rem] -translate-x-1/2 rounded-full
//                      bg-[radial-gradient(closest-side,rgba(16,185,129,.18),transparent_70%)]
//                      blur-3xl"
//         />
//         <div
//           aria-hidden
//           className="pointer-events-none absolute -bottom-48 -right-20 h-[36rem] w-[36rem] rounded-full
//                      bg-[radial-gradient(closest-side,rgba(59,130,246,.14),transparent_70%)]
//                      blur-3xl"
//         />

//         {/* Card */}
//         <section
//           className="mx-4 my-10 w-full max-w-2xl rounded-3xl p-8 sm:p-12
//                      "
//         >
//           {/* Logo with animated aura & accent sweeps */}
//           <div className="relative mx-auto grid place-items-center">
//             {/* conic glow */}
//             <div
//               aria-hidden
//               className="absolute inset-0 -z-10 mx-auto h-48 w-48 rounded-full
//                          bg-[conic-gradient(from_0deg,rgba(16,185,129,.35),rgba(59,130,246,.28),transparent_70%)]
//                          blur-xl animate-pulse"
//             />
//             {/* orbiting accent lines */}
//             <div className="absolute -z-10 h-56 w-56 rounded-full">
//               <span className="absolute left-1/2 top-0 h-24 w-[2px] -translate-x-1/2 rounded-full bg-emerald-400/30 blur-[1px] animate-[spin_6s_linear_infinite]" />
//               <span className="absolute right-2 top-1/2 h-[2px] w-24 -translate-y-1/2 rounded-full bg-cyan-400/30 blur-[1px] animate-[spin_8s_linear_infinite_reverse]" />
//             </div>

//             {/* image with soft ring & subtle float */}
//             <div className="relative">
//               <div
//                 aria-hidden
//                 className="absolute -inset-3 rounded-full bg-emerald-400/10 blur-xxl"
//               />
//               <img
//                 src="/images/img2.webp"
//                 alt="CrossPing"
//                 className="h-36 w-36 sm:h-44 sm:w-44 rounded-full object-cover ring-2 ring-white/0 shadow-sm
//                            animate-[float_4s_ease-in-out_infinite]"
//               />
//             </div>
//           </div>

//           {/* Headline & sub */}
//           <header className="mt-7 text-center">
//             <h1 className="text-3xl/tight sm:text-4xl/tight font-semibold tracking-tight">
//               Welcome to <span className="text-emerald-400">CrossPing</span>
//             </h1>
//              <p className="mx-auto mt-3 max-w-xl text-sm sm:text-base text-zinc-400">
//               Your Multilingual Chat Solution
//            </p>
//             <p className="mx-auto mt-1 max-w-xl text-xs/tight xs:text-base text-zinc-400">
     
// Chat App That Speaks Your Language          </p>
//           </header>

//           {/* Language chips to emphasize “multilingual”
//           <ul className="mt-7 flex flex-wrap items-center justify-center gap-2">
//             {["EN", "ES", "FR", "DE", "UR", "AR", "TR", "ZH"].map((code, i) => (
//               <li
//                 key={code}
//                 className="select-none rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1
//                            text-xs text-emerald-200 backdrop-blur-sm"
//                 style={{
//                   animation: `fadeIn .6s ease ${i * 60}ms both`,
//                 }}
//               >
//                 {code}
//               </li>
//             ))}
//           </ul> */}
//         </section>

//         {/* keyframes (scoped) */}
//         <style>{`
//           @keyframes float {
//             0%,100% { transform: translateY(0) }
//             50% { transform: translateY(-6px) }
//           }
//           @keyframes fadeIn {
//             from { opacity: 0; transform: translateY(4px) }
//             to   { opacity: 1; transform: translateY(0) }
//           }
//         `}</style>
//       </div>
//     </DashboardLayout>
//   );
// };

// export default Homepage;
import React, { useEffect } from "react";
import { useLocalStorage } from "@mantine/hooks";
import { GetSocket } from "../utils/Sockets";

const Homepage = () => {
  const socket = GetSocket();
  const [, setOnlineUser] = useLocalStorage({ key: "onlineUser", defaultValue: [] });

  useEffect(() => {
    if (!socket) return;
    const onOnline = (data) => setOnlineUser(data);
    socket.on("onlineUser", onOnline);
    return () => socket.off("onlineUser", onOnline);
  }, [socket, setOnlineUser]);

  return (
    <div className="relative isolate flex h-full w-full items-center justify-center overflow-hidden bg-[#0b0d11] text-zinc-100">
      {/* ambient gradients */}
      <div aria-hidden className="pointer-events-none absolute -top-40 left-1/2 h-[46rem] w-[46rem] -translate-x-1/2 rounded-full bg-[radial-gradient(closest-side,rgba(16,185,129,.18),transparent_70%)] blur-3xl" />
      <div aria-hidden className="pointer-events-none absolute -bottom-48 -right-20 h-[36rem] w-[36rem] rounded-full bg-[radial-gradient(closest-side,rgba(59,130,246,.14),transparent_70%)] blur-3xl" />

      <section className="mx-4 my-10 w-full max-w-2xl rounded-3xl p-8 sm:p-12">
        <div className="relative mx-auto grid place-items-center">
          <div aria-hidden className="absolute inset-0 -z-10 mx-auto h-48 w-48 rounded-full bg-[conic-gradient(from_0deg,rgba(16,185,129,.35),rgba(59,130,246,.28),transparent_70%)] blur-xl animate-pulse" />
          <div className="absolute -z-10 h-56 w-56 rounded-full">
            <span className="absolute left-1/2 top-0 h-24 w-[2px] -translate-x-1/2 rounded-full bg-emerald-400/30 blur-[1px] animate-[spin_6s_linear_infinite]" />
            <span className="absolute right-2 top-1/2 h-[2px] w-24 -translate-y-1/2 rounded-full bg-cyan-400/30 blur-[1px] animate-[spin_8s_linear_infinite_reverse]" />
          </div>
          <div className="relative">
            <div aria-hidden className="absolute -inset-3 rounded-full bg-emerald-400/10 blur-xxl" />
            <img
              src="/images/img2.webp"
              alt="CrossPing"
              className="h-36 w-36 sm:h-44 sm:w-44 rounded-full object-cover ring-2 ring-white/0 shadow-sm animate-[float_4s_ease-in-out_infinite]"
            />
          </div>
        </div>

        <header className="mt-7 text-center">
          <h1 className="text-3xl/tight sm:text-4xl/tight font-semibold tracking-tight">
            Welcome to <span className="text-emerald-400">CrossPing</span>
          </h1>
          <p className="mx-auto mt-3 max-w-xl text-sm sm:text-base text-zinc-400">
            Your Multilingual Chat Solution
          </p>
          <p className="mx-auto mt-1 max-w-xl text-xs/tight xs:text-base text-zinc-400">
            Chat App That Speaks Your Language
          </p>
        </header>
      </section>

      <style>{`
        @keyframes float { 0%,100% { transform: translateY(0) } 50% { transform: translateY(-6px) } }
      `}</style>
    </div>
  );
};

export default Homepage;
