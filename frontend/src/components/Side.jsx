
// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { GetSocket } from "../utils/Sockets";
// import {
//   ArrowUpLeft, EllipsisVertical, Image as ImageIcon, LogOut,
//   MessageCircle, SquarePlus, UserPlus, User, Video, Search,
//   Pin, BellOff, Archive, ChevronDown, ChevronRight, FileText, Play, Users
// } from "lucide-react";
// import Avatar from "./Avatar";
// import { useLocalStorage } from "@mantine/hooks";
// import { useNavigate } from "react-router-dom";
// import AddUser from "./AddUser";
// import EditProfile from "./EditProfile";
// import axios from "axios";
// import http from "../utils/http";
// import toast, { Toaster } from "react-hot-toast";

// const API_BASE = "http://localhost:5000/api/chat";

// /* helpers */
// const fmtTime = (d) => {
//   try {
//     const date = new Date(d);
//     return isNaN(date) ? "" : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
//   } catch { return ""; }
// };

// const Side = ({ onSelectChat }) => {
//   const navigate = useNavigate();
//   const [user, setUser] = useLocalStorage({ key: "userData", defaultValue: {} });

//   const socket =
//     (typeof GetSocket === "function"
//       ? GetSocket()
//       : GetSocket?.socket || GetSocket?.current || GetSocket) || null;

//   const [openSearchUser, setOpenSearchUser] = useState(false);
//   const [editProfile, setEditProfile] = useState(false);

//   // tabs
//   const [activeTab, setActiveTab] = useState("chats"); // "chats" | "groups"

//   // chats state
//   const [allUsers, setAllUsers] = useState([]);
//   const [typingMap, setTypingMap] = useState({});
//   const [lastPreviewMap, setLastPreviewMap] = useState({}); // { [peerId]: { text, kind, time } }

//   // groups state
//   const [groups, setGroups] = useState([]);
//   const [groupsLoading, setGroupsLoading] = useState(false);
//   const [groupUnread, setGroupUnread] = useState({}); // optional: if your API provides counts

//   // common UI state
//   const [search, setSearch] = useState("");
//   const [menuOpen, setMenuOpen] = useState(null);
//   const [showArchived, setShowArchived] = useState(false);
//   const menuRef = useRef(null);

//   /* ----- ask server for the latest thread per peer (for preview only) ----- */
//   const requestLastForPeer = (peerId) => {
//     if (!socket || !peerId) return;
//     // This uses your existing contract; it does NOT mark seen by itself.
//     socket.emit("msgPage", peerId);
//   };

//   /* socket: conversations list (1:1) */
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
//         const next = updated.map((c) => {
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

//         // fetch last message preview for each peer if we don't have it yet
//         next.forEach((c) => {
//           const pid = c?.userDetails?._id;
//           if (pid && !lastPreviewMap[pid]) requestLastForPeer(pid);
//         });

//         return next;
//       });
//     };

//     const onTyping = ({ from, to, isTyping }) => {
//       if (!from || String(to) !== String(user._id)) return;
//       setTypingMap((m) => (isTyping ? { ...m, [from]: Date.now() } : { ...m, [from]: 0 }));
//     };

//     // When we request msgPage(peerId), server sends: { chatWith, original: [], translated?: [] }
//     const onMessage = (payload) => {
//       try {
//         const peerId = payload?.chatWith;
//         const list = Array.isArray(payload?.original) ? payload.original : [];
//         if (!peerId || list.length === 0) return;

//         const last = list[list.length - 1] || {};
//         const time = last?.createdAt || last?.updatedAt || last?.time || "";

//         // Try to get translated preview if available
//         let text =
//           last?.translatedMessage ||
//           last?.text ||
//           last?.content ||
//           (typeof last?.message === "string" ? last?.message : "");

//         if (!text && Array.isArray(payload?.translated)) {
//           const t = payload.translated.find((t) => t?._id === last?._id);
//           if (t?.translatedMessage) text = t.translatedMessage;
//         }

//         // Detect kind for icon
//         const kind = last?.messageType ||
//           (last?.imageUrl ? "image" :
//            last?.videoUrl ? "video" :
//            last?.audioUrl ? "audio" :
//            last?.fileUrl  ? "file"  :
//            (text ? "text" : "none"));

//         setLastPreviewMap((m) => {
//           const prev = m[peerId];
//           if (prev && prev.time === time && prev.text === text && prev.kind === kind) return m;
//           return { ...m, [peerId]: { text, kind, time } };
//         });
//       } catch {
//         /* noop */
//       }
//     };

//     socket.on("conv", onConv);
//     socket.on("typing", onTyping);
//     socket.on("message", onMessage);

//     return () => {
//       socket.off("conv", onConv);
//       socket.off("typing", onTyping);
//       socket.off("message", onMessage);
//     };
//   }, [socket, user?._id, lastPreviewMap]);

