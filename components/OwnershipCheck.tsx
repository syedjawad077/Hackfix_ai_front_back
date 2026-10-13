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
      <label className="flex items-start gap-3 p-3.5 bg-white border border-[#D9E2F0] rounded-xl cursor-pointer select-none hover:border-[#BACADF]">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={(e) => onCheckChange(e.target.checked)}
          disabled={isScanning}
          className="mt-0.5 w-4 h-4 text-[#0F2A5C] border-[#BACADF] rounded focus:ring-2 focus:ring-[#2563EB] cursor-pointer"
        />
        <div className="flex-1 text-xs sm:text-sm text-[#0B1F3A]">
          <span className="font-semibold">
            I own this application or have written permission to test it
          </span>
          <p className="text-xs text-[#51627A] mt-0.5">
            Security tests simulate real attacks in a safe way. Only test systems you control.
          </p>
        </div>
      </label>

      {/* Safety notice */}
      <div className="flex items-center gap-2 text-xs text-[#51627A] px-1">
        <Lock className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
        <span>HackFix AI only tests apps you own. Results may need review.</span>
      </div>

      {/* Large dark-blue Start scan button */}
      <div>
        <button
          type="button"
          onClick={onStartScan}
          disabled={!canStart || isScanning}
          className={`w-full py-3.5 px-6 rounded-xl font-bold text-base flex items-center justify-center gap-2 shadow-sm ${
            canStart && !isScanning
              ? "bg-[#0F2A5C] hover:bg-[#0A1F47] text-white cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
              : "bg-[#D9E2F0] text-[#51627A] cursor-not-allowed"
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
          <p className="text-center text-xs text-[#51627A] mt-2">
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
