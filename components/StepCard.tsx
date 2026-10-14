"use client";

import React from "react";

interface StepCardProps {
  stepNumber: number;
  title: string;
  explanation: string;
  children: React.ReactNode;
  isCompleted?: boolean;
}

export function StepCard({
  stepNumber,
  title,
  explanation,
  children,
  isCompleted,
}: StepCardProps) {
  return (
    <div className="bg-[var(--paper-dark)] border border-[var(--line)] rounded-[8px] p-5 sm:p-6">
      <div className="flex items-start gap-4 mb-4">
        {/* Ink step number square */}
        <div className="w-8 h-8 rounded-[8px] bg-[var(--ink)] text-[var(--paper)] flex items-center justify-center font-bold text-sm shrink-0">
          {stepNumber}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base sm:text-lg font-bold text-[var(--ink)] leading-snug">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-[var(--ink-soft)] mt-0.5">
            {explanation}
          </p>
        </div>
      </div>

      <div className="pl-0 sm:pl-12">
        {children}
      </div>
    </div>
  );
}
