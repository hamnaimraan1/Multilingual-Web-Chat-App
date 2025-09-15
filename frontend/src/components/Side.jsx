
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
//   Trash2,
//   ChevronDown,
//   ChevronRight,
// } from "lucide-react";
// import Avatar from "./Avatar";
// import { useLocalStorage } from "@mantine/hooks";
// import { useNavigate, useLocation } from "react-router-dom";
// import AddUser from "./AddUser";
// import EditProfile from "./EditProfile";
// import http from "../utils/http";
// import toast, { Toaster } from "react-hot-toast";

// /* ---------- constants & helpers ---------- */
// const CHAT_API_BASE = "/api/chat"; // goes through http (with auth)

// const fmtTime = (d) => {
//   try {
//     const date = new Date(d);
//     return isNaN(date) ? "" : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
//   } catch {
//     return "";
//   }
// };
// const isOfficeOrPdf = (name = "") => /\.(pdf|docx?|pptx?|xlsx|csv|txt)(\?|$)/i.test(name);
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
//   if (!m)
//     return { text: "", kind: "none", time: fallbackTime || "", senderId: null, senderName: "", prefix: "" };
//   const n = normalizeMessage(m);
//   const text = n?.message || n?.text || n?.content || n?.caption || "";
//   const kind = n?.messageType || "text";
//   const time = n?.createdAt || fallbackTime || "";
//   const senderId = n?._senderId || null;
//   const senderName = n?._senderName || "";
//   const prefix =
//     senderId && currentUserId && String(senderId) === String(currentUserId) ? "You" : senderName || "";
//   return { text, kind, time, senderId, senderName, prefix };
// };

// const extractGroupPreviewFromList = (g, currentUserId) => {
//   const lm = typeof g?.lastMessage === "object" ? g.lastMessage : null;
//   if (lm) return buildPreviewFromMsg(lm, g?.updatedAt || g?.createdAt, currentUserId);

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
//       senderId && currentUserId && String(senderId) === String(currentUserId) ? "You" : senderName || "";
//     return { text: g?.lastMessageText || "", kind, time, senderId, senderName, prefix };
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

// const isGroupRoute = (p) => /^\/g(?:\/|$)/i.test(p);

// /* ---------- Membership tri-state: yes / no / unknown ---------- */
// const asId = (x) => (x && typeof x === "object" ? x._id || x.id : x);
// const toIdSet = (arr) => {
//   const s = new Set();
//   (arr || []).forEach((x) => {
//     const v = asId(x);
//     if (v) s.add(String(v));
//   });
//   return s;
// };

// /**
//  * Quick check from the *list* or *detail* payload.
//  * Returns: "yes" | "no" | "unknown"
//  */
// // const membershipFromList = (g, userId) => {
// //   if (!g || !userId) return "unknown";
// //   const me = String(userId);

// //   // Explicit boolean from server (if present)
// //   if (typeof g.isMember === "boolean") return g.isMember ? "yes" : "no";

// //   // Owner / Admin implies member
// //   const ownerId = asId(g.owner) || asId(g.ownerId);
// //   if (ownerId && String(ownerId) === me) return "yes";

// //   const admins = toIdSet(g.admins || g.adminIds);
// //   if (admins.has(me)) return "yes";

// //   // Common fields
// //   const sets = [
// //     toIdSet(g.members),
// //     toIdSet(g.memberIds),
// //     toIdSet(g.participants),
// //     toIdSet(g.userIds),
// //     toIdSet(g.users),
// //     toIdSet(g.currentMembers),
// //   ];
// //   if (sets.some((S) => S.has(me))) return "yes";

// //   // Membership objects with status/role (if present)
// //   if (Array.isArray(g.memberships || g.memberList || g.membership)) {
// //     const arr = g.memberships || g.memberList || g.membership;
// //     let sawSelf = false;
// //     for (const m of arr) {
// //       const mid = String(asId(m?.user) || m?.userId || m?._id || "");
// //       if (mid !== me) continue;
// //       sawSelf = true;
// //       const status = String(m?.status || m?.state || "").toLowerCase();
// //       const role = String(m?.role || "").toLowerCase();
// //       if (/(left|removed|banned|blocked|past|former)/.test(status) || role === "past") return "no";
// //       return "yes";
// //     }
// //     // If list of memberships is present but self is absent, likely not a member
// //     if (arr.length > 0) return "no";
// //   }

// //   // Unclear from payload
// //   return "unknown";
// // };
// /**
//  * Decide membership from LIST or DETAIL payloads.
//  * Returns: "yes" | "no" | "unknown"
//  */
// const membershipFromList = (g, userId) => {
//   if (!g || !userId) return "unknown";
//   const me = String(userId);

//   const asId = (x) => (x && typeof x === "object" ? x._id || x.id : x);
//   const toIdSet = (arr) => {
//     const s = new Set();
//     (arr || []).forEach((x) => {
//       const v = asId(x);
//       if (v) s.add(String(v));
//     });
//     return s;
//   };

//   // 0) Explicit boolean from API
//   if (typeof g.isMember === "boolean") return g.isMember ? "yes" : "no";

//   // 1) Creator / Owner synonyms
//   const creatorLike =
//     asId(g.owner) ||
//     asId(g.ownerId) ||
//     asId(g.createdBy) ||
//     asId(g.createdById) ||
//     asId(g.creator) ||
//     asId(g.creatorId);
//   if (creatorLike && String(creatorLike) === me) return "yes";

