// src/utils/notifications.js
let audioElem;

export async function ensureNotificationPermission() {
  if (!("Notification" in window)) return false;
  if (Notification.permission === "granted") return true;
  if (Notification.permission === "denied") return false;
  const res = await Notification.requestPermission();
  return res === "granted";
}

export async function playNotificationSound() {
  try {
    if (!audioElem) {
      audioElem = new Audio("/notify.mp3"); // put this file in /public
      audioElem.preload = "auto";
    }
    await audioElem.play();
  } catch {/* ignored */}
}

/**
 * title: string shown in the toast (use sender or group name)
 * body: short preview
 * urlToOpen: where to navigate when clicked
 * icon:  sender avatar or app icon (PNG is best)
 * badge: small monochrome icon (optional, Android/Win)
 * tag:   stable id to collapse duplicates (e.g., "dm:<userId>" or "grp:<groupId>")
 */
export async function showBrowserNotification({
  title = "New message",
  body = "",
  urlToOpen = "/",
  icon = "/app-icon-192.png",   // add this to /public
  badge = "/badge.png",         // optional
  tag,
} = {}) {
  if (!("Notification" in window)) return;
  const perm = Notification.permission === "granted"
    ? "granted"
    : await Notification.requestPermission();
  if (perm !== "granted") return;

  try {
    const n = new Notification(title, { body, icon, badge, tag, renotify: !!tag, requireInteraction: false });
    n.onclick = (e) => {
      e.preventDefault();
      // focus current tab if possible
      window.focus?.();
      // if hidden, open new tab (or same tab via router)
      if (document.visibilityState === "hidden") {
        window.open(urlToOpen, "_blank");
      } else {
        window.history.pushState({}, "", urlToOpen);
      }
      n.close();
    };
  } catch {/* ignored */}
}
