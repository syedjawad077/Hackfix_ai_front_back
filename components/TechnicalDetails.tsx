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
    <div className="w-full bg-[var(--paper-dark)] border border-[var(--line)] rounded-[8px] overflow-hidden">
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-[var(--paper)] focus:outline-none focus:bg-[var(--paper)]"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2.5">
          <Terminal className="w-4 h-4 text-[var(--ink-soft)]" />
          <span className="text-sm font-bold text-[var(--ink)]">
            Technical details ({logs.length} log events)
          </span>
          <span className="text-xs text-[var(--ink-soft)] hidden sm:inline">
            — for developers & debugging
          </span>
        </div>

        <div className="flex items-center gap-2">
          {isOpen && (
            <button
              type="button"
              onClick={handleCopyLogs}
              className="px-2 py-1 text-xs font-semibold text-[var(--ink)] bg-[var(--paper)] border border-[var(--line)] rounded-[8px] hover:bg-[var(--paper-dark)] flex items-center gap-1"
              aria-label="Copy logs to clipboard"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3 text-[var(--ink)]" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3 text-[var(--ink-soft)]" />
                  <span>Copy log</span>
                </>
              )}
            </button>
          )}

          {isOpen ? (
            <ChevronDown className="w-4 h-4 text-[var(--ink-soft)]" />
          ) : (
            <ChevronRight className="w-4 h-4 text-[var(--ink-soft)]" />
          )}
        </div>
      </button>

      {isOpen && (
        <div className="p-4 bg-[var(--ink)] text-[var(--paper)] border-t border-[var(--line)] font-mono text-xs max-h-72 overflow-y-auto space-y-1.5 select-text">
          {logs.map((log) => {
            let levelColor = "text-[var(--ink-soft)]";
            if (log.level === "warn") levelColor = "text-[#F2A900]";
            if (log.level === "success") levelColor = "text-[#4C9F70]";
            if (log.level === "info") levelColor = "text-[var(--paper)]";

            return (
              <div key={log.id} className="leading-relaxed flex items-start gap-2 scan-log-line">
                <span className="text-[var(--ink-soft)] shrink-0">[{log.timestamp}]</span>
                <span className={`uppercase font-semibold shrink-0 ${levelColor}`}>
                  [{log.level}]
                </span>
                <span className="text-[var(--paper)] break-all">{log.message}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
