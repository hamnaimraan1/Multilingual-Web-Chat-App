
// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { GetSocket } from "../utils/Sockets";
// import {
//   EllipsisVertical,
//   Image as ImageIcon,
//   LogOut,
//   MessageCircle,
//   UserPlus,
//   Video,
//   Search,
//   Pin,
//   BellOff,
//   Archive,
//   FileText,
//   Play,
//   Users,
//   Plus,
//   VolumeX,
//   Volume2,
//   Trash2,
//   ChevronDown,
//   ChevronRight,
// } from "lucide-react";
// import Avatar from "./Avatar";
// import { useLocalStorage } from "@mantine/hooks";
// import { useNavigate, useLocation } from "react-router-dom";
// import AddUser from "./AddUser";
// import EditProfile from "./EditProfile";
// import axios from "axios";
// import http from "../utils/http";
// import toast, { Toaster } from "react-hot-toast";

// /* ---------- constants ---------- */
// const CHAT_API_BASE = "/api/chat";   // you proxy to localhost:5000
// const fmtTime = (d) => {
//   try {
//     const date = new Date(d);
//     return isNaN(date) ? "" : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
//   } catch { return ""; }
// };
// const isOfficeOrPdf = (name = "") => /\.(pdf|docx?|pptx?|xlsx|csv|txt)(\?|$)/i.test(name);
// const pickUrl = (m = {}) =>
//   m.url || m.imageUrl || m.audioUrl || m.videoUrl || m.fileUrl ||
//   m.documentUrl || m.attachmentUrl || m.mediaUrl || m.path || null;
// const resolveType = (m = {}) => {
//   if (m.messageType) return m.messageType;
//   if (m.imageUrl) return "image";
//   if (m.audioUrl) return "audio";
//   if (m.videoUrl) return "video";
//   if (m.fileUrl || isOfficeOrPdf(m.fileName)) return "file";
//   const u = pickUrl(m);
//   if (!u) return "text";
//   if (/\/video\/upload\//.test(u)) return "video";
//   if (/\/raw\/upload\//.test(u) || isOfficeOrPdf(u)) return "file";
//   return "image";
// };
// const getSenderInfo = (m = {}) => {
//   const id =
//     m?.sender?._id ??
//     m?.senderId ??
//     (typeof m?.msgByUser === "object" ? m?.msgByUser?._id : m?.msgByUser) ??
//     m?.user?._id ??
//     m?.userId ??
//     m?.from ??
//     null;

//   const name =
//     m?.sender?.name ??
//     m?.user?.name ??
//     m?.fromName ??
//     m?.senderName ??
//     m?.authorName ??
//     "";

//   return { id, name };
// };
// const normalizeMessage = (raw) => {
//   if (!raw) return null;
//   const m = raw.message || raw;
//   const createdAt = m.createdAt || m.timestamp || new Date().toISOString();
//   const type = resolveType(m);
//   const url = pickUrl(m);
//   const { id: senderId, name: senderName } = getSenderInfo(m);
//   return {
//     ...m,
//     _id: m._id || raw._id,
//     createdAt,
//     messageType: type,
//     url,
//     _senderId: senderId || null,
//     _senderName: senderName || "",
//   };
// };
// const buildPreviewFromMsg = (m, fallbackTime, currentUserId) => {
//   if (!m) return { text: "", kind: "none", time: fallbackTime || "", senderId: null, senderName: "", prefix: "" };
//   const n = normalizeMessage(m);
//   const text = n?.message || n?.text || n?.content || n?.caption || "";
//   const kind = n?.messageType || "text";
//   const time = n?.createdAt || fallbackTime || "";
//   const senderId = n?._senderId || null;
//   const senderName = n?._senderName || "";
//   const prefix = senderId && currentUserId && String(senderId) === String(currentUserId) ? "You" : senderName || "";
//   return { text, kind, time, senderId, senderName, prefix };
// };
// const extractGroupPreviewFromList = (g, currentUserId) => {
//   const lm = typeof g?.lastMessage === "object" ? g.lastMessage : null;
//   if (lm) return buildPreviewFromMsg(lm, g?.updatedAt || g?.createdAt, currentUserId);

//   if (g?.lastMessageText || g?.lastMessageType || g?.lastMessageAt || g?.lastMessageSenderId || g?.lastMessageSenderName) {
//     const time = g?.lastMessageAt || g?.updatedAt || g?.createdAt || "";
//     const kind = g?.lastMessageType || (g?.lastMessageText ? "text" : "none");
//     const senderId = g?.lastMessageSenderId || null;
//     const senderName = g?.lastMessageSenderName || "";
//     const prefix = senderId && currentUserId && String(senderId) === String(currentUserId) ? "You" : senderName || "";
//     return { text: g?.lastMessageText || "", kind, time, senderId, senderName, prefix };
//   }
//   return { text: "", kind: "none", time: g?.updatedAt || g?.createdAt || "", senderId: null, senderName: "", prefix: "" };
// };
// const isGroupRoute = (p) => /^\/g(?:\/|$)/i.test(p);

// /* ---------- component ---------- */
// const Side = ({ onSelectChat }) => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [user, setUser] = useLocalStorage({ key: "userData", defaultValue: {} });

//   const socket =
//     (typeof GetSocket === "function" ? GetSocket() : GetSocket?.socket || GetSocket?.current || GetSocket) || null;

//   /* modals */
//   const [openSearchUser, setOpenSearchUser] = useState(false);
//   const [editProfile, setEditProfile] = useState(false);

//   /* tabs */
//   const [activeTab, setActiveTab] = useState("groups");

//   /* chats state */
//   const [allUsers, setAllUsers] = useState([]); // conversations
//   const [typingMap, setTypingMap] = useState({});
//   const [lastPreviewMap, setLastPreviewMap] = useState({});

//   /* groups state */
//   const [groups, setGroups] = useState([]);
//   const [groupsLoading, setGroupsLoading] = useState(false);

//   /* unread badges */
//   const [groupUnread, setGroupUnread] = useLocalStorage({ key: "groupUnread", defaultValue: {} });

//   /* ui state */
//   const [search, setSearch] = useState("");
//   const [chatMenuOpen, setChatMenuOpen] = useState(null);   // chatId
//   const [groupMenuOpen, setGroupMenuOpen] = useState(null); // groupId
//   const [showArchivedChats, setShowArchivedChats] = useState(true);
//   const [showArchivedGroups, setShowArchivedGroups] = useState(true);

//   const chatMenuRef = useRef(null);
//   const groupMenuRef = useRef(null);
//   const searchInputRef = useRef(null);

//   /* helpers */
//   const clearDMEverywhere = () => {
//     onSelectChat?.(null);
//     try {
//       localStorage.removeItem("activeThread");
//       localStorage.removeItem("activeChat");
//       localStorage.removeItem("activeChatId");
//       sessionStorage.removeItem("activeThread");
//       sessionStorage.removeItem("activeChat");
//       sessionStorage.removeItem("activeChatId");
//     } catch {}
//     try { window.dispatchEvent(new CustomEvent("active-thread:clear")); } catch {}
//   };

//   /* keep tab synced with URL */
//   useEffect(() => {
//     const isGroups = isGroupRoute(location.pathname);
//     setActiveTab(isGroups ? "groups" : "chats");
//     if (isGroups) clearDMEverywhere();
//   }, [location.pathname]);

//   /* sockets: request last message for a peer */
//   const requestLastForPeer = (peerId) => {
//     if (!socket || !peerId) return;
//     socket.emit("msgPage", peerId);
//   };

//   /* conversations feed */
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
//           // make sure flags exist (persisted by your backend)
//           isPinned: !!conv.isPinned,
//           isArchived: !!conv.isArchived,
//           isMuted: !!conv.isMuted,
//         };
//       });

//       setAllUsers((prev) => {
//         // preserve local flags while socket refreshes
//         const prevById = new Map(prev.map((c) => [c._id, c]));
//         const next = updated.map((c) => {
//           const local = prevById.get(c._id);
//           return local
//             ? { ...c,
//                 isMuted: local.isMuted ?? c.isMuted,
//                 isPinned: local.isPinned ?? c.isPinned,
//                 isArchived: local.isArchived ?? c.isArchived }
//             : c;
//         });
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

//     const onMessage = (payload) => {
//       try {
//         const peerId = payload?.chatWith;
//         const list = Array.isArray(payload?.original) ? payload.original : [];
//         if (!peerId || list.length === 0) return;
//         const last = list[list.length - 1] || {};
//         const preview = buildPreviewFromMsg(last, undefined, user?._id);
//         setLastPreviewMap((m) => ({ ...m, [peerId]: preview }));
//       } catch {}
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

