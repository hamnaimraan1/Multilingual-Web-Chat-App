// frontend/src/components/ChatDayDivider.jsx
import React from "react";

/**
 * Are two date-like values on the same calendar day?
 */
export const isSameDay = (a, b) => {
  if (!a || !b) return false;
  const d1 = new Date(a);
  const d2 = new Date(b);
  if (Number.isNaN(d1.getTime()) || Number.isNaN(d2.getTime())) return false;
  return d1.toDateString() === d2.toDateString();
};

/**
 * WhatsApp-style date label: Today / Yesterday / 9 Nov 2025
 */
export const formatDateLabel = (dateLike) => {
  const date = new Date(dateLike);
  if (Number.isNaN(date.getTime())) return "";

  const today = new Date();
  const yesterday = new Date();
  yesterday.setDate(today.getDate() - 1);

  const same = (x, y) => x.toDateString() === y.toDateString();

  if (same(date, today)) return "Today";
  if (same(date, yesterday)) return "Yesterday";

  return date.toLocaleDateString(undefined, {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
};

/**
 * Visual chip used between messages.
 */
const ChatDayDivider = ({ date }) => {
  if (!date) return null;

  return (
    <div className="flex justify-center my-2">
      <span className="px-3 py-1 rounded-full bg-zinc-800 text-[11px] text-zinc-300">
        {formatDateLabel(date)}
      </span>
    </div>
  );
};

export default ChatDayDivider;
