
// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { GetSocket } from "../utils/Sockets";
// import {
//   ArrowUpLeft,
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
//   ChevronDown,
//   ChevronRight,
//   FileText,
//   Play,
//   Users,
//   Trash2,
// } from "lucide-react";
// import Avatar from "./Avatar";
// import { useLocalStorage } from "@mantine/hooks";
// import { useNavigate, useLocation } from "react-router-dom";
// import AddUser from "./AddUser";
// import EditProfile from "./EditProfile";
// import axios from "axios";
// import http from "../utils/http";
// import toast, { Toaster } from "react-hot-toast";

// const CHAT_API_BASE = "http://localhost:5000/api/chat";

// /* ---------- helpers ---------- */
// const fmtTime = (d) => {
//   try {
//     const date = new Date(d);
//     return isNaN(date)
//       ? ""
//       : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
//   } catch {
//     return "";
//   }
// };

// const isOfficeOrPdf = (name = "") =>
//   /\.(pdf|docx?|pptx?|xlsx|csv|txt)(\?|$)/i.test(name);

// const pickUrl = (m = {}) =>
//   m.url ||
//   m.imageUrl ||
//   m.audioUrl ||
//   m.videoUrl ||
//   m.fileUrl ||
//   m.documentUrl ||
//   m.attachmentUrl ||
//   m.mediaUrl ||
//   m.path ||
//   null;

// const resolveType = (m = {}) => {
//   if (m.messageType) return m.messageType;
//   if (m.imageUrl) return "image";
//   if (m.audioUrl) return "audio";
//   if (m.videoUrl) return "video";
//   if (m.fileUrl || isOfficeOrPdf(m.fileName)) return "file";
//   const u = pickUrl(m);
//   if (u) {
//     if (/\/video\/upload\//.test(u)) return "video";
//     if (/\/raw\/upload\//.test(u) || isOfficeOrPdf(u)) return "file";
//     return "image";
//   }
//   return "text";
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
//   if (!m)
//     return {
//       text: "",
//       kind: "none",
//       time: fallbackTime || "",
//       senderId: null,
//       senderName: "",
//       prefix: "",
//     };
//   const n = normalizeMessage(m);
//   const text =
//     // n?.translatedMessage ||
//     n?.message ||
//     n?.text ||
//     n?.content ||
//     n?.caption ||
//     "";
//   const kind = n?.messageType || "text";
//   const time = n?.createdAt || fallbackTime || "";
//   const senderId = n?._senderId || null;
//   const senderName = n?._senderName || "";

//   const prefix =
//     senderId && currentUserId && String(senderId) === String(currentUserId)
//       ? "You"
//       : senderName || "";

//   return { text, kind, time, senderId, senderName, prefix };
// };

// const extractGroupPreviewFromList = (g, currentUserId) => {
//   const lm = typeof g?.lastMessage === "object" ? g.lastMessage : null;
//   if (lm)
//     return buildPreviewFromMsg(
//       lm,
//       g?.updatedAt || g?.createdAt,
//       currentUserId
//     );

//   // Lightweight fields from backend (if present)
//   if (
//     g?.lastMessageText ||
//     g?.lastMessageType ||
//     g?.lastMessageAt ||
//     g?.lastMessageSenderId ||
//     g?.lastMessageSenderName
//   ) {
//     const time = g?.lastMessageAt || g?.updatedAt || g?.createdAt || "";
//     const kind = g?.lastMessageType || (g?.lastMessageText ? "text" : "none");
//     const senderId = g?.lastMessageSenderId || null;
//     const senderName = g?.lastMessageSenderName || "";
//     const prefix =
//       senderId && currentUserId && String(senderId) === String(currentUserId)
//         ? "You"
//         : senderName || "";
//     return {
//       text: g?.lastMessageText || "",
//       kind,
//       time,
//       senderId,
//       senderName,
//       prefix,
//     };
//   }

//   return {
//     text: "",
//     kind: "none",
//     time: g?.updatedAt || g?.createdAt || "",
//     senderId: null,
//     senderName: "",
//     prefix: "",
//   };
// };

// /* ---------- component ---------- */
// const Side = ({ onSelectChat }) => {
//   const navigate = useNavigate();
//   const location = useLocation();
//   const [user, setUser] = useLocalStorage({ key: "userData", defaultValue: {} });

//   const socket =
//     (typeof GetSocket === "function"
//       ? GetSocket()
//       : GetSocket?.socket || GetSocket?.current || GetSocket) || null;

//   /* modals */
//   const [openSearchUser, setOpenSearchUser] = useState(false);
//   const [editProfile, setEditProfile] = useState(false);

//   /* tabs */
//   const [activeTab, setActiveTab] = useState("groups");

//   /* chats state */
//   const [allUsers, setAllUsers] = useState([]);
//   const [typingMap, setTypingMap] = useState({});
//   const [lastPreviewMap, setLastPreviewMap] = useState({});

//   /* groups state */
//   const [groups, setGroups] = useState([]);
//   const [groupsLoading, setGroupsLoading] = useState(false);
//   const [groupUnread, setGroupUnread] = useLocalStorage({
//     key: "groupUnread",
//     defaultValue: {},
//   });

//   /* ui state */
//   const [search, setSearch] = useState("");
//   const [chatMenuOpen, setChatMenuOpen] = useState(null);
//   const [groupMenuOpen, setGroupMenuOpen] = useState(null);
//   const [showArchivedChats, setShowArchivedChats] = useState(false);
//   const [showArchivedGroups, setShowArchivedGroups] = useState(false);

//   const chatMenuRef = useRef(null);
//   const groupMenuRef = useRef(null);

//   /* ---------- sockets: 1:1 previews ---------- */
//   const requestLastForPeer = (peerId) => {
//     if (!socket || !peerId) return;
//     socket.emit("msgPage", peerId);
//   };

//   useEffect(() => {
//     if (!socket || !user?._id) return;
//     socket.emit("side", user._id);

//     const onConv = (data) => {
//       const updated = (data || []).map((conv) => {
//         const youAreSender = String(conv?.sender?._id) === String(user._id);
//         const peer = youAreSender ? conv.receiver : conv.sender;
//         return { ...conv, userDetails: peer, unseenMsg: conv.unseen };
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
//         next.forEach((c) => {
//           const pid = c?.userDetails?._id;
//           if (pid && !lastPreviewMap[pid]) requestLastForPeer(pid);
//         });
//         return next;
//       });
//     };

//     const onTyping = ({ from, to, isTyping }) => {
//       if (!from || String(to) !== String(user._id)) return;
//       setTypingMap((m) =>
//         isTyping ? { ...m, [from]: Date.now() } : { ...m, [from]: 0 }
//       );
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
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [socket, user?._id, lastPreviewMap]);

//   /* ---------- groups load + robust enrichment ---------- */
//   const fetchGroupLastMessage = async (groupId) => {
//     const tryGet = async (urlBuilder) => {
//       try {
//         const res = await http.get(urlBuilder(groupId));
//         return res?.data || null;
//       } catch {
//         return null;
//       }
//     };

//     let data =
//       (await tryGet((id) => `/api/groups/${id}/last`)) ||
//       (await tryGet((id) => `/api/groups/${id}/messages?limit=1`)) ||
//       (await tryGet((id) => `/api/messages?groupId=${id}&limit=1`)) ||
//       (await tryGet((id) => `/api/messages/group/${id}?limit=1`));

//     if (!data) return null;

//     const msg =
//       data.message ||
//       (Array.isArray(data.messages) && data.messages[0]) ||
//       data.lastMessage ||
//       data.result ||
//       null;

//     return msg || null;
//   };

//   const loadGroups = async () => {
//     try {
//       setGroupsLoading(true);
//       const { data } = await http.get("/api/groups");
//       const list = data?.groups || [];

//       // 1) provisional previews
//       let next = list.map((g) => ({
//         ...g,
//         preview: extractGroupPreviewFromList(g, user?._id),
//       }));

