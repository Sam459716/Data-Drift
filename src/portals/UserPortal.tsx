import { useState, useRef, useEffect } from "react";
import type { Lang } from "../data/mockData";
import { INSTRUMENTS, APPLICATIONS, CERTIFICATES, COMPLAINTS, NOTIFICATIONS, INSTRUMENT_PASSPORT_TIMELINE } from "../data/mockData";
import { t } from "../data/translations";
import StatusBadge from "../components/StatusBadge";
import { chatWithAssistant, SUGGESTED_QUESTIONS, type ChatMessage } from "../services/aiService";
import { getComplianceActions, getExpiryAlerts, getWalletStats } from "../services/complianceAutopilotService";
import { calcComplianceScore, SCORE_HISTORY } from "../services/complianceScoreService";
import { calculateCostComparison, DEFAULT_INPUTS, type CostInputs } from "../services/complianceCostService";

interface Props { page: string; lang: Lang; onPageChange: (p: string) => void; }

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-white rounded-xl border border-gray-200 shadow-sm ${className}`}>{children}</div>;
}

function SectionHeader({ title, subtitle, actions }: { title: string; subtitle?: string; actions?: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between mb-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{title}</h1>
        {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
      </div>
      {actions && <div className="flex gap-2">{actions}</div>}
    </div>
  );
}

// ── Dashboard ──────────────────────────────────────────────
function UserDashboard({ onPageChange }: { onPageChange: (p: string) => void }) {
  const expiryAlerts = INSTRUMENTS.filter(i => i.status === "Expired" || i.status === "Re-verification Required");

  return (
    <div className="fade-in">
      <SectionHeader title="Business Dashboard" subtitle="Global Weigh Industries · Pune, MH" />

      {/* Expiry Alert Banner */}
      {expiryAlerts.length > 0 && (
        <div className="mb-5 bg-amber-50 border border-amber-300 rounded-xl p-4 flex items-start gap-3">
          <span className="text-xl">⚠️</span>
          <div>
            <div className="font-semibold text-amber-800 text-sm">Certificate Renewal Required</div>
            <div className="text-amber-700 text-xs mt-0.5">{expiryAlerts.length} instrument(s) need attention. <button onClick={() => onPageChange("instruments")} className="underline font-medium">View now →</button></div>
          </div>
        </div>
      )}

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Instruments", val: INSTRUMENTS.length, icon: "⚖️", color: "bg-blue-50 text-blue-700", border: "border-blue-200" },
          { label: "Verified", val: INSTRUMENTS.filter(i => i.status === "Verified").length, icon: "✅", color: "bg-green-50 text-green-700", border: "border-green-200" },
          { label: "Pending", val: INSTRUMENTS.filter(i => i.status === "Pending Verification").length, icon: "⏳", color: "bg-yellow-50 text-yellow-700", border: "border-yellow-200" },
          { label: "Expired", val: INSTRUMENTS.filter(i => i.status === "Expired").length, icon: "🔴", color: "bg-red-50 text-red-700", border: "border-red-200" },
        ].map(k => (
          <Card key={k.label} className={`p-5 border-l-4 ${k.border}`}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-2xl">{k.icon}</span>
              <span className={`text-3xl font-black ${k.color.split(" ")[1]}`}>{k.val}</span>
            </div>
            <div className="text-sm text-gray-600 font-medium">{k.label}</div>
          </Card>
        ))}
      </div>

      {/* Compliance Health Card */}
      {(() => {
        const wallet = getWalletStats();
        const score = calcComplianceScore();
        const catColor = score.total >= 90 ? "#16a34a" : score.total >= 75 ? "#2563eb" : score.total >= 50 ? "#d97706" : "#dc2626";
        const nextA = wallet.nextAction;
        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
            <Card className="p-4 border-l-4 border-blue-500">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-full flex items-center justify-center font-black text-sm" style={{ background: score.total >= 75 ? "#dcfce7" : "#fef3c7", color: catColor }}>{score.total}</div>
                <div>
                  <div className="text-xs font-black text-gray-400 tracking-widest">COMPLIANCE HEALTH</div>
                  <div className="font-bold text-sm" style={{ color: catColor }}>{score.category.toUpperCase()}</div>
                </div>
              </div>
              <div className="grid grid-cols-4 gap-1 text-center text-[10px] text-gray-500 mb-3">
                <div><div className="font-black text-gray-800 text-base">{wallet.total}</div>Total</div>
                <div><div className="font-black text-green-700 text-base">{wallet.verified}</div>Valid</div>
                <div><div className="font-black text-amber-600 text-base">{wallet.expiringSoon}</div>Expiring</div>
                <div><div className="font-black text-red-600 text-base">{wallet.expired + wallet.reverif}</div>Action</div>
              </div>
              <button onClick={() => onPageChange("complianceCenter")} className="w-full px-3 py-1.5 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-all">Manage Compliance →</button>
            </Card>
            {nextA ? (
              <Card className={`p-4 border-l-4 ${nextA.priority === "URGENT" ? "border-red-500 bg-red-50" : "border-amber-400 bg-amber-50"}`}>
                <div className="text-[10px] font-black tracking-widest text-gray-400 mb-1">NEXT ACTION</div>
                <div className="font-bold text-sm text-gray-800 mb-0.5">{nextA.instrumentType}</div>
                <div className="font-mono text-[10px] text-gray-500 mb-1">{nextA.instrumentId}</div>
                <div className="text-xs text-gray-700 mb-3">{nextA.description}</div>
                <button onClick={() => onPageChange("applications")} className={`w-full px-3 py-1.5 text-white text-xs font-semibold rounded-lg transition-all ${nextA.priority === "URGENT" ? "bg-red-600 hover:bg-red-700" : "bg-amber-600 hover:bg-amber-700"}`}>Start Renewal →</button>
              </Card>
            ) : (
              <Card className="p-4 border-l-4 border-green-500 bg-green-50">
                <div className="text-[10px] font-black tracking-widest text-gray-400 mb-2">COMPLIANCE STATUS</div>
                <div className="text-green-700 font-bold text-sm">🟢 All instruments compliant</div>
                <div className="text-xs text-green-600 mt-1">No actions required. Keep renewing on time!</div>
              </Card>
            )}
          </div>
        );
      })()}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Instruments */}
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800">My Instruments</h3>
            <button onClick={() => onPageChange("instruments")} className="text-xs text-blue-600 hover:underline">View all →</button>
          </div>
          <div className="space-y-3">
            {INSTRUMENTS.slice(0, 3).map(inst => (
              <div key={inst.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-blue-50/40 transition-all">
                <span className="text-2xl">⚖️</span>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-semibold text-gray-800 truncate">{inst.type}</div>
                  <div className="text-xs text-gray-500" style={{ fontFamily: "'JetBrains Mono', monospace" }}>{inst.id}</div>
                </div>
                <StatusBadge status={inst.status} />
              </div>
            ))}
          </div>
        </Card>

        {/* Quick Actions */}
        <Card className="p-5">
          <h3 className="font-bold text-gray-800 mb-4">Quick Actions</h3>
          <div className="space-y-2">
            {[
              { label: "Register New Instrument", icon: "➕", page: "register", color: "bg-blue-600 hover:bg-blue-700" },
              { label: "Apply for Verification", icon: "📋", page: "applications", color: "bg-green-600 hover:bg-green-700" },
              { label: "Download Certificate", icon: "📄", page: "certificates", color: "bg-purple-600 hover:bg-purple-700" },
              { label: "Submit Complaint", icon: "📣", page: "complaints", color: "bg-orange-600 hover:bg-orange-700" },
              { label: "AI Assistant", icon: "🤖", page: "aiAssistant", color: "bg-teal-600 hover:bg-teal-700" },
            ].map(a => (
              <button key={a.label} onClick={() => onPageChange(a.page)}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-white text-sm font-medium transition-all ${a.color}`}>
                <span>{a.icon}</span> {a.label}
              </button>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Applications */}
      <Card className="mt-5 p-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800">Recent Applications</h3>
          <button onClick={() => onPageChange("applications")} className="text-xs text-blue-600 hover:underline">View all →</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead><tr className="text-left text-xs text-gray-500 border-b border-gray-100">
              <th className="pb-2 pr-4 font-medium">Application ID</th>
              <th className="pb-2 pr-4 font-medium">Instrument</th>
              <th className="pb-2 pr-4 font-medium">Type</th>
              <th className="pb-2 pr-4 font-medium">Date</th>
              <th className="pb-2 font-medium">Status</th>
            </tr></thead>
            <tbody className="divide-y divide-gray-50">
              {APPLICATIONS.map(app => (
                <tr key={app.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-2.5 pr-4 font-mono text-xs text-blue-700">{app.id}</td>
                  <td className="py-2.5 pr-4 font-mono text-xs text-gray-600">{app.instrumentId}</td>
                  <td className="py-2.5 pr-4 text-gray-700">{app.type}</td>
                  <td className="py-2.5 pr-4 text-gray-500 text-xs">{app.submittedDate}</td>
                  <td className="py-2.5"><StatusBadge status={app.status} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

// ── Instruments ────────────────────────────────────────────
function InstrumentsPage({ onPageChange }: { onPageChange: (p: string) => void }) {
  const [search, setSearch] = useState("");
  const filtered = INSTRUMENTS.filter(i => i.id.includes(search) || i.type.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="fade-in">
      <SectionHeader title="My Instruments" subtitle="All registered instruments under your account"
        actions={<button onClick={() => onPageChange("register")} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all">➕ Register New</button>} />
      <Card className="p-5">
        <div className="mb-4">
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by ID or type…" className="px-3 py-2 border border-gray-200 rounded-lg text-sm w-full max-w-xs outline-none focus:border-blue-400" />
        </div>
        <div className="space-y-4">
          {filtered.map(inst => (
            <div key={inst.id} className="border border-gray-200 rounded-xl p-4 hover:border-blue-300 hover:bg-blue-50/20 transition-all">
              <div className="flex items-start justify-between flex-wrap gap-3">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-xl">⚖️</div>
                  <div>
                    <div className="font-bold text-gray-900">{inst.type}</div>
                    <div className="text-xs font-mono text-blue-700 mt-0.5">{inst.id}</div>
                    <div className="text-xs text-gray-500 mt-1">{inst.manufacturer} · {inst.model} · {inst.capacity}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <StatusBadge status={inst.status} size="md" />
                  <button onClick={() => onPageChange("instrumentPassport")} className="px-3 py-1.5 text-xs bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all">Passport</button>
                  {(inst.status === "Expired" || inst.status === "Re-verification Required") && (
                    <button onClick={() => onPageChange("applications")} className="px-3 py-1.5 text-xs bg-red-600 text-white rounded-lg hover:bg-red-700 transition-all">Re-verify</button>
                  )}
                </div>
              </div>
              <div className="mt-3 grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-gray-100">
                <div><div className="text-xs text-gray-400">Owner</div><div className="text-xs font-medium text-gray-700">{inst.owner}</div></div>
                <div><div className="text-xs text-gray-400">Location</div><div className="text-xs font-medium text-gray-700">{inst.location}</div></div>
                <div><div className="text-xs text-gray-400">Valid Until</div><div className={`text-xs font-medium ${inst.validUntil ? "text-gray-700" : "text-red-600"}`}>{inst.validUntil ?? "No Certificate"}</div></div>
                <div>
                  <div className="text-xs text-gray-400">Compliance</div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                      <div className="h-1.5 rounded-full transition-all" style={{ width: `${inst.complianceScore}%`, background: inst.complianceScore >= 75 ? "#16a34a" : inst.complianceScore >= 50 ? "#d97706" : "#dc2626" }} />
                    </div>
                    <span className="text-xs font-medium text-gray-700">{inst.complianceScore}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── Register Instrument ────────────────────────────────────
function RegisterInstrument() {
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({ type: "", serial: "", manufacturer: "", model: "", capacity: "", location: "", address: "" });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => { setSubmitted(true); };

  if (submitted) return (
    <div className="fade-in">
      <Card className="p-10 text-center max-w-lg mx-auto">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Instrument Registered!</h2>
        <div className="bg-blue-50 rounded-xl p-4 my-4 border border-blue-200">
          <div className="text-xs text-gray-500 mb-1">Your Unique Instrument ID</div>
          <div className="text-xl font-black text-blue-700 font-mono">LM-MH-PUN-000{Math.floor(Math.random() * 900 + 100)}</div>
        </div>
        <p className="text-gray-500 text-sm mb-4">Your instrument has been registered. Proceed to apply for initial verification.</p>
        <button onClick={() => setSubmitted(false)} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Register Another</button>
      </Card>
    </div>
  );

  return (
    <div className="fade-in">
      <SectionHeader title="Register Instrument" subtitle="Add a new instrument to your account" />
      <Card className="p-6 max-w-2xl">
        {/* Steps */}
        <div className="flex items-center gap-2 mb-8">
          {["Instrument Details", "Business Info", "Documents"].map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${step > i ? "bg-green-500 text-white" : step === i + 1 ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-400"}`}>{step > i ? "✓" : i + 1}</div>
              <span className={`text-xs font-medium flex-1 hidden sm:block ${step === i + 1 ? "text-blue-700" : "text-gray-400"}`}>{s}</span>
              {i < 2 && <div className={`h-0.5 w-4 ${step > i + 1 ? "bg-green-400" : "bg-gray-200"}`} />}
            </div>
          ))}
        </div>

        {step === 1 && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {[["Instrument Type *", "type", "e.g. Platform Weighing Scale"], ["Serial Number *", "serial", "e.g. WM-2024-001"], ["Manufacturer *", "manufacturer", "e.g. Avery Weigh-Tronix"], ["Model *", "model", "e.g. E1110"], ["Capacity / Range *", "capacity", "e.g. 500 kg"], ["Location *", "location", "e.g. Pune, MH"]].map(([label, key, ph]) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
                  <input value={form[key as keyof typeof form]} onChange={e => setForm({ ...form, [key]: e.target.value })} placeholder={ph} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400 focus:ring-1 focus:ring-blue-100" />
                </div>
              ))}
            </div>
            <button onClick={() => setStep(2)} className="mt-2 px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all">Next →</button>
          </div>
        )}
        {step === 2 && (
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200 text-sm text-blue-700">
              Business information will be auto-filled from your registered profile.
            </div>
            <div><label className="block text-xs font-medium text-gray-700 mb-1">Business Name</label><input defaultValue="Global Weigh Industries" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm bg-gray-50" readOnly /></div>
            <div><label className="block text-xs font-medium text-gray-700 mb-1">Business Address *</label><textarea rows={3} placeholder="Full address where instrument is installed" className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400" /></div>
            <div className="flex gap-3">
              <button onClick={() => setStep(1)} className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">← Back</button>
              <button onClick={() => setStep(3)} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">Next →</button>
            </div>
          </div>
        )}
        {step === 3 && (
          <div className="space-y-4">
            <p className="text-sm text-gray-600">Upload required documents. Accepted: PDF, JPG, PNG (max 5 MB each)</p>
            {["Manufacturer's Certificate", "Purchase Invoice", "Business Registration"].map(doc => (
              <div key={doc} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg bg-gray-50">
                <span className="text-sm text-gray-700">📄 {doc}</span>
                <button className="text-xs px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700">Upload</button>
              </div>
            ))}
            <div className="flex gap-3 mt-4">
              <button onClick={() => setStep(2)} className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">← Back</button>
              <button onClick={handleSubmit} className="px-6 py-2.5 bg-green-600 text-white rounded-lg text-sm font-medium hover:bg-green-700">✅ Submit Registration</button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

// ── Instrument Passport ────────────────────────────────────
function InstrumentPassport() {
  const inst = INSTRUMENTS[0];
  return (
    <div className="fade-in">
      <SectionHeader title="Instrument Passport" subtitle="Complete digital identity and lifecycle history" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800">Instrument Details</h3>
            <StatusBadge status={inst.status} size="md" />
          </div>
          <div className="bg-gradient-to-br from-blue-900 to-blue-700 rounded-xl p-5 text-white mb-5">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-blue-200 text-xs mb-1">Instrument ID</div>
                <div className="text-xl font-black font-mono">{inst.id}</div>
                <div className="text-blue-100 text-sm mt-2">{inst.type}</div>
              </div>
              <div className="text-right">
                <div className="text-blue-200 text-xs">Serial No.</div>
                <div className="font-mono text-sm">{inst.serial}</div>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mt-5 pt-4 border-t border-white/20">
              <div><div className="text-blue-200 text-[10px]">Owner</div><div className="text-xs font-medium mt-0.5">{inst.owner}</div></div>
              <div><div className="text-blue-200 text-[10px]">Location</div><div className="text-xs font-medium mt-0.5">{inst.location}</div></div>
              <div><div className="text-blue-200 text-[10px]">Valid Until</div><div className="text-xs font-medium mt-0.5">{inst.validUntil ?? "N/A"}</div></div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[["Manufacturer", inst.manufacturer], ["Model", inst.model], ["Capacity", inst.capacity], ["Registered", inst.registrationDate], ["Certificate", inst.certificateNo ?? "Not issued"], ["Compliance Score", `${inst.complianceScore}/100`]].map(([k, v]) => (
              <div key={k} className="bg-gray-50 rounded-lg p-3 border border-gray-100">
                <div className="text-xs text-gray-400">{k}</div>
                <div className="text-sm font-medium text-gray-800 mt-0.5">{v}</div>
              </div>
            ))}
          </div>
        </Card>

        {/* Timeline */}
        <Card className="p-5">
          <h3 className="font-bold text-gray-800 mb-4">Lifecycle Timeline</h3>
          <div className="relative pl-8 space-y-5">
            {INSTRUMENT_PASSPORT_TIMELINE.map((ev, i) => (
              <div key={i} className="relative">
                {i < INSTRUMENT_PASSPORT_TIMELINE.length - 1 && <div className="absolute left-[-20px] top-6 w-0.5 bg-gray-200 h-full" />}
                <div className={`absolute left-[-28px] top-0 w-6 h-6 rounded-full flex items-center justify-center text-xs border-2 ${ev.status === "completed" ? "bg-green-100 border-green-400" : "bg-amber-100 border-amber-400"}`}>{ev.icon}</div>
                <div className={`rounded-lg p-2.5 border text-xs ${ev.status === "completed" ? "bg-green-50 border-green-100" : "bg-amber-50 border-amber-200"}`}>
                  <div className="font-semibold text-gray-800">{ev.event}</div>
                  <div className="text-gray-500 mt-0.5">{ev.details}</div>
                  <div className="text-gray-400 mt-1 font-mono">{ev.date}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── Applications ───────────────────────────────────────────
function ApplicationsPage() {
  const [filter, setFilter] = useState("All");
  const statuses = ["All", "Submitted", "Under Review", "Scheduled", "Approved", "Certificate Generated"];
  const filtered = filter === "All" ? APPLICATIONS : APPLICATIONS.filter(a => a.status === filter);

  const WORKFLOW = ["Submitted", "Under Review", "Payment Paid", "Scheduled", "Inspection Completed", "Approved", "Certificate Generated"];

  return (
    <div className="fade-in">
      <SectionHeader title="Applications" subtitle="Track your verification applications"
        actions={<button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">+ New Application</button>} />

      <div className="flex gap-2 mb-5 flex-wrap">
        {statuses.map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === s ? "bg-blue-600 text-white" : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"}`}>{s}</button>
        ))}
      </div>

      <div className="space-y-4">
        {filtered.map(app => {
          const step = WORKFLOW.indexOf(app.status);
          return (
            <Card key={app.id} className="p-5">
              <div className="flex items-start justify-between flex-wrap gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-gray-900">{app.id}</span>
                    <StatusBadge status={app.status} />
                  </div>
                  <div className="text-xs text-gray-500 mt-1">{app.type} · {app.instrumentId}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-gray-900">₹{app.fee.toLocaleString()}</div>
                  <StatusBadge status={app.paymentStatus} />
                </div>
              </div>

              {/* Progress bar */}
              <div className="mb-4">
                <div className="flex justify-between text-[10px] text-gray-400 mb-1">
                  <span>Submitted</span><span>In Progress</span><span>Certificate</span>
                </div>
                <div className="relative h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-blue-500 to-green-500 transition-all" style={{ width: `${Math.max(5, step >= 0 ? ((step + 1) / WORKFLOW.length) * 100 : 5)}%` }} />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-gray-50 p-2 rounded border border-gray-100"><div className="text-gray-400">Submitted</div><div className="font-medium text-gray-700">{app.submittedDate}</div></div>
                <div className="bg-gray-50 p-2 rounded border border-gray-100"><div className="text-gray-400">Scheduled</div><div className="font-medium text-gray-700">{app.scheduledDate ?? "—"}</div></div>
                <div className="bg-gray-50 p-2 rounded border border-gray-100"><div className="text-gray-400">Officer</div><div className="font-medium text-gray-700">{app.officer ?? "Not assigned"}</div></div>
                <div className="bg-gray-50 p-2 rounded border border-gray-100"><div className="text-gray-400">Completed</div><div className="font-medium text-gray-700">{app.completedDate ?? "—"}</div></div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

// ── Certificates ───────────────────────────────────────────
function CertificatesPage() {
  return (
    <div className="fade-in">
      <SectionHeader title="Digital Certificates" subtitle="Download and share verified instrument certificates" />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {CERTIFICATES.map(cert => (
          <Card key={cert.id} className="overflow-hidden">
            <div className={`p-4 ${cert.status === "Valid" ? "bg-gradient-to-r from-green-700 to-green-600" : "bg-gradient-to-r from-red-700 to-red-600"} text-white`}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-green-100 text-xs mb-0.5">Certificate Number</div>
                  <div className="font-black font-mono text-sm">{cert.id}</div>
                </div>
                <div className={`px-3 py-1 rounded-full text-xs font-bold ${cert.status === "Valid" ? "bg-white text-green-700" : "bg-white text-red-700"}`}>{cert.status}</div>
              </div>
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                {[["Instrument", cert.instrumentId], ["Type", cert.instrumentType], ["Owner", cert.owner], ["Verification Date", cert.verificationDate], ["Valid Until", cert.validUntil], ["Issuing Officer", cert.officerName]].map(([k, v]) => (
                  <div key={k}><div className="text-gray-400">{k}</div><div className="font-medium text-gray-800 mt-0.5">{v}</div></div>
                ))}
              </div>
              <div className="flex gap-2">
                <button className="flex-1 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-all">📄 Download PDF</button>
                <button className="flex-1 py-2 border border-gray-200 text-gray-700 rounded-lg text-xs font-medium hover:bg-gray-50 transition-all">🔗 Share QR</button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Complaints ─────────────────────────────────────────────
function ComplaintsPage() {
  const [showForm, setShowForm] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [category, setCategory] = useState("");

  if (submitted) return (
    <div className="fade-in">
      <Card className="p-10 text-center max-w-lg mx-auto">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-xl font-bold text-gray-900 mb-2">Complaint Submitted</h2>
        <div className="bg-blue-50 rounded-xl p-4 my-4 border border-blue-200">
          <div className="text-xs text-gray-500">Your Complaint ID</div>
          <div className="text-xl font-black text-blue-700 font-mono mt-1">LM-CMP-2026-00{Math.floor(Math.random() * 900 + 100)}</div>
        </div>
        <p className="text-gray-500 text-sm mb-4">You will receive updates via email and notifications. An officer will be assigned within 48 hours.</p>
        <button onClick={() => { setSubmitted(false); setShowForm(false); }} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium">Done</button>
      </Card>
    </div>
  );

  return (
    <div className="fade-in">
      <SectionHeader title="Complaint Box" subtitle="Report meter tampering, inaccurate weights, or expired certificates"
        actions={<button onClick={() => setShowForm(!showForm)} className="px-4 py-2 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700">+ New Complaint</button>} />

      {showForm && (
        <Card className="p-5 mb-5">
          <h3 className="font-bold text-gray-800 mb-4">Submit Complaint</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Category *</label>
              <select value={category} onChange={e => setCategory(e.target.value)} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400">
                <option value="">Select category</option>
                {["Inaccurate Weighing", "Expired Certificate", "Tampered Seal", "Missing Certificate", "Incorrect Readings", "Other"].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div><label className="block text-xs font-medium text-gray-700 mb-1">Business Name *</label><input className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400" placeholder="Name of the business" /></div>
            <div><label className="block text-xs font-medium text-gray-700 mb-1">Location *</label><input className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400" placeholder="City / Area" /></div>
            <div><label className="block text-xs font-medium text-gray-700 mb-1">Instrument Type</label><input className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400" placeholder="e.g. Counter Scale" /></div>
            <div className="sm:col-span-2"><label className="block text-xs font-medium text-gray-700 mb-1">Description *</label><textarea rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400" placeholder="Describe the issue in detail…" /></div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Evidence (optional)</label>
              <input type="file" accept="image/*,.pdf" className="w-full text-xs text-gray-600 border border-gray-200 rounded-lg px-3 py-2" />
            </div>
          </div>
          <div className="flex gap-3 mt-4">
            <button onClick={() => setSubmitted(true)} className="px-6 py-2.5 bg-orange-600 text-white rounded-lg text-sm font-medium hover:bg-orange-700 transition-all">Submit Complaint</button>
            <button onClick={() => setShowForm(false)} className="px-4 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
          </div>
        </Card>
      )}

      <Card className="p-5">
        <h3 className="font-bold text-gray-800 mb-4">My Complaints</h3>
        <div className="space-y-3">
          {COMPLAINTS.map(c => (
            <div key={c.id} className="border border-gray-200 rounded-xl p-4 hover:border-blue-200 transition-all">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm text-blue-700 font-bold">{c.id}</span>
                    <StatusBadge status={c.status} />
                    <StatusBadge status={c.priority} />
                  </div>
                  <div className="text-sm font-medium text-gray-800 mt-1">{c.category} — {c.businessName}</div>
                  <div className="text-xs text-gray-500 mt-0.5">{c.description.slice(0, 100)}…</div>
                </div>
                <div className="text-xs text-gray-400 shrink-0">{c.date}</div>
              </div>
              {c.assignedOfficer && <div className="mt-2 text-xs text-gray-500">Assigned to: <span className="font-medium text-blue-700">{c.assignedOfficer}</span></div>}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── AI Assistant ───────────────────────────────────────────
function AIAssistantPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "0", role: "assistant", content: "Hello! I'm the **Legal Metrology AI Assistant**. I can help you with instrument registration, verification, certificates, complaints, and system navigation. How can I assist you today?", timestamp: new Date() }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [recording, setRecording] = useState(false);
  const [permError, setPermError] = useState(false);
  const recognition = useRef<any>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  const send = async (text?: string) => {
    const msg = text ?? input;
    if (!msg.trim()) return;
    setInput("");
    const userMsg: ChatMessage = { id: Date.now().toString(), role: "user", content: msg, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    const reply = await chatWithAssistant(msg, "user", messages);
    setMessages(prev => [...prev, { id: Date.now().toString() + "r", role: "assistant", content: reply, timestamp: new Date() }]);
    setLoading(false);
  };

  const toggleRecording = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) { setPermError(true); return; }
    if (recording) {
      recognition.current?.stop();
      setRecording(false);
      return;
    }
    const r = new SpeechRecognition();
    r.continuous = false;
    r.interimResults = true;
    r.lang = "hi-IN"; // Web Speech API handles EN/HI/MR under hi-IN on Indian devices
    r.onresult = (e: any) => {
      const t = Array.from(e.results).map((r: any) => r[0].transcript).join("");
      setInput(t);
    };
    r.onend = () => setRecording(false);
    r.onerror = (e: any) => {
      if (e.error === "not-allowed") setPermError(true);
      setRecording(false);
    };
    r.start();
    recognition.current = r;
    setRecording(true);
  };

  const renderContent = (text: string) => {
    return text.split("\n").map((line, i) => {
      const boldReplaced = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      return <p key={i} dangerouslySetInnerHTML={{ __html: boldReplaced }} className="mb-1 last:mb-0" />;
    });
  };

  return (
    <div className="fade-in h-full flex flex-col max-h-[calc(100vh-120px)]">
      <SectionHeader title="AI Assistant" subtitle="AI-powered help for Legal Metrology queries" />
      <Card className="flex-1 flex flex-col overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-100 flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-green-400 animate-pulse"></div>
          <span className="text-sm text-gray-600 font-medium">Legal Metrology AI</span>
          <span className="text-xs text-gray-400 ml-1">· Demo Mode</span>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && (
                <div className="w-7 h-7 rounded-full bg-blue-700 flex items-center justify-center text-white text-xs font-bold mr-2 shrink-0 mt-1">AI</div>
              )}
              <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${msg.role === "user" ? "bg-blue-600 text-white rounded-br-sm" : "bg-gray-100 text-gray-800 rounded-bl-sm"}`}>
                {renderContent(msg.content)}
                <div className={`text-[10px] mt-1.5 ${msg.role === "user" ? "text-blue-200 text-right" : "text-gray-400"}`}>{msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-blue-700 flex items-center justify-center text-white text-xs font-bold shrink-0">AI</div>
              <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1">
                {[0, 0.2, 0.4].map(d => <div key={d} className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: `${d}s` }} />)}
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggested questions */}
        {messages.length <= 1 && (
          <div className="px-5 pb-3 flex gap-2 flex-wrap">
            {SUGGESTED_QUESTIONS.user.map(q => (
              <button key={q} onClick={() => send(q)} className="text-xs px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-full hover:bg-blue-100 transition-all">{q}</button>
            ))}
          </div>
        )}

        {/* Input */}
        {permError && (
          <div className="mx-5 mb-2 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            Microphone permission denied. Please allow microphone access in browser settings, or type your question.
          </div>
        )}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-2 bg-gray-50 rounded-xl border border-gray-200 px-4 py-2 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-100">
            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && send()}
              placeholder="Type or 🎙️ speak in English / हिंदी / मराठी…"
              className="flex-1 bg-transparent text-sm outline-none text-gray-700 placeholder-gray-400"
            />
            {recording && (
              <div className="flex items-center gap-0.5 h-6">
                {[1, 2, 3, 4, 5].map(i => <div key={i} className="wave-bar w-1 bg-red-500 rounded-full" />)}
              </div>
            )}
            <button onClick={toggleRecording} title={recording ? "Stop recording" : "Speak your question (Hindi / English / Marathi)"}
              className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all relative shrink-0 ${recording ? "bg-red-100 text-red-600 ring-2 ring-red-300" : "bg-blue-50 text-blue-600 hover:bg-blue-100 ring-2 ring-blue-100"}`}>
              <span className="text-base leading-none">{recording ? "⏹" : "🎙️"}</span>
              {!recording && <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 rounded-full border-2 border-white animate-pulse" />}
            </button>
            <button onClick={() => send()}
              disabled={!input.trim() || loading}
              className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all text-sm">
              ➤
            </button>
          </div>
          {recording && <div className="text-xs text-center text-red-500 mt-1 animate-pulse">Listening… Click ⏹ to stop</div>}
        </div>
      </Card>
    </div>
  );
}

// ── Payments ───────────────────────────────────────────────
function PaymentsPage() {
  return (
    <div className="fade-in">
      <SectionHeader title="Payments" subtitle="Fee payments and transaction history" />
      <Card className="p-5">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-xs text-gray-500 border-b border-gray-100">
            <th className="pb-2 pr-4">Transaction ID</th>
            <th className="pb-2 pr-4">Application</th>
            <th className="pb-2 pr-4">Amount</th>
            <th className="pb-2 pr-4">Date</th>
            <th className="pb-2">Status</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-50">
            {APPLICATIONS.map(app => (
              <tr key={app.id} className="hover:bg-gray-50">
                <td className="py-3 pr-4 font-mono text-xs text-gray-600">TXN{app.id.replace("LM-APP-", "")}</td>
                <td className="py-3 pr-4 font-mono text-xs text-blue-700">{app.id}</td>
                <td className="py-3 pr-4 font-semibold">₹{app.fee.toLocaleString()}</td>
                <td className="py-3 pr-4 text-xs text-gray-500">{app.submittedDate}</td>
                <td className="py-3"><StatusBadge status={app.paymentStatus} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ── Notifications Page ─────────────────────────────────────
function NotificationsPage() {
  return (
    <div className="fade-in">
      <SectionHeader title="Notifications" />
      <Card className="p-5">
        <div className="space-y-3">
          {NOTIFICATIONS.map(n => (
            <div key={n.id} className={`flex gap-4 p-4 rounded-xl border transition-all ${!n.read ? "bg-blue-50/50 border-blue-100" : "bg-gray-50/50 border-gray-100"}`}>
              <span className="text-xl shrink-0">{n.type === "warning" ? "⚠️" : n.type === "success" ? "✅" : n.type === "error" ? "❌" : "ℹ️"}</span>
              <div className="flex-1">
                <div className="font-semibold text-sm text-gray-800">{n.title}</div>
                <div className="text-sm text-gray-600 mt-0.5">{n.message}</div>
                <div className="text-xs text-gray-400 mt-1">{n.date}</div>
              </div>
              {!n.read && <span className="w-2 h-2 bg-blue-600 rounded-full shrink-0 mt-1.5" />}
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── Profile ────────────────────────────────────────────────
function ProfilePage() {
  return (
    <div className="fade-in">
      <SectionHeader title="Business Profile" />
      <Card className="p-6 max-w-2xl">
        <div className="flex items-center gap-5 mb-6 pb-6 border-b border-gray-100">
          <div className="w-16 h-16 rounded-2xl bg-blue-700 flex items-center justify-center text-white text-2xl font-black">R</div>
          <div>
            <div className="text-xl font-bold text-gray-900">Rajesh Kumar</div>
            <div className="text-sm text-gray-500">Global Weigh Industries</div>
            <div className="mt-1 flex gap-2">
              <span className="text-xs px-2 py-0.5 bg-green-100 text-green-700 rounded-full font-medium">Verified Business</span>
              <span className="text-xs px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full font-medium">5 Instruments</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          {[["Email", "rajesh@globalweigh.in"], ["Mobile", "+91 98765 43210"], ["Business", "Global Weigh Industries"], ["GSTIN", "27AABCG1234A1Z5"], ["District", "Pune"], ["State", "Maharashtra"], ["Registration Date", "2023-01-15"], ["User ID", "USR001"]].map(([k, v]) => (
            <div key={k} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
              <div className="text-xs text-gray-400">{k}</div>
              <div className="font-medium text-gray-800 mt-0.5">{v}</div>
            </div>
          ))}
        </div>
        <button className="mt-5 px-5 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all">Edit Profile</button>
      </Card>
    </div>
  );
}

// ── Main User Portal ───────────────────────────────────────
// ── Compliance Center ─────────────────────────────────────
type CCtab = "overview" | "instruments" | "autopilot" | "cost" | "passport" | "history";

function ComplianceCenterPage({ onPageChange }: { onPageChange: (p: string) => void }) {
  const [tab, setTab] = useState<CCtab>("overview");
  const score = calcComplianceScore();
  const wallet = getWalletStats();
  const actions = getComplianceActions();
  const alerts = getExpiryAlerts();

  const tabs: { key: CCtab; label: string; icon: string }[] = [
    { key: "overview", label: "Overview", icon: "🏠" },
    { key: "instruments", label: "Instruments", icon: "⚖️" },
    { key: "autopilot", label: "Autopilot", icon: "🤖" },
    { key: "cost", label: "Cost Analysis", icon: "💰" },
    { key: "passport", label: "Passport", icon: "📘" },
    { key: "history", label: "History", icon: "📜" },
  ];

  // ── Score ring component ──
  function ScoreRing({ val, max, color, size = 80 }: { val: number; max: number; color: string; size?: number }) {
    const r = (size / 2) - 6;
    const circ = 2 * Math.PI * r;
    const dash = (val / max) * circ;
    return (
      <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f1f5f9" strokeWidth="7" />
          <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="7"
            strokeDasharray={`${dash} ${circ - dash}`} strokeDashoffset={circ / 4}
            strokeLinecap="round" style={{ filter: `drop-shadow(0 0 4px ${color}60)` }} />
        </svg>
        <div className="absolute text-center">
          <div className="font-black text-gray-900 leading-none" style={{ fontSize: size > 70 ? 22 : 13 }}>{val}</div>
          <div className="text-gray-400 leading-none" style={{ fontSize: 9 }}>/{max}</div>
        </div>
      </div>
    );
  }

  // ── Priority colours ──
  const PRI: Record<string, string> = { URGENT: "bg-red-50 text-red-700 border-red-200", HIGH: "bg-orange-50 text-orange-700 border-orange-200", MEDIUM: "bg-amber-50 text-amber-700 border-amber-200", LOW: "bg-blue-50 text-blue-700 border-blue-200" };
  const ALERT_ICON: Record<string, string> = { EXPIRED: "🔴", URGENT: "🟠", SOON: "🟡", UPCOMING: "🔵", OK: "🟢" };

  // ── Sub-tabs ──────────────────────────────────────────────

  function OverviewTab() {
    const catColor = score.total >= 90 ? "#16a34a" : score.total >= 75 ? "#2563eb" : score.total >= 50 ? "#d97706" : "#dc2626";
    const componentMax: Record<string, number> = { certificateValidity: 25, verificationHistory: 20, renewalTimeliness: 20, documentation: 15, inspectionRecord: 12, complaintRecord: 8 };
    const componentLabels: Record<string, string> = { certificateValidity: "Certificate Validity", verificationHistory: "Verification History", renewalTimeliness: "Renewal Timeliness", documentation: "Documentation", inspectionRecord: "Inspection Record", complaintRecord: "Complaint Record" };
    return (
      <div className="space-y-5">
        {/* Compliance Health card */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          <Card className="p-6 flex flex-col items-center justify-center text-center lg:col-span-1">
            <div className="text-xs font-bold text-gray-400 tracking-widest mb-3">COMPLIANCE HEALTH</div>
            <ScoreRing val={score.total} max={100} color={catColor} size={100} />
            <div className="mt-3 text-sm font-black" style={{ color: catColor }}>{score.category.toUpperCase()}</div>
            <div className="mt-3 grid grid-cols-2 gap-2 w-full text-xs text-gray-600">
              <div className="bg-gray-50 rounded-lg p-2 text-center"><div className="font-black text-gray-800 text-lg">{wallet.total}</div>Instruments</div>
              <div className="bg-green-50 rounded-lg p-2 text-center"><div className="font-black text-green-700 text-lg">{wallet.verified}</div>Valid</div>
              <div className="bg-amber-50 rounded-lg p-2 text-center"><div className="font-black text-amber-700 text-lg">{wallet.expiringSoon}</div>Expiring Soon</div>
              <div className="bg-red-50 rounded-lg p-2 text-center"><div className="font-black text-red-700 text-lg">{wallet.expired + wallet.reverif}</div>Action Needed</div>
            </div>
            <button onClick={() => setTab("autopilot")} className="mt-4 w-full px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-all">View Compliance Details →</button>
          </Card>

          {/* Score breakdown */}
          <Card className="p-5 lg:col-span-2">
            <div className="font-bold text-gray-800 mb-4 text-sm">Compliance Score Breakdown</div>
            <div className="space-y-3">
              {Object.entries(score.components).map(([key, val]) => {
                const max = componentMax[key];
                const pct = Math.round((val / max) * 100);
                const c = pct >= 85 ? "#16a34a" : pct >= 65 ? "#d97706" : "#dc2626";
                return (
                  <div key={key}>
                    <div className="flex justify-between mb-1">
                      <span className="text-xs text-gray-600">{componentLabels[key]}</span>
                      <span className="text-xs font-bold text-gray-800">{val}/{max} <span className="text-gray-400">({pct}%)</span></span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: c }} />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 border-t border-gray-100 pt-3">
              <div className="text-xs font-bold text-gray-500 mb-2">Recent Score Events</div>
              <div className="flex flex-wrap gap-2">
                {score.recentEvents.map((e, i) => (
                  <span key={i} className={`text-xs px-2 py-1 rounded-full font-semibold border ${e.delta > 0 ? "bg-green-50 text-green-700 border-green-200" : "bg-red-50 text-red-700 border-red-200"}`}>
                    {e.delta > 0 ? "+" : ""}{e.delta} {e.label}
                  </span>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* What needs attention */}
        <Card className="p-5">
          <div className="font-bold text-gray-800 mb-4 text-sm">What Needs My Attention?</div>
          {actions.length === 0 ? (
            <div className="text-center py-6 text-green-600"><div className="text-3xl mb-2">🟢</div><div className="font-semibold">All instruments are compliant. No immediate action required.</div></div>
          ) : (
            <div className="space-y-2">
              {actions.map(a => (
                <div key={a.id} className={`flex items-center gap-3 p-3 rounded-xl border ${PRI[a.priority]} cursor-pointer hover:opacity-90`} onClick={() => onPageChange(a.targetPage)}>
                  <span className="text-lg shrink-0">{a.priority === "URGENT" ? "🔴" : a.priority === "HIGH" ? "🟠" : a.priority === "MEDIUM" ? "🟡" : "🔵"}</span>
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold">{a.title}</div>
                    <div className="text-[10px] opacity-80 truncate">{a.instrumentId} · {a.instrumentType}</div>
                  </div>
                  <span className="text-[10px] font-semibold shrink-0">{a.dueLabel}</span>
                  <span className="text-[10px] opacity-70 shrink-0">→</span>
                </div>
              ))}
            </div>
          )}
        </Card>

        {/* AI Insight */}
        <Card className="p-5 border-l-4 border-teal-400">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-teal-100 flex items-center justify-center text-teal-700 font-bold text-sm shrink-0">AI</div>
            <div>
              <div className="text-[10px] font-bold text-teal-600 tracking-widest mb-2">AI-ASSISTED INSIGHT · Demo Mode</div>
              <div className="space-y-1.5 text-xs text-gray-700">
                <div className="flex items-start gap-2"><span className="shrink-0">{wallet.verified === wallet.total ? "🟢" : "🟡"}</span> {wallet.verified === wallet.total ? "Your business is currently fully compliant." : `${wallet.total - wallet.verified} instrument(s) require attention.`}</div>
                {wallet.expiringSoon > 0 && <div className="flex items-start gap-2"><span className="shrink-0">⚠️</span> {wallet.expiringSoon} certificate{wallet.expiringSoon > 1 ? "s" : ""} expiring within 60 days. Start renewal early to avoid lapse.</div>}
                <div className="flex items-start gap-2"><span className="shrink-0">💡</span> Based on configured cost assumptions, verification is typically more economical than replacement for instruments under 6 years old.</div>
                <div className="flex items-start gap-2"><span className="shrink-0">📈</span> Your compliance score has improved from 69 (2023) to {score.total} (current). Keep renewing on time to maintain this trend.</div>
              </div>
              <div className="text-[9px] text-gray-400 mt-2">AI-assisted insight. Not an official government decision.</div>
            </div>
          </div>
        </Card>

        {/* Why DataDrift */}
        <Card className="p-5 bg-gradient-to-br from-blue-50 to-teal-50 border-blue-200">
          <div className="text-xs font-bold text-blue-700 tracking-widest mb-3">WHY USE DATADRIFT?</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {[
              "Manage all instruments in one place",
              "Never miss certificate expiry",
              "Get automated compliance reminders",
              "Pre-fill renewal applications",
              "Understand compliance risks",
              "Compare verification vs. replacement economics",
              "Maintain a digital compliance history",
              "Generate a Digital Compliance Passport",
              "Ask the AI Assistant using text or voice",
            ].map(v => (
              <div key={v} className="flex items-start gap-2 text-xs text-blue-800">
                <span className="text-blue-400 shrink-0 mt-0.5">✓</span> {v}
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  function InstrumentsTab() {
    return (
      <div>
        <div className="font-bold text-gray-800 mb-4 text-sm">Instrument Compliance Table</div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-100">
                {["Instrument ID", "Type", "Serial No.", "Certificate", "Status", "Expiry", "Alert", "Action"].map(h => (
                  <th key={h} className="pb-2 pr-3 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {INSTRUMENTS.map((inst, i) => {
                const alert = alerts.find(a => a.instrumentId === inst.id);
                return (
                  <tr key={inst.id} className="hover:bg-gray-50">
                    <td className="py-3 pr-3 font-mono text-blue-700 whitespace-nowrap">{inst.id}</td>
                    <td className="py-3 pr-3 font-semibold text-gray-800 whitespace-nowrap">{inst.type}</td>
                    <td className="py-3 pr-3 font-mono text-gray-500 whitespace-nowrap">{inst.serial}</td>
                    <td className="py-3 pr-3 font-mono text-gray-500 whitespace-nowrap">{inst.certificateNo ?? "—"}</td>
                    <td className="py-3 pr-3"><StatusBadge status={inst.status} /></td>
                    <td className="py-3 pr-3 text-gray-600 whitespace-nowrap">{inst.validUntil ?? "—"}</td>
                    <td className="py-3 pr-3 whitespace-nowrap">
                      {alert && alert.alertLevel !== "OK" && (
                        <span className={`text-[10px] px-2 py-0.5 rounded-full border font-semibold ${alert.alertLevel === "EXPIRED" || alert.alertLevel === "URGENT" ? "bg-red-50 text-red-700 border-red-200" : alert.alertLevel === "SOON" ? "bg-amber-50 text-amber-700 border-amber-200" : "bg-blue-50 text-blue-700 border-blue-200"}`}>
                          {ALERT_ICON[alert.alertLevel]} {alert.daysRemaining !== null && alert.daysRemaining > 0 ? `${alert.daysRemaining}d` : "Expired"}
                        </span>
                      )}
                      {(!alert || alert.alertLevel === "OK") && <span className="text-green-600 text-[10px]">🟢 OK</span>}
                    </td>
                    <td className="py-3">
                      <div className="flex gap-1.5">
                        <button onClick={() => onPageChange("certificates")} className="px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded text-[10px] font-medium hover:bg-blue-100">View</button>
                        {(inst.status !== "Verified" || (alert && ["URGENT","SOON","UPCOMING"].includes(alert.alertLevel))) && (
                          <button onClick={() => onPageChange("applications")} className="px-2 py-1 bg-amber-50 text-amber-700 border border-amber-200 rounded text-[10px] font-medium hover:bg-amber-100">Renew</button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    );
  }

  function AutopilotTab() {
    return (
      <div className="space-y-4">
        <div className="text-sm font-bold text-gray-800 mb-2">Compliance Autopilot — Action Center</div>
        <div className="text-xs text-gray-500 mb-4">The Autopilot continuously monitors your instruments and generates prioritised actions. Click any action to open the relevant workflow.</div>
        {actions.length === 0 ? (
          <Card className="p-8 text-center">
            <div className="text-4xl mb-3">🟢</div>
            <div className="font-semibold text-green-700">All instruments are compliant. No actions required.</div>
          </Card>
        ) : (
          actions.map(a => (
            <Card key={a.id} className={`p-4 border-l-4 ${a.priority === "URGENT" ? "border-red-500" : a.priority === "HIGH" ? "border-orange-500" : a.priority === "MEDIUM" ? "border-amber-400" : "border-blue-400"}`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`text-[10px] px-2 py-0.5 rounded-full border font-bold ${PRI[a.priority]}`}>{a.priority}</span>
                    <span className="text-xs font-bold text-gray-800">{a.title}</span>
                  </div>
                  <div className="text-xs text-gray-600 mb-1">{a.description}</div>
                  <div className="font-mono text-[10px] text-gray-400">{a.instrumentId} · {a.instrumentType}</div>
                </div>
                <button onClick={() => onPageChange(a.targetPage)}
                  className={`px-4 py-2 rounded-lg text-xs font-bold text-white transition-all shrink-0 ${a.priority === "URGENT" ? "bg-red-600 hover:bg-red-700" : "bg-blue-600 hover:bg-blue-700"}`}>
                  Start Renewal →
                </button>
              </div>
            </Card>
          ))
        )}

        {/* Expiry alerts timeline */}
        <Card className="p-5">
          <div className="font-bold text-gray-800 mb-3 text-sm">Expiry Alerts</div>
          <div className="space-y-2">
            {alerts.map(a => (
              <div key={a.instrumentId} className={`flex items-center gap-3 p-2.5 rounded-lg ${a.alertLevel === "OK" ? "bg-green-50" : a.alertLevel === "EXPIRED" || a.alertLevel === "URGENT" ? "bg-red-50" : "bg-amber-50"}`}>
                <span>{ALERT_ICON[a.alertLevel]}</span>
                <div className="flex-1">
                  <div className="text-xs font-semibold text-gray-800">{a.instrumentType}</div>
                  <div className="text-[10px] text-gray-500 font-mono">{a.instrumentId}</div>
                </div>
                <div className="text-xs text-gray-600 text-right">{a.message}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  function CostTab() {
    const [inputs, setInputs] = useState<CostInputs>(DEFAULT_INPUTS);
    const result = calculateCostComparison(inputs);
    const isVerify = result.recommendation === "VERIFY";

    const Field = ({ label, field, min, max, step = 100 }: { label: string; field: keyof CostInputs; min: number; max: number; step?: number }) => (
      <div>
        <label className="text-xs text-gray-600 font-medium block mb-1">{label}</label>
        <input type="number" min={min} max={max} step={step}
          value={inputs[field]}
          onChange={e => setInputs(prev => ({ ...prev, [field]: Number(e.target.value) }))}
          className="w-full text-sm px-3 py-2 border border-gray-200 rounded-lg outline-none focus:border-blue-400 text-gray-800" />
      </div>
    );

    return (
      <div className="space-y-5">
        <div className="text-sm font-bold text-gray-800">Compliance Cost Analysis — Verify vs. Replace</div>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 text-xs text-amber-700">⚠️ {result.disclaimer}</div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Inputs */}
          <Card className="p-5">
            <div className="font-bold text-gray-800 mb-3 text-sm">Cost Assumptions <span className="text-[10px] text-gray-400 font-normal">(configurable)</span></div>
            <div className="space-y-3">
              <Field label="Verification fee (₹)" field="verificationFee" min={0} max={50000} step={100} />
              <Field label="Maintenance cost/year (₹)" field="maintenanceCostPerYear" min={0} max={20000} step={100} />
              <Field label="Instrument age (years)" field="instrumentAge" min={0} max={30} step={1} />
              <Field label="Remaining useful life (years)" field="remainingLifeYears" min={1} max={20} step={1} />
              <Field label="Replacement cost (₹)" field="replacementCost" min={0} max={500000} step={500} />
              <Field label="Setup cost (₹)" field="setupCost" min={0} max={50000} step={500} />
              <Field label="Analysis horizon (years)" field="analysisYears" min={1} max={10} step={1} />
            </div>
          </Card>

          {/* Results */}
          <div className="lg:col-span-2 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              {/* Option A */}
              <Card className={`p-5 ${isVerify ? "border-2 border-green-400" : ""}`}>
                <div className="text-[10px] font-black tracking-widest text-blue-600 mb-2">OPTION A</div>
                <div className="font-bold text-gray-800 mb-3">Verify Existing</div>
                {result.verifyBreakdown.map(b => (
                  <div key={b.label} className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>{b.label}</span><span className="font-semibold">₹{b.amount.toLocaleString("en-IN")}</span>
                  </div>
                ))}
                <div className="border-t border-gray-100 mt-2 pt-2 flex justify-between font-bold text-sm">
                  <span>Total</span><span className="text-blue-700">₹{result.verifyTotalCost.toLocaleString("en-IN")}</span>
                </div>
                <div className="mt-2 text-[10px] text-gray-400">✓ Compliance history preserved</div>
              </Card>

              {/* Option B */}
              <Card className={`p-5 ${!isVerify ? "border-2 border-green-400" : ""}`}>
                <div className="text-[10px] font-black tracking-widest text-purple-600 mb-2">OPTION B</div>
                <div className="font-bold text-gray-800 mb-3">Replace Instrument</div>
                {result.replaceBreakdown.map(b => (
                  <div key={b.label} className="flex justify-between text-xs text-gray-600 mb-1">
                    <span>{b.label}</span><span className="font-semibold">₹{b.amount.toLocaleString("en-IN")}</span>
                  </div>
                ))}
                <div className="border-t border-gray-100 mt-2 pt-2 flex justify-between font-bold text-sm">
                  <span>Total</span><span className="text-purple-700">₹{result.replaceTotalCost.toLocaleString("en-IN")}</span>
                </div>
                <div className="mt-2 text-[10px] text-gray-400">⚠ Previous history not transferred</div>
              </Card>
            </div>

            {/* Recommendation */}
            <Card className={`p-5 ${isVerify ? "border-l-4 border-green-500 bg-green-50" : "border-l-4 border-purple-500 bg-purple-50"}`}>
              <div className="font-bold text-sm mb-1" style={{ color: isVerify ? "#16a34a" : "#7c3aed" }}>
                📊 DATADRIFT RECOMMENDATION: {isVerify ? "✅ VERIFY EXISTING" : "🔄 REPLACE INSTRUMENT"}
              </div>
              <div className="text-xs text-gray-700 mb-2">{isVerify ? result.explanationVerify : result.explanationReplace}</div>
              <div className="flex gap-4 text-xs">
                <div><span className="text-gray-500">Estimated difference: </span><span className="font-bold text-gray-800">₹{result.difference.toLocaleString("en-IN")}</span></div>
                <div><span className="text-gray-500">Over: </span><span className="font-bold text-gray-800">{inputs.analysisYears} year{inputs.analysisYears !== 1 ? "s" : ""}</span></div>
              </div>
              <button onClick={() => onPageChange("applications")} className="mt-3 px-4 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-all">
                Start Renewal Application →
              </button>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  function PassportTab() {
    const [view, setView] = useState<"private" | "public">("private");
    const score2 = calcComplianceScore();
    const catColor = score2.total >= 90 ? "#16a34a" : score2.total >= 75 ? "#2563eb" : "#d97706";
    const isCompliant = score2.total >= 75;

    return (
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="text-sm font-bold text-gray-800">Digital Compliance Passport</div>
          <div className="flex gap-1 ml-auto">
            <button onClick={() => setView("private")} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${view === "private" ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>My Passport</button>
            <button onClick={() => setView("public")} className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${view === "public" ? "bg-teal-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>Public View</button>
          </div>
        </div>
        <div className="text-xs text-gray-400">This is a DataDrift compliance profile — it is NOT a replacement for the official government-issued verification certificate.</div>

        {view === "private" ? (
          <Card className="p-6 max-w-lg">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-700 to-blue-900 flex items-center justify-center text-white font-black text-sm">DD</div>
              <div>
                <div className="font-black text-gray-900 text-base" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>DataDrift Digital Compliance Passport</div>
                <div className="text-[10px] text-gray-400">SIH 2026 — Legal Metrology, Maharashtra</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-5 text-xs">
              {[["Business", "Global Weigh Industries"], ["Location", "Pune, Maharashtra"], ["Compliance Score", `${score2.total}/100`], ["Status", isCompliant ? "🟢 COMPLIANT" : "🟡 MODERATE"], ["Instruments", `${wallet.total} Registered`], ["Valid Certificates", `${wallet.verified}`], ["Expiring Soon", `${wallet.expiringSoon}`], ["Last Inspection", wallet.lastInspection]].map(([l, v]) => (
                <div key={String(l)}>
                  <div className="text-gray-400 font-medium">{l}</div>
                  <div className="font-bold text-gray-800">{v}</div>
                </div>
              ))}
            </div>
            <div className="mb-4">
              <div className="text-xs font-bold text-gray-500 mb-2">Verification History</div>
              {SCORE_HISTORY.map(h => (
                <div key={h.year} className="flex items-center gap-2 text-xs text-gray-600 mb-1">
                  <span className={h.score >= 75 ? "text-green-600" : "text-amber-600"}>{h.score >= 75 ? "✓" : "⚠"}</span>
                  <span className="font-bold w-10">{h.year}</span>
                  <span className="text-gray-400">{h.events.join(" · ")}</span>
                </div>
              ))}
            </div>
            <div className="flex gap-2 flex-wrap">
              <button className="px-3 py-2 bg-blue-600 text-white text-xs font-semibold rounded-lg hover:bg-blue-700 transition-all">📄 Download Passport</button>
              <button onClick={() => setView("public")} className="px-3 py-2 bg-teal-600 text-white text-xs font-semibold rounded-lg hover:bg-teal-700 transition-all">🔗 Share (Public)</button>
              <button className="px-3 py-2 bg-purple-600 text-white text-xs font-semibold rounded-lg hover:bg-purple-700 transition-all">📱 Generate QR</button>
            </div>
          </Card>
        ) : (
          <Card className="p-6 max-w-lg border-2 border-teal-400">
            <div className="text-[10px] font-black tracking-widest text-teal-600 mb-3">DATADRIFT PUBLIC VERIFICATION</div>
            <div className="font-black text-xl text-gray-900 mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Global Weigh Industries</div>
            <div className="text-sm font-bold mb-4" style={{ color: catColor }}>{isCompliant ? "🟢 COMPLIANT" : "🟡 MODERATE"}</div>
            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-xs text-gray-700"><span className="text-green-600">✓</span> Business registered with DataDrift</div>
              <div className="flex items-center gap-2 text-xs text-gray-700"><span className="text-green-600">✓</span> Applicable instruments registered</div>
              <div className="flex items-center gap-2 text-xs text-gray-700">
                <span className={wallet.verified === wallet.total ? "text-green-600" : "text-amber-500"}>{wallet.verified === wallet.total ? "✓" : "⚠"}</span>
                {wallet.verified === wallet.total ? "Certificates currently valid" : `${wallet.expired} certificate(s) require renewal`}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs mb-4">
              <div><div className="text-gray-400">Compliance Score</div><div className="font-bold text-gray-800 text-lg">{score2.total}/100</div></div>
              <div><div className="text-gray-400">Last Verification</div><div className="font-bold text-gray-800">{wallet.lastInspection}</div></div>
            </div>
            <div className="text-[9px] text-gray-400 border-t border-gray-100 pt-3">Public verification provided by DataDrift · Legal Metrology Dept, Maharashtra · Private contact, payment, audit, and officer details are not displayed.</div>
          </Card>
        )}
      </div>
    );
  }

  function HistoryTab() {
    return (
      <div className="space-y-4">
        <div className="text-sm font-bold text-gray-800">Compliance History</div>
        {SCORE_HISTORY.map((entry, i) => (
          <Card key={entry.year} className="p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center font-black text-sm" style={{ background: entry.score >= 75 ? "#dcfce7" : "#fef3c7", color: entry.score >= 75 ? "#16a34a" : "#d97706" }}>
                {entry.score >= 75 ? "✓" : "⚠"}
              </div>
              <div>
                <div className="font-bold text-gray-800">{entry.year}</div>
                <div className="text-xs text-gray-500">Compliance Score: <strong>{entry.score}/100</strong></div>
              </div>
              <div className="ml-auto">
                <div className="w-16 h-2 bg-gray-100 rounded-full overflow-hidden">
                  <div className="h-full rounded-full" style={{ width: `${entry.score}%`, background: entry.score >= 75 ? "#16a34a" : "#d97706" }} />
                </div>
              </div>
            </div>
            <div className="space-y-1 ml-13">
              {entry.events.map(e => (
                <div key={e} className="flex items-center gap-2 text-xs text-gray-600">
                  <span className={entry.score >= 75 ? "text-green-500" : "text-amber-500"}>{entry.score >= 75 ? "✓" : "⚠"}</span>
                  {e}
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="fade-in">
      <SectionHeader
        title="Compliance Center"
        subtitle="Register once. Stay compliant continuously."
      />

      {/* Sub-navigation */}
      <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
        {tabs.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all ${tab === t.key ? "bg-blue-600 text-white shadow-sm" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </div>

      {tab === "overview" && <OverviewTab />}
      {tab === "instruments" && <Card className="p-5"><InstrumentsTab /></Card>}
      {tab === "autopilot" && <AutopilotTab />}
      {tab === "cost" && <CostTab />}
      {tab === "passport" && <PassportTab />}
      {tab === "history" && <HistoryTab />}
    </div>
  );
}

export default function UserPortal({ page, lang, onPageChange }: Props) {
  const pages: Record<string, React.ReactNode> = {
    dashboard: <UserDashboard onPageChange={onPageChange} />,
    instruments: <InstrumentsPage onPageChange={onPageChange} />,
    register: <RegisterInstrument />,
    applications: <ApplicationsPage />,
    payments: <PaymentsPage />,
    inspections: <ApplicationsPage />,
    certificates: <CertificatesPage />,
    instrumentPassport: <InstrumentPassport />,
    complaints: <ComplaintsPage />,
    aiAssistant: <AIAssistantPage />,
    notifications: <NotificationsPage />,
    profile: <ProfilePage />,
    complianceCenter: <ComplianceCenterPage onPageChange={onPageChange} />,
  };

  return <>{pages[page] ?? <UserDashboard onPageChange={onPageChange} />}</>;
}
