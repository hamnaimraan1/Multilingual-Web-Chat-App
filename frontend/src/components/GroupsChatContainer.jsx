
// import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
// import { useLocalStorage } from "@mantine/hooks";
// import {
//   Search,
//   Plus,
//   Users,
//   UserPlus,
//   Crown,
//   Trash2,
//   LogOut,
//   Settings as SettingsIcon,
//   Send,
//   Paperclip,
//   Smile,
//   Mic,
//   FileText,
//   Image as ImageIcon,
//   Play,
//   Pause,
//   ChevronLeft,
//   Info,
//   Check,
//   CheckCheck,
// } from "lucide-react";
// import { GetSocket } from "../utils/Sockets";
// import http from "../utils/http";
// import toast, { Toaster } from "react-hot-toast";
// import uploadFile from "../utils/uploadFile";
// import { useNavigate, useParams } from "react-router-dom";

// /* =========================== Small UI helpers =========================== */
// const Modal = ({ open, onClose, title, children, footer, wide = false, zIndex = 70 }) => {
//   if (!open) return null;
//   return (
//     <div className="fixed inset-0 flex items-center justify-center p-3 z-[70]" style={{ zIndex }}>
//       <div className="absolute inset-0 bg-black/60" onClick={onClose} />
//       <div className={`relative w-full ${wide ? "max-w-3xl" : "max-w-lg"} rounded-2xl bg-[#121418] border border-zinc-700 shadow-xl`}>
//         <div className="px-5 py-4 border-b border-zinc-700 flex items-center justify-between">
//           <h3 className="text-zinc-100 font-semibold">{title}</h3>
//           <button onClick={onClose} className="text-zinc-400 hover:text-zinc-200 transition" aria-label="Close">✕</button>
//         </div>
//         <div className="px-5 py-4 max-h-[70vh] overflow-y-auto">{children}</div>
//         {footer && <div className="px-5 py-4 border-t border-zinc-700">{footer}</div>}
//       </div>
//     </div>
//   );
// };

// const Confirm = ({ open, onClose, onConfirm, title, message, danger }) => (
//   <Modal
//     open={open}
//     onClose={onClose}
//     title={title}
//     footer={
//       <div className="flex justify-end gap-2">
//         <button onClick={onClose} className="px-3 py-1.5 rounded-lg bg-zinc-700 text-zinc-200 hover:bg-zinc-600">Cancel</button>
//         <button
//           onClick={() => { onConfirm(); onClose(); }}
//           className={`px-3 py-1.5 rounded-lg ${danger ? "bg-red-600 hover:bg-red-500" : "bg-green-600 hover:bg-green-500"} text-white`}
//         >
//           Confirm
//         </button>
//       </div>
//     }
//   >
//     <p className="text-zinc-300">{message}</p>
//   </Modal>
// );

// /* =========================== Member Picker =========================== */
// const MemberPicker = ({ open, onClose, onSubmit, excludeIds = [] }) => {
//   const [query, setQuery] = useState("");
//   const [results, setResults] = useState([]);
//   const [selected, setSelected] = useState([]);

//   useEffect(() => {
//     if (!open) return;
//     setQuery("");
//     setResults([]);
//     setSelected([]);
//   }, [open]);

//   const searchUsers = async (q) => {
//     try {
//       const { data } = await http.post("/api/searchUser", { searchRes: q });
//       const list = data?.users || [];
//       const filtered = list.filter((u) => !excludeIds.includes(u._id));
//       setResults(filtered);
//     } catch (err) {
//       toast.error(err?.response?.data?.message || "Failed to search users");
//     }
//   };

//   useEffect(() => {
//     const t = setTimeout(() => {
//       if (query.trim()) searchUsers(query.trim());
//       else setResults([]);
//     }, 300);
//     return () => clearTimeout(t);
//   }, [query]);

//   const toggle = (u) =>
//     setSelected((prev) =>
//       prev.find((p) => p._id === u._id) ? prev.filter((p) => p._id !== u._id) : [...prev, u]
//     );

//   return (
//     <Modal
//       open={open}
//       onClose={onClose}
//       title="Add members"
//       zIndex={90}
//       footer={
//         <div className="flex justify-between items-center w-full">
//           <div className="text-sm text-zinc-400">{selected.length} selected</div>
//           <div className="flex gap-2">
//             <button onClick={onClose} className="px-3 py-1.5 rounded-lg bg-zinc-700 text-zinc-200 hover:bg-zinc-600">
//               Close
//             </button>
//             <button
//               onClick={() => {
//                 if (!selected.length) return toast.error("Pick at least one member");
//                 onSubmit(selected);
//               }}
//               className="px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-500"
//             >
//               Add
//             </button>
//           </div>
//         </div>
//       }
//     >
//       <div className="space-y-3">
//         <input
//           value={query}
//           onChange={(e) => setQuery(e.target.value)}
//           placeholder="Search name or email"
//           className="w-full bg-[#0e1013] border border-zinc-700 rounded-xl px-3 py-2 text-zinc-200 outline-none focus:border-zinc-500"
//         />
//         <div className="max-h-72 overflow-y-auto space-y-1">
//           {results.map((u) => {
//             const isPicked = !!selected.find((s) => s._id === u._id);
//             return (
//               <button
//                 key={u._id}
//                 onClick={() => toggle(u)}
//                 className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border ${
//                   isPicked ? "border-green-600 bg-green-600/10" : "border-zinc-700 hover:bg-zinc-800/40"
//                 } text-left`}
//               >
//                 <div className="text-zinc-100">
//                   <div className="font-medium">{u.name || u.email}</div>
//                   <div className="text-xs text-zinc-400">{u.email}</div>
//                 </div>
//                 <span className="text-xs text-zinc-400">{isPicked ? "Selected" : "Pick"}</span>
//               </button>
//             );
//           })}
//           {!results.length && query && <p className="text-sm text-zinc-500 px-1">No users found.</p>}
//         </div>
//       </div>
//     </Modal>
//   );
// };

// /* =========================== Utils =========================== */
// const fmtTime = (d) => {
//   try {
//     const date = new Date(d);
//     return isNaN(date) ? "" : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
//   } catch {
//     return "";
//   }
// };

// const fileSize = (bytes = 0) => {
//   if (!bytes) return "";
//   const kb = bytes / 1024;
//   if (kb < 1024) return `${Math.round(kb)} KB`;
//   return `${(kb / 1024).toFixed(2)} MB`;
// };

// const getTextFromMessage = (m) => {
//   if (m?.text) return m.text;
//   if (m?.content) return m.content;
//   if (m?.message) return m.message;
//   if (m?.messageType === "image") return "🖼️ Photo";
//   if (m?.messageType === "audio" || m?.messageType === "voice") return "🎙️ Voice message";
//   if (m?.messageType === "file") return "📎 File";
//   return "";
// };

// const dedupeMessages = (arr = []) => {
//   const map = new Map();
//   for (const m of arr || []) {
//     if (!m) continue;
//     if (m._id) {
//       map.set(m._id, m);
//     } else {
//       const t = new Date(m.createdAt || m.timestamp || m.time || 0).getTime();
//       const key = `${m.clientNonce || ""}-${t}-${m.text || m.url || Math.random()}`;
//       if (!map.has(key)) map.set(key, m);
//     }
//   }
//   return Array.from(map.values()).sort(
//     (a, b) =>
//       new Date(a.createdAt || a.timestamp || 0) - new Date(b.createdAt || b.timestamp || 0)
//   );
// };

// const EMOJIS = [
//   "😀","😁","😂","🤣","😃","😄","😅","😆","😉","😊","🙂","🙃","😋","😎","😍","😘","😗","😙","😚","🥰","🥲","😇","🤩","🥳","😏","😒","😞","😔","😟","😕","🙁","☹️","😣","😖","😫","😩","🥺","😢","😭","😤","😠","😡","🤬","🤯","😳","🥵","🥶","😱","😨","😰","😥","😓","🤗","🤔","🤭","🤫","🤥","😶","😐","😑","🫠","🙄","😬","😮‍💨","🤤","😴","😪","😮","😯","😲","😦","😧","😵","🥴","🤐","🤢","🤮","🤧","😷","🤕","🤒","🤑","🤠","🥸",
//   "👍","👎","👌","✌️","🤞","🤟","🤘","🤙","👈","👉","👆","👇","☝️","✋","🤚","🖐️","🖖","👋","🤝","🙏","👏","🙌","🫶","🫰","🤌","🫵","💪","🦾",
//   "👶","🧒","👦","👧","🧑","👨","👩","🧓","👴","👵","👮","🕵️","💂","👷","🧑‍⚕️","🧑‍🏫","🧑‍💻","🧑‍🍳","🧑‍🎓","🧑‍🚀","🧑‍🎨","🧑‍🔧","🧑‍🔬",
//   "🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐯","🦁","🐮","🐷","🐸","🐵","🦄","🐔","🐧","🐦","🐤","🐣","🐥","🦆","🦅","🦉","🦇","🐺","🐗","🐴","🐝","🪲","🦋","🐛","🐞","🐜","🦂","🕷️","🐢","🐍","🦎","🦖","🐙","🦑","🦐","🦞","🐠","🐟","🐬","🐳","🌲","🌳","🌴","🌵","🌷","🌹","🌺","🌸","🌼","🌻","🌞","🌝","🌚","⭐","🌟","⚡","🔥","🌈","☔","❄️","🌧️","🌨️","☁️",
//   "🍏","🍎","🍐","🍊","🍋","🍌","🍉","🍇","🍓","🫐","🍈","🍒","🍑","🥭","🍍","🥥","🥝","🍅","🥑","🍆","🥦","🥬","🥒","🌶️","🫑","🌽","🥕","🧄","🧅","🥔","🍞","🥐","🥖","🥨","🥯","🧇","🥞","🧈","🍗","🍖","🍔","🍟","🍕","🌭","🥪","🌮","🌯","🥙","🧆","🥘","🍲","🍝","🍣","🍱","🍜","🍛","🍚","🍙","🍤","🥟","🍡","🍧","🍨","🍦","🍰","🎂","🧁","🍮","🍭","🍬","🍫","🍿","🍩","🍪","☕","🍵","🧋","🥤","🍺","🍻","🍷","🍸","🍹",
//   "🚗","🚕","🚙","🚌","🚎","🏎️","🚓","🚑","🚒","🚐","🛻","🚚","🚛","🚜","🛵","🏍️","🚲","🛴","✈️","🛫","🛬","🛩️","🚀","🛸","🚁","⛵","🚢","⚓","🗼","🗽","🗿","🗺️","🏔️","🏖️","🏝️","🏙️","🏛️","🏟️","🏥","🏬","🏪","🏫","🏠","🏡",
//   "⚽","🏀","🏈","⚾","🎾","🏐","🏉","🎱","🏓","🏸","🥊","🥋","🎮","🎲","🧩","♟️","🎯","🎹","🎸","🎻","🥁","🎤","🎧","📷","🎥","📱","💻","⌨️","🖱️","💡","🔦","🕯️","📦","✉️","📫","📎","🖇️","📌","📍","✂️","🧵","🧶","🔒","🔓","🔑","🧰","🧱","🧲","🧪","🔬","🔭","📚","🗒️","🗂️","🗃️","🧾","🧮",
//   "❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💖","💗","💓","💞","💕","💘","💔","💬","💭","💤","✅","☑️","❌","❗","❓","⚠️","♻️","🔝","🔜","🔙","🔎","🔍","#","*","™️","©️","®️",
// ];

// /* helpers for admin checks */
// const getId = (x) => (typeof x === "string" ? x : x?._id || x?.id || x);
// const isAdminOfGroup = (group, user) => {
//   const uid = getId(user);
//   const arr = group?.admins || [];
//   return arr.some((a) => getId(a) === uid);
// };

// /* ---- Message normalizer -------------------------------------------------- */
// const normalizeMessage = (rawIn) => {
//   if (!rawIn) return null;
//   const m = rawIn.message ? rawIn.message : rawIn;

//   const senderObj = m.msgByUser || m.sender || m.user || m.from || null;
//   const senderId =
//     (typeof senderObj === "object" ? senderObj?._id : senderObj) ||
//     m.userId ||
//     m.senderId ||
//     null;

//   const createdAt = m.createdAt || m.timestamp || m.time || new Date().toISOString();

//   const text =
//     m.text ??
//     m.content ??
//     (typeof m.message === "string" ? m.message : null) ??
//     m.body ??
//     "";

//   const url =
//     m.url ??
//     m.fileUrl ??
//     m.mediaUrl ??
//     m.attachmentUrl ??
//     m.imageUrl ??
//     m.audioUrl ??
//     m.videoUrl ??
//     null;

//   const fileName = m.fileName || m.filename || m.name || null;
//   const size =
//     typeof m.size === "number"
//       ? m.size
//       : typeof m.fileSize === "number"
//       ? m.fileSize
//       : null;

//   let messageType =
//     m.messageType ||
//     m.type ||
//     m.msgType ||
//     (url
//       ? m.fileType?.startsWith("image")
//         ? "image"
//         : m.fileType?.startsWith("audio")
//         ? "audio"
//         : "file"
//       : undefined);

//   if (!messageType) {
//     if (url) {
//       const low = String(url).toLowerCase();
//       if (low.match(/\.(png|jpe?g|gif|webp|bmp|svg)(\?|$)/)) messageType = "image";
//       else if (low.match(/\.(mp3|wav|m4a|ogg|webm)(\?|$)/)) messageType = "audio";
//       else messageType = "file";
//     } else {
//       messageType = "text";
//     }
//   }
//   if (messageType === "voice") messageType = "audio";

//   const clientNonce = m.clientNonce || rawIn.clientNonce || null;

//   return {
//     ...m,
//     _id: m._id || rawIn._id || undefined,
//     groupId: m.groupId || rawIn.groupId || undefined,
//     sender: senderObj,
//     msgByUser: senderObj,
//     senderId,
//     createdAt,
//     text,
//     url,
//     fileName,
//     size,
//     messageType,
//     clientNonce,
//   };
// };

// /* =========================== Message UI bits =========================== */
// const Lightbox = ({ open, src, onClose, caption }) => {
//   if (!open) return null;
//   return (
//     <div className="fixed inset-0 bg-black/90 z-[80] flex items-center justify-center p-4" onClick={onClose}>
//       <img src={src} alt={caption || "image"} className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain" />
//     </div>
//   );
// };

// const VoiceBubble = ({ src }) => {
//   const audioRef = useRef(null);
//   const [playing, setPlaying] = useState(false);
//   const [cur, setCur] = useState(0);
//   const [dur, setDur] = useState(0);

//   useEffect(() => {
//     const a = audioRef.current;
//     if (!a) return;
//     const onTime = () => setCur(a.currentTime || 0);
//     const onMeta = () => setDur(a.duration || 0);
//     const onEnd = () => setPlaying(false);
//     a.addEventListener("timeupdate", onTime);
//     a.addEventListener("loadedmetadata", onMeta);
//     a.addEventListener("ended", onEnd);
//     return () => {
//       a.removeEventListener("timeupdate", onTime);
//       a.removeEventListener("loadedmetadata", onMeta);
//       a.removeEventListener("ended", onEnd);
//     };
//   }, []);

//   const toggle = () => {
//     const a = audioRef.current;
//     if (!a) return;
//     if (a.paused) {
//       a.play().catch(() => {});
//       setPlaying(true);
//     } else {
//       a.pause();
//       setPlaying(false);
//     }
//   };

//   const pct = dur ? (cur / dur) * 100 : 0;
//   const mmss = (s) => {
//     if (!Number.isFinite(s) || s < 0) s = 0;
//     const m = Math.floor(s / 60).toString().padStart(2, "0");
//     const sec = Math.floor(s % 60).toString().padStart(2, "0");
//     return `${m}:${sec}`;
//   };

//   return (
//     <div className="flex items-center gap-3 text-zinc-100">
//       <button onClick={toggle} className="w-9 h-9 rounded-full grid place-items-center bg-black/20 hover:opacity-90" title={playing ? "Pause" : "Play"}>
//         {playing ? <Pause size={18} /> : <Play size={18} />}
//       </button>
//       <div className="w-40 sm:w-56 md:w-72">
//         <div className="h-1.5 rounded-full bg-zinc-300/30">
//           <div className="h-1.5 rounded-full bg-zinc-100" style={{ width: `${pct}%` }} />
//         </div>
//         <div className="text-[10px] mt-1 opacity-80">
//           {mmss(cur)} / {mmss(dur || 0)}
//         </div>
//       </div>
//       <audio ref={audioRef} src={src} preload="metadata" className="hidden" />
//     </div>
//   );
// };

// const FileBubble = ({ url, fileName, size }) => {
//   const name = fileName || url?.split("/").pop() || "File";
//   return (
//     <div className="flex items-center gap-3 p-2 rounded-xl bg-black/10">
//       <div className="w-10 h-10 rounded-lg bg-black/20 grid place-items-center">
//         <FileText />
//       </div>
//       <div className="min-w-0 flex-1">
//         <div className="text-sm truncate">{name}</div>
//         <div className="text-[11px] opacity-70">{fileSize(size)}</div>
//       </div>
//       {!!url && (
//         <>
//           <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs underline opacity-90 hover:opacity-100">Open</a>
//           <a href={url} download={name} className="text-xs underline opacity-90 hover:opacity-100">Download</a>
//         </>
//       )}
//     </div>
//   );
// };

