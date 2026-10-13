"use client";

import React, { useState, useEffect } from "react";
import { ShieldAlert, Check, X, ExternalLink } from "lucide-react";

interface OwnershipModalProps {
  isOpen: boolean;
  targetUrl: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export const OwnershipModal: React.FC<OwnershipModalProps> = ({
  isOpen,
  targetUrl,
  onConfirm,
  onCancel,
}) => {
  const [isChecked, setIsChecked] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsChecked(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1F3A]/40"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ownership-modal-title"
    >
      <div className="w-full max-w-md bg-white rounded-2xl border border-[#D9E2F0] shadow-modal p-6 text-[#0B1F3A]">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#E3ECFA] text-[#0F2A5C] flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5 text-[#2563EB]" />
            </div>
            <div>
              <h3
                id="ownership-modal-title"
                className="text-base font-bold text-[#0B1F3A]"
              >
                Confirm ownership
              </h3>
              <p className="text-xs text-[#51627A]">
                Authorization required before testing
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-[#51627A] hover:text-[#0B1F3A] p-1 rounded hover:bg-black/5"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 text-sm mb-6">
          <p className="text-[#51627A] text-xs leading-relaxed">
            HackFix AI conducts active, safe security validation probes against the specified target. To ensure compliance and responsible testing, you must verify your authority over this endpoint.
          </p>

          <div className="p-3 bg-[#F4F7FB] border border-[#D9E2F0] rounded-xl">
            <span className="block text-[11px] font-semibold text-[#51627A] uppercase mb-1">
              Target URL to test
            </span>
            <div className="flex items-center gap-2 text-xs font-mono text-[#0B1F3A] break-all select-all">
              <ExternalLink className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
              <span>{targetUrl || "https://example.com"}</span>
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-start gap-3 p-3 bg-white border border-[#D9E2F0] rounded-xl cursor-pointer hover:bg-[#F4F7FB]/50">
              <input
                type="checkbox"
                checked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-[#D9E2F0] text-[#0F2A5C] focus:ring-[#2563EB]"
              />
              <span className="text-xs text-[#0B1F3A] font-medium leading-snug">
                I own this application or have written permission to test it
              </span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#D9E2F0]">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold text-[#51627A] hover:text-[#0B1F3A] rounded-pill border border-[#D9E2F0] hover:bg-[#F4F7FB]"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!isChecked}
            onClick={onConfirm}
            className={`inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-pill shadow-soft ${
              isChecked
                ? "bg-[#0F2A5C] text-white hover:bg-[#0A1F47]"
                : "bg-[#D9E2F0] text-[#51627A] cursor-not-allowed opacity-70"
            }`}
          >
            <Check className="w-4 h-4" />
            Start scan
          </button>
        </div>
      </div>
    </div>
  );
};