//   /* groups: load when tab opens (or once) */
//   const loadGroups = async () => {
//     try {
//       setGroupsLoading(true);
//       const { data } = await http.get("/api/groups");
//       setGroups(data?.groups || []);
//     } catch (err) {
//       toast.error(err?.response?.data?.message || "Failed to load groups");
//     } finally {
//       setGroupsLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (activeTab === "groups" && groups.length === 0) {
//       loadGroups();
//     }
//   }, [activeTab]); // eslint-disable-line

//   /* close menu on outside click */
//   useEffect(() => {
//     const onDocClick = (e) => { if (!menuRef.current) return; if (!menuRef.current.contains(e.target)) setMenuOpen(null); };
//     document.addEventListener("click", onDocClick);
//     return () => document.removeEventListener("click", onDocClick);
//   }, []);

//   const handleLogout = () => { setUser(null); navigate("/login"); };

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

//   /* sort/filter (chats) */
//   const getLastActive = (c) => {
//     const pid = c?.userDetails?._id;
//     const p = pid ? lastPreviewMap[pid] : null;
//     const t = p?.time || c?.updatedAt || c?.createdAt || 0;
//     return new Date(t).getTime() || 0;
//   };

//   const filteredChats = useMemo(() => {
//     const q = search.trim().toLowerCase();
//     const list = allUsers;
//     if (!q) return list;
//     return list.filter((c) => (c?.userDetails?.name || "").toLowerCase().includes(q));
//   }, [allUsers, search]);

//   const archived = useMemo(() => filteredChats.filter((c) => c?.isArchived), [filteredChats]);
//   const notArchived = useMemo(() => filteredChats.filter((c) => !c?.isArchived), [filteredChats]);

//   const notArchivedSorted = useMemo(() => {
//     const arr = [...notArchived];
//     arr.sort((a, b) => {
//       if (a?.isPinned && !b?.isPinned) return -1;
//       if (!a?.isPinned && b?.isPinned) return 1;
//       return getLastActive(b) - getLastActive(a);
//     });
//     return arr;
//   }, [notArchived, lastPreviewMap]);

//   const pinned = useMemo(() => notArchivedSorted.filter((c) => c?.isPinned), [notArchivedSorted]);
//   const regular = useMemo(() => notArchivedSorted.filter((c) => !c?.isPinned), [notArchivedSorted]);

//   /* groups filter */
//   const filteredGroups = useMemo(() => {
//     const q = search.trim().toLowerCase();
//     if (!q) return groups;
//     return groups.filter((g) => (g?.name || "").toLowerCase().includes(q));
//   }, [groups, search]);

//   /* row actions (chat) */
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

//   setMenuOpen(null);
//   };

//   /* chat row */
//   const ChatRow = ({ conv }) => {
//     const pid = conv?.userDetails?._id;
//     const last = pid ? lastPreviewMap[pid] : null;

//     const isTypingActive = typingMap[pid] && Date.now() - typingMap[pid] < 3500;

//     const preview = isTypingActive ? (
//       <span className="text-emerald-400">typing…</span>
//     ) : last?.kind === "image" ? (
//       <>
//         <ImageIcon size={14} /> <span>Image</span>
//       </>
//     ) : last?.kind === "video" ? (
//       <>
//         <Video size={14} /> <span>Video</span>
//       </>
//     ) : last?.kind === "audio" ? (
//       <>
//         <Play size={14} /> <span>Audio</span>
//       </>
//     ) : last?.kind === "file" ? (
//       <>
//         <FileText size={14} /> <span>File</span>
//       </>
//     ) : last?.text ? (
//       <span className="truncate">{last.text}</span>
//     ) : (
//       <span className="opacity-60">No messages yet</span>
//     );

//     return (
//       <div
//         className="relative flex items-center gap-3 px-4 py-3 border-b border-zinc-900 hover:bg-zinc-900/60 cursor-pointer"
//         onClick={() => {
//           navigate(`/${pid}`);
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
//           <div className="text-[10px] text-zinc-500">{last?.time ? fmtTime(last.time) : ""}</div>
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
//             onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === conv._id ? null : conv._id); }}
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

//   /* group row (compact) */
//   const GroupRow = ({ g }) => {
//     const count = groupUnread[g._id] || 0; // if you wire unread later
//     const lastText = g?.lastMessage?.text || g?.lastMessage?.content || "";
//     const lastTime = g?.lastMessage?.time || g?.updatedAt || g?.createdAt;

//     return (
//       <button
//         key={g._id}
//         onClick={() => navigate(`/g/${g._id}`)}
//         className="w-full text-left px-4 py-3 border-b border-zinc-900 hover:bg-zinc-900/60 transition"
//       >
//         <div className="flex items-center gap-3">
//           <img
//             src={g.profilePic || "/group-placeholder.png"}
//             alt=""
//             className="w-10 h-10 rounded-full object-cover"
//           />
//           <div className="flex-1 min-w-0">
//             <div className="flex items-center gap-2">
//               <div className="font-medium truncate">{g.name}</div>
//             </div>
//             <div className="text-xs text-zinc-500 flex items-center gap-2">
//               <span className="truncate">{lastText || "No messages yet"}</span>
//             </div>
//           </div>
//           <div className="text-right">
//             <div className="text-[10px] text-zinc-500">
//               {lastTime ? fmtTime(lastTime) : ""}
//             </div>
//             {count > 0 && (
//               <div className="mt-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-green-600 text-[10px]">
//                 {count}
//               </div>
//             )}
//           </div>
//         </div>
//       </button>
//     );
//   };

