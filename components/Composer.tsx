"use client";

import React, { useRef, useEffect, useState } from "react";
import { ArrowUp, Github, X, Shield, Globe, Zap } from "lucide-react";
import { UrlInput } from "./UrlInput";
import { isValidUrl } from "@/lib/utils";

interface ComposerProps {
  url: string;
  onUrlChange: (url: string) => void;
  message: string;
  onMessageChange: (message: string) => void;
  githubRepo?: string;
  onGithubRepoChange?: (repo: string) => void;
  onStartScan?: (urlOverride?: string) => void;
  onSimulateAttack?: () => void;
  onSubmit: () => void;
  isScanning?: boolean;
  isSimulating?: boolean;
  activeScanId?: string;
  scannedUrl?: string;
  ownershipVerified?: boolean;
  onValidationError?: (err: string) => void;
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
  isScanning = false,
  isSimulating = false,
  activeScanId,
  scannedUrl,
  ownershipVerified = false,
}) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showTargetInputs, setShowTargetInputs] = useState<boolean>(!activeScanId);
  const [showGithubInput, setShowGithubInput] = useState<boolean>(Boolean(githubRepo));

  // If session changes or activeScanId becomes available, collapse target input
  useEffect(() => {
    if (activeScanId) {
      setShowTargetInputs(false);
    } else {
      setShowTargetInputs(true);
    }
  }, [activeScanId]);

  // Keep GitHub input visible if repo has value
  useEffect(() => {
    if (githubRepo) {
      setShowGithubInput(true);
    }
  }, [githubRepo]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height = `${Math.min(
        textareaRef.current.scrollHeight,
        180
      )}px`;
    }
  }, [message]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (message.trim().length > 0 && !isScanning) {
        onSubmit();
      }
    }
  };

  const hasMessage = message.trim().length > 0;
  const isUrlValid = url.trim().length > 0 && isValidUrl(url.trim());

  const handleStartScanClick = () => {
    if (isScanning) return;
    if (onStartScan) {
      onStartScan(url.trim());
    } else {
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
        <div className="mb-2 px-3 py-1.5 bg-[#F4F7FB] border border-[#D9E2F0] rounded-xl flex items-center justify-between text-xs">
          <div className="flex items-center gap-2 overflow-hidden">
            <span
              className="w-2 h-2 rounded-full bg-[#10B981] shrink-0"
              title="Session grounded in scan report"
            />
            <span className="text-[#51627A] text-[11px] font-medium">Grounded Target:</span>
            <span className="font-mono text-xs font-semibold text-[#0F2A5C] truncate max-w-[280px]">
              {scannedUrl || url}
            </span>
            {githubRepo && (
              <span className="hidden sm:inline-flex items-center gap-1 font-mono text-[10px] text-[#0F2A5C] bg-[#E3ECFA] px-2 py-0.5 rounded-pill border border-[#D9E2F0]">
                <Github className="w-3 h-3 text-[#0F2A5C]" />
                {githubRepo.replace(/^https?:\/\/github\.com\//, "")}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setShowTargetInputs(!showTargetInputs)}
            disabled={isScanning}
            className="text-[11px] text-[#2563EB] hover:text-[#1D4ED8] font-medium shrink-0 ml-2 cursor-pointer"
          >
            {showTargetInputs ? "Hide target bar" : "Scan another website"}
          </button>
        </div>
      )}

      {/* Main Composer Box */}
      <div className="bg-white border border-[#D9E2F0] rounded-2xl shadow-card overflow-hidden focus-within:ring-2 focus-within:ring-[#2563EB] focus-within:border-transparent">
        {/* Target Inputs Section (Website URL + Scan button) */}
        {(!activeScanId || showTargetInputs) && (
          <div className="p-3 border-b border-[#D9E2F0] bg-[#F4F7FB]/50 flex flex-col sm:flex-row items-stretch sm:items-end gap-2">
            <div className="flex-1">
              <UrlInput
                value={url}
                onChange={onUrlChange}
                onClear={() => onUrlChange("")}
                disabled={isScanning}
                ownershipVerified={ownershipVerified}
              />
            </div>
            <button
              type="button"
              onClick={handleStartScanClick}
              disabled={isScanning || !isUrlValid}
              className={`px-4 py-2 text-xs font-semibold rounded-lg flex items-center justify-center gap-1.5 shrink-0 ${
                isScanning || !isUrlValid
                  ? "bg-[#D9E2F0] text-[#51627A] cursor-not-allowed opacity-70"
                  : "bg-[#0F2A5C] hover:bg-[#0A1F47] text-white shadow-soft cursor-pointer"
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
          <div className="px-3 py-2 border-b border-[#D9E2F0] bg-[#F4F7FB]/30 flex items-center gap-2">
            <Github className="w-4 h-4 text-[#0F2A5C] shrink-0" />
            <input
              type="url"
              value={githubRepo}
              onChange={(e) => onGithubRepoChange?.(e.target.value)}
              placeholder="https://github.com/owner/repository (optional source code correlation)"
              disabled={isScanning}
              className="w-full text-xs font-mono bg-transparent border-0 text-[#0B1F3A] placeholder-[#51627A]/60 focus:outline-none focus:ring-0"
            />
            {githubRepo && (
              <button
                type="button"
                onClick={() => onGithubRepoChange?.("")}
                disabled={isScanning}
                className="text-[#51627A] hover:text-[#0B1F3A] p-0.5 rounded cursor-pointer"
                title="Clear repository"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
            <button
              type="button"
              onClick={() => setShowGithubInput(false)}
              className="text-[10px] text-[#51627A] hover:text-[#0B1F3A] underline shrink-0 px-1 cursor-pointer"
            >
              Hide
            </button>
          </div>
        )}

        {/* Bottom Part: Textarea & Action Buttons */}
        <div className="p-3 bg-white">
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
            className="w-full resize-none border-0 bg-transparent text-sm text-[#0B1F3A] placeholder-[#51627A]/60 focus:outline-none focus:ring-0 leading-relaxed max-h-[180px] min-h-[38px]"
          />

          <div className="flex items-center justify-between pt-2 mt-1">
            {/* Attachment toggles: Target Website & GitHub Repo */}
            <div className="flex items-center gap-1.5">
              {activeScanId && !showTargetInputs && (
                <button
                  type="button"
                  onClick={() => setShowTargetInputs(true)}
                  disabled={isScanning}
                  className="flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-pill border text-[#51627A] bg-[#F4F7FB] hover:bg-[#EAF0F8] border-[#D9E2F0] cursor-pointer"
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
                className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-pill border cursor-pointer ${
                  githubRepo || showGithubInput
                    ? "bg-[#E3ECFA] text-[#0F2A5C] border-[#2563EB]/40 font-semibold"
                    : "text-[#51627A] bg-[#F4F7FB] hover:bg-[#EAF0F8] border-[#D9E2F0]"
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
                className={`flex items-center gap-1.5 text-xs px-2.5 py-1.5 rounded-pill border ${
                  activeScanId
                    ? "bg-[#0F2A5C] text-white hover:bg-[#0A1F47] shadow-soft cursor-pointer font-semibold"
                    : "bg-[#F4F7FB] text-[#51627A]/50 border-[#D9E2F0] cursor-not-allowed opacity-60"
                }`}
                title={
                  activeScanId
                    ? "Run safe AI threat simulation for executives & judges"
                    : "Scan a website first to simulate attack paths"
                }
              >
                <Zap className="w-3.5 h-3.5 text-[#F59E0B]" />
                <span className="hidden sm:inline text-[11px]">
                  {isSimulating ? "Simulating..." : "Simulate Attack Path"}
                </span>
                <span className="sm:hidden text-[11px]">Simulate</span>
              </button>
            </div>

            {/* Circular Send Button with Up-Arrow */}
            <button
              type="button"
              disabled={isScanning || (!hasMessage && !isUrlValid)}
              onClick={handleMessageSendClick}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-white ${
                hasMessage || isUrlValid
                  ? "bg-[#0F2A5C] hover:bg-[#0A1F47] shadow-soft cursor-pointer"
                  : "bg-[#D9E2F0] text-[#51627A] cursor-not-allowed opacity-60"
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
      <p className="text-center text-[11px] text-[#51627A] mt-2 select-none">
        HackFix AI only tests apps you own. Remediation advice is strictly advisory.
      </p>
    </div>
  );
};
