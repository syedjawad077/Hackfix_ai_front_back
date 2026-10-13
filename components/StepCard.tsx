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
    <div className="bg-[#F4F7FB] border border-[#D9E2F0] rounded-2xl p-5 sm:p-6 shadow-sm">
      <div className="flex items-start gap-4 mb-4">
        {/* Dark blue step number circle */}
        <div className="w-8 h-8 rounded-full bg-[#0F2A5C] text-white flex items-center justify-center font-bold text-sm shrink-0 shadow-sm">
          {stepNumber}
        </div>
        <div className="flex-1 min-w-0">
          <h2 className="text-base sm:text-lg font-bold text-[#0B1F3A] leading-snug">
            {title}
          </h2>
          <p className="text-xs sm:text-sm text-[#51627A] mt-0.5">
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
