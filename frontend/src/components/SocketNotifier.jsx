// src/components/SocketNotifier.jsx
import { useEffect, useRef } from "react";
import { GetSocket } from "../utils/Sockets";
import { showBrowserNotification, ensureNotificationPermission, playNotificationSound } from "../utils/notifications";
import { getActiveThread } from "../utils/activeThread";
import { useLocalStorage } from "@mantine/hooks";

export default function SocketNotifier() {
  const socket =
    (typeof GetSocket === "function"
      ? GetSocket()
      : GetSocket?.socket || GetSocket?.current || GetSocket) || null;

  const [userLS] = useLocalStorage({ key: "userData", defaultValue: {} });

  // cache: userId -> { name, avatar }
  const peopleRef = useRef(new Map());

  useEffect(() => {
    if (!socket) return;

    // Ask once
    ensureNotificationPermission().catch(() => {});

    // Build/refresh people cache from sidebar conversations
    const onConv = (list = []) => {
      for (const c of list) {
        const youAreSender = String(c?.sender?._id) === String(userLS?._id);
        const peer = youAreSender ? c?.receiver : c?.sender;
        if (peer?._id) {
          peopleRef.current.set(String(peer._id), {
            name: peer.name || "Someone",
            avatar: peer.profilePic || "/app-icon-192.png",
          });
        }
      }
    };

    // Also cache “userInfo” when a DM page loads
    const onUserInfo = (u) => {
      if (!u?._id) return;
      peopleRef.current.set(String(u._id), {
        name: u.name || "Someone",
        avatar: u.profilePic || "/app-icon-192.png",
      });
    };

    socket.on("conv", onConv);
    socket.on("userInfo", onUserInfo);

    // ---- Direct messages ----
    const onDirect = async (data) => {
      const msgs = data?.original || [];
      if (!msgs.length) return;
      const last = msgs[msgs.length - 1];

      const senderId = String(last.msgByUser || last.sender || "");
      const me = String(userLS?._id || "");
      const isMine = senderId && senderId === me;
      if (isMine) return; // don't notify yourself

      // Only suppress if SAME thread AND window is visible & focused
      const { type, id } = getActiveThread();
      const isSameThread = type === "direct" && String(data.chatWith) === String(id);
      const windowVisible = document.visibilityState === "visible" && document.hasFocus?.();
      const suppress = isSameThread && windowVisible;
      if (suppress) return;

      const person = peopleRef.current.get(senderId) ||
                     peopleRef.current.get(String(data.chatWith)) || 
                     { name: "New message", avatar: "/app-icon-192.png" };

      const body = last.text
        ? String(last.text).slice(0, 140)
        : (last.fileName || "Attachment");

      await playNotificationSound();
      showBrowserNotification({
        title: `${person.name}`,
        body,
        icon: person.avatar,
        tag: `dm:${data.chatWith}`,
        urlToOpen: `/${data.chatWith}`,
      });
    };

    // ---- Group messages ----
    const onGroup = async (msg) => {
      if (!msg) return;
      const senderId = String(msg.msgByUser || "");
      const me = String(userLS?._id || "");
      if (senderId === me) return;

      const { type, id } = getActiveThread();
      const isSameThread = type === "group" && String(msg.groupId) === String(id);
      const windowVisible = document.visibilityState === "visible" && document.hasFocus?.();
      const suppress = isSameThread && windowVisible;
      if (suppress) return;

      const sender = peopleRef.current.get(senderId) || { name: "Someone", avatar: "/app-icon-192.png" };
      const body = msg.text ? String(msg.text).slice(0, 140) : (msg.fileName || "Attachment");

      await playNotificationSound();
      showBrowserNotification({
        title: `New message • ${sender.name}`,
        body,
        icon: sender.avatar,
        tag: `grp:${msg.groupId}`,
        urlToOpen: `/groups/${msg.groupId}`,
      });
    };

    socket.on("message", onDirect);
    socket.on("receive-group-msg", onGroup);

    return () => {
      socket.off("conv", onConv);
      socket.off("userInfo", onUserInfo);
      socket.off("message", onDirect);
      socket.off("receive-group-msg", onGroup);
    };
  }, [socket, userLS?._id]);

  return null;
}
