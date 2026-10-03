import React, { useState } from "react";
import type { Role, Lang } from "../data/mockData";
import { DEMO_USERS, NOTIFICATIONS } from "../data/mockData";
import { t } from "../data/translations";
import InstructionBox from "./InstructionBox";

interface NavItem { key: string; label: string; icon: string; }

const USER_NAV: NavItem[] = [
  { key: "dashboard", label: "dashboard", icon: "🏠" },
  { key: "instruments", label: "instruments", icon: "⚖️" },
  { key: "register", label: "register", icon: "➕" },
  { key: "applications", label: "applications", icon: "📋" },
  { key: "payments", label: "payments", icon: "💳" },
  { key: "inspections", label: "inspections", icon: "🔍" },
  { key: "certificates", label: "certificates", icon: "🏆" },
  { key: "instrumentPassport", label: "instrumentPassport", icon: "🗂️" },
  { key: "complaints", label: "complaints", icon: "📣" },
  { key: "complianceCenter", label: "complianceCenter", icon: "🛡️" },
  { key: "aiAssistant", label: "aiAssistant", icon: "🤖" },
  { key: "notifications", label: "notifications", icon: "🔔" },
  { key: "profile", label: "profile", icon: "👤" },
];

const OFFICER_NAV: NavItem[] = [
  { key: "dashboard", label: "dashboard", icon: "🏠" },
  { key: "myAssignments", label: "myAssignments", icon: "📋" },
  { key: "scanInstrument", label: "scanInstrument", icon: "📷" },
  { key: "fieldVerification", label: "fieldVerification", icon: "🔍" },
  { key: "instrumentHistory", label: "instrumentHistory", icon: "📜" },
  { key: "measurementAnalysis", label: "measurementAnalysis", icon: "📊" },
  { key: "fraudDetection", label: "fraudDetection", icon: "🚨" },
  { key: "geoMap", label: "geoMap", icon: "🗺️" },
  { key: "certificates", label: "certificates", icon: "🏆" },
  { key: "complaints", label: "complaints", icon: "📣" },
  { key: "aiAssistant", label: "aiAssistant", icon: "🤖" },
  { key: "notifications", label: "notifications", icon: "🔔" },
  { key: "profile", label: "profile", icon: "👤" },
];

const ADMIN_NAV: NavItem[] = [
  { key: "dashboard", label: "dashboard", icon: "🏠" },
  { key: "users", label: "users", icon: "👥" },
  { key: "officers", label: "officers", icon: "👮" },
  { key: "instruments", label: "instruments", icon: "⚖️" },
  { key: "applications", label: "applications", icon: "📋" },
  { key: "inspections", label: "inspections", icon: "🔍" },
  { key: "payments", label: "payments", icon: "💳" },
  { key: "certificates", label: "certificates", icon: "🏆" },
  { key: "complaints", label: "complaints", icon: "📣" },
  { key: "fraudDetection", label: "fraudDetection", icon: "🚨" },
  { key: "antiGaming", label: "antiGaming", icon: "🛡️" },
  { key: "analytics", label: "analytics", icon: "📈" },
  { key: "advancedAnalytics", label: "advancedAnalytics", icon: "🔬" },
  { key: "auditLogs", label: "auditLogs", icon: "📜" },
  { key: "aiAssistant", label: "aiAssistant", icon: "🤖" },
  { key: "notifications", label: "notifications", icon: "🔔" },
  { key: "settings", label: "settings", icon: "⚙️" },
];

interface LayoutProps {
  role: Role;
  lang: Lang;
  currentPage: string;
  onPageChange: (page: string) => void;
  onLangChange: (lang: Lang) => void;
  onLogout: () => void;
  onOpenInstructions?: () => void;
  children: React.ReactNode;
}

