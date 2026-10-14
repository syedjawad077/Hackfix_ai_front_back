"use client";

import React from "react";
import {
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Building,
  Flame,
  Zap,
  SlidersHorizontal,
  ChevronRight,
} from "lucide-react";
import { AttackSimulation } from "@/lib/types";

interface AttackSimulationCardProps {
  simulation: AttackSimulation;
  onOpenModal: () => void;
}

export const AttackSimulationCard: React.FC<AttackSimulationCardProps> = ({
  simulation,
  onOpenModal,
}) => {
  const isCriticalOrHigh =
    simulation.riskLevel === "Critical" || simulation.riskLevel === "High";
  const isSafeOrLow =
    simulation.riskLevel === "Low" || simulation.riskLevel === "None";

  const chainScore = simulation.chainabilityScore || 65;

  return (
    <div className="my-4 rounded-[8px] border border-[var(--line)] bg-[var(--paper)] overflow-hidden shadow-xs">
      {/* Top Banner: Risk & Target */}
      <div className="px-4 py-3 bg-[var(--ink)] text-[var(--paper)] flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2">
          {isSafeOrLow ? (
            <ShieldCheck className="w-4 h-4 text-[#4C9F70]" />
          ) : (
            <ShieldAlert className="w-4 h-4 text-[var(--signal)]" />
          )}
          <span className="text-xs font-bold text-[var(--paper)]">
            Executive Breach & Threat Simulation
          </span>
          <span className="hidden sm:inline text-xs text-[var(--line)]">
            • {simulation.targetUrl}
          </span>
        </div>

        <span
          className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-[8px] ${
            isCriticalOrHigh
              ? "bg-[#D7263D] text-white"
              : isSafeOrLow
              ? "bg-[#4C9F70] text-white"
              : "bg-[#F2A900] text-[#1B1B1B]"
          }`}
        >
          {isSafeOrLow ? "Baseline Secure (No Threats)" : `${simulation.riskLevel} Exposure`}
        </span>
      </div>

      <div className="p-4 space-y-3.5 bg-[var(--paper-dark)]">
        {/* Feature 1: Sector & Regulatory Profile Badges */}
        <div className="flex items-center justify-between gap-2 flex-wrap pb-2 border-b border-[var(--line)]">
          <div className="flex items-center gap-1.5">
            <Building className="w-3.5 h-3.5 text-[var(--ink)]" />
            <span className="text-xs font-bold text-[var(--ink)]">
              {simulation.industrySector || "Modern Web Application"}
            </span>
          </div>

          {simulation.complianceImpact && simulation.complianceImpact.length > 0 && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[10px] uppercase font-bold text-[var(--ink-soft)]">
                Compliance:
              </span>
              {simulation.complianceImpact.slice(0, 3).map((comp) => (
                <span
                  key={comp}
                  className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-[6px] bg-[var(--paper)] text-[var(--ink)] border border-[var(--line)]"
                >
                  {comp.split(" ")[0]}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Executive Summary */}
        <p className="text-xs text-[var(--ink)] leading-relaxed">
          {simulation.executiveSummary}
        </p>

        {/* Feature 3: Exploit Chaining Catalyst & Synergy Metric */}
        <div className="p-3 rounded-[8px] bg-[var(--paper)] border border-[var(--line)] space-y-2">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-[var(--signal)]" />
              <span className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider">
                Exploit Chaining Catalyst
              </span>
            </div>
            <div className="flex items-center gap-1.5 font-mono text-xs font-bold text-[var(--ink)]">
              <span>Synergy:</span>
              <span
                className={`px-1.5 py-0.5 rounded-[4px] text-[11px] ${
                  chainScore >= 80
                    ? "bg-[#FDE8EA] text-[#D7263D]"
                    : chainScore >= 60
                    ? "bg-[#FEF8E7] text-[#B88100]"
                    : "bg-[#EDF7F1] text-[#2F6D4B]"
                }`}
              >
                {chainScore}/100
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="w-full bg-[var(--paper-dark)] h-1.5 rounded-full overflow-hidden border border-[var(--line)]">
            <div
              className={`h-full rounded-full transition-all ${
                chainScore >= 80
                  ? "bg-[#D7263D]"
                  : chainScore >= 60
                  ? "bg-[#F2A900]"
                  : "bg-[#4C9F70]"
              }`}
              style={{ width: `${chainScore}%` }}
            />
          </div>

          <p className="text-[11px] text-[var(--ink-soft)] leading-snug">
            {simulation.chainCatalysts && simulation.chainCatalysts[0]
              ? simulation.chainCatalysts[0]
              : simulation.chainabilityVerdict ||
                "Evaluates whether perimeter weaknesses sequence into an accelerated kill chain."}
          </p>
        </div>

        {/* Feature 2: 4-Stage Kill Chain with MITRE ATT&CK Mapping */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--ink-soft)]">
              Adversary Kill Chain (MITRE ATT&CK Mapped)
            </span>
            {simulation.severedAtStage && (
              <span className="text-[10px] font-bold text-[#2F6D4B]">
                ⚡ Severed at Stage {simulation.severedAtStage} ({simulation.severancePercentage || 75}% Blocked)
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {simulation.stages.map((stage) => {
              const isBlocked = stage.status === "blocked_by_patch";
              return (
                <div
                  key={stage.stepNumber}
                  className={`p-2.5 rounded-[8px] border text-left flex flex-col justify-between ${
                    isBlocked
                      ? "bg-[#EDF7F1] border-[#BDE3CC]"
                      : "bg-[var(--paper)] border-[var(--line)]"
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--ink-soft)]">
                        Stage {stage.stepNumber}
                      </span>
                      {stage.mitreTechniqueId && (
                        <span className="font-mono text-[9px] font-bold px-1.5 py-0.5 rounded-[4px] bg-[var(--paper-dark)] text-[var(--ink)] border border-[var(--line)]">
                          {stage.mitreTechniqueId}
                        </span>
                      )}
                    </div>
                    <span className="block text-xs font-bold text-[var(--ink)] truncate">
                      {stage.title}
                    </span>
                    <span className="block text-[10px] text-[var(--ink-soft)] truncate mt-0.5">
                      {stage.affectedAsset}
                    </span>
                  </div>

                  <div className="mt-2 pt-1 border-t border-[var(--line)]/60 flex items-center justify-between">
                    <span
                      className={`text-[9px] font-semibold ${
                        isBlocked ? "text-[#2F6D4B]" : "text-[#D7263D]"
                      }`}
                    >
                      {isBlocked ? "🛡️ Severed / Defended" : "⚠️ Vulnerable Vector"}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Feature 4 & 5 Launch Action: Open Interactive War Game */}
        <div className="pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
          <div className="flex items-center gap-1.5 text-[11px] text-[var(--ink-soft)]">
            <SlidersHorizontal className="w-3.5 h-3.5 text-[var(--signal)]" />
            <span>Interactive Red Team / Blue Team / What-If Defense</span>
          </div>

          <button
            type="button"
            onClick={onOpenModal}
            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold bg-[var(--ink)] hover:bg-[#2A2A2A] text-[var(--paper)] rounded-[8px] cursor-pointer shadow-none transition-colors"
          >
            <Zap className="w-3.5 h-3.5 text-[var(--signal)]" />
            <span>Launch Interactive War Game</span>
            <ChevronRight className="w-3.5 h-3.5 text-[var(--paper)]" />
          </button>
        </div>
      </div>
    </div>
  );
};
