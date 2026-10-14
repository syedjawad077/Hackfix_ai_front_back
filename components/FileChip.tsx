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
    <div className="bg-[var(--paper)] border border-[var(--line)] rounded-[8px] p-3 flex flex-col gap-2">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-[8px] bg-[var(--paper-dark)] text-[var(--ink)] flex items-center justify-center shrink-0">
            <FileArchive className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-semibold text-[var(--ink)] truncate">
              {fileName}
            </p>
            <p className="text-xs text-[var(--ink-soft)]">
              {formatBytes(fileSize)} • ZIP archive
            </p>
          </div>
        </div>

        {!disabled && (
          <button
            type="button"
            onClick={onRemove}
            className="p-1 rounded-[8px] text-[var(--ink-soft)] hover:text-[var(--ink)] hover:bg-[var(--paper-dark)] focus:outline-none focus:ring-1 focus:ring-[var(--signal)]"
            aria-label={`Remove attached file ${fileName}`}
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Static Progress Bar (No animations) */}
      <div className="w-full">
        <div className="w-full bg-[var(--line)] h-1.5 rounded-[8px] overflow-hidden">
          <div
            className="bg-[var(--ink)] h-full rounded-[8px]"
            style={{ width: "100%" }}
          />
        </div>
        <div className="flex items-center justify-between text-[11px] text-[var(--ink-soft)] mt-1 font-medium">
          <span className="flex items-center gap-1 text-[var(--ink)]">
            <Check className="w-3 h-3 text-[#4C9F70]" />
            {statusText}
          </span>
          <span>100%</span>
        </div>
      </div>
    </div>
  );
}
