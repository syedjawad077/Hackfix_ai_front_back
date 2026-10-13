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
      className="absolute right-0 mt-2 w-80 sm:w-96 bg-white border border-[#D9E2F0] rounded-2xl shadow-xl z-50 overflow-hidden"
    >
      <div className="px-4 py-3 bg-[#F4F7FB] border-b border-[#D9E2F0] flex items-center justify-between">
        <span className="text-xs font-bold uppercase tracking-wider text-[#0B1F3A]">
          Previous App Scans
        </span>
        <button
          type="button"
          onClick={onClose}
          className="text-[#51627A] hover:text-[#0B1F3A] p-1 rounded-md"
          aria-label="Close menu"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      <div className="max-h-80 overflow-y-auto divide-y divide-[#D9E2F0]">
        {pastScans.length === 0 ? (
          <div className="p-6 text-center text-sm text-[#51627A]">
            No previous scans found. Start your first scan below!
          </div>
        ) : (
          pastScans.map((scan) => {
            const scoreColor =
              scan.riskScore >= 80
                ? "bg-[#DBEAFE] text-[#1D4ED8] border-[#93C5FD]"
                : scan.riskScore >= 60
                ? "bg-[#FEF3C7] text-[#B45309] border-[#FCD34D]"
                : "bg-[#FEE2E2] text-[#991B1B] border-[#FCA5A5]";

            return (
              <button
                key={scan.id}
                type="button"
                onClick={() => onSelectScan(scan)}
                className="w-full text-left p-3.5 hover:bg-[#F4F7FB] flex items-center justify-between gap-3 focus:outline-none focus:bg-[#E3ECFA]"
              >
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Globe className="w-4 h-4 text-[#2563EB] shrink-0" />
                    <span className="text-sm font-semibold text-[#0B1F3A] truncate">
                      {scan.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#51627A]">
                    <span>{scan.date}</span>
                    <span>•</span>
                    <span>
                      {scan.criticalCount > 0 ? (
                        <span className="text-[#991B1B] font-medium">
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
                    className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${scoreColor}`}
                  >
                    Score {scan.riskScore}
                  </span>
                  <ArrowRight className="w-4 h-4 text-[#51627A]" />
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
}
