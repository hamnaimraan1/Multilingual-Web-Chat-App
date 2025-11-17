// // frontend/src/components/ChatSearchBar.jsx
// import React, { useState } from "react";
// import { Search, Calendar as CalendarIcon, X } from "lucide-react";
// import { isSameDay } from "./ChatDayDivider";

// /**
//  * Reusable search bar for chats.
//  *
//  * Props:
//  *  - searchText: string
//  *  - searchDate: string (YYYY-MM-DD) or null
//  *  - onChange: ({ text, date }) => void
//  *  - placeholder?: string
//  */
// const ChatSearchBar = ({
//   searchText,
//   searchDate,
//   onChange,
//   placeholder = "Search within chat…",
// }) => {
//   const [showDatePicker, setShowDatePicker] = useState(false);

//   const handleTextChange = (e) => {
//     onChange({ text: e.target.value, date: searchDate || "" });
//   };

//   const handleDateChange = (e) => {
//     const value = e.target.value; // "" or "YYYY-MM-DD"
//     onChange({ text: searchText || "", date: value });
//     setShowDatePicker(false);
//   };

//   const clearSearch = () => {
//     onChange({ text: "", date: "" });
//   };

//   const hasFilters = !!(searchText?.trim() || searchDate);

//   return (
//     <div className="relative flex items-center gap-2 px-2 py-2 bg-[#0f1216] border-b border-zinc-800">
//       {/* text search */}
//       <div className="flex-1 flex items-center gap-2 bg-[#0b0d11] border border-zinc-700 rounded-xl px-3 py-1.5">
//         <Search size={16} className="text-zinc-500 flex-shrink-0" />
//         <input
//           value={searchText}
//           onChange={handleTextChange}
//           placeholder={placeholder}
//           className="bg-transparent outline-none text-sm text-zinc-200 w-full"
//         />
//         {hasFilters && (
//           <button
//             onClick={clearSearch}
//             className="p-1 rounded-full hover:bg-zinc-800 text-zinc-400 flex-shrink-0"
//             title="Clear search"
//           >
//             <X size={14} />
//           </button>
//         )}
//       </div>

//       {/* calendar button + floating date picker */}
//       <div className="relative">
//         <button
//           onClick={() => setShowDatePicker((s) => !s)}
//           className={`p-2 rounded-xl border ${
//             searchDate
//               ? "border-emerald-600 bg-emerald-600/10 text-emerald-400"
//               : "border-zinc-700 bg-[#0b0d11] text-zinc-300 hover:bg-zinc-800"
//           }`}
//           title={searchDate ? `Date: ${searchDate}` : "Search by date"}
//         >
//           <CalendarIcon size={16} />
//         </button>

//         {showDatePicker && (
//           <div className="absolute right-0 mt-2 p-2 rounded-xl bg-[#0e1013] border border-zinc-700 shadow-lg z-30">
//             <input
//               type="date"
//               value={searchDate || ""}
//               onChange={handleDateChange}
//               className="bg-[#0b0d11] border border-zinc-700 rounded-lg px-2 py-1 text-xs text-zinc-200 outline-none"
//             />
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ChatSearchBar;

// /**
//  * Helper: filter messages by text & date.
//  * You can import and reuse this in 1-1 and group containers.
//  */
// export const filterMessagesBySearch = (messages = [], { text = "", date = "" }) => {
//   let list = Array.isArray(messages) ? messages : [];

//   // text / keyword
//   const q = text.trim().toLowerCase();
//   if (q) {
//     list = list.filter((m) => {
//       const body =
//         (m?.text ||
//           m?.content ||
//           m?.message ||
//           m?.body ||
//           "") + "";
//       return body.toLowerCase().includes(q);
//     });
//   }

//   // date (YYYY-MM-DD)
//   if (date) {
//     list = list.filter((m) => {
//       const d = m?.createdAt || m?.timestamp || m?.time;
//       if (!d) return false;
//       // use existing isSameDay helper
//       return isSameDay(d, date);
//     });
//   }

//   return list;
// };
// frontend/src/components/ChatSearchBar.jsx
import React, { useState, useRef, useEffect } from "react";
import { Search, Calendar as CalendarIcon, X } from "lucide-react";
import { isSameDay } from "./ChatDayDivider";

/**
 * Reusable search bar for chats.
 *
 * Props:
 *  - searchText: string
 *  - searchDate: string (YYYY-MM-DD) or null
 *  - onChange: ({ text, date }) => void
 *  - placeholder?: string
 */
