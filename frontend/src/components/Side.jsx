

// // Side.jsx
// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { GetSocket } from "../utils/Sockets";
// import {
//   ArrowUpLeft,
//   EllipsisVertical,
//   Image as ImageIcon,
//   LogOut,
//   MessageCircle,
//   SquarePlus,
//   UserPlus,
//   User,
//   Video,
//   Search,
//   Pin,
//   BellOff,
//   Archive,
//   ChevronDown,
//   ChevronRight,
// } from "lucide-react";
// import Avatar from "./Avatar";
// import { useLocalStorage } from "@mantine/hooks";
// import { useNavigate } from "react-router-dom";
// import AddUser from "./AddUser";
// import EditProfile from "./EditProfile";
// import axios from "axios";
// import toast, { Toaster } from "react-hot-toast";

// const API_BASE = "http://localhost:5000/api/chat"; // adjust if needed

// /* ---------- helpers ---------- */
// const fmtTime = (d) => {
//   try {
//     const date = new Date(d);
//     return isNaN(date) ? "" : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
//   } catch {
//     return "";
//   }
// };

// const Side = ({ onSelectChat }) => {
//   const navigate = useNavigate();

//   const [user, setUser] = useLocalStorage({ key: "userData", defaultValue: {} });

//   // tolerate HMR variations to avoid “_s7 is not a function”
//   const socket =
//     (typeof GetSocket === "function"
//       ? GetSocket()
//       : GetSocket?.socket || GetSocket?.current || GetSocket) || null;

//   const [openSearchUser, setOpenSearchUser] = useState(false);
//   const [editProfile, setEditProfile] = useState(false);
//   const [allUsers, setAllUsers] = useState([]);
//   const [search, setSearch] = useState("");
//   const [menuOpen, setMenuOpen] = useState(null);
//   const [showArchived, setShowArchived] = useState(false);
//   const [typingMap, setTypingMap] = useState({}); // { userId: lastTypingTs }
//   const menuRef = useRef(null);

//   /* ---------- socket: conversations ---------- */
//   useEffect(() => {
//     if (!socket || !user?._id) return;

//     socket.emit("side", user._id);

//     const onConv = (data) => {
//       const updated = (data || []).map((conv) => {
//         const youAreSender = String(conv?.sender?._id) === String(user._id);
//         const peer = youAreSender ? conv.receiver : conv.sender;
//         return {
//           ...conv,
//           userDetails: peer,
//           unseenMsg: conv.unseen,
//         };
//       });

//       setAllUsers((prev) => {
//         const prevById = new Map(prev.map((c) => [c._id, c]));
//         return updated.map((c) => {
//           const local = prevById.get(c._id);
//           return local
//             ? {
//                 ...c,
//                 isMuted: local.isMuted ?? c.isMuted,
//                 isPinned: local.isPinned ?? c.isPinned,
//                 isArchived: local.isArchived ?? c.isArchived,
//               }
//             : c;
//         });
//       });
//     };

//     const onTyping = ({ from, to, isTyping }) => {
//       if (!from || String(to) !== String(user._id)) return;
//       setTypingMap((m) => (isTyping ? { ...m, [from]: Date.now() } : { ...m, [from]: 0 }));
//     };

//     socket.on("conv", onConv);
//     socket.on("typing", onTyping);

//     return () => {
//       socket.off("conv", onConv);
//       socket.off("typing", onTyping);
//     };
//   }, [socket, user?._id]);

//   /* ---------- close row menu on outside click ---------- */
//   useEffect(() => {
//     const onDocClick = (e) => {
//       if (!menuRef.current) return;
//       if (!menuRef.current.contains(e.target)) setMenuOpen(null);
//     };
//     document.addEventListener("click", onDocClick);
//     return () => document.removeEventListener("click", onDocClick);
//   }, []);

//   const handleLogout = () => {
//     setUser(null);
//     navigate("/login");
//   };