//   /* groups load */
//   const loadGroups = async () => {
//     try {
//       setGroupsLoading(true);
//       const { data } = await http.get("/api/groups");
//       const list = data?.groups || [];
//       setGroups(
//         list.map((g) => ({
//           ...g,
//           preview: extractGroupPreviewFromList(g, user?._id),
//           isPinned: !!g.isPinned,
//           isArchived: !!g.isArchived,
//           isMuted: !!g.isMuted,
//         }))
//       );
//     } catch (err) {
//       toast.error(err?.response?.data?.message || "Failed to load groups");
//     } finally {
//       setGroupsLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (activeTab === "groups" && groups.length === 0) loadGroups();
//   }, [activeTab, groups.length]);

//   /* unread badges for groups */
//   useEffect(() => {
//     if (!socket || !user?._id) return;

//     const bump = (gid, fromId) => {
//       if (!gid) return;
//       if (fromId && String(fromId) === String(user._id)) return;
//       if (location.pathname === `/g/${gid}`) return;
//       setGroupUnread((prev) => ({ ...prev, [gid]: (prev?.[gid] || 0) + 1 }));
//     };

//     const onReceiveSingle = (m) => {
//       const gid = String(m?.groupId || m?.group || "");
//       const from = String(m?.msgByUser?._id || m?.msgByUser || m?.sender || "");
//       bump(gid, from);
//     };

//     const onReceiveBatch = (payload) => {
//       const gid = String(payload?.groupId || "");
//       const list = Array.isArray(payload?.messages) ? payload.messages : [];
//       for (const m of list) {
//         const from = String(m?.msgByUser?._id || m?.msgByUser || m?.sender || "");
//         bump(gid, from);
//       }
//     };

//     socket.on("receive-group-msg", onReceiveSingle);
//     socket.on("groupMessages", onReceiveBatch);
//     return () => {
//       socket.off("receive-group-msg", onReceiveSingle);
//       socket.off("groupMessages", onReceiveBatch);
//     };
//   }, [socket, user?._id, location.pathname, setGroupUnread]);

//   /* clear unread when the route is that group */
//   useEffect(() => {
//     const m = location.pathname.match(/^\/g\/([a-f0-9]{24})$/i);
//     if (!m) return;
//     const gid = m[1];
//     setGroupUnread((prev) => ({ ...prev, [gid]: 0 }));
//     socket?.emit("seenGroup", { groupId: gid, userId: user?._id });
//   }, [location.pathname, setGroupUnread, socket, user?._id]);

//   /* close menus on outside click */
//   useEffect(() => {
//     const onDocClick = (e) => {
//       if (chatMenuRef.current && !chatMenuRef.current.contains(e.target)) setChatMenuOpen(null);
//       if (groupMenuRef.current && !groupMenuRef.current.contains(e.target)) setGroupMenuOpen(null);
//     };
//     document.addEventListener("click", onDocClick);
//     return () => document.removeEventListener("click", onDocClick);
//   }, []);

//   const handleLogout = () => {
//     setUser(null);
//     navigate("/login");
//   };

//   /* ---------- filtering/sorting ---------- */
//   const highlightText = (text, query) => {
//     if (!query) return text;
//     const safe = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
//     const regex = new RegExp(`(${safe})`, "gi");
//     return String(text)
//       .split(regex)
//       .map((part, i) =>
//         regex.test(part) ? (
//           <span key={i} className="bg-emerald-300/30 text-emerald-200 px-0.5 rounded">
//             {part}
//           </span>
//         ) : (
//           part
//         )
//       );
//   };

//   const getLastActive = (c) => {
//     const pid = c?.userDetails?._id;
//     const p = pid ? lastPreviewMap[pid] : null;
//     const t = p?.time || c?.updatedAt || c?.createdAt || 0;
//     return new Date(t).getTime() || 0;
//   };

//   const filteredChats = useMemo(() => {
//     const q = search.trim().toLowerCase();
//     if (!q) return allUsers;
//     return allUsers.filter((c) => (c?.userDetails?.name || "").toLowerCase().includes(q));
//   }, [allUsers, search]);

//   const chatsArchived = useMemo(() => filteredChats.filter((c) => !!c?.isArchived), [filteredChats]);
//   const chatsNotArchived = useMemo(() => filteredChats.filter((c) => !c?.isArchived), [filteredChats]);
//   const chatsNotArchivedSorted = useMemo(() => {
//     const arr = [...chatsNotArchived];
//     arr.sort((a, b) => {
//       if (a?.isPinned && !b?.isPinned) return -1;
//       if (!a?.isPinned && b?.isPinned) return 1;
//       return getLastActive(b) - getLastActive(a);
//     });
//     return arr;
//   }, [chatsNotArchived, lastPreviewMap]);
//   const pinnedChats = useMemo(() => chatsNotArchivedSorted.filter((c) => c?.isPinned), [chatsNotArchivedSorted]);
//   const regularChats = useMemo(() => chatsNotArchivedSorted.filter((c) => !c?.isPinned), [chatsNotArchivedSorted]);

//   const filteredGroups = useMemo(() => {
//     const q = search.trim().toLowerCase();
//     if (!q) return groups;
//     return groups.filter((g) => (g?.name || "").toLowerCase().includes(q));
//   }, [groups, search]);

//   const groupsArchived = useMemo(() => filteredGroups.filter((g) => !!g?.isArchived), [filteredGroups]);
//   const groupsNotArchived = useMemo(() => filteredGroups.filter((g) => !g?.isArchived), [filteredGroups]);
//   const groupsLastActive = (g) =>
//     new Date(g?.preview?.time || g?.updatedAt || g?.createdAt || 0).getTime() || 0;
//   const groupsNotArchivedSorted = useMemo(() => {
//     const arr = [...groupsNotArchived];
//     arr.sort((a, b) => {
//       if (a?.isPinned && !b?.isPinned) return -1;
//       if (!a?.isPinned && b?.isPinned) return 1;
//       return groupsLastActive(b) - groupsLastActive(a);
//     });
//     return arr;
//   }, [groupsNotArchived]);
//   const pinnedGroups = useMemo(() => groupsNotArchivedSorted.filter((g) => g?.isPinned), [groupsNotArchivedSorted]);
//   const regularGroups = useMemo(() => groupsNotArchivedSorted.filter((g) => !g?.isPinned), [groupsNotArchivedSorted]);

//   /* ---------- API actions (persisted) ---------- */
//   const toggleChat = async (chatId, action, optimisticKey) => {
//     try {
//       // optimistic
//       setAllUsers((prev) =>
//         prev.map((c) =>
//           c._id === chatId ? { ...c, [optimisticKey]: !c[optimisticKey] } : c
//         )
//       );
//       await axios.put(`${CHAT_API_BASE}/${chatId}/${action}`);
//       toast.success(`${action[0].toUpperCase()}${action.slice(1)}d`);
//     } catch (e) {
//       // rollback if request failed
//       setAllUsers((prev) =>
//         prev.map((c) =>
//           c._id === chatId ? { ...c, [optimisticKey]: !c[optimisticKey] } : c
//         )
//       );
//       toast.error(e?.response?.data?.message || `Failed to ${action}`);
//     }
//   };
//   const deleteChat = async (chatId) => {
//     try {
//       await axios.delete(`${CHAT_API_BASE}/${chatId}/delete`);
//       setAllUsers((prev) => prev.filter((c) => c._id !== chatId));
//       toast.success("Chat deleted");
//     } catch (e) {
//       toast.error(e?.response?.data?.message || "Delete failed");
//     }
//   };

//   const toggleGroup = async (groupId, action, optimisticKey) => {
//     try {
//       setGroups((prev) =>
//         prev.map((g) => (g._id === groupId ? { ...g, [optimisticKey]: !g[optimisticKey] } : g))
//       );
//       await http.put(`/api/groups/${groupId}/${action}`);
//       toast.success(`${action[0].toUpperCase()}${action.slice(1)}d`);
//     } catch (e) {
//       setGroups((prev) =>
//         prev.map((g) => (g._id === groupId ? { ...g, [optimisticKey]: !g[optimisticKey] } : g))
//       );
//       toast.error(e?.response?.data?.message || `Failed to ${action}`);
//     }
//   };

