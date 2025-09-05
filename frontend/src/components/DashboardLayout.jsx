
// import React, { useState } from "react";
// import Side from "./Side";
// import { Menu } from "lucide-react";

// const DashboardLayout = ({ children }) => {
//   const [showSidebar, setShowSidebar] = useState(false);

//   return (
//     <div className="h-screen max-h-screen bg-black text-white flex">
//       {/* Sidebar for large screens */}
//       <aside className="hidden lg:block w-[350px] border-r border-gray-700">
//         <Side onSelectChat={() => {}} /> {/* Large screens: no need to close */}
//       </aside>

//       {/* Sidebar for mobile (overlay) */}
//       {showSidebar && (
//         <div className="fixed inset-0 z-50 bg-black w-[85%] max-w-[320px] border-r border-gray-700 animate-slideIn">
//           <Side onSelectChat={() => setShowSidebar(false)} />
//           {/* Chat select hote hi sidebar band */}
//           <button
//             className="absolute top-4 right-4 text-gray-400"
//             onClick={() => setShowSidebar(false)}
//           >
//             ✕
//           </button>
//         </div>
//       )}

//       {/* Main Content */}
//       <main className="flex-1 overflow-hidden relative">
//         {/* Mobile top bar with menu */}
//         <div className="lg:hidden flex items-center justify-between p-3 border-b border-gray-700 bg-black">
//           <button onClick={() => setShowSidebar(true)}>
//             <Menu size={24} />
//           </button>
//           <h1 className="text-lg font-semibold">Chats</h1>
//           <div className="w-6"></div>
//         </div>

//         {/* Children pages */}
//         <div className="h-[calc(100%-48px)] lg:h-full overflow-y-auto">
//           {children}
//         </div>
//       </main>
//     </div>
//   );
// };

// export default DashboardLayout;
import React, { useState } from "react";
import Side from "./Side";
import { ArrowLeft } from "lucide-react"; // install: npm install lucide-react

const DashboardLayout = ({ children }) => {
  const [selectedChat, setSelectedChat] = useState(null);

  return (
    <div className="h-screen max-h-screen bg-black text-white flex">
      {/* Sidebar for large screens */}
      <aside className="hidden lg:block w-[350px] border-r border-gray-700">
        <Side onSelectChat={setSelectedChat} />
      </aside>

      {/* Mobile Layout */}
      <div className="flex-1 lg:hidden">
        {!selectedChat ? (
          // Chat list view
          <Side onSelectChat={setSelectedChat} />
        ) : (
          <div className="flex flex-col h-full">
            {/* Mobile top bar */}
            <div className="flex items-center gap-3 p-3 border-b border-gray-700 bg-gray-900">
              <button
                onClick={() => setSelectedChat(null)}
                className="p-2 rounded-full hover:bg-gray-800 transition"
              >
                <ArrowLeft size={18} className="text-white" />
              </button>
              {/* <h1 className="text-lg font-semibold truncate">
                {selectedChat?.name || "Chat"}
              </h1> */}
            </div>

            {/* Chat screen */}
            <div className="flex-1 overflow-y-auto bg-black">{children}</div>
          </div>
        )}
      </div>

      {/* Main content (desktop) */}
      <main className="hidden lg:block flex-1 overflow-hidden relative">
        {children}
      </main>
    </div>
  );
};

export default DashboardLayout;
