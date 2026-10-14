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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[var(--ink)]/70 backdrop-blur-xs">
      <div className="bg-[var(--paper)] border border-[var(--line)] rounded-[8px] w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-[var(--line)] bg-[var(--ink)] text-[var(--paper)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-[8px] bg-[var(--paper-dark)] flex items-center justify-center text-[var(--ink)]">
              <ShieldAlert className="w-5 h-5 text-[var(--signal)]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-[var(--paper)]">
                  Executive Breach & Threat Simulation
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[8px] bg-[var(--paper-dark)] text-[var(--ink)] border border-[var(--line)]">
                  Judges & C-Suite View
                </span>
              </div>
              <p className="text-xs text-[var(--line)] font-mono mt-0.5">
                Target: {simulation.targetUrl}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCopyBrief}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[var(--paper-dark)] hover:bg-[var(--line)] text-[var(--ink)] rounded-[8px] border border-[var(--line)] cursor-pointer"
              title="Copy executive brief"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-[var(--ink)]" />
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
              className="p-1.5 text-[var(--paper)]/80 hover:text-[var(--paper)] rounded-[8px] hover:bg-white/10 cursor-pointer"
              aria-label="Close simulation"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Executive Summary Card */}
          <div className="p-4 rounded-[8px] border border-[var(--line)] bg-[var(--paper-dark)]">
            <div className="flex items-start justify-between gap-4 mb-2">
              <div className="flex items-center gap-2">
                <Building className="w-4 h-4 text-[var(--ink)]" />
                <span className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider">
                  Executive Exposure Assessment
                </span>
              </div>
              <span
                className={`text-xs font-bold px-2.5 py-0.5 rounded-[8px] border ${
                  isCriticalOrHigh
                    ? "bg-[#FDE8EA] text-[#D7263D] border-[#F8B4BB]"
                    : isSafeOrLow
                    ? "bg-[#EDF7F1] text-[#2F6D4B] border-[#BDE3CC]"
                    : "bg-[#FEF8E7] text-[#B88100] border-[#FBE39F]"
                }`}
              >
                {isSafeOrLow ? "Defensive Baseline: No Exploitable Chains" : `Simulated Threat Level: ${simulation.riskLevel}`}
              </span>
            </div>
            <p className="text-sm text-[var(--ink)] leading-relaxed">
              {simulation.executiveSummary}
            </p>
          </div>

          {/* 4-Stage Adversary Kill Chain */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--ink-soft)]">
                Adversary Attack Path (Kill Chain Simulation)
              </h4>
              <span className="text-[11px] text-[var(--ink-soft)]">
                Non-destructive threat model
              </span>
            </div>

            <div className="space-y-3">
              {simulation.stages.map((stage) => {
                const isBlocked = stage.status === "blocked_by_patch";
                return (
                  <div
                    key={stage.stepNumber}
                    className={`p-4 rounded-[8px] border transition-colors ${
                      isBlocked
                        ? "bg-[#EDF7F1] border-[#BDE3CC]"
                        : "bg-[var(--paper)] border-[var(--line)] hover:border-[var(--signal)]"
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-6 h-6 rounded-[8px] flex items-center justify-center text-xs font-bold ${
                            isBlocked
                              ? "bg-[#4C9F70] text-white"
                              : "bg-[var(--ink)] text-[var(--paper)]"
                          }`}
                        >
                          {stage.stepNumber}
                        </span>
                        <span className="text-xs font-bold uppercase tracking-wider text-[var(--ink-soft)]">
                          {stage.phase}
                        </span>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-[8px] ${
                          isBlocked
                            ? "bg-[#D1FAE5] text-[#065F46]"
                            : "bg-[#FDE8EA] text-[#D7263D]"
                        }`}
                      >
                        {isBlocked ? (
                          <>
                            <ShieldCheck className="w-3 h-3 text-[#4C9F70]" />
                            <span>Remediated by Patch</span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-3 h-3 text-[#D7263D]" />
                            <span>Vulnerable Vector</span>
                          </>
                        )}
                      </span>
                    </div>

                    <h5 className="text-sm font-bold text-[var(--ink)] mb-1">
                      {stage.title}
                    </h5>

                    <p className="text-xs text-[var(--ink)] leading-relaxed mb-3">
                      {stage.narrative}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2 border-t border-[var(--line)] text-xs">
                      <div className="bg-[var(--paper-dark)] p-2 rounded-[8px]">
                        <span className="block text-[10px] font-bold uppercase text-[var(--ink-soft)] mb-0.5">
                          Business & Compliance Impact
                        </span>
                        <span className="text-[var(--ink)] font-medium leading-snug">
                          {stage.businessImpact}
                        </span>
                      </div>

                      <div className="bg-[var(--paper-dark)] p-2 rounded-[8px]">
                        <span className="block text-[10px] font-bold uppercase text-[var(--ink)] mb-0.5">
                          Remediation Shield
                        </span>
                        <span className="text-[var(--ink)] font-medium leading-snug">
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
          <div className="p-4 rounded-[8px] border border-[var(--line)] bg-[var(--paper-dark)] flex items-start gap-3">
            <Award className="w-5 h-5 text-[var(--signal)] shrink-0 mt-0.5" />
            <div>
              <span className="block text-xs font-bold text-[var(--ink)] uppercase tracking-wider mb-1">
                Executive & Boardroom Recommendation
              </span>
              <p className="text-xs text-[var(--ink)] leading-relaxed">
                {simulation.boardroomTakeaway}
              </p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-[var(--line)] bg-[var(--paper-dark)] flex items-center justify-between">
          <p className="text-[11px] text-[var(--ink-soft)]">
            *Safe threat modeling based on passive observation; no harmful payloads transmitted.
          </p>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-semibold bg-[var(--ink)] hover:bg-[#333333] text-[var(--paper)] rounded-[8px] cursor-pointer"
          >
            Close Simulation
          </button>
        </div>
      </div>
    </div>
  );
};