//       setGroups((prev) => {
//         const byId = new Map(prev.map((g) => [g._id, g]));
//         return next.map((g) => {
//           const local = byId.get(g._id);
//           return {
//             ...g,
//             isPinned: local?.isPinned ?? g.isPinned,
//             isArchived: local?.isArchived ?? g.isArchived,
//             isMuted: local?.isMuted ?? g.isMuted,
//           };
//         });
//       });

//       // 2) enrich where preview missing or lastMessage not embedded
//       const need = next.filter((g) => {
//         const p = g.preview || {};
//         const lastIsObject =
//           typeof g?.lastMessage === "object" && g?.lastMessage;
//         return (!p.text && (p.kind === "none" || p.kind === "text")) || !lastIsObject;
//       });

//       if (need.length) {
//         const results = await Promise.allSettled(
//           need.map(async (g) => {
//             let detail = null;
//             try {
//               const res = await http.get(`/api/groups/${g._id}`);
//               detail = res?.data?.group || res?.data || null;
//             } catch {}

//             let last =
//               (detail &&
//                 typeof detail.lastMessage === "object" &&
//                 detail.lastMessage) ||
//               (detail &&
//                 Array.isArray(detail.messages) &&
//                 detail.messages[detail.messages.length - 1]) ||
//               null;

//             if (!last) last = await fetchGroupLastMessage(g._id);

//             return { id: g._id, detail, last };
//           })
//         );

//         setGroups((curr) => {
//           const by = new Map(curr.map((g) => [g._id, g]));
//           results.forEach((r) => {
//             if (r.status !== "fulfilled") return;
//             const { id, last, detail } = r.value || {};
//             const old = by.get(id);
//             const preview = buildPreviewFromMsg(
//               last,
//               (detail && (detail.updatedAt || detail.createdAt)) ||
//                 old?.updatedAt ||
//                 old?.createdAt,
//               user?._id
//             );
//             by.set(id, { ...old, preview });
//           });
//           return Array.from(by.values());
//         });
//       }
//     } catch (err) {
//       toast.error(err?.response?.data?.message || "Failed to load groups");
//     } finally {
//       setGroupsLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (activeTab === "groups" && groups.length === 0) loadGroups();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [activeTab, user?._id]);

//   /* ---------- unread badges: increment on new group msgs ---------- */
//   useEffect(() => {
//     if (!socket || !user?._id) return;

//     const bump = (gid, fromId) => {
//       if (!gid) return;
//       // skip if I'm the sender
//       if (fromId && String(fromId) === String(user._id)) return;
//       // skip if group is currently open
//       if (location.pathname === `/g/${gid}`) return;
//       setGroupUnread((prev) => ({ ...prev, [gid]: (prev?.[gid] || 0) + 1 }));
//     };

//     const onReceiveSingle = (m) => {
//       const gid =
//         String(m?.groupId || m?.group || m?.group_id || m?.groupID || "");
//       const from =
//         String(m?.msgByUser?._id || m?.msgByUser || m?.sender || "");
//       bump(gid, from);
//     };

//     const onReceiveBatch = (payload) => {
//       const gid = String(payload?.groupId || "");
//       const list = Array.isArray(payload?.messages) ? payload.messages : [];
//       for (const m of list) {
//         const from =
//           String(m?.msgByUser?._id || m?.msgByUser || m?.sender || "");
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

//   /* ---------- unread badges: clear when opening a group ---------- */
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
//       if (chatMenuRef.current && !chatMenuRef.current.contains(e.target))
//         setChatMenuOpen(null);
//       if (groupMenuRef.current && !groupMenuRef.current.contains(e.target))
//         setGroupMenuOpen(null);
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
//           <span
//             key={i}
//             className="bg-emerald-300/30 text-emerald-200 px-0.5 rounded"
//           >
//             {part}
//           </span>
//         ) : (
//           part
//         )
//       );
//   };

//   /* ---------- chats: sorting/filtering ---------- */
//   const getLastActive = (c) => {
//     const pid = c?.userDetails?._id;
//     const p = pid ? lastPreviewMap[pid] : null;
//     const t = p?.time || c?.updatedAt || c?.createdAt || 0;
//     return new Date(t).getTime() || 0;
//   };

//   const filteredChats = useMemo(() => {
//     const q = search.trim().toLowerCase();
//     if (!q) return allUsers;
//     return allUsers.filter((c) =>
//       (c?.userDetails?.name || "").toLowerCase().includes(q)
//     );
//   }, [allUsers, search]);

//   const archivedChats = useMemo(
//     () => filteredChats.filter((c) => c?.isArchived),
//     [filteredChats]
//   );
//   const notArchivedChats = useMemo(
//     () => filteredChats.filter((c) => !c?.isArchived),
//     [filteredChats]
//   );

//   const notArchivedChatsSorted = useMemo(() => {
//     const arr = [...notArchivedChats];
//     arr.sort((a, b) => {
//       if (a?.isPinned && !b?.isPinned) return -1;
//       if (!a?.isPinned && b?.isPinned) return 1;
//       return getLastActive(b) - getLastActive(a);
//     });
//     return arr;
//   }, [notArchivedChats, lastPreviewMap]);

//   const pinnedChats = useMemo(
//     () => notArchivedChatsSorted.filter((c) => c?.isPinned),
//     [notArchivedChatsSorted]
//   );
//   const regularChats = useMemo(
//     () => notArchivedChatsSorted.filter((c) => !c?.isPinned),
//     [notArchivedChatsSorted]
//   );

//   /* ---------- groups: sorting/filtering ---------- */
//   const filteredGroups = useMemo(() => {
//     const q = search.trim().toLowerCase();
//     if (!q) return groups;
//     return groups.filter((g) => (g?.name || "").toLowerCase().includes(q));
//   }, [groups, search]);

//   const archivedGroups = useMemo(
//     () => filteredGroups.filter((g) => g?.isArchived),
//     [filteredGroups]
//   );
//   const notArchivedGroups = useMemo(
//     () => filteredGroups.filter((g) => !g?.isArchived),
//     [filteredGroups]
//   );

//   const groupsLastActive = (g) =>
//     new Date(g?.preview?.time || g?.updatedAt || g?.createdAt || 0).getTime() ||
//     0;

//   const notArchivedGroupsSorted = useMemo(() => {
//     const arr = [...notArchivedGroups];
//     arr.sort((a, b) => {
//       if (a?.isPinned && !b?.isPinned) return -1;
//       if (!a?.isPinned && b?.isPinned) return 1;
//       return groupsLastActive(b) - groupsLastActive(a);
//     });
//     return arr;
//   }, [notArchivedGroups]);

//   const pinnedGroups = useMemo(
//     () => notArchivedGroupsSorted.filter((g) => g?.isPinned),
//     [notArchivedGroupsSorted]
//   );
//   const regularGroups = useMemo(
//     () => notArchivedGroupsSorted.filter((g) => !g?.isPinned),
//     [notArchivedGroupsSorted]
//   );

//   /* ---------- actions: chats & groups (unchanged) ---------- */
//   const chatActionLabels = {
//     mute: {
//       loading: "Muting chat…",
//       successOn: "Chat muted",
//       successOff: "Chat unmuted",
//       error: "Failed to mute chat",
//     },
//     archive: {
//       loading: "Archiving chat…",
//       successOn: "Chat archived",
//       successOff: "Chat unarchived",
//       error: "Failed to archive chat",
//     },
//     pin: {
//       loading: "Pinning chat…",
//       successOn: "Chat pinned",
//       successOff: "Chat unpinned",
//       error: "Failed to pin chat",
//     },
//     delete: {
//       loading: "Deleting chat…",
//       successOn: "Chat deleted",
//       error: "Failed to delete chat",
//     },
//   };

//   const handleChatAction = async (chatId, action) => {
//     const prev = allUsers;
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

