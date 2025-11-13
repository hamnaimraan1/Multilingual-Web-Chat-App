// // src/components/ChatSearch.jsx
// import React, { useState } from "react";
// import { Search } from "lucide-react";

// const ChatSearch = ({ chats, onSelectChat }) => {
//   const [query, setQuery] = useState("");

//   // Filter chats based on the query
//   const filteredChats = chats.filter((chat) =>
//     chat.name.toLowerCase().includes(query.toLowerCase())
//   );

//   return (
//     <div className="p-3 border-b bg-white">
//       {/* Search Input */}
//       <div className="flex items-center bg-gray-100 rounded-lg px-2 py-1">
//         <Search className="w-5 h-5 text-gray-500 mr-2" />
//         <input
//           type="text"
//           placeholder="Search chats"
//           value={query}
//           onChange={(e) => setQuery(e.target.value)}
//           className="w-full bg-transparent outline-none text-sm"
//         />
//       </div>

//       {/* Search Results */}
//       {query && (
//         <div className="mt-2 max-h-60 overflow-y-auto">
//           {filteredChats.length > 0 ? (
//             filteredChats.map((chat) => (
//               <div
//                 key={chat.id}
//                 onClick={() => onSelectChat(chat)}
//                 className="p-2 cursor-pointer hover:bg-gray-100 rounded-lg"
//               >
//                 <span
//                   dangerouslySetInnerHTML={{
//                     __html: chat.name.replace(
//                       new RegExp(query, "gi"),
//                       (match) =>
//                         `<span class="bg-yellow-200 font-semibold">${match}</span>`
//                     ),
//                   }}
//                 />
//               </div>
//             ))
//           ) : (
//             <p className="text-gray-500 text-sm p-2">No chats found</p>
//           )}
//         </div>
//       )}
//     </div>
//   );
// };

// export default ChatSearch;

// src/components/ChatSearch.jsx
import React, { useState, useRef, useEffect } from "react";
import { Search, X, Calendar } from "lucide-react";
import DatePicker from "react-datepicker";

const ChatSearch = ({ chats, onSelectChat, onDateSelect }) => {
  const [query, setQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(null);
  const searchRef = useRef(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchRef.current && !searchRef.current.contains(e.target)) {
        setIsSearchOpen(false);
        setIsDateOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const filteredChats = chats.filter((chat) =>
    chat.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div ref={searchRef} className="relative bg-white border-b">
      {/* Header Icons */}
      <div className="flex items-center justify-between p-3">
        <h2 className="text-base font-semibold">Chats</h2>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setIsSearchOpen(!isSearchOpen);
              setIsDateOpen(false);
            }}
            className="p-2 rounded-full hover:bg-gray-100 transition"
          >
            <Search size={18} />
          </button>

          <button
            onClick={() => {
              setIsDateOpen(!isDateOpen);
              setIsSearchOpen(false);
            }}
            className="p-2 rounded-full hover:bg-gray-100 transition"
          >
            <Calendar size={18} />
          </button>
        </div>
      </div>

      {/* Search Bar Dropdown (like WhatsApp) */}
      {isSearchOpen && (
        <div className="absolute left-0 right-0 top-full z-20 bg-white shadow-md border-t animate-slideDown">
          <div className="flex items-center px-3 py-2">
            <Search className="w-5 h-5 text-gray-500 mr-2" />
            <input
              type="text"
              placeholder="Search chats"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              autoFocus
              className="flex-1 bg-transparent outline-none text-sm"
            />
            <button
              onClick={() => {
                setQuery("");
                setIsSearchOpen(false);
              }}
              className="ml-1 text-gray-500 hover:text-gray-700"
            >
              <X size={16} />
            </button>
          </div>

          {/* Search results */}
          {query && (
            <div className="max-h-64 overflow-y-auto border-t">
              {filteredChats.length > 0 ? (
                filteredChats.map((chat) => (
                  <div
                    key={chat.id}
                    onClick={() => {
                      onSelectChat(chat);
                      setIsSearchOpen(false);
                    }}
                    className="p-2 cursor-pointer hover:bg-gray-100"
                  >
                    <span
                      dangerouslySetInnerHTML={{
                        __html: chat.name.replace(
                          new RegExp(query, "gi"),
                          (match) =>
                            `<span class='bg-yellow-200 font-semibold'>${match}</span>`
                        ),
                      }}
                    />
                  </div>
                ))
              ) : (
                <p className="text-gray-500 text-sm p-2">No chats found</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Calendar Popup (real date picker) */}
      {isDateOpen && (
        <div className="absolute right-2 top-12 z-30 bg-white border rounded-xl shadow-lg p-2 animate-fadeIn">
          <DatePicker
            selected={selectedDate}
            onChange={(date) => {
              setSelectedDate(date);
              onDateSelect?.(date);
              setIsDateOpen(false);
            }}
            inline
          />
        </div>
      )}
    </div>
  );
};

export default ChatSearch;
