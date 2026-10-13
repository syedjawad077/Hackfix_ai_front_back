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
      className="fixed inset-0 z-50 pointer-events-none flex items-center justify-center p-6 bg-[#0F2A5C]/15 backdrop-blur-[1px]"
      aria-hidden="true"
    >
      <div className="w-full max-w-xl p-8 bg-white rounded-2xl border-2 border-dashed border-[#2563EB] shadow-card flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-full bg-[#E3ECFA] text-[#0F2A5C] flex items-center justify-center mb-4">
          <UploadCloud className="w-8 h-8 text-[#2563EB]" />
        </div>
        <h3 className="text-lg font-bold text-[#0B1F3A] mb-1">
          Source ZIP Scanning (Coming Soon)
        </h3>
        <p className="text-sm text-[#51627A] max-w-md mb-3">
          This release prioritizes real URL security scanning. Source-code ZIP analysis will be enabled in a future update.
        </p>
        <div className="inline-flex items-center gap-2 text-xs font-semibold px-3 py-1 bg-[#F4F7FB] border border-[#D9E2F0] rounded-pill text-[#51627A]">
          <FileArchive className="w-3.5 h-3.5" />
          Live Website URL Scanning Active
        </div>
      </div>
    </div>
  );
};