//   /* ---------- Rows ---------- */
//   const ChatRow = ({ conv }) => {
//     const pid = conv?.userDetails?._id;
//     const last = pid ? lastPreviewMap[pid] : null;
//     const isTypingActive = typingMap[pid] && Date.now() - typingMap[pid] < 3500;

//     const Prefix = last?.prefix ? <span className="text-zinc-400">{last.prefix}:&nbsp;</span> : null;

//     const body = isTypingActive ? (
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
//         className="relative flex items-center gap-3 px-4 py-3 border-b border-zinc-900/60 hover:bg-zinc-900/50 cursor-pointer"
//         onClick={() => { navigate(`/${pid}`); onSelectChat?.(conv.userDetails); }}
//         onContextMenu={(e) => { e.preventDefault(); setChatMenuOpen(chatMenuOpen === conv._id ? null : conv._id); }}
//       >
//         <Avatar imageUrl={conv?.userDetails?.profilePic} name={conv?.userDetails?.name} />
//         <div className="flex-1 min-w-0">
//           <div className="flex items-center gap-2 min-w-0">
//             <h3 className="text-zinc-200 font-medium truncate">{highlightText(conv?.userDetails?.name, search)}</h3>
//             {conv?.isPinned && <Pin size={14} className="text-emerald-400/70 shrink-0" />}
//             {conv?.isMuted && <BellOff size={14} className="text-zinc-500 shrink-0" />}
//             {conv?.isArchived && <Archive size={14} className="text-zinc-500 shrink-0" />}
//           </div>
//           <div className="text-xs text-zinc-500 flex items-center gap-2 min-w-0">
//             <div className="flex items-center gap-1 min-w-0 truncate">{Prefix}{body}</div>
//           </div>
//         </div>
//         <div className="text-right pl-2">
//           <div className="text-[10px] text-zinc-500">{last?.time ? fmtTime(last.time) : ""}</div>
//           {!!conv?.unseenMsg && (
//             <div className="mt-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-emerald-600 text-[10px] text-white">
//               {conv?.unseenMsg}
//             </div>
//           )}
//         </div>

//         {/* 3-dot menu */}
//         <div className="ml-2 relative z-50" ref={chatMenuRef} onClick={(e) => e.stopPropagation()}>
//           <button
//             className="p-1 rounded hover:bg-zinc-800/70"
//             onClick={() => setChatMenuOpen(chatMenuOpen === conv._id ? null : conv._id)}
//           >
//             <EllipsisVertical className="text-zinc-400 hover:text-zinc-200" />
//           </button>
//           {chatMenuOpen === conv._id && (
//             <div className="absolute right-0 mt-2 w-44 rounded-lg border border-zinc-700 bg-[#0f1318] shadow-xl overflow-hidden">
//               <button className="w-full px-3 py-2 text-left text-sm hover:bg-zinc-800/60" onClick={() => navigate(`/${pid}`)}>
//                 View chat
//               </button>
//               <button
//                 className="w-full px-3 py-2 text-left text-sm hover:bg-zinc-800/60"
//                 onClick={() => toggleChat(conv._id, "pin", "isPinned")}
//               >
//                 {conv.isPinned ? "Unpin" : "Pin"}
//               </button>
//               <button
//                 className="w-full px-3 py-2 text-left text-sm hover:bg-zinc-800/60"
//                 onClick={() => toggleChat(conv._id, "mute", "isMuted")}
//               >
//                 {conv.isMuted ? "Unmute" : "Mute"}
//               </button>
//               <button
//                 className="w-full px-3 py-2 text-left text-sm hover:bg-zinc-800/60"
//                 onClick={() => toggleChat(conv._id, "archive", "isArchived")}
//               >
//                 {conv.isArchived ? "Unarchive" : "Archive"}
//               </button>
//               <button
//                 className="w-full px-3 py-2 text-left text-sm text-rose-400 hover:bg-rose-900/20"
//                 onClick={() => deleteChat(conv._id)}
//               >
//                 <Trash2 size={14} className="inline mr-2" /> Delete chat
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//     );
//   };

//   const GroupRow = ({ g }) => {
//     const count = groupUnread[g._id] || 0;

//     const lastKind = g.lastMessageType || g.preview?.kind || "none";
//     const lastText = g.lastMessageText || g.preview?.text || "";
//     const lastTime = g.lastMessageAt || g.preview?.time || g.updatedAt || g.createdAt;

//     const senderId = g.lastMessageSenderId || g.preview?.senderId || null;
//     const senderName = g.lastMessageSenderName || g.preview?.senderName || g.preview?.prefix || "";
//     const isYou = senderId && user?._id && String(senderId) === String(user._id);
//     const prefix = isYou ? "You" : senderName;

//     const body =
//       lastKind === "image" ? (<><ImageIcon size={14} /> <span>Image</span></>) :
//       lastKind === "video" ? (<><Video size={14} /> <span>Video</span></>) :
//       lastKind === "audio" ? (<><Play size={14} /> <span>Audio</span></>) :
//       lastKind === "file"  ? (<><FileText size={14} /> <span>File</span></>) :
//       lastText ? (<span className="truncate">{lastText}</span>) :
//       (<span className="opacity-60">No messages yet</span>);

//     return (
//       <div
//         className="relative w-full text-left px-4 py-3 border-b border-zinc-900/60 hover:bg-zinc-900/50 transition flex items-center gap-3 cursor-pointer"
//         onClick={() => {
//           navigate(`/g/${g._id}`);
//           setGroupUnread((prev) => ({ ...prev, [g._id]: 0 }));
//           socket?.emit("seenGroup", { groupId: g._id, userId: user?._id });
//           clearDMEverywhere();
//         }}
//       >
//         <img src={g.profilePic || "/group-placeholder.png"} alt="" className="w-10 h-10 rounded-full object-cover ring-1 ring-emerald-500/20" />
//         <div className="flex-1 min-w-0">
//           <div className="flex items-center gap-2">
//             <div className="font-medium truncate text-zinc-200">{g.name}</div>
//             {g?.isPinned && <Pin size={14} className="text-emerald-400/70 shrink-0" />}
//             {g?.isMuted && <BellOff size={14} className="text-zinc-500 shrink-0" />}
//             {g?.isArchived && <Archive size={14} className="text-zinc-500 shrink-0" />}
//           </div>
//           <div className="text-xs text-zinc-500 flex items-center gap-2 min-w-0">
//             <div className="flex items-center gap-1 min-w-0 truncate">
//               {prefix ? <span className="text-zinc-400">{prefix}:</span> : null} {body}
//             </div>
//           </div>
//         </div>
//         <div className="text-right">
//           <div className="text-[10px] text-zinc-500">{lastTime ? fmtTime(lastTime) : ""}</div>
//           {count > 0 && (
//             <div className="mt-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-emerald-600 text-[10px] text-white">
//               {count}
//             </div>
//           )}
//         </div>

//         {/* 3-dot menu */}
//         <div className="ml-2 relative z-50" ref={groupMenuRef} onClick={(e) => e.stopPropagation()}>
//           <button
//             className="p-1 rounded hover:bg-zinc-800/70"
//             onClick={() => setGroupMenuOpen(groupMenuOpen === g._id ? null : g._id)}
//           >
//             <EllipsisVertical className="text-zinc-400 hover:text-zinc-200" />
//           </button>
//           {groupMenuOpen === g._id && (
//             <div className="absolute right-0 mt-2 w-44 rounded-lg border border-zinc-700 bg-[#0f1318] shadow-xl overflow-hidden">
//               <button className="w-full px-3 py-2 text-left text-sm hover:bg-zinc-800/60" onClick={() => navigate(`/g/${g._id}`)}>
//                 Open group
//               </button>
//               <button
//                 className="w-full px-3 py-2 text-left text-sm hover:bg-zinc-800/60"
//                 onClick={() => toggleGroup(g._id, "pin", "isPinned")}
//               >
//                 {g.isPinned ? "Unpin" : "Pin"}
//               </button>
//               <button
//                 className="w-full px-3 py-2 text-left text-sm hover:bg-zinc-800/60"
//                 onClick={() => toggleGroup(g._id, "mute", "isMuted")}
//               >
//                 {g.isMuted ? "Unmute" : "Mute"}
//               </button>
//               <button
//                 className="w-full px-3 py-2 text-left text-sm hover:bg-zinc-800/60"
//                 onClick={() => toggleGroup(g._id, "archive", "isArchived")}
//               >
//                 {g.isArchived ? "Unarchive" : "Archive"}
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//     );
//   };

