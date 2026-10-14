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
  key: "find" | "prove" | "fix";
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
    label: "Preparing fix recommendations",
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
        icon: <CheckCircle2 className="w-6 h-6 text-[var(--ink)]" />,
        badge: (
          <span className="text-[11px] font-bold text-[var(--ink)] bg-[var(--paper-dark)] border border-[var(--line)] px-2 py-0.5 rounded-[8px]">
            Done
          </span>
        ),
        cardBorder: "border-[var(--ink)] bg-[var(--paper)]",
      };
    }
    if (state === "running") {
      return {
        icon: (
          <div className="w-6 h-6 rounded-[8px] bg-[var(--signal)] text-white flex items-center justify-center text-xs font-bold">
            •
          </div>
        ),
        badge: (
          <span className="text-[11px] font-bold text-[var(--signal)] bg-[var(--paper)] border border-[var(--signal)] px-2 py-0.5 rounded-[8px]">
            Running...
          </span>
        ),
        cardBorder: "border-[var(--signal)] bg-[var(--paper)] pipeline-current-step",
      };
    }
    // pending
    return {
      icon: <Circle className="w-6 h-6 text-[var(--line)]" />,
      badge: (
        <span className="text-[11px] font-medium text-[var(--ink-soft)] bg-[var(--paper-dark)] px-2 py-0.5 rounded-[8px]">
          Pending
        </span>
      ),
      cardBorder: "border-[var(--line)] bg-[var(--paper-dark)] opacity-50",
    };
  };

  return (
    <div className="w-full space-y-6">
      {/* Target Info Header */}
      <div className="bg-[var(--paper-dark)] border border-[var(--line)] rounded-[8px] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[var(--ink-soft)]">
            Current Scan
          </span>
          <div className="flex items-center gap-2 mt-1">
            <Globe className="w-5 h-5 text-[var(--ink-soft)] shrink-0" />
            <h2 className="text-base sm:text-lg font-bold font-mono text-[var(--ink)] break-all">
              {targetUrl}
            </h2>
          </div>
          {githubRepo && (
            <div className="flex items-center gap-1.5 text-xs text-[var(--ink-soft)] mt-1.5">
              <Github className="w-3.5 h-3.5 text-[var(--ink)]" />
              <span>Linked GitHub repository: {githubRepo}</span>
            </div>
          )}
          {zipFileName && (
            <div className="flex items-center gap-1.5 text-xs text-[var(--ink-soft)] mt-1.5">
              <FileArchive className="w-3.5 h-3.5 text-[var(--ink)]" />
              <span>Project files included: {zipFileName}</span>
            </div>
          )}
        </div>

        {onCompleteScan && (
          <button
            type="button"
            onClick={onCompleteScan}
            className="self-start sm:self-center inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-[var(--ink)] bg-[var(--paper)] hover:bg-[var(--paper-dark)] border border-[var(--line)] rounded-[8px] focus:outline-none focus:ring-1 focus:ring-[var(--signal)]"
          >
            <span>Skip to results</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* Progress status banner (Plain static text, NO spinner/animation) */}
      <div className="bg-[var(--paper-dark)] border border-[var(--line)] rounded-[8px] px-4 py-3 flex items-center justify-between text-xs sm:text-sm text-[var(--ink)] font-semibold">
        <span>Status: {currentStepName}</span>
        <span className="text-xs font-mono font-normal text-[var(--ink-soft)]">
          Safe sandbox testing
        </span>
      </div>

      {/* 3-Step Progress Row: FIND -> PROVE -> FIX */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {STEPS.map((step, idx) => {
          const state: StepState = stepper[step.key] || "pending";
          const statusUi = getStepStatus(state);

          return (
            <div
              key={step.key}
              className={`border rounded-[8px] p-4 flex flex-col justify-between gap-3 transition-all ${statusUi.cardBorder}`}
            >
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-[var(--ink-soft)]">
                    0{idx + 1}
                  </span>
                  <span className="text-xs font-bold text-[var(--ink)] tracking-wider">
                    {step.title}
                  </span>
                </div>
                {statusUi.icon}
              </div>

              <div>
                <p className="text-xs text-[var(--ink-soft)] font-medium leading-snug">
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
