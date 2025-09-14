
// import React, { useState } from "react";
// import Side from "./Side";
// import { ArrowLeft } from "lucide-react"; // install: npm install lucide-react

// const DashboardLayout = ({ children }) => {
//   const [selectedChat, setSelectedChat] = useState(null);

//   return (
//     <div className="h-screen max-h-screen bg-black text-white flex">
//       {/* Sidebar for large screens */}
//       <aside className="hidden lg:block w-[350px] border-r border-gray-700">
//         <Side onSelectChat={setSelectedChat} />
//       </aside>

//       {/* Mobile Layout */}
//       <div className="flex-1 lg:hidden">
//         {!selectedChat ? (
//           // Chat list view
//           <Side onSelectChat={setSelectedChat} />
//         ) : (
//           <div className="flex flex-col h-full">
//             {/* Mobile top bar */}
//             <div className="flex items-center gap-3 p-3 border-b border-gray-700 bg-gray-900">
//               <button
//                 onClick={() => setSelectedChat(null)}
//                 className="p-2 rounded-full hover:bg-gray-800 transition"
//               >
//                 <ArrowLeft size={18} className="text-white" />
//               </button>
//               {/* <h1 className="text-lg font-semibold truncate">
//                 {selectedChat?.name || "Chat"}
//               </h1> */}
//             </div>

//             {/* Chat screen */}
//             <div className="flex-1 overflow-y-auto bg-black">{children}</div>
//           </div>
//         )}
//       </div>

//       {/* Main content (desktop) */}
//       <main className="hidden lg:block flex-1 overflow-hidden relative">
//         {children}
//       </main>
//     </div>
//   );
// };

// export default DashboardLayout;
import React from "react";
import Side from "./Side";
import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const DashboardLayout = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // On mobile: show the list on "/" and "/g". Show the chat screen on any other route.
  const isDetailRoute = !["/", "/g"].includes(location.pathname);

  return (
    <div className="h-screen max-h-screen bg-black text-white flex">
      {/* Sidebar (desktop) */}
      <aside className="hidden lg:block w-[350px] border-r border-gray-700">
        <Side />
      </aside>

      {/* Mobile */}
      <div className="flex-1 lg:hidden">
        {isDetailRoute ? (
          <div className="flex flex-col h-full">
            {/* Mobile top bar */}
            <div className="flex items-center gap-3 p-3 border-b border-gray-700 bg-gray-900">
              <button
                onClick={() => {
                  // go back to the proper list root
                  if (location.pathname.startsWith("/g")) navigate("/g");
                  else navigate("/");
                }}
                className="p-2 rounded-full hover:bg-gray-800 transition"
              >
                <ArrowLeft size={18} />
              </button>
            </div>
            {/* Chat / Group content */}
            <div className="flex-1 overflow-y-auto bg-black">
              <Outlet />
            </div>
          </div>
        ) : (
          <Side />
        )}
      </div>

      {/* Right pane (desktop) */}
      <main className="hidden lg:block flex-1 overflow-hidden relative">
        <Outlet />
      </main>
    </div>
  );
};

export default DashboardLayout;
