"use client";

import React, { useState } from "react";
import { ChevronDown, ChevronRight, Terminal, Copy, Check } from "lucide-react";
import { ScanLogEntry } from "@/lib/types";

interface TechnicalDetailsProps {
  logs: ScanLogEntry[];
  defaultOpen?: boolean;
}

export function TechnicalDetails({
  logs,
  defaultOpen = false,
}: TechnicalDetailsProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const [copied, setCopied] = useState(false);

  const handleCopyLogs = (e: React.MouseEvent) => {
    e.stopPropagation();
    const logText = logs
      .map((l) => `[${l.timestamp}] [${l.level.toUpperCase()}] ${l.message}`)
      .join("\n");
    navigator.clipboard.writeText(logText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full bg-[#F4F7FB] border border-[#D9E2F0] rounded-2xl overflow-hidden shadow-sm">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-[#EAF0F8] focus:outline-none focus:bg-[#E3ECFA]"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2.5">
          <Terminal className="w-4 h-4 text-[#51627A]" />
          <span className="text-sm font-bold text-[#0B1F3A]">
            Technical details ({logs.length} log events)
          </span>
          <span className="text-xs text-[#51627A] hidden sm:inline">
            — for developers & debugging
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isOpen && (
            <button
              type="button"
              onClick={handleCopyLogs}
              className="px-2 py-1 text-xs font-semibold text-[#0B1F3A] bg-white border border-[#D9E2F0] rounded-lg hover:bg-[#F4F7FB] flex items-center gap-1"
              aria-label="Copy logs to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-[#2563EB]" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-[#51627A]" />
                  <span>Copy log</span>
                </>
              )}
            </button>
          )}

          {isOpen ? (
            <ChevronDown className="w-4 h-4 text-[#51627A]" />
          ) : (
            <ChevronRight className="w-4 h-4 text-[#51627A]" />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="p-4 bg-[#0B1F3A] text-slate-200 border-t border-[#D9E2F0] font-mono text-xs max-h-72 overflow-y-auto space-y-1.5 select-text">
          {logs.map((log) => {
            let levelColor = "text-slate-400";
            if (log.level === "warn") levelColor = "text-amber-400";
            if (log.level === "success") levelColor = "text-emerald-400";
            if (log.level === "info") levelColor = "text-sky-400";

            return (
              <div key={log.id} className="leading-relaxed flex items-start gap-2">
                <span className="text-slate-500 shrink-0">[{log.timestamp}]</span>
                <span className={`uppercase font-semibold shrink-0 ${levelColor}`}>
                  [{log.level}]
                </span>
                <span className="text-slate-200 break-all">{log.message}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