//     const labels = chatActionLabels[action];
//     const req =
//       action === "delete"
//         ? axios.delete(`${CHAT_API_BASE}/${chatId}/delete`)
//         : axios.put(`${CHAT_API_BASE}/${chatId}/${action}`, {});
//     await toast.promise(
//       req,
//       {
//         loading: labels.loading,
//         success: (res) => {
//           if (action === "delete") return labels.successOn;
//           if (action === "mute")
//             return res?.data?.isMuted ? labels.successOn : labels.successOff;
//           if (action === "archive")
//             return res?.data?.isArchived
//               ? labels.successOn
//               : labels.successOff;
//           if (action === "pin")
//             return res?.data?.isPinned ? labels.successOn : labels.successOff;
//           return "Done";
//         },
//         error: (err) => {
//           setAllUsers(prev);
//           return (
//             err?.response?.data?.message ||
//             labels.error ||
//             "Something went wrong"
//           );
//         },
//       },
//       {
//         success: { duration: 2000 },
//         error: { duration: 2200 },
//         loading: { duration: 100000 },
//       }
//     );
//     setChatMenuOpen(null);
//   };

//   const groupActionLabels = {
//     mute: {
//       loading: "Muting group…",
//       successOn: "Group muted",
//       successOff: "Group unmuted",
//       error: "Failed to mute group",
//     },
//     archive: {
//       loading: "Archiving group…",
//       successOn: "Group archived",
//       successOff: "Group unarchived",
//       error: "Failed to archive group",
//     },
//     pin: {
//       loading: "Pinning group…",
//       successOn: "Group pinned",
//       successOff: "Group unpinned",
//       error: "Failed to pin group",
//     },
//     delete: {
//       loading: "Deleting group…",
//       successOn: "Group deleted",
//       error: "Failed to delete group",
//     },
//   };

//   const openArchivedIfArchiving = (action, wasArchived) => {
//     if (action === "archive" && !wasArchived) setShowArchivedGroups(true);
//   };

//   const handleGroupAction = async (groupId, action) => {
//     const prev = groups;
//     const before = groups.find((g) => g._id === groupId);
//     const wasArchived = !!before?.isArchived;

//     if (action === "delete") {
//       setGroups((p) => p.filter((g) => g._id !== groupId));
//     } else {
//       setGroups((p) =>
//         p.map((g) =>
//           g._id === groupId
//             ? action === "mute"
//               ? { ...g, isMuted: !g.isMuted }
//               : action === "archive"
//               ? { ...g, isArchived: !g.isArchived }
//               : action === "pin"
//               ? { ...g, isPinned: !g.isPinned }
//               : g
//             : g
//         )
//       );
//       openArchivedIfArchiving(action, wasArchived);
//     }

//     const req =
//       action === "delete"
//         ? http.delete(`/api/groups/delete`, { data: { groupId } })
//         : http.put(`/api/groups/${groupId}/${action}`, {});
//     const labels = groupActionLabels[action];

//     await toast.promise(
//       req,
//       {
//         loading: labels.loading,
//         success: (res) =>
//           action === "delete" ? labels.successOn : res?.data?.message || "Done",
//         error: (err) => {
//           setGroups(prev);
//           return (
//             err?.response?.data?.message ||
//             labels.error ||
//             "Something went wrong"
//           );
//         },
//       },
//       {
//         success: { duration: 2000 },
//         error: { duration: 2200 },
//         loading: { duration: 100000 },
//       }
//     );
//     setGroupMenuOpen(null);
//   };

//   /* ---------- rows ---------- */
//   const ChatRow = ({ conv }) => {
//     const pid = conv?.userDetails?._id;
//     const last = pid ? lastPreviewMap[pid] : null;
//     const isTypingActive =
//       typingMap[pid] && Date.now() - typingMap[pid] < 3500;

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
//         className="relative flex items-center gap-3 px-4 py-3 border-b border-zinc-900/60 hover:bg-zinc-900/50 cursor-pointer"
//         onClick={() => {
//           navigate(`/${pid}`);
//           onSelectChat?.(conv.userDetails);
//         }}
//         onContextMenu={(e) => {
//           e.preventDefault();
//           setChatMenuOpen(chatMenuOpen === conv._id ? null : conv._id);
//         }}
//       >
//         <Avatar
//           imageUrl={conv?.userDetails?.profilePic}
//           name={conv?.userDetails?.name}
//         />
//         <div className="flex-1 min-w-0">
//           <div className="flex items-center gap-2 min-w-0">
//             <h3 className="text-zinc-200 font-medium truncate">
//               {highlightText(conv?.userDetails?.name, search)}
//             </h3>
//             {conv?.isPinned && (
//               <Pin size={14} className="text-emerald-400/70 shrink-0" />
//             )}
//             {conv?.isMuted && (
//               <BellOff size={14} className="text-zinc-500 shrink-0" />
//             )}
//             {conv?.isArchived && (
//               <Archive size={14} className="text-zinc-500 shrink-0" />
//             )}
//           </div>
//           <div className="text-xs text-zinc-500 flex items-center gap-2 min-w-0">
//             <div className="flex items-center gap-1 min-w-0 truncate">
//               {preview}
//             </div>
//           </div>
//         </div>
//         <div className="text-right pl-2">
//           <div className="text-[10px] text-zinc-500">
//             {last?.time ? fmtTime(last.time) : ""}
//           </div>
//           {!!conv?.unseenMsg && (
//             <div className="mt-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-emerald-600 text-[10px] text-white">
//               {conv?.unseenMsg}
//             </div>
//           )}
//         </div>

//         <div className="ml-2 relative z-50" ref={chatMenuRef}>
//           <button
//             className="p-1 rounded hover:bg-zinc-800/70"
//             onClick={(e) => {
//               e.stopPropagation();
//               setChatMenuOpen(chatMenuOpen === conv._id ? null : conv._id);
//             }}
//           >
//             <EllipsisVertical className="text-zinc-400 hover:text-zinc-200" />
//           </button>

//           {chatMenuOpen === conv._id && (
//             <div
//               className="absolute right-0 mt-2 bg-[#0e1216] rounded-lg shadow-xl border border-zinc-800 text-sm w-40 py-1"
//               onClick={(e) => e.stopPropagation()}
//             >
//               <button
//                 className="block w-full text-left px-4 py-2 hover:bg-zinc-800"
//                 onClick={() => handleChatAction(conv._id, "mute")}
//               >
//                 {conv.isMuted ? "Unmute" : "Mute"}
//               </button>
//               <button
//                 className="block w-full text-left px-4 py-2 hover:bg-zinc-800"
//                 onClick={() => handleChatAction(conv._id, "archive")}
//               >
//                 {conv.isArchived ? "Unarchive" : "Archive"}
//               </button>
//               <button
//                 className="block w-full text-left px-4 py-2 hover:bg-zinc-800"
//                 onClick={() => handleChatAction(conv._id, "pin")}
//               >
//                 {conv.isPinned ? "Unpin" : "Pin"}
//               </button>
//               <button
//                 className="block w-full text-left px-4 py-2 hover:bg-red-600/20 text-red-300"
//                 onClick={() => handleChatAction(conv._id, "delete")}
//               >
//                 Delete
//               </button>
//             </div>
//           )}
//         </div>
//       </div>
//     );
//   };

//   const GroupRow = ({ g }) => {
//     const count = groupUnread[g._id] || 0;

//     // Prefer backend-provided fields; fall back to preview object
//     const lastKind = g.lastMessageType || g.preview?.kind || "none";
//     const lastText = g.lastMessageText || g.preview?.text || "";
//     const lastTime =
//       g.lastMessageAt || g.preview?.time || g.updatedAt || g.createdAt;

//     const senderId = g.lastMessageSenderId || g.preview?.senderId || null;
//     const senderName =
//       g.lastMessageSenderName || g.preview?.senderName || g.preview?.prefix || "";

//     const isYou =
//       senderId && user?._id && String(senderId) === String(user._id);
//     const prefix = isYou ? "You" : senderName;