//   const highlightText = (text, query) => {
//     if (!query) return text;
//     const safe = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
//     const regex = new RegExp(`(${safe})`, "gi");
//     return String(text)
//       .split(regex)
//       .map((part, i) =>
//         regex.test(part) ? (
//           <span key={i} className="bg-yellow-400 text-black font-semibold rounded">
//             {part}
//           </span>
//         ) : (
//           part
//         )
//       );
//   };

//   /* ---------- sorting/filtering ---------- */
//   const getLastActive = (c) => {
//     const t = c?.lastMsg?.createdAt || c?.lastMsg?.time || c?.updatedAt || c?.createdAt || 0;
//     return new Date(t).getTime() || 0;
//   };

//   // Search filter
//   const filtered = useMemo(() => {
//     const q = search.trim().toLowerCase();
//     if (!q) return allUsers;
//     return allUsers.filter((c) => (c?.userDetails?.name || "").toLowerCase().includes(q));
//   }, [allUsers, search]);

//   // Split & sort
//   const archived = useMemo(() => filtered.filter((c) => c?.isArchived), [filtered]);
//   const notArchived = useMemo(() => filtered.filter((c) => !c?.isArchived), [filtered]);

//   const notArchivedSorted = useMemo(() => {
//     const arr = [...notArchived];
//     arr.sort((a, b) => {
//       if (a?.isPinned && !b?.isPinned) return -1;
//       if (!a?.isPinned && b?.isPinned) return 1;
//       return getLastActive(b) - getLastActive(a);
//     });
//     return arr;
//   }, [notArchived]);

//   const pinned = useMemo(() => notArchivedSorted.filter((c) => c?.isPinned), [notArchivedSorted]);
//   const regular = useMemo(() => notArchivedSorted.filter((c) => !c?.isPinned), [notArchivedSorted]);

//   /* ---------- row actions (mute/archive/pin/delete) ---------- */
//   const actionLabels = {
//     mute: { loading: "Muting chat…", successOn: "Chat muted", successOff: "Chat unmuted", error: "Failed to mute chat" },
//     archive: { loading: "Archiving chat…", successOn: "Chat archived", successOff: "Chat unarchived", error: "Failed to archive chat" },
//     pin: { loading: "Pinning chat…", successOn: "Chat pinned", successOff: "Chat unpinned", error: "Failed to pin chat" },
//     delete: { loading: "Deleting chat…", successOn: "Chat deleted", error: "Failed to delete chat" },
//   };

//   const handleAction = async (chatId, action) => {
//     const prev = allUsers;

//     // optimistic update
//     if (action === "delete") {
//       setAllUsers((p) => p.filter((c) => c._id !== chatId));
//     } else {
//       setAllUsers((p) =>
//         p.map((c) =>
//           c._id === chatId
//             ? action === "mute"
//               ? { ...c, isMuted: !c.isMuted }
//               : action === "archive"
//               ? { ...c, isArchived: !c.isArchived }
//               : action === "pin"
//               ? { ...c, isPinned: !c.isPinned }
//               : c
//             : c
//         )
//       );
//     }

//     const labels = actionLabels[action];
//     const req =
//       action === "delete"
//         ? axios.delete(`${API_BASE}/${chatId}/delete`)
//         : axios.put(`${API_BASE}/${chatId}/${action}`, {});

//     await toast.promise(
//       req,
//       {
//         loading: labels.loading,
//         success: (res) => {
//           if (action === "delete") return labels.successOn;
//           if (action === "mute") return res?.data?.isMuted ? labels.successOn : labels.successOff;
//           if (action === "archive") return res?.data?.isArchived ? labels.successOn : labels.successOff;
//           if (action === "pin") return res?.data?.isPinned ? labels.successOn : labels.successOff;
//           return "Done";
//         },
//         error: (err) => {
//           setAllUsers(prev); // rollback
//           return err?.response?.data?.message || labels.error || "Something went wrong";
//         },
//       },
//       {
//         style: {
//           background: "#202c33",
//           color: "#e9edef",
//           borderRadius: "8px",
//           fontSize: "14px",
//           padding: "10px 14px",
//         },
//         success: { duration: 2000, icon: "✔️" },
//         error: { duration: 2200, icon: "⚠️" },
//         loading: { duration: 100000 },
//       }
//     );

