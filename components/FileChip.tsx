"use client";

import React from "react";
import { FileArchive, X, Check } from "lucide-react";
import { formatBytes } from "@/lib/utils";

interface FileChipProps {
  fileName: string;
  fileSize: number;
  onRemove: () => void;
  statusText?: string;
  disabled?: boolean;
}

export function FileChip({
  fileName,
  fileSize,
  onRemove,
  statusText = "Ready for analysis",
  disabled = false,
}: FileChipProps) {
  return (
    <div className="bg-white border border-[#D9E2F0] rounded-xl p-3 shadow-sm flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#E3ECFA] text-[#0F2A5C] flex items-center justify-center shrink-0">
            <FileArchive className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[#0B1F3A] truncate">
              {fileName}
            </p>
            <p className="text-xs text-[#51627A]">
              {formatBytes(fileSize)} • ZIP archive
            </p>
          </div>
        </div>

        {!disabled && (
          <button
            type="button"
            onClick={onRemove}
            className="p-1 rounded-md text-[#51627A] hover:text-[#0B1F3A] hover:bg-[#F4F7FB] focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            aria-label={`Remove attached file ${fileName}`}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Static Progress Bar (No animations) */}
      <div className="w-full">
        <div className="w-full bg-[#E3ECFA] h-1.5 rounded-full overflow-hidden">
          <div
            className="bg-[#0F2A5C] h-full rounded-full"
            style={{ width: "100%" }}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] text-[#51627A] mt-1 font-medium">
          <span className="flex items-center gap-1 text-[#0F2A5C]">
            <Check className="w-3 h-3 text-[#2563EB]" />
            {statusText}
          </span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
}
