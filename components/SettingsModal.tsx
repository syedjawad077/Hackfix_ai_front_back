"use client";

import React, { useState } from "react";
import { Settings, X, Server, Shield, Bell } from "lucide-react";

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  fastApiUrl: string;
  onSaveFastApiUrl: (url: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  fastApiUrl,
  onSaveFastApiUrl,
}) => {
  const [apiUrl, setApiUrl] = useState(fastApiUrl);

  if (!isOpen) return null;

  const handleSave = () => {
    onSaveFastApiUrl(apiUrl);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--ink)]/50 backdrop-blur-xs"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-dialog-title"
    >
      <div className="w-full max-w-md bg-[var(--paper)] rounded-[8px] border border-[var(--line)] p-6 text-[var(--ink)]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[var(--line)]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-[8px] bg-[var(--paper-dark)] text-[var(--ink)] flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
            <h3 id="settings-dialog-title" className="text-sm font-bold text-[var(--ink)]">
              HackFix AI Settings
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-[8px] text-[var(--ink-soft)] hover:text-[var(--ink)] hover:bg-black/5"
            aria-label="Close settings"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <div className="py-4 space-y-4 text-xs">
          <div>
            <label
              htmlFor="fastapi-url-input"
              className="block font-bold text-[var(--ink)] mb-1 flex items-center gap-1.5"
            >
              <Server className="w-3.5 h-3.5 text-[var(--ink-soft)]" />
              FastAPI Backend Endpoint URL
            </label>
            <p className="text-[11px] text-[var(--ink-soft)] mb-2">
              Default is using built-in standalone Mock API layer. Provide a live FastAPI server (e.g. <code>http://localhost:8000</code>) to connect directly.
            </p>
            <input
              id="fastapi-url-input"
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="http://localhost:8000"
              className="w-full px-3 py-2 text-xs bg-[var(--paper-dark)] border border-[var(--line)] rounded-[8px] font-mono text-[var(--ink)] focus:bg-[var(--paper)] focus:outline-none focus:ring-1 focus:ring-[var(--signal)]"
            />
          </div>

          <div className="p-3 bg-[var(--paper-dark)] border border-[var(--line)] rounded-[8px] space-y-2">
            <span className="font-bold text-[var(--ink)] flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-[var(--ink)]" />
              Security Testing Engine
            </span>
            <p className="text-[11px] text-[var(--ink-soft)] leading-relaxed">
              Autonomous 4-Step Pipeline: <strong>FIND</strong> (Passive/Active Recon) &rarr; <strong>PROVE</strong> (Safe sandbox verification) &rarr; <strong>FIX</strong> (AST Diff synthesis) &rarr; <strong>VERIFY</strong> (Regression harness).
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[var(--line)]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-[var(--ink-soft)] hover:text-[var(--ink)] rounded-[8px] border border-[var(--line)] hover:bg-[var(--paper-dark)]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-1.5 text-xs font-bold text-[var(--paper)] bg-[var(--ink)] hover:bg-[#333333] rounded-[8px]"
          >
            Save preferences
          </button>
        </div>
      </div>
    </div>
  );
};