//     setMenuOpen(null);
//   };

//   /* ---------- row component ---------- */
//   const ChatRow = ({ conv }) => {
//     const last = conv?.lastMsg;
//     const lastTime = last?.createdAt || last?.time;
//     const isTypingActive =
//       typingMap[conv?.userDetails?._id] && Date.now() - typingMap[conv.userDetails._id] < 3500;

//     const preview = isTypingActive ? (
//       <span className="text-emerald-400">typing…</span>
//     ) : last?.imageUrl ? (
//       <>
//         <ImageIcon size={14} /> <span>Image</span>
//       </>
//     ) : last?.videoUrl ? (
//       <>
//         <Video size={14} /> <span>Video</span>
//       </>
//     ) : last?.text ? (
//       <span className="truncate">{last.text}</span>
//     ) : (
//       <span className="opacity-60">No messages yet</span>
//     );

//     return (
//       <div
//         className={`relative flex items-center gap-3 px-4 py-3 border-b border-zinc-900 hover:bg-zinc-900/60 cursor-pointer`}
//         onClick={() => {
//           navigate(`/${conv?.userDetails?._id}`);
//           onSelectChat?.(conv.userDetails);
//         }}
//         onContextMenu={(e) => {
//           e.preventDefault();
//           setMenuOpen(menuOpen === conv._id ? null : conv._id);
//         }}
//       >
//         <Avatar imageUrl={conv?.userDetails?.profilePic} name={conv?.userDetails?.name} />

//         <div className="flex-1 min-w-0">
//           <div className="flex items-center gap-2 min-w-0">
//             <h3 className="text-zinc-200 font-medium truncate">
//               {highlightText(conv?.userDetails?.name, search)}
//             </h3>
//             {conv?.isPinned && <Pin size={14} className="text-zinc-400 shrink-0" />}
//             {conv?.isMuted && <BellOff size={14} className="text-zinc-400 shrink-0" />}
//             {conv?.isArchived && <Archive size={14} className="text-zinc-400 shrink-0" />}
//           </div>

//           <div className="text-xs text-zinc-500 flex items-center gap-2 min-w-0">
//             <div className="flex items-center gap-1 min-w-0 truncate">{preview}</div>
//           </div>
//         </div>

//         <div className="text-right pl-2">
//           <div className="text-[10px] text-zinc-500">{lastTime ? fmtTime(lastTime) : ""}</div>
//           {!!conv?.unseenMsg && (
//             <div className="mt-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-green-600 text-[10px] text-white">
//               {conv?.unseenMsg}
//             </div>
//           )}
//         </div>

//         {/* Row menu */}
//         <div className="ml-2 relative z-50" ref={menuRef}>
//           <button
//             className="p-1 rounded hover:bg-zinc-800"
//             onClick={(e) => {
//               e.stopPropagation();
//               setMenuOpen(menuOpen === conv._id ? null : conv._id);
//             }}
//           >
//             <EllipsisVertical className="text-zinc-400 hover:text-zinc-200" />
//           </button>

//           {menuOpen === conv._id && (
//             <div
//               className="absolute right-0 mt-2 bg-[#121418] rounded-lg shadow-lg border border-zinc-700 text-sm w-40 py-1"
//               onClick={(e) => e.stopPropagation()}
//             >
//               <button className="block w-full text-left px-4 py-2 hover:bg-zinc-800" onClick={() => handleAction(conv._id, "mute")}>
//                 {conv.isMuted ? "Unmute" : "Mute"}
//               </button>
//               <button className="block w-full text-left px-4 py-2 hover:bg-zinc-800" onClick={() => handleAction(conv._id, "archive")}>
//                 {conv.isArchived ? "Unarchive" : "Archive"}
//               </button>
//               <button className="block w-full text-left px-4 py-2 hover:bg-zinc-800" onClick={() => handleAction(conv._id, "pin")}>
//                 {conv.isPinned ? "Unpin" : "Pin"}
//               </button>
//               <button className="block w-full text-left px-4 py-2 hover:bg-red-600/20 text-red-300" onClick={() => handleAction(conv._id, "delete")}>
//                 Delete
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//     );
//   };

