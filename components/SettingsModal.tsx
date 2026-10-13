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
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1F3A]/40"
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-dialog-title"
    >
      <div className="w-full max-w-md bg-white rounded-2xl border border-[#D9E2F0] shadow-modal p-6 text-[#0B1F3A]">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-[#D9E2F0]">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-[#E3ECFA] text-[#0F2A5C] flex items-center justify-center">
              <Settings className="w-4 h-4" />
            </div>
            <h3 id="settings-dialog-title" className="text-sm font-bold text-[#0B1F3A]">
              HackFix AI Settings
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-[#51627A] hover:text-[#0B1F3A] hover:bg-black/5"
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
              className="block font-bold text-[#0B1F3A] mb-1 flex items-center gap-1.5"
            >
              <Server className="w-3.5 h-3.5 text-[#2563EB]" />
              FastAPI Backend Endpoint URL
            </label>
            <p className="text-[11px] text-[#51627A] mb-2">
              Default is using built-in standalone Mock API layer. Provide a live FastAPI server (e.g. <code>http://localhost:8000</code>) to connect directly.
            </p>
            <input
              id="fastapi-url-input"
              type="text"
              value={apiUrl}
              onChange={(e) => setApiUrl(e.target.value)}
              placeholder="http://localhost:8000"
              className="w-full px-3 py-2 text-xs bg-[#F4F7FB] border border-[#D9E2F0] rounded-lg font-mono text-[#0B1F3A] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
            />
          </div>

          <div className="p-3 bg-[#F4F7FB] border border-[#D9E2F0] rounded-xl space-y-2">
            <span className="font-bold text-[#0B1F3A] flex items-center gap-1">
              <Shield className="w-3.5 h-3.5 text-[#0F2A5C]" />
              Security Testing Engine
            </span>
            <p className="text-[11px] text-[#51627A] leading-relaxed">
              Autonomous 4-Step Pipeline: <strong>FIND</strong> (Passive/Active Recon) &rarr; <strong>PROVE</strong> (Safe sandbox verification) &rarr; <strong>FIX</strong> (AST Diff synthesis) &rarr; <strong>VERIFY</strong> (Regression harness).
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#D9E2F0]">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold text-[#51627A] hover:text-[#0B1F3A] rounded-pill border border-[#D9E2F0] hover:bg-[#F4F7FB]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-4 py-1.5 text-xs font-bold text-white bg-[#0F2A5C] hover:bg-[#0A1F47] rounded-pill shadow-soft"
          >
            Save preferences
          </button>
        </div>
      </div>
    </div>
  );
};