// const ImageBubble = ({ url, fileName }) => {
//   const [open, setOpen] = useState(false);
//   return (
//     <>
//       <div className="overflow-hidden rounded-xl border border-white/10 bg-black/10">
//         <img
//           src={url}
//           alt={fileName || "image"}
//           className="max-h-72 object-cover cursor-zoom-in max-w-[min(80vw,420px)]"
//           onClick={() => setOpen(true)}
//         />
//         <div className="flex items-center justify-between px-2 py-1 text-[11px] opacity-80">
//           <div className="flex items-center gap-1">
//             <ImageIcon size={12} /> {fileName || "Image"}
//           </div>
//           <a href={url} target="_blank" rel="noopener noreferrer" download className="underline">
//             Download
//           </a>
//         </div>
//       </div>
//       <Lightbox open={open} src={url} onClose={() => setOpen(false)} caption={fileName} />
//     </>
//   );
// };

// /* =========================== Main Component =========================== */
// /**
//  * Props:
//  * - embedded?: boolean (default false) — when true, hides the left groups list (for use inside other layouts).
//  * - initialGroupId?: string — optional group id to open on mount (overridden by route param if present).
//  */
// export default function GroupsChatContainer({ embedded = true, initialGroupId }) {
//   const navigate = useNavigate();
//   const params = useParams(); // expects route like /g/:groupId
//   const routeGroupId = params?.groupId || params?.gid || null;
//   const effectiveGroupId = routeGroupId || initialGroupId || null;

//   const socket = GetSocket();
//   const [userLS] = useLocalStorage({ key: "user" });

//   const myId = useMemo(() => {
//     if (userLS?._id) return userLS._id;
//     try {
//       const raw = localStorage.getItem("userData");
//       const parsed = raw ? JSON.parse(raw) : null;
//       return parsed?._id || parsed?.id || null;
//     } catch {
//       return null;
//     }
//   }, [userLS]);

//   /* responsive drawers */
//   const [showLeft, setShowLeft] = useState(!embedded);
//   const [showMembersMobile, setShowMembersMobile] = useState(false);

//   /* groups */
//   const [allGroups, setAllGroups] = useState([]);
//   const [groups, setGroups] = useState([]);
//   const [searchQ, setSearchQ] = useState("");
//   const [loadingGroups, setLoadingGroups] = useState(false);

//   /* active + messages */
//   const [active, setActive] = useState(null);
//   const [messages, setMessages] = useState([]);
//   const [sending, setSending] = useState(false);

//   const messagesEndRef = useRef(null);
//   const listRef = useRef(null);

//   /* seen tracking (client-side, from socket events) */
//   const [seenByMap, setSeenByMap] = useState({});
//   const seenThrottleRef = useRef(0);

//   /* create group UI */
//   const [createOpen, setCreateOpen] = useState(false);
//   const [gName, setGName] = useState("");
//   const [gMembers, setGMembers] = useState([]);
//   const [gPhotoFile, setGPhotoFile] = useState(null);
//   const [gPhotoPreview, setGPhotoPreview] = useState(null);
//   const [creating, setCreating] = useState(false);

//   /* modals & confirms */
//   const [pickerOpen, setPickerOpen] = useState(false);
//   const [confirmDelete, setConfirmDelete] = useState(false);
//   const [confirmLeave, setConfirmLeave] = useState(false);
//   const [settingsOpen, setSettingsOpen] = useState(false);

//   /* emoji picker toggle */
//   const [showEmoji, setShowEmoji] = useState(false);

//   /* recording */
//   const recordRef = useRef(null);
//   const [recording, setRecording] = useState(false);

//   /* unread counts client-side */
//   const [unread, setUnread] = useState({});

//   /* input */
//   const [newMsg, setNewMsg] = useState("");

//   /* settings modal state */
//   const [pastMembers, setPastMembers] = useState([]);
//   const [settingsDraft, setSettingsDraft] = useState({ name: "", profilePic: "" });

//   useEffect(() => {
//     if (!Array.isArray(messages)) setMessages(Array.isArray(messages) ? messages : []);
//   }, [messages]);

//   /* load groups */
//   const loadMyGroups = async () => {
//     try {
//       setLoadingGroups(true);
//       const { data } = await http.get("/api/groups");
//       const list = data?.groups || [];
//       setAllGroups(list);
//       setGroups(list);
//     } catch (err) {
//       console.error("Failed to load groups", err);
//       toast.error(err?.response?.data?.message || "Failed to load groups");
//     } finally {
//       setLoadingGroups(false);
//     }
//   };
//   useEffect(() => { loadMyGroups(); }, []);

//   /* open group if route/prop says so */
//   useEffect(() => {
//     if (effectiveGroupId) {
//       openGroup(effectiveGroupId);
//     }
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [effectiveGroupId]);
//   useEffect(() => {
//   // no group in the route -> show placeholder
//   if (!routeGroupId && !initialGroupId) {
//     setActive(null);
//     setMessages([]);
//     setSeenByMap({});
//     if (!embedded) setShowLeft(true); // keep the list visible on wide screens
//   }
//   // NOTE: don't call openGroup here; we only open when an id exists
// }, [routeGroupId, initialGroupId, embedded]);

//   /* search filter */
//   useEffect(() => {
//     const q = (searchQ || "").trim().toLowerCase();
//     if (!q) setGroups(allGroups);
//     else setGroups(allGroups.filter((g) => (g?.name || "").toLowerCase().includes(q)));
//   }, [searchQ, allGroups]);

//   /* ===== Past members fetch ===== */
//   const fetchPastMembers = useCallback(
//     async (gid) => {
//       if (!gid) return setPastMembers([]);
//       try {
//         const { data } = await http.get(`/api/groups/${gid}/past-members`).catch(() => ({ data: null }));
//         if (data?.pastMembers || data?.users) {
//           setPastMembers(data.pastMembers || data.users || []);
//           return;
//         }
//         const alt = await http.post(`/api/groups/past-members`, { groupId: gid }).catch(() => ({ data: null }));
//         if (alt?.data?.pastMembers || alt?.data?.users) {
//           setPastMembers(alt.data.pastMembers || alt.data.users || []);
//           return;
//         }
//         setPastMembers(Array.isArray(active?.pastMembers) ? active.pastMembers : []);
//       } catch {
//         setPastMembers(Array.isArray(active?.pastMembers) ? active.pastMembers : []);
//       }
//     },
//     [active]
//   );

//   useEffect(() => {
//     if (!settingsOpen || !active?._id) return;
//     setSettingsDraft({
//       name: active.name || "",
//       profilePic: active.profilePic || "",
//     });
//     fetchPastMembers(active._id);
//   }, [settingsOpen, active?._id, fetchPastMembers]);

//   /* ---------- seen helpers ---------- */
//   const emitSeenGroup = useCallback(() => {
//     if (!socket || !active?._id || !myId) return;
//     const now = Date.now();
//     if (now - (seenThrottleRef.current || 0) < 1500) return; // throttle 1.5s
//     seenThrottleRef.current = now;
//     socket.emit("seenGroup", { groupId: active._id, userId: myId });
//   }, [socket, active?._id, myId]);

//   /* replace optimistic with saved */
//   const replaceOptimisticWithSaved = useCallback((savedRaw) => {
//     const savedMsg = normalizeMessage(savedRaw);
//     if (!savedMsg) return;

//     const savedId = savedMsg._id;
//     const savedSender =
//       (typeof savedMsg.msgByUser === "object" ? savedMsg.msgByUser?._id : savedMsg.msgByUser) ||
//       (typeof savedMsg.sender === "object" ? savedMsg.sender?._id : savedMsg.sender);

//     const savedType  = savedMsg.messageType || "text";
//     const savedNonce = savedMsg.clientNonce;
//     const savedText  = (getTextFromMessage(savedMsg) || "").trim().replace(/\s+/g, " ");
//     const savedUrl   = savedMsg.url || "";
//     const savedAt    = new Date(savedMsg.createdAt || savedMsg.timestamp || Date.now()).getTime();

//     const mergePreserving = (oldM, newM) => {
//       const merged = { ...oldM, ...newM };
//       merged.url = newM.url ?? oldM.url ?? null;
//       merged.fileName = newM.fileName ?? oldM.fileName ?? oldM.filename ?? oldM.name ?? null;
//       const newSize = (typeof newM.size === "number") ? newM.size :
//                       (typeof newM.fileSize === "number") ? newM.fileSize : null;
//       const oldSize = (typeof oldM.size === "number") ? oldM.size :
//                       (typeof oldM.fileSize === "number") ? oldM.fileSize : null;
//       merged.size = newSize ?? oldSize ?? null;
//       merged.fileSize = merged.size;
//       return merged;
//     };

//     setMessages((prev) => {
//       const prevArr = Array.isArray(prev) ? prev : [];
//       let replaced = false;

//       let next = prevArr.map((m) => {
//         if (m._id && savedId && m._id === savedId) { replaced = true; return mergePreserving(m, savedMsg); }
//         if (m.__temp && savedNonce && m.clientNonce && m.clientNonce === savedNonce) { replaced = true; return mergePreserving(m, savedMsg); }

//         if (m.__temp) {
//           const mSender =
//             (typeof m.msgByUser === "object" ? m.msgByUser?._id : m.msgByUser) ||
//             (typeof m.sender === "object" ? m.sender?._id : m.sender);

//           const sameSender = String(mSender || "") === String(savedSender || "");
//           const sameType   = (m.messageType || "text") === savedType;

//           const mText    = (getTextFromMessage(m) || "").trim().replace(/\s+/g, " ");
//           const sameText = !!savedText && mText === savedText;
//           const sameUrl  = !!savedUrl && m.url === savedUrl;

//           const mAt = new Date(m.createdAt || m.timestamp || 0).getTime();
//           const closeInTime = Math.abs(savedAt - mAt) < 10000;

//           if (sameSender && sameType && (sameText || sameUrl) && closeInTime) {
//             replaced = true;
//             return mergePreserving(m, savedMsg);
//           }
//         }
//         return m;
//       });

//       if (!replaced) next = [...next, savedMsg];

//       return next.sort(
//         (a, b) =>
//           new Date(a.createdAt || a.timestamp || 0) - new Date(b.createdAt || b.timestamp || 0)
//       );
//     });
//   }, []);

//   const appendIncomingMessage = useCallback((incoming) => {
//     const normalized = normalizeMessage(incoming);
//     if (!normalized) return;
//     setMessages((prev) => {
//       const prevArr = Array.isArray(prev) ? prev : [];
//       if (normalized._id && prevArr.find((m) => m._id === normalized._id)) return prevArr;
//       return dedupeMessages([...prevArr, normalized]);
//     });
//   }, []);

//   /* open group */
//   const openGroup = async (groupId) => {
//     if (!groupId) return;
//     try {
//       setActive(null);
//       setMessages([]);
//       setSeenByMap({});
//       const { data } = await http.get(`/api/groups/${groupId}`);
//       const group = data?.group;
//       const initialMessages = data?.messages || data?.groupMessages || [];
//       setActive(group || null);
//       setMessages(Array.isArray(initialMessages) ? dedupeMessages(initialMessages.map(normalizeMessage)) : []);
//       if (socket && group) {
//         socket.emit("msgPageGroup", group._id);
//         setTimeout(() => emitSeenGroup(), 80);
//       }
//       setUnread((u) => ({ ...u, [groupId]: 0 }));
//       if (!embedded) setShowLeft(false);
//     } catch (err) {
//       console.error("Failed to open group", err);
//       toast.error(err?.response?.data?.message || "Failed to load group");
//     }
//   };

//   /* sockets */
//   useEffect(() => {
//     if (!socket) return;

//     const onGroupInfo = (group) => {
//       if (!group?._id) return;
//       setAllGroups((prev) => {
//         const idx = prev.findIndex((g) => g._id === group._id);
//         if (idx === -1) return [group, ...prev];
//         return prev.map((g) => (g._id === group._id ? group : g));
//       });
//       setGroups((prev) => {
//         const idx = prev.findIndex((g) => g._id === group._id);
//         if (idx === -1) return [group, ...prev];
//         return prev.map((g) => (g._id === group._id ? group : g));
//       });
//       setActive((cur) => (cur && cur._id === group._id ? group : cur));

//       if (settingsOpen && active && group._id === active._id) {
//         fetchPastMembers(group._id);
//       }
//     };

//     const onGroupMessages = (payload) => {
//       if (!payload) return;

//       if (Array.isArray(payload)) {
//         setMessages(dedupeMessages(payload.map(normalizeMessage)));
//         return;
//       }

//       if (payload?.groupId && payload?.messages) {
//         if (!active || payload.groupId === active._id) {
//           const list = Array.isArray(payload.messages) ? payload.messages : [payload.messages];
//           list.map(normalizeMessage).forEach((msg) => replaceOptimisticWithSaved(msg));
//         }
//         return;
//       }

//       const single = payload?.message || payload;
//       if (single) replaceOptimisticWithSaved(single);
//     };

//     const onNewGroupMsg = (msg) => {
//       if (!msg) return;
//       const m = normalizeMessage(msg?.message || msg);
//       const groupId = m.groupId || msg.groupId;
//       if (!groupId) return;

//       const lastText = getTextFromMessage(m);
//       setAllGroups((prev) => {
//         const copy = [...prev];
//         const idx = copy.findIndex((g) => g._id === groupId);
//         if (idx !== -1) {
//           const g = { ...copy[idx], lastMessage: { text: lastText, time: m.createdAt || new Date() } };
//           copy.splice(idx, 1);
//           copy.unshift(g);
//         }
//         return copy;
//       });
//       setGroups((prev) => {
//         const copy = [...prev];
//         const idx = copy.findIndex((g) => g._id === groupId);
//         if (idx !== -1) {
//           const g = { ...copy[idx], lastMessage: { text: lastText, time: m.createdAt || new Date() } };
//           copy.splice(idx, 1);
//           copy.unshift(g);
//         }
//         return copy;
//       });

//       if (active && groupId === active._id) {
//         if (m._id) replaceOptimisticWithSaved(m);
//       } else {
//         setUnread((u) => ({ ...u, [groupId]: (u[groupId] || 0) + 1 }));
//       }
//     };

//     const onSeenUpdate = ({ groupId, seenBy, messageIds }) => {
//       if (!active || groupId !== active._id) return;

//       setMessages((prev) =>
//         (prev || []).map((m) => (messageIds.includes(m._id) ? { ...m, seen: true } : m))
//       );

//       setSeenByMap((prev) => {
//         const next = { ...prev };
//         for (const id of messageIds) {
//           const arr = next[id] || [];
//           if (!arr.includes(seenBy)) next[id] = [...arr, seenBy];
//         }
//         return next;
//       });
//     };

//     socket.on("groupInfo", onGroupInfo);
//     socket.on("groupMessages", onGroupMessages);
//     socket.on("receive-group-msg", onNewGroupMsg);
//     socket.on("group:new", onNewGroupMsg);
//     socket.on("seenGroupUpdate", onSeenUpdate);

//     return () => {
//       socket.off("groupInfo", onGroupInfo);
//       socket.off("groupMessages", onGroupMessages);
//       socket.off("receive-group-msg", onNewGroupMsg);
//       socket.off("group:new", onNewGroupMsg);
//       socket.off("seenGroupUpdate", onSeenUpdate);
//     };
//   }, [socket, active, replaceOptimisticWithSaved, settingsOpen, fetchPastMembers]);

//   /* auto scroll + mark seen when at bottom */
//   useEffect(() => {
//     messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
//     const el = listRef.current;
//     if (!el) return;
//     const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 48;
//     if (nearBottom) emitSeenGroup();
//   }, [messages, emitSeenGroup]);

//   useEffect(() => {
//     const el = listRef.current;
//     if (!el) return;
//     const onScroll = () => {
//       if (el.scrollTop + el.clientHeight >= el.scrollHeight - 48) {
//         emitSeenGroup();
//       }
//     };
//     el.addEventListener("scroll", onScroll);
//     return () => el.removeEventListener("scroll", onScroll);
//   }, [emitSeenGroup]);

//   useEffect(() => {
//     const onFocus = () => emitSeenGroup();
//     window.addEventListener("focus", onFocus);
//     return () => window.removeEventListener("focus", onFocus);
//   }, [emitSeenGroup]);

//   /* send text */
//   const sendGroupMessage = async () => {
//     if (!newMsg?.trim() || !active || !myId || !socket) return;
//     if (sending) return;
//     const text = newMsg.trim();
//     setSending(true);

//     const clientNonce = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
//     const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
//     const optimistic = normalizeMessage({
//       _id: tempId,
//       groupId: active._id,
//       msgByUser: myId,
//       sender: myId,
//       text,
//       messageType: "text",
//       createdAt: new Date().toISOString(),
//       senderName: "You",
//       __temp: true,
//       clientNonce,
//     });
//     setMessages((prev) => dedupeMessages([...(Array.isArray(prev) ? prev : []), optimistic]));
//     setNewMsg("");