//   return (
//     <div className="w-full h-full grid grid-cols-[56px,1fr] bg-[#0b0d11] text-zinc-100">
//       {/* Toaster */}
//       <Toaster
//         position="top-center"
//         toastOptions={{
//           duration: 2000,
//           style: {
//             background: "#202c33",
//             color: "#e9edef",
//             borderRadius: "8px",
//             fontSize: "14px",
//           },
//         }}
//       />

//       {/* Left mini bar */}
//       <div className="bg-[#0b0d11] border-r border-zinc-800 h-full py-5 flex flex-col items-center justify-between">
//         <div className="space-y-1">
//           <div className="w-12 h-12 grid place-items-center cursor-pointer text-zinc-300 hover:text-zinc-100 rounded">
//             <MessageCircle size={20} />
//           </div>

//           <div
//             title="Add friend"
//             onClick={() => setOpenSearchUser(true)}
//             className="w-12 h-12 grid place-items-center cursor-pointer text-zinc-300 hover:text-zinc-100 rounded"
//           >
//             <UserPlus size={20} />
//           </div>

//           <div
//             title="Groups"
//             onClick={() => navigate("/groups")}
//             className="w-12 h-12 grid place-items-center cursor-pointer text-zinc-300 hover:text-zinc-100 rounded"
//           >
//             <User size={20} />
//           </div>
//         </div>

//         <div className="flex flex-col items-center gap-2">
//           <button onClick={() => setEditProfile(true)}>
//             <Avatar imageUrl={user?.profilePic} name={user?.name} userId={user?._id} />
//           </button>
//           <button title="Logout" onClick={handleLogout} className="text-zinc-300 hover:text-zinc-100">
//             <LogOut size={20} />
//           </button>
//         </div>
//       </div>

//       {/* Main list panel */}
//       <div className="w-full bg-[#0b0d11]">
//         {/* Header */}
//         <div className="h-14 px-3 sm:px-4 border-b border-zinc-800 flex items-center justify-between">
//           <h2 className="font-semibold">Chats</h2>
//           <div className="flex gap-2 text-zinc-300">
//             <SquarePlus size={18} className="cursor-pointer hover:text-zinc-100" />
//             <EllipsisVertical size={18} className="cursor-pointer hover:text-zinc-100" />
//           </div>
//         </div>

//         {/* Search */}
//         <div className="px-3 py-3 border-b border-zinc-800">
//           <div className="flex items-center gap-2 bg-[#0f1216] border border-zinc-700 rounded-xl px-3 py-2">
//             <Search size={16} className="text-zinc-500" />
//             <input
//               type="text"
//               placeholder="Search chats..."
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               className="bg-transparent outline-none w-full text-sm text-zinc-300 placeholder-zinc-500"
//             />
//           </div>
//         </div>

//         {/* Archived row */}
//         {archived.length > 0 && (
//           <button
//             className="w-full flex items-center justify-between px-4 py-2 text-zinc-300 hover:bg-zinc-900/60 border-b border-zinc-900"
//             onClick={() => setShowArchived((s) => !s)}
//           >
//             <div className="flex items-center gap-3">
//               <Archive size={18} className="text-zinc-300" />
//               <span>Archived</span>
//               <span className="text-xs opacity-70">({archived.length})</span>
//             </div>
//             {showArchived ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
//           </button>
//         )}

//         {/* Lists */}
//         <div className="h-[calc(100vh-168px)] overflow-x-hidden overflow-y-auto pb-4">
//           {showArchived && archived.map((c) => <ChatRow key={c?._id} conv={c} />)}

//           {pinned.length > 0 && (
//             <div className="px-4 pt-3 pb-1 text-xs uppercase tracking-wider text-zinc-500">Pinned</div>
//           )}
//           {pinned.map((c) => (
//             <ChatRow key={c?._id} conv={c} />
//           ))}

