"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronRight, Terminal, Copy, Check } from "lucide-react";
import { ScanLogEntry } from "@/lib/types";

interface ScanLogProps {
  logs: ScanLogEntry[];
}

export const ScanLog: React.FC<ScanLogProps> = ({ logs }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);

  if (!logs || logs.length === 0) return null;

  const handleCopyLogs = (e: React.MouseEvent) => {
    e.stopPropagation();
    const formatted = logs
      .map((l) => `[${l.timestamp}] [${l.level.toUpperCase()}] ${l.message}`)
      .join("\n");
    navigator.clipboard.writeText(formatted);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full bg-[#F4F7FB] border border-[#D9E2F0] rounded-xl overflow-hidden my-3 text-xs text-[#0B1F3A]">
      {/* Header bar / accordion toggle */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsOpen(!isOpen)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsOpen(!isOpen);
          }
        }}
        className="w-full flex items-center justify-between p-3 cursor-pointer hover:bg-[#EAF0F8] select-none text-left focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          {isOpen ? (
            <ChevronDown className="w-4 h-4 text-[#51627A]" />
          ) : (
            <ChevronRight className="w-4 h-4 text-[#51627A]" />
          )}
          <Terminal className="w-4 h-4 text-[#0F2A5C]" />
          <span className="font-semibold text-xs text-[#0B1F3A]">Scan log</span>
          <span className="text-[11px] text-[#51627A] font-mono bg-white px-2 py-0.5 rounded-pill border border-[#D9E2F0]">
            {logs.length} events
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyLogs}
            className="flex items-center gap-1 text-[11px] font-medium text-[#51627A] hover:text-[#0B1F3A] bg-white hover:bg-[#F4F7FB] px-2 py-1 rounded border border-[#D9E2F0]"
            aria-label="Copy logs to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-[#2563EB]" />
                Copied
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                Copy
              </>
            )}
          </button>
        </div>
      </div>

      {/* Log lines body */}
      {isOpen && (
        <div className="p-3 border-t border-[#D9E2F0] bg-[#F4F7FB] font-mono text-[11px] max-h-56 overflow-y-auto space-y-1.5 select-text">
          {logs.map((log) => {
            let badgeColor = "text-[#51627A]";
            if (log.level === "warn") badgeColor = "text-[#C2410C]";
            if (log.level === "success") badgeColor = "text-[#2563EB]";
            if (log.level === "info") badgeColor = "text-[#0F2A5C]";

            return (
              <div key={log.id} className="flex items-start gap-2.5 leading-relaxed">
                <span className="text-[#51627A] shrink-0 font-medium select-none">
                  [{log.timestamp}]
                </span>
                <span
                  className={`uppercase font-bold text-[10px] shrink-0 ${badgeColor} select-none`}
                >
                  [{log.level}]
                </span>
                <span className="text-[#0B1F3A] break-all">{log.message}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