//   // 2) Admin/Moderator synonyms
//   const adminSets = [
//     toIdSet(g.admins),
//     toIdSet(g.adminIds),
//     toIdSet(g.admin),
//     toIdSet(g.adminId),
//     toIdSet(g.groupAdmins),
//     toIdSet(g.groupAdminIds),
//     toIdSet(g.moderators),
//     toIdSet(g.moderatorIds),
//   ];
//   if (adminSets.some((S) => S.has(me))) return "yes";

//   // 3) Member/Participant synonyms
//   const memberSets = [
//     toIdSet(g.members),
//     toIdSet(g.memberIds),
//     toIdSet(g.participants),
//     toIdSet(g.participantIds),
//     toIdSet(g.userIds),
//     toIdSet(g.users),
//     toIdSet(g.currentMembers),
//   ];
//   if (memberSets.some((S) => S.has(me))) return "yes";

//   // 4) Role/status object lists
//   const objLists =
//     g.memberships || g.memberList || g.membership || g.roles || g.userRoles || g.participantMeta;
//   if (Array.isArray(objLists)) {
//     let sawAny = false;
//     for (const m of objLists) {
//       const mid = String(asId(m?.user) || m?.userId || m?._id || "");
//       if (!mid) { sawAny = true; continue; }
//       if (mid !== me) { sawAny = true; continue; }
//       const role = String(m?.role || m?.type || m?.kind || "").toLowerCase();
//       const status = String(m?.status || m?.state || "").toLowerCase();
//       if (/(left|removed|banned|blocked|past|former|revoked|declined)/.test(status)) return "no";
//       if (/(owner|creator|admin|moderator|member|participant)/.test(role) || !role) return "yes";
//     }
//     // If we saw a list but never saw myself, it's likely "no"
//     if (sawAny) return "no";
//   }

//   // 5) Sometimes API returns a singular userRole on the group
//   const userRole = String(g.userRole || g.myRole || "").toLowerCase();
//   if (/(owner|creator|admin|moderator|member|participant)/.test(userRole)) return "yes";
//   if (/(past|former|removed|left|banned|blocked)/.test(userRole)) return "no";

//   return "unknown";
// };


// /* =============================== Component =============================== */
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

//   /* tab */
//   const [activeTab, setActiveTab] = useState("groups");

//   /* chats state */
//   const [allUsers, setAllUsers] = useState([]);
//   const [typingMap, setTypingMap] = useState({});
//   const [lastPreviewMap, setLastPreviewMap] = useState({});

//   /* groups state */
//   const [groups, setGroups] = useState([]);
//   const [groupsLoading, setGroupsLoading] = useState(false);

//   /* unread (groups) */
//   const [groupUnread, setGroupUnread] = useLocalStorage({ key: "groupUnread", defaultValue: {} });

//   /* ui */
//   const [search, setSearch] = useState("");
//   const [chatMenuOpen, setChatMenuOpen] = useState(null); // chatId
//   const [groupMenuOpen, setGroupMenuOpen] = useState(null); // groupId
//   const [showArchivedChats, setShowArchivedChats] = useState(true);
//   const [showArchivedGroups, setShowArchivedGroups] = useState(true);

//   const chatMenuRef = useRef(null);
//   const groupMenuRef = useRef(null);
//   const searchInputRef = useRef(null);

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
//     try {
//       window.dispatchEvent(new CustomEvent("active-thread:clear"));
//     } catch {}
//   };

//   /* sync tab with URL */
//   useEffect(() => {
//     const isGroups = isGroupRoute(location.pathname);
//     setActiveTab(isGroups ? "groups" : "chats");
//     if (isGroups) clearDMEverywhere();
//   }, [location.pathname]);

//   /* sockets: ask for last message for a peer */
//   const requestLastForPeer = (peerId) => {
//     if (!socket || !peerId) return;
//     socket.emit("msgPage", peerId);
//   };

//   /* conversations feed via socket */
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
//           isPinned: !!conv.isPinned,
//           isArchived: !!conv.isArchived,
//           isMuted: !!conv.isMuted,
//         };
//       });

//       setAllUsers((prev) => {
//         const prevById = new Map(prev.map((c) => [c._id, c]));
//         const next = updated.map((c) => {
//           const local = prevById.get(c._id);
//           return local
//             ? {
//                 ...c,
//                 isMuted: c.isMuted ?? local.isMuted,
//                 isPinned: c.isPinned ?? local.isPinned,
//                 isArchived: c.isArchived ?? local.isArchived,
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

//   /* ---------- groups load (REST) — verify-first & fail-closed ---------- */
//   const loadGroups = async () => {
//     try {
//       setGroupsLoading(true);

//       const { data } = await http.get("/api/groups");
//       const raw = Array.isArray(data?.groups) ? data.groups : [];

//       const normalized = raw.map((g) => {
//         const isPinned = g.isPinned ?? g.pinned ?? false;
//         const isMuted = g.isMuted ?? g.muted ?? false;
//         const isArchived = g.isArchived ?? g.archived ?? false;
//         return {
//           ...g,
//           preview: extractGroupPreviewFromList(g, user?._id),
//           isPinned: !!isPinned,
//           isMuted: !!isMuted,
//           isArchived: !!isArchived,
//         };
//       });

//       // Decide membership for each group.
//       const decisions = await Promise.all(
//         normalized.map(async (g) => {
//           const hint = membershipFromList(g, user?._id);
//           if (hint === "yes") return { ...g, isMember: true };
//           if (hint === "no") return { ...g, isMember: false };