//   return (
//     <div className="w-full h-full grid grid-cols-[56px,1fr] bg-[#0b0d11] text-zinc-100">
//       {/* Toaster */}
//       <Toaster
//         position="top-center"
//         toastOptions={{
//           duration: 2000,
//           style: { background: "#202c33", color: "#e9edef", borderRadius: "8px", fontSize: "14px" },
//         }}
//       />

//       {/* Left mini bar */}
//       <div className="bg-[#0b0d11] border-r border-zinc-800 h-full py-5 flex flex-col items-center justify-between">
//         <div className="space-y-1">
//           <div className="w-12 h-12 grid place-items-center cursor-pointer text-zinc-300 hover:text-zinc-100 rounded">
//             <MessageCircle size={20} />
//           </div>
//           <div title="Add friend" onClick={() => setOpenSearchUser(true)} className="w-12 h-12 grid place-items-center cursor-pointer text-zinc-300 hover:text-zinc-100 rounded">
//             <UserPlus size={20} />
//           </div>
//           <div title="Groups (right pane uses GroupsChatContainer)" onClick={() => setActiveTab("groups")} className="w-12 h-12 grid place-items-center cursor-pointer text-zinc-300 hover:text-zinc-100 rounded">
//             <Users size={20} />
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
//               placeholder={activeTab === "groups" ? "Search groups..." : "Search chats..."}
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               className="bg-transparent outline-none w-full text-sm text-zinc-300 placeholder-zinc-500"
//             />
//           </div>

//           {/* Tabs under search */}
//           <div className="mt-2 flex border-b border-zinc-800">
//             <button
//               className={`flex-1 py-2 text-sm font-medium ${
//                 activeTab === "chats" ? "border-b-2 border-emerald-500 text-emerald-400" : "text-zinc-400"
//               }`}
//               onClick={() => setActiveTab("chats")}
//             >
//               Chats
//             </button>
//             <button
//               className={`flex-1 py-2 text-sm font-medium ${
//                 activeTab === "groups" ? "border-b-2 border-emerald-500 text-emerald-400" : "text-zinc-400"
//               }`}
//               onClick={() => setActiveTab("groups")}
//             >
//               Groups
//             </button>
//           </div>
//         </div>

//         {/* Archived (only for chats tab) */}
//         {activeTab === "chats" && archived.length > 0 && (
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
//         <div className="h-[calc(100vh-212px)] overflow-x-hidden overflow-y-auto pb-4">
//           {activeTab === "chats" ? (
//             <>
//               {showArchived && archived.map((c) => <ChatRow key={c?._id} conv={c} />)}

//               {pinned.length > 0 && (
//                 <div className="px-4 pt-3 pb-1 text-xs uppercase tracking-wider text-zinc-500">Pinned</div>
//               )}
//               {pinned.map((c) => <ChatRow key={c?._id} conv={c} />)}

//               {pinned.length > 0 && regular.length > 0 && (
//                 <div className="px-4 pt-3 pb-1 text-xs uppercase tracking-wider text-zinc-500">Chats</div>
//               )}
//               {regular.length > 0 ? (
//                 regular.map((c) => <ChatRow key={c?._id} conv={c} />)
//               ) : pinned.length === 0 && archived.length === 0 ? (
//                 <div className="mt-12 text-center text-zinc-400">
//                   <ArrowUpLeft size={50} className="mx-auto text-zinc-600" />
//                   <p className="text-lg">No chats found</p>
//                 </div>
//               ) : null}
//             </>
//           ) : (
//             <>
//               {groupsLoading && <p className="p-3 text-zinc-400">Loading…</p>}
//               {!groupsLoading && filteredGroups.length === 0 && (
//                 <p className="p-3 text-zinc-500">No groups yet</p>
//               )}
//               {filteredGroups.map((g) => <GroupRow key={g._id} g={g} />)}
//             </>
//           )}
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
  MessageCircle, /* SquarePlus (removed) */ UserPlus, Video, Search,
  Pin, BellOff, Archive, ChevronDown, ChevronRight, FileText, Play, Users,
  Sun, Moon, Trash2
} from "lucide-react";
import Avatar from "./Avatar";
import { useLocalStorage } from "@mantine/hooks";
import { useNavigate } from "react-router-dom";
import AddUser from "./AddUser";
import EditProfile from "./EditProfile";
import axios from "axios";
import http from "../utils/http";
import toast, { Toaster } from "react-hot-toast";

