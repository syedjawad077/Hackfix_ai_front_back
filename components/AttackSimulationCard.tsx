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
    <div className="my-3 rounded-2xl border border-[#D9E2F0] bg-white shadow-soft overflow-hidden">
      {/* Top Banner */}
      <div className="px-4 py-3 bg-[#0F2A5C] text-white flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isSafeOrLow ? (
            <ShieldCheck className="w-4 h-4 text-[#10B981]" />
          ) : (
            <ShieldAlert className="w-4 h-4 text-[#93C5FD]" />
          )}
          <span className="text-xs font-bold text-white">
            Executive Breach & Threat Simulation
          </span>
        </div>
        <span
          className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
            isCriticalOrHigh
              ? "bg-[#EF4444] text-white"
              : isSafeOrLow
              ? "bg-[#10B981] text-white"
              : "bg-[#2563EB] text-white"
          }`}
        >
          {isSafeOrLow ? "Baseline Secure (No Threats)" : `${simulation.riskLevel} Exposure`}
        </span>
      </div>


      {/* Summary */}
      <div className="p-4 space-y-3 bg-[#F4F7FB]/40">
        <p className="text-xs text-[#0B1F3A] leading-relaxed">
          {simulation.executiveSummary}
        </p>

        {/* 4 Kill Chain Nodes Preview */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-2 border-t border-[#D9E2F0]">
          {simulation.stages.map((stage) => {
            const isBlocked = stage.status === "blocked_by_patch";
            return (
              <div
                key={stage.stepNumber}
                className={`p-2 rounded-lg border text-left ${
                  isBlocked
                    ? "bg-[#ECFDF5] border-[#A7F3D0]"
                    : "bg-white border-[#D9E2F0]"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#51627A]">
                    Step {stage.stepNumber}
                  </span>
                  {isBlocked ? (
                    <ShieldCheck className="w-3 h-3 text-[#059669]" />
                  ) : (
                    <AlertTriangle className="w-3 h-3 text-[#DC2626]" />
                  )}
                </div>
                <span className="block text-xs font-bold text-[#0B1F3A] truncate">
                  {stage.title}
                </span>
                <span className="block text-[10px] text-[#51627A] truncate mt-0.5">
                  {stage.affectedAsset}
                </span>
              </div>
            );
          })}
        </div>

        {/* Button to Open Full Modal */}
        <div className="flex items-center justify-between pt-2">
          <span className="text-[11px] text-[#51627A] font-medium">
            Generated for Boardroom & Judges Review
          </span>
          <button
            type="button"
            onClick={onOpenModal}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[#0F2A5C] hover:bg-[#0A1F47] text-white rounded-lg shadow-soft cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5" />
            <span>View Full Kill Chain</span>
          </button>
        </div>
      </div>
    </div>
  );
};

