

// export default ChatContainer;
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { useLocalStorage } from "@mantine/hooks";
import {
  Send, Paperclip, Smile, Mic, Image as ImageIcon,
  FileText, Play, Pause, Check, CheckCheck, ChevronLeft,
} from "lucide-react";
import { GetSocket } from "../utils/Sockets";
import uploadFile from "../utils/uploadFile";
import Avatar from "./Avatar";
import { setActiveThread, clearActiveThread } from "../utils/activeThread";
import { useParams, useLocation, useNavigate } from "react-router-dom";

/* ---------------- helpers ---------------- */
const fmtTime = (d) => {
  try {
    const date = new Date(d);
    return isNaN(date) ? "" : date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  } catch { return ""; }
};
const fileSize = (bytes = 0) => {
  if (!bytes) return "";
  const kb = bytes / 1024;
  if (kb < 1024) return `${Math.round(kb)} KB`;
  return `${(kb / 1024).toFixed(2)} MB`;
};
const safeText = (v) => (typeof v === "string" ? v : "");

// “pure emoji” detector: if it’s only emojis/space/newlines, treat as emoji-only
const EMOJI_RE = /^(?:\p{Emoji_Presentation}|\p{Extended_Pictographic}|\p{Emoji}|\s)+$/u;
const isEmojiOnly = (s = "") => !!s && EMOJI_RE.test(s);

const EMOJIS = [
  "😀","😁","😂","🤣","😃","😄","😅","😆","😉","😊","🙂","🙃","😋","😎","😍","😘","🥰","😇","🤩","🥳","😏","😒","😞","😔",
  "👍","👎","👌","✌️","🤞","🤟","🤘","🤙","🙏","👏","🙌","🫶","💪","❤️","💖","💬","✅","❌","❗","❓","⚠️",
];

/* ---------------- media UI ---------------- */
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
    if (a.paused) { a.play().catch(() => {}); setPlaying(true); }
    else { a.pause(); setPlaying(false); }
  };

  const pct = dur ? (cur / dur) * 100 : 0;
  const mmss = (s) => {
    if (!Number.isFinite(s) || s < 0) s = 0;
    const m = Math.floor(s / 60).toString().padStart(2, "0");
    const sec = Math.floor(s % 60).toString().padStart(2, "0");
    return `${m}:${sec}`;
  };

  return (
    <div className="flex items-center gap-3 text-zinc-100 w-full max-w-[70vw] sm:max-w-[60vw] md:max-w-[50vw]">
      <button onClick={toggle} className="w-9 h-9 rounded-full grid place-items-center bg-black/20 hover:opacity-90" title={playing ? "Pause" : "Play"}>
        {playing ? <Pause size={18} /> : <Play size={18} />}
      </button>
      <div className="flex-1 min-w-0">
        <div className="h-1.5 rounded-full bg-zinc-300/30">
          <div className="h-1.5 rounded-full bg-zinc-100" style={{ width: `${pct}%` }} />
        </div>
        <div className="text-[10px] mt-1 opacity-80">{mmss(cur)} / {mmss(dur || 0)}</div>
      </div>
      <audio ref={audioRef} src={src} preload="metadata" className="hidden" />
    </div>
  );
};

/* ---- helpers for docs & URLs ---- */
const isOfficeOrPdf = (name = "") => /\.(pdf|docx?|pptx?|xlsx|csv|txt)(\?|$)/i.test(name);
const pickUrl = (m = {}) =>
  m.url || m.imageUrl || m.audioUrl || m.videoUrl || m.fileUrl || m.documentUrl || m.attachmentUrl || m.mediaUrl || m.path || null;
// if a doc accidentally came via image upload, rewrite to raw
const fixCloudinaryUrl = (u) => {
  if (!u) return u;
  return isOfficeOrPdf(u) && /\/image\/upload\//.test(u)
    ? u.replace("/image/upload/", "/raw/upload/")
    : u;
};