const ChatSearchBar = ({
  searchText,
  searchDate,
  onChange,
  placeholder = "Search within chat…",
}) => {
  const [showDatePicker, setShowDatePicker] = useState(false);
  // temporary local value while user types/picks; only commit when valid or cleared
  const [pendingDate, setPendingDate] = useState(searchDate || "");
  const [error, setError] = useState("");
  const popupRef = useRef(null);

  useEffect(() => {
    setPendingDate(searchDate || "");
  }, [searchDate]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") setShowDatePicker(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  useEffect(() => {
    // click outside to close
    const onDocClick = (e) => {
      if (!popupRef.current) return;
      if (!popupRef.current.contains(e.target)) setShowDatePicker(false);
    };
    if (showDatePicker) document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, [showDatePicker]);

  const handleTextChange = (e) => {
    onChange({ text: e.target.value, date: searchDate || "" });
  };

  // validate ISO date YYYY-MM-DD strictly
  const isValidISODate = (v) => {
    if (!v) return false;
    const match = /^\d{4}-\d{2}-\d{2}$/.test(v);
    if (!match) return false;
    const d = new Date(v + "T00:00:00Z");
    return !Number.isNaN(d.getTime());
  };

  // When user changes the native date input
  const onDateInputChange = (e) => {
    const value = e.target.value; // usually '' or 'YYYY-MM-DD'
    setPendingDate(value);
    setError("");
    // do NOT call onChange yet — wait for explicit Apply or clear
  };

  const applyDate = () => {
    if (!pendingDate) {
      // treat as clear
      onChange({ text: searchText || "", date: "" });
      setShowDatePicker(false);
      return;
    }

    if (!isValidISODate(pendingDate)) {
      setError("Please pick a valid date (YYYY-MM-DD)");
      return;
    }

    onChange({ text: searchText || "", date: pendingDate });
    setShowDatePicker(false);
  };

  const clearSearch = () => {
    setPendingDate("");
    setError("");
    onChange({ text: "", date: "" });
  };

  const clearDate = () => {
    setPendingDate("");
    setError("");
    onChange({ text: searchText || "", date: "" });
  };

  const hasFilters = !!(searchText?.trim() || searchDate);

  return (
    <div className="relative flex items-center gap-2 px-2 py-2 bg-[#0f1216] border-b border-zinc-800">
      {/* text search */}
      <div className="flex-1 flex items-center gap-2 bg-[#0b0d11] border border-zinc-700 rounded-xl px-3 py-1.5">
        <Search size={16} className="text-zinc-500 flex-shrink-0" />
        <input
          value={searchText}
          onChange={handleTextChange}
          placeholder={placeholder}
          className="bg-transparent outline-none text-sm text-zinc-200 w-full"
        />
        {hasFilters && (
          <button
            onClick={clearSearch}
            className="p-1 rounded-full hover:bg-zinc-800 text-zinc-400 flex-shrink-0"
            title="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {/* calendar button + floating date picker */}
      <div className="relative">
        <button
          onClick={() => setShowDatePicker((s) => !s)}
          className={`p-2 rounded-xl border ${
            searchDate
              ? "border-emerald-600 bg-emerald-600/10 text-emerald-400"
              : "border-zinc-700 bg-[#0b0d11] text-zinc-300 hover:bg-zinc-800"
          }`}
          title={searchDate ? `Date: ${searchDate}` : "Search by date"}
        >
          <CalendarIcon size={16} />
        </button>

        {showDatePicker && (
          <div
            ref={popupRef}
            className="absolute right-0 mt-2 p-3 rounded-xl bg-[#0e1013] border border-zinc-700 shadow-lg z-30 w-56"
          >
            <label className="block text-xs text-zinc-400 mb-2">Pick a date</label>
            <input
              type="date"
              value={pendingDate || ""}
              onChange={onDateInputChange}
              className="w-full bg-[#0b0d11] border border-zinc-700 rounded-lg px-2 py-1 text-sm text-zinc-200 outline-none"
            />

            {error && <div className="text-xs text-rose-400 mt-2">{error}</div>}

            <div className="mt-3 flex justify-between gap-2">
              <button
                onClick={clearDate}
                className="flex-1 px-2 py-1 rounded-lg border border-zinc-700 text-sm text-zinc-300 hover:bg-zinc-800"
              >
                Clear
              </button>
              <button
                onClick={applyDate}
                className="flex-1 px-2 py-1 rounded-lg border border-emerald-600 text-sm text-emerald-400 hover:bg-emerald-600/5"
              >
                Apply
              </button>
            </div>

            <div className="mt-2 text-xs text-zinc-500">(Select a date and click Apply to search.)</div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatSearchBar;

/**
 * Helper: filter messages by text & date.
 * You can import and reuse this in 1-1 and group containers.
 */
export const filterMessagesBySearch = (messages = [], { text = "", date = "" }) => {
  let list = Array.isArray(messages) ? messages : [];

  // text / keyword
  const q = text.trim().toLowerCase();
  if (q) {
    list = list.filter((m) => {
      const body = (m?.text || m?.content || m?.message || m?.body || "") + "";
      return body.toLowerCase().includes(q);
    });
  }

  // date (YYYY-MM-DD)
  if (date) {
    list = list.filter((m) => {
      const d = m?.createdAt || m?.timestamp || m?.time;
      if (!d) return false;
      // use existing isSameDay helper
      return isSameDay(d, date);
    });
  }

  return list;
};
