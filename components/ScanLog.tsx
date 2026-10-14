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
    <div className="w-full bg-[var(--paper-dark)] border border-[var(--line)] rounded-[8px] overflow-hidden my-3 text-xs text-[var(--ink)]">
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
        className="w-full flex items-center justify-between p-3 cursor-pointer hover:bg-[var(--paper)] select-none text-left focus:outline-none focus:ring-1 focus:ring-[var(--signal)]"
        aria-expanded={isOpen}
      >
        <div className="flex items-center gap-2">
          {isOpen ? (
            <ChevronDown className="w-4 h-4 text-[var(--ink-soft)]" />
          ) : (
            <ChevronRight className="w-4 h-4 text-[var(--ink-soft)]" />
          )}
          <Terminal className="w-4 h-4 text-[var(--ink)]" />
          <span className="font-semibold text-xs text-[var(--ink)]">Scan log</span>
          <span className="text-[11px] text-[var(--ink-soft)] font-mono bg-[var(--paper)] px-2 py-0.5 rounded-[8px] border border-[var(--line)]">
            {logs.length} events
          </span>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleCopyLogs}
            className="flex items-center gap-1 text-[11px] font-medium text-[var(--ink-soft)] hover:text-[var(--ink)] bg-[var(--paper)] hover:bg-[var(--paper-dark)] px-2 py-1 rounded-[8px] border border-[var(--line)]"
            aria-label="Copy logs to clipboard"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-[var(--ink)]" />
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
        <div className="p-3 border-t border-[var(--line)] bg-[var(--paper)] font-mono text-[11px] max-h-56 overflow-y-auto space-y-1.5 select-text">
          {logs.map((log) => {
            let badgeColor = "text-[var(--ink-soft)]";
            if (log.level === "warn") badgeColor = "text-[#E8591A]";
            if (log.level === "success") badgeColor = "text-[#4C9F70]";
            if (log.level === "info") badgeColor = "text-[var(--ink)]";

            return (
              <div key={log.id} className="flex items-start gap-2.5 leading-relaxed scan-log-line">
                <span className="text-[var(--ink-soft)] shrink-0 font-medium select-none">
                  [{log.timestamp}]
                </span>
                <span
                  className={`uppercase font-bold text-[10px] shrink-0 ${badgeColor} select-none`}
                >
                  [{log.level}]
                </span>
                <span className="text-[var(--ink)] break-all">{log.message}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

