"use client";

import React from "react";
import { ShieldCheck, Play, Lock } from "lucide-react";

interface OwnershipCheckProps {
  isChecked: boolean;
  onCheckChange: (checked: boolean) => void;
  canStart: boolean;
  onStartScan: () => void;
  isScanning: boolean;
  hasValidUrl: boolean;
}

export function OwnershipCheck({
  isChecked,
  onCheckChange,
  canStart,
  onStartScan,
  isScanning,
  hasValidUrl,
}: OwnershipCheckProps) {
  return (
    <div className="w-full space-y-4">
      {/* Checkbox row */}
      <label className="flex items-start gap-3 p-3.5 bg-[var(--paper)] border border-[var(--line)] rounded-[8px] cursor-pointer select-none hover:border-[var(--signal)]">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={(e) => onCheckChange(e.target.checked)}
          disabled={isScanning}
          className="mt-0.5 w-4 h-4 text-[var(--signal)] border-[var(--line)] rounded focus:ring-1 focus:ring-[var(--signal)] accent-[var(--signal)] cursor-pointer"
        />
        <div className="flex-1 text-xs sm:text-sm text-[var(--ink)]">
          <span className="font-semibold">
            I own this application or have written permission to test it
          </span>
          <p className="text-xs text-[var(--ink-soft)] mt-0.5">
            Security tests simulate real attacks in a safe way. Only test systems you control.
          </p>
        </div>
      </label>

      {/* Safety notice */}
      <div className="flex items-center gap-2 text-xs text-[var(--ink-soft)] px-1">
        <Lock className="w-3.5 h-3.5 text-[var(--ink-soft)] shrink-0" />
        <span>HackFix AI only tests apps you own. Results may need review.</span>
      </div>

      {/* Signal orange Start scan button */}
      <div>
        <button
          type="button"
          onClick={onStartScan}
          disabled={!canStart || isScanning}
          className={`w-full py-3.5 px-6 rounded-[8px] font-bold text-base flex items-center justify-center gap-2 ${
            canStart && !isScanning
              ? "bg-[var(--signal)] hover:bg-[var(--signal-dark)] text-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-[var(--signal)]"
              : "bg-[var(--line)] text-[var(--ink-soft)] cursor-not-allowed"
          }`}
          aria-label="Start security scan"
        >
          {isScanning ? (
            <span>Scanning...</span>
          ) : (
            <>
              <Play className="w-5 h-5 fill-current" />
              <span>Start scan</span>
            </>
          )}
        </button>

        {!canStart && !isScanning && (
          <p className="text-center text-xs text-[var(--ink-soft)] mt-2">
            {!hasValidUrl && !isChecked
              ? "Enter your website link in Step 1 and confirm ownership to start."
              : !hasValidUrl
              ? "Enter a valid website link in Step 1 to continue."
              : "Tick the ownership confirmation box above to continue."}
          </p>
        )}
      </div>
    </div>
  );
}