/* visual bubbles */
const FileBubble = ({ url, fileName, size }) => {
  const rawUrl = fixCloudinaryUrl(url);
  const name = fileName || rawUrl?.split("/").pop() || "File";
  const openHref = rawUrl
    ? (/\.(docx?|pptx?|xlsx)$/i.test(name)
        ? `https://docs.google.com/gview?embedded=1&url=${encodeURIComponent(rawUrl)}`
        : rawUrl)
    : null;

  return (
    <div className="flex items-center gap-3 p-2 rounded-xl bg-black/10 w-full max-w-[80vw] sm:max-w-[60vw]">
      <div className="w-10 h-10 rounded-lg bg-black/20 grid place-items-center"><FileText /></div>
      <div className="min-w-0 flex-1">
        <div className="text-sm truncate">{name}</div>
        <div className="text-[11px] opacity-70">{fileSize(size)}</div>
      </div>
      {openHref ? (
        <a href={openHref} target="_blank" rel="noopener noreferrer" className="text-xs underline opacity-90 hover:opacity-100">Open</a>
      ) : <span className="text-xs opacity-60">Open</span>}
      {rawUrl ? (
        <a href={rawUrl} download={name} className="text-xs underline opacity-90 hover:opacity-100">Download</a>
      ) : <span className="text-xs opacity-60">Download</span>}
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
          className="max-h-72 object-cover cursor-zoom-in max-w-[min(85vw,520px)]"
          onClick={() => setOpen(true)}
        />
        <div className="flex items-center justify-between px-2 py-1 text-[11px] opacity-80">
          <div className="flex items-center gap-1"><ImageIcon size={12} /> {fileName || "Image"}</div>
          <a href={url} target="_blank" rel="noopener noreferrer" download className="underline">Download</a>
        </div>
      </div>
      <Lightbox open={open} src={url} onClose={() => setOpen(false)} caption={fileName} />
    </>
  );
};

/* -------------- message shaping -------------- */
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

const normalizeMessage = (raw) => {
  if (!raw) return null;
  const m = raw.message || raw;
  const createdAt = m.createdAt || m.timestamp || new Date().toISOString();
  const type = resolveType(m);
  const url = pickUrl(m);
  return {
    ...m,
    _id: m._id || raw._id,
    createdAt,
    messageType: type,
    url,
  };
};

// merges server messages into local (and replaces optimistics via clientNonce)
const dedupeMerge = (prev = [], fromServer = []) => {
  const byKey = new Map();
  for (const p of prev) {
    const n = normalizeMessage(p);
    if (!n) continue;
    const key = n.clientNonce || n._id || `${n.createdAt}-${n.text || n.url}`;
    byKey.set(key, n);
  }
  for (const raw of fromServer) {
    const s = normalizeMessage(raw);
    if (!s) continue;
    const serverKey = s.clientNonce || s._id || `${s.createdAt}-${s.text || s.url}`;

    // replace matching optimistic (clientNonce or near-duplicate)
    let toDelete = null;
    for (const [k, v] of byKey) {
      if (v.clientNonce && s.clientNonce && v.clientNonce === s.clientNonce) { toDelete = k; break; }
      if (String(v._id || "").startsWith("temp-")) {
        const sameSender = String(v.msgByUser || v.sender) === String(s.msgByUser || s.sender);
        const sameType = resolveType(v) === resolveType(s);
        const sameText = (v.text || "").trim() && (v.text || "").trim() === (s.text || "").trim();
        const sameUrl  = !!v.url && !!s.url && v.url === s.url;
        const closeInTime = Math.abs(new Date(v.createdAt) - new Date(s.createdAt)) < 20000;
        if (sameSender && sameType && (sameText || sameUrl) && closeInTime) { toDelete = k; break; }
      }
    }
    if (toDelete) byKey.delete(toDelete);
    byKey.set(serverKey, s);
  }
  return Array.from(byKey.values()).sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
};

