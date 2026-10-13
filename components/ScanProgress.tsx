"use client";

import React from "react";
import { CheckCircle2, Circle, Globe, FileArchive, ArrowRight, Github } from "lucide-react";
import { ScanStepperState, StepState, ScanLogEntry } from "@/lib/types";
import { TechnicalDetails } from "./TechnicalDetails";

interface ScanProgressProps {
  targetUrl: string;
  githubRepo?: string;
  zipFileName?: string;
  stepper: ScanStepperState;
  currentStepName: string;
  logs: ScanLogEntry[];
  onCompleteScan?: () => void;
}

interface StepConfig {
  key: keyof ScanStepperState;
  title: string;
  label: string;
}

const STEPS: StepConfig[] = [
  {
    key: "find",
    title: "FIND",
    label: "Looking for problems",
  },
  {
    key: "prove",
    title: "PROVE",
    label: "Safely checking they are real",
  },
  {
    key: "fix",
    title: "FIX",
    label: "Preparing fixes",
  },
  {
    key: "verify",
    title: "VERIFY",
    label: "Re-testing the fixes",
  },
];

export function ScanProgress({
  targetUrl,
  githubRepo,
  zipFileName,
  stepper,
  currentStepName,
  logs,
  onCompleteScan,
}: ScanProgressProps) {
  const getStepStatus = (state: StepState) => {
    if (state === "done") {
      return {
        icon: <CheckCircle2 className="w-6 h-6 text-[#2563EB]" />,
        badge: (
          <span className="text-[11px] font-bold text-[#2563EB] bg-[#DBEAFE] px-2 py-0.5 rounded-full">
            Done
          </span>
        ),
        cardBorder: "border-[#93C5FD] bg-white",
      };
    }
    if (state === "running") {
      return {
        icon: (
          <div className="w-6 h-6 rounded-full bg-[#0F2A5C] text-white flex items-center justify-center text-xs font-bold">
            •
          </div>
        ),
        badge: (
          <span className="text-[11px] font-bold text-[#0F2A5C] bg-[#E3ECFA] px-2 py-0.5 rounded-full">
            Running...
          </span>
        ),
        cardBorder: "border-[#2563EB] bg-white ring-2 ring-[#E3ECFA]",
      };
    }
    // pending
    return {
      icon: <Circle className="w-6 h-6 text-[#BACADF]" />,
      badge: (
        <span className="text-[11px] font-medium text-[#51627A] bg-[#F4F7FB] px-2 py-0.5 rounded-full">
          Pending
        </span>
      ),
      cardBorder: "border-[#D9E2F0] bg-[#F4F7FB]/50",
    };
  };

  return (
    <div className="w-full space-y-6">
      {/* Target Info Header */}
      <div className="bg-[#F4F7FB] border border-[#D9E2F0] rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#51627A]">
            Current Scan
          </span>
          <div className="flex items-center gap-2 mt-1">
            <Globe className="w-5 h-5 text-[#2563EB] shrink-0" />
            <h2 className="text-base sm:text-lg font-bold text-[#0B1F3A] break-all">
              {targetUrl}
            </h2>
          </div>
          {githubRepo && (
            <div className="flex items-center gap-1.5 text-xs text-[#51627A] mt-1.5">
              <Github className="w-3.5 h-3.5 text-[#0F2A5C]" />
              <span>Linked GitHub repository: {githubRepo}</span>
            </div>
          )}
          {zipFileName && (
            <div className="flex items-center gap-1.5 text-xs text-[#51627A] mt-1.5">
              <FileArchive className="w-3.5 h-3.5 text-[#0F2A5C]" />
              <span>Project files included: {zipFileName}</span>
            </div>
          )}
        </div>

        {onCompleteScan && (
          <button
            type="button"
            onClick={onCompleteScan}
            className="self-start sm:self-center inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[#0F2A5C] bg-white hover:bg-[#E3ECFA] border border-[#D9E2F0] rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
          >
            <span>Skip to results</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Progress status banner (Plain static text, NO spinner/animation) */}
      <div className="bg-[#E3ECFA] border border-[#BACADF] rounded-xl px-4 py-3 flex items-center justify-between text-xs sm:text-sm text-[#0F2A5C] font-semibold">
        <span>Status: {currentStepName}</span>
        <span className="text-xs font-mono font-normal text-[#51627A]">
          Safe sandbox testing
        </span>
      </div>

      {/* 4-Step Progress Row: FIND -> PROVE -> FIX -> VERIFY */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
        {STEPS.map((step, idx) => {
          const state = stepper[step.key];
          const statusUi = getStepStatus(state);

          return (
            <div
              key={step.key}
              className={`border rounded-2xl p-4 flex flex-col justify-between gap-3 ${statusUi.cardBorder}`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[#51627A]">
                    0{idx + 1}
                  </span>
                  <span className="text-xs font-bold text-[#0B1F3A] tracking-wider">
                    {step.title}
                  </span>
                </div>
                {statusUi.icon}
              </div>

              <div>
                <p className="text-xs text-[#51627A] font-medium leading-snug">
                  {step.label}
                </p>
              </div>

              <div className="pt-1">{statusUi.badge}</div>
            </div>
          );
        })}
      </div>

      {/* Collapsible Technical Details holding monospace scan log */}
      <TechnicalDetails logs={logs} defaultOpen={false} />
    </div>
  );
}
