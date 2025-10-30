// src/components/MessageMenu.jsx
import React from "react";
import { MoreVertical, Pencil, Trash as TrashIcon } from "lucide-react";

export default function MessageMenu({
  isMe,
  openForId,
  onToggle,
  onEdit,
  onDelete,
  anchorSide = "right",
  bubbleId,
}) {
  return (
    <>
      <button
        onClick={(e) => { e.stopPropagation(); onToggle(openForId === bubbleId ? null : bubbleId); }}
        className={`absolute -top-2 ${anchorSide === "right" ? "-right-2" : "-left-2"} p-1 rounded-full
                    bg-black/30 hover:bg-black/40 opacity-0 group-hover:opacity-100 transition`}
        title="More"
      >
        <MoreVertical size={16} />
      </button>

      {openForId === bubbleId && (
        <div
          className={`absolute z-20 min-w-[160px] border border-zinc-700 rounded-lg overflow-hidden shadow
                      ${anchorSide === "right" ? "right-6 top-0" : "left-6 top-0"} bg-[#0e1013]`}
          onClick={(e) => e.stopPropagation()}
        >
          {isMe && (
            <button
              className="w-full text-left px-3 py-2 text-sm hover:bg-zinc-800 flex items-center gap-2"
              onClick={onEdit}
            >
              <Pencil size={14} /> Edit
            </button>
          )}
          <button
            className="w-full text-left px-3 py-2 text-sm hover:bg-zinc-800 flex items-center gap-2"
            onClick={onDelete}
          >
            <TrashIcon size={14} /> Delete
          </button>
        </div>
      )}
    </>
  );
}
