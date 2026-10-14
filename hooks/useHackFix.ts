"use client";

import { useState, useEffect, useCallback } from "react";
import {
  ChatMessage as ChatMessageType,
  ChatSession,
  Finding,
  ScanReport,
  AttackSimulation,
} from "@/lib/types";
import { initialSessions, sampleScanReport } from "@/lib/mock-data";
import { apiClient } from "@/lib/api-client";
import { getCurrentTimestamp, isValidUrl, normalizeUrl } from "@/lib/utils";

export function useHackFix(onToast: (msg: string, type?: "info" | "success" | "warning" | "error") => void) {
  const [sessions, setSessions] = useState<ChatSession[]>(initialSessions);
  const [activeSessionId, setActiveSessionId] = useState<string>("session-today-01");
  const [urlInput, setUrlInput] = useState<string>("");
  const [messageInput, setMessageInput] = useState<string>("");

  const [attachedZip, setAttachedZip] = useState<File | null>(null);
  const [githubRepo, setGithubRepo] = useState<string>("");
  const [isScanning, setIsScanning] = useState<boolean>(false);

  // Executive Breach Simulation state
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationModalOpen, setSimulationModalOpen] = useState<boolean>(false);
  const [currentSimulation, setCurrentSimulation] = useState<AttackSimulation | null>(null);

  // Ownership verification modal state
  const [ownershipModalOpen, setOwnershipModalOpen] = useState<boolean>(false);
  const [pendingScanUrl, setPendingScanUrl] = useState<string>("");
  const [pendingAction, setPendingAction] = useState<"scan" | "simulate">("scan");

  // Window drag & drop overlay state
  const [isDraggingOverWindow, setIsDraggingOverWindow] = useState<boolean>(false);

  // Settings modal
  const [settingsModalOpen, setSettingsModalOpen] = useState<boolean>(false);
  const [fastApiUrl, setFastApiUrl] = useState<string>("");

  // Mobile sidebar drawer
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  // Active session helper
  const activeSession = sessions.find((s) => s.id === activeSessionId) || sessions[0];

  // Drag and drop event listeners on window
  useEffect(() => {
    let dragCounter = 0;

    const handleDragEnter = (e: DragEvent) => {
      e.preventDefault();
      dragCounter++;
      if (e.dataTransfer?.types.includes("Files")) {
        setIsDraggingOverWindow(true);
      }
    };

    const handleDragLeave = (e: DragEvent) => {
      e.preventDefault();
      dragCounter--;
      if (dragCounter <= 0) {
        setIsDraggingOverWindow(false);
        dragCounter = 0;
      }
    };

    const handleDragOver = (e: DragEvent) => {
      e.preventDefault();
    };

    const handleDrop = (e: DragEvent) => {
      e.preventDefault();
      dragCounter = 0;
      setIsDraggingOverWindow(false);

      const files = e.dataTransfer?.files;
      if (files && files.length > 0) {
        onToast("Source-code ZIP scanning is coming soon. Please enter a website URL to scan.", "info");
      }
    };

    window.addEventListener("dragenter", handleDragEnter);
    window.addEventListener("dragleave", handleDragLeave);
    window.addEventListener("dragover", handleDragOver);
    window.addEventListener("drop", handleDrop);

    return () => {
      window.removeEventListener("dragenter", handleDragEnter);
      window.removeEventListener("dragleave", handleDragLeave);
      window.removeEventListener("dragover", handleDragOver);
      window.removeEventListener("drop", handleDrop);
    };
  }, [onToast]);

  // Keyboard shortcut: Cmd/Ctrl + K for new scan
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        handleNewScan();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleNewScan = useCallback(() => {
    const newId = `session-${Date.now().toString(36)}`;
    const newSession: ChatSession = {
      id: newId,
      title: "New security scan",
      updatedAt: "Just now",
      group: "today",
      messages: [],
    };

    setSessions((prev) => [newSession, ...prev]);
    setActiveSessionId(newId);
    setUrlInput("");
    setMessageInput("");
    setAttachedZip(null);
    setGithubRepo("");
    onToast("Started a new scan session", "info");
  }, [onToast]);

  const handleSelectSession = useCallback((id: string) => {
    setActiveSessionId(id);
    const targetSession = sessions.find((s) => s.id === id);
    if (targetSession?.targetUrl) {
      setUrlInput(targetSession.targetUrl);
    }
  }, [sessions]);

  const handleRenameSession = useCallback((id: string, newTitle: string) => {
    setSessions((prev) =>
      prev.map((s) => (s.id === id ? { ...s, title: newTitle } : s))
    );
    onToast("Scan renamed", "info");
  }, [onToast]);

  const handleDeleteSession = useCallback((id: string) => {
    setSessions((prev) => {
      const remaining = prev.filter((s) => s.id !== id);
      if (remaining.length === 0) {
        const fresh: ChatSession = {
          id: `session-${Date.now().toString(36)}`,
          title: "New security scan",
          updatedAt: "Just now",
          group: "today",
          messages: [],
        };
        setActiveSessionId(fresh.id);
        return [fresh];
      }
      if (activeSessionId === id) {
        setActiveSessionId(remaining[0].id);
      }
      return remaining;
    });
    onToast("Scan deleted", "info");
  }, [activeSessionId, onToast]);

  // Execute scan execution logic
  // Execute scan execution logic
  const executeScan = async (
    rawTargetUrl: string,
    promptText?: string,
    triggerSimulationAfterScan: boolean = false
  ) => {
    const targetUrl = normalizeUrl(rawTargetUrl);
    setIsScanning(true);
    const time = getCurrentTimestamp();
    const scanningMsgId = `msg-scan-${Date.now()}`;

    // 1. Add user message
    const userMsgText = promptText
      ? `${promptText}\nTarget: ${targetUrl}`
      : triggerSimulationAfterScan
      ? `Simulate adversary attack path for ${targetUrl}`
      : `Scan ${targetUrl} for security vulnerabilities`;

    const userMsg: ChatMessageType = {
      id: `msg-user-${Date.now()}`,
      sender: "user",
      text: userMsgText,
      timestamp: time,
    };

    // 2. Initial in-progress scan report for immediate UI rendering
    const initialReport: ScanReport = {
      id: `scan-progress-${Date.now().toString(36)}`,
      targetUrl,
      hasSourceZip: !!attachedZip,
      githubRepo: githubRepo.trim() || undefined,
      ownershipVerified: true,
      stepper: {
        find: "running",
        prove: "pending",
        fix: "pending",
      },
      logs: [
        {
          id: `log-${Date.now()}-1`,
          timestamp: time,
          level: "info",
          message: `Autonomous security scan initiated for ${targetUrl}`,
        },
      ],
      riskScore: 0,
      verdict: "Scanning target application and analyzing security posture...",
      findings: [],
      status: "running",
      summaryMarkdown: `Security assessment in progress for **${targetUrl}**...`,
      createdAt: time,
    };

    const initialAssistantMsg: ChatMessageType = {
      id: scanningMsgId,
      sender: "assistant",
      text: `Initiating autonomous security assessment for **${targetUrl}**...`,
      timestamp: time,
      scanReport: initialReport,
    };

    // IMMEDIATELY update session with user message and in-progress scan!
    setSessions((prev) =>
      prev.map((s) => {
        if (s.id === activeSessionId) {
          let sessionTitle = targetUrl;
          try {
            sessionTitle = new URL(targetUrl).hostname || targetUrl;
          } catch {
            sessionTitle = targetUrl;
          }
          return {
            ...s,
            title: sessionTitle,
            targetUrl,
            ownershipVerified: true,
            messages: [...s.messages, userMsg, initialAssistantMsg],
          };
        }
        return s;
      })
    );
    setMessageInput("");

    try {
      const report = await apiClient.startScan({
        targetUrl,
        githubRepo: githubRepo.trim() || undefined,
        zipFile: attachedZip,
        ownershipVerified: true,
        prompt: promptText,
        onProgress: (progressReport) => {
          // Live update the stepper and logs as each phase progresses!
          setSessions((prev) =>
            prev.map((s) => {
              if (s.id !== activeSessionId) return s;
              return {
                ...s,
                activeScanId: progressReport.id,
                messages: s.messages.map((m) =>
                  m.id === scanningMsgId
                    ? {
                        ...m,
                        scanReport: progressReport,
                        text: progressReport.status === "completed"
                          ? `I completed the security assessment for **${targetUrl}**. ${
                              githubRepo.trim()
                                ? `Because you linked GitHub repo **${githubRepo.trim()}**, I correlated repository architecture with active security probes.`
                                : "Live endpoints and passive security headers were evaluated."
                            }\n\nHere are the findings and proof of concept validations.`
                          : `Scanning **${targetUrl}** — Stage: **${
                              progressReport.stepper.fix === "running" ? "FIX" :
                              progressReport.stepper.prove === "running" ? "PROVE" : "FIND"
                            }**...`,
                      }
                    : m
                ),
              };
            })
          );
        },
      });

      // Finalize the assistant message with complete findings and quick replies
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id !== activeSessionId) return s;
          return {
            ...s,
            activeScanId: report.id,
            messages: s.messages.map((m) =>
              m.id === scanningMsgId
                ? {
                    ...m,
                    scanReport: report,
                    text: `I completed the security assessment for **${targetUrl}**. ${
                      githubRepo.trim()
                        ? `Because you linked GitHub repo **${githubRepo.trim()}**, I correlated repository architecture with active security probes.`
                        : "Live endpoints and passive security headers were evaluated."
                    }\n\nHere are the findings and proof of concept validations.`,
                    quickReplies: [
                      "What are the biggest threats?",
                      "Explain this finding simply",
                      "Show me the fix",
                      "What should I fix first?",
                    ],
                  }
                : m
            ),
          };
        })
      );

      onToast("Security scan completed", "success");

      // ONLY trigger simulation if explicitly requested!
      if (triggerSimulationAfterScan) {
        await handleRunSimulation(report.id, undefined, targetUrl, report.findings);
      }
    } catch (err: any) {
      setSessions((prev) =>
        prev.map((s) => {
          if (s.id !== activeSessionId) return s;
          return {
            ...s,
            messages: s.messages.map((m) =>
              m.id === scanningMsgId
                ? {
                    ...m,
                    text: `Scan could not complete: ${err.message || "Connection timeout"}. Please verify target URL is reachable.`,
                    scanReport: m.scanReport
                      ? { ...m.scanReport, status: "failed" }
                      : undefined,
                  }
                : m
            ),
          };
        })
      );
      onToast(err.message || "Scan failed to execute", "error");
    } finally {
      setIsScanning(false);
    }
  };

  // Explicit start scan action (Standard scan only - NO simulation)
  const handleStartScan = (targetUrlOverride?: string) => {
    const rawTarget = (targetUrlOverride || urlInput).trim();
    if (!rawTarget) {
      onToast("Please enter a website URL to scan (e.g. https://your-site.com)", "warning");
      return;
    }
    if (!isValidUrl(rawTarget)) {
      onToast("Please enter a valid website URL or domain (e.g. youtube.com or https://your-site.com)", "error");
      return;
    }
    const target = normalizeUrl(rawTarget);
    if (!activeSession?.ownershipVerified) {
      setPendingScanUrl(target);
      setPendingAction("scan");
      setOwnershipModalOpen(true);
      return;
    }
    executeScan(target, undefined, false);
  };

  // Explicit simulate attack path action (Triggers attack simulation)
  const handleSimulateAttack = async (targetUrlOverride?: string) => {
    const rawTarget = (targetUrlOverride || urlInput).trim();

    // If scan already completed for current target, run simulation immediately
    if (activeSession?.activeScanId && (!rawTarget || normalizeUrl(rawTarget) === activeSession?.targetUrl)) {
      await handleRunSimulation(activeSession.activeScanId);
      return;
    }

    if (!rawTarget) {
      onToast("Please enter a website URL to simulate attack path", "warning");
      return;
    }
    if (!isValidUrl(rawTarget)) {
      onToast("Please enter a valid website URL or domain (e.g. youtube.com or https://your-site.com)", "error");
      return;
    }

    const target = normalizeUrl(rawTarget);
    if (!activeSession?.ownershipVerified) {
      setPendingScanUrl(target);
      setPendingAction("simulate");
      setOwnershipModalOpen(true);
      return;
    }

    await executeScan(target, undefined, true);
  };

  // Submit action from composer (Enter or Send button)
  const handleComposerSubmit = () => {
    const trimmedMessage = messageInput.trim();
    const trimmedUrl = urlInput.trim();

    // Priority 1: If user typed a message, ALWAYS SEND AS CHAT MESSAGE!
    // Never trigger a slow website re-scan when the user is chatting with AI.
    if (trimmedMessage) {
      handleSendChatMessage(trimmedMessage);
      return;
    }

    // Priority 2: If message is empty, but URL is provided, start standard scan
    if (trimmedUrl && isValidUrl(trimmedUrl)) {
      handleStartScan(trimmedUrl);
      return;
    }
  };

  // Confirm ownership modal
  const handleConfirmOwnership = () => {
    setOwnershipModalOpen(false);
    const shouldSimulate = pendingAction === "simulate";
    executeScan(pendingScanUrl, messageInput.trim() || undefined, shouldSimulate);
  };

  // Chat message send
  const handleSendChatMessage = async (text: string) => {
    const time = getCurrentTimestamp();
    const userMsg: ChatMessageType = {
      id: `msg-user-${Date.now()}`,
      sender: "user",
      text,
      timestamp: time,
    };

    // Instant append of user message
    setSessions((prev) =>
      prev.map((s) =>
        s.id === activeSessionId
          ? { ...s, messages: [...s.messages, userMsg] }
          : s
      )
    );
    setMessageInput("");

    try {
      const response = await apiClient.sendChatMessage({
        sessionId: activeSessionId,
        scanId: activeSession?.activeScanId,
        message: text,
      });

      const assistantMsg: ChatMessageType = {
        id: `msg-assistant-${Date.now()}`,
        sender: "assistant",
        text: response.reply,
        timestamp: getCurrentTimestamp(),
        quickReplies: response.quickReplies,
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? { ...s, messages: [...s.messages, assistantMsg] }
            : s
        )
      );
    } catch (err: any) {
      onToast(err.message || "Failed to get reply", "error");
    }
  };

  // Executive Breach Simulation
  const handleRunSimulation = async (
    scanIdOverride?: string,
    appliedDefensesOverride?: string[],
    targetUrlOverride?: string,
    findingsOverride?: Finding[]
  ) => {
    const targetScanId = scanIdOverride || activeSession?.activeScanId;

    // Locate the active scan report in the current session
    const currentReport = activeSession?.messages
      ?.slice()
      ?.reverse()
      ?.find((m) => m.scanReport)?.scanReport;

    const targetUrl = targetUrlOverride || activeSession?.targetUrl || urlInput.trim();
    const findings = findingsOverride || currentReport?.findings || [];

    if (!targetUrl || !targetScanId) {
      onToast("Please enter a website link and run a scan first before launching AI adversary simulation.", "warning");
      return;
    }

    setIsSimulating(true);
    try {
      const sim = await apiClient.simulateAttack({
        scanId: targetScanId,
        targetUrl,
        githubRepo: githubRepo.trim() || undefined,
        findings,
        appliedDefenses: appliedDefensesOverride,
      });
      setCurrentSimulation(sim);
      setSimulationModalOpen(true);

      const simMessage: ChatMessageType = {
        id: `msg-sim-${Date.now()}`,
        sender: "assistant",
        text: `### ⚡ Executive Breach & Threat Simulation (${sim.riskLevel} Threat Level)\n\n**Target:** \`${sim.targetUrl}\`\n\n${sim.executiveSummary}\n\n**Boardroom Recommendation:** ${sim.boardroomTakeaway}`,
        timestamp: getCurrentTimestamp(),
        simulation: sim,
        quickReplies: [
          "Explain Step 2 of the kill chain",
          "What is the financial liability?",
          "Show me the patch for this attack path",
        ],
      };

      setSessions((prev) =>
        prev.map((s) =>
          s.id === activeSessionId
            ? { ...s, messages: [...s.messages, simMessage] }
            : s
        )
      );

      onToast("Executive attack path simulation generated", "success");
    } catch (err: any) {
      onToast(err.message || "Failed to generate simulation", "error");
    } finally {
      setIsSimulating(false);
    }
  };

  // Suggestion card clicked from empty state
  const handleSelectSuggestion = (suggestion: { url?: string; prompt: string }) => {
    if (suggestion.url) {
      setUrlInput(suggestion.url);
    }
    setMessageInput(suggestion.prompt);
  };

  return {
    sessions,
    activeSessionId,
    activeSession,
    urlInput,
    setUrlInput,
    messageInput,
    setMessageInput,
    attachedZip,
    setAttachedZip,
    githubRepo,
    setGithubRepo,
    isScanning,
    isSimulating,
    simulationModalOpen,
    setSimulationModalOpen,
    currentSimulation,
    setCurrentSimulation,
    handleRunSimulation,
    handleSimulateAttack,
    ownershipModalOpen,
    setOwnershipModalOpen,
    pendingScanUrl,
    isDraggingOverWindow,
    settingsModalOpen,
    setSettingsModalOpen,
    fastApiUrl,
    setFastApiUrl,
    isMobileSidebarOpen,
    setIsMobileSidebarOpen,
    handleNewScan,
    handleSelectSession,
    handleRenameSession,
    handleDeleteSession,
    handleStartScan,
    handleComposerSubmit,
    handleConfirmOwnership,
    handleSendChatMessage,
    handleSelectSuggestion,
  };
}