//           {pinned.length > 0 && regular.length > 0 && (
//             <div className="px-4 pt-3 pb-1 text-xs uppercase tracking-wider text-zinc-500">Chats</div>
//           )}
//           {regular.length > 0 ? (
//             regular.map((c) => <ChatRow key={c?._id} conv={c} />)
//           ) : pinned.length === 0 && archived.length === 0 ? (
//             <div className="mt-12 text-center text-zinc-400">
//               <ArrowUpLeft size={50} className="mx-auto text-zinc-600" />
//               <p className="text-lg">No chats found</p>
//             </div>
//           ) : null}
//         </div>
//       </div>

//       {openSearchUser && <AddUser setOpenSearchUser={setOpenSearchUser} />}
//       {editProfile && <EditProfile setEditProfile={setEditProfile} user={user} setUser={setUser} />}
//     </div>
//   );
// };

// export default Side;
import React, { useEffect, useMemo, useRef, useState } from "react";
import { GetSocket } from "../utils/Sockets";
import {
  ArrowUpLeft, EllipsisVertical, Image as ImageIcon, LogOut,
  MessageCircle, SquarePlus, UserPlus, User, Video, Search,
  Pin, BellOff, Archive, ChevronDown, ChevronRight, FileText, Play
} from "lucide-react";
import Avatar from "./Avatar";
import { useLocalStorage } from "@mantine/hooks";
import { useNavigate } from "react-router-dom";
import AddUser from "./AddUser";
import EditProfile from "./EditProfile";
import axios from "axios";
import toast, { Toaster } from "react-hot-toast";

const API_BASE = "http://localhost:5000/api/chat";

