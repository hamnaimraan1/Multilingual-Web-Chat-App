// src/components/ChatSearch.jsx
import React, { useState } from "react";
import { Search } from "lucide-react";

const ChatSearch = ({ chats, onSelectChat }) => {
  const [query, setQuery] = useState("");

  // Filter chats based on the query
  const filteredChats = chats.filter((chat) =>
    chat.name.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="p-3 border-b bg-white">
      {/* Search Input */}
      <div className="flex items-center bg-gray-100 rounded-lg px-2 py-1">
        <Search className="w-5 h-5 text-gray-500 mr-2" />
        <input
          type="text"
          placeholder="Search chats"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full bg-transparent outline-none text-sm"
        />
      </div>

      {/* Search Results */}
      {query && (
        <div className="mt-2 max-h-60 overflow-y-auto">
          {filteredChats.length > 0 ? (
            filteredChats.map((chat) => (
              <div
                key={chat.id}
                onClick={() => onSelectChat(chat)}
                className="p-2 cursor-pointer hover:bg-gray-100 rounded-lg"
              >
                <span
                  dangerouslySetInnerHTML={{
                    __html: chat.name.replace(
                      new RegExp(query, "gi"),
                      (match) =>
                        `<span class="bg-yellow-200 font-semibold">${match}</span>`
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
  );
};

export default ChatSearch;
