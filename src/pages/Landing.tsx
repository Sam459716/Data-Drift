import { useState } from "react";
import type { Role } from "../data/mockData";

interface Props {
  onLogin: (role: Role) => void;
  onPublicVerify: () => void;
  onPublicPortal: () => void;
  onPresentation?: () => void;
}

const ROLE_CARDS = [
  { role: "user" as Role, title: "Business / User Portal", icon: "🏭", desc: "Register instruments, apply for verification, track applications and download certificates.", color: "from-blue-600 to-blue-800", accent: "#1e40af", creds: "rajesh@globalweigh.in / demo123" },
  { role: "officer" as Role, title: "Officer Portal", icon: "👮", desc: "Field verification, GPS inspection, evidence upload, measurement analysis and AI risk assessment.", color: "from-orange-500 to-orange-700", accent: "#c2410c", creds: "priya@lm.gov.in / officer123" },
  { role: "admin" as Role, title: "Admin Dashboard", icon: "🛡️", desc: "Full system oversight, analytics, fraud detection, audit logs and officer management.", color: "from-purple-600 to-purple-800", accent: "#7c3aed", creds: "admin@lm.gov.in / admin123" },
];

export default function Landing({ onLogin, onPublicVerify, onPublicPortal, onPresentation }: Props) {
  const [loading, setLoading] = useState<Role | null>(null);
  const [showLogin, setShowLogin] = useState<Role | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleLogin = (role: Role) => {
    setLoading(role);
    setTimeout(() => { setLoading(null); onLogin(role); }, 800);
  };

  return (
    <div className="min-h-full flex flex-col" style={{ background: "linear-gradient(135deg, #f0f4f8 0%, #e8f0fe 100%)" }}>
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white font-black text-lg shrink-0" style={{ background: "linear-gradient(135deg, #1e3a8a, #1e40af)" }}>LM</div>
            <div>
              <div className="font-bold text-gray-900 text-base" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Legal Metrology Digital Platform</div>
              <div className="text-xs text-gray-500">Government of Maharashtra — Department of Legal Metrology</div>
            </div>
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <button onClick={onPublicPortal}
              className="flex items-center gap-2 px-4 py-2 bg-teal-600 text-white rounded-lg text-sm font-medium hover:bg-teal-700 transition-all shadow-sm">
              👥 Consumer Portal
            </button>
            <button onClick={onPublicVerify}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700 transition-all shadow-sm">
              🔐 Verify Certificate
            </button>
            {onPresentation && (
              <button onClick={onPresentation}
                className="flex items-center gap-2 px-4 py-2 text-white rounded-lg text-sm font-medium transition-all shadow-sm"
                style={{ background: "linear-gradient(135deg, #1e3a8a, #0f766e)" }}>
                🎯 SIH Presentation
              </button>
            )}
            <div className="flex items-center gap-1 text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-lg border border-gray-200">
              <span>🇮🇳</span> <span>SIH 2026 — Team DataDrift</span>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-14 w-full">
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200 mb-6">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse inline-block" />
            Smart India Hackathon 2026 — Team DataDrift
          </div>
          <h1 className="text-4xl font-black text-gray-900 mb-4 leading-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            Legal Metrology<br />
            <span style={{ color: "#1e40af" }}>Digital Verification & Instrument</span><br />
            Management System
          </h1>
          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            One Instrument → One Digital Identity → Complete Lifecycle History.<br />
            AI-powered verification, fraud detection, geo-tagging and compliance analytics.
          </p>
        </div>

        {/* ── Consumer Portal Highlight Banner ── */}
        <div className="max-w-5xl mx-auto mb-10">
          <div className="bg-gradient-to-r from-teal-700 to-teal-600 rounded-2xl p-6 shadow-lg flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-start gap-4">
              <div className="text-4xl">👥</div>
              <div>
                <div className="text-white font-black text-lg" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Public Consumer Transparency Portal</div>
                <div className="text-teal-100 text-sm mt-1 max-w-lg">
                  Check if your local shop's weighing scale is government-verified. Find nearby compliant shops, file complaints anonymously, verify certificates, and track resolutions — <strong className="text-white">no login required.</strong>
                </div>
                <div className="flex gap-2 mt-3 flex-wrap">
                  {["📍 Nearby Shops", "✅ GREEN / ⚠️ YELLOW / ❌ RED Status", "📣 Anonymous Complaints", "🔍 Track Resolutions", "📊 Public Transparency Data"].map(f => (
                    <span key={f} className="text-xs px-2.5 py-1 bg-white/20 text-white rounded-full font-medium">{f}</span>
                  ))}
                </div>
              </div>
            </div>
            <button onClick={onPublicPortal}
              className="shrink-0 px-6 py-3.5 bg-white text-teal-700 rounded-xl font-black text-sm hover:bg-teal-50 transition-all shadow-md active:scale-95">
              Open Consumer Portal →
            </button>
          </div>
        </div>

        {/* Feature pills */}
        <div className="flex flex-wrap justify-center gap-2 mb-12">
          {["⚖️ Instrument Registration", "🔍 Field Verification", "🤖 AI Risk Analysis", "🚨 Fraud Detection", "🗺️ Geo-Tagging", "📊 Analytics", "🏆 Digital Certificates", "🔐 QR Verification", "📣 Complaint System", "🌐 Multi-language"].map(f => (
            <span key={f} className="px-3 py-1.5 bg-white rounded-full text-sm text-gray-600 border border-gray-200 shadow-sm font-medium">{f}</span>
          ))}
        </div>

        {/* Staff login cards */}
        <div className="text-center mb-5">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Staff Login</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {ROLE_CARDS.map(card => (
            <div key={card.role} className="bg-white rounded-2xl shadow-md border border-gray-200 overflow-hidden hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
              <div className={`bg-gradient-to-br ${card.color} p-6 text-white`}>
                <div className="text-4xl mb-3">{card.icon}</div>
                <h2 className="text-xl font-bold mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{card.title}</h2>
                <p className="text-white/80 text-sm">{card.desc}</p>
              </div>
              <div className="p-5">
                <div className="bg-gray-50 rounded-lg p-3 mb-4 border border-gray-100">
                  <div className="text-xs text-gray-400 font-medium mb-1">Demo Credentials</div>
                  <code className="text-xs text-gray-600" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{card.creds}</code>
                </div>
                {showLogin === card.role ? (
                  <div className="space-y-2">
                    <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400" />
                    <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Password" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400" />
                    <div className="flex gap-2">
                      <button onClick={() => handleLogin(card.role)} className="flex-1 py-2 rounded-lg text-white text-sm font-semibold transition-all" style={{ background: card.accent }}>
                        {loading === card.role ? "Logging in…" : "Login"}
                      </button>
                      <button onClick={() => setShowLogin(null)} className="px-3 py-2 rounded-lg border border-gray-200 text-sm text-gray-600 hover:bg-gray-50">✕</button>
                    </div>
                  </div>
                ) : (
                  <button onClick={() => handleLogin(card.role)} disabled={loading !== null}
                    className="w-full py-2.5 rounded-xl text-white text-sm font-semibold transition-all shadow-md hover:shadow-lg active:scale-95"
                    style={{ background: `linear-gradient(135deg, ${card.accent}, ${card.accent}dd)` }}>
                    {loading === card.role ? (
                      <span className="flex items-center justify-center gap-2">
                        <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" />
                        Logging in…
                      </span>
                    ) : `Enter as ${card.role.charAt(0).toUpperCase() + card.role.slice(1)}`}
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Stats bar */}
        <div className="mt-12 bg-white rounded-2xl border border-gray-200 shadow-sm p-6 max-w-5xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center divide-x divide-gray-100">
            {[
              { val: "4,218", label: "Shops Listed" },
              { val: "11,842", label: "Instruments Tracked" },
              { val: "81.1%", label: "Compliance Rate" },
              { val: "6 Districts", label: "Maharashtra Coverage" },
              { val: "3.4 Days", label: "Avg. Resolution Time" },
            ].map(s => (
              <div key={s.label} className="px-4">
                <div className="text-2xl font-black text-blue-700" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{s.val}</div>
                <div className="text-xs text-gray-500 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <footer className="mt-auto border-t border-gray-200 bg-white py-4 text-center text-xs text-gray-400">
        Legal Metrology Digital Verification & Instrument Management System — Team DataDrift · SIH 2026 · Maharashtra
      </footer>
    </div>
  );
}
