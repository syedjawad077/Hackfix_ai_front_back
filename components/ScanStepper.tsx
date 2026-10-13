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
        return <CheckCircle2 className="w-5 h-5 text-[#2563EB]" />;
      case "running":
        return <Clock className="w-5 h-5 text-[#0F2A5C]" />;
      case "pending":
      default:
        return <Circle className="w-5 h-5 text-[#BACADF]" />;
    }
  };

  const renderStatusBadge = (state: StepState) => {
    switch (state) {
      case "done":
        return (
          <span className="text-[11px] font-semibold text-[#2563EB] bg-[#E3ECFA] px-2 py-0.5 rounded-pill">
            Completed
          </span>
        );
      case "running":
        return (
          <span className="text-[11px] font-semibold text-[#0F2A5C] bg-[#E3ECFA] px-2 py-0.5 rounded-pill border border-[#D9E2F0]">
            Running...
          </span>
        );
      case "pending":
      default:
        return (
          <span className="text-[11px] font-medium text-[#51627A] bg-[#F4F7FB] px-2 py-0.5 rounded-pill">
            Pending
          </span>
        );
    }
  };

  return (
    <div className="w-full bg-[#F4F7FB] border border-[#D9E2F0] rounded-xl p-4 my-3 text-[#0B1F3A]">
      <div className="flex items-center justify-between mb-3 border-b border-[#D9E2F0] pb-2">
        <h4 className="text-xs font-bold uppercase tracking-wider text-[#0F2A5C]">
          Autonomous Security Pipeline
        </h4>
        <span className="text-[11px] font-medium text-[#51627A]">
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
              className={`p-3 rounded-lg border bg-white flex flex-col justify-between gap-2 shadow-sm ${
                isRunning
                  ? "border-[#2563EB] ring-1 ring-[#2563EB]"
                  : isDone
                  ? "border-[#D9E2F0]"
                  : "border-[#D9E2F0] opacity-80"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold font-mono text-[#51627A]">
                    0{idx + 1}
                  </span>
                  <span className="text-xs font-bold tracking-wider text-[#0B1F3A]">
                    {label}
                  </span>
                </div>
                {renderStepIcon(state)}
              </div>

              <p className="text-[11px] text-[#51627A] leading-tight line-clamp-1">
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

