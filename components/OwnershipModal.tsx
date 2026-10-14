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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--ink)]/50 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="ownership-modal-title"
    >
      <div className="w-full max-w-md bg-[var(--paper)] rounded-[8px] border border-[var(--line)] p-6 text-[var(--ink)]">
        {/* Header */}
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[8px] bg-[var(--paper-dark)] text-[var(--ink)] flex items-center justify-center shrink-0">
              <ShieldAlert className="w-5 h-5 text-[var(--signal)]" />
            </div>
            <div>
              <h3
                id="ownership-modal-title"
                className="text-base font-bold text-[var(--ink)]"
              >
                Confirm ownership
              </h3>
              <p className="text-xs text-[var(--ink-soft)]">
                Authorization required before testing
              </p>
            </div>
          </div>
          <button
            onClick={onCancel}
            className="text-[var(--ink-soft)] hover:text-[var(--ink)] p-1 rounded-[8px] hover:bg-black/5"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-4 text-sm mb-6">
          <p className="text-[var(--ink-soft)] text-xs leading-relaxed">
            HackFix AI conducts active, safe security validation probes against the specified target. To ensure compliance and responsible testing, you must verify your authority over this endpoint.
          </p>

          <div className="p-3 bg-[var(--paper-dark)] border border-[var(--line)] rounded-[8px]">
            <span className="block text-[11px] font-semibold text-[var(--ink-soft)] uppercase mb-1">
              Target URL to test
            </span>
            <div className="flex items-center gap-2 text-xs font-mono text-[var(--ink)] break-all select-all">
              <ExternalLink className="w-3.5 h-3.5 text-[var(--ink-soft)] shrink-0" />
              <span>{targetUrl || "https://example.com"}</span>
            </div>
          </div>

          <div className="pt-2">
            <label className="flex items-start gap-3 p-3 bg-[var(--paper)] border border-[var(--line)] rounded-[8px] cursor-pointer hover:bg-[var(--paper-dark)]">
              <input
                type="checkbox"
                checked={isChecked}
                onChange={(e) => setIsChecked(e.target.checked)}
                className="mt-0.5 h-4 w-4 rounded border-[var(--line)] text-[var(--signal)] focus:ring-[var(--signal)] accent-[var(--signal)]"
              />
              <span className="text-xs text-[var(--ink)] font-medium leading-snug">
                I own this application or have written permission to test it
              </span>
            </label>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-[var(--line)]">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 text-xs font-semibold text-[var(--ink-soft)] hover:text-[var(--ink)] rounded-[8px] border border-[var(--line)] hover:bg-[var(--paper-dark)]"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!isChecked}
            onClick={onConfirm}
            className={`inline-flex items-center gap-1.5 px-5 py-2 text-xs font-bold rounded-[8px] transition-all ${
              isChecked
                ? "bg-[var(--signal)] text-white hover:bg-[var(--signal-dark)]"
                : "bg-[var(--line)] text-[var(--ink-soft)] cursor-not-allowed opacity-70"
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