//           // Unknown => fetch details to verify; treat failures/ambiguity as not a member (fail-closed).
//           try {
//             const { data: det } = await http.get(`/api/groups/${g._id}`);
//             const full = det?.group || det || {};
//             const finalHint = membershipFromList(full, user?._id);
//             return { ...g, isMember: finalHint === "yes" };
//           } catch {
//             // return { ...g, isMember: false };
//             const iAmCreatorOrAdmin =
//     String(
//       (g.owner && (g.owner._id || g.owner.id || g.owner)) ||
//       g.ownerId || g.createdBy || g.createdById || g.creator || g.creatorId || ""
//     ) === String(user?._id || "") ||
//     membershipFromList({ groupAdmins: g.groupAdmins, adminIds: g.adminIds, admins: g.admins }, user?._id) === "yes";

//   return { ...g, isMember: iAmCreatorOrAdmin };
//           }
//         })
//       );

//    // Always include groups you created or admin
//  const mine = decisions.filter((g) => {
//    if (g.isMember) return true;
//    const me = String(user?._id || "");
//    const ownerId = String(g.owner?._id || g.owner || g.ownerId || g.createdBy || g.creator || "");
//    if (ownerId && ownerId === me) return true;
//  return false;
//  });
//  setGroups(mine);

//       // cleanup stray unread counters for groups not shown
//       setGroupUnread((prev) => {
//         const keep = new Set(mine.map((g) => String(g._id)));
//         const next = { ...prev };
//         Object.keys(next).forEach((gid) => {
//           if (!keep.has(String(gid))) delete next[gid];
//         });
//         return next;
//       });
//     } catch (err) {
//       toast.error(err?.response?.data?.message || "Failed to load groups");
//       setGroups([]); // fail-closed on error
//     } finally {
//       setGroupsLoading(false);
//     }
//   };

//   useEffect(() => {
//     if (activeTab === "groups") loadGroups();
//   }, [activeTab, location.pathname, location.search]);
// useEffect(() => {
//   // Accept optimistic updates from the group composer (or anywhere else)
//   const onCreated = (e) => {
//     const g = e?.detail?.group || e?.detail || null;
//     if (!g) return;

//     // Normalize like loadGroups does
//     const isPinned   = g.isPinned   ?? g.pinned   ?? false;
//     const isMuted    = g.isMuted    ?? g.muted    ?? false;
//     const isArchived = g.isArchived ?? g.archived ?? false;

//     const normalized = {
//       ...g,
//       preview: extractGroupPreviewFromList(g, user?._id),
//       isPinned: !!isPinned,
//       isMuted: !!isMuted,
//       isArchived: !!isArchived,
//       isMember: true, // creator is member
//     };

//     // Insert/update in current list immediately
//     setGroups((prev) => {
//       const id = String(g._id || "");
//       const idx = prev.findIndex((x) => String(x._id) === id);
//       if (idx === -1) return [normalized, ...prev];
//       const copy = [...prev];
//       copy[idx] = { ...copy[idx], ...normalized };
//       return copy;
//     });

//     // Clear unread counter for the new group (if any)
//     setGroupUnread((prev) => ({ ...prev, [g._id]: 0 }));

//     // Then do a full refresh so lastMessage/flags are accurate
//     loadGroups();
//   };

//   const onJoined = () => loadGroups();

//   // Custom DOM events you can dispatch from the create/join UI:
//   // window.dispatchEvent(new CustomEvent("group:created", { detail: { group } }))
//   // window.dispatchEvent(new CustomEvent("group:joined"))
//   window.addEventListener("group:created", onCreated);
//   window.addEventListener("group:joined", onJoined);

//   // If your backend emits socket events, listen too
//   try {
//     if (socket) {
//       const sockRefresh = () => loadGroups();
//       socket.on?.("group:created", sockRefresh);
//       socket.on?.("group:joined", sockRefresh);
//       socket.on?.("group:updated", sockRefresh);
//       return () => {
//         window.removeEventListener("group:created", onCreated);
//         window.removeEventListener("group:joined", onJoined);
//         socket.off?.("group:created", sockRefresh);
//         socket.off?.("group:joined", sockRefresh);
//         socket.off?.("group:updated", sockRefresh);
//       };
//     }
//   } catch {}

//   return () => {
//     window.removeEventListener("group:created", onCreated);
//     window.removeEventListener("group:joined", onJoined);
//   };
// }, [socket, user?._id]);

//   /* unread bumps for groups via socket (only for visible/verified groups) */
//   useEffect(() => {
//     if (!socket || !user?._id) return;

//     const bump = (gid, fromId) => {
//       if (!gid) return;
//       if (fromId && String(fromId) === String(user._id)) return;
//       if (location.pathname === `/g/${gid}`) return;

//       const isVisible = groups.some((g) => String(g._id) === String(gid));
//       if (!isVisible) return;

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
//   }, [socket, user?._id, location.pathname, groups]);

//   /* clear unread when viewing a member group */
//   useEffect(() => {
//     const m = location.pathname.match(/^\/g\/([a-f0-9]{24})$/i);
//     if (!m) return;
//     const gid = m[1];

//     if (groups.some((g) => String(g._id) === String(gid))) {
//       setGroupUnread((prev) => ({ ...prev, [gid]: 0 }));
//       socket?.emit("seenGroup", { groupId: gid, userId: user?._id });
//     }
//   }, [location.pathname, groups, setGroupUnread, socket, user?._id]);

//   /* close menus on outside click & Escape */
//   useEffect(() => {
//     const onDocClick = (e) => {
//       if (chatMenuRef.current && !chatMenuRef.current.contains(e.target)) setChatMenuOpen(null);
//       if (groupMenuRef.current && !groupMenuRef.current.contains(e.target)) setGroupMenuOpen(null);
//     };
//     const onEsc = (e) => {
//       if (e.key === "Escape") {
//         setChatMenuOpen(null);
//         setGroupMenuOpen(null);
//       }
//     };
//     document.addEventListener("click", onDocClick);
//     document.addEventListener("keydown", onEsc);
//     return () => {
//       document.removeEventListener("click", onDocClick);
//       document.removeEventListener("keydown", onEsc);
//     };
//   }, []);

