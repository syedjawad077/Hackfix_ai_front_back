"use client";

import React from "react";
import { ShieldAlert, ShieldCheck } from "lucide-react";

interface RiskGaugeProps {
  score: number; // 0 - 100
  totalFindings: number;
}

export const RiskGauge: React.FC<RiskGaugeProps> = ({
  score,
  totalFindings,
}) => {
  let riskLabel = "Low Risk";
  let statusColor = "text-[#4C9F70]";
  let barColor = "bg-[#4C9F70]";

  if (score >= 70) {
    riskLabel = "High Exposure Risk";
    statusColor = "text-[#D7263D]";
    barColor = "bg-[#D7263D]";
  } else if (score >= 40) {
    riskLabel = "Moderate Risk";
    statusColor = "text-[#F2A900]";
    barColor = "bg-[#F2A900]";
  } else {
    riskLabel = "Low Risk";
    statusColor = "text-[#4C9F70]";
    barColor = "bg-[#4C9F70]";
  }

  return (
    <div className="bg-[var(--paper)] border border-[var(--line)] rounded-[8px] p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {score >= 50 ? (
            <ShieldAlert className="w-5 h-5 text-[#D7263D]" />
          ) : (
            <ShieldCheck className="w-5 h-5 text-[#4C9F70]" />
          )}
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
            Overall Security Risk Score
          </span>
        </div>
        <span className={`text-xs font-bold uppercase tracking-wider ${statusColor}`}>
          {riskLabel}
        </span>
      </div>

      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-3xl font-extrabold text-[var(--ink)] tracking-tight">
          {score}
        </span>
        <span className="text-xs text-[var(--ink-soft)] font-semibold">/ 100</span>
        <span className="text-xs text-[var(--ink-soft)] ml-auto">
          {totalFindings} issues identified
        </span>
      </div>

      {/* Static progress bar */}
      <div className="w-full bg-[var(--line)] h-2.5 rounded-[8px] overflow-hidden">
        <div
          className={`${barColor} h-full rounded-[8px]`}
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
          role="progressbar"
          aria-valuenow={score}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      <div className="flex justify-between items-center text-[10px] text-[var(--ink-soft)] font-semibold uppercase mt-1.5 px-0.5">
        <span>0 (Secure)</span>
        <span>50 (Moderate)</span>
        <span>100 (Critical)</span>
      </div>
    </div>
  );
};

