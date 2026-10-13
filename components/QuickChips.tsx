"use client";

import React from "react";

interface QuickChipsProps {
  chips: string[];
  onSelectChip: (chip: string) => void;
  disabled?: boolean;
}

export function QuickChips({
  chips,
  onSelectChip,
  disabled = false,
}: QuickChipsProps) {
  if (!chips || chips.length === 0) return null;

  return (
    <div className="flex flex-wrap items-center gap-1.5 py-1">
      {chips.map((chip, idx) => (
        <button
          key={idx}
          type="button"
          onClick={() => !disabled && onSelectChip(chip)}
          disabled={disabled}
          className="text-xs font-semibold text-[#0F2A5C] bg-[#E3ECFA] hover:bg-[#D5E4F8] border border-[#BACADF] px-2.5 py-1 rounded-full cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-[#2563EB] disabled:opacity-50 disabled:cursor-not-allowed text-left"
        >
          {chip}
        </button>
      ))}
    </div>
  );
}