//   const handleLogout = () => {
//     setUser(null);
//     navigate("/login");
//   };

//   /* ---------- filtering & sorting ---------- */
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

//   const pinnedChats = useMemo(
//     () => chatsNotArchivedSorted.filter((c) => c?.isPinned),
//     [chatsNotArchivedSorted]
//   );
//   const regularChats = useMemo(
//     () => chatsNotArchivedSorted.filter((c) => !c?.isPinned),
//     [chatsNotArchivedSorted]
//   );

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

//   const pinnedGroups = useMemo(
//     () => groupsNotArchivedSorted.filter((g) => g?.isPinned),
//     [groupsNotArchivedSorted]
//   );
//   const regularGroups = useMemo(
//     () => groupsNotArchivedSorted.filter((g) => !g?.isPinned),
//     [groupsNotArchivedSorted]
//   );

//   /* ---------- API actions (persisted) ---------- */
//   const refreshSidebar = () => {
//     try {
//       if (socket && user?._id) socket.emit("side", user._id);
//     } catch {}
//   };

//   const toggleChat = async (chatId, action, optimisticKey) => {
//     try {
//       const current = allUsers.find((c) => c._id === chatId);
//       const newVal = !current?.[optimisticKey];

//       setAllUsers((prev) =>
//         prev.map((c) => {
//           if (c._id !== chatId) return c;
//           const base = { ...c, [optimisticKey]: newVal };
//           if (action === "pin" && newVal) base.isArchived = false;
//           if (action === "archive" && newVal) base.isPinned = false;
//           return base;
//         })
//       );
//       setChatMenuOpen(null);

//       await http.put(`${CHAT_API_BASE}/${chatId}/${action}`);
//       toast.success(
//         `${newVal ? "" : "Un"}${action[0].toUpperCase()}${action.slice(1)}${action === "mute" ? "d" : ""}`
//       );

//       refreshSidebar();
//     } catch (e) {
//       refreshSidebar();
//       toast.error(e?.response?.data?.message || `Failed to ${action}`);
//     }
//   };

//   const deleteChat = async (chatId) => {
//     try {
//       setChatMenuOpen(null);
//       await http.delete(`${CHAT_API_BASE}/${chatId}/delete`);
//       setAllUsers((prev) => prev.filter((c) => c._id !== chatId));
//       try {
//         window.dispatchEvent(new CustomEvent("active-thread:clear"));
//       } catch {}
//       toast.success("Chat deleted");
//       refreshSidebar();
//     } catch (e) {
//       toast.error(e?.response?.data?.message || "Delete failed");
//     }
//   };

//   const toggleGroup = async (groupId, action, optimisticKey) => {
//     try {
//       const current = groups.find((g) => g._id === groupId);
//       const newVal = !current?.[optimisticKey];

//     setGroups((prev) =>
//         prev.map((g) => {
//           if (g._id !== groupId) return g;
//           const base = { ...g, [optimisticKey]: newVal };
//           if (action === "pin" && newVal) base.isArchived = false;
//           if (action === "archive" && newVal) base.isPinned = false;
//           return base;
//         })
//       );
//       setGroupMenuOpen(null);

//       const bodyKey = action === "pin" ? "pinned" : action === "archive" ? "archived" : "muted";
//       await http.put(`/api/groups/${groupId}/${action}`, { [bodyKey]: newVal });

//       toast.success(
//         `${newVal ? "" : "Un"}${action[0].toUpperCase()}${action.slice(1)}${action === "mute" ? "d" : ""}`
//       );

