"use client";

import React from "react";
import { Sparkles } from "lucide-react";

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
      <span className="text-[11px] font-semibold text-[#51627A] flex items-center gap-1 mr-1">
        <Sparkles className="w-3 h-3 text-[#2563EB]" />
        Suggested:
      </span>
      {replies.map((reply, idx) => (
        <button
          key={`${reply}-${idx}`}
          type="button"
          disabled={disabled}
          onClick={() => onSelect(reply)}
          className="text-xs font-medium px-3 py-1.5 rounded-pill bg-[#E3ECFA] text-[#0F2A5C] border border-[#D9E2F0] hover:bg-[#D8E5F7] hover:border-[#BACADF] focus:outline-none focus:ring-2 focus:ring-[#2563EB] disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
        >
          {reply}
        </button>
      ))}
    </div>
  );
};

