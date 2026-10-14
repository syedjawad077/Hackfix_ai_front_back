"use client";

import React from "react";
import { UploadCloud, FileArchive } from "lucide-react";

interface DropOverlayProps {
  isDragging: boolean;
}

export const DropOverlay: React.FC<DropOverlayProps> = ({ isDragging }) => {
  if (!isDragging) return null;

  return (
    <div
      className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center p-6 bg-[var(--ink)]/40 backdrop-blur-[1px]"
      aria-hidden="true"
    >
      <div className="w-full max-w-xl p-8 bg-[var(--paper)] rounded-[8px] border-2 border-dashed border-[var(--signal)] flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-[8px] bg-[var(--paper-dark)] text-[var(--signal)] flex items-center justify-center mb-4">
          <UploadCloud className="w-8 h-8 text-[var(--signal)]" />
        </div>
        <h3 className="text-lg font-bold text-[var(--ink)] mb-1">
          Source ZIP Scanning (Coming Soon)
        </h3>
        <p className="text-sm text-[var(--ink-soft)] max-w-md mb-3">
          This release prioritizes real URL security scanning. Source-code ZIP analysis will be enabled in a future update.
        </p>
        <div className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 bg-[var(--paper-dark)] border border-[var(--line)] rounded-[8px] text-[var(--ink-soft)]">
          <FileArchive className="w-3.5 h-3.5" />
          Live Website URL Scanning Active
        </div>
      </div>
    </div>
  );
};