//     const body =
//       lastKind === "image" ? (
//         <>
//           <ImageIcon size={14} /> <span>Image</span>
//         </>
//       ) : lastKind === "video" ? (
//         <>
//           <Video size={14} /> <span>Video</span>
//         </>
//       ) : lastKind === "audio" ? (
//         <>
//           <Play size={14} /> <span>Audio</span>
//         </>
//       ) : lastKind === "file" ? (
//         <>
//           <FileText size={14} /> <span>File</span>
//         </>
//       ) : lastText ? (
//         <span className="truncate">{lastText}</span>
//       ) : (
//         <span className="opacity-60">No messages yet</span>
//       );

//     return (
//       <div
//         key={g._id}
//         className="relative w-full text-left px-4 py-3 border-b border-zinc-900/60 hover:bg-zinc-900/50 transition flex items-center gap-3"
//         onClick={() => {
//           navigate(`/g/${g._id}`);
//           // clear badge immediately and mark seen
//           setGroupUnread((prev) => ({ ...prev, [g._id]: 0 }));
//           socket?.emit("seenGroup", { groupId: g._id, userId: user?._id });
//         }}
//         onContextMenu={(e) => {
//           e.preventDefault();
//           setGroupMenuOpen(groupMenuOpen === g._id ? null : g._id);
//         }}
//       >
//         <img
//           src={g.profilePic || "/group-placeholder.png"}
//           alt=""
//           className="w-10 h-10 rounded-full object-cover ring-1 ring-emerald-500/20"
//         />
//         <div className="flex-1 min-w-0">
//           <div className="flex items-center gap-2">
//             <div className="font-medium truncate text-zinc-200">{g.name}</div>
//             {g?.isPinned && (
//               <Pin size={14} className="text-emerald-400/70 shrink-0" />
//             )}
//             {g?.isMuted && (
//               <BellOff size={14} className="text-zinc-500 shrink-0" />
//             )}
//             {g?.isArchived && (
//               <Archive size={14} className="text-zinc-500 shrink-0" />
//             )}
//           </div>
//           <div className="text-xs text-zinc-500 flex items-center gap-2 min-w-0">
//             <div className="flex items-center gap-1 min-w-0 truncate">
//               {prefix ? (
//                 <span className="text-zinc-400">{prefix}:</span>
//               ) : null}{" "}
//               {body}
//             </div>
//           </div>
//         </div>
//         <div className="text-right">
//           <div className="text-[10px] text-zinc-500">
//             {lastTime ? fmtTime(lastTime) : ""}
//           </div>
//           {count > 0 && (
//             <div className="mt-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-emerald-600 text-[10px] text-white">
//               {count}
//             </div>
//           )}
//         </div>

//         <div className="ml-2 relative z-50" ref={groupMenuRef}>
//           <button
//             className="p-1 rounded hover:bg-zinc-800/70"
//             onClick={(e) => {
//               e.stopPropagation();
//               setGroupMenuOpen(groupMenuOpen === g._id ? null : g._id);
//             }}
//           >
//             <EllipsisVertical className="text-zinc-400 hover:text-zinc-200" />
//           </button>

//           {groupMenuOpen === g._id && (
//             <div
//               className="absolute right-0 mt-2 bg-[#0e1216] rounded-lg shadow-xl border border-zinc-800 text-sm w-44 py-1"
//               onClick={(e) => e.stopPropagation()}
//             >
//               <button
//                 className="block w-full text-left px-4 py-2 hover:bg-zinc-800"
//                 onClick={() => handleGroupAction(g._id, "mute")}
//               >
//                 {g.isMuted ? "Unmute group" : "Mute group"}
//               </button>
//               <button
//                 className="block w-full text-left px-4 py-2 hover:bg-zinc-800"
//                 onClick={() => handleGroupAction(g._id, "archive")}
//               >
//                 {g.isArchived ? "Unarchive group" : "Archive group"}
//               </button>
//               <button
//                 className="block w-full text-left px-4 py-2 hover:bg-zinc-800"
//                 onClick={() => handleGroupAction(g._id, "pin")}
//               >
//                 {g.isPinned ? "Unpin group" : "Pin group"}
//               </button>
//               <button
//                 className="block w-full text-left px-4 py-2 hover:bg-red-600/20 text-red-300"
//                 onClick={() => handleGroupAction(g._id, "delete")}
//               >
//                 <span className="inline-flex items-center gap-2">
//                   <Trash2 size={14} /> Delete group
//                 </span>
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

//       {/* Left bar */}
//       <div className="bg-[#0b1016] border-r border-zinc-800/70 h-full py-5 flex flex-col items-center justify-between">
//         <div className="space-y-2">
//           <div
//             title="Chats"
//             className="w-12 h-12 grid place-items-center cursor-pointer text-zinc-300 hover:text-emerald-400 rounded-lg hover:bg-emerald-500/10 transition"
//             onClick={() => setActiveTab("chats")}
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
//             onClick={() => setActiveTab("groups")}
//             className="w-12 h-12 grid place-items-center cursor-pointer text-zinc-300 hover:text-emerald-400 rounded-lg hover:bg-emerald-500/10 transition"
//           >
//             <Users size={20} />
//           </div>
//         </div>

//         <div className="flex flex-col items-center gap-2">
//           <button onClick={() => setEditProfile(true)}>
//             <Avatar
//               imageUrl={user?.profilePic}
//               name={user?.name}
//               userId={user?._id}
//             />
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
//           <EllipsisVertical size={18} className="text-zinc-300" />
//         </div>

//         {/* Search + Tabs */}
//         <div className="px-4 py-3 border-b border-zinc-800/70">
//           <div className="flex items-center gap-2 rounded-xl px-3 py-2 border border-zinc-700/60 bg-[#0f1419]">
//             <Search size={16} className="text-zinc-500" />
//             <input
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
//               onClick={() => setActiveTab("chats")}
//             >
//               Chats
//             </button>
//             <button
//               className={`py-2 text-sm font-medium rounded-lg border ${
//                 activeTab === "groups"
//                   ? "text-emerald-400 border-emerald-500/40 bg-emerald-500/10"
//                   : "text-zinc-400 border-zinc-700/60 hover:bg-zinc-800/50"
//               }`}
//               onClick={() => setActiveTab("groups")}
//             >
//               Groups
//             </button>
//           </div>
//         </div>

//         {/* Archived (Chats) */}
//         {activeTab === "chats" && archivedChats.length > 0 && (
//           <button
//             className="w-full flex items-center justify-between px-4 py-2 text-zinc-300 hover:bg-zinc-900/60 border-b border-zinc-900/60"
//             onClick={() => setShowArchivedChats((s) => !s)}
//           >
//             <div className="flex items-center gap-3">
//               <Archive size={18} className="text-zinc-300" />
//               <span>Archived</span>
//               <span className="text-xs opacity-70">({archivedChats.length})</span>
//             </div>
//             {showArchivedChats ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
//           </button>
//         )}
//         {activeTab === "chats" && showArchivedChats && archivedChats.length > 0 && (
//           <div className="divide-y divide-zinc-900/60">
//             {archivedChats.map((c) => (
//               <ChatRow key={c?._id} conv={c} />
//             ))}
//           </div>
//         )}

//         {/* Lists */}
//         <div className="h-[calc(100vh-230px)] overflow-x-hidden overflow-y-auto pb-6">
//           {activeTab === "chats" ? (
//             <>
//               {pinnedChats.length > 0 && (
//                 <div className="px-4 pt-4 pb-2 text-xs uppercase tracking-wider text-zinc-500">
//                   Pinned
//                 </div>
//               )}
//               <div className="divide-y divide-zinc-900/60">
//                 {pinnedChats.map((c) => (
//                   <ChatRow key={c?._id} conv={c} />
//                 ))}
//               </div>

