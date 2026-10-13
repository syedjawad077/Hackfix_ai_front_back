"use client";

import React, { useState } from "react";
import { X, ShieldAlert, ShieldCheck, AlertTriangle, Copy, Check, ArrowRight, Building, Award } from "lucide-react";
import { AttackSimulation } from "@/lib/types";

interface AttackSimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  simulation: AttackSimulation | null;
  onToast: (msg: string, type?: "info" | "success" | "warning" | "error") => void;
}

export const AttackSimulationModal: React.FC<AttackSimulationModalProps> = ({
  isOpen,
  onClose,
  simulation,
  onToast,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen || !simulation) return null;

  const handleCopyBrief = () => {
    const brief = [
      `=== EXECUTIVE BREACH & THREAT SIMULATION ===`,
      `Target: ${simulation.targetUrl}`,
      `Risk Level: ${simulation.riskLevel}`,
      `Executive Summary: ${simulation.executiveSummary}`,
      ``,
      `--- ATTACK PATH KILL CHAIN ---`,
      ...simulation.stages.map(
        (s) =>
          `[${s.phase}] ${s.title}\n- Asset: ${s.affectedAsset}\n- Business Impact: ${s.businessImpact}\n- Defense: ${s.mitigation}\n`
      ),
      `--- BOARDROOM TAKEAWAY ---`,
      simulation.boardroomTakeaway,
    ].join("\n");

    navigator.clipboard.writeText(brief);
    setCopied(true);
    onToast("Executive simulation brief copied to clipboard", "success");
    setTimeout(() => setCopied(false), 2000);
  };

  const isCriticalOrHigh = simulation.riskLevel === "Critical" || simulation.riskLevel === "High";
  const isSafeOrLow = simulation.riskLevel === "Low" || simulation.riskLevel === "None";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0B1F3A]/60 backdrop-blur-xs">
      <div className="bg-white border border-[#D9E2F0] rounded-2xl shadow-card w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[#D9E2F0] bg-[#0F2A5C] text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-[#1E3A66] flex items-center justify-center text-white">
              <ShieldAlert className="w-5 h-5 text-[#93C5FD]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">
                  Executive Breach & Threat Simulation
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/10 text-white border border-white/20">
                  Judges & C-Suite View
                </span>
              </div>
              <p className="text-xs text-[#D9E2F0] font-mono mt-0.5">
                Target: {simulation.targetUrl}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyBrief}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-white/10 hover:bg-white/20 text-white rounded-lg border border-white/20 cursor-pointer"
              title="Copy executive brief"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[#60A5FA]" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Copy Brief</span>
                </>
              )}
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1.5 text-white/80 hover:text-white rounded-lg hover:bg-white/10 cursor-pointer"
              aria-label="Close simulation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Executive Summary Card */}
          <div className="p-4 rounded-xl border border-[#D9E2F0] bg-[#F4F7FB]">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-[#0F2A5C]" />
                <span className="text-xs font-bold text-[#0F2A5C] uppercase tracking-wider">
                  Executive Exposure Assessment
                </span>
              </div>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${
                  isCriticalOrHigh
                    ? "bg-[#FEE2E2] text-[#991B1B] border-[#FCA5A5]"
                    : isSafeOrLow
                    ? "bg-[#ECFDF5] text-[#065F46] border-[#A7F3D0]"
                    : "bg-[#E3ECFA] text-[#0F2A5C] border-[#93C5FD]"
                }`}
              >
                {isSafeOrLow ? "Defensive Baseline: No Exploitable Chains" : `Simulated Threat Level: ${simulation.riskLevel}`}
              </span>

            </div>
            <p className="text-sm text-[#0B1F3A] leading-relaxed">
              {simulation.executiveSummary}
            </p>
          </div>

          {/* 4-Stage Adversary Kill Chain */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[#51627A]">
                Adversary Attack Path (Kill Chain Simulation)
              </h4>
              <span className="text-[11px] text-[#51627A]">
                Non-destructive threat model
              </span>
            </div>

            <div className="space-y-3">
              {simulation.stages.map((stage) => {
                const isBlocked = stage.status === "blocked_by_patch";
                return (
                  <div
                    key={stage.stepNumber}
                    className={`p-4 rounded-xl border transition-colors ${
                      isBlocked
                        ? "bg-[#ECFDF5] border-[#A7F3D0]"
                        : "bg-white border-[#D9E2F0] hover:border-[#2563EB]/40"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            isBlocked
                              ? "bg-[#059669] text-white"
                              : "bg-[#0F2A5C] text-white"
                          }`}
                        >
                          {stage.stepNumber}
                        </span>
                        <span className="text-xs font-bold uppercase tracking-wider text-[#51627A]">
                          {stage.phase}
                        </span>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded ${
                          isBlocked
                            ? "bg-[#D1FAE5] text-[#065F46]"
                            : "bg-[#FEE2E2] text-[#991B1B]"
                        }`}
                      >
                        {isBlocked ? (
                          <>
                            <ShieldCheck className="w-3 h-3 text-[#059669]" />
                            <span>Remediated by Patch</span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-3 h-3 text-[#DC2626]" />
                            <span>Vulnerable Vector</span>
                          </>
                        )}
                      </span>
                    </div>

                    <h5 className="text-sm font-bold text-[#0B1F3A] mb-1">
                      {stage.title}
                    </h5>

                    <p className="text-xs text-[#0B1F3A] leading-relaxed mb-3">
                      {stage.narrative}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-[#D9E2F0]/60 text-xs">
                      <div className="bg-[#F4F7FB] p-2 rounded-lg">
                        <span className="block text-[10px] font-bold uppercase text-[#51627A] mb-0.5">
                          Business & Compliance Impact
                        </span>
                        <span className="text-[#0B1F3A] font-medium leading-snug">
                          {stage.businessImpact}
                        </span>
                      </div>

                      <div className="bg-[#E3ECFA]/50 p-2 rounded-lg">
                        <span className="block text-[10px] font-bold uppercase text-[#0F2A5C] mb-0.5">
                          Remediation Shield
                        </span>
                        <span className="text-[#0F2A5C] font-medium leading-snug">
                          {stage.mitigation}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Boardroom Takeaway Box */}
          <div className="p-4 rounded-xl border border-[#2563EB]/30 bg-[#E3ECFA]/60 flex items-start gap-3">
            <Award className="w-5 h-5 text-[#2563EB] shrink-0 mt-0.5" />
            <div>
              <span className="block text-xs font-bold text-[#0F2A5C] uppercase tracking-wider mb-1">
                Executive & Boardroom Recommendation
              </span>
              <p className="text-xs text-[#0B1F3A] leading-relaxed">
                {simulation.boardroomTakeaway}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[#D9E2F0] bg-[#F4F7FB] flex items-center justify-between">
          <p className="text-[11px] text-[#51627A]">
            *Safe threat modeling based on passive observation; no harmful payloads transmitted.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold bg-[#0F2A5C] hover:bg-[#0A1F47] text-white rounded-lg cursor-pointer"
          >
            Close Simulation
          </button>
        </div>
      </div>
    </div>
  );
};