//   /* ---------- render ---------- */
//   return (
//     <div className="w-full h-full grid grid-cols-[64px,1fr] bg-[#0a0f14] text-zinc-100">
//       <Toaster
//         position="top-center"
//         toastOptions={{
//           duration: 2000,
//           style: {
//             background: "#12161b",
//             color: "#e9edef",
//             borderRadius: "10px",
//             border: "1px solid rgba(16,185,129,.25)",
//             boxShadow: "0 8px 30px rgba(0,0,0,.35)",
//             fontSize: "14px",
//           },
//         }}
//       />

//       {/* Icon rail */}
//       <div className="bg-[#0b1016] border-r border-zinc-800/70 h-full py-5 flex flex-col items-center justify-between">
//         <div className="space-y-2">
//           <div
//             title="Chats"
//             className="w-12 h-12 grid place-items-center cursor-pointer text-zinc-300 hover:text-emerald-400 rounded-lg hover:bg-emerald-500/10 transition"
//             onClick={() => { setActiveTab("chats"); navigate("/"); }}
//           >
//             <MessageCircle size={20} />
//           </div>

//           <div
//             title="Add friend"
//             onClick={() => setOpenSearchUser(true)}
//             className="w-12 h-12 grid place-items-center cursor-pointer text-zinc-300 hover:text-emerald-400 rounded-lg hover:bg-emerald-500/10 transition"
//           >
//             <UserPlus size={20} />
//           </div>

//           <div
//             title="Groups"
//             onClick={() => { setActiveTab("groups"); onSelectChat?.(null); navigate("/g"); }}
//             className="w-12 h-12 grid place-items-center cursor-pointer text-zinc-300 hover:text-emerald-400 rounded-lg hover:bg-emerald-500/10 transition"
//           >
//             <Users size={20} />
//           </div>
//         </div>

//         <div className="flex flex-col items-center gap-2">
//           <button onClick={() => setEditProfile(true)}>
//             <Avatar imageUrl={user?.profilePic} name={user?.name} userId={user?._id} />
//           </button>
//           <button
//             title="Logout"
//             onClick={handleLogout}
//             className="text-zinc-300 hover:text-rose-400 hover:bg-rose-500/10 p-2 rounded-lg transition"
//           >
//             <LogOut size={20} />
//           </button>
//         </div>
//       </div>

//       {/* Main list */}
//       <div className="w-full bg-[#090d12]">
//         {/* Header */}
//         <div className="h-14 px-4 border-b border-zinc-800/70 flex items-center justify-between">
//           <h2 className="font-semibold tracking-wide text-zinc-200">
//             {activeTab === "groups" ? "Groups" : "Chats"}
//           </h2>

//           {activeTab === "groups" ? (
//             <button
//               onClick={() => {
//                 navigate("/g?new=1");
//                 try { window.dispatchEvent(new CustomEvent("group:new")); } catch {}
//               }}
//               className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm ring-1 ring-emerald-400/30 shadow-sm"
//             >
//               <Plus size={16} />
//               <span className="font-medium">New Group</span>
//             </button>
//           ) : (
//             <div className="opacity-0 select-none"><EllipsisVertical size={18} /></div>
//           )}
//         </div>

//         {/* Search + Tabs */}
//         <div className="px-4 py-3 border-b border-zinc-800/70">
//           <div className="flex items-center gap-2 rounded-xl px-3 py-2 border border-zinc-700/60 bg-[#0f1419]">
//             <Search size={16} className="text-zinc-500" />
//             <input
//               ref={searchInputRef}
//               type="text"
//               placeholder={activeTab === "groups" ? "Search groups..." : "Search chats..."}
//               value={search}
//               onChange={(e) => setSearch(e.target.value)}
//               className="bg-transparent outline-none w-full text-sm text-zinc-300 placeholder-zinc-500"
//             />
//           </div>

//           <div className="mt-3 grid grid-cols-2 gap-2">
//             <button
//               className={`py-2 text-sm font-medium rounded-lg border ${
//                 activeTab === "chats"
//                   ? "text-emerald-400 border-emerald-500/40 bg-emerald-500/10"
//                   : "text-zinc-400 border-zinc-700/60 hover:bg-zinc-800/50"
//               }`}
//               onClick={() => { setActiveTab("chats"); navigate("/"); }}
//             >
//               Chats
//             </button>
//             <button
//               className={`py-2 text-sm font-medium rounded-lg border ${
//                 activeTab === "groups"
//                   ? "text-emerald-400 border-emerald-500/40 bg-emerald-500/10"
//                   : "text-zinc-400 border-zinc-700/60 hover:bg-zinc-800/50"
//               }`}
//               onClick={() => { setActiveTab("groups"); onSelectChat?.(null); navigate("/g"); }}
//             >
//               Groups
//             </button>
//           </div>
//         </div>

//         {/* Lists */}
//         <div className="h-[calc(100vh-230px)] overflow-x-hidden overflow-y-auto pb-6">
//           {activeTab === "chats" ? (
//             <>
//               {/* Pinned */}
//               {pinnedChats.length > 0 && (
//                 <div className="px-4 pt-4 pb-2 text-xs uppercase tracking-wider text-zinc-500">Pinned</div>
//               )}
//               <div className="divide-y divide-zinc-900/60">
//                 {pinnedChats.map((c) => <ChatRow key={c?._id} conv={c} />)}
//               </div>

//               {/* Regular */}
//               {pinnedChats.length > 0 && regularChats.length > 0 && (
//                 <div className="px-4 pt-4 pb-2 text-xs uppercase tracking-wider text-zinc-500">Chats</div>
//               )}
//               {regularChats.length > 0 ? (
//                 <div className="divide-y divide-zinc-900/60">
//                   {regularChats.map((c) => <ChatRow key={c?._id} conv={c} />)}
//                 </div>
//               ) : pinnedChats.length === 0 ? (
//                 <div className="px-4 pt-4 text-zinc-500">No chats yet</div>
//               ) : null}

//               {/* Archived (collapsible) */}
//               {chatsArchived.length > 0 && (
//                 <>
//                   <button
//                     className="w-full text-left px-4 pt-4 pb-2 text-xs uppercase tracking-wider text-zinc-500 flex items-center gap-1"
//                     onClick={() => setShowArchivedChats((s) => !s)}
//                   >
//                     {showArchivedChats ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
//                     Archived Chats ({chatsArchived.length})
//                   </button>
//                   {showArchivedChats && (
//                     <div className="divide-y divide-zinc-900/60">
//                       {chatsArchived.map((c) => <ChatRow key={c?._id} conv={c} />)}
//                     </div>
//                   )}
//                 </>
//               )}
//             </>
//           ) : (
//             <>
//               {/* Groups list */}
//               {groupsLoading && <p className="p-4 text-zinc-400">Loading…</p>}
//               {!groupsLoading && pinnedGroups.length > 0 && (
//                 <div className="px-4 pt-4 pb-2 text-xs uppercase tracking-wider text-zinc-500">Pinned</div>
//               )}
//               <div className="divide-y divide-zinc-900/60">
//                 {pinnedGroups.map((g) => <GroupRow key={g._id} g={g} />)}
//               </div>

//               {pinnedGroups.length > 0 && regularGroups.length > 0 && (
//                 <div className="px-4 pt-4 pb-2 text-xs uppercase tracking-wider text-zinc-500">Groups</div>
//               )}
//               <div className="divide-y divide-zinc-900/60">
//                 {regularGroups.map((g) => <GroupRow key={g._id} g={g} />)}
//               </div>

