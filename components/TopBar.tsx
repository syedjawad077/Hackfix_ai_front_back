"use client";

import React, { useState, useRef, useEffect } from "react";
import { Shield, History, Plus } from "lucide-react";
import { PastScansMenu } from "./PastScansMenu";
import { PastScanSummary } from "@/lib/types";

interface TopBarProps {
  pastScans: PastScanSummary[];
  onSelectPastScan: (scan: PastScanSummary) => void;
  onNewScan: () => void;
  currentScanTitle?: string;
}

export function TopBar({
  pastScans,
  onSelectPastScan,
  onNewScan,
  currentScanTitle,
}: TopBarProps) {
  const [isPastScansOpen, setIsPastScansOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsPastScansOpen(false);
      }
    }
    if (isPastScansOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isPastScansOpen]);

  return (
    <header className="w-full bg-white border-b border-[#D9E2F0] sticky top-0 z-40">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Left: Logo block + Wordmark */}
        <div
          role="button"
          tabIndex={0}
          onClick={onNewScan}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onNewScan();
            }
          }}
          className="flex items-center gap-3 cursor-pointer select-none focus:outline-none focus:ring-2 focus:ring-[#2563EB] rounded-lg p-1"
          aria-label="HackFix AI Home"
        >
          <div className="w-9 h-9 rounded-xl bg-[#0F2A5C] text-white flex items-center justify-center font-bold text-lg shadow-sm">
            <Shield className="w-5 h-5 text-white" />
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-lg text-[#0B1F3A] tracking-tight leading-none">
              HackFix AI
            </span>
            <span className="text-[11px] text-[#51627A] font-medium mt-0.5">
              Security for AI-built apps
            </span>
          </div>
        </div>

        {/* Right: Past scans dropdown + New scan button */}
        <div className="flex items-center gap-2.5">
          {/* Past scans button & dropdown */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setIsPastScansOpen((prev) => !prev)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-[#0B1F3A] bg-[#F4F7FB] hover:bg-[#E3ECFA] border border-[#D9E2F0] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              aria-expanded={isPastScansOpen}
              aria-haspopup="true"
            >
              <History className="w-4 h-4 text-[#51627A]" />
              <span>Past scans</span>
            </button>

            {isPastScansOpen && (
              <PastScansMenu
                pastScans={pastScans}
                onSelectScan={(scan) => {
                  onSelectPastScan(scan);
                  setIsPastScansOpen(false);
                }}
                onClose={() => setIsPastScansOpen(false)}
              />
            )}
          </div>

          {/* + New scan button */}
          <button
            type="button"
            onClick={onNewScan}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold text-white bg-[#0F2A5C] hover:bg-[#0A1F47] rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
          >
            <Plus className="w-4 h-4" />
            <span>New scan</span>
          </button>
        </div>
      </div>
    </header>
  );
}
