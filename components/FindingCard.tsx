"use client";

import React, { useState } from "react";
import {
  ChevronDown,
  ChevronRight,
  ShieldCheck,
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
  onRetest?: (findingId: string) => void;
  isRetesting?: boolean;
}

export const FindingCard: React.FC<FindingCardProps> = ({
  finding,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  const severityStyle = getSeverityBadgeClasses(finding.severity);
  const isFixed = finding.status === "verified_fixed";

  const handleCopyCode = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText(finding.recommendedFix.afterCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div
      className={`border rounded-xl bg-white shadow-soft overflow-hidden my-3 ${
        isFixed
          ? "border-[#D9E2F0] bg-white"
          : "border-[#D9E2F0]"
      }`}
    >
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
        className="p-4 cursor-pointer hover:bg-[#F4F7FB] select-none text-left focus:outline-none focus:ring-1 focus:ring-[#2563EB]"
        aria-expanded={isExpanded}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5 min-w-0">
            <span className="mt-0.5 text-[#51627A]">
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
                  className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider border ${severityStyle.badge}`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${severityStyle.dot}`} />
                  {severityStyle.label}
                </span>

                {/* Score */}
                <span className="text-[11px] font-semibold text-[#51627A] bg-[#F4F7FB] px-2 py-0.5 rounded border border-[#D9E2F0]">
                  CVSS {finding.score.toFixed(1)}
                </span>

                {/* Status indicator */}
                {isFixed && (
                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#0F2A5C] bg-[#E3ECFA] px-2 py-0.5 rounded border border-[#D9E2F0]">
                    <ShieldCheck className="w-3.5 h-3.5 text-[#2563EB]" />
                    Verified fixed
                  </span>
                )}
              </div>

              <h4 className="text-sm font-bold text-[#0B1F3A] leading-snug">
                {finding.title}
              </h4>
            </div>
          </div>

          {/* Status badge if verified */}
          {isFixed && (
            <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
              <span className="text-xs font-semibold text-[#2563EB] flex items-center gap-1">
                <Check className="w-4 h-4" />
                Verified
              </span>
            </div>
          )}
        </div>

        {/* Endpoint / File summary row */}
        <div className="mt-2.5 flex flex-wrap items-center gap-4 text-xs text-[#51627A]">
          <div className="flex items-center gap-1.5 font-mono">
            <Globe className="w-3.5 h-3.5 text-[#2563EB]" />
            <span className="text-[#0B1F3A]">{finding.endpoint}</span>
          </div>
          {finding.file && (
            <div className="flex items-center gap-1.5 font-mono">
              <FileCode className="w-3.5 h-3.5 text-[#51627A]" />
              <span className="text-[#51627A]">{finding.file}</span>
            </div>
          )}
        </div>
      </div>

      {/* Expanded Details Body */}
      {isExpanded && (
        <div className="border-t border-[#D9E2F0] p-4 bg-[#F4F7FB]/50 space-y-4 text-xs">
          {/* Plain language explanation */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#51627A] block mb-1">
              Plain-Language Explanation
            </span>
            <p className="text-[#0B1F3A] leading-relaxed bg-white p-3 rounded-lg border border-[#D9E2F0]">
              {finding.explanation}
            </p>
          </div>

          {/* Proof / Safe validation result */}
          <div>
            <span className="text-[11px] font-bold uppercase tracking-wider text-[#51627A] flex items-center gap-1 mb-1">
              <AlertTriangle className="w-3.5 h-3.5 text-[#0F2A5C]" />
              Proof (Safe Validation Result)
            </span>
            <div className="bg-[#E3ECFA]/60 p-3 rounded-lg border border-[#D9E2F0] text-[#0B1F3A] leading-relaxed">
              <p className="font-mono text-[11px] text-[#0B1F3A]">{finding.proof}</p>
            </div>
          </div>

          {/* Recommended fix with before / after diff */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#51627A] flex items-center gap-1">
                <Code2 className="w-3.5 h-3.5 text-[#2563EB]" />
                Recommended Fix & Diff
              </span>
              <button
                type="button"
                onClick={handleCopyCode}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#0F2A5C] bg-white hover:bg-[#F4F7FB] px-2.5 py-1 rounded border border-[#D9E2F0]"
                aria-label="Copy secure code"
              >
                {copiedCode ? (
                  <>
                    <Check className="w-3 h-3 text-[#2563EB]" />
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

            <p className="text-[11px] text-[#51627A] mb-2 leading-relaxed">
              {finding.recommendedFix.explanation}
            </p>

            {/* Before / After Diff Code Block */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {/* Before */}
              <div className="bg-white rounded-lg border border-[#D9E2F0] overflow-hidden">
                <div className="px-3 py-1.5 bg-[#FEE2E2]/60 border-b border-[#FCA5A5]/60 flex items-center justify-between">
                  <span className="text-[10px] font-bold tracking-wider uppercase text-[#991B1B]">
                    Before (Vulnerable)
                  </span>
                </div>
                <pre className="p-3 font-mono text-[11px] text-[#0B1F3A] overflow-x-auto leading-relaxed bg-[#FFFFFF]">
                  <code>{finding.recommendedFix.beforeCode}</code>
                </pre>
              </div>

              {/* After */}
              <div className="bg-white rounded-lg border border-[#D9E2F0] overflow-hidden">
                <div className="px-3 py-1.5 bg-[#E3ECFA] border-b border-[#D9E2F0] flex items-center justify-between">
                  <span className="text-[10px] font-bold tracking-wider uppercase text-[#0F2A5C]">
                    After (Secured & Verified)
                  </span>
                </div>
                <pre className="p-3 font-mono text-[11px] text-[#0B1F3A] overflow-x-auto leading-relaxed bg-[#FFFFFF]">
                  <code>{finding.recommendedFix.afterCode}</code>
                </pre>
              </div>
            </div>
          </div>

          {/* Footer advisory note */}
          <div className="pt-2 flex items-center justify-between border-t border-[#D9E2F0]">
            <span className="text-[11px] text-[#51627A]">
              Remediation is advisory. Review and apply this patch to your server configuration or application codebase.
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

