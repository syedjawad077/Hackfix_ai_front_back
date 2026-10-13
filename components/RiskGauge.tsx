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
  // Score interpretation in blue tones
  let riskLabel = "Low Risk";
  let statusColor = "text-[#2563EB]";
  let barColor = "bg-[#2563EB]";

  if (score >= 70) {
    riskLabel = "High Exposure Risk";
    statusColor = "text-[#0F2A5C]";
    barColor = "bg-[#0F2A5C]";
  } else if (score >= 40) {
    riskLabel = "Moderate Risk";
    statusColor = "text-[#2563EB]";
    barColor = "bg-[#2563EB]";
  } else {
    riskLabel = "Low Risk";
    statusColor = "text-[#16A34A]";
    barColor = "bg-[#16A34A]";
  }

  return (
    <div className="bg-white border border-[#D9E2F0] rounded-xl p-4 shadow-soft">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          {score >= 50 ? (
            <ShieldAlert className="w-5 h-5 text-[#0F2A5C]" />
          ) : (
            <ShieldCheck className="w-5 h-5 text-[#2563EB]" />
          )}
          <span className="text-xs font-bold uppercase tracking-wider text-[#0B1F3A]">
            Overall Security Risk Score
          </span>
        </div>
        <span className={`text-xs font-bold uppercase tracking-wider ${statusColor}`}>
          {riskLabel}
        </span>
      </div>

      <div className="flex items-baseline gap-2 mb-2">
        <span className="text-3xl font-extrabold text-[#0B1F3A] tracking-tight">
          {score}
        </span>
        <span className="text-xs text-[#51627A] font-semibold">/ 100</span>
        <span className="text-xs text-[#51627A] ml-auto">
          {totalFindings} issues identified
        </span>
      </div>

      {/* Static bar in blue tones */}
      <div className="w-full bg-[#E3ECFA] h-2.5 rounded-full overflow-hidden">
        <div
          className={`${barColor} h-full rounded-full`}
          style={{ width: `${Math.min(100, Math.max(0, score))}%` }}
          role="progressbar"
          aria-valuenow={score}
          aria-valuemin={0}
          aria-valuemax={100}
        />
      </div>

      <div className="flex justify-between items-center text-[10px] text-[#51627A] font-semibold uppercase mt-1.5 px-0.5">
        <span>0 (Secure)</span>
        <span>50 (Moderate)</span>
        <span>100 (Critical)</span>
      </div>
    </div>
  );
};

