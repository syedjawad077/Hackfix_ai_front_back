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
    score >= 80 ? "bg-[#2563EB]" : score >= 60 ? "bg-[#B45309]" : "bg-[#991B1B]";

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
    <div className="w-full bg-[#F4F7FB] border border-[#D9E2F0] rounded-2xl p-6 shadow-sm space-y-6">
      {/* Top row: Target & Badges */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#51627A]">
            Security Audit Overview
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-[#0B1F3A] break-all">
            {report.targetUrl}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {report.ownershipVerified && (
            <span className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0F2A5C] bg-[#E3ECFA] px-3 py-1 rounded-full border border-[#D9E2F0]">
              <ShieldCheck className="w-4 h-4 text-[#2563EB]" />
              Ownership verified
            </span>
          )}
          <span className="text-xs text-[#51627A] bg-white px-2.5 py-1 rounded-full border border-[#D9E2F0]">
            {report.createdAt}
          </span>
        </div>
      </div>

      {/* Main Score & Verdict */}
      <div className="bg-white border border-[#D9E2F0] rounded-2xl p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-[#51627A]">
              Overall Security Score
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-4xl font-extrabold text-[#0B1F3A] tracking-tight">
                {score}
              </span>
              <span className="text-base text-[#51627A] font-medium">/ 100</span>
            </div>
          </div>

          <div className="sm:text-right max-w-md">
            <span className="text-xs font-bold text-[#51627A] uppercase tracking-wider">
              Verdict
            </span>
            <p className="text-base sm:text-lg font-bold text-[#0B1F3A] leading-snug">
              {report.verdict}
            </p>
          </div>
        </div>

        {/* Simple Score Bar */}
        <div className="space-y-1.5">
          <div className="w-full bg-[#E3ECFA] h-3 rounded-full overflow-hidden">
            <div
              className={`h-full rounded-full ${scoreColor}`}
              style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
            />
          </div>
          <div className="flex justify-between text-[11px] text-[#51627A] font-medium px-0.5">
            <span>0 (High Risk)</span>
            <span>50 (Moderate)</span>
            <span>100 (Safe & Secure)</span>
          </div>
        </div>
      </div>

      {/* Severity Count Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {/* Critical */}
        <div className="bg-[#FEE2E2] border border-[#FECACA] rounded-xl p-3 text-center">
          <span className="text-xs font-bold text-[#991B1B] uppercase tracking-wider block">
            Critical
          </span>
          <span className="text-2xl font-extrabold text-[#991B1B] mt-0.5 block">
            {criticalCount}
          </span>
          <span className="text-[11px] text-[#991B1B]/80 font-medium">
            Fix immediately
          </span>
        </div>

        {/* High */}
        <div className="bg-[#FFEDD5] border border-[#FED7AA] rounded-xl p-3 text-center">
          <span className="text-xs font-bold text-[#C2410C] uppercase tracking-wider block">
            High
          </span>
          <span className="text-2xl font-extrabold text-[#C2410C] mt-0.5 block">
            {highCount}
          </span>
          <span className="text-[11px] text-[#C2410C]/80 font-medium">
            Needs quick fix
          </span>
        </div>

        {/* Medium */}
        <div className="bg-[#FEF3C7] border border-[#FDE68A] rounded-xl p-3 text-center">
          <span className="text-xs font-bold text-[#B45309] uppercase tracking-wider block">
            Medium
          </span>
          <span className="text-2xl font-extrabold text-[#B45309] mt-0.5 block">
            {mediumCount}
          </span>
          <span className="text-[11px] text-[#B45309]/80 font-medium">
            Recommended
          </span>
        </div>

        {/* Low */}
        <div className="bg-[#DBEAFE] border border-[#BFDBFE] rounded-xl p-3 text-center">
          <span className="text-xs font-bold text-[#1D4ED8] uppercase tracking-wider block">
            Low
          </span>
          <span className="text-2xl font-extrabold text-[#1D4ED8] mt-0.5 block">
            {lowCount}
          </span>
          <span className="text-[11px] text-[#1D4ED8]/80 font-medium">
            Best practice
          </span>
        </div>
      </div>

      {/* Notice & Action Buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2 border-t border-[#D9E2F0]">
        <div className="flex items-center gap-2 text-xs text-[#51627A]">
          <Info className="w-4 h-4 text-[#2563EB] shrink-0" />
          <span>HackFix AI only tests apps you own. Results may need review.</span>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={handleCopySummary}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-[#0B1F3A] bg-white hover:bg-[#E3ECFA] border border-[#D9E2F0] rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-[#2563EB]" />
                <span>Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-[#51627A]" />
                <span>Copy summary</span>
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleDownloadPdf}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold text-white bg-[#0F2A5C] hover:bg-[#0A1F47] rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download report (PDF)</span>
          </button>
        </div>
      </div>
    </div>
  );
}
