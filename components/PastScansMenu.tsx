"use client";

import React from "react";
import { Globe, ShieldAlert, ArrowRight, X } from "lucide-react";
import { PastScanSummary } from "@/lib/types";

interface PastScansMenuProps {
  pastScans: PastScanSummary[];
  onSelectScan: (scan: PastScanSummary) => void;
  onClose: () => void;
}

export function PastScansMenu({
  pastScans,
  onSelectScan,
  onClose,
}: PastScansMenuProps) {
  return (
    <div
      role="menu"
      className="absolute right-0 mt-2 w-80 sm:w-96 bg-[var(--paper)] border border-[var(--line)] rounded-[8px] z-50 overflow-hidden"
    >
      <div className="px-4 py-3 bg-[var(--paper-dark)] border-b border-[var(--line)] flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
          Previous App Scans
        </span>
        <button
          type="button"
          onClick={onClose}
          className="text-[var(--ink-soft)] hover:text-[var(--ink)] p-1 rounded-[8px]"
          aria-label="Close menu"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-[var(--line)]">
        {pastScans.length === 0 ? (
          <div className="p-6 text-center text-sm text-[var(--ink-soft)]">
            No previous scans found. Start your first scan below!
          </div>
        ) : (
          pastScans.map((scan) => {
            const scoreColor =
              scan.riskScore >= 80
                ? "bg-[#EDF7F1] text-[#2F6D4B] border-[#BDE3CC]"
                : scan.riskScore >= 60
                ? "bg-[#FEF8E7] text-[#B88100] border-[#FBE39F]"
                : "bg-[#FDE8EA] text-[#D7263D] border-[#F8B4BB]";

            return (
              <button
                key={scan.id}
                type="button"
                onClick={() => onSelectScan(scan)}
                className="w-full text-left p-3.5 hover:bg-[var(--paper-dark)] flex items-center justify-between gap-3 focus:outline-none focus:bg-[var(--paper-dark)]"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Globe className="w-4 h-4 text-[var(--ink-soft)] shrink-0" />
                    <span className="text-sm font-semibold font-mono text-[var(--ink)] truncate">
                      {scan.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[var(--ink-soft)]">
                    <span>{scan.date}</span>
                    <span>•</span>
                    <span>
                      {scan.criticalCount > 0 ? (
                        <span className="text-[#D7263D] font-medium">
                          {scan.criticalCount} critical
                        </span>
                      ) : (
                        <span>Clean</span>
                      )}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span
                    className={`inline-flex items-center px-2 py-0.5 rounded-[8px] text-xs font-bold border ${scoreColor}`}
                  >
                    Score {scan.riskScore}
                  </span>
                  <ArrowRight className="w-4 h-4 text-[var(--ink-soft)]" />
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