const CHAT_API_BASE = "http://localhost:5000/api/chat";
const GROUP_API_BASE = "/api/groups";

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
const [showArchived, setShowArchived] = useState(false);

  // theme (persist + apply to <html>)
  const [theme, setTheme] = useLocalStorage({ key: "theme", defaultValue: "dark" });
  const isDark = theme === "dark";
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove("light", "dark");
    root.classList.add(isDark ? "dark" : "light");
  }, [isDark]);
  const toggleTheme = () => setTheme((t) => (t === "dark" ? "light" : "dark"));

  // tabs
  const [activeTab, setActiveTab] = useState("chats"); // "chats" | "groups"

  // chats state
  const [allUsers, setAllUsers] = useState([]);
  const [typingMap, setTypingMap] = useState({});
  const [lastPreviewMap, setLastPreviewMap] = useState({}); // { [peerId]: { text, kind, time } }

  // groups state
  const [groups, setGroups] = useState([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [groupUnread, setGroupUnread] = useState({}); // optional: if your API provides counts

  // common UI state
  const [search, setSearch] = useState("");
  const [menuOpen, setMenuOpen] = useState(null); // for chat-row menu
  const [groupMenuOpen, setGroupMenuOpen] = useState(null); // for group-row menu
  const menuRef = useRef(null);
  const groupMenuRef = useRef(null);

  /* ----- ask server for the latest thread per peer (for preview only) ----- */
  const requestLastForPeer = (peerId) => {
    if (!socket || !peerId) return;
    socket.emit("msgPage", peerId);
  };

  /* socket: conversations list (1:1) */
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
        const next = updated.map((c) => {
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

        // fetch last message preview for each peer if we don't have it yet
        next.forEach((c) => {
          const pid = c?.userDetails?._id;
          if (pid && !lastPreviewMap[pid]) requestLastForPeer(pid);
        });

        return next;
      });
    };

    const onTyping = ({ from, to, isTyping }) => {
      if (!from || String(to) !== String(user._id)) return;
      setTypingMap((m) => (isTyping ? { ...m, [from]: Date.now() } : { ...m, [from]: 0 }));
    };

    const onMessage = (payload) => {
      try {
        const peerId = payload?.chatWith;
        const list = Array.isArray(payload?.original) ? payload.original : [];
        if (!peerId || list.length === 0) return;

        const last = list[list.length - 1] || {};
        const time = last?.createdAt || last?.updatedAt || last?.time || "";

        let text =
          last?.translatedMessage ||
          last?.text ||
          last?.content ||
          (typeof last?.message === "string" ? last?.message : "");

        if (!text && Array.isArray(payload?.translated)) {
          const t = payload.translated.find((t) => t?._id === last?._id);
          if (t?.translatedMessage) text = t.translatedMessage;
        }

        const kind = last?.messageType ||
          (last?.imageUrl ? "image" :
           last?.videoUrl ? "video" :
           last?.audioUrl ? "audio" :
           last?.fileUrl  ? "file"  :
           (text ? "text" : "none"));

        setLastPreviewMap((m) => {
          const prev = m[peerId];
          if (prev && prev.time === time && prev.text === text && prev.kind === kind) return m;
          return { ...m, [peerId]: { text, kind, time } };
        });
      } catch {}
    };

    socket.on("conv", onConv);
    socket.on("typing", onTyping);
    socket.on("message", onMessage);

    return () => {
      socket.off("conv", onConv);
      socket.off("typing", onTyping);
      socket.off("message", onMessage);
    };
  }, [socket, user?._id, lastPreviewMap]);

  /* groups: load when tab opens (or once) */
  const loadGroups = async () => {
    try {
      setGroupsLoading(true);
      const { data } = await http.get("/api/groups");
      const serverGroups = data?.groups || [];
      // preserve local flags if already present
      setGroups((prev) => {
        const byId = new Map(prev.map((g) => [g._id, g]));
        return serverGroups.map((g) => {
          const local = byId.get(g._id);
          return local
            ? {
                ...g,
                isPinned: local.isPinned ?? g.isPinned,
                isArchived: local.isArchived ?? g.isArchived,
                isMuted: local.isMuted ?? g.isMuted,
              }
            : g;
        });
      });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load groups");
    } finally {
      setGroupsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "groups" && groups.length === 0) {
      loadGroups();
    }
  }, [activeTab]); // eslint-disable-line

  /* close menus on outside click */
  useEffect(() => {
    const onDocClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(null);
      if (groupMenuRef.current && !groupMenuRef.current.contains(e.target)) setGroupMenuOpen(null);
    };
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
          <span key={i} className={isDark ? "bg-yellow-400 text-black" : "bg-yellow-200 text-black"} style={{ borderRadius: 3 }}>
            {part}
          </span>
        ) : (
          part
        )
      );
  };

  /* sort/filter (chats) */
  const getLastActive = (c) => {
    const pid = c?.userDetails?._id;
    const p = pid ? lastPreviewMap[pid] : null;
    const t = p?.time || c?.updatedAt || c?.createdAt || 0;
    return new Date(t).getTime() || 0;
  };

  const filteredChats = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = allUsers;
    if (!q) return list;
    return list.filter((c) => (c?.userDetails?.name || "").toLowerCase().includes(q));
  }, [allUsers, search]);

  const archived = useMemo(() => filteredChats.filter((c) => c?.isArchived), [filteredChats]);
  const notArchived = useMemo(() => filteredChats.filter((c) => !c?.isArchived), [filteredChats]);

  const notArchivedSorted = useMemo(() => {
    const arr = [...notArchived];
    arr.sort((a, b) => {
      if (a?.isPinned && !b?.isPinned) return -1;
      if (!a?.isPinned && b?.isPinned) return 1;
      return getLastActive(b) - getLastActive(a);
    });
    return arr;
  }, [notArchived, lastPreviewMap]);

  const pinned = useMemo(() => notArchivedSorted.filter((c) => c?.isPinned), [notArchivedSorted]);
  const regular = useMemo(() => notArchivedSorted.filter((c) => !c?.isPinned), [notArchivedSorted]);

  /* groups filter */
  const filteredGroups = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return groups;
    return groups.filter((g) => (g?.name || "").toLowerCase().includes(q));
  }, [groups, search]);

  /* row actions (chat) */
  const chatActionLabels = {
    mute: { loading: "Muting chat…", successOn: "Chat muted", successOff: "Chat unmuted", error: "Failed to mute chat" },
    archive: { loading: "Archiving chat…", successOn: "Chat archived", successOff: "Chat unarchived", error: "Failed to archive chat" },
    pin: { loading: "Pinning chat…", successOn: "Chat pinned", successOff: "Chat unpinned", error: "Failed to pin chat" },
    delete: { loading: "Deleting chat…", successOn: "Chat deleted", error: "Failed to delete chat" },
  };

  const handleChatAction = async (chatId, action) => {
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

    const labels = chatActionLabels[action];
    const req =
      action === "delete"
        ? axios.delete(`${CHAT_API_BASE}/${chatId}/delete`)
        : axios.put(`${CHAT_API_BASE}/${chatId}/${action}`, {});

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
          background: isDark ? "#202c33" : "#f3f4f6",
          color: isDark ? "#e9edef" : "#111827",
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

  /* groups actions: pin/archive/mute/delete (optimistic) */
  const groupActionLabels = {
    mute: { loading: "Muting group…", successOn: "Group muted", successOff: "Group unmuted", error: "Failed to mute group" },
    archive: { loading: "Archiving group…", successOn: "Group archived", successOff: "Group unarchived", error: "Failed to archive group" },
    pin: { loading: "Pinning group…", successOn: "Group pinned", successOff: "Group unpinned", error: "Failed to pin group" },
    delete: { loading: "Deleting group…", successOn: "Group deleted", error: "Failed to delete group" },
  };

  const handleGroupAction = async (groupId, action) => {
    const prev = groups;
    if (action === "delete") {
      setGroups((p) => p.filter((g) => g._id !== groupId));
    } else {
      setGroups((p) =>
        p.map((g) =>
          g._id === groupId
            ? action === "mute"
              ? { ...g, isMuted: !g.isMuted }
              : action === "archive"
              ? { ...g, isArchived: !g.isArchived }
              : action === "pin"
              ? { ...g, isPinned: !g.isPinned }
              : g
            : g
        )
      );
    }

    // Try conventional endpoints; adjust if your backend differs
    const labels = groupActionLabels[action];
    const req =
      action === "delete"
        ? axios.delete(`${GROUP_API_BASE}/delete`, { data: { groupId } }) // matches your GroupsChatContainer delete
        : axios.put(`${GROUP_API_BASE}/${action}`, { groupId });

    await toast.promise(
      req,
      {
        loading: labels.loading,
        success: (res) => {
          if (action === "delete") return labels.successOn;
          // If backend returns flags, you could use them; otherwise we keep optimistic state
          return (action === "mute" || action === "archive" || action === "pin")
            ? (res?.data?.message || "Done")
            : "Done";
        },
        error: (err) => {
          setGroups(prev); // rollback
          return err?.response?.data?.message || labels.error || "Something went wrong";
        },
      },
      {
        style: {
          background: isDark ? "#202c33" : "#f3f4f6",
          color: isDark ? "#e9edef" : "#111827",
          borderRadius: "8px",
          fontSize: "14px",
          padding: "10px 14px",
        },
        success: { duration: 2000, icon: "✔️" },
        error: { duration: 2200, icon: "⚠️" },
        loading: { duration: 100000 },
      }
    );

    setGroupMenuOpen(null);
  };

  /* chat row */
  const ChatRow = ({ conv }) => {
    const pid = conv?.userDetails?._id;
    const last = pid ? lastPreviewMap[pid] : null;

    const isTypingActive = typingMap[pid] && Date.now() - typingMap[pid] < 3500;

    const preview = isTypingActive ? (
      <span className="text-emerald-400">typing…</span>
    ) : last?.kind === "image" ? (
      <>
        <ImageIcon size={14} /> <span>Image</span>
      </>
    ) : last?.kind === "video" ? (
      <>
        <Video size={14} /> <span>Video</span>
      </>
    ) : last?.kind === "audio" ? (
      <>
        <Play size={14} /> <span>Audio</span>
      </>
    ) : last?.kind === "file" ? (
      <>
        <FileText size={14} /> <span>File</span>
      </>
    ) : last?.text ? (
      <span className="truncate">{last.text}</span>
    ) : (
      <span className="opacity-60">No messages yet</span>
    );

    const rowHover = isDark ? "hover:bg-zinc-900/60" : "hover:bg-zinc-100";
    const borderB = isDark ? "border-zinc-900" : "border-zinc-200";

    return (
      <div
        className={`relative flex items-center gap-3 px-4 py-3 border-b ${borderB} ${rowHover} cursor-pointer`}
        onClick={() => {
          navigate(`/${pid}`);
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
            <h3 className={`font-medium truncate ${isDark ? "text-zinc-200" : "text-zinc-800"}`}>
              {highlightText(conv?.userDetails?.name, search)}
            </h3>
            {conv?.isPinned && <Pin size={14} className="text-zinc-400 shrink-0" />}
            {conv?.isMuted && <BellOff size={14} className="text-zinc-400 shrink-0" />}
            {conv?.isArchived && <Archive size={14} className="text-zinc-400 shrink-0" />}
          </div>

          <div className={`text-xs flex items-center gap-2 min-w-0 ${isDark ? "text-zinc-500" : "text-zinc-600"}`}>
            <div className="flex items-center gap-1 min-w-0 truncate">{preview}</div>
          </div>
        </div>

        <div className="text-right pl-2">
          <div className={`text-[10px] ${isDark ? "text-zinc-500" : "text-zinc-600"}`}>{last?.time ? fmtTime(last.time) : ""}</div>
          {!!conv?.unseenMsg && (
            <div className="mt-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-green-600 text-[10px] text-white">
              {conv?.unseenMsg}
            </div>
          )}
        </div>

        {/* Row menu */}
        <div className="ml-2 relative z-50" ref={menuRef}>
          <button
            className={`p-1 rounded ${isDark ? "hover:bg-zinc-800" : "hover:bg-zinc-200"}`}
            onClick={(e) => { e.stopPropagation(); setMenuOpen(menuOpen === conv._id ? null : conv._id); }}
          >
            <EllipsisVertical className={`${isDark ? "text-zinc-400 hover:text-zinc-200" : "text-zinc-500 hover:text-zinc-700"}`} />
          </button>

          {menuOpen === conv._id && (
            <div
              className={`absolute right-0 mt-2 rounded-lg shadow-lg border text-sm w-40 py-1
                ${isDark ? "bg-[#121418] border-zinc-700" : "bg-white border-zinc-200"}`}
              onClick={(e) => e.stopPropagation()}
            >
              <button className={`block w-full text-left px-4 py-2 ${isDark ? "hover:bg-zinc-800" : "hover:bg-zinc-100"}`} onClick={() => handleChatAction(conv._id, "mute")}>
                {conv.isMuted ? "Unmute" : "Mute"}
              </button>
              <button className={`block w-full text-left px-4 py-2 ${isDark ? "hover:bg-zinc-800" : "hover:bg-zinc-100"}`} onClick={() => handleChatAction(conv._id, "archive")}>
                {conv.isArchived ? "Unarchive" : "Archive"}
              </button>
              <button className={`block w-full text-left px-4 py-2 ${isDark ? "hover:bg-zinc-800" : "hover:bg-zinc-100"}`} onClick={() => handleChatAction(conv._id, "pin")}>
                {conv.isPinned ? "Unpin" : "Pin"}
              </button>
              <button className={`block w-full text-left px-4 py-2 ${isDark ? "hover:bg-red-600/20 text-red-300" : "hover:bg-red-50 text-red-600"}`} onClick={() => handleChatAction(conv._id, "delete")}>
                Delete
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  /* group row (compact) */
  const GroupRow = ({ g }) => {
    const count = groupUnread[g._id] || 0;
    const lastText = g?.lastMessage?.text || g?.lastMessage?.content || "";
    const lastTime = g?.lastMessage?.time || g?.updatedAt || g?.createdAt;

    const rowHover = isDark ? "hover:bg-zinc-900/60" : "hover:bg-zinc-100";
    const borderB = isDark ? "border-zinc-900" : "border-zinc-200";

    return (
      <div
        key={g._id}
        className={`relative w-full text-left px-4 py-3 border-b ${borderB} ${rowHover} transition flex items-center gap-3`}
        onClick={() => navigate(`/g/${g._id}`)}
        onContextMenu={(e) => { e.preventDefault(); setGroupMenuOpen(groupMenuOpen === g._id ? null : g._id); }}
      >
        <img
          src={g.profilePic || "/group-placeholder.png"}
          alt=""
          className="w-10 h-10 rounded-full object-cover"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className={`font-medium truncate ${isDark ? "text-zinc-200" : "text-zinc-800"}`}>{g.name}</div>
            {g?.isPinned && <Pin size={14} className="text-zinc-400 shrink-0" />}
            {g?.isMuted && <BellOff size={14} className="text-zinc-400 shrink-0" />}
            {g?.isArchived && <Archive size={14} className="text-zinc-400 shrink-0" />}
          </div>
          <div className={`text-xs flex items-center gap-2 ${isDark ? "text-zinc-500" : "text-zinc-600"}`}>
            <span className="truncate">{lastText || "No messages yet"}</span>
          </div>
        </div>
        <div className="text-right">
          <div className={`text-[10px] ${isDark ? "text-zinc-500" : "text-zinc-600"}`}>
            {lastTime ? fmtTime(lastTime) : ""}
          </div>
          {count > 0 && (
            <div className="mt-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-green-600 text-[10px] text-white">
              {count}
            </div>
          )}
        </div>

        {/* Group row menu */}
        <div className="ml-2 relative z-50" ref={groupMenuRef}>
          <button
            className={`p-1 rounded ${isDark ? "hover:bg-zinc-800" : "hover:bg-zinc-200"}`}
            onClick={(e) => { e.stopPropagation(); setGroupMenuOpen(groupMenuOpen === g._id ? null : g._id); }}
          >
            <EllipsisVertical className={`${isDark ? "text-zinc-400 hover:text-zinc-200" : "text-zinc-500 hover:text-zinc-700"}`} />
          </button>

          {groupMenuOpen === g._id && (
            <div
              className={`absolute right-0 mt-2 rounded-lg shadow-lg border text-sm w-44 py-1
                ${isDark ? "bg-[#121418] border-zinc-700" : "bg-white border-zinc-200"}`}
              onClick={(e) => e.stopPropagation()}
            >
              <button className={`block w-full text-left px-4 py-2 ${isDark ? "hover:bg-zinc-800" : "hover:bg-zinc-100"}`} onClick={() => handleGroupAction(g._id, "mute")}>
                {g.isMuted ? "Unmute group" : "Mute group"}
              </button>
              <button className={`block w-full text-left px-4 py-2 ${isDark ? "hover:bg-zinc-800" : "hover:bg-zinc-100"}`} onClick={() => handleGroupAction(g._id, "archive")}>
                {g.isArchived ? "Unarchive group" : "Archive group"}
              </button>
              <button className={`block w-full text-left px-4 py-2 ${isDark ? "hover:bg-zinc-800" : "hover:bg-zinc-100"}`} onClick={() => handleGroupAction(g._id, "pin")}>
                {g.isPinned ? "Unpin group" : "Pin group"}
              </button>
              <button className={`block w-full text-left px-4 py-2 ${isDark ? "hover:bg-red-600/20 text-red-300" : "hover:bg-red-50 text-red-600"}`} onClick={() => handleGroupAction(g._id, "delete")}>
                <span className="inline-flex items-center gap-2"><Trash2 size={14}/> Delete group</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // Theme-aware base classes
  const bgMain = isDark ? "bg-[#0b0d11] text-zinc-100" : "bg-white text-zinc-900";
  const bgSidebar = isDark ? "bg-[#0b0d11]" : "bg-zinc-50";
  const borderMain = isDark ? "border-zinc-800" : "border-zinc-200";
  const headerText = isDark ? "text-zinc-100" : "text-zinc-800";
  const headerIcon = isDark ? "text-zinc-300 hover:text-zinc-100" : "text-zinc-600 hover:text-zinc-800";
  const inputWrap = isDark
    ? "bg-[#0f1216] border border-zinc-700"
    : "bg-zinc-100 border border-zinc-300";
  const inputText = isDark ? "text-zinc-300 placeholder-zinc-500" : "text-zinc-800 placeholder-zinc-400";

  return (
    <div className={`w-full h-full grid grid-cols-[56px,1fr] ${bgMain}`}>
      {/* Toaster */}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 2000,
          style: {
            background: isDark ? "#202c33" : "#f3f4f6",
            color: isDark ? "#e9edef" : "#111827",
            borderRadius: "8px",
            fontSize: "14px"
          },
        }}
      />

      {/* Left mini bar */}
      <div className={`${bgSidebar} border-r ${borderMain} h-full py-5 flex flex-col items-center justify-between`}>
        <div className="space-y-1">
          <div title="Chats" className={`w-12 h-12 grid place-items-center cursor-pointer ${headerIcon} rounded`} onClick={() => setActiveTab("chats")}>
            <MessageCircle size={20} />
          </div>
          <div title="Add friend" onClick={() => setOpenSearchUser(true)} className={`w-12 h-12 grid place-items-center cursor-pointer ${headerIcon} rounded`}>
            <UserPlus size={20} />
          </div>
          <div title="Groups" onClick={() => setActiveTab("groups")} className={`w-12 h-12 grid place-items-center cursor-pointer ${headerIcon} rounded`}>
            <Users size={20} />
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <button onClick={() => setEditProfile(true)}>
            <Avatar imageUrl={user?.profilePic} name={user?.name} userId={user?._id} />
          </button>
          <button title="Logout" onClick={handleLogout} className={headerIcon}>
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {/* Main list panel */}
      <div className={`w-full ${bgSidebar}`}>
        {/* Header */}
        <div className={`h-14 px-3 sm:px-4 border-b ${borderMain} flex items-center justify-between`}>
          <h2 className={`font-semibold ${headerText}`}>{activeTab === "groups" ? "Groups" : "Chats"}</h2>
          <div className="flex gap-2 items-center">
            {/* theme toggle */}
            <button
              title={isDark ? "Switch to light" : "Switch to dark"}
              onClick={toggleTheme}
              className={`cursor-pointer p-1 rounded ${headerIcon}`}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            <EllipsisVertical size={18} className={`cursor-pointer ${headerIcon}`} />
          </div>
        </div>

        {/* Search + Tabs */}
        <div className={`px-3 py-3 border-b ${borderMain}`}>
          <div className={`flex items-center gap-2 rounded-xl px-3 py-2 ${inputWrap}`}>
            <Search size={16} className={isDark ? "text-zinc-500" : "text-zinc-600"} />
            <input
              type="text"
              placeholder={activeTab === "groups" ? "Search groups..." : "Search chats..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className={`bg-transparent outline-none w-full text-sm ${inputText}`}
            />
          </div>

          {/* Tabs under search */}
          <div className={`mt-2 flex border-b ${borderMain}`}>
            <button
              className={`flex-1 py-2 text-sm font-medium ${
                activeTab === "chats"
                  ? "border-b-2 border-emerald-500 text-emerald-500"
                  : isDark ? "text-zinc-400" : "text-zinc-500"
              }`}
              onClick={() => setActiveTab("chats")}
            >
              Chats
            </button>
            <button
              className={`flex-1 py-2 text-sm font-medium ${
                activeTab === "groups"
                  ? "border-b-2 border-emerald-500 text-emerald-500"
                  : isDark ? "text-zinc-400" : "text-zinc-500"
              }`}
              onClick={() => setActiveTab("groups")}
            >
              Groups
            </button>
          </div>
        </div>

        {/* Archived (only for chats tab) */}
        {activeTab === "chats" && archived.length > 0 && (
          <button
            className={`w-full flex items-center justify-between px-4 py-2 ${isDark ? "text-zinc-300 hover:bg-zinc-900/60" : "text-zinc-700 hover:bg-zinc-100"} border-b ${isDark ? "border-zinc-900" : "border-zinc-200"}`}
            onClick={() => setShowArchived((s) => !s)}
          >
            <div className="flex items-center gap-3">
              <Archive size={18} className={isDark ? "text-zinc-300" : "text-zinc-600"} />
              <span>Archived</span>
              <span className="text-xs opacity-70">({archived.length})</span>
            </div>
            {showArchived ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </button>
        )}

        {/* Lists */}
        <div className="h-[calc(100vh-212px)] overflow-x-hidden overflow-y-auto pb-4">
          {activeTab === "chats" ? (
            <>
              {showArchived && archived.map((c) => <ChatRow key={c?._id} conv={c} />)}

              {pinned.length > 0 && (
                <div className={`px-4 pt-3 pb-1 text-xs uppercase tracking-wider ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>Pinned</div>
              )}
              {pinned.map((c) => <ChatRow key={c?._id} conv={c} />)}

              {pinned.length > 0 && regular.length > 0 && (
                <div className={`px-4 pt-3 pb-1 text-xs uppercase tracking-wider ${isDark ? "text-zinc-500" : "text-zinc-500"}`}>Chats</div>
              )}
              {regular.length > 0 ? (
                regular.map((c) => <ChatRow key={c?._id} conv={c} />)
              ) : pinned.length === 0 && archived.length === 0 ? (
                <div className={`mt-12 text-center ${isDark ? "text-zinc-400" : "text-zinc-500"}`}>
                  <ArrowUpLeft size={50} className={`mx-auto ${isDark ? "text-zinc-600" : "text-zinc-400"}`} />
                  <p className="text-lg">No chats found</p>
                </div>
              ) : null}
            </>
          ) : (
            <>
              {groupsLoading && <p className={isDark ? "p-3 text-zinc-400" : "p-3 text-zinc-600"}>Loading…</p>}
              {!groupsLoading && filteredGroups.length === 0 && (
                <p className={isDark ? "p-3 text-zinc-500" : "p-3 text-zinc-600"}>No groups yet</p>
              )}
              {filteredGroups.map((g) => <GroupRow key={g._id} g={g} />)}
            </>
          )}
        </div>
      </div>

      {openSearchUser && <AddUser setOpenSearchUser={setOpenSearchUser} />}
      {editProfile && <EditProfile setEditProfile={setEditProfile} user={user} setUser={setUser} />}
    </div>
  );
};

export default Side;