//     try {
//       const payload = { sender: myId, groupId: active._id, messageType: "text", text, clientNonce };
//       socket.emit("newGroupMsg", payload, (ack) => {
//         if (ack && ack.savedMessage) replaceOptimisticWithSaved(ack.savedMessage);
//       });
//     } catch (err) {
//       toast.error("Message failed");
//       setMessages((prev) => (Array.isArray(prev) ? prev.filter((m) => m._id !== tempId) : []));
//     } finally {
//       setSending(false);
//     }
//   };

//   /* Uploads */
//   const detectMessageType = (file) => {
//     const t = file?.type || "";
//     if (t.startsWith("image")) return "image";
//     if (t.startsWith("audio")) return "audio";
//     return "file";
//   };

//   const sendFile = async (file, kind) => {
//     if (!file || !active || !myId || !socket) return;
//     try {
//       const to = toast.loading("Uploading...");
//       const res = await uploadFile(file);
//       toast.dismiss(to);
//       const url = res?.secure_url;
//       if (!url) throw new Error("Upload failed");

//       const type = kind || detectMessageType(file);
//       const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
//       const clientNonce = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

//       const serverPayload = {
//         sender: myId,
//         groupId: active._id,
//         messageType: type,
//         text: null,
//         imageUrl: type === "image" ? url : undefined,
//         audioUrl: type === "audio" ? url : undefined,
//         videoUrl: type === "video" ? url : undefined,
//         fileUrl: type === "file" ? url : undefined,
//         fileName: file.name,
//         size: file.size,
//         clientNonce,
//       };

//       const optimistic = normalizeMessage({
//         _id: tempId,
//         groupId: active._id,
//         msgByUser: myId,
//         messageType: type,
//         url,
//         fileName: file.name,
//         size: file.size,
//         createdAt: new Date().toISOString(),
//         __temp: true,
//         clientNonce,
//       });

//       setMessages((prev) => dedupeMessages([...(Array.isArray(prev) ? prev : []), optimistic]));

//       socket.emit("newGroupMsg", serverPayload, (ack) => {
//         if (ack && ack.savedMessage) replaceOptimisticWithSaved(ack.savedMessage);
//       });
//     } catch (err) {
//       console.error(err);
//       toast.error("Upload failed");
//     }
//   };

//   /* Recorder */
//   const toggleRecord = async () => {
//     try {
//       if (recording) {
//         recordRef.current?.stop();
//         setRecording(false);
//       } else {
//         const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
//         const recorder = new MediaRecorder(stream);
//         const chunks = [];
//         recorder.ondataavailable = (e) => chunks.push(e.data);
//         recorder.onstop = async () => {
//           const blob = new Blob(chunks, { type: "audio/webm" });
//           const file = new File([blob], `voice-${Date.now()}.webm`, { type: "audio/webm" });
//           await sendFile(file, "audio");
//           stream.getTracks().forEach((t) => t.stop());
//         };
//         recorder.start();
//         recordRef.current = recorder;
//         setRecording(true);
//       }
//     } catch (err) {
//       console.error("Voice record error", err);
//       toast.error("Microphone access denied or not available");
//     }
//   };

//   /* Create group helpers */
//   const onPickPhoto = (file) => {
//     if (!file) {
//       setGPhotoFile(null);
//       setGPhotoPreview(null);
//       return;
//     }
//     setGPhotoFile(file);
//     const reader = new FileReader();
//     reader.onload = () => setGPhotoPreview(reader.result);
//     reader.readAsDataURL(file);
//   };
//   const resetCreate = () => {
//     setCreateOpen(false);
//     setGName("");
//     setGMembers([]);
//     setGPhotoFile(null);
//     setGPhotoPreview(null);
//   };
//   const handleCreate = async () => {
//     if (!gName.trim()) return toast.error("Group name required");
//     if (!gMembers.length) return toast.error("Pick at least one member");
//     if (creating) return;
//     try {
//       setCreating(true);
//       let uploadedUrl = "";
//       if (gPhotoFile) {
//         const res = await uploadFile(gPhotoFile);
//         uploadedUrl = res?.secure_url || "";
//       }
//       const payload = {
//         name: gName.trim(),
//         members: gMembers.map((m) => m._id),
//         profilePic: uploadedUrl,
//       };
//       const { data } = await http.post("/api/groups/create", payload);
//       const created = data?.group;
//       if (!created) throw new Error("Create failed");
//       toast.success("Group created");
//       setAllGroups((prev) => [created, ...prev]);
//       setGroups((prev) => [created, ...prev]);
//       resetCreate();
//       openGroup(created._id);
//       if (!embedded) navigate(`/g/${created._id}`);
//     } catch (e) {
//       console.error("Create group error:", e);
//       toast.error(e?.response?.data?.message || e?.message || "Create failed");
//     } finally {
//       setCreating(false);
//     }
//   };

//   /* Member/admin actions */
//   const removeMember = async (userId) => {
//     if (!active) return;
//     try {
//       await http.put("/api/groups/remove-member", { groupId: active._id, userId });
//       toast.success("Member removed");
//       openGroup(active._id);
//       if (settingsOpen) fetchPastMembers(active._id);
//     } catch (e) {
//       console.error(e);
//       toast.error(e?.response?.data?.message || "Remove failed");
//     }
//   };

//   const makeAdmin = async (userId) => {
//     if (!active) return;
//     const attempts = [
//       ["/api/groups/add-admin", { groupId: active._id, newAdminId: userId }],
//       ["/api/groups/set-admin", { groupId: active._id, newAdminId: userId }],
//       ["/api/groups/transfer-admin", { groupId: active._id, newAdminId: userId }],
//     ];
//     let lastErr = null;
//     for (const [url, body] of attempts) {
//       try {
//         const { data } = await http.put(url, body);
//         toast.success(data?.message || "Admin updated");
//         await openGroup(active._id);
//         return;
//       } catch (e) {
//         lastErr = e;
//       }
//     }
//     toast.error(lastErr?.response?.data?.message || "Make admin failed");
//   };

//   const leaveGroup = async () => {
//     if (!active) return;
//     try {
//       const { data } = await http.put("/api/groups/leave", { groupId: active._id });
//       toast.success(data?.message || "You left the group");
//       setAllGroups((prev) => prev.filter((g) => g._id !== active._id));
//       setGroups((prev) => prev.filter((g) => g._id !== active._id));
//       setActive(null);
//       setMessages([]);
//       if (!embedded) navigate("/"); // bounce somewhere sane
//     } catch (e) {
//       console.error(e);
//       toast.error(e?.response?.data?.message || "Leave failed");
//     }
//   };

//   const deleteGroup = async () => {
//     if (!active) return;
//     try {
//       const { data } = await http.delete("/api/groups/delete", { data: { groupId: active._id } });
//       toast.success(data?.message || "Group deleted");
//       setAllGroups((prev) => prev.filter((g) => g._id !== active._id));
//       setGroups((prev) => prev.filter((g) => g._id !== active._id));
//       setActive(null);
//       setMessages([]);
//       if (!embedded) navigate("/");
//     } catch (e) {
//       console.error(e);
//       toast.error(e?.response?.data?.message || "Delete failed");
//     }
//   };

//   const amAdmin = active ? isAdminOfGroup(active, myId) : false;

//   /* Group update */
//   const updateGroup = async (patch) => {
//     if (!active) return;
//     const payload = { groupId: active._id, ...patch };
//     const attempts = [
//       () => http.put("/api/groups/update", payload),
//       () => http.patch("/api/groups/update", payload),
//     ];
//     let updated = null;
//     let lastErr = null;
//     try {
//       setActive((cur) => (cur ? { ...cur, ...patch } : cur));
//       setAllGroups((prev) => prev.map((g) => (g._id === active._id ? { ...g, ...patch } : g)));
//       setGroups((prev) => prev.map((g) => (g._id === active._id ? { ...g, ...patch } : g)));

//       for (const req of attempts) {
//         try {
//           const { data } = await req();
//           if (data?.group) {
//             updated = data.group;
//             break;
//           }
//         } catch (e) {
//           lastErr = e;
//         }
//       }
//       if (!updated) throw lastErr || new Error("Update failed");

//       toast.success("Group updated");
//       setActive(updated);
//       setAllGroups((prev) => prev.map((g) => (g._id === updated._id ? updated : g)));
//       setGroups((prev) => prev.map((g) => (g._id === updated._id ? updated : g)));
//     } catch (e) {
//       toast.error(e?.response?.data?.message || "Update failed");
//       openGroup(active._id);
//     }
//   };

//   const updatePhoto = async (file) => {
//     if (!active || !file) return;
//     try {
//       const t = toast.loading("Uploading photo...");
//       const res = await uploadFile(file);
//       toast.dismiss(t);
//       const url = res?.secure_url;
//       if (!url) throw new Error("Upload failed");
//       await updateGroup({ profilePic: url });
//     } catch (e) {
//       console.error(e);
//       toast.error(e?.message || "Photo upload failed");
//     }
//   };

//   /* emoji insert */
//   const addEmoji = (emo) => setNewMsg((s) => (s || "") + emo);

//   /* file input ref */
//   const fileRef = useRef();

//   /* =========================== Render =========================== */
//   const everyoneElseCountFor = (m) => {
//     const senderId =
//       (typeof m.msgByUser === "object" ? m.msgByUser?._id : m.msgByUser) ||
//       (typeof m.sender === "object" ? m.sender?._id : m.sender);
//     const members = active?.members || [];
//     return Math.max(members.filter((u) => String(getId(u)) !== String(senderId)).length, 0);
//   };

//   const SeenTicks = ({ m, isMe }) => {
//     if (!isMe || !m._id) return null;

//     const totalOthers = everyoneElseCountFor(m);
//     const seenArr = (seenByMap[m._id] || []).filter((uid) => String(uid) !== String(myId));
//     const allSeen = totalOthers > 0 && seenArr.length >= totalOthers;

//     return (
//       <span className="inline-flex items-center gap-0.5 ml-1 align-middle">
//         {allSeen ? <CheckCheck size={12} /> : <Check size={12} />}
//       </span>
//     );
//   };

//   const ChatHeader = () => (
//     <div className="h-14 px-2 sm:px-4 border-b border-zinc-800 flex items-center justify-between">
//       <div className="flex items-center gap-3 min-w-0">
//         {!embedded && (
//           <button className="lg:hidden p-2 rounded-lg hover:bg-zinc-800" onClick={() => setShowLeft(true)} title="Groups">
//             <ChevronLeft />
//           </button>
//         )}
//         {embedded && (
//           <button className="p-2 rounded-lg hover:bg-zinc-800" onClick={() => navigate(-1)} title="Back">
//             <ChevronLeft />
//           </button>
//         )}
//         <img src={active.profilePic || "/group-placeholder.png"} alt="" className="w-9 h-9 rounded-full object-cover" />
//         <div className="min-w-0">
//           <div className="flex items-center gap-2 min-w-0">
//             <h2 className="font-semibold truncate">{active.name}</h2>
//             {amAdmin && (
//               <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-700/40">Admin</span>
//             )}
//           </div>
//           <div className="text-xs text-zinc-500 truncate">Created by {active?.createdBy?.name || active?.createdBy?.email || "—"}</div>
//         </div>
//       </div>

//       <div className="flex items-center gap-2">
//         <button className="lg:hidden p-2 rounded-lg hover:bg-zinc-800" onClick={() => setShowMembersMobile(true)} title="Info">
//           <Info />
//         </button>

//         <button onClick={() => setSettingsOpen(true)} className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm">
//           <SettingsIcon size={16} /> Settings
//         </button>

//         {amAdmin && (
//           <button onClick={() => setConfirmDelete(true)} className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm">
//             <Trash2 size={16} /> Delete
//           </button>
//         )}

//         {amAdmin && (
//           <button onClick={() => setPickerOpen(true)} className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-500 text-white text-sm">
//             <UserPlus size={16} /> Add
//           </button>
//         )}
//       </div>
//     </div>
//   );

//   return (
//     <div className="min-h-screen h-screen bg-[#0b0d11] text-zinc-100 flex">
//       <Toaster position="top-right" />

//       {/* LEFT: groups list (drawer on mobile) */}
//       {!embedded && (
//         <aside
//           className={`fixed lg:static inset-y-0 left-0 w-[85%] sm:w-80 lg:w-80 z-40 bg-[#0b0d11] border-r border-zinc-800 flex-shrink-0 flex flex-col transform transition-transform ${
//             showLeft ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
//           }`}
//         >
//           <div className="h-14 px-4 border-b border-zinc-800 flex items-center justify-between">
//             <div className="flex items-center gap-2">
//               <Users size={18} className="text-zinc-400" />
//               <h2 className="font-semibold">Groups</h2>
//             </div>
//             <div className="flex items-center gap-2">
//               <button
//                 onClick={() => setCreateOpen(true)}
//                 className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-green-600 hover:bg-green-500 text-white text-sm"
//               >
//                 <Plus size={16} /> New
//               </button>
//               <button className="lg:hidden p-2 rounded-lg hover:bg-zinc-800" onClick={() => setShowLeft(false)}>✕</button>
//             </div>
//           </div>

//           <div className="p-3 border-b border-zinc-800">
//             <div className="flex items-center gap-2 bg-[#0f1216] border border-zinc-700 rounded-xl px-3 py-2">
//               <Search size={16} className="text-zinc-500" />
//               <input
//                 placeholder="Search groups..."
//                 value={searchQ}
//                 onChange={(e) => setSearchQ(e.target.value)}
//                 className="bg-transparent outline-none text-zinc-300 w-full"
//               />
//             </div>
//           </div>

//           <div className="overflow-y-auto h-[calc(100vh-112px)]">
//             {loadingGroups && <p className="p-3 text-zinc-400">Loading…</p>}
//             {!loadingGroups && !groups.length && <p className="p-3 text-zinc-500">No groups yet</p>}
//             {groups.map((g) => {
//               const isActive = active?._id === g._id;
//               const count = unread[g._id] || 0;
//               return (
//                 <button
//                   key={g._id}
//                 onClick={() => navigate(`/g/${g._id}`)}
//                   className={`w-full text-left px-4 py-3 border-b border-zinc-900 hover:bg-zinc-900/60 transition ${isActive ? "bg-zinc-900/70" : ""}`}
//                 >
//                   <div className="flex items-center gap-3">
//                     <img src={g.profilePic || "/group-placeholder.png"} alt="" className="w-10 h-10 rounded-full object-cover" />
//                     <div className="flex-1 min-w-0">
//                       <div className="flex items-center gap-2">
//                         <div className="font-medium truncate">{g.name}</div>
//                         {isAdminOfGroup(g, myId) && <Crown size={14} className="text-yellow-500" title="You are admin" />}
//                       </div>
//                       <div className="text-xs text-zinc-500 flex items-center gap-2">
//                         <span className="truncate">{g.lastMessage?.text || "No messages yet"}</span>
//                       </div>
//                     </div>
//                     <div className="text-right">
//                       <div className="text-[10px] text-zinc-500">
//                         {g.lastMessage?.time ? fmtTime(g.lastMessage.time) : ""}
//                       </div>
//                       {count > 0 && (
//                         <div className="mt-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-green-600 text-[10px]">
//                           {count}
//                         </div>
//                       )}
//                     </div>
//                   </div>
//                 </button>
//               );
//             })}
//           </div>
//         </aside>
//       )}

//       {/* RIGHT: group details + chat */}
//       <main className="flex-1 min-w-0 flex flex-col">
//         {!active ? (
//           <div className="h-full grid place-items-center px-6">
//             <div className="text-center max-w-sm">
//               <Users className="mx-auto mb-3 text-zinc-600" />
//               <p className="text-zinc-400">Select a group to manage & chat</p>
//             </div>
//           </div>
//         ) : (
//           <>
//             <ChatHeader />

//             <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
//               {/* chat column */}
//               <div className="flex-1 min-w-0 border-r border-zinc-800 flex flex-col">
//                 {/* messages */}
//                 <div ref={listRef} className="flex-1 overflow-y-auto p-3 sm:p-4 bg-[#070809]">
//                   {(!messages || (Array.isArray(messages) && messages.length === 0)) && (
//                     <p className="text-zinc-500">No messages yet — say hi 👋</p>
//                   )}

//                   {Array.isArray(messages) &&
//                     messages.map((m, i) => {
//                       const senderId =
//                         (typeof m.msgByUser === "object" ? m.msgByUser?._id : m.msgByUser) ||
//                         (typeof m.sender === "object" ? m.sender?._id : m.sender);
//                       const isMe = String(senderId) === String(myId);
//                       const time = fmtTime(m.createdAt || m.timestamp || new Date());

//                       const wrap = isMe ? "text-right" : "text-left";
//                       const bubble = isMe
//                         ? "bg-emerald-700 text-white"
//                         : "bg-[#1f2c34] text-zinc-100";

