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

export default function App() {
  const [role, setRole] = useState<Role | null>(null);
  const [page, setPage] = useState("dashboard");
  const [lang, setLang] = useState<Lang>("en");
  const [view, setView] = useState<"landing" | "public" | "certVerify" | "portal" | "presentation">("landing");

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

  if (view === "presentation") {
    return <Presentation onBack={() => setView(role ? "portal" : "landing")} />;
  }

  if (view === "public") {
    return <PublicPortal onBack={() => setView(role ? "portal" : "landing")} />;
  }

  if (view === "certVerify") {
    return <CertVerify onBack={() => setView(role ? "portal" : "landing")} />;
  }

  if (view === "landing" || !role) {
    return (
      <Landing
        onLogin={handleLogin}
        onPublicVerify={() => setView("certVerify")}
        onPublicPortal={() => setView("public")}
        onPresentation={() => setView("presentation")}
      />
    );
  }

  return (
    <Layout
      role={role}
      lang={lang}
      currentPage={page}
      onPageChange={handlePageChange}
      onLangChange={setLang}
      onLogout={handleLogout}
    >
      {role === "user" && <UserPortal page={page} lang={lang} onPageChange={handlePageChange} />}
      {role === "officer" && <OfficerPortal page={page} lang={lang} onPageChange={handlePageChange} />}
      {role === "admin" && <AdminPortal page={page} lang={lang} onPageChange={handlePageChange} />}
    </Layout>
  );
}