//               {/* Archived (collapsible) */}
//               {groupsArchived.length > 0 && (
//                 <>
//                   <button
//                     className="w-full text-left px-4 pt-4 pb-2 text-xs uppercase tracking-wider text-zinc-500 flex items-center gap-1"
//                     onClick={() => setShowArchivedGroups((s) => !s)}
//                   >
//                     {showArchivedGroups ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
//                     Archived Groups ({groupsArchived.length})
//                   </button>
//                   {showArchivedGroups && (
//                     <div className="divide-y divide-zinc-900/60">
//                       {groupsArchived.map((g) => <GroupRow key={g._id} g={g} />)}
//                     </div>
//                   )}
//                 </>
//               )}
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
// src/components/Side.jsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { GetSocket } from "../utils/Sockets";
import {
  EllipsisVertical,
  Image as ImageIcon,
  LogOut,
  MessageCircle,
  UserPlus,
  Video,
  Search,
  Pin,
  BellOff,
  Archive,
  FileText,
  Play,
  Users,
  Plus,
  Trash2,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import Avatar from "./Avatar";
import { useLocalStorage } from "@mantine/hooks";
import { useNavigate, useLocation } from "react-router-dom";
import AddUser from "./AddUser";
import EditProfile from "./EditProfile";
import http from "../utils/http";
import toast, { Toaster } from "react-hot-toast";

/* ---------- constants & helpers ---------- */
const CHAT_API_BASE = "/api/chat"; // goes through http (with auth)

const fmtTime = (d) => {
  try {
    const date = new Date(d);
    return isNaN(date) ? "" : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
};
const isOfficeOrPdf = (name = "") => /\.(pdf|docx?|pptx?|xlsx|csv|txt)(\?|$)/i.test(name);
const pickUrl = (m = {}) =>
  m.url ||
  m.imageUrl ||
  m.audioUrl ||
  m.videoUrl ||
  m.fileUrl ||
  m.documentUrl ||
  m.attachmentUrl ||
  m.mediaUrl ||
  m.path ||
  null;

const resolveType = (m = {}) => {
  if (m.messageType) return m.messageType;
  if (m.imageUrl) return "image";
  if (m.audioUrl) return "audio";
  if (m.videoUrl) return "video";
  if (m.fileUrl || isOfficeOrPdf(m.fileName)) return "file";
  const u = pickUrl(m);
  if (!u) return "text";
  if (/\/video\/upload\//.test(u)) return "video";
  if (/\/raw\/upload\//.test(u) || isOfficeOrPdf(u)) return "file";
  return "image";
};

const getSenderInfo = (m = {}) => {
  const id =
    m?.sender?._id ??
    m?.senderId ??
    (typeof m?.msgByUser === "object" ? m?.msgByUser?._id : m?.msgByUser) ??
    m?.user?._id ??
    m?.userId ??
    m?.from ??
    null;

  const name =
    m?.sender?.name ??
    m?.user?.name ??
    m?.fromName ??
    m?.senderName ??
    m?.authorName ??
    "";

  return { id, name };
};

const normalizeMessage = (raw) => {
  if (!raw) return null;
  const m = raw.message || raw;
  const createdAt = m.createdAt || m.timestamp || new Date().toISOString();
  const type = resolveType(m);
  const url = pickUrl(m);
  const { id: senderId, name: senderName } = getSenderInfo(m);
  return {
    ...m,
    _id: m._id || raw._id,
    createdAt,
    messageType: type,
    url,
    _senderId: senderId || null,
    _senderName: senderName || "",
  };
};

const buildPreviewFromMsg = (m, fallbackTime, currentUserId) => {
  if (!m)
    return { text: "", kind: "none", time: fallbackTime || "", senderId: null, senderName: "", prefix: "" };
  const n = normalizeMessage(m);
  const text = n?.message || n?.text || n?.content || n?.caption || "";
  const kind = n?.messageType || "text";
  const time = n?.createdAt || fallbackTime || "";
  const senderId = n?._senderId || null;
  const senderName = n?._senderName || "";
  const prefix =
    senderId && currentUserId && String(senderId) === String(currentUserId) ? "You" : senderName || "";
  return { text, kind, time, senderId, senderName, prefix };
};

const extractGroupPreviewFromList = (g, currentUserId) => {
  const lm = typeof g?.lastMessage === "object" ? g.lastMessage : null;
  if (lm) return buildPreviewFromMsg(lm, g?.updatedAt || g?.createdAt, currentUserId);

  if (
    g?.lastMessageText ||
    g?.lastMessageType ||
    g?.lastMessageAt ||
    g?.lastMessageSenderId ||
    g?.lastMessageSenderName
  ) {
    const time = g?.lastMessageAt || g?.updatedAt || g?.createdAt || "";
    const kind = g?.lastMessageType || (g?.lastMessageText ? "text" : "none");
    const senderId = g?.lastMessageSenderId || null;
    const senderName = g?.lastMessageSenderName || "";
    const prefix =
      senderId && currentUserId && String(senderId) === String(currentUserId) ? "You" : senderName || "";
    return { text: g?.lastMessageText || "", kind, time, senderId, senderName, prefix };
  }
  return {
    text: "",
    kind: "none",
    time: g?.updatedAt || g?.createdAt || "",
    senderId: null,
    senderName: "",
    prefix: "",
  };
};

const isGroupRoute = (p) => /^\/g(?:\/|$)/i.test(p);

/* =============================== Component =============================== */
const Side = ({ onSelectChat }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useLocalStorage({ key: "userData", defaultValue: {} });

  const socket =
    (typeof GetSocket === "function"
      ? GetSocket()
      : GetSocket?.socket || GetSocket?.current || GetSocket) || null;

  /* modals */
  const [openSearchUser, setOpenSearchUser] = useState(false);
  const [editProfile, setEditProfile] = useState(false);

  /* tab */
  const [activeTab, setActiveTab] = useState("groups");

  /* chats state */
  const [allUsers, setAllUsers] = useState([]); // conversations list
  const [typingMap, setTypingMap] = useState({});
  const [lastPreviewMap, setLastPreviewMap] = useState({});

  /* groups state */
  const [groups, setGroups] = useState([]);
  const [groupsLoading, setGroupsLoading] = useState(false);

  /* unread (groups) */
  const [groupUnread, setGroupUnread] = useLocalStorage({ key: "groupUnread", defaultValue: {} });

  /* ui */
  const [search, setSearch] = useState("");
  const [chatMenuOpen, setChatMenuOpen] = useState(null); // chatId
  const [groupMenuOpen, setGroupMenuOpen] = useState(null); // groupId
  const [showArchivedChats, setShowArchivedChats] = useState(true);
  const [showArchivedGroups, setShowArchivedGroups] = useState(true);

  const chatMenuRef = useRef(null);
  const groupMenuRef = useRef(null);
  const searchInputRef = useRef(null);

  const clearDMEverywhere = () => {
    onSelectChat?.(null);
    try {
      localStorage.removeItem("activeThread");
      localStorage.removeItem("activeChat");
      localStorage.removeItem("activeChatId");
      sessionStorage.removeItem("activeThread");
      sessionStorage.removeItem("activeChat");
      sessionStorage.removeItem("activeChatId");
    } catch {}
    try {
      window.dispatchEvent(new CustomEvent("active-thread:clear"));
    } catch {}
  };

  /* sync tab with URL */
  useEffect(() => {
    const isGroups = isGroupRoute(location.pathname);
    setActiveTab(isGroups ? "groups" : "chats");
    if (isGroups) clearDMEverywhere();
  }, [location.pathname]);

  /* sockets: ask for last message for a peer */
  const requestLastForPeer = (peerId) => {
    if (!socket || !peerId) return;
    socket.emit("msgPage", peerId);
  };

  /* conversations feed via socket */
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
          // ensure flags exist (persisted backend)
          isPinned: !!conv.isPinned,
          isArchived: !!conv.isArchived,
          isMuted: !!conv.isMuted,
        };
      });

      setAllUsers((prev) => {
        const prevById = new Map(prev.map((c) => [c._id, c]));
        const next = updated.map((c) => {
          const local = prevById.get(c._id);
          // keep the server as source of truth; only fall back to local if undefined
          return local
            ? {
                ...c,
                isMuted: c.isMuted ?? local.isMuted,
                isPinned: c.isPinned ?? local.isPinned,
                isArchived: c.isArchived ?? local.isArchived,
              }
            : c;
        });
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
        const preview = buildPreviewFromMsg(last, undefined, user?._id);
        setLastPreviewMap((m) => ({ ...m, [peerId]: preview }));
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
const loadGroups = async () => {
  try {
    setGroupsLoading(true);
    const { data } = await http.get("/api/groups");
    const list = data?.groups || [];
    setGroups(
      list.map((g) => {
        // server returns pinned/muted/archived; normalize to isPinned/isMuted/isArchived
        const isPinned    = g.isPinned    ?? g.pinned    ?? false;
        const isMuted     = g.isMuted     ?? g.muted     ?? false;
        const isArchived  = g.isArchived  ?? g.archived  ?? false;

        return {
          ...g,
          preview: extractGroupPreviewFromList(g, user?._id),
          isPinned: !!isPinned,
          isMuted: !!isMuted,
          isArchived: !!isArchived,
        };
      })
    );
  } catch (err) {
    toast.error(err?.response?.data?.message || "Failed to load groups");
  } finally {
    setGroupsLoading(false);
  }
};

  /* groups load (REST) */
  // const loadGroups = async () => {
  //   try {
  //     setGroupsLoading(true);
  //     const { data } = await http.get("/api/groups");
  //     const list = data?.groups || [];
  //     setGroups(
  //       list.map((g) => ({
  //         ...g,
  //         preview: extractGroupPreviewFromList(g, user?._id),
  //         isPinned: !!g.isPinned,
  //         isArchived: !!g.isArchived,
  //         isMuted: !!g.isMuted,
  //       }))
  //     );
  //   } catch (err) {
  //     toast.error(err?.response?.data?.message || "Failed to load groups");
  //   } finally {
  //     setGroupsLoading(false);
  //   }
  // };

  useEffect(() => {
    if (activeTab === "groups") loadGroups();
  }, [activeTab, location.pathname, location.search]);

  /* unread bumps for groups via socket */
  useEffect(() => {
    if (!socket || !user?._id) return;

    const bump = (gid, fromId) => {
      if (!gid) return;
      if (fromId && String(fromId) === String(user._id)) return;
      if (location.pathname === `/g/${gid}`) return;
      setGroupUnread((prev) => ({ ...prev, [gid]: (prev?.[gid] || 0) + 1 }));
    };

    const onReceiveSingle = (m) => {
      const gid = String(m?.groupId || m?.group || "");
      const from = String(m?.msgByUser?._id || m?.msgByUser || m?.sender || "");
      bump(gid, from);
    };

    const onReceiveBatch = (payload) => {
      const gid = String(payload?.groupId || "");
      const list = Array.isArray(payload?.messages) ? payload.messages : [];
      for (const m of list) {
        const from = String(m?.msgByUser?._id || m?.msgByUser || m?.sender || "");
        bump(gid, from);
      }
    };

    socket.on("receive-group-msg", onReceiveSingle);
    socket.on("groupMessages", onReceiveBatch);
    return () => {
      socket.off("receive-group-msg", onReceiveSingle);
      socket.off("groupMessages", onReceiveBatch);
    };
  }, [socket, user?._id, location.pathname, setGroupUnread]);

  /* clear unread when viewing a group route */
  useEffect(() => {
    const m = location.pathname.match(/^\/g\/([a-f0-9]{24})$/i);
    if (!m) return;
    const gid = m[1];
    setGroupUnread((prev) => ({ ...prev, [gid]: 0 }));
    socket?.emit("seenGroup", { groupId: gid, userId: user?._id });
  }, [location.pathname, setGroupUnread, socket, user?._id]);

  /* close menus on outside click & Escape */
  useEffect(() => {
    const onDocClick = (e) => {
      if (chatMenuRef.current && !chatMenuRef.current.contains(e.target)) setChatMenuOpen(null);
      if (groupMenuRef.current && !groupMenuRef.current.contains(e.target)) setGroupMenuOpen(null);
    };
    const onEsc = (e) => {
      if (e.key === "Escape") {
        setChatMenuOpen(null);
        setGroupMenuOpen(null);
      }
    };
    document.addEventListener("click", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("click", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, []);

  const handleLogout = () => {
    setUser(null);
    navigate("/login");
  };

  /* ---------- filtering & sorting ---------- */
  const highlightText = (text, query) => {
    if (!query) return text;
    const safe = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${safe})`, "gi");
    return String(text)
      .split(regex)
      .map((part, i) =>
        regex.test(part) ? (
          <span key={i} className="bg-emerald-300/30 text-emerald-200 px-0.5 rounded">
            {part}
          </span>
        ) : (
          part
        )
      );
  };

  const getLastActive = (c) => {
    const pid = c?.userDetails?._id;
    const p = pid ? lastPreviewMap[pid] : null;
    const t = p?.time || c?.updatedAt || c?.createdAt || 0;
    return new Date(t).getTime() || 0;
  };

  const filteredChats = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allUsers;
    return allUsers.filter((c) => (c?.userDetails?.name || "").toLowerCase().includes(q));
  }, [allUsers, search]);

  const chatsArchived = useMemo(() => filteredChats.filter((c) => !!c?.isArchived), [filteredChats]);

  const chatsNotArchived = useMemo(
    () => filteredChats.filter((c) => !c?.isArchived),
    [filteredChats]
  );

  const chatsNotArchivedSorted = useMemo(() => {
    const arr = [...chatsNotArchived];
    arr.sort((a, b) => {
      if (a?.isPinned && !b?.isPinned) return -1;
      if (!a?.isPinned && b?.isPinned) return 1;
      return getLastActive(b) - getLastActive(a);
    });
    return arr;
  }, [chatsNotArchived, lastPreviewMap]);

  const pinnedChats = useMemo(
    () => chatsNotArchivedSorted.filter((c) => c?.isPinned),
    [chatsNotArchivedSorted]
  );
  const regularChats = useMemo(
    () => chatsNotArchivedSorted.filter((c) => !c?.isPinned),
    [chatsNotArchivedSorted]
  );

  const filteredGroups = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return groups;
    return groups.filter((g) => (g?.name || "").toLowerCase().includes(q));
  }, [groups, search]);

  const groupsArchived = useMemo(() => filteredGroups.filter((g) => !!g?.isArchived), [filteredGroups]);
  const groupsNotArchived = useMemo(() => filteredGroups.filter((g) => !g?.isArchived), [filteredGroups]);

  const groupsLastActive = (g) =>
    new Date(g?.preview?.time || g?.updatedAt || g?.createdAt || 0).getTime() || 0;

  const groupsNotArchivedSorted = useMemo(() => {
    const arr = [...groupsNotArchived];
    arr.sort((a, b) => {
      if (a?.isPinned && !b?.isPinned) return -1;
      if (!a?.isPinned && b?.isPinned) return 1;
      return groupsLastActive(b) - groupsLastActive(a);
    });
    return arr;
  }, [groupsNotArchived]);

  const pinnedGroups = useMemo(
    () => groupsNotArchivedSorted.filter((g) => g?.isPinned),
    [groupsNotArchivedSorted]
  );
  const regularGroups = useMemo(
    () => groupsNotArchivedSorted.filter((g) => !g?.isPinned),
    [groupsNotArchivedSorted]
  );

  /* ---------- API actions (persisted) ---------- */
  const refreshSidebar = () => {
    try {
      if (socket && user?._id) socket.emit("side", user._id);
    } catch {}
  };

  const toggleChat = async (chatId, action, optimisticKey) => {
    try {
      const current = allUsers.find((c) => c._id === chatId);
      const newVal = !current?.[optimisticKey];

      // optimistic (respect server rules: pin unarchives; archive unpins)
      setAllUsers((prev) =>
        prev.map((c) => {
          if (c._id !== chatId) return c;
          const base = { ...c, [optimisticKey]: newVal };
          if (action === "pin" && newVal) base.isArchived = false;
          if (action === "archive" && newVal) base.isPinned = false;
          return base;
        })
      );
      setChatMenuOpen(null);

      await http.put(`${CHAT_API_BASE}/${chatId}/${action}`); // body not required by backend
      toast.success(
        `${newVal ? "" : "Un"}${action[0].toUpperCase()}${action.slice(1)}${
          action === "mute" ? "d" : ""
        }`
      );

      refreshSidebar();
    } catch (e) {
      // rollback by refreshing from server
      refreshSidebar();
      toast.error(e?.response?.data?.message || `Failed to ${action}`);
    }
  };

  const deleteChat = async (chatId) => {
    try {
      setChatMenuOpen(null);
      await http.delete(`${CHAT_API_BASE}/${chatId}/delete`);
      setAllUsers((prev) => prev.filter((c) => c._id !== chatId));
      // if the deleted chat is open, clear it
      try {
        window.dispatchEvent(new CustomEvent("active-thread:clear"));
      } catch {}
      toast.success("Chat deleted");
      refreshSidebar();
    } catch (e) {
      toast.error(e?.response?.data?.message || "Delete failed");
    }
  };

  const toggleGroup = async (groupId, action, optimisticKey) => {
    try {
      const current = groups.find((g) => g._id === groupId);
      const newVal = !current?.[optimisticKey];

      // optimistic (pin unarchives; archive unpins)
      setGroups((prev) =>
        prev.map((g) => {
          if (g._id !== groupId) return g;
          const base = { ...g, [optimisticKey]: newVal };
          if (action === "pin" && newVal) base.isArchived = false;
          if (action === "archive" && newVal) base.isPinned = false;
          return base;
        })
      );
      setGroupMenuOpen(null);

      // backend expects (optional) body fields { pinned } / { archived } / { muted }
      const bodyKey =
        action === "pin" ? "pinned" : action === "archive" ? "archived" : "muted";
      await http.put(`/api/groups/${groupId}/${action}`, { [bodyKey]: newVal });

      toast.success(
        `${newVal ? "" : "Un"}${action[0].toUpperCase()}${action.slice(1)}${
          action === "mute" ? "d" : ""
        }`
      );

      // pull latest (esp. lastMessage and flags)
      loadGroups();
    } catch (e) {
      // rollback by reloading
      loadGroups();
      toast.error(e?.response?.data?.message || `Failed to ${action}`);
    }
  };

  /* ---------- Rows ---------- */
  const ChatRow = ({ conv }) => {
    const pid = conv?.userDetails?._id;
    const last = pid ? lastPreviewMap[pid] : null;
    const isTypingActive = typingMap[pid] && Date.now() - typingMap[pid] < 3500;

    const Prefix = last?.prefix ? <span className="text-zinc-400">{last.prefix}:&nbsp;</span> : null;

    const body = isTypingActive ? (
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

    return (
      <div
        className="relative flex items-center gap-3 px-4 py-3 border-b border-zinc-900/60 hover:bg-zinc-900/50 cursor-pointer"
        onClick={() => {
          navigate(`/${pid}`);
          onSelectChat?.(conv.userDetails);
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          setChatMenuOpen(chatMenuOpen === conv._id ? null : conv._id);
        }}
      >
        <Avatar imageUrl={conv?.userDetails?.profilePic} name={conv?.userDetails?.name} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <h3 className="text-zinc-200 font-medium truncate">
              {highlightText(conv?.userDetails?.name, search)}
            </h3>
            {conv?.isPinned && <Pin size={14} className="text-emerald-400/70 shrink-0" title="Pinned" />}
            {conv?.isMuted && <BellOff size={14} className="text-zinc-500 shrink-0" title="Muted" />}
            {conv?.isArchived && <Archive size={14} className="text-zinc-500 shrink-0" title="Archived" />}
          </div>
          <div className="text-xs text-zinc-500 flex items-center gap-2 min-w-0">
            <div className="flex items-center gap-1 min-w-0 truncate">
              {Prefix}
              {body}
            </div>
          </div>
        </div>
        <div className="text-right pl-2">
          <div className="text-[10px] text-zinc-500">{last?.time ? fmtTime(last.time) : ""}</div>
          {!!conv?.unseenMsg && (
            <div className="mt-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-emerald-600 text-[10px] text-white">
              {conv?.unseenMsg}
            </div>
          )}
        </div>

        {/* 3-dot menu */}
        <div className="ml-2 relative z-50" ref={chatMenuRef} onClick={(e) => e.stopPropagation()}>
          <button
            className="p-1 rounded hover:bg-zinc-800/70"
            onClick={() => setChatMenuOpen(chatMenuOpen === conv._id ? null : conv._id)}
            aria-label="Chat menu"
          >
            <EllipsisVertical className="text-zinc-400 hover:text-zinc-200" />
          </button>
          {chatMenuOpen === conv._id && (
            <div className="absolute right-0 mt-2 w-44 rounded-lg border border-zinc-700 bg-[#0f1318] shadow-xl overflow-hidden">
              <button className="w-full px-3 py-2 text-left text-sm hover:bg-zinc-800/60" onClick={() => navigate(`/${pid}`)}>
                View chat
              </button>
              <button
                className="w-full px-3 py-2 text-left text-sm hover:bg-zinc-800/60"
                onClick={() => toggleChat(conv._id, "pin", "isPinned")}
              >
                {conv.isPinned ? "Unpin" : "Pin"}
              </button>
              <button
                className="w-full px-3 py-2 text-left text-sm hover:bg-zinc-800/60"
                onClick={() => toggleChat(conv._id, "mute", "isMuted")}
              >
                {conv.isMuted ? "Unmute" : "Mute"}
              </button>
              <button
                className="w-full px-3 py-2 text-left text-sm hover:bg-zinc-800/60"
                onClick={() => toggleChat(conv._id, "archive", "isArchived")}
              >
                {conv.isArchived ? "Unarchive" : "Archive"}
              </button>
              <button
                className="w-full px-3 py-2 text-left text-sm text-rose-400 hover:bg-rose-900/20"
                onClick={() => deleteChat(conv._id)}
              >
                <Trash2 size={14} className="inline mr-2" /> Delete chat
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const GroupRow = ({ g }) => {
    const count = groupUnread[g._id] || 0;

    const lastKind = g.lastMessageType || g.preview?.kind || "none";
    const lastText = g.lastMessageText || g.preview?.text || "";
    const lastTime = g.lastMessageAt || g.preview?.time || g.updatedAt || g.createdAt;

    const senderId = g.lastMessageSenderId || g.preview?.senderId || null;
    const senderName =
      g.lastMessageSenderName || g.preview?.senderName || g.preview?.prefix || "";
    const isYou = senderId && user?._id && String(senderId) === String(user._id);
    const prefix = isYou ? "You" : senderName;

    const body =
      lastKind === "image" ? (
        <>
          <ImageIcon size={14} /> <span>Image</span>
        </>
      ) : lastKind === "video" ? (
        <>
          <Video size={14} /> <span>Video</span>
        </>
      ) : lastKind === "audio" ? (
        <>
          <Play size={14} /> <span>Audio</span>
        </>
      ) : lastKind === "file" ? (
        <>
          <FileText size={14} /> <span>File</span>
        </>
      ) : lastText ? (
        <span className="truncate">{lastText}</span>
      ) : (
        <span className="opacity-60">No messages yet</span>
      );

    return (
      <div
        className="relative w-full text-left px-4 py-3 border-b border-zinc-900/60 hover:bg-zinc-900/50 transition flex items-center gap-3 cursor-pointer"
        onClick={() => {
          navigate(`/g/${g._id}`);
          setGroupUnread((prev) => ({ ...prev, [g._id]: 0 }));
          socket?.emit("seenGroup", { groupId: g._id, userId: user?._id });
          clearDMEverywhere();
        }}
      >
        <img
          src={g.profilePic || "/group-placeholder.png"}
          alt=""
          className="w-10 h-10 rounded-full object-cover ring-1 ring-emerald-500/20"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="font-medium truncate text-zinc-200">{g.name}</div>
            {g?.isPinned && <Pin size={14} className="text-emerald-400/70 shrink-0" title="Pinned" />}
            {g?.isMuted && <BellOff size={14} className="text-zinc-500 shrink-0" title="Muted" />}
            {g?.isArchived && <Archive size={14} className="text-zinc-500 shrink-0" title="Archived" />}
          </div>
          <div className="text-xs text-zinc-500 flex items-center gap-2 min-w-0">
            <div className="flex items-center gap-1 min-w-0 truncate">
              {prefix ? <span className="text-zinc-400">{prefix}:</span> : null} {body}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-zinc-500">{lastTime ? fmtTime(lastTime) : ""}</div>
          {count > 0 && (
            <div className="mt-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-emerald-600 text-[10px] text-white">
              {count}
            </div>
          )}
        </div>

        {/* 3-dot menu */}
        <div className="ml-2 relative z-50" ref={groupMenuRef} onClick={(e) => e.stopPropagation()}>
          <button
            className="p-1 rounded hover:bg-zinc-800/70"
            onClick={() => setGroupMenuOpen(groupMenuOpen === g._id ? null : g._id)}
            aria-label="Group menu"
          >
            <EllipsisVertical className="text-zinc-400 hover:text-zinc-200" />
          </button>
          {groupMenuOpen === g._id && (
            <div className="absolute right-0 mt-2 w-44 rounded-lg border border-zinc-700 bg-[#0f1318] shadow-xl overflow-hidden">
              <button
                className="w-full px-3 py-2 text-left text-sm hover:bg-zinc-800/60"
                onClick={() => navigate(`/g/${g._id}`)}
              >
                Open group
              </button>
              <button
                className="w-full px-3 py-2 text-left text-sm hover:bg-zinc-800/60"
                onClick={() => toggleGroup(g._id, "pin", "isPinned")}
              >
                {g.isPinned ? "Unpin" : "Pin"}
              </button>
              <button
                className="w-full px-3 py-2 text-left text-sm hover:bg-zinc-800/60"
                onClick={() => toggleGroup(g._id, "mute", "isMuted")}
              >
                {g.isMuted ? "Unmute" : "Mute"}
              </button>
              <button
                className="w-full px-3 py-2 text-left text-sm hover:bg-zinc-800/60"
                onClick={() => toggleGroup(g._id, "archive", "isArchived")}
              >
                {g.isArchived ? "Unarchive" : "Archive"}
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  /* ---------- render ---------- */
  return (
    <div className="w-full h-full grid grid-cols-1 lg:grid-cols-[64px,1fr] bg-[#0a0f14] text-zinc-100">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 1800,
          style: {
            background: "#12161b",
            color: "#e9edef",
            borderRadius: "10px",
            border: "1px solid rgba(16,185,129,.25)",
            boxShadow: "0 8px 30px rgba(0,0,0,.35)",
            fontSize: "14px",
          },
        }}
      />

      {/* Icon rail */}
      <div className="bg-[#0b1016] border-b lg:border-b-0 lg:border-r border-zinc-800/70 h-full py-4 lg:py-5 flex lg:flex-col items-center justify-between gap-3">
        <div className="flex lg:flex-col items-center gap-2">
          <button
            title="Chats"
            className={`w-12 h-12 grid place-items-center cursor-pointer rounded-lg transition ${
              activeTab === "chats"
                ? "text-emerald-400 bg-emerald-500/10 ring-1 ring-emerald-500/30"
                : "text-zinc-300 hover:text-emerald-400 hover:bg-emerald-500/10"
            }`}
            onClick={() => {
              setActiveTab("chats");
              navigate("/");
            }}
          >
            <MessageCircle size={20} />
          </button>

          <button
            title="Add friend"
            onClick={() => setOpenSearchUser(true)}
            className="w-12 h-12 grid place-items-center cursor-pointer text-zinc-300 hover:text-emerald-400 rounded-lg hover:bg-emerald-500/10 transition"
          >
            <UserPlus size={20} />
          </button>

          <button
            title="Groups"
            onClick={() => {
              setActiveTab("groups");
              onSelectChat?.(null);
              navigate("/g");
            }}
            className={`w-12 h-12 grid place-items-center cursor-pointer rounded-lg transition ${
              activeTab === "groups"
                ? "text-emerald-400 bg-emerald-500/10 ring-1 ring-emerald-500/30"
                : "text-zinc-300 hover:text-emerald-400 hover:bg-emerald-500/10"
            }`}
          >
            <Users size={20} />
          </button>
        </div>

        <div className="flex items-center gap-2 pr-3 lg:pr-0">
          <button onClick={() => setEditProfile(true)} className="shrink-0">
            <Avatar imageUrl={user?.profilePic} name={user?.name} userId={user?._id} />
          </button>
          <button
            title="Logout"
            onClick={handleLogout}
            className="text-zinc-300 hover:text-rose-400 hover:bg-rose-500/10 p-2 rounded-lg transition"
          >
            <LogOut size={20} />
          </button>
        </div>
      </div>

      {/* Main list */}
      <div className="w-full bg-[#090d12]">
        {/* Header */}
        <div className="h-14 px-4 border-b border-zinc-800/70 flex items-center justify-between">
          <h2 className="font-semibold tracking-wide text-zinc-200">
            {activeTab === "groups" ? "Groups" : "Chats"}
          </h2>

          {activeTab === "groups" ? (
            <button
              onClick={() => {
                navigate("/g?new=1");
                try {
                  window.dispatchEvent(new CustomEvent("group:new"));
                } catch {}
              }}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm ring-1 ring-emerald-400/30 shadow-sm"
            >
              <Plus size={16} />
              <span className="font-medium">New Group</span>
            </button>
          ) : (
            <div className="opacity-0 select-none">
              <EllipsisVertical size={18} />
            </div>
          )}
        </div>

        {/* Search + Tab toggles */}
        <div className="px-4 py-3 border-b border-zinc-800/70">
          <div className="flex items-center gap-2 rounded-xl px-3 py-2 border border-zinc-700/60 bg-[#0f1419]">
            <Search size={16} className="text-zinc-500" />
            <input
              ref={searchInputRef}
              type="text"
              placeholder={activeTab === "groups" ? "Search groups..." : "Search chats..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-transparent outline-none w-full text-sm text-zinc-300 placeholder-zinc-500"
            />
          </div>

          <div className="mt-3 grid grid-cols-2 gap-2">
            <button
              className={`py-2 text-sm font-medium rounded-lg border ${
                activeTab === "chats"
                  ? "text-emerald-400 border-emerald-500/40 bg-emerald-500/10"
                  : "text-zinc-400 border-zinc-700/60 hover:bg-zinc-800/50"
              }`}
              onClick={() => {
                setActiveTab("chats");
                navigate("/");
              }}
            >
              Chats
            </button>
            <button
              className={`py-2 text-sm font-medium rounded-lg border ${
                activeTab === "groups"
                  ? "text-emerald-400 border-emerald-500/40 bg-emerald-500/10"
                  : "text-zinc-400 border-zinc-700/60 hover:bg-zinc-800/50"
              }`}
              onClick={() => {
                setActiveTab("groups");
                onSelectChat?.(null);
                navigate("/g");
              }}
            >
              Groups
            </button>
          </div>
        </div>

        {/* Lists */}
        <div className="h-[calc(100vh-230px)] overflow-x-hidden overflow-y-auto pb-6">
          {activeTab === "chats" ? (
            <>
              {/* Pinned */}
              {pinnedChats.length > 0 && (
                <div className="px-4 pt-4 pb-2 text-xs uppercase tracking-wider text-zinc-500">Pinned</div>
              )}
              <div className="divide-y divide-zinc-900/60">
                {pinnedChats.map((c) => (
                  <ChatRow key={c?._id} conv={c} />
                ))}
              </div>

              {/* Regular */}
              {pinnedChats.length > 0 && regularChats.length > 0 && (
                <div className="px-4 pt-4 pb-2 text-xs uppercase tracking-wider text-zinc-500">Chats</div>
              )}
              {regularChats.length > 0 ? (
                <div className="divide-y divide-zinc-900/60">
                  {regularChats.map((c) => (
                    <ChatRow key={c?._id} conv={c} />
                  ))}
                </div>
              ) : pinnedChats.length === 0 ? (
                <div className="px-4 pt-4 text-zinc-500">No chats yet</div>
              ) : null}

              {/* Archived (collapsible) */}
              {chatsArchived.length > 0 && (
                <>
                  <button
                    className="w-full text-left px-4 pt-4 pb-2 text-xs uppercase tracking-wider text-zinc-500 flex items-center gap-1"
                    onClick={() => setShowArchivedChats((s) => !s)}
                  >
                    {showArchivedChats ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    Archived Chats ({chatsArchived.length})
                  </button>
                  {showArchivedChats && (
                    <div className="divide-y divide-zinc-900/60">
                      {chatsArchived.map((c) => (
                        <ChatRow key={c?._id} conv={c} />
                      ))}
                    </div>
                  )}
                </>
              )}
            </>
          ) : (
            <>
              {/* Groups list */}
              {groupsLoading && <p className="p-4 text-zinc-400">Loading…</p>}

              {!groupsLoading && pinnedGroups.length > 0 && (
                <div className="px-4 pt-4 pb-2 text-xs uppercase tracking-wider text-zinc-500">
                  Pinned
                </div>
              )}
              <div className="divide-y divide-zinc-900/60">
                {pinnedGroups.map((g) => (
                  <GroupRow key={g._id} g={g} />
                ))}
              </div>

              {pinnedGroups.length > 0 && regularGroups.length > 0 && (
                <div className="px-4 pt-4 pb-2 text-xs uppercase tracking-wider text-zinc-500">
                  Groups
                </div>
              )}
              <div className="divide-y divide-zinc-900/60">
                {regularGroups.map((g) => (
                  <GroupRow key={g._id} g={g} />
                ))}
              </div>

              {/* Archived (collapsible) */}
              {groupsArchived.length > 0 && (
                <>
                  <button
                    className="w-full text-left px-4 pt-4 pb-2 text-xs uppercase tracking-wider text-zinc-500 flex items-center gap-1"
                    onClick={() => setShowArchivedGroups((s) => !s)}
                  >
                    {showArchivedGroups ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                    Archived Groups ({groupsArchived.length})
                  </button>
                  {showArchivedGroups && (
                    <div className="divide-y divide-zinc-900/60">
                      {groupsArchived.map((g) => (
                        <GroupRow key={g._id} g={g} />
                      ))}
                    </div>
                  )}
                </>
              )}
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