//       loadGroups();
//     } catch (e) {
//       loadGroups();
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
//         onClick={() => {
//           navigate(`/${pid}`);
//           onSelectChat?.(conv.userDetails);
//         }}
//         onContextMenu={(e) => {
//           e.preventDefault();
//           setChatMenuOpen(chatMenuOpen === conv._id ? null : conv._id);
//         }}
//       >
//         <Avatar imageUrl={conv?.userDetails?.profilePic} name={conv?.userDetails?.name} />
//         <div className="flex-1 min-w-0">
//           <div className="flex items-center gap-2 min-w-0">
//             <h3 className="text-zinc-200 font-medium truncate">
//               {highlightText(conv?.userDetails?.name, search)}
//             </h3>
//             {conv?.isPinned && <Pin size={14} className="text-emerald-400/70 shrink-0" title="Pinned" />}
//             {conv?.isMuted && <BellOff size={14} className="text-zinc-500 shrink-0" title="Muted" />}
//             {conv?.isArchived && <Archive size={14} className="text-zinc-500 shrink-0" title="Archived" />}
//           </div>
//           <div className="text-xs text-zinc-500 flex items-center gap-2 min-w-0">
//             <div className="flex items-center gap-1 min-w-0 truncate">
//               {Prefix}
//               {body}
//             </div>
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
//             aria-label="Chat menu"
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
//     const senderName =
//       g.lastMessageSenderName || g.preview?.senderName || g.preview?.prefix || "";
//     const isYou = senderId && user?._id && String(senderId) === String(user._id);
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
//         className="relative w-full text-left px-4 py-3 border-b border-zinc-900/60 hover:bg-zinc-900/50 transition flex items-center gap-3 cursor-pointer"
//         onClick={() => {
//           if (g.isMember === false) {
//             toast.error("You are not a member of this group");
//             return;
//           }
//           navigate(`/g/${g._id}`);
//           setGroupUnread((prev) => ({ ...prev, [g._id]: 0 }));
//           socket?.emit("seenGroup", { groupId: g._id, userId: user?._id });
//           clearDMEverywhere();
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
//             {g?.isPinned && <Pin size={14} className="text-emerald-400/70 shrink-0" title="Pinned" />}
//             {g?.isMuted && <BellOff size={14} className="text-zinc-500 shrink-0" title="Muted" />}
//             {g?.isArchived && <Archive size={14} className="text-zinc-500 shrink-0" title="Archived" />}
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
//             aria-label="Group menu"
//           >
//             <EllipsisVertical className="text-zinc-400 hover:text-zinc-200" />
//           </button>
//           {groupMenuOpen === g._id && (
//             <div className="absolute right-0 mt-2 w-44 rounded-lg border border-zinc-700 bg-[#0f1318] shadow-xl overflow-hidden">
//               <button
//                 className="w-full px-3 py-2 text-left text-sm hover:bg-zinc-800/60"
//                 onClick={() => navigate(`/g/${g._id}`)}
//               >
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
//     <div className="w-full h-full grid grid-cols-1 lg:grid-cols-[64px,1fr] bg-[#0a0f14] text-zinc-100">
//       <Toaster
//         position="top-center"
//         toastOptions={{
//           duration: 1800,
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
//       <div className="bg-[#0b1016] border-b lg:border-b-0 lg:border-r border-zinc-800/70 h-full py-4 lg:py-5 flex lg:flex-col items-center justify-between gap-3">
//         <div className="flex lg:flex-col items-center gap-2">
//           <button
//             title="Chats"
//             className={`w-12 h-12 grid place-items-center cursor-pointer rounded-lg transition ${
//               activeTab === "chats"
//                 ? "text-emerald-400 bg-emerald-500/10 ring-1 ring-emerald-500/30"
//                 : "text-zinc-300 hover:text-emerald-400 hover:bg-emerald-500/10"
//             }`}
//             onClick={() => {
//               setActiveTab("chats");
//               navigate("/");
//             }}
//           >
//             <MessageCircle size={20} />
//           </button>

//           <button
//             title="Add friend"
//             onClick={() => setOpenSearchUser(true)}
//             className="w-12 h-12 grid place-items-center cursor-pointer text-zinc-300 hover:text-emerald-400 rounded-lg hover:bg-emerald-500/10 transition"
//           >
//             <UserPlus size={20} />
//           </button>

//           <button
//             title="Groups"
//             onClick={() => {
//               setActiveTab("groups");
//               onSelectChat?.(null);
//               navigate("/g");
//             }}
//             className={`w-12 h-12 grid place-items-center cursor-pointer rounded-lg transition ${
//               activeTab === "groups"
//                 ? "text-emerald-400 bg-emerald-500/10 ring-1 ring-emerald-500/30"
//                 : "text-zinc-300 hover:text-emerald-400 hover:bg-emerald-500/10"
//             }`}
//           >
//             <Users size={20} />
//           </button>
//         </div>

//         {/* <div className="flex items-center gap-2 pr-3 lg:pr-0">
//        */}
//        <div className="flex flex-col items-center gap-2 pr-3 lg:pr-0">

//           <button onClick={() => setEditProfile(true)} className="shrink-0">
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
//                 try {
//                   window.dispatchEvent(new CustomEvent("group:new"));
//                 } catch {}
//               }}
//               className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm ring-1 ring-emerald-400/30 shadow-sm"
//             >
//               <Plus size={16} />
//               <span className="font-medium">New Group</span>
//             </button>
//           ) : (
//             <div className="opacity-0 select-none">
//               <EllipsisVertical size={18} />
//             </div>
//           )}
//         </div>

//         {/* Search + Tab toggles */}
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
//               onClick={() => {
//                 setActiveTab("chats");
//                 navigate("/");
//               }}
//             >
//               Chats
//             </button>
//             <button
//               className={`py-2 text-sm font-medium rounded-lg border ${
//                 activeTab === "groups"
//                   ? "text-emerald-400 border-emerald-500/40 bg-emerald-500/10"
//                   : "text-zinc-400 border-zinc-700/60 hover:bg-zinc-800/50"
//               }`}
//               onClick={() => {
//                 setActiveTab("groups");
//                 onSelectChat?.(null);
//                 navigate("/g");
//               }}
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
//                 {pinnedChats.map((c) => (
//                   <ChatRow key={c?._id} conv={c} />
//                 ))}
//               </div>

//               {/* Regular */}
//               {pinnedChats.length > 0 && regularChats.length > 0 && (
//                 <div className="px-4 pt-4 pb-2 text-xs uppercase tracking-wider text-zinc-500">Chats</div>
//               )}
//               {regularChats.length > 0 ? (
//                 <div className="divide-y divide-zinc-900/60">
//                   {regularChats.map((c) => (
//                     <ChatRow key={c?._id} conv={c} />
//                   ))}
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
//                       {chatsArchived.map((c) => (
//                         <ChatRow key={c?._id} conv={c} />
//                       ))}
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
//                       {groupsArchived.map((g) => (
//                         <GroupRow key={g._id} g={g} />
//                       ))}
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

/* ---------- Membership tri-state: yes / no / unknown ---------- */
const asId = (x) => (x && typeof x === "object" ? x._id || x.id : x);
const toIdSet = (arr) => {
  const s = new Set();
  (arr || []).forEach((x) => {
    const v = asId(x);
    if (v) s.add(String(v));
  });
  return s;
};

