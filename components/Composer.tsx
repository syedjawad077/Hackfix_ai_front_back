"use client";

import React, { useRef, useEffect, useState } from "react";
import { ArrowUp, Globe, Github, Shield, X, Zap } from "lucide-react";
import { UrlInput } from "./UrlInput";
import { isValidUrl } from "@/lib/utils";

interface ComposerProps {
  url: string;
  onUrlChange: (url: string) => void;
  message: string;
  onMessageChange: (message: string) => void;
  githubRepo?: string;
  onGithubRepoChange?: (repo: string) => void;
  onStartScan: (urlOverride?: string) => void;
  onSimulateAttack?: () => void;
  onSubmit: () => void;
  isScanning: boolean;
  isSimulating?: boolean;
  activeScanId?: string;
  scannedUrl?: string;
  ownershipVerified?: boolean;
  onValidationError?: (msg: string) => void;
}

export const Composer: React.FC<ComposerProps> = ({
  url,
  onUrlChange,
  message,
  onMessageChange,
  githubRepo = "",
  onGithubRepoChange,
  onStartScan,
  onSimulateAttack,
  onSubmit,
  isScanning,
  isSimulating = false,
  activeScanId,
  scannedUrl,
  ownershipVerified = false,
  onValidationError,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showTargetInputs, setShowTargetInputs] = useState(false);
  const [showGithubInput, setShowGithubInput] = useState(false);

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        180
      )}px`;
    }
  }, [message]);

  const hasMessage = message.trim().length > 0;
  const isUrlValid = url.trim().length > 0 && isValidUrl(url.trim());

  const handleStartScanClick = () => {
    if (!url.trim()) {
      onValidationError?.("Please enter a website link to scan");
      return;
    }
    if (!isUrlValid) {
      onValidationError?.("Please enter a valid website URL starting with https:// or http://");
      return;
    }
    onStartScan(url.trim());
    setShowTargetInputs(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (isScanning) return;
      onSubmit();
    }
  };

  const handleMessageSendClick = () => {
    if (isScanning) return;
    if (hasMessage) {
      onSubmit();
    } else if (isUrlValid) {
      handleStartScanClick();
    }
  };

  return (
    <div className="w-full max-w-[768px] mx-auto px-4 pb-4 pt-1">
      {/* Grounded Target Status Bar (shown when a scan exists) */}
      {activeScanId && (
        <div className="mb-2 px-3 py-1.5 bg-[var(--paper-dark)] border border-[var(--line)] rounded-[8px] flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 overflow-hidden">
            <span
              className="w-2 h-2 rounded-full bg-[#4C9F70] shrink-0"
              title="Session grounded in scan report"
            />
            <span className="text-[var(--ink-soft)] text-[11px] font-medium">Grounded Target:</span>
            <span className="font-mono text-xs font-semibold text-[var(--ink)] truncate max-w-[280px]">
              {scannedUrl || url}
            </span>
            {githubRepo && (
              <span className="hidden sm:inline-flex items-center gap-1 font-mono text-[10px] text-[var(--ink)] bg-[var(--paper)] px-2 py-0.5 rounded-[8px] border border-[var(--line)]">
                <Github className="w-3 h-3 text-[var(--ink)]" />
                {githubRepo.replace(/^https?:\/\/github\.com\//, "")}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setShowTargetInputs(!showTargetInputs)}
            disabled={isScanning}
            className="text-[11px] text-[var(--signal)] hover:text-[var(--signal-dark)] font-medium shrink-0 ml-2 cursor-pointer"
          >
            {showTargetInputs ? "Hide target bar" : "Scan another website"}
          </button>
        </div>
      )}

      {/* Main Composer Box */}
      <div className="bg-[var(--paper)] border border-[var(--line)] rounded-[8px] shadow-none overflow-hidden focus-within:ring-2 focus-within:ring-[var(--signal)] focus-within:border-transparent">
        {/* Target Inputs Section (Website URL + Scan button) */}
        {(!activeScanId || showTargetInputs) && (
          <div className="p-3 border-b border-[var(--line)] bg-[var(--paper-dark)]/50 flex flex-col sm:flex-row items-stretch sm:items-end gap-2">
            <div className="flex-1">
              <UrlInput
                value={url}
                onChange={onUrlChange}
                onClear={() => onUrlChange("")}
                disabled={isScanning}
                ownershipVerified={ownershipVerified}
              />
            </div>
            {/* Start scan button in signal orange */}
            <button
              type="button"
              onClick={handleStartScanClick}
              disabled={isScanning || !isUrlValid}
              className={`px-4 py-2 text-xs font-semibold rounded-[8px] flex items-center justify-center gap-1.5 shrink-0 ${
                isScanning || !isUrlValid
                  ? "bg-[var(--line)] text-[var(--ink-soft)] cursor-not-allowed opacity-60"
                  : "bg-[var(--signal)] hover:bg-[var(--signal-dark)] text-white shadow-none cursor-pointer"
              }`}
              title="Conduct security scan on this website"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>{isScanning ? "Scanning..." : "Start scan"}</span>
            </button>
          </div>
        )}

        {/* Optional GitHub Repository Field */}
        {showGithubInput && (
          <div className="px-3 py-2 border-b border-[var(--line)] bg-[var(--paper-dark)]/40 flex items-center gap-2">
            <Github className="w-4 h-4 text-[var(--ink)] shrink-0" />
            <input
              type="url"
              value={githubRepo}
              onChange={(e) => onGithubRepoChange?.(e.target.value)}
              placeholder="https://github.com/owner/repository (optional source code correlation)"
              disabled={isScanning}
              className="w-full text-xs font-mono bg-transparent border-0 text-[var(--ink)] placeholder-[var(--ink-soft)]/60 focus:outline-none focus:ring-0"
            />
            {githubRepo && (
              <button
                type="button"
                onClick={() => onGithubRepoChange?.("")}
                disabled={isScanning}
                className="text-[var(--ink-soft)] hover:text-[var(--ink)] p-0.5 rounded-[8px] cursor-pointer"
                title="Clear repository"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowGithubInput(false)}
              className="text-[11px] text-[var(--ink-soft)] hover:text-[var(--ink)] font-medium shrink-0 ml-1 cursor-pointer"
            >
              Done
            </button>
          </div>
        )}

        {/* Message Input & Action Bar */}
        <div className="p-3 bg-[var(--paper)]">
          <textarea
            ref={textareaRef}
            rows={1}
            value={message}
            onChange={(e) => onMessageChange(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isScanning}
            placeholder={
              activeScanId
                ? "Ask HackFix AI about threats, fixes, OWASP, or your code..."
                : "Ask HackFix AI any security question, or enter a website above to scan..."
            }
            className="w-full resize-none border-0 bg-transparent text-sm text-[var(--ink)] placeholder-[var(--ink-soft)]/60 focus:outline-none focus:ring-0 leading-relaxed max-h-[180px] min-h-[38px] font-sans"
          />

          <div className="flex items-center justify-between pt-2 mt-1">
            {/* Attachment toggles: Target Website & GitHub Repo */}
            <div className="flex items-center gap-1.5">
              {activeScanId && !showTargetInputs && (
                <button
                  type="button"
                  onClick={() => setShowTargetInputs(true)}
                  disabled={isScanning}
                  className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-[8px] border text-[var(--ink-soft)] bg-[var(--paper-dark)] hover:bg-[#E2DCD1] border-[var(--line)] cursor-pointer"
                  title="Scan another target website"
                >
                  <Globe className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline text-[11px]">Scan URL</span>
                </button>
              )}

              <button
                type="button"
                onClick={() => setShowGithubInput(!showGithubInput)}
                disabled={isScanning}
                className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-[8px] border cursor-pointer ${
                  githubRepo || showGithubInput
                    ? "bg-[var(--paper-dark)] text-[var(--ink)] border-[var(--ink)] font-semibold"
                    : "text-[var(--ink-soft)] bg-[var(--paper-dark)] hover:bg-[#E2DCD1] border-[var(--line)]"
                }`}
                aria-label="Link GitHub repository"
                title="Link GitHub repository for source code threat analysis"
              >
                <Github className="w-3.5 h-3.5" />
                <span className="hidden sm:inline text-[11px]">
                  {githubRepo ? "GitHub linked" : "Link GitHub repo"}
                </span>
              </button>

              {/* Simulate Attack Path Button (activates after scanning) */}
              <button
                type="button"
                onClick={onSimulateAttack}
                disabled={!activeScanId || isScanning || isSimulating}
                className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-[8px] border ${
                  activeScanId
                    ? "bg-[var(--ink)] text-[var(--paper)] hover:bg-[#2A2A2A] shadow-none cursor-pointer font-semibold border-[var(--ink)]"
                    : "bg-[var(--paper-dark)] text-[var(--ink-soft)]/50 border-[var(--line)] cursor-not-allowed opacity-60"
                }`}
                title={
                  activeScanId
                    ? "Run safe AI threat simulation for executives & judges"
                    : "Scan a website first to simulate attack paths"
                }
              >
                <Zap className="w-3.5 h-3.5 text-[#F2A900]" />
                <span className="hidden sm:inline text-[11px]">
                  {isSimulating ? "Simulating..." : "Simulate Attack Path"}
                </span>
                <span className="sm:hidden text-[11px]">Simulate</span>
              </button>
            </div>

            {/* Circular/Square Send Button with Up-Arrow */}
            <button
              type="button"
              disabled={isScanning || (!hasMessage && !isUrlValid)}
              onClick={handleMessageSendClick}
              className={`w-8 h-8 rounded-[8px] flex items-center justify-center text-white ${
                hasMessage || isUrlValid
                  ? "bg-[var(--ink)] hover:bg-[#2A2A2A] shadow-none cursor-pointer"
                  : "bg-[var(--line)] text-[var(--ink-soft)] cursor-not-allowed opacity-60"
              }`}
              aria-label={
                isScanning
                  ? "Scanning..."
                  : hasMessage
                  ? "Send message"
                  : "Start scan"
              }
              title={
                isScanning
                  ? "Scanning..."
                  : hasMessage
                  ? "Send message to AI assistant (Enter)"
                  : "Start website scan"
              }
            >
              <ArrowUp className="w-4 h-4 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Footnote */}
      <p className="text-center text-[11px] text-[var(--ink-soft)] mt-2 select-none font-sans">
        HackFix AI only tests apps you own. Remediation advice is strictly advisory.
      </p>
    </div>
  );
};
