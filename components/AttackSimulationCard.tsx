"use client";

import React from "react";
import { ShieldAlert, ArrowRight, Eye, ShieldCheck, AlertTriangle } from "lucide-react";
import { AttackSimulation } from "@/lib/types";

interface AttackSimulationCardProps {
  simulation: AttackSimulation;
  onOpenModal: () => void;
}

export const AttackSimulationCard: React.FC<AttackSimulationCardProps> = ({
  simulation,
  onOpenModal,
}) => {
  const isCriticalOrHigh = simulation.riskLevel === "Critical" || simulation.riskLevel === "High";
  const isSafeOrLow = simulation.riskLevel === "Low" || simulation.riskLevel === "None";

  return (
    <div className="my-3 rounded-[8px] border border-[var(--line)] bg-[var(--paper)] interactive-card overflow-hidden">
      {/* Top Banner */}
      <div className="px-4 py-3 bg-[var(--ink)] text-[var(--paper)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isSafeOrLow ? (
            <ShieldCheck className="w-4 h-4 text-[#4C9F70]" />
          ) : (
            <ShieldAlert className="w-4 h-4 text-[#E8591A]" />
          )}
          <span className="text-xs font-bold text-[var(--paper)]">
            Executive Breach & Threat Simulation
          </span>
        </div>
        <span
          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[8px] ${
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

      {/* Summary */}
      <div className="p-4 space-y-3 bg-[var(--paper-dark)]">
        <p className="text-xs text-[var(--ink)] leading-relaxed">
          {simulation.executiveSummary}
        </p>

        {/* 4 Kill Chain Nodes Preview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[var(--line)]">
          {simulation.stages.map((stage) => {
            const isBlocked = stage.status === "blocked_by_patch";
            return (
              <div
                key={stage.stepNumber}
                className={`p-2 rounded-[8px] border text-left ${
                  isBlocked
                    ? "bg-[#EDF7F1] border-[#BDE3CC]"
                    : "bg-[var(--paper)] border-[var(--line)]"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[var(--ink-soft)]">
                    Step {stage.stepNumber}
                  </span>
                  {isBlocked ? (
                    <ShieldCheck className="w-3 h-3 text-[#4C9F70]" />
                  ) : (
                    <AlertTriangle className="w-3 h-3 text-[#D7263D]" />
                  )}
                </div>
                <span className="block text-xs font-bold text-[var(--ink)] truncate">
                  {stage.title}
                </span>
                <span className="block text-[10px] text-[var(--ink-soft)] truncate mt-0.5">
                  {stage.affectedAsset}
                </span>
              </div>
            );
          })}
        </div>

        {/* Button to Open Full Modal */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-[11px] text-[var(--ink-soft)] font-medium">
            Generated for Boardroom & Judges Review
          </span>
          <button
            type="button"
            onClick={onOpenModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[var(--ink)] hover:bg-[#333333] text-[var(--paper)] rounded-[8px] cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View Full Kill Chain</span>
          </button>
        </div>
      </div>
    </div>
  );
};

