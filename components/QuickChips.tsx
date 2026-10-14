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
          className="text-xs font-semibold text-[var(--ink)] bg-[var(--paper-dark)] hover:bg-[var(--paper)] border border-[var(--line)] px-2.5 py-1 rounded-[8px] cursor-pointer select-none focus:outline-none focus:ring-1 focus:ring-[var(--signal)] disabled:opacity-50 disabled:cursor-not-allowed text-left"
        >
          {chip}
        </button>
      ))}
    </div>
  );
}
