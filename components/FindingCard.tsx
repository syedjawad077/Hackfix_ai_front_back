"use client";

import React, { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  Code2,
  Copy,
  Check,
  FileCode,
  Globe,
  AlertTriangle,
} from "lucide-react";
import { Finding } from "@/lib/types";
import { getSeverityBadgeClasses } from "@/lib/utils";

interface FindingCardProps {
  finding: Finding;
}

export const FindingCard: React.FC<FindingCardProps> = ({ finding }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const severityStyle = getSeverityBadgeClasses(finding.severity);

  const handleCopyCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(finding.recommendedFix.afterCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="border border-[var(--line)] rounded-[8px] bg-[var(--paper)] interactive-card overflow-hidden my-3">
      {/* Header bar / accordion toggle */}
      <div
        role="button"
        tabIndex={0}
        onClick={() => setIsExpanded(!isExpanded)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setIsExpanded(!isExpanded);
          }
        }}
        className="p-4 cursor-pointer hover:bg-[var(--paper-dark)] select-none text-left focus:outline-none focus:ring-1 focus:ring-[var(--signal)]"
        aria-expanded={isExpanded}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5 min-w-0">
            <span className="mt-0.5 text-[var(--ink-soft)]">
              {isExpanded ? (
                <ChevronDown className="w-4 h-4" />
              ) : (
                <ChevronRight className="w-4 h-4" />
              )}
            </span>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1">
                {/* Severity Badge */}
                <span
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[8px] text-[11px] font-bold uppercase tracking-wider border ${severityStyle.badge}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${severityStyle.dot}`} />
                  {severityStyle.label}
                </span>

                {/* Score */}
                <span className="text-[11px] font-semibold text-[var(--ink-soft)] bg-[var(--paper-dark)] px-2 py-0.5 rounded-[8px] border border-[var(--line)]">
                  CVSS {finding.score.toFixed(1)}
                </span>
              </div>

              <h4 className="text-sm font-bold text-[var(--ink)] leading-snug">
                {finding.title}
              </h4>
            </div>
          </div>
        </div>

        {/* Endpoint / File summary row */}
        <div className="mt-2.5 flex flex-wrap items-center gap-4 text-xs text-[var(--ink-soft)]">
          <div className="flex items-center gap-1.5 font-mono">
            <Globe className="w-3.5 h-3.5 text-[var(--ink-soft)]" />
            <span className="text-[var(--ink)]">{finding.endpoint}</span>
          </div>
          {finding.file && (
            <div className="flex items-center gap-1.5 font-mono">
              <FileCode className="w-3.5 h-3.5 text-[var(--ink-soft)]" />
              <span className="text-[var(--ink-soft)]">{finding.file}</span>
            </div>
          )}
        </div>
      </div>

      {/* Expanded Details Body */}
      {isExpanded && (
        <div className="border-t border-[var(--line)] p-4 bg-[var(--paper-dark)] space-y-4 text-xs">
          {/* Plain language explanation */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--ink-soft)] block mb-1">
              Plain-Language Explanation
            </span>
            <p className="text-[var(--ink)] leading-relaxed bg-[var(--paper)] p-3 rounded-[8px] border border-[var(--line)]">
              {finding.explanation}
            </p>
          </div>

          {/* Proof / Safe validation result */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--ink-soft)] flex items-center gap-1 mb-1">
              <AlertTriangle className="w-3.5 h-3.5 text-[var(--ink)]" />
              Proof (Safe Validation Result)
            </span>
            <div className="bg-[var(--paper)] p-3 rounded-[8px] border border-[var(--line)] text-[var(--ink)] leading-relaxed">
              <p className="font-mono text-[11px] text-[var(--ink)]">{finding.proof}</p>
            </div>
          </div>

          {/* Recommended fix with before / after diff */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--ink-soft)] flex items-center gap-1">
                <Code2 className="w-3.5 h-3.5 text-[var(--ink)]" />
                Recommended Fix & Diff
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[var(--ink)] bg-[var(--paper)] hover:bg-[var(--paper-dark)] px-2.5 py-1 rounded-[8px] border border-[var(--line)]"
                aria-label="Copy secure code"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-3 h-3 text-[var(--ink)]" />
                    Copied fix
                  </>
                ) : (
                  <>
                    <Copy className="w-3 h-3" />
                    Copy fix
                  </>
                )}
              </button>
            </div>

            <p className="text-[11px] text-[var(--ink-soft)] mb-2 leading-relaxed">
              {finding.recommendedFix.explanation}
            </p>

            {/* Before / After Diff Code Block */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Before */}
              <div className="bg-[var(--paper)] rounded-[8px] border border-[#FCA5A5] overflow-hidden">
                <div className="px-3 py-1.5 bg-[#FEE2E2]/60 border-b border-[#FCA5A5]/60 flex items-center justify-between">
                  <span className="text-[10px] font-bold tracking-wider uppercase text-[#991B1B]">
                    Before (Vulnerable)
                  </span>
                </div>
                <pre className="p-3 font-mono text-[11px] text-[#991B1B] overflow-x-auto leading-relaxed bg-[var(--paper)]">
                  <code>{finding.recommendedFix.beforeCode}</code>
                </pre>
              </div>

              {/* After */}
              <div className="bg-[var(--paper)] rounded-[8px] border border-[var(--line)] overflow-hidden">
                <div className="px-3 py-1.5 bg-[var(--paper-dark)] border-b border-[var(--line)] flex items-center justify-between">
                  <span className="text-[10px] font-bold tracking-wider uppercase text-[var(--ink)]">
                    After (Recommended Fix)
                  </span>
                </div>
                <pre className="p-3 font-mono text-[11px] text-[var(--ink)] overflow-x-auto leading-relaxed bg-[var(--paper)]">
                  <code>{finding.recommendedFix.afterCode}</code>
                </pre>
              </div>
            </div>
          </div>

          {/* Footer advisory note */}
          <div className="pt-2 flex items-center justify-between border-t border-[var(--line)]">
            <span className="text-[11px] text-[var(--ink-soft)]">
              Remediation is advisory. Review and apply this recommended fix to your server configuration or application codebase.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