//               {pinnedChats.length > 0 && regularChats.length > 0 && (
//                 <div className="px-4 pt-4 pb-2 text-xs uppercase tracking-wider text-zinc-500">
//                   Chats
//                 </div>
//               )}
//               {regularChats.length > 0 ? (
//                 <div className="divide-y divide-zinc-900/60">
//                   {regularChats.map((c) => (
//                     <ChatRow key={c?._id} conv={c} />
//                   ))}
//                 </div>
//               ) : pinnedChats.length === 0 && archivedChats.length === 0 ? (
//                 <div className="mt-12 text-center text-zinc-400">
//                   <ArrowUpLeft size={50} className="mx-auto text-zinc-600" />
//                   <p className="text-lg">No chats found</p>
//                 </div>
//               ) : null}
//             </>
//           ) : (
//             <>
//               {archivedGroups.length > 0 && (
//                 <button
//                   className="w-full flex items-center justify-between px-4 py-2 text-zinc-300 hover:bg-zinc-900/60 border-y border-zinc-900/60"
//                   onClick={() => setShowArchivedGroups((s) => !s)}
//                 >
//                   <div className="flex items-center gap-3">
//                     <Archive size={18} className="text-zinc-300" />
//                     <span>Archived</span>
//                     <span className="text-xs opacity-70">({archivedGroups.length})</span>
//                   </div>
//                   {showArchivedGroups ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
//                 </button>
//               )}

//               {showArchivedGroups && archivedGroups.length > 0 && (
//                 <div className="divide-y divide-zinc-900/60">
//                   {archivedGroups.map((g) => (
//                     <GroupRow key={g._id} g={g} />
//                   ))}
//                 </div>
//               )}

//               {groupsLoading && <p className="p-4 text-zinc-400">Loading…</p>}
//               {!groupsLoading && filteredGroups.length === 0 && (
//                 <p className="p-4 text-zinc-500">No groups yet</p>
//               )}

//               {pinnedGroups.length > 0 && (
//                 <div className="px-4 pt-4 pb-2 text-xs uppercase tracking-wider text-zinc-500">
//                   Pinned
//                 </div>
//               )}
//               <div className="divide-y divide-zinc-900/60">
//                 {pinnedGroups.map((g) => (
//                   <GroupRow key={g._id} g={g} />
//                 ))}
//               </div>

//               {pinnedGroups.length > 0 && regularGroups.length > 0 && (
//                 <div className="px-4 pt-4 pb-2 text-xs uppercase tracking-wider text-zinc-500">
//                   Groups
//                 </div>
//               )}
//               <div className="divide-y divide-zinc-900/60">
//                 {regularGroups.map((g) => (
//                   <GroupRow key={g._id} g={g} />
//                 ))}
//               </div>
//             </>
//           )}
//         </div>
//       </div>

//       {openSearchUser && <AddUser setOpenSearchUser={setOpenSearchUser} />}
//       {editProfile && (
//         <EditProfile setEditProfile={setEditProfile} user={user} setUser={setUser} />
//       )}
//     </div>
//   );
// };

// export default Side;
import React, { useEffect, useMemo, useRef, useState } from "react";
import { GetSocket } from "../utils/Sockets";
import {
  ArrowUpLeft,
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
  ChevronDown,
  ChevronRight,
  FileText,
  Play,
  Users,
  Trash2,
} from "lucide-react";
import Avatar from "./Avatar";
import { useLocalStorage } from "@mantine/hooks";
import { useNavigate, useLocation } from "react-router-dom";
import AddUser from "./AddUser";
import EditProfile from "./EditProfile";
import axios from "axios";
import http from "../utils/http";
import toast, { Toaster } from "react-hot-toast";

const CHAT_API_BASE = "http://localhost:5000/api/chat";