/* -------------------- main -------------------- */
const ChatContainer = ({ chatUserId, onBack }) => {
  const socket =
    (typeof GetSocket === "function"
      ? GetSocket()
      : GetSocket?.socket || GetSocket?.current || GetSocket) || null;

  const [userLS] = useLocalStorage({ key: "userData", defaultValue: {} });
  const myId = useMemo(() => userLS?._id || userLS?.id || null, [userLS]);

  // route awareness to auto-hide on /g
  const location = useLocation();
  const params   = useParams();
  const routePeerId = params?.peerId || params?.uid || params?.id || null;
  const dmId = chatUserId ?? routePeerId;
  const isGroupPath = /^\/g(\/|$)/i.test(location.pathname);
  const inactive = isGroupPath || !dmId;

  const [messages, setMessages] = useState([]);
  const [receiverData, setReceiverData] = useState(null);

  // text composer (use textarea for mobile like WhatsApp)
  const [text, setText] = useState("");
  const inputRef = useRef(null);

  // translation toggles
  const [showOriginalMap, setShowOriginalMap] = useState({});
  const [showVoiceOriginalMap, setShowVoiceOriginalMap] = useState({});
  const [translatingMessageId, setTranslatingMessageId] = useState(null);

  // composer
  const [recording, setRecording] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const fileInputRef = useRef(null);

  // emoji
  const [showEmoji, setShowEmoji] = useState(false);
  const [recentEmojis, setRecentEmojis] = useLocalStorage({ key: "recentEmojis", defaultValue: [] });

  const endRef = useRef(null);

  /* ----- THREAD MARKER: keep hooks order stable, guard with `inactive` inside ----- */
  useEffect(() => {
    if (inactive) {
      clearActiveThread();
    } else if (dmId) {
      setActiveThread("direct", String(dmId));
    }
    return () => clearActiveThread();
  }, [inactive, dmId]);

  // reset messages when DM changes
  useEffect(() => {
    if (inactive) return;
    setMessages([]);
  }, [dmId, inactive]);

  // socket boot / listeners
  useEffect(() => {
    if (inactive || !socket || !dmId || !myId) return;

    const boot = () => socket.emit("msgPage", dmId);
    if (socket.connected) boot(); else socket.on("connect", boot);

    socket.on("userInfo", (data) => setReceiverData(data));

    socket.on("message", (data) => {
      if (!data || String(data.chatWith) !== String(dmId)) return;

      const mergedFromServer = (data.original || []).map((msg) => {
        const t = (data.translated || []).find((x) => x._id === msg._id);
        return {
          ...msg,
          translatedText: String(msg.msgByUser) !== String(myId) ? t?.translatedMessage || null : null,
          translatedVoiceText: msg.translatedVoiceText || null,
          originalVoiceText: msg.voiceTranscription || null,
          seen: msg.seen ?? false,
        };
      });

      setMessages((prev) => dedupeMerge(prev, mergedFromServer));

      const hasNewUnseen = (data.original || []).some(
        (m) => String(m.msgByUser) === String(dmId) && !m.seen
      );
      if (hasNewUnseen) socket.emit("seen", { senderId: dmId, receiverId: myId });
    });

    socket.on("seenStatusUpdate", (ids) => {
      const arr = Array.isArray(ids) ? ids : [ids];
      setMessages((prev) => prev.map((m) => (arr.includes(m._id) ? { ...m, seen: true } : m)));
    });

    return () => {
      socket.off("connect", boot);
      socket.off("userInfo");
      socket.off("message");
      socket.off("seenStatusUpdate");
    };
  }, [socket, dmId, myId, inactive]);

  // ensure toggles exist for each msg
  useEffect(() => {
    const textMap = { ...showOriginalMap };
    const voiceMap = { ...showVoiceOriginalMap };
    for (const m of messages) {
      if (!(m._id in textMap)) textMap[m._id] = false;
      if (!(m._id in voiceMap)) voiceMap[m._id] = false;
    }
    setShowOriginalMap(textMap);
    setShowVoiceOriginalMap(voiceMap);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  // autoscroll
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // close emoji panel on ESC, send on Enter when panel is open
  useEffect(() => {
    const onKey = (e) => {
      if (!showEmoji) return;
      if (e.key === "Escape" || e.key === "Enter") setShowEmoji(false);
      if (e.key === "Enter") {
        e.preventDefault();
        if (text.trim()) sendText();
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [showEmoji, text]);

  /* actions */
  const appendOptimistic = (msg) =>
    setMessages((prev) =>
      dedupeMerge(prev, [{
        _id: `temp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        createdAt: new Date().toISOString(),
        ...msg,
      }])
    );

  const sendText = () => {
    const val = (text || "").trim();
    if (inactive || !val || !socket || !myId || !dmId) return;

    const clientNonce = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const payload = { sender: myId, receiver: dmId, messageType: "text", text: val, clientNonce };

    appendOptimistic({ msgByUser: myId, ...payload });

    socket.emit("newMsg", payload, (ack) => {
      if (ack?.savedMessage) setMessages((prev) => dedupeMerge(prev, [ack.savedMessage]));
    });
    socket.emit?.("side", myId);
    setText("");
    inputRef.current?.focus();
  };

  const detectMessageType = (file) => {
    const t = file?.type || "";
    if (t.startsWith("image")) return "image";
    if (t.startsWith("audio")) return "audio";
    if (t.startsWith("video")) return "video";
    return "file";
  };

  const sendFile = async (file, forcedType) => {
    if (inactive || !file || !socket || !myId || !dmId) return;

    // local preview
    const localUrl = URL.createObjectURL(file);
    const messageType = forcedType || detectMessageType(file);
    const clientNonce = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

    appendOptimistic({
      msgByUser: myId,
      sender: myId,
      receiver: dmId,
      messageType,
      url: localUrl,
      imageUrl: messageType === "image" ? localUrl : undefined,
      videoUrl: messageType === "video" ? localUrl : undefined,
      audioUrl: messageType === "audio" ? localUrl : undefined,
      fileUrl:  messageType === "file"  ? localUrl : undefined,
      fileName: file.name,
      fileSize: file.size,
      clientNonce,
      pending: true,
      seen: false,
    });

    try {
      // upload to cloudinary with proper resource_type
      const isDoc = isOfficeOrPdf(file.name);
      const up = await uploadFile(file, { resourceType: isDoc ? "raw" : "auto" });
      const cloudUrl = up?.secure_url || up?.url;
      if (!cloudUrl) throw new Error("No Cloudinary URL returned");

      // swap preview -> cloud url
      setMessages((prev) =>
        prev.map((m) =>
          m.clientNonce === clientNonce
            ? {
                ...m,
                url: cloudUrl,
                imageUrl: messageType === "image" ? cloudUrl : undefined,
                videoUrl: messageType === "video" ? cloudUrl : undefined,
                audioUrl: messageType === "audio" ? cloudUrl : undefined,
                fileUrl:  messageType === "file"  ? cloudUrl : undefined,
                pending: false,
              }
            : m
        )
      );

      // emit to server (include generic url to be safe)
      const payload = {
        sender: myId,
        receiver: dmId,
        messageType,
        url: cloudUrl,
        imageUrl: messageType === "image" ? cloudUrl : undefined,
        videoUrl: messageType === "video" ? cloudUrl : undefined,
        audioUrl: messageType === "audio" ? cloudUrl : undefined,
        fileUrl:  messageType === "file"  ? cloudUrl : undefined,
        fileName: file.name,
        fileSize: file.size,
        clientNonce,
      };

      socket.emit("newMsg", payload, (ack) => {
        if (ack?.savedMessage) setMessages((prev) => dedupeMerge(prev, [ack.savedMessage]));
      });
      socket.emit?.("side", myId);
    } catch (e) {
      console.error("Upload failed", e);
      setMessages((prev) =>
        prev.map((m) => (m.clientNonce === clientNonce ? { ...m, pending: false, failed: true } : m))
      );
    } finally {
      setTimeout(() => URL.revokeObjectURL(localUrl), 5000);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mime =
        MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
          ? "audio/webm;codecs=opus"
          : MediaRecorder.isTypeSupported("audio/webm")
          ? "audio/webm"
          : "";

      mediaRecorderRef.current = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      audioChunksRef.current = [];
      mediaRecorderRef.current.ondataavailable = (e) => e.data && audioChunksRef.current.push(e.data);
      mediaRecorderRef.current.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: mime || "audio/webm" });
        const ext = (mime || "").includes("mpeg") ? "mp3" : "webm";
        const file = new File([blob], `voice-${Date.now()}.${ext}`, { type: mime || "audio/webm" });
        await sendFile(file, "audio");
        stream.getTracks().forEach((t) => t.stop());
      };
      mediaRecorderRef.current.start();
      setRecording(true);
    } catch (err) {
      console.error("Mic access denied", err);
    }
  };
  const stopRecording = () => { mediaRecorderRef.current?.stop(); setRecording(false); };

  const handleTranslateVoice = useCallback(
    (audioUrl, messageId) => {
      if (inactive || !socket || !audioUrl || !messageId) return;
      setTranslatingMessageId(messageId);
      socket.emit("translateVoice", { audioUrl, receiverId: dmId, messageId });

      const onOk = (data) => {
        setMessages((prev) =>
          prev.map((m) =>
            m._id === data.messageId
              ? { ...m, translatedVoiceText: data.translatedText, originalVoiceText: data.originalText }
              : m
          )
        );
        setTranslatingMessageId(null);
      };
      const onErr = () => setTranslatingMessageId(null);
      socket.once("voiceTranslationResult", onOk);
      socket.once("voiceTranslationError", onErr);
    },
    [socket, dmId, inactive]
  );

  /* ---------------- UI bits ---------------- */
  const addEmoji = (emo) => {
    setText((s) => (s || "") + emo);
    // keep a tiny “recent” list (max 24)
    setRecentEmojis((arr) => {
      const next = [emo, ...arr.filter((x) => x !== emo)].slice(0, 24);
      return next;
    });
    // keep focus in input like WhatsApp
    setTimeout(() => inputRef.current?.focus(), 0);
  };
  const SeenTicks = ({ seen }) => (
    <span className="inline-flex items-center gap-0.5 ml-1 align-middle">
      {seen ? <CheckCheck size={12} /> : <Check size={12} />}
    </span>
  );
  const navigate = useNavigate();
const handleBack = () => {
    navigate(-1); // go back one step in browser history
  };

  /* ---------- render guard (AFTER hooks) ---------- */
  if (inactive) return null;

  return (
    <div className="h-full min-h-0 bg-[#0b0d11] text-zinc-100 rounded-2xl overflow-hidden flex flex-col">
      {/* Header */}
      <div className="h-14 px-2 sm:px-4 border-b border-zinc-800 flex items-center gap-3">
        
          <button  onClick={handleBack}className="lg:hidden p-2 rounded-lg hover:bg-zinc-800">
            {/* <div>TEST</div> */}
            <ChevronLeft size={16} />
          </button>
        
         {/* {onBack && (
          <button onClick={onBack} className="lg:hidden p-2 rounded-lg hover:bg-zinc-800">
            <ChevronLeft />
          </button>
        )} */}
        <Avatar imageUrl={receiverData?.profilePic} name={receiverData?.name} />
        <div className="min-w-0">
          <div className="font-semibold truncate">{receiverData?.name || "—"}</div>
          <div className="text-xs text-zinc-500 truncate">{receiverData?.email || ""}</div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-2 sm:p-3 md:p-4 bg-[#070809]">
        {(!messages || messages.length === 0) && (
          <p className="text-zinc-500">Start the conversation 👋</p>
        )}

        {messages.map((raw, i) => {
          const msg = normalizeMessage(raw);
          const isMe = String(msg.msgByUser || msg.sender) === String(myId);
          const bubble = isMe ? "bg-emerald-700 text-white" : "bg-[#1f2c34] text-zinc-100";
          const wrap = isMe ? "text-right" : "text-left";
          const time = fmtTime(msg.createdAt || msg.timestamp || new Date());
          const type = resolveType(msg);

          return (
            <div key={msg._id || msg.clientNonce || `m-${i}`} className={`mb-1.5 sm:mb-2 ${wrap}`} ref={i === messages.length - 1 ? endRef : null}>
              <div
                className={[
                  "inline-block px-3 py-2 rounded-2xl break-words",
                  "max-w-[84vw] sm:max-w-[70vw] md:max-w-[62vw] lg:max-w-[55vw]",
                  bubble,
                ].join(" ")}
              >
                {/* TEXT */}
                {type === "text" && (
                  <div className="text-[15px] whitespace-pre-wrap leading-6">
                    {msg.translatedText && !isMe && !isEmojiOnly(msg.text)
                      ? (showOriginalMap[msg._id] ? safeText(msg.text) : safeText(msg.translatedText))
                      : safeText(msg.text)}
                    {msg.translatedText && !isMe && !isEmojiOnly(msg.text) && (
                      <div className="text-[11px] mt-1 opacity-80">
                        <button
                          onClick={() => setShowOriginalMap((m) => ({ ...m, [msg._id]: !m[msg._id] }))}
                          className="underline"
                        >
                          {showOriginalMap[msg._id] ? "Show translation" : "Show original"}
                        </button>
                      </div>
                    )}
                  </div>
                )}

                {/* IMAGE */}
                {type === "image" && (msg.imageUrl || msg.url)
                  ? <ImageBubble url={msg.imageUrl || msg.url} fileName={msg.fileName} />
                  : (type === "image" && <div className="text-sm opacity-80">Image (pending)…</div>)
                }

                {/* FILE */}
                {type === "file" && (
                  <FileBubble url={msg.fileUrl || msg.url} fileName={msg.fileName} size={msg.fileSize} />
                )}

                {/* VIDEO */}
                {type === "video" && (msg.videoUrl || msg.url)
                  ? <video src={msg.videoUrl || msg.url} controls className="rounded-lg max-w-full h-auto" />
                  : (type === "video" && <div className="text-sm opacity-80">Video (pending)…</div>)
                }

                {/* AUDIO */}
                {type === "audio" && (msg.audioUrl || msg.url)
                  ? (
                    <div className="mt-1">
                      <VoiceBubble src={msg.audioUrl || msg.url} />
                      {!isMe && (
                        <>
                          {msg.translatedVoiceText ? (
                            <>
                              <p className="text-xs text-zinc-300/90 mt-1">
                                {showVoiceOriginalMap[msg._id]
                                  ? msg.originalVoiceText || "No original transcription available"
                                  : msg.translatedVoiceText}
                              </p>
                              <button
                                onClick={() => setShowVoiceOriginalMap((m) => ({ ...m, [msg._id]: !m[msg._id] }))}
                                className="text-[11px] underline mt-0.5"
                              >
                                {showVoiceOriginalMap[msg._id] ? "Show translation" : "Show original"}
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleTranslateVoice(msg.audioUrl || msg.url, msg._id)}
                              className="text-xs underline mt-1"
                              disabled={translatingMessageId === msg._id}
                            >
                              {translatingMessageId === msg._id ? "Translating…" : "Translate voice"}
                            </button>
                          )}
                        </>
                      )}
                    </div>
                  )
                  : (type === "audio" && <div className="text-sm opacity-80">Audio (pending)…</div>)
                }

                {/* upload status */}
                {msg.pending && <div className="text-[10px] mt-1 opacity-80">Uploading…</div>}
                {msg.failed && <div className="text-[10px] mt-1 text-red-300">Upload failed</div>}

                {/* time + ticks */}
                <div className={`text-[10px] mt-1 ${isMe ? "text-white/75" : "text-zinc-300/70"} text-right`}>
                  {time}
                  {isMe && <SeenTicks seen={!!msg.seen} />}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Composer */}
      <div className="relative p-2 sm:p-3 border-t border-zinc-800 bg-[#0b0d11]">
        {/* Emoji sheet */}
        {showEmoji && (
          <div
            className="
              sm:absolute sm:bottom-14 sm:left-2
              fixed left-0 right-0 bottom=[64px] z-30
              bg-[#0e1013] border border-zinc-700 rounded-t-2xl sm:rounded-xl
              shadow max-h-[45vh] sm:max-h-56 overflow-y-auto
              px-3 pt-2 pb-3
            "
          >
            <div className="flex items-center gap-3 mb-2 text-sm text-zinc-300">
              <span className="opacity-80">Recent</span>
              <span className="opacity-40">•</span>
              <span className="opacity-80">Smileys</span>
            </div>

            {recentEmojis.length > 0 && (
              <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 gap-1 mb-2">
                {recentEmojis.map((e, idx) => (
                  <button key={`r-${idx}`} onClick={() => addEmoji(e)} className="p-1 text-2xl sm:text-xl leading-none">{e}</button>
                ))}
              </div>
            )}

            <div className="grid grid-cols-8 sm:grid-cols-10 md:grid-cols-12 gap-1">
              {EMOJIS.map((e, idx) => (
                <button key={`${e}-${idx}`} onClick={() => addEmoji(e)} className="p-1 text-2xl sm:text-xl leading-none">{e}</button>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-end gap-2">
          {/* file */}
          <input
            ref={fileInputRef}
            type="file"
            hidden
            accept="image/*,audio/*,video/*,application/pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.csv,.txt,*/*"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              sendFile(f);
              e.target.value = null;
            }}
          />
          <button onClick={() => fileInputRef.current?.click()} className="p-2 rounded-md hover:bg-zinc-900" title="Attach">
            <Paperclip />
          </button>

          {/* emoji toggle */}
          <button onClick={() => setShowEmoji((s) => !s)} className="p-2 rounded-md hover:bg-zinc-900" title="Emoji">
            <Smile />
          </button>

          {/* textarea input */}
          <div className="flex-1 min-w-0">
            <textarea
              ref={inputRef}
              value={text}
              rows={1}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (text.trim()) sendText();
                }
              }}
              placeholder="Type a message…"
              className="
                w-full resize-none
                px-3 py-2 rounded-xl bg-[#0b0d11]
                border border-zinc-700 outline-none text-zinc-200
                leading-6 max-h-40 overflow-y-auto
              "
            />
          </div>

          {/* mic */}
          <button
            onClick={recording ? stopRecording : startRecording}
            className={`p-2 rounded-md hover:bg-zinc-900 ${recording ? "text-red-500" : ""}`}
            title={recording ? "Stop recording" : "Record voice"}
          >
            <Mic />
          </button>

          {/* send */}
          <button
            onClick={sendText}
            disabled={!text.trim()}
            className={`px-3 sm:px-4 py-2 rounded-xl text-white flex items-center gap-2 ${
              !text.trim() ? "bg-emerald-900 cursor-not-allowed" : "bg-emerald-700 hover:bg-emerald-600"
            }`}
          >
            <Send size={16} /> <span className="hidden sm:inline">Send</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatContainer;