//                       return (
//                         <div key={m._id || `i-${i}`} className={`mb-2 sm:mb-3 ${wrap}`}>
//                           <div className={`inline-block px-3 py-2 rounded-2xl max-w-[85%] sm:max-w-[75%] break-words ${bubble}`}>
//                             {(!m.messageType || m.messageType === "text") && (
//                               <div className="whitespace-pre-wrap">{getTextFromMessage(m)}</div>
//                             )}

//                             {m.messageType === "image" && m.url && (
//                               <ImageBubble url={m.url} fileName={m.fileName} />
//                             )}

//                             {m.messageType === "file" && m.url && (
//                               <FileBubble
//                                 url={m.url}
//                                 fileName={m.fileName || m.filename || m.name}
//                                 size={typeof m.size === "number" ? m.size : m.fileSize}
//                               />
//                             )}

//                             {(m.messageType === "audio" || m.messageType === "voice") && m.url && (
//                               <VoiceBubble src={m.url} />
//                             )}

//                             <div className={`text-[10px] mt-1 ${isMe ? "text-white/75" : "text-zinc-300/70"} text-right`}>
//                               {time}
//                               <SeenTicks m={m} isMe={isMe} />
//                               {m.__temp ? " " : ""}
//                             </div>
//                           </div>
//                         </div>
//                       );
//                     })}
//                   <div ref={messagesEndRef} />
//                 </div>

//                 {/* input row */}
//                 <div className="p-2 sm:p-3 border-t border-zinc-800 flex items-center gap-2">
//                   <input
//                     ref={fileRef}
//                     id="fileInput"
//                     type="file"
//                     accept="image/*,audio/*,application/pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,*/*"
//                     hidden
//                     onChange={(e) => {
//                       const file = e.target.files?.[0];
//                       if (!file) return;
//                       sendFile(file, detectMessageType(file));
//                       e.target.value = null;
//                     }}
//                   />
//                   <button onClick={() => fileRef.current?.click()} className="p-2 rounded-md hover:bg-zinc-900" title="Attach">
//                     <Paperclip />
//                   </button>

//                   <div className="relative">
//                     <button onClick={() => setShowEmoji((s) => !s)} className="p-2 rounded-md hover:bg-zinc-900" title="Emoji">
//                       <Smile />
//                     </button>
//                     {showEmoji && (
//                       <div className="absolute bottom-12 left-0 bg-[#0e1013] border border-zinc-700 p-2 rounded-lg grid grid-cols-8 gap-1 shadow z-20 max-h-56 overflow-y-auto w-[18rem]">
//                         {EMOJIS.map((e, idx) => (
//                           <button
//                             key={`${e}-${idx}`}
//                             onClick={() => {
//                               addEmoji(e);
//                               setShowEmoji(false);
//                             }}
//                             className="p-1 text-lg"
//                             title={e}
//                           >
//                             {e}
//                           </button>
//                         ))}
//                       </div>
//                     )}
//                   </div>

//                   <input
//                     value={newMsg}
//                     onChange={(e) => setNewMsg(e.target.value)}
//                     onKeyDown={(e) => { if (e.key === "Enter") sendGroupMessage(); }}
//                     placeholder="Type a message…"
//                     className="flex-1 px-3 py-2 rounded-xl bg-[#0b0d11] border border-zinc-700 outline-none text-zinc-200"
//                   />

//                   <button
//                     onClick={toggleRecord}
//                     className={`p-2 rounded-md hover:bg-zinc-900 ${recording ? "text-red-500" : ""}`}
//                     title={recording ? "Stop recording" : "Record voice"}
//                   >
//                     <Mic />
//                   </button>

//                   <button
//                     onClick={sendGroupMessage}
//                     disabled={!newMsg.trim() || sending}
//                     className={`px-3 sm:px-4 py-2 rounded-xl text-white flex items-center gap-2 ${
//                       !newMsg.trim() || sending ? "bg-emerald-900 cursor-not-allowed" : "bg-emerald-700 hover:bg-emerald-600"
//                     }`}
//                   >
//                     <Send size={16} /> <span className="hidden sm:inline">Send</span>
//                   </button>
//                 </div>
//               </div>
//             </div>
//           </>
//         )}
//       </main>

//       {/* Mobile Members Drawer */}
//       {showMembersMobile && active && (
//         <div className="fixed inset-0 z-40 lg:hidden">
//           <div className="absolute inset-0 bg-black/60" onClick={() => setShowMembersMobile(false)} />
//           <div className="absolute right-0 top-0 bottom-0 w-[85%] sm:w-[22rem] bg-[#0b0d11] border-l border-zinc-800 p-4 overflow-y-auto">
//             <div className="flex items-center justify-between mb-3">
//               <h3 className="text-sm text-zinc-400">Members</h3>
//               <button onClick={() => setShowMembersMobile(false)} className="p-2 rounded-lg hover:bg-zinc-800">✕</button>
//             </div>
//             <div className="grid grid-cols-1 gap-2">
//               {active?.members?.map((m) => {
//                 const isAdmin = isAdminOfGroup(active, m);
//                 const id = getId(m);
//                 return (
//                   <div key={id} className="border border-zinc-800 rounded-xl p-3 bg-[#0e1013]">
//                     <div className="flex items-start justify-between">
//                       <div className="min-w-0">
//                         <div className="font-medium truncate">{m.name || m.email}</div>
//                         <div className="text-xs text-zinc-500 truncate">{m.email}</div>
//                       </div>
//                       {isAdmin && (
//                         <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-700/40">
//                           <Crown size={12} /> Admin
//                         </span>
//                       )}
//                     </div>
//                     <div className="mt-3 flex items-center gap-2">
//                       {amAdmin && !isAdmin && (
//                         <>
//                           <button onClick={() => makeAdmin(id)} className="px-2.5 py-1 rounded-lg bg-yellow-600 hover:bg-yellow-500 text-white text-xs">Make Admin</button>
//                           <button onClick={() => removeMember(id)} className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs">Remove</button>
//                         </>
//                       )}
//                     </div>
//                   </div>
//                 );
//               })}
//             </div>
//             <button
//               onClick={() => { setSettingsOpen(true); setShowMembersMobile(false); }}
//               className="mt-4 w-full px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700"
//             >
//               <SettingsIcon size={14} className="inline mr-1" /> Open Settings
//             </button>
//           </div>
//         </div>
//       )}

//       {/* Create Group Modal */}
//       <Modal
//         open={createOpen}
//         onClose={resetCreate}
//         title="Create Group"
//         footer={
//           <div className="flex justify-end gap-2">
//             <button onClick={resetCreate} className="px-3 py-1.5 rounded-lg bg-zinc-700 text-zinc-200 hover:bg-zinc-600">Cancel</button>
//             <button
//               onClick={handleCreate}
//               disabled={creating}
//               className={`px-3 py-1.5 rounded-lg text-white ${creating ? "bg-green-800 cursor-not-allowed" : "bg-green-600 hover:bg-green-500"}`}
//             >
//               {creating ? "Creating..." : "Create"}
//             </button>
//           </div>
//         }
//       >
//         <div className="space-y-4">
//           <div>
//             <label className="block text-sm mb-1 text-zinc-300">Group Name</label>
//             <input
//               value={gName}
//               onChange={(e) => setGName(e.target.value)}
//               placeholder="Enter group name"
//               className="w-full bg-[#0e1013] border border-zinc-700 rounded-xl px-3 py-2 text-zinc-200 outline-none focus:border-zinc-500"
//             />
//           </div>
//           <div>
//             <label className="block text-sm mb-1 text-zinc-300">Group Photo</label>
//             <input type="file" accept="image/*" onChange={(e) => onPickPhoto(e.target.files?.[0] || null)} />
//             {gPhotoPreview && <img src={gPhotoPreview} alt="preview" className="w-16 h-16 rounded-full object-cover mt-2" />}
//           </div>
//           <div>
//             <label className="block text-sm mb-1 text-zinc-300">Members</label>
//             <button onClick={() => setPickerOpen(true)} className="px-3 py-1.5 rounded-lg bg-emerald-700 text-white hover:bg-emerald-600 text-sm">
//               Pick Members ({gMembers.length})
//             </button>
//           </div>
//         </div>
//       </Modal>

//       {/* MemberPicker */}
//       <MemberPicker
//         open={pickerOpen}
//         onClose={() => setPickerOpen(false)}
//         onSubmit={async (picked) => {
//           if (!picked.length) return toast("ℹ️ No members selected");
//           setGMembers(picked);
//           setPickerOpen(false);
//           if (!active) return;
//           try {
//             const ids = picked.map((p) => p._id);
//             await Promise.all(ids.map((userId) => http.put("/api/groups/add-member", { groupId: active._id, userId })));
//             toast.success("Members added");
//             openGroup(active._id);
//           } catch (e) {
//             console.error(e);
//             toast.error(e?.response?.data?.message || "Add failed");
//           }
//         }}
//         excludeIds={[...gMembers.map((m) => m._id), ...(active?.members?.map((m) => getId(m)) || [])]}
//       />

//       {/* Settings modal */}
//       <Modal
//         open={settingsOpen}
//         onClose={() => setSettingsOpen(false)}
//         title="Group Settings"
//         wide
//         footer={
//           <div className="flex justify-end w-full gap-2">
//             {amAdmin && (
//               <>
//                 <button onClick={() => setPickerOpen(true)} className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white">
//                   Add Members
//                 </button>
//                 <button
//                   onClick={async () => {
//                     const nextName = (settingsDraft.name ?? "").trim();
//                     const curName  = (active?.name ?? "").trim();
//                     const nextPic  = settingsDraft.profilePic ?? "";
//                     const curPic   = active?.profilePic ?? "";

//                     const changed = {};
//                     if (nextName && nextName !== curName) changed.name = nextName;
//                     if (nextPic && nextPic !== curPic)     changed.profilePic = nextPic;

//                     if (Object.keys(changed).length === 0) {
//                       toast("No changes");
//                       return;
//                     }
//                     await updateGroup(changed);
//                   }}
//                   className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white"
//                 >
//                   Save Changes
//                 </button>
//               </>
//             )}
//           </div>
//         }
//       >
//         {!active ? null : (
//           <div className="space-y-6">
//             {/* Basics */}
//             <section>
//               <h4 className="text-sm font-semibold text-zinc-300 mb-2">Basic Info</h4>
//               <div className="flex items-center gap-4">
//                 <img
//                   src={settingsDraft.profilePic || active?.profilePic || "/group-placeholder.png"}
//                   alt="group"
//                   className="w-16 h-16 rounded-full object-cover border border-zinc-700"
//                 />
//                 <div className="space-y-2 flex-1">
//                   <input
//                     value={settingsDraft.name}
//                     onChange={(e) => setSettingsDraft((s) => ({ ...s, name: e.target.value }))}
//                     className="w-full bg-[#0e1013] border border-zinc-700 rounded-xl px-3 py-2 text-zinc-200 outline-none focus:border-zinc-500"
//                     placeholder="Group name"
//                     disabled={!amAdmin}
//                   />
//                   {amAdmin && (
//                     <div className="flex items-center gap-2 text-sm">
//                       <input
//                         type="file"
//                         accept="image/*"
//                         onChange={async (e) => {
//                           const f = e.target.files?.[0];
//                           if (!f) return;
//                           try {
//                             const t = toast.loading("Uploading photo...");
//                             const res = await uploadFile(f);
//                             toast.dismiss(t);
//                             const url = res?.secure_url;
//                             if (!url) throw new Error("Upload failed");
//                             setSettingsDraft((s) => ({ ...s, profilePic: url }));
//                             toast.success("Photo ready. Click Save Changes.");
//                           } catch {
//                             toast.error("Photo upload failed");
//                           }
//                         }}
//                       />
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </section>

//             {/* Members */}
//             <section>
//               <h4 className="text-sm font-semibold text-zinc-300 mb-2">Members</h4>
//               <div className="grid sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto">
//                 {active?.members?.map((m) => {
//                   const isAdminMember = isAdminOfGroup(active, m);
//                   const id = getId(m);
//                   return (
//                     <div key={id} className="flex items-center justify-between bg-[#0e1013] p-2 rounded border border-zinc-700">
//                       <div className="min-w-0">
//                         <div className="font-medium truncate">{m.name || m.email}</div>
//                         <div className="text-xs text-zinc-500 truncate">{m.email}</div>
//                       </div>
//                       <div className="flex items-center gap-2">
//                         {isAdminMember && (
//                           <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-700/40">
//                             <Crown size={12} className="inline mr-1" /> Admin
//                           </span>
//                         )}
//                         {amAdmin && !isAdminMember && (
//                           <>
//                             <button onClick={() => makeAdmin(id)} className="px-2 py-0.5 rounded bg-yellow-600 text-xs">Make Admin</button>
//                             <button onClick={() => removeMember(id)} className="px-2 py-0.5 rounded bg-red-600 text-xs">Remove</button>
//                           </>
//                         )}
//                       </div>
//                     </div>
//                   );
//                 })}
//               </div>
//             </section>

//             {/* Past Members */}
//             <section>
//               <div className="flex items-center justify-between">
//                 <h4 className="text-sm font-semibold text-zinc-300">Past Members</h4>
//                 <button className="text-xs underline" onClick={() => fetchPastMembers(active._id)}>Refresh</button>
//               </div>
//               {!pastMembers?.length ? (
//                 <p className="text-sm text-zinc-500 mt-1">No past members found.</p>
//               ) : (
//                 <div className="grid sm:grid-cols-2 gap-2 mt-2 max-h-48 overflow-y-auto">
//                   {pastMembers.map((m) => {
//                     const id = getId(m) || m?.user?._id;
//                     return (
//                       <div key={id} className="flex items-center justify-between bg-[#0e1013] p-2 rounded border border-zinc-700">
//                         <div className="min-w-0">
//                           <div className="font-medium truncate">{m.name || m.email}</div>
//                           <div className="text-xs text-zinc-500 truncate">{m.email}</div>
//                         </div>
//                         {amAdmin && (
//                           <button
//                             onClick={async () => {
//                               try {
//                                 await http.put("/api/groups/add-member", { groupId: active._id, userId: id });
//                                 toast.success("Re-added to group");
//                                 openGroup(active._id);
//                                 fetchPastMembers(active._id);
//                               } catch {
//                                 toast.error("Failed to re-add");
//                               }
//                             }}
//                             className="px-2 py-0.5 rounded bg-emerald-700 text-xs"
//                           >
//                             Re-add
//                           </button>
//                         )}
//                       </div>
//                     );
//                   })}
//                 </div>
//               )}
//             </section>

//             {/* Danger zone */}
//             <section className="pt-2 border-t border-zinc-800">
//               <h4 className="text-sm font-semibold text-zinc-300 mb-2">Danger Zone</h4>
//               <div className="flex flex-wrap gap-2">
//                 {!amAdmin && (
//                   <button onClick={() => setConfirmLeave(true)} className="px-3 py-1.5 rounded-lg bg-zinc-700 hover:bg-zinc-600">
//                     <LogOut className="inline mr-1" size={14} /> Leave Group
//                   </button>
//                 )}
//                 {amAdmin && (
//                   <button onClick={() => setConfirmDelete(true)} className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white">
//                     <Trash2 className="inline mr-1" size={14} /> Delete Group
//                   </button>
//                 )}
//               </div>
//             </section>
//           </div>
//         )}
//       </Modal>

//       {/* Confirms */}
//       <Confirm
//         open={confirmDelete}
//         onClose={() => setConfirmDelete(false)}
//         onConfirm={deleteGroup}
//         title="Delete Group"
//         message="Are you sure you want to delete this group? This action cannot be undone."
//         danger
//       />
//       <Confirm
//         open={confirmLeave}
//         onClose={() => setConfirmLeave(false)}
//         onConfirm={leaveGroup}
//         title="Leave Group"
//         message="Are you sure you want to leave this group?"
//       />
//     </div>
//   );
// }
import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocalStorage } from "@mantine/hooks";
import {
  Search,
  Plus,
  Users,
  UserPlus,
  Crown,
  Trash2,
  LogOut,
  Settings as SettingsIcon,
  Send,
  Paperclip,
  Smile,
  Mic,
  FileText,
  Image as ImageIcon,
  Play,
  Pause,
  ChevronLeft,
  Info,
  Check,
  CheckCheck, MoreVertical, Pencil, Trash2 as Trash
} from "lucide-react";
import { GetSocket } from "../utils/Sockets";
import http from "../utils/http";
import toast, { Toaster } from "react-hot-toast";
import uploadFile from "../utils/uploadFile";
import { useNavigate, useParams } from "react-router-dom";

/* =========================== Small UI helpers =========================== */
const Modal = ({ open, onClose, title, children, footer, wide = false, zIndex = 70 }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 flex items-center justify-center p-3 z-[70]" style={{ zIndex }}>
      <div className="absolute inset-0 bg-black/60" onClick={onClose} />
      <div className={`relative w-full ${wide ? "max-w-3xl" : "max-w-lg"} rounded-2xl bg-[#121418] border border-zinc-700 shadow-xl`}>
        <div className="px-5 py-4 border-b border-zinc-700 flex items-center justify-between">
          <h3 className="text-zinc-100 font-semibold">{title}</h3>
          <button onClick={onClose} className="text-zinc-400 hover:text-zinc-200 transition" aria-label="Close">✕</button>
        </div>
        <div className="px-5 py-4 max-h-[70vh] overflow-y-auto">{children}</div>
        {footer && <div className="px-5 py-4 border-t border-zinc-700">{footer}</div>}
      </div>
    </div>
  );
};