/**
 * Decide membership from LIST or DETAIL payloads.
 * Returns: "yes" | "no" | "unknown"
 */
const membershipFromList = (g, userId) => {
  if (!g || !userId) return "unknown";
  const me = String(userId);

  const asId = (x) => (x && typeof x === "object" ? x._id || x.id : x);
  const toIdSet = (arr) => {
    const s = new Set();
    (arr || []).forEach((x) => {
      const v = asId(x);
      if (v) s.add(String(v));
    });
    return s;
  };

  if (typeof g.isMember === "boolean") return g.isMember ? "yes" : "no";

  const creatorLike =
    asId(g.owner) ||
    asId(g.ownerId) ||
    asId(g.createdBy) ||
    asId(g.createdById) ||
    asId(g.creator) ||
    asId(g.creatorId);
  if (creatorLike && String(creatorLike) === me) return "yes";

  const adminSets = [
    toIdSet(g.admins),
    toIdSet(g.adminIds),
    toIdSet(g.admin),
    toIdSet(g.adminId),
    toIdSet(g.groupAdmins),
    toIdSet(g.groupAdminIds),
    toIdSet(g.moderators),
    toIdSet(g.moderatorIds),
  ];
  if (adminSets.some((S) => S.has(me))) return "yes";

  const memberSets = [
    toIdSet(g.members),
    toIdSet(g.memberIds),
    toIdSet(g.participants),
    toIdSet(g.participantIds),
    toIdSet(g.userIds),
    toIdSet(g.users),
    toIdSet(g.currentMembers),
  ];
  if (memberSets.some((S) => S.has(me))) return "yes";

  const objLists =
    g.memberships || g.memberList || g.membership || g.roles || g.userRoles || g.participantMeta;
  if (Array.isArray(objLists)) {
    let sawAny = false;
    for (const m of objLists) {
      const mid = String(asId(m?.user) || m?.userId || m?._id || "");
      if (!mid) { sawAny = true; continue; }
      if (mid !== me) { sawAny = true; continue; }
      const role = String(m?.role || m?.type || m?.kind || "").toLowerCase();
      const status = String(m?.status || m?.state || "").toLowerCase();
      if (/(left|removed|banned|blocked|past|former|revoked|declined)/.test(status)) return "no";
      if (/(owner|creator|admin|moderator|member|participant)/.test(role) || !role) return "yes";
    }
    if (sawAny) return "no";
  }

  const userRole = String(g.userRole || g.myRole || "").toLowerCase();
  if (/(owner|creator|admin|moderator|member|participant)/.test(userRole)) return "yes";
  if (/(past|former|removed|left|banned|blocked)/.test(userRole)) return "no";

  return "unknown";
};


