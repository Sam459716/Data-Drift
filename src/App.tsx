import { useState } from "react";
import type { Role, Lang } from "./data/mockData";
import Landing from "./pages/Landing";
import CertVerify from "./pages/CertVerify";
import PublicPortal from "./portals/PublicPortal";
import Presentation from "./pages/Presentation";
import Layout from "./components/Layout";
import UserPortal from "./portals/UserPortal";
import OfficerPortal from "./portals/OfficerPortal";
import AdminPortal from "./portals/AdminPortal";
import InstructionBox from "./components/InstructionBox";

export default function App() {
  const [role, setRole] = useState<Role | null>(null);
  const [page, setPage] = useState("dashboard");
  const [lang, setLang] = useState<Lang>("en");
  const [view, setView] = useState<"landing" | "public" | "certVerify" | "portal" | "presentation">("landing");

  // Automatically trigger Welcome & InstructionBox on first application load
  const [showInstructions, setShowInstructions] = useState(() => {
    try {
      return localStorage.getItem("datadrift_instructions_dismissed") !== "true";
    } catch {
      return true;
    }
  });

  const dismissInstructions = () => {
    try {
      localStorage.setItem("datadrift_instructions_dismissed", "true");
    } catch {}
    setShowInstructions(false);
  };

  const openInstructions = () => {
    setShowInstructions(true);
  };

  const handleLogin = (r: Role) => {
    setRole(r);
    setPage("dashboard");
    setView("portal");
  };

  const handleLogout = () => {
    setRole(null);
    setPage("dashboard");
    setView("landing");
  };

  const handlePageChange = (p: string) => {
    if (p === "certVerify") { setView("certVerify"); return; }
    if (p === "publicPortal") { setView("public"); return; }
    if (p === "presentation") { setView("presentation"); return; }
    setPage(p);
  };

  return (
    <>
      {/* Non-blocking top-level Welcome & Instructions modal triggered on first application load */}
      {showInstructions && <InstructionBox onDismiss={dismissInstructions} />}

      {view === "presentation" && (
        <Presentation onBack={() => setView(role ? "portal" : "landing")} />
      )}

      {view === "public" && (
        <PublicPortal onBack={() => setView(role ? "portal" : "landing")} />
      )}

      {view === "certVerify" && (
        <CertVerify onBack={() => setView(role ? "portal" : "landing")} />
      )}

      {(view === "landing" || !role) && view !== "presentation" && view !== "public" && view !== "certVerify" && (
        <Landing
          onLogin={handleLogin}
          onPublicVerify={() => setView("certVerify")}
          onPublicPortal={() => setView("public")}
          onPresentation={() => setView("presentation")}
          onOpenInstructions={openInstructions}
        />
      )}

      {view === "portal" && role && (
        <Layout
          role={role}
          lang={lang}
          currentPage={page}
          onPageChange={handlePageChange}
          onLangChange={setLang}
          onLogout={handleLogout}
          onOpenInstructions={openInstructions}
        >
          {role === "user" && <UserPortal page={page} lang={lang} onPageChange={handlePageChange} />}
          {role === "officer" && <OfficerPortal page={page} lang={lang} onPageChange={handlePageChange} />}
          {role === "admin" && <AdminPortal page={page} lang={lang} onPageChange={handlePageChange} />}
        </Layout>
      )}
    </>
  );
}
