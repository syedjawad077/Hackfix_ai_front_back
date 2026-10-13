"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  ScanReport,
  ScanStepperState,
  Finding,
  ChatMessage,
  PastScanSummary,
  StepState,
} from "@/lib/types";
import {
  defaultScanReport,
  samplePastScans,
  initialFindings,
  sampleScanLogs,
} from "@/lib/mock-data";
import { isValidUrl, getCurrentTimestamp } from "@/lib/utils";
import { apiClient } from "@/lib/api-client";

export type FlowView = "setup" | "scanning" | "results";

const INITIAL_STEPPER: ScanStepperState = {
  find: "pending",
  prove: "pending",
  fix: "pending",
  verify: "pending",
};

const WELCOME_CHAT_MESSAGE: ChatMessage = {
  id: "msg-welcome-01",
  sender: "assistant",
  text:
    "Hi! I'm HackFix AI, your security testing assistant.\n\n" +
    "Enter your website address on the left and check the ownership box to run an automated check, or ask me any question about keeping your web application safe.",
  timestamp: "Just now",
};

export function useHackFixFlow(
  onToast: (msg: string, type?: "success" | "info" | "error") => void
) {
  // Current view state
  const [view, setView] = useState<FlowView>("setup");

  // Step 1: Website Link
  const [urlInput, setUrlInput] = useState("https://demo-app.hackfix-labs.dev");
  const [urlError, setUrlError] = useState<string | null>(null);

  // Step 2: ZIP File (optional)
  const [zipFile, setZipFile] = useState<File | null>(null);

  // Step 3: Ownership confirmation
  const [ownershipChecked, setOwnershipChecked] = useState(false);

  // Scanning State
  const [stepper, setStepper] = useState<ScanStepperState>(INITIAL_STEPPER);
  const [currentStepName, setCurrentStepName] = useState("Initializing safe scanner...");
  const [scanReport, setScanReport] = useState<ScanReport | null>(null);

  // Past Scans list
  const [pastScans, setPastScans] = useState<PastScanSummary[]>(samplePastScans);

  // AI Chat Helper State
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    WELCOME_CHAT_MESSAGE,
  ]);
  const [isThinking, setIsThinking] = useState(false);
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);

  // Validate URL whenever it changes
  const isUrlValid = isValidUrl(urlInput);

  const handleUrlChange = (value: string) => {
    setUrlInput(value);
    if (!value.trim()) {
      setUrlError(null);
    } else if (!isValidUrl(value)) {
      setUrlError("Please enter a valid web address starting with https:// or http://");
    } else {
      setUrlError(null);
    }
  };

  const handleUrlBlur = () => {
    if (urlInput.trim() && !isValidUrl(urlInput)) {
      setUrlError("Please enter a valid website link (e.g. https://myapp.com)");
    }
  };

  const canStartScan = isUrlValid && ownershipChecked;

  // Timer reference for simulated progression
  const scanTimerRef = useRef<NodeJS.Timeout[]>([]);

  const clearScanTimers = () => {
    scanTimerRef.current.forEach(clearTimeout);
    scanTimerRef.current = [];
  };

  // Start new scan
  const handleStartScan = async () => {
    if (!canStartScan) {
      if (!isUrlValid) {
        setUrlError("Please enter a valid website link (e.g. https://myapp.com)");
      }
      return;
    }

    clearScanTimers();
    setView("scanning");
    setStepper({
      find: "running",
      prove: "pending",
      fix: "pending",
      verify: "pending",
    });
    setCurrentStepName("FIND: Looking for weaknesses across your website...");
    onToast("Security testing started", "info");

    // Instant state step progression for smooth realistic simulation (no animation)
    const t1 = setTimeout(() => {
      setStepper({
        find: "done",
        prove: "running",
        fix: "pending",
        verify: "pending",
      });
      setCurrentStepName("PROVE: Safely checking weaknesses in isolated sandbox...");
    }, 1300);

    const t2 = setTimeout(() => {
      setStepper({
        find: "done",
        prove: "done",
        fix: "running",
        verify: "pending",
      });
      setCurrentStepName("FIX: Preparing verified code fixes and diffs...");
    }, 2600);

    const t3 = setTimeout(() => {
      setStepper({
        find: "done",
        prove: "done",
        fix: "done",
        verify: "running",
      });
      setCurrentStepName("VERIFY: Re-testing fixes to ensure zero regressions...");
    }, 3900);

    const t4 = setTimeout(async () => {
      try {
        const report = await apiClient.startScan({
          targetUrl: urlInput,
          zipFile,
          ownershipVerified: ownershipChecked,
        });

        setStepper({
          find: "done",
          prove: "done",
          fix: "done",
          verify: "done",
        });
        setScanReport(report);
        setView("results");

        // Add to past scans
        const newPastScan: PastScanSummary = {
          id: report.id,
          name: new URL(report.targetUrl).hostname,
          targetUrl: report.targetUrl,
          date: "Just now",
          riskScore: report.riskScore,
          criticalCount: report.findings.filter((f) => f.severity === "critical").length,
          highCount: report.findings.filter((f) => f.severity === "high").length,
          mediumCount: report.findings.filter((f) => f.severity === "medium").length,
          lowCount: report.findings.filter((f) => f.severity === "low").length,
          report,
        };
        setPastScans((prev) => [newPastScan, ...prev]);

        // Add assistant announcement in chat
        setChatMessages((prev) => [
          ...prev,
          {
            id: `msg-results-${Date.now()}`,
            sender: "assistant",
            text: `Scan complete for **${report.targetUrl}**!\n\nWe found **${report.findings.length} security problems** to review. Overall security score is **${report.riskScore}/100**.\n\nClick on any problem on the left to see the fix, or ask me questions about prioritizing repairs.`,
            timestamp: getCurrentTimestamp(),
          },
        ]);

        onToast("Security scan complete! Review findings below.", "success");
      } catch (err: any) {
        onToast(`Scan failed: ${err.message || "Unknown error"}`, "error");
        setView("setup");
      }
    }, 5200);

    scanTimerRef.current = [t1, t2, t3, t4];
  };

  // Skip straight to completed results (instant)
  const handleSkipToResults = async () => {
    clearScanTimers();
    try {
      const report = await apiClient.startScan({
        targetUrl: urlInput,
        zipFile,
        ownershipVerified: ownershipChecked,
      });
      setStepper({
        find: "done",
        prove: "done",
        fix: "done",
        verify: "done",
      });
      setScanReport(report);
      setView("results");
      onToast("Generated complete security report", "success");
    } catch {
      setScanReport(defaultScanReport);
      setView("results");
    }
  };

  // Select Past Scan
  const handleSelectPastScan = (scan: PastScanSummary) => {
    clearScanTimers();
    setUrlInput(scan.targetUrl);
    setScanReport(scan.report);
    setView("results");
    setChatMessages((prev) => [
      ...prev,
      {
        id: `msg-past-${Date.now()}`,
        sender: "assistant",
        text: `Loaded previous security audit for **${scan.name}** (Score: ${scan.riskScore}/100). Ask me any questions about these findings.`,
        timestamp: getCurrentTimestamp(),
      },
    ]);
    onToast(`Loaded scan for ${scan.name}`, "info");
  };

  // Reset to New Scan setup
  const handleNewScan = () => {
    clearScanTimers();
    setView("setup");
    setUrlInput("");
    setUrlError(null);
    setZipFile(null);
    setOwnershipChecked(false);
    setScanReport(null);
    setStepper(INITIAL_STEPPER);
    onToast("Ready for new scan", "info");
  };

  // Send AI chat message
  const handleSendChatMessage = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || isThinking) return;

    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: "user",
      text: trimmed,
      timestamp: getCurrentTimestamp(),
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setIsThinking(true);

    try {
      const response = await apiClient.sendChatMessage({ message: trimmed });
      const assistantMsg: ChatMessage = {
        id: `msg-assistant-${Date.now()}`,
        sender: "assistant",
        text: response.reply,
        timestamp: getCurrentTimestamp(),
      };
      setChatMessages((prev) => [...prev, assistantMsg]);
    } catch {
      const fallbackMsg: ChatMessage = {
        id: `msg-assistant-${Date.now()}`,
        sender: "assistant",
        text:
          "I encountered a temporary connection issue. You can apply the suggested fix shown on the finding card, or try asking your question again.",
        timestamp: getCurrentTimestamp(),
      };
      setChatMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsThinking(false);
    }
  };

  // Ask AI about specific finding
  const handleAskAiAboutFinding = (question: string) => {
    setIsMobileChatOpen(true);
    handleSendChatMessage(question);
  };

  useEffect(() => {
    return () => {
      clearScanTimers();
    };
  }, []);

  return {
    view,
    setView,
    urlInput,
    setUrlInput: handleUrlChange,
    urlError,
    handleUrlBlur,
    isUrlValid,
    zipFile,
    setZipFile,
    ownershipChecked,
    setOwnershipChecked,
    canStartScan,
    stepper,
    currentStepName,
    scanReport,
    pastScans,
    chatMessages,
    isThinking,
    isMobileChatOpen,
    setIsMobileChatOpen,
    handleStartScan,
    handleSkipToResults,
    handleSelectPastScan,
    handleNewScan,
    handleSendChatMessage,
    handleAskAiAboutFinding,
  };
}
