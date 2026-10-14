"use client";

import React, { useState, useMemo } from "react";
import {
  X,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Copy,
  Check,
  Building,
  Terminal,
  FileCode2,
  CheckCircle2,
  SlidersHorizontal,
  Flame,
  Briefcase,
  ExternalLink,
} from "lucide-react";
import { AttackSimulation } from "@/lib/types";

interface AttackSimulationModalProps {
  isOpen: boolean;
  onClose: () => void;
  simulation: AttackSimulation | null;
  onToast: (msg: string, type?: "info" | "success" | "warning" | "error") => void;
  onReSimulate?: (appliedDefenses: string[]) => Promise<void>;
  isSimulating?: boolean;
}

export const AttackSimulationModal: React.FC<AttackSimulationModalProps> = ({
  isOpen,
  onClose,
  simulation,
  onToast,
  onReSimulate,
  isSimulating = false,
}) => {
  const [copied, setCopied] = useState(false);
  const [selectedDefenses, setSelectedDefenses] = useState<string[]>([]);
  // Single Unified Master Mode Switcher for the entire modal: 'executive' | 'red_team' | 'blue_team'
  const [masterPerspective, setMasterPerspective] = useState<"executive" | "red_team" | "blue_team">("executive");

  // Extract available defenses from simulation
  const availableDefenses = useMemo(() => {
    if (!simulation) return [];
    if (simulation.availableDefenses && simulation.availableDefenses.length > 0) {
      return simulation.availableDefenses;
    }
    const extracted = new Set<string>();
    simulation.stages.forEach((s) => {
      if (s.blockedByDefense && !s.blockedByDefense.includes("Baseline") && !s.blockedByDefense.includes("Patch")) {
        extracted.add(s.blockedByDefense);
      }
    });
    if (extracted.size === 0) {
      extracted.add("HTTP Strict Transport Security (HSTS)");
      extracted.add("Content-Security-Policy (CSP)");
      extracted.add("Parameterized Query Binding");
    }
    return Array.from(extracted);
  }, [simulation]);

  // Compute live What-If severance based on toggled defenses
  const severanceInfo = useMemo(() => {
    if (!simulation) {
      return { severedAt: null, pct: 0, defenseName: null };
    }
    if (selectedDefenses.length === 0) {
      return {
        severedAt: simulation.severedAtStage ?? null,
        pct: simulation.severancePercentage ?? 0,
        defenseName: null,
      };
    }
    const lowerDef = selectedDefenses.map((d) => d.toLowerCase());
    for (const stg of simulation.stages) {
      const bl = (stg.blockedByDefense || "").toLowerCase();
      if (lowerDef.some((d) => bl.includes(d) || d.includes(bl))) {
        const pct = Math.max(
          25,
          Math.round(((simulation.stages.length - stg.stepNumber + 1) / simulation.stages.length) * 100)
        );
        return {
          severedAt: stg.stepNumber,
          pct,
          defenseName: stg.blockedByDefense || selectedDefenses[0],
        };
      }
    }
    // Default to stage 2 if a custom defense was checked
    return {
      severedAt: 2,
      pct: 75,
      defenseName: selectedDefenses[0],
    };
  }, [simulation, selectedDefenses]);

  if (!isOpen || !simulation) return null;

  const handleToggleDefense = (defense: string) => {
    setSelectedDefenses((prev) =>
      prev.includes(defense) ? prev.filter((d) => d !== defense) : [...prev, defense]
    );
  };

  const handleCopyBrief = () => {
    const brief = [
      `=== EXECUTIVE BREACH & THREAT SIMULATION ===`,
      `Target: ${simulation.targetUrl}`,
      `Industry Sector: ${simulation.industrySector || "Modern Web Application"}`,
      `Compliance Scope: ${(simulation.complianceImpact || []).join(", ") || "General AppSec Standards"}`,
      `Risk Level: ${simulation.riskLevel}`,
      `Exploit Synergy Score: ${simulation.chainabilityScore || 65}/100`,
      `Executive Summary: ${simulation.executiveSummary}`,
      ``,
      `--- 4-STAGE ADVERSARY KILL CHAIN ---`,
      ...simulation.stages.map((s) => {
        const isSevered = severanceInfo.severedAt !== null && s.stepNumber >= severanceInfo.severedAt;
        return [
          `[Stage ${s.stepNumber}: ${s.phase}] ${s.title} ${isSevered ? "(SEVERED BY DEFENSE)" : "(VULNERABLE)"}`,
          s.mitreTechniqueId ? `- MITRE ATT&CK: [${s.mitreTechniqueId}] ${s.mitreTechniqueName || ""}` : "",
          `- Affected Asset: ${s.affectedAsset}`,
          `- Business Impact: ${s.businessImpact}`,
          `- Red Team Payload: ${s.adversaryPayload || "N/A"}`,
          `- Blue Team Signature: ${s.detectionLogSignature || "N/A"}`,
          `- Mitigation: ${s.mitigation}`,
          "",
        ]
          .filter(Boolean)
          .join("\n");
      }),
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
  const chainScore = simulation.chainabilityScore || 65;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-[var(--ink)]/80 backdrop-blur-xs">
      <div className="bg-[var(--paper)] border border-[var(--line)] rounded-[8px] w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden shadow-2xl">
        {/* Modal Top Header */}
        <div className="px-5 py-3.5 border-b border-[var(--line)] bg-[var(--ink)] text-[var(--paper)] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-[8px] bg-[var(--paper-dark)] flex items-center justify-center text-[var(--ink)] shrink-0">
              <ShieldAlert className="w-4 h-4 text-[var(--signal)]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-sm sm:text-base font-bold text-[var(--paper)] truncate">
                  Executive Breach & Threat Simulation
                </h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[6px] bg-[var(--paper-dark)] text-[var(--ink)]">
                  Boardroom & Judges View
                </span>
                {simulation.industrySector && (
                  <span className="hidden sm:inline-flex text-[10px] font-semibold items-center gap-1 px-2 py-0.5 rounded-[6px] bg-white/10 text-[var(--paper)]">
                    <Building className="w-3 h-3 text-[var(--signal)]" />
                    {simulation.industrySector}
                  </span>
                )}
              </div>
              <p className="text-xs text-[var(--line)] font-mono truncate max-w-md">
                Target: {simulation.targetUrl}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={handleCopyBrief}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-[var(--paper-dark)] hover:bg-[var(--line)] text-[var(--ink)] rounded-[8px] cursor-pointer"
              title="Copy executive simulation brief"
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
              aria-label="Close modal"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Master Perspective Switcher Toolbar (Single switch for all 4 stages!) */}
        <div className="px-5 py-2.5 bg-[var(--paper-dark)] border-b border-[var(--line)] flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[var(--ink)]">
            <span>Perspective View:</span>
          </div>

          <div className="inline-flex items-center p-1 rounded-[8px] bg-[var(--paper)] border border-[var(--line)] gap-1">
            <button
              type="button"
              onClick={() => setMasterPerspective("executive")}
              className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-[6px] cursor-pointer transition-colors ${
                masterPerspective === "executive"
                  ? "bg-[var(--ink)] text-[var(--paper)] shadow-xs"
                  : "text-[var(--ink-soft)] hover:text-[var(--ink)]"
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span>Executive View</span>
            </button>

            <button
              type="button"
              onClick={() => setMasterPerspective("red_team")}
              className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-[6px] cursor-pointer transition-colors ${
                masterPerspective === "red_team"
                  ? "bg-[#D7263D] text-white shadow-xs"
                  : "text-[var(--ink-soft)] hover:text-[#D7263D]"
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              <span>Red Team Payloads</span>
            </button>

            <button
              type="button"
              onClick={() => setMasterPerspective("blue_team")}
              className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-[6px] cursor-pointer transition-colors ${
                masterPerspective === "blue_team"
                  ? "bg-[#1E40AF] text-white shadow-xs"
                  : "text-[var(--ink-soft)] hover:text-[#1E40AF]"
              }`}
            >
              <FileCode2 className="w-3.5 h-3.5" />
              <span>Blue Team SOC Telemetry</span>
            </button>
          </div>
        </div>

        {/* Scrollable Content Body */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
          {/* Smart Intelligence Highlights: Sector & Chaining Catalyst Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Card 1: Industry Sector & Compliance Profile */}
            <div className="p-4 rounded-[8px] border border-[var(--line)] bg-[var(--paper-dark)] space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <Building className="w-4 h-4 text-[var(--ink)]" />
                  <span className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider">
                    Sector & Compliance Profile
                  </span>
                </div>
                <span
                  className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-[6px] ${
                    isCriticalOrHigh
                      ? "bg-[#FDE8EA] text-[#D7263D]"
                      : isSafeOrLow
                      ? "bg-[#EDF7F1] text-[#2F6D4B]"
                      : "bg-[#FEF8E7] text-[#B88100]"
                  }`}
                >
                  {simulation.riskLevel} Risk
                </span>
              </div>

              <div className="text-sm font-bold text-[var(--ink)]">
                {simulation.industrySector || "Modern Web Application"}
              </div>

              {simulation.complianceImpact && simulation.complianceImpact.length > 0 && (
                <div className="pt-1 flex items-center gap-1.5 flex-wrap">
                  {simulation.complianceImpact.map((comp) => (
                    <span
                      key={comp}
                      className="text-[10px] font-mono font-medium px-2 py-0.5 rounded-[4px] bg-[var(--paper)] text-[var(--ink)] border border-[var(--line)]"
                    >
                      {comp}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Card 2: Vulnerability Chaining Catalyst & Synergy Metric */}
            <div className="p-4 rounded-[8px] border border-[var(--line)] bg-[var(--paper-dark)] space-y-2">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5">
                  <Flame className="w-4 h-4 text-[var(--signal)]" />
                  <span className="text-xs font-bold text-[var(--ink)] uppercase tracking-wider">
                    Vulnerability Chaining Catalyst
                  </span>
                </div>
                <span
                  className={`text-xs font-mono font-bold px-2 py-0.5 rounded-[6px] ${
                    chainScore >= 80
                      ? "bg-[#FDE8EA] text-[#D7263D]"
                      : chainScore >= 60
                      ? "bg-[#FEF8E7] text-[#B88100]"
                      : "bg-[#EDF7F1] text-[#2F6D4B]"
                  }`}
                >
                  Synergy: {chainScore}/100
                </span>
              </div>

              {/* Progress meter */}
              <div className="w-full bg-[var(--paper)] h-2 rounded-full overflow-hidden border border-[var(--line)]">
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

              <p className="text-xs text-[var(--ink-soft)] leading-snug">
                {simulation.chainCatalysts && simulation.chainCatalysts[0]
                  ? simulation.chainCatalysts[0]
                  : simulation.chainabilityVerdict ||
                    "Evaluates whether perimeter flaws sequence into an accelerated kill chain."}
              </p>
            </div>
          </div>

          {/* Interactive What-If Defense Severance Shield */}
          <div className="p-4 rounded-[8px] border border-[var(--line)] bg-[var(--paper)] space-y-2.5">
            <div className="flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                <SlidersHorizontal className="w-4 h-4 text-[var(--signal)]" />
                <span className="text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
                  Interactive Defense Shield (Sever Attack Path)
                </span>
              </div>

              {severanceInfo.severedAt !== null && (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold px-2.5 py-0.5 rounded-[6px] bg-[#D1FAE5] text-[#065F46] border border-[#A7F3D0]">
                  <CheckCircle2 className="w-3.5 h-3.5 text-[#065F46]" />
                  Attack Path Severed at Stage {severanceInfo.severedAt} ({severanceInfo.pct}% Neutralized)
                </span>
              )}
            </div>

            <p className="text-xs text-[var(--ink-soft)]">
              Toggle defensive mitigations below to see precisely where the adversary attack path is halted:
            </p>

            {/* Defense Toggle Pills */}
            <div className="flex items-center gap-2 flex-wrap pt-1">
              {availableDefenses.map((defense) => {
                const isActive = selectedDefenses.includes(defense);
                return (
                  <button
                    key={defense}
                    type="button"
                    onClick={() => handleToggleDefense(defense)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-medium border cursor-pointer transition-colors ${
                      isActive
                        ? "bg-[var(--ink)] text-[var(--paper)] border-[var(--ink)]"
                        : "bg-[var(--paper-dark)] text-[var(--ink)] border-[var(--line)] hover:border-[var(--signal)]"
                    }`}
                  >
                    <span
                      className={`w-3.5 h-3.5 rounded-[4px] border flex items-center justify-center text-[10px] ${
                        isActive
                          ? "bg-[var(--signal)] border-[var(--signal)] text-white"
                          : "border-[var(--line)] bg-[var(--paper)]"
                      }`}
                    >
                      {isActive ? "✓" : ""}
                    </span>
                    <span>{defense}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 4-Stage Adversary Kill Chain */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-bold uppercase tracking-wider text-[var(--ink-soft)]">
                Adversary Attack Path (4-Stage Execution)
              </h4>
              <span className="text-[11px] text-[var(--ink-soft)] font-mono">
                MITRE ATT&CK Mapped
              </span>
            </div>

            <div className="space-y-3">
              {simulation.stages.map((stage) => {
                const isSeveredByWhatIf =
                  severanceInfo.severedAt !== null && stage.stepNumber >= severanceInfo.severedAt;
                const isBlocked = stage.status === "blocked_by_patch" || isSeveredByWhatIf;

                return (
                  <div
                    key={stage.stepNumber}
                    className={`p-4 rounded-[8px] border transition-all ${
                      isBlocked
                        ? "bg-[#F3FAF5] border-[#BDE3CC]"
                        : "bg-[var(--paper)] border-[var(--line)]"
                    }`}
                  >
                    {/* Stage Header */}
                    <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-6 h-6 rounded-[6px] flex items-center justify-center text-xs font-bold ${
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

                        {stage.mitreTechniqueId && (
                          <span
                            className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded-[4px] bg-[var(--paper-dark)] text-[var(--ink)] border border-[var(--line)]"
                            title={stage.mitreTechniqueName || stage.mitreTactic}
                          >
                            <span>{stage.mitreTechniqueId}</span>
                            {stage.mitreTechniqueName && (
                              <span className="hidden sm:inline font-normal">
                                : {stage.mitreTechniqueName}
                              </span>
                            )}
                          </span>
                        )}
                      </div>

                      <span
                        className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-[6px] ${
                          isBlocked
                            ? "bg-[#D1FAE5] text-[#065F46]"
                            : "bg-[#FDE8EA] text-[#D7263D]"
                        }`}
                      >
                        {isBlocked ? (
                          <>
                            <ShieldCheck className="w-3.5 h-3.5 text-[#065F46]" />
                            <span>Severed & Blocked by Defense</span>
                          </>
                        ) : (
                          <>
                            <AlertTriangle className="w-3.5 h-3.5 text-[#D7263D]" />
                            <span>Vulnerable Vector</span>
                          </>
                        )}
                      </span>
                    </div>

                    <h5 className="text-sm font-bold text-[var(--ink)] mb-2">
                      {stage.title}
                    </h5>

                    {/* Mode 1: Executive View */}
                    {masterPerspective === "executive" && (
                      <div className="space-y-2 text-xs">
                        <p className="text-[var(--ink)] leading-relaxed">
                          {isSeveredByWhatIf
                            ? `🛡️ DEFENSE ENGAGED: Attack trajectory halted at Stage ${stage.stepNumber}. The applied patch neutralizes the exploit vector before unauthorized execution.`
                            : stage.narrative}
                        </p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-[var(--line)]/60 text-[11px]">
                          <div>
                            <span className="font-bold text-[var(--ink-soft)] block uppercase text-[10px]">
                              Affected Asset:
                            </span>
                            <span className="font-mono text-[var(--ink)]">
                              {stage.affectedAsset}
                            </span>
                          </div>
                          <div>
                            <span className="font-bold text-[var(--ink-soft)] block uppercase text-[10px]">
                              Business & Regulatory Impact:
                            </span>
                            <span className="text-[var(--ink)]">
                              {stage.businessImpact}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Mode 2: Red Team Payloads */}
                    {masterPerspective === "red_team" && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-[#D7263D] flex items-center gap-1">
                            <Terminal className="w-3.5 h-3.5" />
                            <span>Adversary CLI Probe & Exploit Payload</span>
                          </span>
                          <span className="text-[10px] text-[var(--ink-soft)]">
                            Safe non-destructive simulation
                          </span>
                        </div>
                        <div className="p-2.5 rounded-[6px] bg-[#1B1B1B] text-[#E0E0E0] font-mono text-xs overflow-x-auto border border-[#333333]">
                          <pre className="whitespace-pre-wrap">
                            {stage.adversaryPayload ||
                              `curl -s -X POST '${simulation.targetUrl}' -d '{"exploit": "test"}'`}
                          </pre>
                        </div>
                        <p className="text-[11px] text-[var(--ink-soft)]">
                          <strong>Adversary Goal:</strong> Leverages {stage.mitreTechniqueName || "weakness"} on {stage.affectedAsset} to breach system perimeter.
                        </p>
                      </div>
                    )}

                    {/* Mode 3: Blue Team SOC Telemetry */}
                    {masterPerspective === "blue_team" && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-[#1E40AF] flex items-center gap-1">
                            <FileCode2 className="w-3.5 h-3.5" />
                            <span>SIEM Alert Rule & Audit Telemetry Signature</span>
                          </span>
                          <span className="text-[10px] text-[var(--ink-soft)] font-mono">
                            SOC Log Event
                          </span>
                        </div>
                        <div className="p-2.5 rounded-[6px] bg-[#0F172A] text-[#93C5FD] font-mono text-xs overflow-x-auto border border-[#1E293B]">
                          <pre className="whitespace-pre-wrap">
                            {stage.detectionLogSignature ||
                              `ALERT: Anomalous request pattern detected on ${stage.affectedAsset} | WAF_ACTION=FLAGGED`}
                          </pre>
                        </div>
                        <p className="text-[11px] text-[var(--ink-soft)]">
                          <strong>Defensive Shield:</strong> {stage.mitigation}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Boardroom Takeaway Box */}
          <div className="p-4 rounded-[8px] border border-[var(--line)] bg-[var(--paper-dark)] space-y-1.5">
            <div className="flex items-center gap-2">
              <Briefcase className="w-4 h-4 text-[var(--ink)]" />
              <span className="text-xs font-bold uppercase tracking-wider text-[var(--ink)]">
                Boardroom & Jury Recommendation
              </span>
            </div>
            <p className="text-xs text-[var(--ink)] leading-relaxed">
              {simulation.boardroomTakeaway}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3 border-t border-[var(--line)] bg-[var(--paper)] flex items-center justify-between shrink-0">
          <span className="text-[11px] text-[var(--ink-soft)]">
            Autonomous threat simulation generated by HackFix AI
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold bg-[var(--ink)] text-[var(--paper)] hover:bg-[#2A2A2A] rounded-[8px] cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