/* ---------- helpers ---------- */
const fmtTime = (d) => {
  try {
    const date = new Date(d);
    return isNaN(date)
      ? ""
      : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
};

const isOfficeOrPdf = (name = "") =>
  /\.(pdf|docx?|pptx?|xlsx|csv|txt)(\?|$)/i.test(name);

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
  if (u) {
    if (/\/video\/upload\//.test(u)) return "video";
    if (/\/raw\/upload\//.test(u) || isOfficeOrPdf(u)) return "file";
    return "image";
  }
  return "text";
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
    return {
      text: "",
      kind: "none",
      time: fallbackTime || "",
      senderId: null,
      senderName: "",
      prefix: "",
    };
  const n = normalizeMessage(m);
  const text =
    n?.message ||
    n?.text ||
    n?.content ||
    n?.caption ||
    "";
  const kind = n?.messageType || "text";
  const time = n?.createdAt || fallbackTime || "";
  const senderId = n?._senderId || null;
  const senderName = n?._senderName || "";

  const prefix =
    senderId && currentUserId && String(senderId) === String(currentUserId)
      ? "You"
      : senderName || "";

  return { text, kind, time, senderId, senderName, prefix };
};

const extractGroupPreviewFromList = (g, currentUserId) => {
  const lm = typeof g?.lastMessage === "object" ? g.lastMessage : null;
  if (lm)
    return buildPreviewFromMsg(
      lm,
      g?.updatedAt || g?.createdAt,
      currentUserId
    );

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
      senderId && currentUserId && String(senderId) === String(currentUserId)
        ? "You"
        : senderName || "";
    return {
      text: g?.lastMessageText || "",
      kind,
      time,
      senderId,
      senderName,
      prefix,
    };
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

/* --- route helpers --- */
const isGroupRoute = (p) => /^\/g(?:\/|$)/i.test(p);

/* ---------- component ---------- */
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

  /* tabs */
  const [activeTab, setActiveTab] = useState("groups");

  /* chats state */
  const [allUsers, setAllUsers] = useState([]);
  const [typingMap, setTypingMap] = useState({});
  const [lastPreviewMap, setLastPreviewMap] = useState({});

  /* groups state */
  const [groups, setGroups] = useState([]);
  const [groupsLoading, setGroupsLoading] = useState(false);
  const [groupUnread, setGroupUnread] = useLocalStorage({
    key: "groupUnread",
    defaultValue: {},
  });

  /* ui state */
  const [search, setSearch] = useState("");
  const [chatMenuOpen, setChatMenuOpen] = useState(null);
  const [groupMenuOpen, setGroupMenuOpen] = useState(null);
  const [showArchivedChats, setShowArchivedChats] = useState(false);
  const [showArchivedGroups, setShowArchivedGroups] = useState(false);

  const chatMenuRef = useRef(null);
  const groupMenuRef = useRef(null);

  /* ---------------- global DM clear (covers many parent patterns) ---------------- */
  const clearDMEverywhere = () => {
    // 1) notify parent prop
    onSelectChat?.(null);
    // 2) nuke common storage keys parents use
    try {
      localStorage.removeItem("activeThread");
      localStorage.removeItem("activeChat");
      localStorage.removeItem("activeChatId");
      sessionStorage.removeItem("activeThread");
      sessionStorage.removeItem("activeChat");
      sessionStorage.removeItem("activeChatId");
    } catch {}
    // 3) broadcast a window-level event so any parent/listener can react
    try {
      window.dispatchEvent(new CustomEvent("active-thread:clear"));
    } catch {}
  };

  /* --- keep tab synced with URL --- */
  useEffect(() => {
    const isGroups = isGroupRoute(location.pathname);
    setActiveTab(isGroups ? "groups" : "chats");
    if (isGroups) {
      // Force-clear any latched DM when on /g (even /g with no id)
      clearDMEverywhere();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  /* ---------- sockets: 1:1 previews ---------- */
  const requestLastForPeer = (peerId) => {
    if (!socket || !peerId) return;
    socket.emit("msgPage", peerId);
  };

  useEffect(() => {
    if (!socket || !user?._id) return;
    socket.emit("side", user._id);

    const onConv = (data) => {
      const updated = (data || []).map((conv) => {
        const youAreSender = String(conv?.sender?._id) === String(user._id);
        const peer = youAreSender ? conv.receiver : conv.sender;
        return { ...conv, userDetails: peer, unseenMsg: conv.unseen };
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
        next.forEach((c) => {
          const pid = c?.userDetails?._id;
          if (pid && !lastPreviewMap[pid]) requestLastForPeer(pid);
        });
        return next;
      });
    };

    const onTyping = ({ from, to, isTyping }) => {
      if (!from || String(to) !== String(user._id)) return;
      setTypingMap((m) =>
        isTyping ? { ...m, [from]: Date.now() } : { ...m, [from]: 0 }
      );
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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, user?._id, lastPreviewMap]);

  /* ---------- groups load + enrichment ---------- */
  const fetchGroupLastMessage = async (groupId) => {
    const tryGet = async (urlBuilder) => {
      try {
        const res = await http.get(urlBuilder(groupId));
        return res?.data || null;
      } catch {
        return null;
      }
    };

    let data =
      (await tryGet((id) => `/api/groups/${id}/last`)) ||
      (await tryGet((id) => `/api/groups/${id}/messages?limit=1`)) ||
      (await tryGet((id) => `/api/messages?groupId=${id}&limit=1`)) ||
      (await tryGet((id) => `/api/messages/group/${id}?limit=1`));

    if (!data) return null;

    const msg =
      data.message ||
      (Array.isArray(data.messages) && data.messages[0]) ||
      data.lastMessage ||
      data.result ||
      null;

    return msg || null;
  };

  const loadGroups = async () => {
    try {
      setGroupsLoading(true);
      const { data } = await http.get("/api/groups");
      const list = data?.groups || [];

      let next = list.map((g) => ({
        ...g,
        preview: extractGroupPreviewFromList(g, user?._id),
      }));

      setGroups((prev) => {
        const byId = new Map(prev.map((g) => [g._id, g]));
        return next.map((g) => {
          const local = byId.get(g._id);
          return {
            ...g,
            isPinned: local?.isPinned ?? g.isPinned,
            isArchived: local?.isArchived ?? g.isArchived,
            isMuted: local?.isMuted ?? g.isMuted,
          };
        });
      });

      const need = next.filter((g) => {
        const p = g.preview || {};
        const lastIsObject =
          typeof g?.lastMessage === "object" && g?.lastMessage;
        return (!p.text && (p.kind === "none" || p.kind === "text")) || !lastIsObject;
      });

      if (need.length) {
        const results = await Promise.allSettled(
          need.map(async (g) => {
            let detail = null;
            try {
              const res = await http.get(`/api/groups/${g._id}`);
              detail = res?.data?.group || res?.data || null;
            } catch {}

            let last =
              (detail &&
                typeof detail.lastMessage === "object" &&
                detail.lastMessage) ||
              (detail &&
                Array.isArray(detail.messages) &&
                detail.messages[detail.messages.length - 1]) ||
              null;

            if (!last) last = await fetchGroupLastMessage(g._id);

            return { id: g._id, detail, last };
          })
        );

        setGroups((curr) => {
          const by = new Map(curr.map((g) => [g._id, g]));
          results.forEach((r) => {
            if (r.status !== "fulfilled") return;
            const { id, last, detail } = r.value || {};
            const old = by.get(id);
            const preview = buildPreviewFromMsg(
              last,
              (detail && (detail.updatedAt || detail.createdAt)) ||
                old?.updatedAt ||
                old?.createdAt,
              user?._id
            );
            by.set(id, { ...old, preview });
          });
          return Array.from(by.values());
        });
      }
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load groups");
    } finally {
      setGroupsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "groups" && groups.length === 0) loadGroups();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab, user?._id]);

  /* ---------- unread badges ---------- */
  useEffect(() => {
    if (!socket || !user?._id) return;

    const bump = (gid, fromId) => {
      if (!gid) return;
      if (fromId && String(fromId) === String(user._id)) return;
      if (location.pathname === `/g/${gid}`) return;
      setGroupUnread((prev) => ({ ...prev, [gid]: (prev?.[gid] || 0) + 1 }));
    };

    const onReceiveSingle = (m) => {
      const gid =
        String(m?.groupId || m?.group || m?.group_id || m?.groupID || "");
      const from =
        String(m?.msgByUser?._id || m?.msgByUser || m?.sender || "");
      bump(gid, from);
    };

    const onReceiveBatch = (payload) => {
      const gid = String(payload?.groupId || "");
      const list = Array.isArray(payload?.messages) ? payload.messages : [];
      for (const m of list) {
        const from =
          String(m?.msgByUser?._id || m?.msgByUser || m?.sender || "");
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

  useEffect(() => {
    const m = location.pathname.match(/^\/g\/([a-f0-9]{24})$/i);
    if (!m) return;
    const gid = m[1];
    setGroupUnread((prev) => ({ ...prev, [gid]: 0 }));
    socket?.emit("seenGroup", { groupId: gid, userId: user?._id });
  }, [location.pathname, setGroupUnread, socket, user?._id]);

  /* close menus on outside click */
  useEffect(() => {
    const onDocClick = (e) => {
      if (chatMenuRef.current && !chatMenuRef.current.contains(e.target))
        setChatMenuOpen(null);
      if (groupMenuRef.current && !groupMenuRef.current.contains(e.target))
        setGroupMenuOpen(null);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const handleLogout = () => {
    setUser(null);
    navigate("/login");
  };

  const highlightText = (text, query) => {
    if (!query) return text;
    const safe = query.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const regex = new RegExp(`(${safe})`, "gi");
    return String(text)
      .split(regex)
      .map((part, i) =>
        regex.test(part) ? (
          <span
            key={i}
            className="bg-emerald-300/30 text-emerald-200 px-0.5 rounded"
          >
            {part}
          </span>
        ) : (
          part
        )
      );
  };

  /* ---------- chats filtering/sorting ---------- */
  const getLastActive = (c) => {
    const pid = c?.userDetails?._id;
    const p = pid ? lastPreviewMap[pid] : null;
    const t = p?.time || c?.updatedAt || c?.createdAt || 0;
    return new Date(t).getTime() || 0;
  };

  const filteredChats = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return allUsers;
    return allUsers.filter((c) =>
      (c?.userDetails?.name || "").toLowerCase().includes(q)
    );
  }, [allUsers, search]);

  const archivedChats = useMemo(
    () => filteredChats.filter((c) => c?.isArchived),
    [filteredChats]
  );
  const notArchivedChats = useMemo(
    () => filteredChats.filter((c) => !c?.isArchived),
    [filteredChats]
  );

  const notArchivedChatsSorted = useMemo(() => {
    const arr = [...notArchivedChats];
    arr.sort((a, b) => {
      if (a?.isPinned && !b?.isPinned) return -1;
      if (!a?.isPinned && b?.isPinned) return 1;
      return getLastActive(b) - getLastActive(a);
    });
    return arr;
  }, [notArchivedChats, lastPreviewMap]);

  const pinnedChats = useMemo(
    () => notArchivedChatsSorted.filter((c) => c?.isPinned),
    [notArchivedChatsSorted]
  );
  const regularChats = useMemo(
    () => notArchivedChatsSorted.filter((c) => !c?.isPinned),
    [notArchivedChatsSorted]
  );

  /* ---------- groups filtering/sorting ---------- */
  const filteredGroups = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return groups;
    return groups.filter((g) => (g?.name || "").toLowerCase().includes(q));
  }, [groups, search]);

  const archivedGroups = useMemo(
    () => filteredGroups.filter((g) => g?.isArchived),
    [filteredGroups]
  );
  const notArchivedGroups = useMemo(
    () => filteredGroups.filter((g) => !g?.isArchived),
    [filteredGroups]
  );

  const groupsLastActive = (g) =>
    new Date(g?.preview?.time || g?.updatedAt || g?.createdAt || 0).getTime() ||
    0;

  const notArchivedGroupsSorted = useMemo(() => {
    const arr = [...notArchivedGroups];
    arr.sort((a, b) => {
      if (a?.isPinned && !b?.isPinned) return -1;
      if (!a?.isPinned && b?.isPinned) return 1;
      return groupsLastActive(b) - groupsLastActive(a);
    });
    return arr;
  }, [notArchivedGroups]);

  const pinnedGroups = useMemo(
    () => notArchivedGroupsSorted.filter((g) => g?.isPinned),
    [notArchivedGroupsSorted]
  );
  const regularGroups = useMemo(
    () => notArchivedGroupsSorted.filter((g) => !g?.isPinned),
    [notArchivedGroupsSorted]
  );

  /* ---------- actions: chats & groups ---------- */
  const chatActionLabels = {
    mute: {
      loading: "Muting chat…",
      successOn: "Chat muted",
      successOff: "Chat unmuted",
      error: "Failed to mute chat",
    },
    archive: {
      loading: "Archiving chat…",
      successOn: "Chat archived",
      successOff: "Chat unarchived",
      error: "Failed to archive chat",
    },
    pin: {
      loading: "Pinning chat…",
      successOn: "Chat pinned",
      successOff: "Chat unpinned",
      error: "Failed to pin chat",
    },
    delete: {
      loading: "Deleting chat…",
      successOn: "Chat deleted",
      error: "Failed to delete chat",
    },
  };

  const handleChatAction = async (chatId, action) => {
    const prev = allUsers;
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
          if (action === "mute")
            return res?.data?.isMuted ? labels.successOn : labels.successOff;
          if (action === "archive")
            return res?.data?.isArchived
              ? labels.successOn
              : labels.successOff;
          if (action === "pin")
            return res?.data?.isPinned ? labels.successOn : labels.successOff;
          return "Done";
        },
        error: (err) => {
          setAllUsers(prev);
          return (
            err?.response?.data?.message ||
            labels.error ||
            "Something went wrong"
          );
        },
      },
      {
        success: { duration: 2000 },
        error: { duration: 2200 },
        loading: { duration: 100000 },
      }
    );
    setChatMenuOpen(null);
  };

  const groupActionLabels = {
    mute: {
      loading: "Muting group…",
      successOn: "Group muted",
      successOff: "Group unmuted",
      error: "Failed to mute group",
    },
    archive: {
      loading: "Archiving group…",
      successOn: "Group archived",
      successOff: "Group unarchived",
      error: "Failed to archive group",
    },
    pin: {
      loading: "Pinning group…",
      successOn: "Group pinned",
      successOff: "Group unpinned",
      error: "Failed to pin group",
    },
    delete: {
      loading: "Deleting group…",
      successOn: "Group deleted",
      error: "Failed to delete group",
    },
  };

  const openArchivedIfArchiving = (action, wasArchived) => {
    if (action === "archive" && !wasArchived) setShowArchivedGroups(true);
  };

  const handleGroupAction = async (groupId, action) => {
    const prev = groups;
    const before = groups.find((g) => g._id === groupId);
    const wasArchived = !!before?.isArchived;

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
      openArchivedIfArchiving(action, wasArchived);
    }

    const req =
      action === "delete"
        ? http.delete(`/api/groups/delete`, { data: { groupId } })
        : http.put(`/api/groups/${groupId}/${action}`, {});
    const labels = groupActionLabels[action];

    await toast.promise(
      req,
      {
        loading: labels.loading,
        success: (res) =>
          action === "delete" ? labels.successOn : res?.data?.message || "Done",
        error: (err) => {
          setGroups(prev);
          return (
            err?.response?.data?.message ||
            labels.error ||
            "Something went wrong"
          );
        },
      },
      {
        success: { duration: 2000 },
        error: { duration: 2200 },
        loading: { duration: 100000 },
      }
    );
    setGroupMenuOpen(null);
  };

  /* ---------- rows ---------- */
  const ChatRow = ({ conv }) => {
    const pid = conv?.userDetails?._id;
    const last = pid ? lastPreviewMap[pid] : null;
    const isTypingActive =
      typingMap[pid] && Date.now() - typingMap[pid] < 3500;

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

    return (
      <div
        className="relative flex items-center gap-3 px-4 py-3 border-b border-zinc-900/60 hover:bg-zinc-900/50 cursor-pointer"
        onClick={() => {
          navigate(`/${pid}`);
          // explicitly select DM
          onSelectChat?.(conv.userDetails);
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          setChatMenuOpen(chatMenuOpen === conv._id ? null : conv._id);
        }}
      >
        <Avatar
          imageUrl={conv?.userDetails?.profilePic}
          name={conv?.userDetails?.name}
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <h3 className="text-zinc-200 font-medium truncate">
              {highlightText(conv?.userDetails?.name, search)}
            </h3>
            {conv?.isPinned && (
              <Pin size={14} className="text-emerald-400/70 shrink-0" />
            )}
            {conv?.isMuted && (
              <BellOff size={14} className="text-zinc-500 shrink-0" />
            )}
            {conv?.isArchived && (
              <Archive size={14} className="text-zinc-500 shrink-0" />
            )}
          </div>
          <div className="text-xs text-zinc-500 flex items-center gap-2 min-w-0">
            <div className="flex items-center gap-1 min-w-0 truncate">
              {preview}
            </div>
          </div>
        </div>
        <div className="text-right pl-2">
          <div className="text-[10px] text-zinc-500">
            {last?.time ? fmtTime(last.time) : ""}
          </div>
          {!!conv?.unseenMsg && (
            <div className="mt-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-emerald-600 text-[10px] text-white">
              {conv?.unseenMsg}
            </div>
          )}
        </div>

        <div className="ml-2 relative z-50" ref={chatMenuRef}>
          <button
            className="p-1 rounded hover:bg-zinc-800/70"
            onClick={(e) => {
              e.stopPropagation();
              setChatMenuOpen(chatMenuOpen === conv._id ? null : conv._id);
            }}
          >
            <EllipsisVertical className="text-zinc-400 hover:text-zinc-200" />
          </button>

          {chatMenuOpen === conv._id && (
            <div
              className="absolute right-0 mt-2 bg-[#0e1216] rounded-lg shadow-xl border border-zinc-800 text-sm w-40 py-1"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="block w-full text-left px-4 py-2 hover:bg-zinc-800"
                onClick={() => handleChatAction(conv._id, "mute")}
              >
                {conv.isMuted ? "Unmute" : "Mute"}
              </button>
              <button
                className="block w-full text-left px-4 py-2 hover:bg-zinc-800"
                onClick={() => handleChatAction(conv._id, "archive")}
              >
                {conv.isArchived ? "Unarchive" : "Archive"}
              </button>
              <button
                className="block w-full text-left px-4 py-2 hover:bg-zinc-800"
                onClick={() => handleChatAction(conv._id, "pin")}
              >
                {conv.isPinned ? "Unpin" : "Pin"}
              </button>
              <button
                className="block w-full text-left px-4 py-2 hover:bg-red-600/20 text-red-300"
                onClick={() => handleChatAction(conv._id, "delete")}
              >
                Delete
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
    const lastTime =
      g.lastMessageAt || g.preview?.time || g.updatedAt || g.createdAt;

    const senderId = g.lastMessageSenderId || g.preview?.senderId || null;
    const senderName =
      g.lastMessageSenderName || g.preview?.senderName || g.preview?.prefix || "";

    const isYou =
      senderId && user?._id && String(senderId) === String(user._id);
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
        key={g._id}
        className="relative w-full text-left px-4 py-3 border-b border-zinc-900/60 hover:bg-zinc-900/50 transition flex items-center gap-3"
        onClick={() => {
          navigate(`/g/${g._id}`);
          setGroupUnread((prev) => ({ ...prev, [g._id]: 0 }));
          socket?.emit("seenGroup", { groupId: g._id, userId: user?._id });
          // safety: also clear any DM
          clearDMEverywhere();
        }}
        onContextMenu={(e) => {
          e.preventDefault();
          setGroupMenuOpen(groupMenuOpen === g._id ? null : g._id);
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
            {g?.isPinned && (
              <Pin size={14} className="text-emerald-400/70 shrink-0" />
            )}
            {g?.isMuted && (
              <BellOff size={14} className="text-zinc-500 shrink-0" />
            )}
            {g?.isArchived && (
              <Archive size={14} className="text-zinc-500 shrink-0" />
            )}
          </div>
          <div className="text-xs text-zinc-500 flex items-center gap-2 min-w-0">
            <div className="flex items-center gap-1 min-w-0 truncate">
              {prefix ? (
                <span className="text-zinc-400">{prefix}:</span>
              ) : null}{" "}
              {body}
            </div>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-zinc-500">
            {lastTime ? fmtTime(lastTime) : ""}
          </div>
          {count > 0 && (
            <div className="mt-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-emerald-600 text-[10px] text-white">
              {count}
            </div>
          )}
        </div>

        <div className="ml-2 relative z-50" ref={groupMenuRef}>
          <button
            className="p-1 rounded hover:bg-zinc-800/70"
            onClick={(e) => {
              e.stopPropagation();
              setGroupMenuOpen(groupMenuOpen === g._id ? null : g._id);
            }}
          >
            <EllipsisVertical className="text-zinc-400 hover:text-zinc-200" />
          </button>

          {groupMenuOpen === g._id && (
            <div
              className="absolute right-0 mt-2 bg-[#0e1216] rounded-lg shadow-xl border border-zinc-800 text-sm w-44 py-1"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                className="block w-full text-left px-4 py-2 hover:bg-zinc-800"
                onClick={() => handleGroupAction(g._id, "mute")}
              >
                {g.isMuted ? "Unmute group" : "Mute group"}
              </button>
              <button
                className="block w-full text-left px-4 py-2 hover:bg-zinc-800"
                onClick={() => handleGroupAction(g._id, "archive")}
              >
                {g.isArchived ? "Unarchive group" : "Archive group"}
              </button>
              <button
                className="block w-full text-left px-4 py-2 hover:bg-zinc-800"
                onClick={() => handleGroupAction(g._id, "pin")}
              >
                {g.isPinned ? "Unpin group" : "Pin group"}
              </button>
              <button
                className="block w-full text-left px-4 py-2 hover:bg-red-600/20 text-red-300"
                onClick={() => handleGroupAction(g._id, "delete")}
              >
                <span className="inline-flex items-center gap-2">
                  <Trash2 size={14} /> Delete group
                </span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

 

  /* ---------- render ---------- */
  return (
    <div className="w-full h-full grid grid-cols-[64px,1fr] bg-[#0a0f14] text-zinc-100">
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 2000,
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

      {/* Left bar */}
      <div className="bg-[#0b1016] border-r border-zinc-800/70 h-full py-5 flex flex-col items-center justify-between">
        <div className="space-y-2">
          {/* Chats → navigate to "/" */}
          <div
            title="Chats"
            className="w-12 h-12 grid place-items-center cursor-pointer text-zinc-300 hover:text-emerald-400 rounded-lg hover:bg-emerald-500/10 transition"
            onClick={() => {
              setActiveTab("chats");
              navigate("/");
            }}
          >
            <MessageCircle size={20} />
          </div>

          <div
            title="Add friend"
            onClick={() => setOpenSearchUser(true)}
            className="w-12 h-12 grid place-items-center cursor-pointer text-zinc-300 hover:text-emerald-400 rounded-lg hover:bg-emerald-500/10 transition"
          >
            <UserPlus size={20} />
          </div>

          {/* Groups → navigate to "/g" */}
          <div
            title="Groups"
            onClick={() => {
              setActiveTab("groups");
              onSelectChat?.(null);
              navigate("/g");
            }}
            className="w-12 h-12 grid place-items-center cursor-pointer text-zinc-300 hover:text-emerald-400 rounded-lg hover:bg-emerald-500/10 transition"
          >
            <Users size={20} />
          </div>
        </div>

        <div className="flex flex-col items-center gap-2">
          <button onClick={() => setEditProfile(true)}>
            <Avatar
              imageUrl={user?.profilePic}
              name={user?.name}
              userId={user?._id}
            />
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
          <EllipsisVertical size={18} className="text-zinc-300" />
        </div>

        {/* Search + Tabs */}
        <div className="px-4 py-3 border-b border-zinc-800/70">
          <div className="flex items-center gap-2 rounded-xl px-3 py-2 border border-zinc-700/60 bg-[#0f1419]">
            <Search size={16} className="text-zinc-500" />
            <input
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

        {/* Archived (Chats) */}
        {activeTab === "chats" && archivedChats.length > 0 && (
          <button
            className="w-full flex items-center justify-between px-4 py-2 text-zinc-300 hover:bg-zinc-900/60 border-b border-zinc-900/60"
            onClick={() => setShowArchivedChats((s) => !s)}
          >
            <div className="flex items-center gap-3">
              <Archive size={18} className="text-zinc-300" />
              <span>Archived</span>
              <span className="text-xs opacity-70">({archivedChats.length})</span>
            </div>
            {showArchivedChats ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
          </button>
        )}
        {activeTab === "chats" && showArchivedChats && archivedChats.length > 0 && (
          <div className="divide-y divide-zinc-900/60">
            {archivedChats.map((c) => (
              <ChatRow key={c?._id} conv={c} />
            ))}
          </div>
        )}

        {/* Lists */}
        <div className="h-[calc(100vh-230px)] overflow-x-hidden overflow-y-auto pb-6">
          {activeTab === "chats" ? (
            <>
              {pinnedChats.length > 0 && (
                <div className="px-4 pt-4 pb-2 text-xs uppercase tracking-wider text-zinc-500">
                  Pinned
                </div>
              )}
              <div className="divide-y divide-zinc-900/60">
                {pinnedChats.map((c) => (
                  <ChatRow key={c?._id} conv={c} />
                ))}
              </div>

              {pinnedChats.length > 0 && regularChats.length > 0 && (
                <div className="px-4 pt-4 pb-2 text-xs uppercase tracking-wider text-zinc-500">
                  Chats
                </div>
              )}
              {regularChats.length > 0 ? (
                <div className="divide-y divide-zinc-900/60">
                  {regularChats.map((c) => (
                    <ChatRow key={c?._id} conv={c} />
                  ))}
                </div>
              ) : pinnedChats.length === 0 && archivedChats.length === 0 ? (
                <div className="mt-12 text-center text-zinc-400">
                  <ArrowUpLeft size={50} className="mx-auto text-zinc-600" />
                  <p className="text-lg">No chats found</p>
                </div>
              ) : null}
            </>
          ) : (
            <>
              {archivedGroups.length > 0 && (
                <button
                  className="w-full flex items-center justify-between px-4 py-2 text-zinc-300 hover:bg-zinc-900/60 border-y border-zinc-900/60"
                  onClick={() => setShowArchivedGroups((s) => !s)}
                >
                  <div className="flex items-center gap-3">
                    <Archive size={18} className="text-zinc-300" />
                    <span>Archived</span>
                    <span className="text-xs opacity-70">({archivedGroups.length})</span>
                  </div>
                  {showArchivedGroups ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                </button>
              )}

              {showArchivedGroups && archivedGroups.length > 0 && (
                <div className="divide-y divide-zinc-900/60">
                  {archivedGroups.map((g) => (
                    <GroupRow key={g._id} g={g} />
                  ))}
                </div>
              )}

              {groupsLoading && <p className="p-4 text-zinc-400">Loading…</p>}
              {!groupsLoading && filteredGroups.length === 0 && (
                <p className="p-4 text-zinc-500">No groups yet</p>
              )}

              {pinnedGroups.length > 0 && (
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
            </>
          )}
        </div>
      </div>

      {openSearchUser && <AddUser setOpenSearchUser={setOpenSearchUser} />}
      {editProfile && (
        <EditProfile setEditProfile={setEditProfile} user={user} setUser={setUser} />
      )}
    </div>
  );
};

export default Side;