export default function Layout({ role, lang, currentPage, onPageChange, onLangChange, onLogout, onOpenInstructions, children }: LayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [showProfile, setShowProfile] = useState(false);
  const [showInstructions, setShowInstructions] = useState(
    () => localStorage.getItem("datadrift_instructions_dismissed") !== "true",
  );
  const user = DEMO_USERS[role];
  const unread = NOTIFICATIONS.filter(n => !n.read).length;
  const navItems = role === "user" ? USER_NAV : role === "officer" ? OFFICER_NAV : ADMIN_NAV;

  const roleBadge = { user: "Business", officer: "Officer", admin: "Admin" }[role];
  const roleBadgeColor = { user: "bg-green-100 text-green-800", officer: "bg-orange-100 text-orange-800", admin: "bg-purple-100 text-purple-800" }[role];

  const dismissInstructions = () => {
    localStorage.setItem("datadrift_instructions_dismissed", "true");
    setShowInstructions(false);
  };

  const reopenInstructions = () => {
    if (onOpenInstructions) {
      onOpenInstructions();
    } else {
      localStorage.removeItem("datadrift_instructions_dismissed");
      setShowInstructions(true);
    }
    setShowProfile(false);
  };

  return (
    <div className="flex h-full" style={{ fontFamily: "'Inter', sans-serif" }}>
      {/* Sidebar */}
      <div
        className={`flex flex-col transition-all duration-300 shrink-0 ${collapsed ? "w-16" : "w-60"}`}
        style={{ background: "linear-gradient(180deg, #1e3a8a 0%, #1e40af 100%)", minHeight: "100vh" }}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-blue-700">
          <div className="w-9 h-9 rounded-lg bg-white/20 flex items-center justify-center text-white font-bold text-sm shrink-0">LM</div>
          {!collapsed && (
            <div>
              <div className="text-white font-bold text-xs leading-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Legal Metrology</div>
              <div className="text-blue-200 text-[10px]">Digital Platform</div>
            </div>
          )}
          <button onClick={() => setCollapsed(!collapsed)} className="ml-auto text-blue-300 hover:text-white text-xs">
            {collapsed ? "▶" : "◀"}
          </button>
        </div>

        {/* User info */}
        {!collapsed && (
          <div className="px-4 py-3 border-b border-blue-700">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-sm font-bold">
                {user.name.charAt(0)}
              </div>
              <div className="min-w-0">
                <div className="text-white text-xs font-semibold truncate">{user.name}</div>
                <span className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${roleBadgeColor}`}>{roleBadge}</span>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 py-2 overflow-y-auto">
          {navItems.map(item => (
            <button
              key={item.key}
              onClick={() => onPageChange(item.key)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 text-left transition-all text-sm
                ${currentPage === item.key
                  ? "bg-white/20 text-white font-semibold border-r-2 border-white"
                  : "text-blue-200 hover:bg-white/10 hover:text-white"}`}
            >
              <span className="text-base shrink-0">{item.icon}</span>
              {!collapsed && <span className="truncate">{t(lang, item.label as any)}</span>}
              {!collapsed && item.key === "notifications" && unread > 0 && (
                <span className="ml-auto bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center shrink-0">{unread}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t border-blue-700">
          <button onClick={onLogout} className={`w-full flex items-center gap-3 px-3 py-2 text-blue-200 hover:text-white hover:bg-white/10 rounded-lg text-sm transition-all`}>
            <span>🚪</span>
            {!collapsed && <span>{t(lang, "logout")}</span>}
          </button>
        </div>
      </div>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Topbar */}
        <div className="bg-white border-b border-gray-200 px-6 py-3 flex items-center gap-4 sticky top-0 z-10 shadow-sm">
          <div className="flex-1">
            <div className="flex items-center gap-2 max-w-sm bg-gray-50 rounded-lg px-3 py-1.5 border border-gray-200">
              <span className="text-gray-400 text-sm">🔍</span>
              <input className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder-gray-400" placeholder="Search instruments, applications, certificates..." />
            </div>
          </div>

          {/* Language */}
          <div className="flex items-center gap-1 bg-gray-50 rounded-lg p-1 border border-gray-200">
            {(["en", "hi", "mr"] as Lang[]).map(l => (
              <button key={l} onClick={() => onLangChange(l)}
                className={`px-2 py-1 rounded text-xs font-medium transition-all ${lang === l ? "bg-blue-700 text-white" : "text-gray-600 hover:bg-gray-200"}`}>
                {l === "en" ? "EN" : l === "hi" ? "हि" : "म"}
              </button>
            ))}
          </div>

          {/* SIH Presentation */}
          <button onClick={() => onPageChange("presentation")}
            className="text-xs px-3 py-1.5 text-white rounded-lg font-medium transition-all"
            style={{ background: "linear-gradient(135deg, #1e3a8a, #0f766e)" }}>
            🎯 Deck
          </button>

          {/* Consumer Portal */}
          <button onClick={() => onPageChange("publicPortal")}
            className="text-xs px-3 py-1.5 bg-teal-50 text-teal-700 border border-teal-200 rounded-lg hover:bg-teal-100 font-medium transition-all">
            👥 Consumer
          </button>

          {/* Public Cert Verify */}
          <button onClick={() => onPageChange("certVerify")}
            className="text-xs px-3 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg hover:bg-green-100 font-medium transition-all">
            🔐 {t(lang, "certVerify")}
          </button>

          {/* Instructions */}
          <button
            onClick={reopenInstructions}
            className="text-xs px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 font-semibold transition-all flex items-center gap-1.5"
            title="View DataDrift Welcome & Instructions"
          >
            <span>🛡️</span> Instructions
          </button>

          {/* Notifications */}
          <div className="relative">
            <button onClick={() => { setShowNotif(!showNotif); setShowProfile(false); }}
              className="w-9 h-9 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center hover:bg-gray-100 transition-all relative">
              🔔
              {unread > 0 && <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center">{unread}</span>}
            </button>
            {showNotif && (
              <div className="absolute right-0 top-11 w-80 bg-white rounded-xl shadow-xl border border-gray-200 z-50 overflow-hidden fade-in">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <span className="font-semibold text-sm text-gray-800">Notifications</span>
                  <span className="text-xs text-blue-600 cursor-pointer hover:underline">Mark all read</span>
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-gray-50">
                  {NOTIFICATIONS.map(n => (
                    <div key={n.id} className={`px-4 py-3 ${!n.read ? "bg-blue-50/40" : ""}`}>
                      <div className="flex items-start gap-2">
                        <span className="text-sm mt-0.5">{n.type === "warning" ? "⚠️" : n.type === "success" ? "✅" : n.type === "error" ? "❌" : "ℹ️"}</span>
                        <div>
                          <div className="text-xs font-semibold text-gray-800">{n.title}</div>
                          <div className="text-xs text-gray-500 mt-0.5">{n.message}</div>
                          <div className="text-[10px] text-gray-400 mt-1">{n.date}</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Profile */}
          <div className="relative">
            <button onClick={() => { setShowProfile(!showProfile); setShowNotif(false); }}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-gray-50 border border-gray-200 transition-all">
              <div className="w-7 h-7 rounded-full bg-blue-700 flex items-center justify-center text-white text-xs font-bold">{user.name.charAt(0)}</div>
              <span className="text-sm font-medium text-gray-700 max-w-[100px] truncate">{user.name.split(" ")[0]}</span>
              <span className="text-gray-400 text-xs">▼</span>
            </button>
            {showProfile && (
              <div className="absolute right-0 top-11 w-56 bg-white rounded-xl shadow-xl border border-gray-200 z-50 fade-in">
                <div className="px-4 py-3 border-b border-gray-100">
                  <div className="font-semibold text-sm text-gray-800">{user.name}</div>
                  <div className="text-xs text-gray-500">{user.email}</div>
                  <span className={`text-[10px] px-1.5 py-0.5 rounded mt-1 inline-block font-medium ${roleBadgeColor}`}>{roleBadge}</span>
                </div>
                <div className="p-2">
                  <button onClick={reopenInstructions} className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">? Instructions</button>
                  <button onClick={() => { onPageChange("profile"); setShowProfile(false); }} className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">👤 Profile</button>
                  <button onClick={() => { onPageChange("settings"); setShowProfile(false); }} className="w-full text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 rounded-lg">⚙️ Settings</button>
                  <button onClick={onLogout} className="w-full text-left px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg">🚪 Logout</button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6" style={{ background: "#f0f4f8" }}>
          {!onOpenInstructions && showInstructions && <InstructionBox onDismiss={dismissInstructions} />}
          {children}
        </div>
      </div>
    </div>
  );
}