/* =============================== Component =============================== */
const Side = ({ onSelectChat }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useLocalStorage({ key: "userData", defaultValue: {} });

  const socket =
    (typeof GetSocket === "function"
      ? GetSocket()
      : GetSocket?.socket || GetSocket?.current || GetSocket) || null;

  /* --- Mobile viewport height fix --- */
  useEffect(() => {
    const setVh = () => {
      const vh = window.innerHeight * 0.01;
      document.documentElement.style.setProperty("--vh", `${vh}px`);
    };
    setVh();
    window.addEventListener("resize", setVh);
    window.addEventListener("orientationchange", setVh);
    return () => {
      window.removeEventListener("resize", setVh);
      window.removeEventListener("orientationchange", setVh);
    };
  }, []);

  /* modals */
  const [openSearchUser, setOpenSearchUser] = useState(false);
  const [editProfile, setEditProfile] = useState(false);

  /* tab */
  const [activeTab, setActiveTab] = useState("groups");

  /* chats state */
  const [allUsers, setAllUsers] = useState([]);
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
          isPinned: !!conv.isPinned,
          isArchived: !!conv.isArchived,
          isMuted: !!conv.isMuted,
        };
      });

      setAllUsers((prev) => {
        const prevById = new Map(prev.map((c) => [c._id, c]));
        const next = updated.map((c) => {
          const local = prevById.get(c._id);
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

  /* ---------- groups load (REST) — verify-first & fail-closed ---------- */
  const loadGroups = async () => {
    try {
      setGroupsLoading(true);

      const { data } = await http.get("/api/groups");
      const raw = Array.isArray(data?.groups) ? data.groups : [];

      const normalized = raw.map((g) => {
        const isPinned = g.isPinned ?? g.pinned ?? false;
        const isMuted = g.isMuted ?? g.muted ?? false;
        const isArchived = g.isArchived ?? g.archived ?? false;
        return {
          ...g,
          preview: extractGroupPreviewFromList(g, user?._id),
          isPinned: !!isPinned,
          isMuted: !!isMuted,
          isArchived: !!isArchived,
        };
      });

      const decisions = await Promise.all(
        normalized.map(async (g) => {
          const hint = membershipFromList(g, user?._id);
          if (hint === "yes") return { ...g, isMember: true };
          if (hint === "no") return { ...g, isMember: false };

          try {
            const { data: det } = await http.get(`/api/groups/${g._id}`);
            const full = det?.group || det || {};
            const finalHint = membershipFromList(full, user?._id);
            return { ...g, isMember: finalHint === "yes" };
          } catch {
            const iAmCreatorOrAdmin =
              String(
                (g.owner && (g.owner._id || g.owner.id || g.owner)) ||
                  g.ownerId ||
                  g.createdBy ||
                  g.createdById ||
                  g.creator ||
                  g.creatorId ||
                  ""
              ) === String(user?._id || "") ||
              membershipFromList({ groupAdmins: g.groupAdmins, adminIds: g.adminIds, admins: g.admins }, user?._id) ===
                "yes";

            return { ...g, isMember: iAmCreatorOrAdmin };
          }
        })
      );

      const mine = decisions.filter((g) => {
        if (g.isMember) return true;
        const me = String(user?._id || "");
        const ownerId = String(g.owner?._id || g.owner || g.ownerId || g.createdBy || g.creator || "");
        if (ownerId && ownerId === me) return true;
        return false;
      });
      setGroups(mine);

      setGroupUnread((prev) => {
        const keep = new Set(mine.map((g) => String(g._id)));
        const next = { ...prev };
        Object.keys(next).forEach((gid) => {
          if (!keep.has(String(gid))) delete next[gid];
        });
        return next;
      });
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to load groups");
      setGroups([]); // fail-closed on error
    } finally {
      setGroupsLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === "groups") loadGroups();
  }, [activeTab, location.pathname, location.search]);

  useEffect(() => {
    const onCreated = (e) => {
      const g = e?.detail?.group || e?.detail || null;
      if (!g) return;

      const isPinned   = g.isPinned   ?? g.pinned   ?? false;
      const isMuted    = g.isMuted    ?? g.muted    ?? false;
      const isArchived = g.isArchived ?? g.archived ?? false;

      const normalized = {
        ...g,
        preview: extractGroupPreviewFromList(g, user?._id),
        isPinned: !!isPinned,
        isMuted: !!isMuted,
        isArchived: !!isArchived,
        isMember: true,
      };

      setGroups((prev) => {
        const id = String(g._id || "");
        const idx = prev.findIndex((x) => String(x._id) === id);
        if (idx === -1) return [normalized, ...prev];
        const copy = [...prev];
        copy[idx] = { ...copy[idx], ...normalized };
        return copy;
      });

      setGroupUnread((prev) => ({ ...prev, [g._id]: 0 }));
      loadGroups();
    };

    const onJoined = () => loadGroups();

    window.addEventListener("group:created", onCreated);
    window.addEventListener("group:joined", onJoined);

    try {
      if (socket) {
        const sockRefresh = () => loadGroups();
        socket.on?.("group:created", sockRefresh);
        socket.on?.("group:joined", sockRefresh);
        socket.on?.("group:updated", sockRefresh);
        return () => {
          window.removeEventListener("group:created", onCreated);
          window.removeEventListener("group:joined", onJoined);
          socket.off?.("group:created", sockRefresh);
          socket.off?.("group:joined", sockRefresh);
          socket.off?.("group:updated", sockRefresh);
        };
      }
    } catch {}

    return () => {
      window.removeEventListener("group:created", onCreated);
      window.removeEventListener("group:joined", onJoined);
    };
  }, [socket, user?._id]);

  /* unread bumps for groups via socket */
  useEffect(() => {
    if (!socket || !user?._id) return;

    const bump = (gid, fromId) => {
      if (!gid) return;
      if (fromId && String(fromId) === String(user._id)) return;
      if (location.pathname === `/g/${gid}`) return;

      const isVisible = groups.some((g) => String(g._id) === String(gid));
      if (!isVisible) return;

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
  }, [socket, user?._id, location.pathname, groups]);

  /* clear unread when viewing a member group */
  useEffect(() => {
    const m = location.pathname.match(/^\/g\/([a-f0-9]{24})$/i);
    if (!m) return;
    const gid = m[1];

    if (groups.some((g) => String(g._id) === String(gid))) {
      setGroupUnread((prev) => ({ ...prev, [gid]: 0 }));
      socket?.emit("seenGroup", { groupId: gid, userId: user?._id });
    }
  }, [location.pathname, groups, setGroupUnread, socket, user?._id]);

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
  const chatsNotArchived = useMemo(() => filteredChats.filter((c) => !c?.isArchived), [filteredChats]);

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

      await http.put(`${CHAT_API_BASE}/${chatId}/${action}`);
      toast.success(
        `${newVal ? "" : "Un"}${action[0].toUpperCase()}${action.slice(1)}${action === "mute" ? "d" : ""}`
      );

      refreshSidebar();
    } catch (e) {
      refreshSidebar();
      toast.error(e?.response?.data?.message || `Failed to ${action}`);
    }
  };

  const deleteChat = async (chatId) => {
    try {
      setChatMenuOpen(null);
      await http.delete(`${CHAT_API_BASE}/${chatId}/delete`);
      setAllUsers((prev) => prev.filter((c) => c._id !== chatId));
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

      const bodyKey = action === "pin" ? "pinned" : action === "archive" ? "archived" : "muted";
      await http.put(`/api/groups/${groupId}/${action}`, { [bodyKey]: newVal });

      toast.success(
        `${newVal ? "" : "Un"}${action[0].toUpperCase()}${action.slice(1)}${action === "mute" ? "d" : ""}`
      );

      loadGroups();
    } catch (e) {
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
        className="relative flex items-center gap-3 px-4 py-3 border-b border-zinc-900/60 hover:bg-zinc-900/50 cursor-pointer sm:px-3 sm:py-2"
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
            <h3 className="text-zinc-200 font-medium truncate text-[15px] sm:text-sm">
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
            className="p-2 rounded hover:bg-zinc-800/70 sm:p-1.5"
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
        className="relative w-full text-left px-4 py-3 border-b border-zinc-900/60 hover:bg-zinc-900/50 transition flex items-center gap-3 cursor-pointer sm:px-3 sm:py-2"
        onClick={() => {
          if (g.isMember === false) {
            toast.error("You are not a member of this group");
            return;
          }
          navigate(`/g/${g._id}`);
          setGroupUnread((prev) => ({ ...prev, [g._id]: 0 }));
          socket?.emit("seenGroup", { groupId: g._id, userId: user?._id });
          clearDMEverywhere();
        }}
      >
        <img
          src={g.profilePic || "/group-placeholder.png"}
          alt=""
          className="w-10 h-10 rounded-full object-cover ring-1 ring-emerald-500/20 sm:w-9 sm:h-9"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <div className="font-medium truncate text-zinc-200 text-[15px]">{g.name}</div>
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
            className="p-2 rounded hover:bg-zinc-800/70 sm:p-1.5"
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

  /* ===================== Compose responsive/sticky state ===================== */
  const isGroupCreateOpen =
    activeTab === "groups" &&
    new URLSearchParams(location.search).get("new") === "1";

  /* ---------- render ---------- */
  return (
    <div
      className="w-full bg-[#0a0f14] text-zinc-100"
      style={{
        height: "calc(var(--vh, 1vh) * 100)",
        paddingBottom: "env(safe-area-inset-bottom)",
      }}
    >
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

      {/* Layout: rail + main. On mobile, rail sits on top; on lg+, it docks as a column */}
      <div className="grid grid-cols-1 lg:grid-cols-[64px,1fr] h-full">
        {/* Icon rail (sticky unless composer open) */}
        <div
          className={[
            "bg-[#0b1016] border-b lg:border-b-0 lg:border-r border-zinc-800/70",
            isGroupCreateOpen ? "relative z-0" : "sticky top-0 z-30",
            "h-14 lg:h-full py-2 lg:py-5 flex items-center justify-between gap-3 px-2 lg:px-0 lg:flex-col",
          ].join(" ")}
        >
          <div className="flex items-center gap-2 lg:flex-col">
            <button
              title="Chats"
              className={`w-11 h-11 lg:w-12 lg:h-12 grid place-items-center cursor-pointer rounded-lg transition ${
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
              className="w-11 h-11 lg:w-12 lg:h-12 grid place-items-center cursor-pointer text-zinc-300 hover:text-emerald-400 rounded-lg hover:bg-emerald-500/10 transition"
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
              className={`w-11 h-11 lg:w-12 lg:h-12 grid place-items-center cursor-pointer rounded-lg transition ${
                activeTab === "groups"
                  ? "text-emerald-400 bg-emerald-500/10 ring-1 ring-emerald-500/30"
                  : "text-zinc-300 hover:text-emerald-400 hover:bg-emerald-500/10"
              }`}
            >
              <Users size={20} />
            </button>
          </div>

          <div className="flex items-center gap-2 pr-2 lg:pr-0 lg:flex-col">
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

        {/* Main column */}
        <div className="w-full bg-[#090d12] flex flex-col min-h-0">
          {/* Header (sticky unless composer open) */}
         <div
  className={[
    "h-14 px-4 border-b border-zinc-800/70 flex items-center justify-between",
    isGroupCreateOpen ? "relative z-0" : "sticky top-14 lg:top-0 z-20",
    "backdrop-blur supports-[backdrop-filter]:bg-[#090d12]/80",
  ].join(" ")}
>

            <h2 className="font-semibold tracking-wide text-zinc-200 text-[15px] sm:text-base">
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
                className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-3.5 sm:py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-sm ring-1 ring-emerald-400/30 shadow-sm"
              >
                <Plus size={16} />
                <span className="font-medium hidden xs:inline">New Group</span>
              </button>
            ) : (
              <div className="opacity-0 select-none">
                <EllipsisVertical size={18} />
              </div>
            )}
          </div>

          {/* Search + Tab toggles (sticky unless composer open) */}
    <div
  className={[
    "px-3 sm:px-4 py-2 sm:py-3 border-b border-zinc-800/70 bg-[#090d12]",
    isGroupCreateOpen
      ? "relative z-0"
      : "sticky top-[7rem] lg:top-14 z-10",
  ].join(" ")}
>

            <div className="flex items-center gap-2 rounded-xl px-3 py-2 border border-zinc-700/60 bg-[#0f1419]">
              <Search size={16} className="text-zinc-500" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder={activeTab === "groups" ? "Search groups..." : "Search chats..."}
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-transparent outline-none w-full text-[15px] sm:text-sm text-zinc-300 placeholder-zinc-500"
                inputMode="search"
              />
            </div>

            <div className="mt-2 sm:mt-3 grid grid-cols-2 gap-2">
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
          {/* <div
            className="flex-1 min-h-0 overflow-x-hidden overflow-y-auto pb-6 sm:pb-6 px-0"
            style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 16px)" }}
          > */}
          <div
  className="
    flex-1 min-h-0
    overflow-x-hidden
    overflow-visible        /* NEW: let overlays escape on mobile */
    lg:overflow-y-auto      /* keep the nice scrolling on desktop only */
    pb-6 sm:pb-6 px-0
  "
  style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + 16px)" }}
>

            {activeTab === "chats" ? (
              <>
                {pinnedChats.length > 0 && (
                  <div className="px-4 pt-4 pb-2 text-xs uppercase tracking-wider text-zinc-500">Pinned</div>
                )}
                <div className="divide-y divide-zinc-900/60">
                  {pinnedChats.map((c) => (
                    <ChatRow key={c?._id} conv={c} />
                  ))}
                </div>

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
      </div>

      {openSearchUser && <AddUser setOpenSearchUser={setOpenSearchUser} />}
      {editProfile && <EditProfile setEditProfile={setEditProfile} user={user} setUser={setUser} />}
    </div>
  );
};

export default Side;