const Confirm = ({ open, onClose, onConfirm, title, message, danger }) => (
  <Modal
    open={open}
    onClose={onClose}
    title={title}
    footer={
      <div className="flex justify-end gap-2">
        <button onClick={onClose} className="px-3 py-1.5 rounded-lg bg-zinc-700 text-zinc-200 hover:bg-zinc-600">Cancel</button>
        <button
          onClick={() => { onConfirm(); onClose(); }}
          className={`px-3 py-1.5 rounded-lg ${danger ? "bg-red-600 hover:bg-red-500" : "bg-green-600 hover:bg-green-500"} text-white`}
        >
          Confirm
        </button>
      </div>
    }
  >
    <p className="text-zinc-300">{message}</p>
  </Modal>
);

/* =========================== Member Picker =========================== */
const MemberPicker = ({ open, onClose, onSubmit, excludeIds = [] }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [selected, setSelected] = useState([]);
          // text being edited

  useEffect(() => {
    if (!open) return;
    setQuery("");
    setResults([]);
    setSelected([]);
  }, [open]);

  const searchUsers = async (q) => {
    try {
      const { data } = await http.post("/api/searchUser", { searchRes: q });
      const list = data?.users || [];
      const filtered = list.filter((u) => !excludeIds.includes(u._id));
      setResults(filtered);
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to search users");
    }
  };

  useEffect(() => {
    const t = setTimeout(() => {
      if (query.trim()) searchUsers(query.trim());
      else setResults([]);
    }, 300);
    return () => clearTimeout(t);
  }, [query]);

  const toggle = (u) =>
    setSelected((prev) =>
      prev.find((p) => p._id === u._id) ? prev.filter((p) => p._id !== u._id) : [...prev, u]
    );

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Add members"
      zIndex={90}
      footer={
        <div className="flex justify-between items-center w-full">
          <div className="text-sm text-zinc-400">{selected.length} selected</div>
          <div className="flex gap-2">
            <button onClick={onClose} className="px-3 py-1.5 rounded-lg bg-zinc-700 text-zinc-200 hover:bg-zinc-600">
              Close
            </button>
            <button
              onClick={() => {
                if (!selected.length) return toast.error("Pick at least one member");
                onSubmit(selected);
              }}
              className="px-3 py-1.5 rounded-lg bg-green-600 text-white hover:bg-green-500"
            >
              Add
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-3">
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search name or email"
          className="w-full bg-[#0e1013] border border-zinc-700 rounded-xl px-3 py-2 text-zinc-200 outline-none focus:border-zinc-500"
        />
        <div className="max-h-72 overflow-y-auto space-y-1">
          {results.map((u) => {
            const isPicked = !!selected.find((s) => s._id === u._id);
            return (
              <button
                key={u._id}
                onClick={() => toggle(u)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg border ${
                  isPicked ? "border-green-600 bg-green-600/10" : "border-zinc-700 hover:bg-zinc-800/40"
                } text-left`}
              >
                <div className="text-zinc-100">
                  <div className="font-medium">{u.name || u.email}</div>
                  <div className="text-xs text-zinc-400">{u.email}</div>
                </div>
                <span className="text-xs text-zinc-400">{isPicked ? "Selected" : "Pick"}</span>
              </button>
            );
          })}
          {!results.length && query && <p className="text-sm text-zinc-500 px-1">No users found.</p>}
        </div>
      </div>
    </Modal>
  );
};

/* =========================== Utils =========================== */
const fmtTime = (d) => {
  try {
    const date = new Date(d);
    return isNaN(date) ? "" : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch {
    return "";
  }
};

const fileSize = (bytes = 0) => {
  if (!bytes) return "";
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
};

const getTextFromMessage = (m) => {
  if (m?.text) return m.text;
  if (m?.content) return m.content;
  if (m?.message) return m.message;
  if (m?.messageType === "image") return "🖼️ Photo";
  if (m?.messageType === "audio" || m?.messageType === "voice") return "🎙️ Voice message";
  if (m?.messageType === "file") return "📎 File";
  return "";
};

const dedupeMessages = (arr = []) => {
  const map = new Map();
  for (const m of arr || []) {
    if (!m) continue;
    if (m._id) {
      map.set(m._id, m);
    } else {
      const t = new Date(m.createdAt || m.timestamp || m.time || 0).getTime();
      const key = `${m.clientNonce || ""}-${t}-${m.text || m.url || Math.random()}`;
      if (!map.has(key)) map.set(key, m);
    }
  }
  return Array.from(map.values()).sort(
    (a, b) =>
      new Date(a.createdAt || a.timestamp || 0) - new Date(b.createdAt || b.timestamp || 0)
  );
};

const EMOJIS = [
  "😀","😁","😂","🤣","😃","😄","😅","😆","😉","😊","🙂","🙃","😋","😎","😍","😘","😗","😙","😚","🥰","🥲","😇","🤩","🥳","😏","😒","😞","😔","😟","😕","🙁","☹️","😣","😖","😫","😩","🥺","😢","😭","😤","😠","😡","🤬","🤯","😳","🥵","🥶","😱","😨","😰","😥","😓","🤗","🤔","🤭","🤫","🤥","😶","😐","😑","🫠","🙄","😬","😮‍💨","🤤","😴","😪","😮","😯","😲","😦","😧","😵","🥴","🤐","🤢","🤮","🤧","😷","🤕","🤒","🤑","🤠","🥸",
  "👍","👎","👌","✌️","🤞","🤟","🤘","🤙","👈","👉","👆","👇","☝️","✋","🤚","🖐️","🖖","👋","🤝","🙏","👏","🙌","🫶","🫰","🤌","🫵","💪","🦾",
  "👶","🧒","👦","👧","🧑","👨","👩","🧓","👴","👵","👮","🕵️","💂","👷","🧑‍⚕️","🧑‍🏫","🧑‍💻","🧑‍🍳","🧑‍🎓","🧑‍🚀","🧑‍🎨","🧑‍🔧","🧑‍🔬",
  "🐶","🐱","🐭","🐹","🐰","🦊","🐻","🐼","🐨","🐯","🦁","🐮","🐷","🐸","🐵","🦄","🐔","🐧","🐦","🐤","🐣","🐥","🦆","🦅","🦉","🦇","🐺","🐗","🐴","🐝","🪲","🦋","🐛","🐞","🐜","🦂","🕷️","🐢","🐍","🦎","🦖","🐙","🦑","🦐","🦞","🐠","🐟","🐬","🐳","🌲","🌳","🌴","🌵","🌷","🌹","🌺","🌸","🌼","🌻","🌞","🌝","🌚","⭐","🌟","⚡","🔥","🌈","☔","❄️","🌧️","🌨️","☁️",
  "🍏","🍎","🍐","🍊","🍋","🍌","🍉","🍇","🍓","🫐","🍈","🍒","🍑","🥭","🍍","🥥","🥝","🍅","🥑","🍆","🥦","🥬","🥒","🌶️","🫑","🌽","🥕","🧄","🧅","🥔","🍞","🥐","🥖","🥨","🥯","🧇","🥞","🧈","🍗","🍖","🍔","🍟","🍕","🌭","🥪","🌮","🌯","🥙","🧆","🥘","🍲","🍝","🍣","🍱","🍜","🍛","🍚","🍙","🍤","🥟","🍡","🍧","🍨","🍦","🍰","🎂","🧁","🍮","🍭","🍬","🍫","🍿","🍩","🍪","☕","🍵","🧋","🥤","🍺","🍻","🍷","🍸","🍹",
  "🚗","🚕","🚙","🚌","🚎","🏎️","🚓","🚑","🚒","🚐","🛻","🚚","🚛","🚜","🛵","🏍️","🚲","🛴","✈️","🛫","🛬","🛩️","🚀","🛸","🚁","⛵","🚢","⚓","🗼","🗽","🗿","🗺️","🏔️","🏖️","🏝️","🏙️","🏛️","🏟️","🏥","🏬","🏪","🏫","🏠","🏡",
  "⚽","🏀","🏈","⚾","🎾","🏐","🏉","🎱","🏓","🏸","🥊","🥋","🎮","🎲","🧩","♟️","🎯","🎹","🎸","🎻","🥁","🎤","🎧","📷","🎥","📱","💻","⌨️","🖱️","💡","🔦","🕯️","📦","✉️","📫","📎","🖇️","📌","📍","✂️","🧵","🧶","🔒","🔓","🔑","🧰","🧱","🧲","🧪","🔬","🔭","📚","🗒️","🗂️","🗃️","🧾","🧮",
  "❤️","🧡","💛","💚","💙","💜","🖤","🤍","🤎","💖","💗","💓","💞","💕","💘","💔","💬","💭","💤","✅","☑️","❌","❗","❓","⚠️","♻️","🔝","🔜","🔙","🔎","🔍","#","*","™️","©️","®️",
];

/* translation helpers */
const safeText = (v) => (typeof v === "string" ? v : "");
const EMOJI_RE =
  /^(?:\p{Emoji_Presentation}|\p{Extended_Pictographic}|\p{Emoji}|\s)+$/u;
const isEmojiOnly = (s = "") => !!s && EMOJI_RE.test(s);

/* helpers for admin checks */
const getId = (x) => (typeof x === "string" ? x : x?._id || x?.id || x);
const isAdminOfGroup = (group, user) => {
  const uid = getId(user);
  const arr = group?.admins || [];
  return arr.some((a) => getId(a) === uid);
};

/* ---- Message normalizer (includes translation fields) ------------------ */
const normalizeMessage = (rawIn) => {
  if (!rawIn) return null;
  const m = rawIn.message ? rawIn.message : rawIn;

  const senderObj = m.msgByUser || m.sender || m.user || m.from || null;
  const senderId =
    (typeof senderObj === "object" ? senderObj?._id : senderObj) ||
    m.userId ||
    m.senderId ||
    null;

  const createdAt = m.createdAt || m.timestamp || m.time || new Date().toISOString();

  const text =
    m.text ??
    m.content ??
    (typeof m.message === "string" ? m.message : null) ??
    m.body ??
    "";

  const url =
    m.url ??
    m.fileUrl ??
    m.mediaUrl ??
    m.attachmentUrl ??
    m.imageUrl ??
    m.audioUrl ??
    m.videoUrl ??
    null;

  const fileName = m.fileName || m.filename || m.name || null;
  const size =
    typeof m.size === "number"
      ? m.size
      : typeof m.fileSize === "number"
      ? m.fileSize
      : null;

  let messageType =
    m.messageType ||
    m.type ||
    m.msgType ||
    (url
      ? m.fileType?.startsWith("image")
        ? "image"
        : m.fileType?.startsWith("audio")
        ? "audio"
        : "file"
      : undefined);

  if (!messageType) {
    if (url) {
      const low = String(url).toLowerCase();
      if (low.match(/\.(png|jpe?g|gif|webp|bmp|svg)(\?|$)/)) messageType = "image";
      else if (low.match(/\.(mp3|wav|m4a|ogg|webm)(\?|$)/)) messageType = "audio";
      else messageType = "file";
    } else {
      messageType = "text";
    }
  }
  if (messageType === "voice") messageType = "audio";

  const clientNonce = m.clientNonce || rawIn.clientNonce || null;

  // translation fields (normalize names)
  const translatedText =
  m.translatedText ?? m.translatedMessage ?? m.translatedVoiceText ?? null;
  const translatedVoiceText = m.translatedVoiceText ?? null;
  const originalVoiceText = m.originalVoiceText ?? m.voiceTranscription ?? null;

  return {
    ...m,
    _id: m._id || rawIn._id || undefined,
    groupId: m.groupId || rawIn.groupId || undefined,
    sender: senderObj,
    msgByUser: senderObj,
    senderId,
    createdAt,
    text,
    url,
    fileName,
    size,
    fileSize: size ?? m.fileSize ?? null,
    messageType,
    clientNonce,
    translatedText,
    translatedVoiceText,
    originalVoiceText,
  };
};

/* =========================== Message UI bits =========================== */
const Lightbox = ({ open, src, onClose, caption }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 bg-black/90 z-[80] flex items-center justify-center p-4" onClick={onClose}>
      <img src={src} alt={caption || "image"} className="max-h-[90vh] max-w-[90vw] rounded-xl object-contain" />
    </div>
  );
};

const VoiceBubble = ({ src }) => {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [cur, setCur] = useState(0);
  const [dur, setDur] = useState(0);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return;
    const onTime = () => setCur(a.currentTime || 0);
    const onMeta = () => setDur(a.duration || 0);
    const onEnd = () => setPlaying(false);
    a.addEventListener("timeupdate", onTime);
    a.addEventListener("loadedmetadata", onMeta);
    a.addEventListener("ended", onEnd);
    return () => {
      a.removeEventListener("timeupdate", onTime);
      a.removeEventListener("loadedmetadata", onMeta);
      a.removeEventListener("ended", onEnd);
    };
  }, []);

  const toggle = () => {
    const a = audioRef.current;
    if (!a) return;
    if (a.paused) {
      a.play().catch(() => {});
      setPlaying(true);
    } else {
      a.pause();
      setPlaying(false);
    }
  };

  const pct = dur ? (cur / dur) * 100 : 0;
  const mmss = (s) => {
    if (!Number.isFinite(s) || s < 0) s = 0;
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = Math.floor(s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  return (
    <div className="flex items-center gap-3 text-zinc-100">
      <button onClick={toggle} className="w-9 h-9 rounded-full grid place-items-center bg-black/20 hover:opacity-90" title={playing ? "Pause" : "Play"}>
        {playing ? <Pause size={18} /> : <Play size={18} />}
      </button>
      <div className="w-40 sm:w-56 md:w-72">
        <div className="h-1.5 rounded-full bg-zinc-300/30">
          <div className="h-1.5 rounded-full bg-zinc-100" style={{ width: `${pct}%` }} />
        </div>
        <div className="text-[10px] mt-1 opacity-80">
          {mmss(cur)} / {mmss(dur || 0)}
        </div>
      </div>
      <audio ref={audioRef} src={src} preload="metadata" className="hidden" />
    </div>
  );
};

const FileBubble = ({ url, fileName, size }) => {
  const name = fileName || url?.split("/").pop() || "File";
  return (
    <div className="flex items-center gap-3 p-2 rounded-xl bg-black/10">
      <div className="w-10 h-10 rounded-lg bg-black/20 grid place-items-center">
        <FileText />
      </div>
      <div className="min-w-0 flex-1">
        <div className="text-sm truncate">{name}</div>
        <div className="text-[11px] opacity-70">{fileSize(size)}</div>
      </div>
      {!!url && (
        <>
          <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs underline opacity-90 hover:opacity-100">Open</a>
          <a href={url} download={name} className="text-xs underline opacity-90 hover:opacity-100">Download</a>
        </>
      )}
    </div>
  );
};

const ImageBubble = ({ url, fileName }) => {
  const [open, setOpen] = useState(false);
  return (
    <>
      <div className="overflow-hidden rounded-xl border border-white/10 bg-black/10">
        <img
          src={url}
          alt={fileName || "image"}
          className="max-h-72 object-cover cursor-zoom-in max-w-[min(80vw,420px)]"
          onClick={() => setOpen(true)}
        />
        <div className="flex items-center justify-between px-2 py-1 text-[11px] opacity-80">
          <div className="flex items-center gap-1">
            <ImageIcon size={12} /> {fileName || "Image"}
          </div>
          <a href={url} target="_blank" rel="noopener noreferrer" download className="underline">
            Download
          </a>
        </div>
      </div>
      <Lightbox open={open} src={url} onClose={() => setOpen(false)} caption={fileName} />
    </>
  );
};

/* =========================== Main Component =========================== */
export default function GroupsChatContainer({ embedded = true, initialGroupId }) {
  const navigate = useNavigate();
  const params = useParams(); // expects route like /g/:groupId
  const routeGroupId = params?.groupId || params?.gid || null;
  const effectiveGroupId = routeGroupId || initialGroupId || null;

  const socket = GetSocket();
  const [userLS] = useLocalStorage({ key: "user" });

  const myId = useMemo(() => {
    if (userLS?._id) return userLS._id;
    try {
      const raw = localStorage.getItem("userData");
      const parsed = raw ? JSON.parse(raw) : null;
      return parsed?._id || parsed?.id || null;
    } catch {
      return null;
    }
  }, [userLS]);

  /* responsive drawers */
  const [showLeft, setShowLeft] = useState(!embedded);
  const [showMembersMobile, setShowMembersMobile] = useState(false);

  /* groups */
  const [allGroups, setAllGroups] = useState([]);
  const [groups, setGroups] = useState([]);
  const [searchQ, setSearchQ] = useState("");
  const [loadingGroups, setLoadingGroups] = useState(false);
  const [openMenuFor, setOpenMenuFor] = useState(null);     // messageId or null
const [editingId, setEditingId] = useState(null);          // messageId currently editing
const [editDraft, setEditDraft] = useState("");  

  /* active + messages */
  const [active, setActive] = useState(null);
  const [messages, setMessages] = useState([]);
  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);
  const listRef = useRef(null);

  /* seen tracking (client-side, from socket events) */
  const [seenByMap, setSeenByMap] = useState({});
  const seenThrottleRef = useRef(0);

  /* create group UI */
  const [createOpen, setCreateOpen] = useState(false);
  const [gName, setGName] = useState("");
  const [gMembers, setGMembers] = useState([]);
  const [gPhotoFile, setGPhotoFile] = useState(null);
  const [gPhotoPreview, setGPhotoPreview] = useState(null);
  const [creating, setCreating] = useState(false);

  /* modals & confirms */
  const [pickerOpen, setPickerOpen] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [confirmLeave, setConfirmLeave] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  /* emoji picker toggle */
  const [showEmoji, setShowEmoji] = useState(false);

  /* recording */
  const recordRef = useRef(null);
  const [recording, setRecording] = useState(false);

  /* unread counts client-side */
  const [unread, setUnread] = useState({});

  /* input */
  const [newMsg, setNewMsg] = useState("");

  /* settings modal state */
  const [pastMembers, setPastMembers] = useState([]);
  const [settingsDraft, setSettingsDraft] = useState({ name: "", profilePic: "" });

  /* translation UI state (group) */
  const [showOriginalMap, setShowOriginalMap] = useState({});
  const [showVoiceOriginalMap, setShowVoiceOriginalMap] = useState({});
  const [translatingMessageId, setTranslatingMessageId] = useState(null);

  useEffect(() => {
    if (!Array.isArray(messages)) setMessages(Array.isArray(messages) ? messages : []);
  }, [messages]);

  /* load groups */
  const loadMyGroups = async () => {
    try {
      setLoadingGroups(true);
      const { data } = await http.get("/api/groups");
      const list = data?.groups || [];
      setAllGroups(list);
      setGroups(list);
    } catch (err) {
      console.error("Failed to load groups", err);
      toast.error(err?.response?.data?.message || "Failed to load groups");
    } finally {
      setLoadingGroups(false);
    }
  };
  useEffect(() => { loadMyGroups(); }, []);

  /* open group if route/prop says so */
  useEffect(() => {
    if (effectiveGroupId) {
      openGroup(effectiveGroupId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveGroupId]);

  useEffect(() => {
    // no group in the route -> show placeholder
    if (!routeGroupId && !initialGroupId) {
      setActive(null);
      setMessages([]);
      setSeenByMap({});
      if (!embedded) setShowLeft(true); // keep the list visible on wide screens
    }
  }, [routeGroupId, initialGroupId, embedded]);

  /* search filter */
  useEffect(() => {
    const q = (searchQ || "").trim().toLowerCase();
    if (!q) setGroups(allGroups);
    else setGroups(allGroups.filter((g) => (g?.name || "").toLowerCase().includes(q)));
  }, [searchQ, allGroups]);

  /* ===== Past members fetch ===== */
  const fetchPastMembers = useCallback(
    async (gid) => {
      if (!gid) return setPastMembers([]);
      try {
        const { data } = await http.get(`/api/groups/${gid}/past-members`).catch(() => ({ data: null }));
        if (data?.pastMembers || data?.users) {
          setPastMembers(data.pastMembers || data.users || []);
          return;
        }
        const alt = await http.post(`/api/groups/past-members`, { groupId: gid }).catch(() => ({ data: null }));
        if (alt?.data?.pastMembers || alt?.data?.users) {
          setPastMembers(alt.data.pastMembers || alt.data.users || []);
          return;
        }
        setPastMembers(Array.isArray(active?.pastMembers) ? active.pastMembers : []);
      } catch {
        setPastMembers(Array.isArray(active?.pastMembers) ? active.pastMembers : []);
      }
    },
    [active]
  );

  useEffect(() => {
    if (!settingsOpen || !active?._id) return;
    setSettingsDraft({
      name: active.name || "",
      profilePic: active.profilePic || "",
    });
    fetchPastMembers(active._id);
  }, [settingsOpen, active?._id, fetchPastMembers]);

  /* ---------- seen helpers ---------- */
  const emitSeenGroup = useCallback(() => {
    if (!socket || !active?._id || !myId) return;
    const now = Date.now();
    if (now - (seenThrottleRef.current || 0) < 1500) return; // throttle 1.5s
    seenThrottleRef.current = now;
    socket.emit("seenGroup", { groupId: active._id, userId: myId });
  }, [socket, active?._id, myId]);

  /* replace optimistic with saved (preserve translation & file meta) */
  const replaceOptimisticWithSaved = useCallback((savedRaw) => {
    const savedMsg = normalizeMessage(savedRaw);
    if (!savedMsg) return;

    const savedId = savedMsg._id;
    const savedSender =
      (typeof savedMsg.msgByUser === "object" ? savedMsg.msgByUser?._id : savedMsg.msgByUser) ||
      (typeof savedMsg.sender === "object" ? savedMsg.sender?._id : savedMsg.sender);

    const savedType  = savedMsg.messageType || "text";
    const savedNonce = savedMsg.clientNonce;
    const savedText  = (getTextFromMessage(savedMsg) || "").trim().replace(/\s+/g, " ");
    const savedUrl   = savedMsg.url || "";
    const savedAt    = new Date(savedMsg.createdAt || savedMsg.timestamp || Date.now()).getTime();

    const mergePreserving = (oldM, newM) => {
      const merged = { ...oldM, ...newM };
      // URLs / files
      merged.url = newM.url ?? oldM.url ?? null;
      merged.fileName =
        newM.fileName ?? oldM.fileName ?? oldM.filename ?? oldM.name ?? null;
      const newSize =
        typeof newM.size === "number"
          ? newM.size
          : typeof newM.fileSize === "number"
          ? newM.fileSize
          : null;
      const oldSize =
        typeof oldM.size === "number"
          ? oldM.size
          : typeof oldM.fileSize === "number"
          ? oldM.fileSize
          : null;
      merged.size = newSize ?? oldSize ?? null;
      merged.fileSize = merged.size;

      // translations
      merged.translatedText =
        newM.translatedText ?? newM.translatedMessage ?? oldM.translatedText ?? oldM.translatedMessage ?? null;
      merged.translatedVoiceText =
        newM.translatedVoiceText ?? oldM.translatedVoiceText ?? null;
      merged.originalVoiceText =
        newM.originalVoiceText ?? newM.voiceTranscription ?? oldM.originalVoiceText ?? oldM.voiceTranscription ?? null;

      return merged;
    };

    setMessages((prev) => {
      const prevArr = Array.isArray(prev) ? prev : [];
      let replaced = false;

      let next = prevArr.map((m) => {
        if (m._id && savedId && m._id === savedId) { replaced = true; return mergePreserving(m, savedMsg); }
        if (m.__temp && savedNonce && m.clientNonce && m.clientNonce === savedNonce) { replaced = true; return mergePreserving(m, savedMsg); }

        if (m.__temp) {
          const mSender =
            (typeof m.msgByUser === "object" ? m.msgByUser?._id : m.msgByUser) ||
            (typeof m.sender === "object" ? m.sender?._id : m.sender);

          const sameSender = String(mSender || "") === String(savedSender || "");
          const sameType   = (m.messageType || "text") === savedType;

          const mText    = (getTextFromMessage(m) || "").trim().replace(/\s+/g, " ");
          const sameText = !!savedText && mText === savedText;
          const sameUrl  = !!savedUrl && m.url === savedUrl;

          const mAt = new Date(m.createdAt || m.timestamp || 0).getTime();
          const closeInTime = Math.abs(savedAt - mAt) < 10000;

          if (sameSender && sameType && (sameText || sameUrl) && closeInTime) {
            replaced = true;
            return mergePreserving(m, savedMsg);
          }
        }
        return m;
      });

      if (!replaced) next = [...next, savedMsg];

      return next.sort(
        (a, b) =>
          new Date(a.createdAt || a.timestamp || 0) - new Date(b.createdAt || b.timestamp || 0)
      );
    });
  }, []);

  const appendIncomingMessage = useCallback((incoming) => {
    const normalized = normalizeMessage(incoming);
    if (!normalized) return;
    setMessages((prev) => {
      const prevArr = Array.isArray(prev) ? prev : [];
      if (normalized._id && prevArr.find((m) => m._id === normalized._id)) return prevArr;
      return dedupeMessages([...prevArr, normalized]);
    });
  }, []);

  /* open group */
  const openGroup = async (groupId) => {
    if (!groupId) return;
    try {
      setActive(null);
      setMessages([]);
      setSeenByMap({});
      const { data } = await http.get(`/api/groups/${groupId}`);
      const group = data?.group;
      const initialMessages = data?.messages || data?.groupMessages || [];
      setActive(group || null);
      setMessages(
        Array.isArray(initialMessages)
          ? dedupeMessages(initialMessages.map(normalizeMessage))
          : []
      );
      if (socket && group) {
        socket.emit("msgPageGroup", group._id);
        setTimeout(() => emitSeenGroup(), 80);
      }
      setUnread((u) => ({ ...u, [groupId]: 0 }));
      if (!embedded) setShowLeft(false);
    } catch (err) {
      console.error("Failed to open group", err);
      toast.error(err?.response?.data?.message || "Failed to load group");
    }
  };

  /* sockets: group info/messages/seen + new translations */
  useEffect(() => {
    if (!socket) return;
     const onGroupMessagePatched = (payload) => {
   const patched = normalizeMessage(payload?.message || payload);
   if (!patched?._id) return;
   setMessages((prev) =>
     (Array.isArray(prev) ? prev : []).map((m) =>
       String(m._id) === String(patched._id) ? { ...m, ...patched } : m
     )
  );
 };


    const onGroupInfo = (group) => {
      if (!group?._id) return;
      setAllGroups((prev) => {
        const idx = prev.findIndex((g) => g._id === group._id);
        if (idx === -1) return [group, ...prev];
        return prev.map((g) => (g._id === group._id ? group : g));
      });
      setGroups((prev) => {
        const idx = prev.findIndex((g) => g._id === group._id);
        if (idx === -1) return [group, ...prev];
        return prev.map((g) => (g._id === group._id ? group : g));
      });
      setActive((cur) => (cur && cur._id === group._id ? group : cur));

      if (settingsOpen && active && group._id === active._id) {
        fetchPastMembers(group._id);
      }
    };

    const onGroupMessages = (payload) => {
      if (!payload) return;

      if (Array.isArray(payload)) {
        setMessages(dedupeMessages(payload.map(normalizeMessage)));
        return;
      }

      if (payload?.groupId && payload?.messages) {
        if (!active || payload.groupId === active._id) {
          const list = Array.isArray(payload.messages) ? payload.messages : [payload.messages];
          list.map(normalizeMessage).forEach((msg) => replaceOptimisticWithSaved(msg));
        }
        return;
      }

      const single = payload?.message || payload;
      if (single) replaceOptimisticWithSaved(single);
    };

    const onNewGroupMsg = (msg) => {
      if (!msg) return;
      const m = normalizeMessage(msg?.message || msg);
      const groupId = m.groupId || msg.groupId;
      if (!groupId) return;

      const lastText = getTextFromMessage(m);
      setAllGroups((prev) => {
        const copy = [...prev];
        const idx = copy.findIndex((g) => g._id === groupId);
        if (idx !== -1) {
          const g = { ...copy[idx], lastMessage: { text: lastText, time: m.createdAt || new Date() } };
          copy.splice(idx, 1);
          copy.unshift(g);
        }
        return copy;
      });
      setGroups((prev) => {
        const copy = [...prev];
        const idx = copy.findIndex((g) => g._id === groupId);
        if (idx !== -1) {
          const g = { ...copy[idx], lastMessage: { text: lastText, time: m.createdAt || new Date() } };
          copy.splice(idx, 1);
          copy.unshift(g);
        }
        return copy;
      });

      if (active && groupId === active._id) {
        if (m._id) replaceOptimisticWithSaved(m);
      } else {
        setUnread((u) => ({ ...u, [groupId]: (u[groupId] || 0) + 1 }));
      }
    };

    const onSeenUpdate = ({ groupId, seenBy, messageIds }) => {
      if (!active || groupId !== active._id) return;

      setMessages((prev) =>
        (prev || []).map((m) => (messageIds.includes(m._id) ? { ...m, seen: true } : m))
      );

      setSeenByMap((prev) => {
        const next = { ...prev };
        for (const id of messageIds) {
          const arr = next[id] || [];
          if (!arr.includes(seenBy)) next[id] = [...arr, seenBy];
        }
        return next;
      });
    };

    const onGroupTranslationOk = (data) => {
      // { groupId, messageId, translatedText }
      setMessages((prev) =>
        (Array.isArray(prev) ? prev : []).map((m) =>
          String(m._id) === String(data.messageId)
            ? { ...m, translatedText: data.translatedText }
            : m
        )
      );
      setTranslatingMessageId(null);
    };
    const onGroupTranslationErr = () => setTranslatingMessageId(null);

    socket.on("groupInfo", onGroupInfo);
    socket.on("groupMessages", onGroupMessages);
    socket.on("receive-group-msg", onNewGroupMsg);
    socket.on("group:new", onNewGroupMsg);
    socket.on("seenGroupUpdate", onSeenUpdate);
    socket.on("groupTranslationResult", onGroupTranslationOk);
    socket.on("groupTranslationError", onGroupTranslationErr);
socket.on("groupMessagePatched", onGroupMessagePatched);
    return () => {
      socket.off("groupInfo", onGroupInfo);
      socket.off("groupMessages", onGroupMessages);
      socket.off("receive-group-msg", onNewGroupMsg);
      socket.off("group:new", onNewGroupMsg);
      socket.off("seenGroupUpdate", onSeenUpdate);
      socket.off("groupTranslationResult", onGroupTranslationOk);
      socket.off("groupTranslationError", onGroupTranslationErr);
      socket.off("groupMessagePatched", onGroupMessagePatched);
    };
  }, [socket, active, replaceOptimisticWithSaved, settingsOpen, fetchPastMembers]);

  /* auto scroll + mark seen when at bottom */
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    const el = listRef.current;
    if (!el) return;
    const nearBottom = el.scrollTop + el.clientHeight >= el.scrollHeight - 48;
    if (nearBottom) emitSeenGroup();
  }, [messages, emitSeenGroup]);
useEffect(() => {
  const close = () => setOpenMenuFor(null);
  document.addEventListener("click", close);
  return () => document.removeEventListener("click", close);
}, []);

  useEffect(() => {
    const el = listRef.current;
    if (!el) return;
    const onScroll = () => {
      if (el.scrollTop + el.clientHeight >= el.scrollHeight - 48) {
        emitSeenGroup();
      }
    };
    el.addEventListener("scroll", onScroll);
    return () => el.removeEventListener("scroll", onScroll);
  }, [emitSeenGroup]);

  useEffect(() => {
    const onFocus = () => emitSeenGroup();
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, [emitSeenGroup]);

  /* seed translation toggle maps when messages change */
  useEffect(() => {
    const t = { ...showOriginalMap };
    const v = { ...showVoiceOriginalMap };
    for (const m of Array.isArray(messages) ? messages : []) {
      if (!m?._id) continue;
      if (!(m._id in t)) t[m._id] = false;
      if (!(m._id in v)) v[m._id] = false;
    }
    setShowOriginalMap(t);
    setShowVoiceOriginalMap(v);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  /* request a translation for a specific group message */
  const requestGroupTranslation = useCallback(
    (messageId) => {
      if (!socket || !active?._id || !messageId) return;
      setTranslatingMessageId(messageId);
      socket.emit("translateGroupMessage", { groupId: active._id, messageId });
    },
    [socket, active?._id]
  );

  /* send text */
  const sendGroupMessage = async () => {
    if (!newMsg?.trim() || !active || !myId || !socket) return;
    if (sending) return;
    const text = newMsg.trim();
    setSending(true);

    const clientNonce = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const optimistic = normalizeMessage({
      _id: tempId,
      groupId: active._id,
      msgByUser: myId,
      sender: myId,
      text,
      messageType: "text",
      createdAt: new Date().toISOString(),
      senderName: "You",
      __temp: true,
      clientNonce,
    });
    setMessages((prev) => dedupeMessages([...(Array.isArray(prev) ? prev : []), optimistic]));
    setNewMsg("");

    try {
      const payload = { sender: myId, groupId: active._id, messageType: "text", text, clientNonce };
      socket.emit("newGroupMsg", payload, (ack) => {
        if (ack && ack.savedMessage) replaceOptimisticWithSaved(ack.savedMessage);
      });
    } catch (err) {
      toast.error("Message failed");
      setMessages((prev) => (Array.isArray(prev) ? prev.filter((m) => m._id !== tempId) : []));
    } finally {
      setSending(false);
    }
  };

  /* Uploads */
  const detectMessageType = (file) => {
    const t = file?.type || "";
    if (t.startsWith("image")) return "image";
    if (t.startsWith("audio")) return "audio";
    return "file";
  };

  const sendFile = async (file, kind) => {
    if (!file || !active || !myId || !socket) return;
    try {
      const to = toast.loading("Uploading...");
      const res = await uploadFile(file);
      toast.dismiss(to);
      const url = res?.secure_url;
      if (!url) throw new Error("Upload failed");

      const type = kind || detectMessageType(file);
      const tempId = `temp-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
      const clientNonce = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

      const serverPayload = {
        sender: myId,
        groupId: active._id,
        messageType: type,
        text: null,
        imageUrl: type === "image" ? url : undefined,
        audioUrl: type === "audio" ? url : undefined,
        videoUrl: type === "video" ? url : undefined,
        fileUrl: type === "file" ? url : undefined,
        fileName: file.name,
        size: file.size,
        clientNonce,
      };

      const optimistic = normalizeMessage({
        _id: tempId,
        groupId: active._id,
        msgByUser: myId,
        messageType: type,
        url,
        fileName: file.name,
        size: file.size,
        createdAt: new Date().toISOString(),
        __temp: true,
        clientNonce,
      });

      setMessages((prev) => dedupeMessages([...(Array.isArray(prev) ? prev : []), optimistic]));

      socket.emit("newGroupMsg", serverPayload, (ack) => {
        if (ack && ack.savedMessage) replaceOptimisticWithSaved(ack.savedMessage);
      });
    } catch (err) {
      console.error(err);
      toast.error("Upload failed");
    }
  };

  /* Recorder */
  const toggleRecord = async () => {
    try {
      if (recording) {
        recordRef.current?.stop();
        setRecording(false);
      } else {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        const recorder = new MediaRecorder(stream);
        const chunks = [];
        recorder.ondataavailable = (e) => chunks.push(e.data);
        recorder.onstop = async () => {
          const blob = new Blob(chunks, { type: "audio/webm" });
          const file = new File([blob], `voice-${Date.now()}.webm`, { type: "audio/webm" });
          await sendFile(file, "audio");
          stream.getTracks().forEach((t) => t.stop());
        };
        recorder.start();
        recordRef.current = recorder;
        setRecording(true);
      }
    } catch (err) {
      console.error("Voice record error", err);
      toast.error("Microphone access denied or not available");
    }
  };

  /* Create group helpers */
  const onPickPhoto = (file) => {
    if (!file) {
      setGPhotoFile(null);
      setGPhotoPreview(null);
      return;
    }
    setGPhotoFile(file);
    const reader = new FileReader();
    reader.onload = () => setGPhotoPreview(reader.result);
    reader.readAsDataURL(file);
  };
  const resetCreate = () => {
    setCreateOpen(false);
    setGName("");
    setGMembers([]);
    setGPhotoFile(null);
    setGPhotoPreview(null);
  };
  const handleCreate = async () => {
    if (!gName.trim()) return toast.error("Group name required");
    if (!gMembers.length) return toast.error("Pick at least one member");
    if (creating) return;
    try {
      setCreating(true);
      let uploadedUrl = "";
      if (gPhotoFile) {
        const res = await uploadFile(gPhotoFile);
        uploadedUrl = res?.secure_url || "";
      }
      const payload = {
        name: gName.trim(),
        members: gMembers.map((m) => m._id),
        profilePic: uploadedUrl,
      };
      const { data } = await http.post("/api/groups/create", payload);
      const created = data?.group;
      if (!created) throw new Error("Create failed");
      toast.success("Group created");
      setAllGroups((prev) => [created, ...prev]);
      setGroups((prev) => [created, ...prev]);
      resetCreate();
      openGroup(created._id);
      if (!embedded) navigate(`/g/${created._id}`);
    } catch (e) {
      console.error("Create group error:", e);
      toast.error(e?.response?.data?.message || e?.message || "Create failed");
    } finally {
      setCreating(false);
    }
  };

  /* Member/admin actions */
  const removeMember = async (userId) => {
    if (!active) return;
    try {
      await http.put("/api/groups/remove-member", { groupId: active._id, userId });
      toast.success("Member removed");
      openGroup(active._id);
      if (settingsOpen) fetchPastMembers(active._id);
    } catch (e) {
      console.error(e);
      toast.error(e?.response?.data?.message || "Remove failed");
    }
  };
const startEdit = (m) => {
  setEditingId(m._id);
  setEditDraft(getTextFromMessage(m) || "");
  setOpenMenuFor(null);
};

const saveEdit = () => {
  if (!editingId || !active) return;
  const next = (editDraft || "").trim();
  if (!next) return toast.error("Message can’t be empty");

  // optimistic
  setMessages((prev) =>
    (prev || []).map((x) => (x._id === editingId ? { ...x, text: next, isEdited: true } : x))
  );

  // tell server (you already planned these sockets)
  socket?.emit("editGroupMsg", { groupId: active._id, messageId: editingId, text: next });
  setEditingId(null);
  setEditDraft("");
};

const cancelEdit = () => { setEditingId(null); setEditDraft(""); };

const deleteForMe = (m) => {
  // optimistic: hide it locally
  setMessages((prev) => (prev || []).filter((x) => x._id !== m._id));
  // notify server
  socket?.emit("deleteGroupMsg", { groupId: active._id, messageId: m._id });
  setOpenMenuFor(null);
};

  const makeAdmin = async (userId) => {
    if (!active) return;
    const attempts = [
      ["/api/groups/add-admin", { groupId: active._id, newAdminId: userId }],
      ["/api/groups/set-admin", { groupId: active._id, newAdminId: userId }],
      ["/api/groups/transfer-admin", { groupId: active._id, newAdminId: userId }],
    ];
    let lastErr = null;
    for (const [url, body] of attempts) {
      try {
        const { data } = await http.put(url, body);
        toast.success(data?.message || "Admin updated");
        await openGroup(active._id);
        return;
      } catch (e) {
        lastErr = e;
      }
    }
    toast.error(lastErr?.response?.data?.message || "Make admin failed");
  };

  const leaveGroup = async () => {
    if (!active) return;
    try {
      const { data } = await http.put("/api/groups/leave", { groupId: active._id });
      toast.success(data?.message || "You left the group");
      setAllGroups((prev) => prev.filter((g) => g._id !== active._id));
      setGroups((prev) => prev.filter((g) => g._id !== active._id));
      setActive(null);
      setMessages([]);
      if (!embedded) navigate("/"); // bounce somewhere sane
    } catch (e) {
      console.error(e);
      toast.error(e?.response?.data?.message || "Leave failed");
    }
  };

  const deleteGroup = async () => {
    if (!active) return;
    try {
      const { data } = await http.delete("/api/groups/delete", { data: { groupId: active._id } });
      toast.success(data?.message || "Group deleted");
      setAllGroups((prev) => prev.filter((g) => g._id !== active._id));
      setGroups((prev) => prev.filter((g) => g._id !== active._id));
      setActive(null);
      setMessages([]);
      if (!embedded) navigate("/");
    } catch (e) {
      console.error(e);
      toast.error(e?.response?.data?.message || "Delete failed");
    }
  };

  const amAdmin = active ? isAdminOfGroup(active, myId) : false;

  /* Group update */
  const updateGroup = async (patch) => {
    if (!active) return;
    const payload = { groupId: active._id, ...patch };
    const attempts = [
      () => http.put("/api/groups/update", payload),
      () => http.patch("/api/groups/update", payload),
    ];
    let updated = null;
    let lastErr = null;
    try {
      setActive((cur) => (cur ? { ...cur, ...patch } : cur));
      setAllGroups((prev) => prev.map((g) => (g._id === active._id ? { ...g, ...patch } : g)));
      setGroups((prev) => prev.map((g) => (g._id === active._id ? { ...g, ...patch } : g)));

      for (const req of attempts) {
        try {
          const { data } = await req();
          if (data?.group) {
            updated = data.group;
            break;
          }
        } catch (e) {
          lastErr = e;
        }
      }
      if (!updated) throw lastErr || new Error("Update failed");

      toast.success("Group updated");
      setActive(updated);
      setAllGroups((prev) => prev.map((g) => (g._id === updated._id ? updated : g)));
      setGroups((prev) => prev.map((g) => (g._id === updated._id ? updated : g)));
    } catch (e) {
      toast.error(e?.response?.data?.message || "Update failed");
      openGroup(active._id);
    }
  };

  const updatePhoto = async (file) => {
    if (!active || !file) return;
    try {
      const t = toast.loading("Uploading photo...");
      const res = await uploadFile(file);
      toast.dismiss(t);
      const url = res?.secure_url;
      if (!url) throw new Error("Upload failed");
      await updateGroup({ profilePic: url });
    } catch (e) {
      console.error(e);
      toast.error(e?.message || "Photo upload failed");
    }
  };

  /* emoji insert */
  const addEmoji = (emo) => setNewMsg((s) => (s || "") + emo);

  /* file input ref */
  const fileRef = useRef();

  /* =========================== Render =========================== */
  const everyoneElseCountFor = (m) => {
    const senderId =
      (typeof m.msgByUser === "object" ? m.msgByUser?._id : m.msgByUser) ||
      (typeof m.sender === "object" ? m.sender?._id : m.sender);
    const members = active?.members || [];
    return Math.max(members.filter((u) => String(getId(u)) !== String(senderId)).length, 0);
  };

  const SeenTicks = ({ m, isMe }) => {
    if (!isMe || !m._id) return null;

    const totalOthers = everyoneElseCountFor(m);
    const seenArr = (seenByMap[m._id] || []).filter((uid) => String(uid) !== String(myId));
    const allSeen = totalOthers > 0 && seenArr.length >= totalOthers;

    return (
      <span className="inline-flex items-center gap-0.5 ml-1 align-middle">
        {allSeen ? <CheckCheck size={12} /> : <Check size={12} />}
      </span>
    );
  };

  const ChatHeader = () => (
    <div className="h-14 px-2 sm:px-4 border-b border-zinc-800 flex items-center justify-between">
      <div className="flex items-center gap-3 min-w-0">
        {!embedded && (
          <button className="lg:hidden p-2 rounded-lg hover:bg-zinc-800" onClick={() => setShowLeft(true)} title="Groups">
            <ChevronLeft />
          </button>
        )}
        {embedded && (
          <button className="p-2 rounded-lg hover:bg-zinc-800" onClick={() => navigate(-1)} title="Back">
            <ChevronLeft />
          </button>
        )}
        <img src={active.profilePic || "/group-placeholder.png"} alt="" className="w-9 h-9 rounded-full object-cover" />
        <div className="min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <h2 className="font-semibold truncate">{active.name}</h2>
            {amAdmin && (
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-700/40">Admin</span>
            )}
          </div>
          <div className="text-xs text-zinc-500 truncate">Created by {active?.createdBy?.name || active?.createdBy?.email || "—"}</div>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button className="lg:hidden p-2 rounded-lg hover:bg-zinc-800" onClick={() => setShowMembersMobile(true)} title="Info">
          <Info />
        </button>

        <button onClick={() => setSettingsOpen(true)} className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-sm">
          <SettingsIcon size={16} /> Settings
        </button>

        {amAdmin && (
          <button onClick={() => setConfirmDelete(true)} className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white text-sm">
            <Trash2 size={16} /> Delete
          </button>
        )}

        {amAdmin && (
          <button onClick={() => setPickerOpen(true)} className="hidden sm:flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-600 hover:bg-green-500 text-white text-sm">
            <UserPlus size={16} /> Add
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen h-screen bg-[#0b0d11] text-zinc-100 flex">
      <Toaster position="top-right" />

      {/* LEFT: groups list (drawer on mobile) */}
      {!embedded && (
        <aside
          className={`fixed lg:static inset-y-0 left-0 w-[85%] sm:w-80 lg:w-80 z-40 bg-[#0b0d11] border-r border-zinc-800 flex-shrink-0 flex flex-col transform transition-transform ${
            showLeft ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
          }`}
        >
          <div className="h-14 px-4 border-b border-zinc-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users size={18} className="text-zinc-400" />
              <h2 className="font-semibold">Groups</h2>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCreateOpen(true)}
                className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-green-600 hover:bg-green-500 text-white text-sm"
              >
                <Plus size={16} /> New
              </button>
              <button className="lg:hidden p-2 rounded-lg hover:bg-zinc-800" onClick={() => setShowLeft(false)}>✕</button>
            </div>
          </div>

          <div className="p-3 border-b border-zinc-800">
            <div className="flex items-center gap-2 bg-[#0f1216] border border-zinc-700 rounded-xl px-3 py-2">
              <Search size={16} className="text-zinc-500" />
              <input
                placeholder="Search groups..."
                value={searchQ}
                onChange={(e) => setSearchQ(e.target.value)}
                className="bg-transparent outline-none text-zinc-300 w-full"
              />
            </div>
          </div>

          <div className="overflow-y-auto h-[calc(100vh-112px)]">
            {loadingGroups && <p className="p-3 text-zinc-400">Loading…</p>}
            {!loadingGroups && !groups.length && <p className="p-3 text-zinc-500">No groups yet</p>}
            {groups.map((g) => {
              const isActive = active?._id === g._id;
              const count = unread[g._id] || 0;
              return (
                <button
                  key={g._id}
                  onClick={() => navigate(`/g/${g._id}`)}
                  className={`w-full text-left px-4 py-3 border-b border-zinc-900 hover:bg-zinc-900/60 transition ${isActive ? "bg-zinc-900/70" : ""}`}
                >
                  <div className="flex items-center gap-3">
                    <img src={g.profilePic || "/group-placeholder.png"} alt="" className="w-10 h-10 rounded-full object-cover" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <div className="font-medium truncate">{g.name}</div>
                        {isAdminOfGroup(g, myId) && <Crown size={14} className="text-yellow-500" title="You are admin" />}
                      </div>
                      <div className="text-xs text-zinc-500 flex items-center gap-2">
                        <span className="truncate">{g.lastMessage?.text || "No messages yet"}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-zinc-500">
                        {g.lastMessage?.time ? fmtTime(g.lastMessage.time) : ""}
                      </div>
                      {count > 0 && (
                        <div className="mt-1 inline-flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full bg-green-600 text-[10px]">
                          {count}
                        </div>
                      )}
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </aside>
      )}

      {/* RIGHT: group details + chat */}
      <main className="flex-1 min-w-0 flex flex-col">
        {!active ? (
          <div className="h-full grid place-items-center px-6">
            <div className="text-center max-w-sm">
              <Users className="mx-auto mb-3 text-zinc-600" />
              <p className="text-zinc-400">Select a group to manage & chat</p>
            </div>
          </div>
        ) : (
          <>
            <ChatHeader />

            <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
              {/* chat column */}
              <div className="flex-1 min-w-0 border-r border-zinc-800 flex flex-col">
                {/* messages */}
                <div ref={listRef} className="flex-1 overflow-y-auto p-3 sm:p-4 bg-[#070809]">
                  {(!messages || (Array.isArray(messages) && messages.length === 0)) && (
                    <p className="text-zinc-500">No messages yet — say hi 👋</p>
                  )}

                  {Array.isArray(messages) &&
                    messages.map((m, i) => {
                      // skip messages the current user deleted-for-me
   if (Array.isArray(m.deletedFor) && m.deletedFor.some(x => String(x) === String(myId))) {
     return null;
  }
                      const senderId =
                        (typeof m.msgByUser === "object" ? m.msgByUser?._id : m.msgByUser) ||
                        (typeof m.sender === "object" ? m.sender?._id : m.sender);
                      const isMe = String(senderId) === String(myId);
                      const time = fmtTime(m.createdAt || m.timestamp || new Date());

                      const wrap = isMe ? "text-right" : "text-left";
                      const bubble = isMe
                        ? "bg-emerald-700 text-white"
                        : "bg-[#1f2c34] text-zinc-100";

                      const rawText = getTextFromMessage(m);

                      return (
                        <div key={m._id || `i-${i}`} className={`mb-2 sm:mb-3 ${wrap}`}>
                         <div className={`group relative inline-block px-3 py-2 rounded-2xl max-w-[85%] sm:max-w-[75%] break-words ${bubble}`}>

    {/* kebab (hover) */}
    <button
      onClick={(e) => { e.stopPropagation(); setOpenMenuFor(openMenuFor === m._id ? null : m._id); }}
      className={`absolute -top-2 ${isMe ? "-right-2" : "-left-2"} p-1 rounded-full
                  bg-black/30 hover:bg-black/40 opacity-0 group-hover:opacity-100 transition`}
      title="More"
    >
      <MoreVertical size={16} />
    </button>

    {/* dropdown */}
    {openMenuFor === m._id && (
      <div
        className={`absolute z-20 min-w-[160px] border border-zinc-700 rounded-lg overflow-hidden shadow
                    ${isMe ? "right-6 top-0" : "left-6 top-0"} bg-[#0e1013]`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Edit only for my text messages */}
        {isMe && (m.messageType === "text" || !m.messageType) && (
          <button
            className="w-full text-left px-3 py-2 text-sm hover:bg-zinc-800 flex items-center gap-2"
            onClick={() => startEdit(m)}
          >
            <Pencil size={14} /> Edit
          </button>
        )}

        {/* Delete for me */}
        <button
          className="w-full text-left px-3 py-2 text-sm hover:bg-zinc-800 flex items-center gap-2"
          onClick={() => deleteForMe(m)}
        >
          <Trash size={14} /> Delete
        </button>
      </div>
    )}

    {/* EDITING UI (my text) */}
    {editingId === m._id && (m.messageType === "text" || !m.messageType) ? (
      <div className="flex items-center gap-2">
        <input
          value={editDraft}
          onChange={(e) => setEditDraft(e.target.value)}
          className="flex-1 px-2 py-1 rounded bg-black/20 border border-white/10 outline-none"
          autoFocus
        />
        <button onClick={saveEdit} className="px-2 py-1 rounded bg-emerald-700 hover:bg-emerald-600 text-white text-xs">
          Save
        </button>
        <button onClick={cancelEdit} className="px-2 py-1 rounded bg-zinc-700 hover:bg-zinc-600 text-xs">
          Cancel
        </button>
      </div>
    ) : (
      <>
        {/* TEXT with translation toggle preserved */}
        {(!m.messageType || m.messageType === "text") && (
          <div className="whitespace-pre-wrap">
            {(() => {
              const rawText = getTextFromMessage(m);
              const hasTrans = !!m.translatedText;
              const canAsk = !isMe && !isEmojiOnly(rawText);

              return (
                <>
                  {hasTrans && canAsk
                    ? (showOriginalMap[m._id] ? safeText(rawText) : safeText(m.translatedText))
                    : safeText(rawText)}
                  {canAsk && (
                    <div className="text-[11px] mt-1 opacity-80">
                      {hasTrans ? (
                        <button
                          onClick={() =>
                            setShowOriginalMap((map) => ({ ...map, [m._id]: !map[m._id] }))
                          }
                          className="underline"
                        >
                          {showOriginalMap[m._id] ? "Show translation" : "Show original"}
                        </button>
                      ) : (
                        <button
                          onClick={() => requestGroupTranslation(m._id)}
                          className="underline"
                          disabled={translatingMessageId === m._id}
                        >
                          {translatingMessageId === m._id ? "Translating…" : "Translate"}
                        </button>
                      )}
                    </div>
                  )}
                  {m.isEdited && <span className="ml-1 text-[10px] opacity-70">(edited)</span>}
                </>
              );
            })()}
          </div>
        )}

        {/* IMAGE / FILE */}
        {m.messageType === "image" && m.url && <ImageBubble url={m.url} fileName={m.fileName} />}
        {m.messageType === "file" && m.url && (
          <FileBubble
            url={m.url}
            fileName={m.fileName || m.filename || m.name}
            size={typeof m.size === "number" ? m.size : m.fileSize}
          />
        )}

        {/* VOICE with translation toggle preserved */}
        {(m.messageType === "audio" || m.messageType === "voice") && m.url && (
          <div className="space-y-1">
            <VoiceBubble src={m.url} />
            {!isMe && (
              (() => {
                const hasTrans = !!m.translatedText;
                if (hasTrans) {
                  return (
                    <>
                      <p className="text-xs text-zinc-300/90">
                        {showVoiceOriginalMap[m._id]
                          ? (m.originalVoiceText || m.text || "No original transcription available")
                          : m.translatedText}
                      </p>
                      <button
                        onClick={() =>
                          setShowVoiceOriginalMap((map) => ({ ...map, [m._id]: !map[m._id] }))
                        }
                        className="text-[11px] underline"
                      >
                        {showVoiceOriginalMap[m._id] ? "Show translation" : "Show original"}
                      </button>
                    </>
                  );
                }
                return (
                  <button
                    onClick={() => requestGroupTranslation(m._id)}
                    className="text-xs underline"
                    disabled={translatingMessageId === m._id}
                  >
                    {translatingMessageId === m._id ? "Translating…" : "Translate voice"}
                  </button>
                );
              })()
            )}
          </div>
        )}
      </>
    )}

    {/* time + seen */}
    <div className={`text-[10px] mt-1 ${isMe ? "text-white/75" : "text-zinc-300/70"} text-right`}>
      {time}
      <SeenTicks m={m} isMe={isMe} />
    </div>
  </div>

                        </div>
                      );
                    })}
                  <div ref={messagesEndRef} />
                </div>

                {/* input row */}
                <div className="p-2 sm:p-3 border-t border-zinc-800 flex items-center gap-2">
                  <input
                    ref={fileRef}
                    id="fileInput"
                    type="file"
                    accept="image/*,audio/*,application/pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,*/*"
                    hidden
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      sendFile(file, detectMessageType(file));
                      e.target.value = null;
                    }}
                  />
                  <button onClick={() => fileRef.current?.click()} className="p-2 rounded-md hover:bg-zinc-900" title="Attach">
                    <Paperclip />
                  </button>

                  <div className="relative">
                    <button onClick={() => setShowEmoji((s) => !s)} className="p-2 rounded-md hover:bg-zinc-900" title="Emoji">
                      <Smile />
                    </button>
                    {showEmoji && (
                      <div className="absolute bottom-12 left-0 bg-[#0e1013] border border-zinc-700 p-2 rounded-lg grid grid-cols-8 gap-1 shadow z-20 max-h-56 overflow-y-auto w-[18rem]">
                        {EMOJIS.map((e, idx) => (
                          <button
                            key={`${e}-${idx}`}
                            onClick={() => {
                              addEmoji(e);
                              setShowEmoji(false);
                            }}
                            className="p-1 text-lg"
                            title={e}
                          >
                            {e}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>

                  <input
                    value={newMsg}
                    onChange={(e) => setNewMsg(e.target.value)}
                    onKeyDown={(e) => { if (e.key === "Enter") sendGroupMessage(); }}
                    placeholder="Type a message…"
                    className="flex-1 px-3 py-2 rounded-xl bg-[#0b0d11] border border-zinc-700 outline-none text-zinc-200"
                  />

                  <button
                    onClick={toggleRecord}
                    className={`p-2 rounded-md hover:bg-zinc-900 ${recording ? "text-red-500" : ""}`}
                    title={recording ? "Stop recording" : "Record voice"}
                  >
                    <Mic />
                  </button>

                  <button
                    onClick={sendGroupMessage}
                    disabled={!newMsg.trim() || sending}
                    className={`px-3 sm:px-4 py-2 rounded-xl text-white flex items-center gap-2 ${
                      !newMsg.trim() || sending ? "bg-emerald-900 cursor-not-allowed" : "bg-emerald-700 hover:bg-emerald-600"
                    }`}
                  >
                    <Send size={16} /> <span className="hidden sm:inline">Send</span>
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </main>

      {/* Mobile Members Drawer */}
      {showMembersMobile && active && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setShowMembersMobile(false)} />
          <div className="absolute right-0 top-0 bottom-0 w-[85%] sm:w-[22rem] bg-[#0b0d11] border-l border-zinc-800 p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm text-zinc-400">Members</h3>
              <button onClick={() => setShowMembersMobile(false)} className="p-2 rounded-lg hover:bg-zinc-800">✕</button>
            </div>
            <div className="grid grid-cols-1 gap-2">
              {active?.members?.map((m) => {
                const isAdmin = isAdminOfGroup(active, m);
                const id = getId(m);
                return (
                  <div key={id} className="border border-zinc-800 rounded-xl p-3 bg-[#0e1013]">
                    <div className="flex items-start justify-between">
                      <div className="min-w-0">
                        <div className="font-medium truncate">{m.name || m.email}</div>
                        <div className="text-xs text-zinc-500 truncate">{m.email}</div>
                      </div>
                      {isAdmin && (
                        <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-700/40">
                          <Crown size={12} /> Admin
                        </span>
                      )}
                    </div>
                    <div className="mt-3 flex items-center gap-2">
                      {amAdmin && !isAdmin && (
                        <>
                          <button onClick={() => makeAdmin(id)} className="px-2.5 py-1 rounded-lg bg-yellow-600 hover:bg-yellow-500 text-white text-xs">Make Admin</button>
                          <button onClick={() => removeMember(id)} className="px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white text-xs">Remove</button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
            <button
              onClick={() => { setSettingsOpen(true); setShowMembersMobile(false); }}
              className="mt-4 w-full px-3 py-2 rounded-lg bg-zinc-800 hover:bg-zinc-700"
            >
              <SettingsIcon size={14} className="inline mr-1" /> Open Settings
            </button>
          </div>
        </div>
      )}

      {/* Create Group Modal */}
      <Modal
        open={createOpen}
        onClose={resetCreate}
        title="Create Group"
        footer={
          <div className="flex justify-end gap-2">
            <button onClick={resetCreate} className="px-3 py-1.5 rounded-lg bg-zinc-700 text-zinc-200 hover:bg-zinc-600">Cancel</button>
            <button
              onClick={handleCreate}
              disabled={creating}
              className={`px-3 py-1.5 rounded-lg text-white ${creating ? "bg-green-800 cursor-not-allowed" : "bg-green-600 hover:bg-green-500"}`}
            >
              {creating ? "Creating..." : "Create"}
            </button>
          </div>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm mb-1 text-zinc-300">Group Name</label>
            <input
              value={gName}
              onChange={(e) => setGName(e.target.value)}
              placeholder="Enter group name"
              className="w-full bg-[#0e1013] border border-zinc-700 rounded-xl px-3 py-2 text-zinc-200 outline-none focus:border-zinc-500"
            />
          </div>
          <div>
            <label className="block text-sm mb-1 text-zinc-300">Group Photo</label>
            <input type="file" accept="image/*" onChange={(e) => onPickPhoto(e.target.files?.[0] || null)} />
            {gPhotoPreview && <img src={gPhotoPreview} alt="preview" className="w-16 h-16 rounded-full object-cover mt-2" />}
          </div>
          <div>
            <label className="block text-sm mb-1 text-zinc-300">Members</label>
            <button onClick={() => setPickerOpen(true)} className="px-3 py-1.5 rounded-lg bg-emerald-700 text-white hover:bg-emerald-600 text-sm">
              Pick Members ({gMembers.length})
            </button>
          </div>
        </div>
      </Modal>

      {/* MemberPicker */}
      <MemberPicker
        open={pickerOpen}
        onClose={() => setPickerOpen(false)}
        onSubmit={async (picked) => {
          if (!picked.length) return toast("ℹ️ No members selected");
          setGMembers(picked);
          setPickerOpen(false);
          if (!active) return;
          try {
            const ids = picked.map((p) => p._id);
            await Promise.all(
              ids.map((userId) =>
                http.put("/api/groups/add-member", { groupId: active._id, userId })
              )
            );
            toast.success("Members added");
            openGroup(active._id);
          } catch (e) {
            console.error(e);
            toast.error(e?.response?.data?.message || "Add failed");
          }
        }}
        excludeIds={[
          ...gMembers.map((m) => m._id),
          ...(active?.members?.map((m) => getId(m)) || []),
        ]}
      />

      {/* Settings modal */}
      <Modal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        title="Group Settings"
        wide
        footer={
          <div className="flex justify-end w-full gap-2">
            {amAdmin && (
              <>
                <button
                  onClick={() => setPickerOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-700 hover:bg-emerald-600 text-white"
                >
                  Add Members
                </button>
                <button
                  onClick={async () => {
                    const nextName = (settingsDraft.name ?? "").trim();
                    const curName = (active?.name ?? "").trim();
                    const nextPic = settingsDraft.profilePic ?? "";
                    const curPic = active?.profilePic ?? "";

                    const changed = {};
                    if (nextName && nextName !== curName) changed.name = nextName;
                    if (nextPic && nextPic !== curPic) changed.profilePic = nextPic;

                    if (Object.keys(changed).length === 0) {
                      toast("No changes");
                      return;
                    }
                    await updateGroup(changed);
                  }}
                  className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white"
                >
                  Save Changes
                </button>
              </>
            )}
          </div>
        }
      >
        {!active ? null : (
          <div className="space-y-6">
            {/* Basics */}
            <section>
              <h4 className="text-sm font-semibold text-zinc-300 mb-2">
                Basic Info
              </h4>
              <div className="flex items-center gap-4">
                <img
                  src={
                    settingsDraft.profilePic ||
                    active?.profilePic ||
                    "/group-placeholder.png"
                  }
                  alt="group"
                  className="w-16 h-16 rounded-full object-cover border border-zinc-700"
                />
                <div className="space-y-2 flex-1">
                  <input
                    value={settingsDraft.name}
                    onChange={(e) =>
                      setSettingsDraft((s) => ({ ...s, name: e.target.value }))
                    }
                    className="w-full bg-[#0e1013] border border-zinc-700 rounded-xl px-3 py-2 text-zinc-200 outline-none focus:border-zinc-500"
                    placeholder="Group name"
                    disabled={!amAdmin}
                  />
                  {amAdmin && (
                    <div className="flex items-center gap-2 text-sm">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const f = e.target.files?.[0];
                          if (!f) return;
                          try {
                            const t = toast.loading("Uploading photo...");
                            const res = await uploadFile(f);
                            toast.dismiss(t);
                            const url = res?.secure_url;
                            if (!url) throw new Error("Upload failed");
                            setSettingsDraft((s) => ({ ...s, profilePic: url }));
                            toast.success("Photo ready. Click Save Changes.");
                          } catch {
                            toast.error("Photo upload failed");
                          }
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Members */}
            <section>
              <h4 className="text-sm font-semibold text-zinc-300 mb-2">
                Members
              </h4>
              <div className="grid sm:grid-cols-2 gap-2 max-h-72 overflow-y-auto">
                {active?.members?.map((m) => {
                  const isAdminMember = isAdminOfGroup(active, m);
                  const id = getId(m);
                  return (
                    <div
                      key={id}
                      className="flex items-center justify-between bg-[#0e1013] p-2 rounded border border-zinc-700"
                    >
                      <div className="min-w-0">
                        <div className="font-medium truncate">
                          {m.name || m.email}
                        </div>
                        <div className="text-xs text-zinc-500 truncate">
                          {m.email}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {isAdminMember && (
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-700/40">
                            <Crown size={12} className="inline mr-1" /> Admin
                          </span>
                        )}
                        {amAdmin && !isAdminMember && (
                          <>
                            <button
                              onClick={() => makeAdmin(id)}
                              className="px-2 py-0.5 rounded bg-yellow-600 text-xs"
                            >
                              Make Admin
                            </button>
                            <button
                              onClick={() => removeMember(id)}
                              className="px-2 py-0.5 rounded bg-red-600 text-xs"
                            >
                              Remove
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Past Members */}
            <section>
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-semibold text-zinc-300">
                  Past Members
                </h4>
                <button
                  className="text-xs underline"
                  onClick={() => fetchPastMembers(active._id)}
                >
                  Refresh
                </button>
              </div>
              {!pastMembers?.length ? (
                <p className="text-sm text-zinc-500 mt-1">
                  No past members found.
                </p>
              ) : (
                <div className="grid sm:grid-cols-2 gap-2 mt-2 max-h-48 overflow-y-auto">
                  {pastMembers.map((m) => {
                    const id = getId(m) || m?.user?._id;
                    return (
                      <div
                        key={id}
                        className="flex items-center justify-between bg-[#0e1013] p-2 rounded border border-zinc-700"
                      >
                        <div className="min-w-0">
                          <div className="font-medium truncate">
                            {m.name || m.email}
                          </div>
                          <div className="text-xs text-zinc-500 truncate">
                            {m.email}
                          </div>
                        </div>
                        {amAdmin && (
                          <button
                            onClick={async () => {
                              try {
                                await http.put("/api/groups/add-member", {
                                  groupId: active._id,
                                  userId: id,
                                });
                                toast.success("Re-added to group");
                                openGroup(active._id);
                                fetchPastMembers(active._id);
                              } catch {
                                toast.error("Failed to re-add");
                              }
                            }}
                            className="px-2 py-0.5 rounded bg-emerald-700 text-xs"
                          >
                            Re-add
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </section>

            {/* Danger zone */}
            <section className="pt-2 border-t border-zinc-800">
              <h4 className="text-sm font-semibold text-zinc-300 mb-2">
                Danger Zone
              </h4>
              <div className="flex flex-wrap gap-2">
                {!amAdmin && (
                  <button
                    onClick={() => setConfirmLeave(true)}
                    className="px-3 py-1.5 rounded-lg bg-zinc-700 hover:bg-zinc-600"
                  >
                    <LogOut className="inline mr-1" size={14} /> Leave Group
                  </button>
                )}
                {amAdmin && (
                  <button
                    onClick={() => setConfirmDelete(true)}
                    className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white"
                  >
                    <Trash2 className="inline mr-1" size={14} /> Delete Group
                  </button>
                )}
              </div>
            </section>
          </div>
        )}
      </Modal>

      {/* Confirms */}
      <Confirm
        open={confirmDelete}
        onClose={() => setConfirmDelete(false)}
        onConfirm={deleteGroup}
        title="Delete Group"
        message="Are you sure you want to delete this group? This action cannot be undone."
        danger
      />
      <Confirm
        open={confirmLeave}
        onClose={() => setConfirmLeave(false)}
        onConfirm={leaveGroup}
        title="Leave Group"
        message="Are you sure you want to leave this group?"
      />
    </div>
  );
}

