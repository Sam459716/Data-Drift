import { useState } from "react";
import type { Lang } from "../data/mockData";
import { OFFICER_ASSIGNMENTS, INSTRUMENTS, COMPLAINTS, FRAUD_ALERTS, NOTIFICATIONS } from "../data/mockData";
import { analyzeRisk, analyzeFraud, chatWithAssistant, SUGGESTED_QUESTIONS, type ChatMessage } from "../services/aiService";
import StatusBadge from "../components/StatusBadge";

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

// ── Officer Dashboard ──────────────────────────────────────
function OfficerDashboard({ onPageChange }: { onPageChange: (p: string) => void }) {
  const pending = OFFICER_ASSIGNMENTS.filter(a => a.status === "Pending");
  const completed = OFFICER_ASSIGNMENTS.filter(a => a.status === "Completed");
  const high = OFFICER_ASSIGNMENTS.filter(a => a.priority === "High" || a.priority === "Urgent");

  const PRIORITY_COLOR: Record<string, string> = {
    Urgent: "border-l-4 border-purple-500 bg-purple-50",
    High: "border-l-4 border-red-400 bg-red-50/30",
    Medium: "border-l-4 border-yellow-400 bg-yellow-50/20",
    Low: "border-l-4 border-green-400",
  };
  const PRIORITY_DOT: Record<string, string> = {
    Urgent: "bg-purple-500", High: "bg-red-500", Medium: "bg-yellow-500", Low: "bg-green-500"
  };

  return (
    <div className="fade-in">
      <SectionHeader title="Officer Dashboard" subtitle="Officer Priya Sharma · Pune District · LM102" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Assigned Cases", val: OFFICER_ASSIGNMENTS.length, icon: "📋", color: "text-blue-700", border: "border-blue-200" },
          { label: "Pending", val: pending.length, icon: "⏳", color: "text-yellow-700", border: "border-yellow-200" },
          { label: "Completed Today", val: completed.length, icon: "✅", color: "text-green-700", border: "border-green-200" },
          { label: "High Priority", val: high.length, icon: "🚨", color: "text-red-700", border: "border-red-200" },
        ].map(k => (
          <Card key={k.label} className={`p-5 border-l-4 ${k.border}`}>
            <div className="flex items-center justify-between mb-2"><span className="text-2xl">{k.icon}</span><span className={`text-3xl font-black ${k.color}`}>{k.val}</span></div>
            <div className="text-sm text-gray-600 font-medium">{k.label}</div>
          </Card>
        ))}
      </div>

      {/* Priority Queue */}
      <Card className="p-5 mb-5">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-gray-800">Priority Queue</h3>
          <button onClick={() => onPageChange("myAssignments")} className="text-xs text-blue-600 hover:underline">View all →</button>
        </div>
        <div className="space-y-3">
          {OFFICER_ASSIGNMENTS.map(a => (
            <div key={a.id} className={`rounded-xl p-4 ${PRIORITY_COLOR[a.priority]}`}>
              <div className="flex items-start justify-between gap-3 flex-wrap">
                <div className="flex items-start gap-3">
                  <div className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${PRIORITY_DOT[a.priority]}`} />
                  <div>
                    <div className="font-semibold text-sm text-gray-900">{a.business}</div>
                    <div className="text-xs text-gray-600 mt-0.5 font-mono">{a.instrumentId}</div>
                    <div className="text-xs text-gray-500">{a.type} · {a.address}</div>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <StatusBadge status={a.status} />
                  <div className="text-xs text-gray-500">{a.scheduledDate} · {a.scheduledTime}</div>
                </div>
              </div>
              <div className="flex items-center gap-4 mt-3 pt-3 border-t border-gray-200/60">
                <div className="text-xs text-gray-500">Risk: <span className={`font-bold ${a.riskScore >= 70 ? "text-red-600" : a.riskScore >= 40 ? "text-yellow-600" : "text-green-600"}`}>{a.riskScore}/100</span></div>
                <div className="text-xs text-gray-500">Compliance: <span className="font-bold text-gray-700">{a.complianceScore}/100</span></div>
                <button onClick={() => onPageChange("fieldVerification")} className="ml-auto px-3 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 transition-all">Start Inspection →</button>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Complaints + Expiry */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="p-5">
          <h3 className="font-bold text-gray-800 mb-3">Assigned Complaints</h3>
          {COMPLAINTS.filter(c => c.assignedOfficer === "Officer Priya Sharma").map(c => (
            <div key={c.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 mb-2">
              <div className="text-lg">📣</div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-gray-800">{c.category}</div>
                <div className="text-xs text-gray-500 truncate">{c.businessName} · {c.location}</div>
              </div>
              <StatusBadge status={c.priority} />
            </div>
          ))}
          <button onClick={() => onPageChange("complaints")} className="mt-2 w-full text-xs text-blue-600 hover:underline">View all complaints →</button>
        </Card>
        <Card className="p-5">
          <h3 className="font-bold text-gray-800 mb-3">Recent Notifications</h3>
          {NOTIFICATIONS.filter(n => !n.read).map(n => (
            <div key={n.id} className="flex gap-3 p-3 bg-blue-50/40 rounded-lg border border-blue-100 mb-2">
              <span>{n.type === "warning" ? "⚠️" : n.type === "success" ? "✅" : "ℹ️"}</span>
              <div><div className="text-xs font-semibold text-gray-800">{n.title}</div><div className="text-xs text-gray-500">{n.message.slice(0, 80)}…</div></div>
            </div>
          ))}
        </Card>
      </div>
    </div>
  );
}

// ── Field Verification ─────────────────────────────────────
function FieldVerification() {
  const [step, setStep] = useState(0);
  const [measurements, setMeasurements] = useState({ std: "", obs: "", limit: "0.5" });
  const [gpsStatus, setGpsStatus] = useState<"idle" | "capturing" | "captured" | "error">("idle");
  const [gpsData, setGpsData] = useState<{ lat: number; lng: number } | null>(null);
  const [evidence, setEvidence] = useState<string[]>([]);
  const [decision, setDecision] = useState<"" | "Approved" | "Rejected" | "Re-verification Required">("");
  const [submitted, setSubmitted] = useState(false);

  const inst = INSTRUMENTS[1];
  const assignment = OFFICER_ASSIGNMENTS[0];
  const risk = analyzeRisk(inst.id, inst.riskScore);
  const fraud = analyzeFraud(inst.id, inst.riskScore);

  const error = measurements.std && measurements.obs ? parseFloat(measurements.obs) - parseFloat(measurements.std) : null;
  const pctError = error !== null && measurements.std ? (error / parseFloat(measurements.std)) * 100 : null;
  const pass = pctError !== null ? Math.abs(pctError) <= parseFloat(measurements.limit) : null;

  const captureGps = () => {
    setGpsStatus("capturing");
    navigator.geolocation?.getCurrentPosition(
      pos => { setGpsData({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setGpsStatus("captured"); },
      () => { setGpsData({ lat: 18.5204, lng: 73.8567 }); setGpsStatus("captured"); }
    );
    if (!navigator.geolocation) { setGpsData({ lat: 18.5204, lng: 73.8567 }); setGpsStatus("captured"); }
  };

  const STEPS = ["Business & Instrument", "GPS Capture", "Checklist & Evidence", "Measurements", "AI Analysis", "Decision"];

  if (submitted) return (
    <div className="fade-in">
      <Card className="p-10 text-center max-w-lg mx-auto">
        <div className="text-5xl mb-4">{decision === "Approved" ? "✅" : "❌"}</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Inspection Submitted</h2>
        <div className={`px-4 py-3 rounded-xl my-4 border ${decision === "Approved" ? "bg-green-50 border-green-200 text-green-800" : "bg-red-50 border-red-200 text-red-800"}`}>
          Decision: <strong>{decision}</strong>
        </div>
        <p className="text-gray-500 text-sm mb-5">Inspection report saved. {decision === "Approved" ? "Certificate will be generated automatically." : "Notification sent to business."}</p>
        <button onClick={() => setSubmitted(false)} className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-medium">Back to Assignments</button>
      </Card>
    </div>
  );

  return (
    <div className="fade-in">
      <SectionHeader title="Field Verification" subtitle={`${assignment.business} · ${assignment.instrumentId}`} />

      {/* Step indicator */}
      <div className="flex items-center gap-1 mb-6 overflow-x-auto pb-1">
        {STEPS.map((s, i) => (
          <div key={s} className="flex items-center gap-1 shrink-0">
            <button onClick={() => setStep(i)} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${step === i ? "bg-blue-600 text-white" : step > i ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-500"}`}>
              <span>{step > i ? "✓" : i + 1}</span> {s}
            </button>
            {i < STEPS.length - 1 && <div className={`w-4 h-0.5 ${step > i ? "bg-green-400" : "bg-gray-200"}`} />}
          </div>
        ))}
      </div>

      <Card className="p-6 max-w-2xl">
        {/* Step 0: Business & Instrument */}
        {step === 0 && (
          <div>
            <h3 className="font-bold text-gray-900 mb-4">Business & Instrument Details</h3>
            <div className="bg-gradient-to-br from-blue-900 to-blue-700 rounded-xl p-4 text-white mb-4">
              <div className="text-sm font-bold">{inst.type}</div>
              <div className="font-mono text-blue-100 text-xs mt-1">{inst.id}</div>
              <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-white/20 text-xs">
                <div><div className="text-blue-200">Owner</div><div className="font-medium mt-0.5">{inst.owner}</div></div>
                <div><div className="text-blue-200">Location</div><div className="font-medium mt-0.5">{inst.location}</div></div>
                <div><div className="text-blue-200">Manufacturer</div><div className="font-medium mt-0.5">{inst.manufacturer}</div></div>
                <div><div className="text-blue-200">Capacity</div><div className="font-medium mt-0.5">{inst.capacity}</div></div>
              </div>
            </div>
            <div className="flex items-center gap-3 mb-4">
              <div className={`px-3 py-1.5 rounded-full text-xs font-bold ${risk.level === "LOW" ? "bg-green-100 text-green-800" : risk.level === "MEDIUM" ? "bg-yellow-100 text-yellow-800" : risk.level === "HIGH" ? "bg-red-100 text-red-800" : "bg-purple-100 text-purple-800"}`}>⚠️ Risk: {risk.level}</div>
              <div className="text-xs text-gray-500">Score: {inst.riskScore}/100</div>
            </div>
            <button onClick={() => setStep(1)} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all">Proceed to GPS Capture →</button>
          </div>
        )}

        {/* Step 1: GPS */}
        {step === 1 && (
          <div>
            <h3 className="font-bold text-gray-900 mb-4">GPS Location Capture</h3>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 mb-4 text-sm">
              <div className="flex items-center justify-between mb-2">
                <span className="font-medium text-gray-700">Registered Location:</span>
                <span className="text-gray-600">Pune, MH</span>
              </div>
              {gpsData && <div className="flex items-center justify-between text-green-700"><span>✅ Inspection Location:</span><span className="font-mono text-xs">{gpsData.lat.toFixed(4)}°N, {gpsData.lng.toFixed(4)}°E</span></div>}
              {gpsData && <div className="flex items-center justify-between mt-1 text-green-700 font-medium text-xs"><span>Distance:</span><span>~1.2 km · ✓ Location Verified</span></div>}
            </div>
            {gpsStatus !== "captured" ? (
              <button onClick={captureGps} className="w-full py-3.5 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition-all active:scale-95" disabled={gpsStatus === "capturing"}>
                {gpsStatus === "capturing" ? "📍 Capturing location…" : "📍 Capture Current Location"}
              </button>
            ) : (
              <div>
                <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-green-800 text-sm font-medium mb-4">✅ Location captured successfully</div>
                <button onClick={() => setStep(2)} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all">Next: Checklist →</button>
              </div>
            )}
          </div>
        )}

        {/* Step 2: Checklist & Evidence */}
        {step === 2 && (
          <div>
            <h3 className="font-bold text-gray-900 mb-4">Inspection Checklist & Evidence</h3>
            <div className="space-y-2 mb-5">
              {["Instrument physically accessible", "Manufacturer plate visible", "Seal intact", "Calibration marks present", "Zero reading verified", "Legal Metrology stamp verified", "Previous certificate available"].map(item => (
                <label key={item} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-100 hover:bg-blue-50/30 cursor-pointer transition-all">
                  <input type="checkbox" defaultChecked={Math.random() > 0.2} className="w-4 h-4 accent-blue-600" />
                  <span className="text-sm text-gray-700">{item}</span>
                </label>
              ))}
            </div>
            <div className="mb-4">
              <div className="font-medium text-sm text-gray-700 mb-2">Upload Evidence</div>
              <div className="grid grid-cols-3 gap-2 mb-2">
                {["Instrument", "Seal", "Display", "Documents", "Location", "Violation"].map(cat => (
                  <button key={cat} onClick={() => setEvidence(prev => prev.includes(cat) ? prev : [...prev, cat])}
                    className={`py-2 px-2 rounded-lg text-xs border font-medium transition-all ${evidence.includes(cat) ? "bg-blue-600 text-white border-blue-600" : "bg-gray-50 text-gray-600 border-gray-200 hover:bg-gray-100"}`}>
                    📷 {cat}
                  </button>
                ))}
              </div>
              {evidence.length > 0 && <div className="text-xs text-green-600">✅ {evidence.length} category(ies) documented</div>}
            </div>
            <button onClick={() => setStep(3)} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all">Next: Measurements →</button>
          </div>
        )}

        {/* Step 3: Measurements */}
        {step === 3 && (
          <div>
            <h3 className="font-bold text-gray-900 mb-4">Measurement & Error Calculation</h3>
            <div className="space-y-4 mb-4">
              {[["Standard Value (kg)", "std", "e.g. 100"], ["Observed Value (kg)", "obs", "e.g. 100.3"], ["Permissible Limit (%)", "limit", "0.5"]].map(([label, key, ph]) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-700 mb-1">{label}</label>
                  <input value={measurements[key as keyof typeof measurements]} onChange={e => setMeasurements({ ...measurements, [key]: e.target.value })} placeholder={ph}
                    className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 font-mono text-base" />
                </div>
              ))}
            </div>
            {error !== null && pctError !== null && (
              <div className={`rounded-xl p-4 border mb-4 ${pass ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div><div className="text-gray-500 text-xs">Error</div><div className="font-bold font-mono">{error >= 0 ? "+" : ""}{error.toFixed(4)}</div></div>
                  <div><div className="text-gray-500 text-xs">% Error</div><div className="font-bold font-mono">{pctError >= 0 ? "+" : ""}{pctError.toFixed(4)}%</div></div>
                  <div><div className="text-gray-500 text-xs">Permissible</div><div className="font-bold">±{measurements.limit}%</div></div>
                  <div><div className="text-gray-500 text-xs">Result</div><div className={`font-black text-lg ${pass ? "text-green-600" : "text-red-600"}`}>{pass ? "✅ PASS" : "❌ FAIL"}</div></div>
                </div>
              </div>
            )}
            <button onClick={() => setStep(4)} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all">Next: AI Analysis →</button>
          </div>
        )}

        {/* Step 4: AI Analysis */}
        {step === 4 && (
          <div>
            <h3 className="font-bold text-gray-900 mb-1">AI Anomaly Detection</h3>
            <div className="text-xs text-gray-400 mb-4">🤖 AI Demo Analysis — connect real ML model for production</div>
            <div className={`rounded-xl p-4 border mb-4 ${risk.level === "LOW" ? "bg-green-50 border-green-200" : risk.level === "MEDIUM" ? "bg-yellow-50 border-yellow-200" : risk.level === "HIGH" ? "bg-red-50 border-red-200" : "bg-purple-50 border-purple-200"}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="font-bold text-gray-900">Risk Assessment</div>
                <div className={`px-3 py-1 rounded-full text-xs font-black ${risk.level === "LOW" ? "bg-green-200 text-green-900" : risk.level === "MEDIUM" ? "bg-yellow-200 text-yellow-900" : risk.level === "HIGH" ? "bg-red-200 text-red-900" : "bg-purple-200 text-purple-900"}`}>{risk.level}</div>
              </div>
              <div className="flex items-center gap-2 mb-3">
                <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
                  <div className="h-full rounded-full transition-all" style={{ width: `${risk.score}%`, background: risk.score >= 70 ? "#dc2626" : risk.score >= 40 ? "#d97706" : "#16a34a" }} />
                </div>
                <span className="font-black text-lg">{risk.score}/100</span>
              </div>
              <div className="space-y-2 text-xs text-gray-600">
                <div><span className="font-semibold">Pattern: </span>{risk.pattern}</div>
                <div><span className="font-semibold">Analysis: </span>{risk.explanation}</div>
                <div><span className="font-semibold">Recommendation: </span>{risk.recommendation}</div>
              </div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200 mb-4">
              <div className="font-semibold text-sm text-gray-800 mb-2">Fraud Detection</div>
              <div className="flex items-center gap-3">
                <StatusBadge status={fraud.status === "CLEAR" ? "LOW" : fraud.status === "SUSPICIOUS" ? "MEDIUM" : fraud.status === "HIGH_RISK" ? "HIGH" : "CRITICAL"} />
                <span className="text-sm text-gray-600">Fraud Score: <strong>{fraud.score}/100</strong></span>
              </div>
              {fraud.flags.length > 0 && (
                <ul className="mt-2 space-y-1">
                  {fraud.flags.map(f => <li key={f} className="text-xs text-red-700">⚠️ {f}</li>)}
                </ul>
              )}
            </div>
            <button onClick={() => setStep(5)} className="w-full py-3 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 transition-all">Next: Decision →</button>
          </div>
        )}

        {/* Step 5: Decision */}
        {step === 5 && (
          <div>
            <h3 className="font-bold text-gray-900 mb-4">Officer Decision</h3>
            <div className="space-y-3 mb-5">
              {(["Approved", "Rejected", "Re-verification Required"] as const).map(d => (
                <button key={d} onClick={() => setDecision(d)}
                  className={`w-full py-3.5 rounded-xl text-sm font-bold border-2 transition-all ${decision === d ? (d === "Approved" ? "bg-green-600 text-white border-green-600" : d === "Rejected" ? "bg-red-600 text-white border-red-600" : "bg-orange-500 text-white border-orange-500") : "bg-gray-50 text-gray-700 border-gray-200 hover:border-gray-300"}`}>
                  {d === "Approved" ? "✅ " : d === "Rejected" ? "❌ " : "🔄 "}{d}
                </button>
              ))}
            </div>
            <div className="mb-4">
              <label className="block text-xs font-medium text-gray-700 mb-1">Officer Remarks</label>
              <textarea rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400" placeholder="Add inspection notes and remarks…" />
            </div>
            <button onClick={() => decision && setSubmitted(true)} disabled={!decision}
              className="w-full py-3.5 bg-green-600 text-white rounded-xl font-bold text-sm hover:bg-green-700 transition-all disabled:opacity-40 disabled:cursor-not-allowed">
              Submit Inspection Report ✓
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}

// ── Assignments ────────────────────────────────────────────
function AssignmentsPage({ onPageChange }: { onPageChange: (p: string) => void }) {
  return (
    <div className="fade-in">
      <SectionHeader title="My Assignments" subtitle="Cases assigned to your jurisdiction" />
      <div className="space-y-4">
        {OFFICER_ASSIGNMENTS.map(a => (
          <Card key={a.id} className="p-5">
            <div className="flex items-start justify-between flex-wrap gap-3 mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1"><StatusBadge status={a.priority} /><span className="text-xs text-gray-400">{a.id}</span></div>
                <div className="font-bold text-gray-900">{a.business}</div>
                <div className="text-xs text-gray-500 mt-0.5">{a.type} · <span className="font-mono">{a.instrumentId}</span></div>
              </div>
              <StatusBadge status={a.status} size="md" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs mb-3">
              <div className="bg-gray-50 p-2 rounded border"><div className="text-gray-400">Scheduled</div><div className="font-medium">{a.scheduledDate}</div></div>
              <div className="bg-gray-50 p-2 rounded border"><div className="text-gray-400">Time</div><div className="font-medium">{a.scheduledTime}</div></div>
              <div className="bg-gray-50 p-2 rounded border"><div className="text-gray-400">Risk Score</div><div className={`font-bold ${a.riskScore >= 70 ? "text-red-600" : a.riskScore >= 40 ? "text-yellow-600" : "text-green-600"}`}>{a.riskScore}/100</div></div>
              <div className="bg-gray-50 p-2 rounded border"><div className="text-gray-400">Compliance</div><div className="font-medium">{a.complianceScore}/100</div></div>
            </div>
            <div className="text-xs text-gray-500 mb-3">📍 {a.address}</div>
            {a.status === "Pending" && (
              <button onClick={() => onPageChange("fieldVerification")} className="w-full py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all">🔍 Start Inspection</button>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Fraud Detection ────────────────────────────────────────
function FraudDetectionPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const alert = FRAUD_ALERTS.find(f => f.id === selected);

  return (
    <div className="fade-in">
      <SectionHeader title="Fraud Detection" subtitle="AI-powered suspicious pattern analysis" />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {[
          { label: "Records Analyzed", val: "2,236", icon: "📊", color: "text-blue-700" },
          { label: "Flagged Records", val: FRAUD_ALERTS.length, icon: "🚩", color: "text-orange-600" },
          { label: "High Risk", val: FRAUD_ALERTS.filter(f => f.riskLevel === "High" || f.riskLevel === "Critical").length, icon: "🔴", color: "text-red-600" },
          { label: "Under Investigation", val: FRAUD_ALERTS.filter(f => f.status === "Under Investigation" || f.status === "Under Review").length, icon: "🔍", color: "text-purple-600" },
        ].map(k => (
          <Card key={k.label} className="p-4 text-center">
            <div className="text-2xl mb-1">{k.icon}</div>
            <div className={`text-3xl font-black ${k.color}`}>{k.val}</div>
            <div className="text-xs text-gray-500 mt-0.5">{k.label}</div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <Card className="p-5">
            <h3 className="font-bold text-gray-800 mb-4">Flagged Cases</h3>
            <div className="space-y-3">
              {FRAUD_ALERTS.map(f => (
                <div key={f.id} onClick={() => setSelected(f.id === selected ? null : f.id)}
                  className={`p-4 rounded-xl border cursor-pointer transition-all ${selected === f.id ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}>
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div>
                      <div className="font-mono text-xs text-blue-700">{f.id}</div>
                      <div className="font-semibold text-sm text-gray-900 mt-0.5">{f.business}</div>
                      <div className="text-xs text-gray-500">{f.location} · {f.date}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <StatusBadge status={f.riskLevel} />
                      <StatusBadge status={f.status} />
                    </div>
                  </div>
                  <div className="mt-2 flex items-center gap-3">
                    <div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden">
                      <div className="h-full rounded-full" style={{ width: `${f.riskScore}%`, background: f.riskScore >= 70 ? "#dc2626" : f.riskScore >= 50 ? "#d97706" : "#16a34a" }} />
                    </div>
                    <span className="text-xs font-bold text-gray-700">{f.riskScore}/100</span>
                  </div>
                  <div className="mt-2 text-xs text-gray-500">Category: <span className="font-medium text-gray-700">{f.category}</span></div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <Card className="p-5">
          {alert ? (
            <div>
              <h3 className="font-bold text-gray-800 mb-3">Case Details</h3>
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4">
                <div className="font-mono text-xs text-red-700">{alert.id}</div>
                <div className="font-bold text-gray-900 mt-1">{alert.business}</div>
                <div className="text-xs text-gray-500 mt-0.5">{alert.category}</div>
              </div>
              <div className="text-xs text-gray-600 leading-relaxed mb-4">
                <strong className="text-gray-800">Reason for flagging:</strong><br />{alert.reason}
              </div>
              <div className="space-y-2 mb-4">
                {(["Under Review", "False Positive", "Confirmed Fraud", "Cleared"] as const).map(s => (
                  <button key={s} className={`w-full py-2 rounded-lg text-xs font-medium border transition-all ${s === "Cleared" ? "border-green-300 text-green-700 hover:bg-green-50" : s === "Confirmed Fraud" ? "border-red-300 text-red-700 hover:bg-red-50" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}>{s}</button>
                ))}
              </div>
              <textarea rows={3} className="w-full px-3 py-2 border border-gray-200 rounded-lg text-xs outline-none focus:border-blue-400" placeholder="Add investigation notes…" />
              <button className="mt-2 w-full py-2 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-all">Save & Update</button>
            </div>
          ) : (
            <div className="text-center text-gray-400 py-10">
              <div className="text-4xl mb-3">🚨</div>
              <div className="text-sm">Select a case to view details and take action</div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

// ── Geo Map ────────────────────────────────────────────────
function GeoMapPage() {
  const LOCATIONS = [
    { label: "LM-MH-PUN-000123", status: "Verified", color: "#16a34a", lat: 18.52, lng: 73.86, business: "Global Weigh Industries" },
    { label: "LM-MH-PUN-000124", status: "Scheduled", color: "#2563eb", lat: 18.53, lng: 73.84, business: "Global Weigh Industries" },
    { label: "LM-MH-NAS-000456", status: "Expired", color: "#dc2626", lat: 20.01, lng: 73.79, business: "Nashik Fuels" },
    { label: "LM-MH-MUM-000789", status: "Verified", color: "#16a34a", lat: 19.07, lng: 72.87, business: "Mumbai Gems" },
    { label: "LM-MH-NAG-001012", status: "Flagged", color: "#d97706", lat: 21.15, lng: 79.09, business: "Nagpur Petrochemicals" },
  ];

  return (
    <div className="fade-in">
      <SectionHeader title="Geo-Tagged Inspections" subtitle="GPS-verified inspection locations across Maharashtra" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <Card className="overflow-hidden">
            <div className="bg-gradient-to-br from-blue-100 to-green-50 h-80 relative flex items-center justify-center border-b border-gray-200">
              <div className="relative w-full h-full overflow-hidden">
                <svg viewBox="0 0 400 280" className="w-full h-full opacity-20">
                  <path d="M 80 60 L 320 60 L 340 200 L 280 240 L 120 230 L 60 180 Z" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="2" />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center text-gray-400 text-sm">
                  <div className="text-center">
                    <div className="text-4xl mb-2">🗺️</div>
                    <div className="font-medium text-gray-600">Maharashtra Interactive Map</div>
                    <div className="text-xs text-gray-400 mt-1">Connect Leaflet.js or Google Maps API for production</div>
                  </div>
                </div>
                {LOCATIONS.map((loc, i) => (
                  <div key={loc.label} title={`${loc.label} — ${loc.business}`}
                    className="absolute w-5 h-5 rounded-full border-2 border-white shadow-lg cursor-pointer hover:scale-125 transition-transform"
                    style={{ background: loc.color, left: `${20 + i * 14}%`, top: `${25 + (i % 3) * 20}%` }}>
                    <div className="absolute left-6 top-0 bg-white rounded-lg shadow-md border border-gray-200 px-2 py-1 text-xs font-medium text-gray-700 whitespace-nowrap hidden group-hover:block">
                      {loc.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="p-4 flex gap-4 flex-wrap text-xs">
              {[["#16a34a", "Verified"], ["#2563eb", "Scheduled"], ["#d97706", "Flagged"], ["#dc2626", "Expired"]].map(([c, l]) => (
                <div key={l} className="flex items-center gap-1.5"><div className="w-3 h-3 rounded-full" style={{ background: c }} /><span className="text-gray-600">{l}</span></div>
              ))}
            </div>
          </Card>
        </div>
        <Card className="p-5">
          <h3 className="font-bold text-gray-800 mb-4">Location Records</h3>
          <div className="space-y-3">
            {LOCATIONS.map(loc => (
              <div key={loc.label} className="p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: loc.color }} />
                  <span className="font-mono text-xs text-blue-700">{loc.label}</span>
                </div>
                <div className="text-xs text-gray-700 font-medium">{loc.business}</div>
                <div className="text-xs text-gray-400 mt-0.5 font-mono">{loc.lat.toFixed(4)}°N, {loc.lng.toFixed(4)}°E</div>
                <StatusBadge status={loc.status} />
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── Officer Complaints ─────────────────────────────────────
function OfficerComplaintsPage() {
  return (
    <div className="fade-in">
      <SectionHeader title="Complaints" subtitle="Consumer complaints assigned to you" />
      <div className="space-y-4">
        {COMPLAINTS.map(c => (
          <Card key={c.id} className="p-5">
            <div className="flex items-start justify-between flex-wrap gap-3 mb-3">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-mono text-sm font-bold text-blue-700">{c.id}</span>
                  <StatusBadge status={c.status} />
                  <StatusBadge status={c.priority} />
                </div>
                <div className="font-semibold text-gray-900">{c.category}</div>
                <div className="text-xs text-gray-500">{c.businessName} · {c.location} · {c.date}</div>
              </div>
            </div>
            <p className="text-sm text-gray-600 mb-4">{c.description}</p>
            <div className="flex gap-2 flex-wrap">
              {["Under Review", "In Progress", "Resolved"].map(s => (
                <button key={s} className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all hover:bg-gray-50 ${s === "Resolved" ? "border-green-300 text-green-700" : "border-gray-200 text-gray-600"}`}>{s}</button>
              ))}
              <button className="px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 transition-all">Add Remarks</button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// ── Officer AI Assistant ───────────────────────────────────
function OfficerAIPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "0", role: "assistant", content: "Hello Officer Priya. I am your AI assistant. I can help with inspection queries, case prioritization, evidence requirements, and measurement analysis. What would you like to know?", timestamp: new Date() }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const send = async (text?: string) => {
    const msg = text ?? input;
    if (!msg.trim()) return;
    setInput("");
    const userMsg: ChatMessage = { id: Date.now().toString(), role: "user", content: msg, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setLoading(true);
    const reply = await chatWithAssistant(msg, "officer", messages);
    setMessages(prev => [...prev, { id: Date.now().toString() + "r", role: "assistant", content: reply, timestamp: new Date() }]);
    setLoading(false);
  };

  return (
    <div className="fade-in h-full flex flex-col max-h-[calc(100vh-120px)]">
      <SectionHeader title="AI Assistant" subtitle="Context-aware assistant for officers" />
      <Card className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && <div className="w-7 h-7 rounded-full bg-orange-600 flex items-center justify-center text-white text-xs font-bold mr-2 shrink-0 mt-1">AI</div>}
              <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm ${msg.role === "user" ? "bg-orange-600 text-white rounded-br-sm" : "bg-gray-100 text-gray-800 rounded-bl-sm"}`}>{msg.content}</div>
            </div>
          ))}
          {loading && <div className="flex gap-2 items-center"><div className="w-7 h-7 rounded-full bg-orange-600 flex items-center justify-center text-white text-xs font-bold">AI</div><div className="bg-gray-100 rounded-2xl px-4 py-3 flex gap-1">{[0, 0.2, 0.4].map(d => <div key={d} className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: `${d}s` }} />)}</div></div>}
        </div>
        {messages.length <= 1 && (
          <div className="px-5 pb-3 flex gap-2 flex-wrap">
            {SUGGESTED_QUESTIONS.officer.map(q => (
              <button key={q} onClick={() => send(q)} className="text-xs px-3 py-1.5 bg-orange-50 text-orange-700 border border-orange-200 rounded-full hover:bg-orange-100 transition-all">{q}</button>
            ))}
          </div>
        )}
        <div className="p-4 border-t border-gray-100 flex gap-2">
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Ask a question…" className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-400" />
          <button onClick={() => send()} className="px-4 py-2 bg-orange-600 text-white rounded-xl text-sm font-medium hover:bg-orange-700 transition-all">Send</button>
        </div>
      </Card>
    </div>
  );
}

// ── Measurement Analysis ───────────────────────────────────
function MeasurementAnalysis() {
  const [rows, setRows] = useState([{ std: "", obs: "" }, { std: "", obs: "" }, { std: "", obs: "" }]);
  const [limit, setLimit] = useState("0.5");

  const results = rows.map(r => {
    if (!r.std || !r.obs) return null;
    const err = parseFloat(r.obs) - parseFloat(r.std);
    const pct = (err / parseFloat(r.std)) * 100;
    const pass = Math.abs(pct) <= parseFloat(limit);
    return { err, pct, pass };
  });

  return (
    <div className="fade-in">
      <SectionHeader title="Measurement Analysis" subtitle="Multi-reading error calculation" />
      <Card className="p-6 max-w-2xl">
        <div className="flex items-center gap-4 mb-4">
          <label className="text-sm font-medium text-gray-700">Permissible Limit (%):</label>
          <input value={limit} onChange={e => setLimit(e.target.value)} className="w-20 px-3 py-1.5 border border-gray-200 rounded-lg text-sm font-mono outline-none focus:border-blue-400" />
        </div>
        <table className="w-full text-sm mb-4">
          <thead><tr className="text-left text-xs text-gray-500 border-b border-gray-100">
            <th className="pb-2 pr-3">#</th>
            <th className="pb-2 pr-3">Standard Value</th>
            <th className="pb-2 pr-3">Observed Value</th>
            <th className="pb-2 pr-3">Error</th>
            <th className="pb-2 pr-3">% Error</th>
            <th className="pb-2">Result</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-50">
            {rows.map((row, i) => (
              <tr key={i}>
                <td className="py-2 pr-3 text-gray-400">{i + 1}</td>
                <td className="py-2 pr-3"><input value={row.std} onChange={e => setRows(rows.map((r, j) => j === i ? { ...r, std: e.target.value } : r))} className="w-24 px-2 py-1 border border-gray-200 rounded font-mono text-sm outline-none focus:border-blue-400" /></td>
                <td className="py-2 pr-3"><input value={row.obs} onChange={e => setRows(rows.map((r, j) => j === i ? { ...r, obs: e.target.value } : r))} className="w-24 px-2 py-1 border border-gray-200 rounded font-mono text-sm outline-none focus:border-blue-400" /></td>
                <td className="py-2 pr-3 font-mono text-sm">{results[i] ? `${results[i]!.err >= 0 ? "+" : ""}${results[i]!.err.toFixed(4)}` : "—"}</td>
                <td className="py-2 pr-3 font-mono text-sm">{results[i] ? `${results[i]!.pct >= 0 ? "+" : ""}${results[i]!.pct.toFixed(4)}%` : "—"}</td>
                <td className="py-2">{results[i] ? <span className={`font-bold text-xs ${results[i]!.pass ? "text-green-600" : "text-red-600"}`}>{results[i]!.pass ? "✅ PASS" : "❌ FAIL"}</span> : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={() => setRows([...rows, { std: "", obs: "" }])} className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-all">+ Add Reading</button>
      </Card>
    </div>
  );
}

// ── Main Officer Portal ────────────────────────────────────
export default function OfficerPortal({ page, lang, onPageChange }: Props) {
  const pages: Record<string, React.ReactNode> = {
    dashboard: <OfficerDashboard onPageChange={onPageChange} />,
    myAssignments: <AssignmentsPage onPageChange={onPageChange} />,
    scanInstrument: <AssignmentsPage onPageChange={onPageChange} />,
    fieldVerification: <FieldVerification />,
    instrumentHistory: <AssignmentsPage onPageChange={onPageChange} />,
    measurementAnalysis: <MeasurementAnalysis />,
    fraudDetection: <FraudDetectionPage />,
    geoMap: <GeoMapPage />,
    certificates: <div className="fade-in"><div className="bg-white rounded-xl p-8 text-center text-gray-500">Certificates issued by you will appear here.</div></div>,
    complaints: <OfficerComplaintsPage />,
    aiAssistant: <OfficerAIPage />,
    notifications: <div className="fade-in"><Card className="p-5">{NOTIFICATIONS.map(n => <div key={n.id} className="flex gap-3 p-3 mb-2 bg-gray-50 rounded-lg border border-gray-100"><span>{n.type === "warning" ? "⚠️" : "ℹ️"}</span><div><div className="text-sm font-semibold text-gray-800">{n.title}</div><div className="text-xs text-gray-500">{n.message}</div></div></div>)}</Card></div>,
    profile: <div className="fade-in"><Card className="p-6 max-w-lg"><div className="text-xl font-bold text-gray-900 mb-1">Officer Priya Sharma</div><div className="text-gray-500 text-sm mb-4">LM102 · Pune District · Legal Metrology Officer</div><div className="grid grid-cols-2 gap-3 text-sm">{[["Specialization", "Weighing Instruments"], ["District", "Pune"], ["Active Cases", "4"], ["Completed", "128"]].map(([k, v]) => <div key={k} className="bg-gray-50 p-3 rounded-lg border border-gray-100"><div className="text-xs text-gray-400">{k}</div><div className="font-medium text-gray-800">{v}</div></div>)}</div></Card></div>,
  };

  return <>{pages[page] ?? <OfficerDashboard onPageChange={onPageChange} />}</>;
}
