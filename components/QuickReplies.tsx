"use client";

import React from "react";
import { MessageSquare } from "lucide-react";

interface QuickRepliesProps {
  replies: string[];
  onSelect: (reply: string) => void;
  disabled?: boolean;
}

export const QuickReplies: React.FC<QuickRepliesProps> = ({
  replies,
  onSelect,
  disabled = false,
}) => {
  if (!replies || replies.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-2 pt-2.5" role="group" aria-label="Quick reply suggestions">
      <span className="text-[11px] font-semibold text-[var(--ink-soft)] flex items-center gap-1 mr-1">
        <MessageSquare className="w-3 h-3 text-[var(--ink-soft)]" />
        Suggested:
      </span>
      {replies.map((reply, idx) => (
        <button
          key={`${reply}-${idx}`}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(reply)}
          className="text-xs font-medium px-3 py-1.5 rounded-[8px] bg-[var(--paper-dark)] text-[var(--ink)] border border-[var(--line)] hover:bg-[var(--paper)] hover:border-[var(--line)] focus:outline-none focus:ring-1 focus:ring-[var(--signal)] disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {reply}
        </button>
      ))}
    </div>
  );
};

