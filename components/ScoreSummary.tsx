"use client";

import React, { useState } from "react";
import {
  ShieldCheck,
  Download,
  Copy,
  Check,
  AlertTriangle,
  Info,
} from "lucide-react";
import { Finding, ScanReport } from "@/lib/types";

interface ScoreSummaryProps {
  report: ScanReport;
  onToast: (msg: string, type?: "success" | "info" | "error") => void;
}

export function ScoreSummary({ report, onToast }: ScoreSummaryProps) {
  const [copied, setCopied] = useState(false);

  const findings = report.findings;
  const criticalCount = findings.filter((f) => f.severity === "critical").length;
  const highCount = findings.filter((f) => f.severity === "high").length;
  const mediumCount = findings.filter((f) => f.severity === "medium").length;
  const lowCount = findings.filter((f) => f.severity === "low").length;

  const score = report.riskScore; // 0 - 100
  // Color the score bar based on level
  const scoreColor =
    score >= 80 ? "bg-[#4C9F70]" : score >= 60 ? "bg-[#F2A900]" : "bg-[#D7263D]";

  const handleCopySummary = () => {
    const text = [
      `HackFix AI Security Report for ${report.targetUrl}`,
      `Security Score: ${score}/100`,
      `Verdict: ${report.verdict}`,
      `Issues Found: ${criticalCount} Critical, ${highCount} High, ${mediumCount} Medium, ${lowCount} Low`,
      `Ownership: Verified`,
      `Tested at: ${report.createdAt}`,
    ].join("\n");

    navigator.clipboard.writeText(text);
    setCopied(true);
    onToast("Security summary copied to clipboard", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadPdf = () => {
    window.print();
    onToast("Opening print dialog to save as PDF", "info");
  };

  return (
    <div className="w-full bg-[var(--paper-dark)] border border-[var(--line)] rounded-[8px] p-6 space-y-6">
      {/* Top row: Target & Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--ink-soft)]">
            Security Audit Overview
          </span>
          <h2 className="text-lg sm:text-xl font-bold font-mono text-[var(--ink)] break-all">
            {report.targetUrl}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {report.ownershipVerified && (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[var(--ink)] bg-[var(--paper)] px-3 py-1 rounded-[8px] border border-[var(--line)]">
              <ShieldCheck className="w-4 h-4 text-[#4C9F70]" />
              Ownership verified
            </span>
          )}
          <span className="text-xs text-[var(--ink-soft)] bg-[var(--paper)] px-2.5 py-1 rounded-[8px] border border-[var(--line)]">
            {report.createdAt}
          </span>
        </div>
      </div>

      {/* Main Score & Verdict */}
      <div className="bg-[var(--paper)] border border-[var(--line)] rounded-[8px] p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-[var(--ink-soft)]">
              Overall Security Score
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-[var(--ink)] tracking-tight">
                {score}
              </span>
              <span className="text-base text-[var(--ink-soft)] font-medium">/ 100</span>
            </div>
          </div>

          <div className="sm:text-right max-w-md">
            <span className="text-xs font-bold text-[var(--ink-soft)] uppercase tracking-wider">
              Verdict
            </span>
            <p className="text-base sm:text-lg font-bold text-[var(--ink)] leading-snug">
              {report.verdict}
            </p>
          </div>
        </div>

        {/* Simple Score Bar */}
        <div className="space-y-1.5">
          <div className="w-full bg-[var(--line)] h-3 rounded-[8px] overflow-hidden">
            <div
              className={`h-full rounded-[8px] ${scoreColor}`}
              style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-[var(--ink-soft)] font-medium px-0.5">
            <span>0 (High Risk)</span>
            <span>50 (Moderate)</span>
            <span>100 (Safe & Secure)</span>
          </div>
        </div>
      </div>

      {/* Severity Count Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Critical */}
        <div className="bg-[#FDE8EA] border border-[#F8B4BB] rounded-[8px] p-3 text-center">
          <span className="text-xs font-bold text-[#D7263D] uppercase tracking-wider block">
            Critical
          </span>
          <span className="text-2xl font-extrabold text-[#D7263D] mt-0.5 block">
            {criticalCount}
          </span>
          <span className="text-[11px] text-[#D7263D]/80 font-medium">
            Fix immediately
          </span>
        </div>

        {/* High */}
        <div className="bg-[#FDF0E9] border border-[#F9C3A8] rounded-[8px] p-3 text-center">
          <span className="text-xs font-bold text-[#E8591A] uppercase tracking-wider block">
            High
          </span>
          <span className="text-2xl font-extrabold text-[#E8591A] mt-0.5 block">
            {highCount}
          </span>
          <span className="text-[11px] text-[#E8591A]/80 font-medium">
            Needs quick fix
          </span>
        </div>

        {/* Medium */}
        <div className="bg-[#FEF8E7] border border-[#FBE39F] rounded-[8px] p-3 text-center">
          <span className="text-xs font-bold text-[#B88100] uppercase tracking-wider block">
            Medium
          </span>
          <span className="text-2xl font-extrabold text-[#B88100] mt-0.5 block">
            {mediumCount}
          </span>
          <span className="text-[11px] text-[#B88100]/80 font-medium">
            Recommended
          </span>
        </div>

        {/* Low */}
        <div className="bg-[#EDF7F1] border border-[#BDE3CC] rounded-[8px] p-3 text-center">
          <span className="text-xs font-bold text-[#2F6D4B] uppercase tracking-wider block">
            Low
          </span>
          <span className="text-2xl font-extrabold text-[#2F6D4B] mt-0.5 block">
            {lowCount}
          </span>
          <span className="text-[11px] text-[#2F6D4B]/80 font-medium">
            Best practice
          </span>
        </div>
      </div>

      {/* Notice & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-[var(--line)]">
        <div className="flex items-center gap-2 text-xs text-[var(--ink-soft)]">
          <Info className="w-4 h-4 text-[var(--ink-soft)] shrink-0" />
          <span>HackFix AI only tests apps you own. Results may need review.</span>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleCopySummary}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[var(--ink)] bg-[var(--paper)] hover:bg-[var(--paper-dark)] border border-[var(--line)] rounded-[8px] focus:outline-none focus:ring-1 focus:ring-[var(--signal)]"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[var(--ink)]" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[var(--ink-soft)]" />
                <span>Copy summary</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownloadPdf}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[var(--paper)] bg-[var(--ink)] hover:bg-[#333333] rounded-[8px] focus:outline-none focus:ring-1 focus:ring-[var(--signal)]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download report (PDF)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
