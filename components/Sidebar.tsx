"use client";

import React, { useState } from "react";
import {
  Shield,
  Plus,
  MoreHorizontal,
  Trash2,
  Edit2,
  Settings,
  X,
  MessageSquare,
  Check,
} from "lucide-react";
import { ChatSession } from "@/lib/types";

interface SidebarProps {
  sessions: ChatSession[];
  activeSessionId: string;
  onSelectSession: (id: string) => void;
  onNewScan: () => void;
  onDeleteSession: (id: string) => void;
  onRenameSession: (id: string, newTitle: string) => void;
  isOpenMobile: boolean;
  onCloseMobile: () => void;
  onOpenSettings: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  sessions,
  activeSessionId,
  onSelectSession,
  onNewScan,
  onDeleteSession,
  onRenameSession,
  isOpenMobile,
  onCloseMobile,
  onOpenSettings,
}) => {
  const [menuOpenId, setMenuOpenId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");

  const groups = [
    { key: "today", label: "Today" },
  ] as const;

  const handleStartRename = (session: ChatSession, e: React.MouseEvent) => {
    e.stopPropagation();
    setRenamingId(session.id);
    setRenameValue(session.title);
    setMenuOpenId(null);
  };

  const handleSaveRename = (sessionId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (renameValue.trim()) {
      onRenameSession(sessionId, renameValue.trim());
    }
    setRenamingId(null);
  };

  const handleDelete = (sessionId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    onDeleteSession(sessionId);
    setMenuOpenId(null);
  };

  const renderSessionItem = (session: ChatSession) => {
    const isActive = session.id === activeSessionId;
    const isMenuOpen = menuOpenId === session.id;
    const isRenaming = renamingId === session.id;

    if (isRenaming) {
      return (
        <form
          key={session.id}
          onSubmit={(e) => handleSaveRename(session.id, e)}
          className="flex items-center gap-1.5 px-2 py-1.5 bg-white border border-[#2563EB] rounded-lg my-1"
        >
          <input
            type="text"
            autoFocus
            value={renameValue}
            onChange={(e) => setRenameValue(e.target.value)}
            onBlur={(e) => handleSaveRename(session.id, e)}
            className="flex-1 text-xs text-[#0B1F3A] bg-transparent outline-none"
          />
          <button
            type="submit"
            className="p-1 text-[#2563EB] hover:bg-[#E3ECFA] rounded"
            aria-label="Save rename"
          >
            <Check className="w-3 h-3" />
          </button>
        </form>
      );
    }

    return (
      <div
        key={session.id}
        className={`group relative flex items-center justify-between px-3 py-2 rounded-lg text-xs cursor-pointer select-none mb-1 ${
          isActive
            ? "bg-[#E3ECFA] text-[#0F2A5C] font-semibold border border-[#D9E2F0]"
            : "text-[#0B1F3A] hover:bg-[#EAF0F8]"
        }`}
        onClick={() => {
          onSelectSession(session.id);
          onCloseMobile();
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            onSelectSession(session.id);
            onCloseMobile();
          }
        }}
        aria-selected={isActive}
      >
        <div className="flex items-center gap-2 min-w-0 flex-1 mr-1">
          <MessageSquare
            className={`w-3.5 h-3.5 shrink-0 ${
              isActive ? "text-[#0F2A5C]" : "text-[#51627A]"
            }`}
          />
          <span className="truncate">{session.title}</span>
        </div>

        {/* Hover "..." menu */}
        <div className="relative shrink-0">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpenId(isMenuOpen ? null : session.id);
            }}
            className={`p-1 rounded text-[#51627A] hover:text-[#0B1F3A] hover:bg-black/5 ${
              isMenuOpen ? "block" : "hidden group-hover:block"
            }`}
            aria-label="Options"
          >
            <MoreHorizontal className="w-3.5 h-3.5" />
          </button>

          {/* Context menu dropdown */}
          {isMenuOpen && (
            <div
              className="absolute right-0 top-full mt-1 w-28 bg-white border border-[#D9E2F0] rounded-lg shadow-card py-1 z-30"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={(e) => handleStartRename(session, e)}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[#0B1F3A] hover:bg-[#F4F7FB] text-left"
              >
                <Edit2 className="w-3 h-3 text-[#51627A]" />
                <span>Rename</span>
              </button>
              <button
                type="button"
                onClick={(e) => handleDelete(session.id, e)}
                className="w-full flex items-center gap-2 px-3 py-1.5 text-xs text-[#991B1B] hover:bg-[#FEE2E2]/50 text-left"
              >
                <Trash2 className="w-3 h-3 text-[#991B1B]" />
                <span>Delete</span>
              </button>
            </div>
          )}
        </div>
      </div>
    );
  };

  const sidebarContent = (
    <aside
      className="w-[260px] h-full flex flex-col bg-[#F4F7FB] border-r border-[#D9E2F0] select-none text-[#0B1F3A]"
      aria-label="Chat sidebar"
    >
      {/* Header: Logo and Wordmark */}
      <div className="p-4 flex items-center justify-between border-b border-[#D9E2F0]">
        <div className="flex items-center gap-2.5">
          {/* Small dark-blue logo block */}
          <div className="w-7 h-7 rounded-lg bg-[#0F2A5C] text-white flex items-center justify-center font-bold text-xs shadow-sm">
            <Shield className="w-4 h-4 text-white" />
          </div>
          <span className="font-extrabold text-sm tracking-tight text-[#0F2A5C]">
            HackFix AI
          </span>
        </div>

        {/* Mobile close button */}
        <button
          type="button"
          onClick={onCloseMobile}
          className="md:hidden p-1 rounded text-[#51627A] hover:text-[#0B1F3A]"
          aria-label="Close sidebar"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* "+ New scan" pill button */}
      <div className="p-3">
        <button
          type="button"
          onClick={() => {
            onNewScan();
            onCloseMobile();
          }}
          className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0F2A5C] hover:bg-[#0A1F47] text-white rounded-pill text-xs font-bold shadow-soft focus:outline-none focus:ring-2 focus:ring-[#2563EB]"
        >
          <Plus className="w-4 h-4" />
          <span>New scan</span>
        </button>
      </div>

      {/* Scrollable History grouped by Today / Yesterday / Previous 7 days */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-4">
        {groups.map(({ key, label }) => {
          const groupSessions = sessions.filter((s) => s.group === key);
          if (groupSessions.length === 0) return null;

          return (
            <div key={key}>
              <h5 className="text-[10px] font-bold uppercase tracking-wider text-[#51627A] px-2 mb-1.5">
                {label}
              </h5>
              <div>{groupSessions.map(renderSessionItem)}</div>
            </div>
          );
        })}
      </div>

      {/* Footer: user avatar placeholder and settings */}
      <div className="p-3 border-t border-[#D9E2F0] flex items-center justify-between bg-[#F4F7FB]">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-full bg-[#E3ECFA] text-[#0F2A5C] border border-[#D9E2F0] flex items-center justify-center font-bold text-xs">
            SH
          </div>
          <div className="min-w-0">
            <p className="text-xs font-semibold text-[#0B1F3A] truncate">
              Security Lead
            </p>
            <p className="text-[10px] text-[#51627A] truncate">
              AppSec Engineer
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={onOpenSettings}
          className="p-1.5 rounded-lg text-[#51627A] hover:text-[#0B1F3A] hover:bg-[#EAF0F8]"
          aria-label="Open settings"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </aside>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <div className="hidden md:block h-screen shrink-0">{sidebarContent}</div>

      {/* Mobile drawer with backdrop */}
      {isOpenMobile && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-[#0B1F3A]/40"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <div className="relative z-10 h-full">{sidebarContent}</div>
        </div>
      )}
    </>
  );
};

