"use client";

import React, { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  ShieldAlert,
  Copy,
  Check,
  HelpCircle,
  MessageSquare,
  Crosshair,
} from "lucide-react";
import { Finding } from "@/lib/types";
import { getSeverityBadgeClasses } from "@/lib/utils";

interface ProblemCardProps {
  finding: Finding;
  onAskAi: (question: string) => void;
  onToast: (msg: string, type?: "success" | "info" | "error") => void;
  defaultExpanded?: boolean;
}

export function ProblemCard({
  finding,
  onAskAi,
  onToast,
  defaultExpanded = false,
}: ProblemCardProps) {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [copied, setCopied] = useState(false);
  const [showTermHelp, setShowTermHelp] = useState(false);

  const severityBadge = getSeverityBadgeClasses(finding.severity);

  const handleCopyFix = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(finding.recommendedFix.afterCode);
    setCopied(true);
    onToast("Fixed code copied to clipboard", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAskAboutFinding = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAskAi(`Explain the "${finding.title}" issue in simple terms and show me how to fix it.`);
  };

  return (
    <div className="bg-[var(--paper)] border border-[var(--line)] rounded-[8px] interactive-card overflow-hidden">
      {/* Header / Collapsed Summary Bar */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsExpanded((prev) => !prev)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsExpanded((prev) => !prev);
          }
        }}
        className="p-5 flex items-start sm:items-center justify-between gap-4 cursor-pointer hover:bg-[var(--paper-dark)] focus:outline-none focus:bg-[var(--paper-dark)] select-none"
        aria-expanded={isExpanded}
      >
        <div className="flex-1 min-w-0 space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            {/* Severity Badge */}
            <span
              className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[8px] text-xs font-bold border ${severityBadge.badge}`}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${severityBadge.dot}`} />
              {severityBadge.label} (Score {finding.score})
            </span>

            {/* Technical name badge or help popover */}
            {finding.termHelp && (
              <div className="relative inline-block">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowTermHelp((prev) => !prev);
                  }}
                  className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--ink-soft)] hover:text-[var(--ink)] bg-[var(--paper-dark)] border border-[var(--line)] px-2 py-0.5 rounded-[8px]"
                  aria-label={`What is ${finding.termHelp.term}?`}
                >
                  <span>{finding.termHelp.term}</span>
                  <HelpCircle className="w-3 h-3 text-[var(--ink)]" />
                </button>

                {/* Plain on-click help popover (NO animations) */}
                {showTermHelp && (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="absolute left-0 top-full mt-1.5 w-64 bg-[var(--ink)] text-[var(--paper)] text-xs p-3 rounded-[8px] border border-[var(--line)] z-30"
                  >
                    <p className="font-bold text-[var(--paper)] mb-1">
                      {finding.termHelp.term} explained:
                    </p>
                    <p className="text-[var(--paper-dark)] leading-normal">
                      {finding.termHelp.explanation}
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowTermHelp(false)}
                      className="mt-2 text-[10px] text-[var(--ink-soft)] hover:text-[var(--paper)] underline block text-right"
                    >
                      Close
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Plain Human Title */}
          <h3 className="text-base sm:text-lg font-bold text-[var(--ink)] leading-snug">
            {finding.title}
          </h3>

          {/* Collapsed short description preview */}
          {!isExpanded && (
            <p className="text-xs sm:text-sm text-[var(--ink-soft)] line-clamp-1">
              {finding.explanation}
            </p>
          )}
        </div>

        {/* Right Arrow / Expand Toggle */}
        <div className="flex items-center gap-2 shrink-0 pt-1 sm:pt-0">
          <span className="text-xs font-semibold text-[var(--ink-soft)] hidden md:inline">
            {isExpanded ? "Hide details" : "View fix"}
          </span>
          {isExpanded ? (
            <ChevronDown className="w-5 h-5 text-[var(--ink-soft)]" />
          ) : (
            <ChevronRight className="w-5 h-5 text-[var(--ink-soft)]" />
          )}
        </div>
      </div>

      {/* Expanded Content Section */}
      {isExpanded && (
        <div className="px-5 pb-6 pt-2 border-t border-[var(--line)] space-y-5 bg-[var(--paper)]">
          {/* Section 1: What this means */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--ink)] flex items-center gap-1.5">
              <span>What this means</span>
            </h4>
            <div className="bg-[var(--paper-dark)] border border-[var(--line)] rounded-[8px] p-3.5 text-xs sm:text-sm text-[var(--ink)] leading-relaxed">
              {finding.explanation}
            </div>
          </div>

          {/* Section 2: How we proved it */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--ink)] flex items-center gap-1.5">
              <span>How we proved it</span>
            </h4>
            <div className="bg-[var(--paper-dark)] border border-[var(--line)] rounded-[8px] p-3.5 text-xs sm:text-sm text-[var(--ink-soft)] leading-relaxed flex items-start gap-2.5">
              <span className="inline-block w-2 h-2 rounded-full bg-[var(--ink)] mt-1.5 shrink-0" />
              <span>{finding.proof}</span>
            </div>
          </div>

          {/* Section 3: How to fix it */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
                How to fix it
              </h4>
              <button
                type="button"
                onClick={handleCopyFix}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-bold text-[var(--ink)] bg-[var(--paper-dark)] border border-[var(--line)] hover:bg-[var(--paper)] rounded-[8px] focus:outline-none focus:ring-1 focus:ring-[var(--signal)]"
              >
                {copied ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-[var(--ink)]" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5 text-[var(--ink-soft)]" />
                    <span>Copy fix</span>
                  </>
                )}
              </button>
            </div>

            {/* Fix Steps list */}
            {finding.fixSteps && finding.fixSteps.length > 0 && (
              <div className="bg-[var(--paper-dark)] border border-[var(--line)] rounded-[8px] p-3.5 space-y-2">
                <p className="text-xs font-bold text-[var(--ink)]">Follow these steps:</p>
                <ol className="list-decimal list-inside space-y-1 text-xs text-[var(--ink-soft)]">
                  {finding.fixSteps.map((step, idx) => (
                    <li key={idx} className="leading-relaxed">
                      {step}
                    </li>
                  ))}
                </ol>
              </div>
            )}

            {/* Before / After Code Diff */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-[var(--ink-soft)] px-1">
                <span>File: {finding.recommendedFix.fileName}</span>
                <span>{finding.recommendedFix.explanation}</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Before: Vulnerable Code */}
                <div className="border border-[#FCA5A5] rounded-[8px] overflow-hidden bg-[#FEF2F2]">
                  <div className="bg-[#FEE2E2] px-3 py-1.5 border-b border-[#FCA5A5] flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[#991B1B]">
                      Current Code (Vulnerable)
                    </span>
                  </div>
                  <pre className="p-3 text-[11px] font-mono text-[#991B1B] overflow-x-auto whitespace-pre leading-relaxed bg-[#FEF2F2]">
                    {finding.recommendedFix.beforeCode}
                  </pre>
                </div>

                {/* After: Fixed Code */}
                <div className="border border-[var(--line)] rounded-[8px] overflow-hidden bg-[var(--paper)]">
                  <div className="bg-[var(--paper-dark)] px-3 py-1.5 border-b border-[var(--line)] flex items-center justify-between">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--ink)]">
                      Fixed Code (Secure)
                    </span>
                  </div>
                  <pre className="p-3 text-[11px] font-mono text-[var(--ink)] overflow-x-auto whitespace-pre leading-relaxed bg-[var(--paper)]">
                    {finding.recommendedFix.afterCode}
                  </pre>
                </div>
              </div>
            </div>
          </div>

          {/* Footer action: Ask AI about this */}
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={handleAskAboutFinding}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-[var(--ink)] bg-[var(--paper-dark)] hover:bg-[var(--paper)] border border-[var(--line)] rounded-[8px] focus:outline-none focus:ring-1 focus:ring-[var(--signal)]"
            >
              <Crosshair className="w-3.5 h-3.5 text-[var(--ink)]" />
              <span>Ask HackFix AI to walk me through this</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
