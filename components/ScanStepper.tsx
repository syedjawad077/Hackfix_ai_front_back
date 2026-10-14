"use client";

import React from "react";
import { CheckCircle2, Circle, Clock } from "lucide-react";
import { ScanStepperState, StepState } from "@/lib/types";

interface ScanStepperProps {
  stepper: ScanStepperState;
}

const stepLabels: { key: keyof ScanStepperState; label: string; desc: string }[] = [
  { key: "find", label: "FIND", desc: "Discover vulnerabilities" },
  { key: "prove", label: "PROVE", desc: "Safe exploit validation" },
  { key: "fix", label: "FIX", desc: "Generate diff patches" },
  { key: "verify", label: "VERIFY", desc: "Automated regression tests" },
];

export const ScanStepper: React.FC<ScanStepperProps> = ({ stepper }) => {
  const renderStepIcon = (state: StepState) => {
    switch (state) {
      case "done":
        return <CheckCircle2 className="w-5 h-5 text-[var(--ink)]" />;
      case "running":
        return <Clock className="w-5 h-5 text-[var(--signal)]" />;
      case "pending":
      default:
        return <Circle className="w-5 h-5 text-[var(--line)]" />;
    }
  };

  const renderStatusBadge = (state: StepState) => {
    switch (state) {
      case "done":
        return (
          <span className="text-[11px] font-semibold text-[var(--ink)] bg-[var(--paper-dark)] px-2 py-0.5 rounded-[8px] border border-[var(--line)]">
            Completed
          </span>
        );
      case "running":
        return (
          <span className="text-[11px] font-semibold text-[var(--signal)] bg-[var(--paper)] px-2 py-0.5 rounded-[8px] border border-[var(--signal)]">
            Running...
          </span>
        );
      case "pending":
      default:
        return (
          <span className="text-[11px] font-medium text-[var(--ink-soft)] bg-[var(--paper-dark)] px-2 py-0.5 rounded-[8px]">
            Pending
          </span>
        );
    }
  };

  return (
    <div className="w-full bg-[var(--paper-dark)] border border-[var(--line)] rounded-[8px] p-4 my-3 text-[var(--ink)]">
      <div className="flex items-center justify-between mb-3 border-b border-[var(--line)] pb-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
          Autonomous Security Pipeline
        </h4>
        <span className="text-[11px] font-medium text-[var(--ink-soft)]">
          4-Step Verification Engine
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
        {stepLabels.map(({ key, label, desc }, idx) => {
          const state = stepper[key] || "pending";
          const isDone = state === "done";
          const isRunning = state === "running";

          return (
            <div
              key={key}
              className={`p-3 rounded-[8px] border bg-[var(--paper)] flex flex-col justify-between gap-2 transition-all ${
                isRunning
                  ? "border-[var(--signal)] pipeline-current-step"
                  : isDone
                  ? "border-[var(--ink)]"
                  : "border-[var(--line)] opacity-50"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold font-mono text-[var(--ink-soft)]">
                    0{idx + 1}
                  </span>
                  <span className="text-xs font-bold tracking-wider text-[var(--ink)]">
                    {label}
                  </span>
                </div>
                {renderStepIcon(state)}
              </div>

              <p className="text-[11px] text-[var(--ink-soft)] leading-tight line-clamp-1">
                {desc}
              </p>

              <div>{renderStatusBadge(state)}</div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

