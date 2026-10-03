/**
 * SIH 2026 Final Presentation — Team DataDrift
 * 6 slides, full-screen, keyboard navigable.
 * Design: deep navy + blue/teal accents, glassmorphism cards, minimal text.
 */
import { useState, useEffect, useCallback } from "react";

interface Props { onBack: () => void; }

// ─── Design tokens ───────────────────────────────────────
const BG = "#060d1f";
const CARD = "rgba(255,255,255,0.06)";
const BORDER = "rgba(255,255,255,0.10)";
const BLUE = "#3b82f6";
const TEAL = "#14b8a6";
const GREEN = "#22c55e";
const AMBER = "#f59e0b";
const PURPLE = "#a78bfa";
const RED_CLAMP = "#ef4444";

// ─── Reusable glass card ─────────────────────────────────
function Glass({ children, className = "", style = {} }: { children: React.ReactNode; className?: string; style?: React.CSSProperties }) {
  return (
    <div className={`rounded-2xl border ${className}`}
      style={{ background: CARD, borderColor: BORDER, backdropFilter: "blur(12px)", ...style }}>
      {children}
    </div>
  );
}

// ─── Verified badge ──────────────────────────────────────
function VerifiedBadge({ size = "sm" }: { size?: "sm" | "md" | "lg" }) {
  const s = size === "lg" ? "text-sm px-4 py-2" : size === "md" ? "text-xs px-3 py-1.5" : "text-[10px] px-2 py-1";
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-bold ${s}`}
      style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.4)", color: "#4ade80" }}>
      <svg width="10" height="10" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
      Verified Vendor
    </span>
  );
}

// ─── Trust score ring ────────────────────────────────────
function TrustRing({ score = 94 }: { score?: number }) {
  const r = 36;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width="88" height="88" viewBox="0 0 88 88">
        <circle cx="44" cy="44" r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="8" />
        <circle cx="44" cy="44" r={r} fill="none" stroke={TEAL} strokeWidth="8"
          strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={circ / 4}
          strokeLinecap="round" style={{ filter: `drop-shadow(0 0 6px ${TEAL})` }} />
      </svg>
      <div className="absolute text-center">
        <div className="text-xl font-black text-white leading-none">{score}</div>
        <div className="text-[9px] text-white/50 font-medium">TRUST</div>
      </div>
    </div>
  );
}

// ─── Star rating ─────────────────────────────────────────
function Stars({ n = 4.8 }: { n?: number }) {
  return (
    <div className="flex items-center gap-1">
      {[1,2,3,4,5].map(i => (
        <svg key={i} width="14" height="14" viewBox="0 0 20 20" fill={i <= Math.round(n) ? AMBER : "rgba(255,255,255,0.15)"}>
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.05 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.287-3.957z" />
        </svg>
      ))}
      <span className="text-white font-bold text-sm ml-1">{n}</span>
    </div>
  );
}

// ─── QR mock ─────────────────────────────────────────────
function QRMock() {
  const cells = Array.from({ length: 7 }, (_, r) =>
    Array.from({ length: 7 }, (_, c) => {
      if ((r < 2 && c < 2) || (r < 2 && c > 4) || (r > 4 && c < 2)) return true;
      return Math.random() > 0.55;
    })
  );
  return (
    <div className="inline-grid gap-0.5 p-2 rounded-lg" style={{ background: "white", gridTemplateColumns: "repeat(7,1fr)" }}>
      {cells.flat().map((on, i) => (
        <div key={i} className="w-2.5 h-2.5 rounded-sm" style={{ background: on ? "#060d1f" : "transparent" }} />
      ))}
    </div>
  );
}

// ─── Flow arrow ──────────────────────────────────────────
function Arrow({ color = BLUE }: { color?: string }) {
  return (
    <div className="flex flex-col items-center gap-0.5 shrink-0">
      <div className="w-px h-4" style={{ background: color + "60" }} />
      <svg width="10" height="6" viewBox="0 0 10 6" fill={color}><path d="M5 6L0 0h10z" /></svg>
    </div>
  );
}

function HArrow({ color = BLUE }: { color?: string }) {
  return (
    <div className="flex items-center gap-0.5 shrink-0">
      <div className="h-px w-6" style={{ background: color + "60" }} />
      <svg width="6" height="10" viewBox="0 0 6 10" fill={color}><path d="M6 5L0 0v10z" /></svg>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// SLIDE 1 — Problem + Solution
// ══════════════════════════════════════════════════════════
function Slide1() {
  const problems = [
    { icon: "📋", text: "Manual, paper-based verification" },
    { icon: "❓", text: "No way to identify trustworthy vendors" },
    { icon: "🕶️", text: "Zero visibility into compliance history" },
    { icon: "😰", text: "Customers uncertain about instrument validity" },
    { icon: "🐌", text: "Slow, fragmented verification workflows" },
  ];

  const pipeline = [
    { label: "Vendor Registration", icon: "🏪", color: BLUE },
    { label: "Instrument Registration", icon: "⚖️", color: BLUE },
    { label: "Verification", icon: "🔍", color: TEAL },
    { label: "Digital Certificate", icon: "🏆", color: TEAL },
    { label: "QR Verification", icon: "📱", color: PURPLE },
    { label: "Customer Rating", icon: "⭐", color: AMBER },
    { label: "Trust Score", icon: "🛡️", color: GREEN },
    { label: "Higher Visibility", icon: "📈", color: GREEN },
  ];

  return (
    <div className="flex gap-8 h-full">
      {/* Left — Problem */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="mb-2 text-xs font-bold tracking-widest" style={{ color: "#ef4444" }}>THE PROBLEM</div>
        <h2 className="text-2xl font-black text-white mb-5 leading-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Legal Metrology verification<br />is <span style={{ color: "#ef4444" }}>broken</span> for the digital age.
        </h2>
        <div className="space-y-2.5">
          {problems.map((p, i) => (
            <Glass key={i} className="flex items-center gap-3 px-4 py-2.5">
              <span className="text-lg shrink-0">{p.icon}</span>
              <span className="text-white/80 text-sm">{p.text}</span>
            </Glass>
          ))}
        </div>
      </div>

      {/* Divider */}
      <div className="flex flex-col items-center justify-center gap-2">
        <div className="flex-1" style={{ width: 1, background: `linear-gradient(to bottom, transparent, ${TEAL}, transparent)` }} />
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-black" style={{ background: TEAL, color: "white" }}>→</div>
        <div className="flex-1" style={{ width: 1, background: `linear-gradient(to bottom, ${TEAL}, transparent)` }} />
      </div>

      {/* Right — Solution pipeline */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="mb-2 text-xs font-bold tracking-widest" style={{ color: TEAL }}>THE SOLUTION</div>
        <h2 className="text-2xl font-black text-white mb-5 leading-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          A Digital Verification &<br /><span style={{ color: TEAL }}>Trust Ecosystem</span>
        </h2>
        <div className="flex flex-col items-start gap-1">
          {pipeline.map((step, i) => (
            <div key={step.label} className="flex flex-col items-start">
              <Glass className="flex items-center gap-2.5 px-3 py-2 w-full">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0" style={{ background: step.color + "25", border: `1px solid ${step.color}40` }}>
                  {step.icon}
                </div>
                <span className="text-white/90 text-xs font-semibold">{step.label}</span>
              </Glass>
              {i < pipeline.length - 1 && (
                <div className="ml-3.5 w-px h-2" style={{ background: `${step.color}50` }} />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// SLIDE 2 — Ecosystem (3 roles)
// ══════════════════════════════════════════════════════════
function Slide2() {
  const roles = [
    {
      label: "USER / CONSUMER", icon: "👤", color: BLUE,
      actions: ["Scan QR code", "Verify instrument", "View vendor identity", "See verification status", "Rate verified transaction", "Prefer verified vendors"],
    },
    {
      label: "VENDOR / BUSINESS", icon: "🏪", color: TEAL,
      actions: ["Register on DataDrift", "Register instruments", "Apply for verification", "Receive Verified Badge ✅", "View ratings & Trust Score", "Track performance"],
    },
    {
      label: "OFFICER / ADMIN", icon: "👮", color: PURPLE,
      actions: ["Review applications", "Verify vendors & instruments", "Monitor compliance", "Manage certificates", "Investigate complaints", "Audit verification history"],
    },
  ];

  return (
    <div className="flex flex-col h-full justify-center">
      <div className="text-center mb-6">
        <div className="text-xs font-bold tracking-widest mb-1" style={{ color: TEAL }}>THE ECOSYSTEM</div>
        <h2 className="text-2xl font-black text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          One platform. Three roles. Complete trust chain.
        </h2>
      </div>

      <div className="grid grid-cols-3 gap-4 mb-5">
        {roles.map(role => (
          <Glass key={role.label} className="p-5" style={{ border: `1px solid ${role.color}30` }}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center text-xl" style={{ background: role.color + "20", border: `1px solid ${role.color}40` }}>
                {role.icon}
              </div>
              <div className="text-xs font-black tracking-wider" style={{ color: role.color }}>{role.label}</div>
            </div>
            <div className="space-y-1.5">
              {role.actions.map(a => (
                <div key={a} className="flex items-center gap-2 text-xs text-white/70">
                  <div className="w-1 h-1 rounded-full shrink-0" style={{ background: role.color }} />
                  {a}
                </div>
              ))}
            </div>
          </Glass>
        ))}
      </div>

      {/* Verified vs Unverified */}
      <div className="grid grid-cols-2 gap-4">
        <Glass className="p-4 flex items-center gap-4" style={{ border: `1px solid ${GREEN}40`, background: "rgba(34,197,94,0.08)" }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0" style={{ background: GREEN + "20" }}>🏪</div>
          <div>
            <VerifiedBadge size="md" />
            <div className="text-white/60 text-xs mt-1">Certificate valid · Trust Score 92 · ⭐ 4.8</div>
          </div>
          <div className="ml-auto text-right">
            <div className="text-xs font-bold text-white/40 uppercase tracking-wider mb-1">Customer sees</div>
            <div className="text-green-400 text-xs font-semibold">✓ Safe to transact</div>
          </div>
        </Glass>
        <Glass className="p-4 flex items-center gap-4" style={{ border: "1px solid rgba(239,68,68,0.3)", background: "rgba(239,68,68,0.06)" }}>
          <div className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl shrink-0" style={{ background: "rgba(239,68,68,0.15)" }}>🏪</div>
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full font-bold text-xs px-3 py-1.5" style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.4)", color: "#f87171" }}>⚠️ Unverified Vendor</span>
            <div className="text-white/40 text-xs mt-1">No certificate · Unknown status</div>
          </div>
          <div className="ml-auto text-right">
            <div className="text-xs font-bold text-white/40 uppercase tracking-wider mb-1">Customer sees</div>
            <div className="text-red-400 text-xs font-semibold">⚠️ Proceed with caution</div>
          </div>
        </Glass>
      </div>
    </div>
  );
}

// ── Anti-Gaming pipeline visual ──────────────────────────
function AntiGamingPipeline() {
  const steps = [
    { label: "Verified\nTransaction Only", icon: "✅", ok: true },
    { label: "One Txn →\nOne Review", icon: "1️⃣", ok: true },
    { label: "Pattern\nDetection", icon: "🔍", ok: true },
    { label: "Complaint\nPenalty", icon: "⚖️", ok: true },
    { label: "Officer\nReview", icon: "👮", ok: true },
  ];
  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex items-center gap-1 mb-0.5">
        <div className="text-[9px] text-white/40 font-bold tracking-widest">RATING INPUT</div>
        <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
      </div>
      {steps.map((s, i) => (
        <div key={s.label} className="flex items-center gap-1.5">
          <div className="w-5 h-5 rounded flex items-center justify-center text-[10px] shrink-0" style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.3)" }}>{s.icon}</div>
          <div className="text-[9px] text-white/60 leading-tight whitespace-pre-line">{s.label}</div>
          {i < steps.length - 1 && <div className="ml-auto text-[8px]" style={{ color: RED_CLAMP + "60" }}>↓</div>}
        </div>
      ))}
      <div className="flex items-center gap-1 mt-0.5">
        <div className="flex-1 h-px" style={{ background: "rgba(255,255,255,0.08)" }} />
        <div className="text-[9px] text-white/40 font-bold tracking-widest">TRUST SCORE OUTPUT</div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// SLIDE 3 — USP Feature Cards
// ══════════════════════════════════════════════════════════
function Slide3() {
  const topFeatures = [
    {
      n: "01", title: "Verified Vendor Badge", icon: "✅", color: GREEN,
      desc: "Officer-approved identity. Displayed publicly on every transaction point.",
      visual: <VerifiedBadge size="lg" />,
    },
    {
      n: "02", title: "Digital Certificate", icon: "🏆", color: BLUE,
      desc: "Tamper-resistant record accessible via QR. Immutable audit trail.",
      visual: <div className="flex items-center gap-2"><QRMock /><div className="text-xs text-white/60 leading-relaxed">Scan to<br />verify</div></div>,
    },
    {
      n: "03", title: "Customer Ratings", icon: "⭐", color: AMBER,
      desc: "Only verified transactions generate ratings. No fake reviews.",
      visual: <div><Stars n={4.8} /><div className="text-xs text-white/50 mt-1">from 248 verified transactions</div></div>,
    },
    {
      n: "04", title: "Trust Score", icon: "🛡️", color: TEAL,
      desc: "Ratings + Compliance + History − Complaints − Suspicious Penalties.",
      visual: <div className="flex items-center gap-3"><TrustRing score={94} /><div className="text-xs text-white/50 space-y-1"><div>✓ Valid cert</div><div>✓ Clean history</div><div>✓ No penalties</div></div></div>,
    },
    {
      n: "05", title: "Incentive Engine", icon: "📈", color: PURPLE,
      desc: "Verification creates measurable business value — incentive-driven adoption.",
      visual: (
        <div className="text-xs space-y-1 text-white/70">
          {["Verified", "Trusted", "Visible", "Preferred", "More Business"].map((s, i) => (
            <div key={s} className="flex items-center gap-1.5">
              <div className="w-1 h-1 rounded-full" style={{ background: PURPLE }} />
              <span style={{ color: i === 4 ? "#c4b5fd" : undefined, fontWeight: i === 4 ? 700 : undefined }}>{s}</span>
            </div>
          ))}
        </div>
      ),
    },
    {
      n: "06", title: "Customer Preference", icon: "👥", color: "#f97316",
      desc: "Consumers instantly distinguish verified from unverified at the point of sale.",
      visual: (
        <div className="flex flex-col gap-1.5">
          <VerifiedBadge size="sm" />
          <span className="inline-flex items-center gap-1.5 rounded-full font-bold text-[10px] px-2 py-1" style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.35)", color: "#f87171" }}>⚠️ Unverified</span>
        </div>
      ),
    },
  ];

  return (
    <div className="flex flex-col h-full justify-center">
      <div className="flex items-start gap-2 mb-3">
        <div className="flex-1">
          <div className="text-xs font-bold tracking-widest mb-0.5" style={{ color: PURPLE }}>UNIQUE VALUE PROPOSITION</div>
          <h2 className="text-xl font-black text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            DataDrift doesn't just digitize verification—{" "}
            <span style={{ color: TEAL }}>it makes verification valuable.</span>
          </h2>
        </div>
      </div>

      <div className="flex gap-3 flex-1">
        {/* 6 feature cards in 2 columns × 3 rows */}
        <div className="flex-1 grid grid-cols-2 gap-2.5">
          {topFeatures.map(f => (
            <Glass key={f.n} className="p-3" style={{ border: `1px solid ${f.color}25` }}>
              <div className="flex items-center gap-2 mb-2">
                <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0" style={{ background: f.color + "20", border: `1px solid ${f.color}40` }}>{f.icon}</div>
                <div>
                  <div className="text-[9px] font-black tracking-wider" style={{ color: f.color }}>FEATURE {f.n}</div>
                  <div className="text-white text-[11px] font-bold leading-tight">{f.title}</div>
                </div>
              </div>
              <div className="mb-2 scale-90 origin-left">{f.visual}</div>
              <div className="text-white/45 text-[9px] leading-relaxed">{f.desc}</div>
            </Glass>
          ))}
        </div>

        {/* Anti-Gaming highlight — judge-facing differentiator */}
        <div className="w-52 flex flex-col">
          <div className="rounded-2xl p-4 flex flex-col flex-1" style={{ background: `linear-gradient(160deg, rgba(239,68,68,0.12), rgba(239,68,68,0.05))`, border: `1px solid rgba(239,68,68,0.35)` }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-sm shrink-0" style={{ background: "rgba(239,68,68,0.2)", border: "1px solid rgba(239,68,68,0.4)" }}>🛡️</div>
              <div>
                <div className="text-[9px] font-black tracking-wider" style={{ color: RED_CLAMP }}>FEATURE 07</div>
                <div className="text-white text-[11px] font-bold leading-tight">Anti-Gaming &<br />Trust Engine</div>
              </div>
            </div>
            <AntiGamingPipeline />
            <div className="mt-3 rounded-xl p-2.5" style={{ background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}>
              <div className="text-[9px] text-white/60 leading-relaxed italic">
                "Not just a rating system — a <span style={{ color: RED_CLAMP, fontWeight: 700 }}>trusted reputation system</span> with safeguards against manipulation."
              </div>
            </div>
            <div className="mt-auto pt-2">
              <div className="text-[9px] font-bold tracking-wider mb-1" style={{ color: RED_CLAMP }}>TRUST SCORE FORMULA</div>
              <div className="text-[10px] text-white/70 leading-relaxed font-mono" style={{ background: "rgba(0,0,0,0.3)", padding: "6px 8px", borderRadius: 8 }}>
                = Ratings<br />
                + Compliance<br />
                + Verification History<br />
                − Complaints<br />
                − Suspicious Penalties
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// SLIDE 4 — Technical Architecture
// ══════════════════════════════════════════════════════════
function Slide4() {
  const layers = [
    {
      label: "USER INTERFACE", color: BLUE,
      items: ["Business Portal", "Officer Portal", "Admin Dashboard", "Public Consumer Portal"],
    },
    {
      label: "APPLICATION LOGIC", color: TEAL,
      items: ["Vendor Management", "Instrument Management", "Verification Engine", "Digital Certificate", "QR Verification", "Rating & Review System", "Trust Score Engine", "Incentive Engine", "Complaint Monitor"],
    },
    {
      label: "DATA LAYER", color: PURPLE,
      items: ["PostgreSQL / Supabase", "Document Storage", "Audit Logs", "Cache Layer"],
    },
    {
      label: "EXTERNAL SERVICES", color: AMBER,
      items: ["Payment Gateway", "SMS / Email Notify", "Maps API (Geo)", "AI/ML Risk Engine"],
    },
  ];

  const roles = [
    { label: "User → User Dashboard", color: BLUE, icon: "👤" },
    { label: "Vendor → Vendor Dashboard", color: TEAL, icon: "🏪" },
    { label: "Officer → Officer Dashboard", color: PURPLE, icon: "👮" },
  ];

  return (
    <div className="flex gap-6 h-full">
      {/* Architecture stack */}
      <div className="flex-1 flex flex-col justify-center gap-2">
        <div className="text-xs font-bold tracking-widest mb-2" style={{ color: TEAL }}>TECHNICAL ARCHITECTURE</div>
        {layers.map((layer, li) => (
          <div key={layer.label}>
            <Glass className="p-3" style={{ border: `1px solid ${layer.color}30` }}>
              <div className="text-[9px] font-black tracking-widest mb-2" style={{ color: layer.color }}>{layer.label}</div>
              <div className="flex flex-wrap gap-1.5">
                {layer.items.map(item => (
                  <span key={item} className="text-[10px] px-2 py-0.5 rounded-full text-white/70" style={{ background: layer.color + "15", border: `1px solid ${layer.color}25` }}>
                    {item}
                  </span>
                ))}
              </div>
            </Glass>
            {li < layers.length - 1 && (
              <div className="flex justify-center my-1">
                <svg width="10" height="8" viewBox="0 0 10 8" fill={layer.color + "60"}><path d="M5 8L0 0h10z"/></svg>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* RBAC */}
      <div className="w-56 flex flex-col justify-center">
        <div className="text-xs font-bold tracking-widest mb-3" style={{ color: PURPLE }}>ROLE-BASED ACCESS</div>
        <div className="space-y-3">
          {roles.map(r => (
            <Glass key={r.label} className="p-3 flex items-center gap-3" style={{ border: `1px solid ${r.color}30` }}>
              <div className="w-8 h-8 rounded-xl flex items-center justify-center text-lg shrink-0" style={{ background: r.color + "20" }}>{r.icon}</div>
              <div className="text-xs text-white/70 leading-tight">{r.label}</div>
            </Glass>
          ))}
        </div>
        <div className="mt-4">
          <Glass className="p-3" style={{ border: `1px solid ${BLUE}30` }}>
            <div className="text-[9px] font-black tracking-wider mb-2" style={{ color: BLUE }}>SECURITY</div>
            <div className="space-y-1">
              {["JWT Auth + RBAC", "Audit Trail", "Encrypted Storage", "API Rate Limiting"].map(s => (
                <div key={s} className="text-[10px] text-white/60 flex items-center gap-1.5">
                  <div className="w-1 h-1 rounded-full" style={{ background: BLUE }} />{s}
                </div>
              ))}
            </div>
          </Glass>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// SLIDE 5 — Workflow + Impact
// ══════════════════════════════════════════════════════════
function Slide5() {
  const flow = [
    { label: "Vendor Registration", icon: "🏪", color: BLUE },
    { label: "Instrument Registration", icon: "⚖️", color: BLUE },
    { label: "Verification", icon: "🔍", color: TEAL },
    { label: "Digital Certificate", icon: "🏆", color: TEAL },
    { label: "QR Activation", icon: "📱", color: PURPLE },
    { label: "Verified Transaction", icon: "✅", color: GREEN },
    { label: "Customer Rating", icon: "⭐", color: AMBER },
    { label: "Anti-Gaming Engine", icon: "🛡️", color: RED_CLAMP, highlight: true },
    { label: "Trust Score", icon: "📊", color: TEAL },
    { label: "Incentive", icon: "💡", color: PURPLE },
    { label: "Higher Visibility", icon: "📈", color: GREEN },
  ] as { label: string; icon: string; color: string; highlight?: boolean }[];

  const impacts = [
    {
      label: "FOR VENDORS", icon: "🏪", color: TEAL,
      steps: ["Verification", "Reputation", "Visibility", "Customer Preference", "Business Advantage"],
    },
    {
      label: "FOR USERS", icon: "👤", color: BLUE,
      steps: ["Verified Vendor", "Better Trust", "Safer Choice", "Transparent Info"],
    },
    {
      label: "FOR OFFICERS", icon: "👮", color: PURPLE,
      steps: ["Vendor Monitoring", "Compliance Visibility", "Better Mgmt", "Reduced Manual Work"],
    },
  ];

  return (
    <div className="flex flex-col h-full justify-center">
      <div className="text-center mb-5">
        <div className="text-xs font-bold tracking-widest mb-1" style={{ color: BLUE }}>END-TO-END WORKFLOW + IMPACT</div>
        <h2 className="text-xl font-black text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          From registration to trust — every step tracked, every transaction transparent.
        </h2>
      </div>

      {/* Horizontal flow */}
      <Glass className="p-4 mb-5">
        <div className="flex items-center gap-1 overflow-x-auto flex-wrap justify-center gap-y-2">
          {flow.map((step, i) => (
            <div key={step.label} className="flex items-center gap-1 shrink-0">
              <div className="flex flex-col items-center">
                <div className="w-8 h-8 rounded-lg flex items-center justify-center text-sm" style={{ background: step.color + (step.highlight ? "30" : "20"), border: `1px solid ${step.color}${step.highlight ? "70" : "40"}`, boxShadow: step.highlight ? `0 0 8px ${step.color}40` : undefined }}>{step.icon}</div>
                <div className="text-[9px] mt-1 text-center max-w-[56px] leading-tight" style={{ color: step.highlight ? step.color : "rgba(255,255,255,0.6)", fontWeight: step.highlight ? 700 : undefined }}>{step.label}</div>
              </div>
              {i < flow.length - 1 && <div className="w-3 h-px mb-4 shrink-0" style={{ background: `${flow[i].color}50` }} />}
            </div>
          ))}
        </div>
      </Glass>

      {/* Impact columns */}
      <div className="grid grid-cols-3 gap-3">
        {impacts.map(col => (
          <Glass key={col.label} className="p-4" style={{ border: `1px solid ${col.color}30` }}>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-base" style={{ background: col.color + "20" }}>{col.icon}</div>
              <div className="text-[9px] font-black tracking-wider" style={{ color: col.color }}>{col.label}</div>
            </div>
            <div className="flex flex-col gap-1">
              {col.steps.map((s, i) => (
                <div key={s} className="flex flex-col items-start">
                  <div className="text-xs text-white/80 font-medium">{s}</div>
                  {i < col.steps.length - 1 && <div className="text-[10px] ml-1" style={{ color: col.color + "90" }}>↓</div>}
                </div>
              ))}
            </div>
          </Glass>
        ))}
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// SLIDE 6 — Final Impact + USP
// ══════════════════════════════════════════════════════════
function Slide6() {
  const loopSteps = [
    { label: "Verification", icon: "🔍", angle: 270, color: TEAL },
    { label: "Customer Rating", icon: "⭐", angle: 330, color: AMBER },
    { label: "Anti-Gaming\nEngine", icon: "🛡️", angle: 30, color: RED_CLAMP },
    { label: "Trust Score", icon: "📊", angle: 90, color: TEAL },
    { label: "Visibility &\nIncentives", icon: "📈", angle: 150, color: GREEN },
    { label: "More Vendors\nAdopt", icon: "🏪", angle: 210, color: PURPLE },
  ] as { label: string; icon: string; angle: number; color: string }[];

  const R = 100;

  const indicators = [
    { label: "Verified Vendors", icon: "✅", color: GREEN },
    { label: "Verified Instruments", icon: "⚖️", color: BLUE },
    { label: "Trust Scores Issued", icon: "🛡️", color: TEAL },
    { label: "Customer Ratings", icon: "⭐", color: AMBER },
    { label: "Digital Certificates", icon: "🏆", color: PURPLE },
    { label: "QR Verifications", icon: "📱", color: "#f97316" },
  ];

  return (
    <div className="flex gap-8 h-full items-center">
      {/* Loop diagram */}
      <div className="flex flex-col items-center justify-center" style={{ minWidth: 260 }}>
        <div className="relative" style={{ width: 260, height: 260 }}>
          {/* Outer glow ring */}
          <div className="absolute inset-0 rounded-full" style={{ background: `radial-gradient(circle, ${TEAL}15 0%, transparent 70%)` }} />
          <svg className="absolute inset-0" width="260" height="260" viewBox="0 0 260 260">
            <circle cx="130" cy="130" r={R} fill="none" stroke={TEAL + "30"} strokeWidth="1.5" strokeDasharray="4 4" />
            {/* Directional arrows on the circle */}
            {[60, 120, 180, 240, 300, 0].map((deg, i) => {
              const rad = (deg * Math.PI) / 180;
              const x = 130 + R * Math.cos(rad);
              const y = 130 + R * Math.sin(rad);
              return <circle key={i} cx={x} cy={y} r="3" fill={TEAL + "60"} />;
            })}
          </svg>
          {/* Nodes */}
          {loopSteps.map((step) => {
            const rad = ((step.angle - 90) * Math.PI) / 180;
            const x = 130 + R * Math.cos(rad);
            const y = 130 + R * Math.sin(rad);
            const isAntiGaming = step.label.includes("Anti-Gaming");
            return (
              <div key={step.label} className="absolute flex flex-col items-center" style={{ left: x - 30, top: y - 30, width: 60 }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center text-base border" style={{ background: `${BG}`, borderColor: step.color + (isAntiGaming ? "90" : "50"), boxShadow: `0 0 ${isAntiGaming ? 14 : 10}px ${step.color}${isAntiGaming ? "50" : "25"}` }}>
                  {step.icon}
                </div>
                <div className="text-[9px] text-center mt-1 leading-tight font-medium whitespace-pre-line" style={{ color: isAntiGaming ? step.color : "rgba(255,255,255,0.6)" }}>{step.label}</div>
              </div>
            );
          })}
          {/* Center */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center px-2">
              <div className="text-[10px] font-black" style={{ color: TEAL }}>TRUSTED</div>
              <div className="text-[10px] font-black" style={{ color: TEAL }}>REPUTATION</div>
              <div className="text-[10px] font-black" style={{ color: TEAL }}>SYSTEM</div>
            </div>
          </div>
        </div>
        <div className="text-center mt-2">
          <div className="text-[10px] text-white/50 leading-relaxed">Anti-Gaming Engine prevents rating manipulation.<br />Incentive-driven adoption creates a <span style={{ color: TEAL }}>trusted reputation system</span>.</div>
        </div>
      </div>

      {/* Right — headline + indicators + tagline */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="mb-4">
          <div className="text-xs font-bold tracking-widest mb-2" style={{ color: TEAL }}>OUR CORE PROPOSITION</div>
          <div className="text-2xl font-black text-white leading-tight mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
            "DataDrift doesn't simply create<br />a rating system;
          </div>
          <div className="text-2xl font-black leading-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: TEAL }}>
            it creates a <span style={{ color: RED_CLAMP }}>trusted reputation</span><br />system with anti-manipulation safeguards."
          </div>
        </div>

        {/* Trust Score formula */}
        <Glass className="p-3 mb-4" style={{ border: `1px solid rgba(239,68,68,0.3)` }}>
          <div className="text-[9px] font-black tracking-widest mb-2" style={{ color: RED_CLAMP }}>ANTI-GAMING TRUST SCORE FORMULA</div>
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { label: "Ratings", sign: "+", color: AMBER },
              { label: "Verified Compliance", sign: "+", color: GREEN },
              { label: "Verification History", sign: "+", color: TEAL },
              { label: "Validated Complaints", sign: "−", color: "#f87171" },
              { label: "Suspicious Penalties", sign: "−", color: "#f87171" },
            ].map((t, i) => (
              <div key={t.label} className="flex items-center gap-1.5">
                {i > 0 && <span className="text-sm font-black" style={{ color: t.sign === "−" ? "#f87171" : GREEN }}>{t.sign}</span>}
                <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold" style={{ background: t.color + "20", border: `1px solid ${t.color}40`, color: t.color }}>{t.label}</span>
              </div>
            ))}
            <div className="ml-auto flex items-center gap-1.5">
              <span className="text-white/30 text-sm">=</span>
              <TrustRing score={94} />
            </div>
          </div>
        </Glass>

        {/* Indicators */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          {indicators.map(ind => (
            <Glass key={ind.label} className="p-2.5 text-center" style={{ border: `1px solid ${ind.color}25` }}>
              <div className="text-lg mb-0.5">{ind.icon}</div>
              <div className="text-[9px] text-white/60 leading-tight">{ind.label}</div>
            </Glass>
          ))}
        </div>

        {/* Final tagline */}
        <div className="rounded-2xl p-4 text-center" style={{ background: `linear-gradient(135deg, ${BLUE}20, ${TEAL}20)`, border: `1px solid ${TEAL}40` }}>
          <div className="text-white/50 text-xs font-semibold tracking-widest mb-1">TEAM DATADRIFT · SIH 2026</div>
          <div className="text-xl font-black text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>DataDrift</div>
          <div className="text-sm font-bold mt-0.5" style={{ color: TEAL }}>Verify. Trust. Choose Better.</div>
        </div>
      </div>
    </div>
  );
}

// ══════════════════════════════════════════════════════════
// MAIN PRESENTATION SHELL
// ══════════════════════════════════════════════════════════
const SLIDES = [
  { id: 1, title: "Problem + Solution", label: "01" },
  { id: 2, title: "The Ecosystem", label: "02" },
  { id: 3, title: "Unique Features", label: "03" },
  { id: 4, title: "Architecture", label: "04" },
  { id: 5, title: "Workflow + Impact", label: "05" },
  { id: 6, title: "Impact + USP", label: "06" },
];

const SLIDE_COMPONENTS = [Slide1, Slide2, Slide3, Slide4, Slide5, Slide6];

export default function Presentation({ onBack }: Props) {
  const [slide, setSlide] = useState(0);
  const [animating, setAnimating] = useState(false);

  const go = useCallback((dir: number) => {
    if (animating) return;
    const next = slide + dir;
    if (next < 0 || next >= SLIDES.length) return;
    setAnimating(true);
    setTimeout(() => { setSlide(next); setAnimating(false); }, 180);
  }, [slide, animating]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown") go(1);
      if (e.key === "ArrowLeft" || e.key === "ArrowUp") go(-1);
      if (e.key === "Escape") onBack();
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [go, onBack]);

  const SlideContent = SLIDE_COMPONENTS[slide];

  return (
    <div className="flex flex-col" style={{ height: "100vh", background: BG, color: "white", fontFamily: "'Inter', sans-serif", overflow: "hidden" }}>
      {/* Top bar */}
      <div className="flex items-center justify-between px-6 py-3 shrink-0" style={{ borderBottom: `1px solid ${BORDER}` }}>
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm" style={{ background: `linear-gradient(135deg, ${BLUE}, ${TEAL})`, color: "white" }}>D</div>
          <div>
            <div className="font-black text-sm text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>DataDrift</div>
            <div className="text-[10px] text-white/40">SIH 2026 Final Presentation</div>
          </div>
        </div>

        {/* Slide dots */}
        <div className="flex items-center gap-2">
          {SLIDES.map((s, i) => (
            <button key={s.id} onClick={() => { if (!animating) { setAnimating(true); setTimeout(() => { setSlide(i); setAnimating(false); }, 180); } }}
              className="flex items-center gap-1.5 transition-all"
              title={s.title}>
              <div className="rounded-full transition-all" style={{
                width: i === slide ? 24 : 8,
                height: 8,
                background: i === slide ? TEAL : "rgba(255,255,255,0.2)",
              }} />
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="text-xs text-white/40">{SLIDES[slide].title}</div>
          <button onClick={onBack} className="text-xs px-3 py-1.5 rounded-lg transition-all text-white/50 hover:text-white hover:bg-white/10" style={{ border: `1px solid ${BORDER}` }}>✕ Exit</button>
        </div>
      </div>

      {/* Slide area */}
      <div className="flex-1 overflow-hidden relative">
        {/* Slide header */}
        <div className="px-8 pt-5 pb-3 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="text-4xl font-black text-white/10" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", lineHeight: 1 }}>{SLIDES[slide].label}</div>
            <div>
              <div className="text-xs font-bold tracking-widest text-white/30 uppercase">Smart India Hackathon 2026</div>
              <div className="text-lg font-black text-white" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{SLIDES[slide].title}</div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-px h-8" style={{ background: `linear-gradient(to bottom, transparent, ${TEAL}, transparent)` }} />
            <div className="text-right">
              <div className="font-black text-sm" style={{ color: TEAL }}>DataDrift</div>
              <div className="text-[10px] text-white/30">Team DataDrift</div>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="px-8 pb-4" style={{ height: "calc(100% - 80px)", opacity: animating ? 0 : 1, transition: "opacity 0.18s ease" }}>
          <SlideContent />
        </div>
      </div>

      {/* Bottom nav */}
      <div className="flex items-center justify-between px-6 py-3 shrink-0" style={{ borderTop: `1px solid ${BORDER}` }}>
        <button onClick={() => go(-1)} disabled={slide === 0}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all disabled:opacity-20"
          style={{ border: `1px solid ${BORDER}`, color: "rgba(255,255,255,0.7)" }}>
          ← Previous
        </button>

        <div className="text-xs text-white/30">
          Use <kbd className="px-1.5 py-0.5 rounded text-white/40 bg-white/10 font-mono text-[10px]">←</kbd> <kbd className="px-1.5 py-0.5 rounded text-white/40 bg-white/10 font-mono text-[10px]">→</kbd> to navigate · <kbd className="px-1.5 py-0.5 rounded text-white/40 bg-white/10 font-mono text-[10px]">Esc</kbd> to exit
        </div>

        {slide < SLIDES.length - 1 ? (
          <button onClick={() => go(1)}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all"
            style={{ background: `linear-gradient(135deg, ${BLUE}, ${TEAL})`, color: "white" }}>
            Next →
          </button>
        ) : (
          <button onClick={onBack}
            className="flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-bold transition-all"
            style={{ background: `linear-gradient(135deg, ${GREEN}, ${TEAL})`, color: "white" }}>
            ✓ Done
          </button>
        )}
      </div>
    </div>
  );
}
