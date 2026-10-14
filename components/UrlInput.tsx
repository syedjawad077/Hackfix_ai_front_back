"use client";

import React from "react";
import { Globe, X, Check } from "lucide-react";
import { isValidUrl } from "@/lib/utils";

export interface UrlInputProps {
  value: string;
  onChange: (value: string) => void;
  onClear?: () => void;
  disabled?: boolean;
  ownershipVerified?: boolean;
}

export const UrlInput: React.FC<UrlInputProps> = ({
  value,
  onChange,
  onClear,
  disabled = false,
  ownershipVerified = false,
}) => {
  const isUrlValid = value.trim().length > 0 && isValidUrl(value.trim());
  const hasInput = value.trim().length > 0;

  return (
    <div className="w-full">
      <div className="flex items-center justify-between mb-1.5 px-1">
        <label
          htmlFor="website-url-input"
          className="text-xs font-semibold uppercase tracking-wider text-[var(--ink-soft)] flex items-center gap-1.5"
        >
          <Globe className="w-3.5 h-3.5 text-[var(--ink-soft)]" />
          <span>Website link (https://...)</span>
        </label>
        {ownershipVerified && hasInput && isUrlValid && (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium bg-[var(--paper-dark)] text-[var(--ink)] px-2 py-0.5 rounded-[8px] border border-[var(--line)]">
            <Check className="w-3 h-3 text-[#4C9F70]" />
            Ownership verified
          </span>
        )}
      </div>

      <div className="relative flex items-center">
        <div className="absolute left-3 text-[var(--ink-soft)] pointer-events-none">
          <Globe className="w-4 h-4" />
        </div>
        <input
          id="website-url-input"
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://your-app.com or https://staging.api.example.com"
          disabled={disabled}
          className={`w-full pl-9 pr-8 py-2 text-sm bg-[var(--paper-dark)] border rounded-[8px] font-mono text-[var(--ink)] placeholder-[var(--ink-soft)]/60 focus:bg-[var(--paper)] focus:outline-none focus:ring-1 focus:ring-[var(--signal)] focus:border-[var(--signal)] ${
            hasInput && !isUrlValid
              ? "border-[#D7263D] bg-[#FDE8EA]/30"
              : "border-[var(--line)]"
          }`}
          aria-invalid={hasInput && !isUrlValid}
          aria-describedby={hasInput && !isUrlValid ? "url-error-msg" : undefined}
        />
        {hasInput && onClear && !disabled && (
          <button
            type="button"
            onClick={onClear}
            className="absolute right-2.5 text-[var(--ink-soft)] hover:text-[var(--ink)] p-0.5 rounded-[8px]"
            aria-label="Clear URL input"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {hasInput && !isUrlValid && (
        <p
          id="url-error-msg"
          className="text-xs text-[#D7263D] mt-1 px-1 font-medium"
        >
          Please enter a valid URL starting with https:// or http://
        </p>
      )}
    </div>
  );
};