/* helpers */
const fmtTime = (d) => {
  try {
    const date = new Date(d);
    return isNaN(date) ? "" : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch { return ""; }
};

const Side = ({ onSelectChat }) => {
  const navigate = useNavigate();
  const [user, setUser] = useLocalStorage({ key: "userData", defaultValue: {} });

  const socket =
    (typeof GetSocket === "function"
      ? GetSocket()
      : GetSocket?.socket || GetSocket?.current || GetSocket) || null;

  const [openSearchUser, setOpenSearchUser] = useState(false);
  const [editProfile, setEditProfile] = useState(false);
  const [allUsers, setAllUsers] = useState([]);
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(null);
  const [showArchived, setShowArchived] = useState(false);
  const [typingMap, setTypingMap] = useState({});
  const menuRef = useRef(null);

  /* socket: conversations list */
  useEffect(() => {
    if (!socket || !user?._id) return;

    socket.emit("side", user._id);

    const onConv = (data) => {
      const updated = (data || []).map((conv) => {
        const youAreSender = String(conv?.sender?._id) === String(user._id);
        const peer = youAreSender ? conv.receiver : conv.sender;
        return {
          ...conv,
          userDetails: peer,
          unseenMsg: conv.unseen,
        };
      });

      setAllUsers((prev) => {
        const prevById = new Map(prev.map((c) => [c._id, c]));
        return updated.map((c) => {
          const local = prevById.get(c._id);
          return local
            ? {
                ...c,
                isMuted: local.isMuted ?? c.isMuted,
                isPinned: local.isPinned ?? c.isPinned,
                isArchived: local.isArchived ?? c.isArchived,
              }
            : c;
        });
      });
    };

    const onTyping = ({ from, to, isTyping }) => {
      if (!from || String(to) !== String(user._id)) return;
      setTypingMap((m) => (isTyping ? { ...m, [from]: Date.now() } : { ...m, [from]: 0 }));
    };

    socket.on("conv", onConv);
    socket.on("typing", onTyping);

    return () => {
      socket.off("conv", onConv);
      socket.off("typing", onTyping);
    };
  }, [socket, user?._id]);

  /* close menu on outside click */
  useEffect(() => {
    const onDocClick = (e) => { if (!menuRef.current) return; if (!menuRef.current.contains(e.target)) setMenuOpen(null); };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const handleLogout = () => { setUser(null); navigate("/login"); };

  const highlightText = (text, query) => {
    if (!query) return text;
    const safe = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${safe})`, "gi");
    return String(text)
      .split(regex)
      .map((part, i) =>
        regex.test(part) ? (
          <span key={i} className="bg-yellow-400 text-black font-semibold rounded">
            {part}
          </span>
        ) : (
          part
        )
      );
  };

  /* sort/filter */
  const getLastActive = (c) => {
    const t = c?.lastMsg?.createdAt || c?.lastMsg?.time || c?.updatedAt || c?.createdAt || 0;
    return new Date(t).getTime() || 0;
  };

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allUsers;
    return allUsers.filter((c) => (c?.userDetails?.name || "").toLowerCase().includes(q));
  }, [allUsers, search]);

  const archived = useMemo(() => filtered.filter((c) => c?.isArchived), [filtered]);
  const notArchived = useMemo(() => filtered.filter((c) => !c?.isArchived), [filtered]);

  const notArchivedSorted = useMemo(() => {
    const arr = [...notArchived];
    arr.sort((a, b) => {
      if (a?.isPinned && !b?.isPinned) return -1;
      if (!a?.isPinned && b?.isPinned) return 1;
      return getLastActive(b) - getLastActive(a);
    });
    return arr;
  }, [notArchived]);

  const pinned = useMemo(() => notArchivedSorted.filter((c) => c?.isPinned), [notArchivedSorted]);
  const regular = useMemo(() => notArchivedSorted.filter((c) => !c?.isPinned), [notArchivedSorted]);

  /* row actions */
  const actionLabels = {
    mute: { loading: "Muting chat…", successOn: "Chat muted", successOff: "Chat unmuted", error: "Failed to mute chat" },
    archive: { loading: "Archiving chat…", successOn: "Chat archived", successOff: "Chat unarchived", error: "Failed to archive chat" },
    pin: { loading: "Pinning chat…", successOn: "Chat pinned", successOff: "Chat unpinned", error: "Failed to pin chat" },
    delete: { loading: "Deleting chat…", successOn: "Chat deleted", error: "Failed to delete chat" },
  };

  const handleAction = async (chatId, action) => {
    const prev = allUsers;

    // optimistic update
    if (action === "delete") {
      setAllUsers((p) => p.filter((c) => c._id !== chatId));
    } else {
      setAllUsers((p) =>
        p.map((c) =>
          c._id === chatId
            ? action === "mute"
              ? { ...c, isMuted: !c.isMuted }
              : action === "archive"
              ? { ...c, isArchived: !c.isArchived }
              : action === "pin"
              ? { ...c, isPinned: !c.isPinned }
              : c
            : c
        )
      );
    }

    const labels = actionLabels[action];
    const req =
      action === "delete"
        ? axios.delete(`${API_BASE}/${chatId}/delete`)
        : axios.put(`${API_BASE}/${chatId}/${action}`, {});

    await toast.promise(
      req,
      {
        loading: labels.loading,
        success: (res) => {
          if (action === "delete") return labels.successOn;
          if (action === "mute") return res?.data?.isMuted ? labels.successOn : labels.successOff;
          if (action === "archive") return res?.data?.isArchived ? labels.successOn : labels.successOff;
          if (action === "pin") return res?.data?.isPinned ? labels.successOn : labels.successOff;
          return "Done";
        },
        error: (err) => {
          setAllUsers(prev); // rollback
          return err?.response?.data?.message || labels.error || "Something went wrong";
        },
      },
      {
        style: {
          background: "#202c33",
          color: "#e9edef",
          borderRadius: "8px",
          fontSize: "14px",
          padding: "10px 14px",
        },
        success: { duration: 2000, icon: "✔️" },
        error: { duration: 2200, icon: "⚠️" },
        loading: { duration: 100000 },
      }
    );

    setMenuOpen(null);
  };

  /* row */
  const ChatRow = ({ conv }) => {
    const last = conv?.lastMsg || {};
    const lastTime = last?.createdAt || last?.time;

    const isTypingActive =
      typingMap[conv?.userDetails?._id] && Date.now() - typingMap[conv.userDetails._id] < 3500;

    const preview = isTypingActive ? (
      <span className="text-emerald-400">typing…</span>
    ) : last?.imageUrl || (last?.url && /\/image\/upload\//.test(last.url)) ? (
      <>
        <ImageIcon size={14} /> <span>Image</span>
      </>
    ) : last?.videoUrl ? (
      <>
        <Video size={14} /> <span>Video</span>
      </>
    ) : last?.audioUrl ? (
      <>
        <Play size={14} /> <span>Audio</span>
      </>
    ) : last?.fileUrl || (last?.url && (/\/raw\/upload\//.test(last.url) || /\.(pdf|docx?|pptx?|xlsx|csv|txt)$/i.test(last.url))) ? (
      <>
        <FileText size={14} /> <span>File</span>
      </>
    ) : last?.text ? (
      <span className="truncate">{last.text}</span>
    ) : (
      <span className="opacity-60">No messages yet</span>
    );

    return (
      <div
        className="relative flex items-center gap-3 px-4 py-3 border-b border-zinc-900 hover:bg-zinc-900/60 cursor-pointer"
        onClick={() => {
          navigate(`/${conv?.userDetails?._id}`);
          onSelectChat?.(conv.userDetails);
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          setMenuOpen(menuOpen === conv._id ? null : conv._id);
        }}
      >
        <Avatar imageUrl={conv?.userDetails?.profilePic} name={conv?.userDetails?.name} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <h3 className="text-zinc-200 font-medium truncate">
              {highlightText(conv?.userDetails?.name, search)}
            </h3>
            {conv?.isPinned && <Pin size={14} className="text-zinc-400 shrink-0" />}
            {conv?.isMuted && <BellOff size={14} className="text-zinc-400 shrink-0" />}
            {conv?.isArchived && <Archive size={14} className="text-zinc-400 shrink-0" />}
          </div>

          <div className="text-xs text-zinc-500 flex items-center gap-2 min-w-0">
            <div className="flex items-center gap-1 min-w-0 truncate">{preview}</div>
          </div>
        </div>

        <div className="text-right pl-2">
          <div className="text-[10px] text-zinc-500">{lastTime ? fmtTime(lastTime) : ""}</div>
          {!!conv?.unseenMsg && (
            <div className="mt-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-green-600 text-[10px] text-white">
              {conv?.unseenMsg}
            </div>
          )}
        </div>

        {/* Row menu */}
        <div className="ml-2 relative z-50" ref={menuRef}>
          <button
            className="p-1 rounded hover:bg-zinc-800"
            onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === conv._id ? null : conv._id); }}
          >
            <EllipsisVertical className="text-zinc-400 hover:text-zinc-200" />
          </button>

          {menuOpen === conv._id && (
            <div
              className="absolute right-0 mt-2 bg-[#121418] rounded-lg shadow-lg border border-zinc-700 text-sm w-40 py-1"
              onClick={(e) => e.stopPropagation()}
            >
              <button className="block w-full text-left px-4 py-2 hover:bg-zinc-800" onClick={() => handleAction(conv._id, "mute")}>
                {conv.isMuted ? "Unmute" : "Mute"}
              </button>
              <button className="block w-full text-left px-4 py-2 hover:bg-zinc-800" onClick={() => handleAction(conv._id, "archive")}>
                {conv.isArchived ? "Unarchive" : "Archive"}
              </button>
              <button className="block w-full text-left px-4 py-2 hover:bg-zinc-800" onClick={() => handleAction(conv._id, "pin")}>
                {conv.isPinned ? "Unpin" : "Pin"}
              </button>
              <button className="block w-full text-left px-4 py-2 hover:bg-red-600/20 text-red-300" onClick={() => handleAction(conv._id, "delete")}>
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="w-full h-full grid grid-cols-[56px,1fr] bg-[#0b0d11] text-zinc-100">
      {/* Toaster */}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 2000,
          style: { background: "#202c33", color: "#e9edef", borderRadius: "8px", fontSize: "14px" },
        }}
      />

      {/* Left mini bar */}
      <div className="bg-[#0b0d11] border-r border-zinc-800 h-full py-5 flex flex-col items-center justify-between">
        <div className="space-y-1">
          <div className="w-12 h-12 grid place-items-center cursor-pointer text-zinc-300 hover:text-zinc-100 rounded">
            <MessageCircle size={20} />
          </div>
          <div title="Add friend" onClick={() => setOpenSearchUser(true)} className="w-12 h-12 grid place-items-center cursor-pointer text-zinc-300 hover:text-zinc-100 rounded">
            <UserPlus size={20} />
          </div>
          <div title="Groups" onClick={() => navigate("/groups")} className="w-12 h-12 grid place-items-center cursor-pointer text-zinc-300 hover:text-zinc-100 rounded">
            <User size={20} />
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <button onClick={() => setEditProfile(true)}>
            <Avatar imageUrl={user?.profilePic} name={user?.name} userId={user?._id} />
          </button>
          <button title="Logout" onClick={handleLogout} className="text-zinc-300 hover:text-zinc-100">
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {/* Main list panel */}
      <div className="w-full bg-[#0b0d11]">
        {/* Header */}
        <div className="h-14 px-3 sm:px-4 border-b border-zinc-800 flex items-center justify-between">
          <h2 className="font-semibold">Chats</h2>
          <div className="flex gap-2 text-zinc-300">
            <SquarePlus size={18} className="cursor-pointer hover:text-zinc-100" />
            <EllipsisVertical size={18} className="cursor-pointer hover:text-zinc-100" />
          </div>
        </div>

        {/* Search */}
        <div className="px-3 py-3 border-b border-zinc-800">
          <div className="flex items-center gap-2 bg-[#0f1216] border border-zinc-700 rounded-xl px-3 py-2">
            <Search size={16} className="text-zinc-500" />
            <input
              type="text"
              placeholder="Search chats..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent outline-none w-full text-sm text-zinc-300 placeholder-zinc-500"
            />
          </div>
        </div>

        {/* Archived */}
        {archived.length > 0 && (
          <button
            className="w-full flex items-center justify-between px-4 py-2 text-zinc-300 hover:bg-zinc-900/60 border-b border-zinc-900"
            onClick={() => setShowArchived((s) => !s)}
          >
            <div className="flex items-center gap-3">
              <Archive size={18} className="text-zinc-300" />
              <span>Archived</span>
              <span className="text-xs opacity-70">({archived.length})</span>
            </div>
            {showArchived ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </button>
        )}

        {/* Lists */}
        <div className="h-[calc(100vh-168px)] overflow-x-hidden overflow-y-auto pb-4">
          {showArchived && archived.map((c) => <ChatRow key={c?._id} conv={c} />)}

          {pinned.length > 0 && (
            <div className="px-4 pt-3 pb-1 text-xs uppercase tracking-wider text-zinc-500">Pinned</div>
          )}
          {pinned.map((c) => <ChatRow key={c?._id} conv={c} />)}

          {pinned.length > 0 && regular.length > 0 && (
            <div className="px-4 pt-3 pb-1 text-xs uppercase tracking-wider text-zinc-500">Chats</div>
          )}
          {regular.length > 0 ? (
            regular.map((c) => <ChatRow key={c?._id} conv={c} />)
          ) : pinned.length === 0 && archived.length === 0 ? (
            <div className="mt-12 text-center text-zinc-400">
              <ArrowUpLeft size={50} className="mx-auto text-zinc-600" />
              <p className="text-lg">No chats found</p>
            </div>
          ) : null}
        </div>
      </div>

      {openSearchUser && <AddUser setOpenSearchUser={setOpenSearchUser} />}
      {editProfile && <EditProfile setEditProfile={setEditProfile} user={user} setUser={setUser} />}
    </div>
  );
};

export default Side;
