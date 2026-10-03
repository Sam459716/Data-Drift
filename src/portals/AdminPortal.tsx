import { useState } from "react";
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import type { Lang } from "../data/mockData";
import { INSTRUMENTS, APPLICATIONS, CERTIFICATES, COMPLAINTS, OFFICERS_LIST, AUDIT_LOGS, FRAUD_ALERTS, ANALYTICS_DATA } from "../data/mockData";
import { chatWithAssistant, SUGGESTED_QUESTIONS, type ChatMessage } from "../services/aiService";
import {
  ANTI_GAMING_CASES, ANTI_GAMING_STATS, calculateTrustScore,
  type AntiGamingCase, type AntiGamingStatus,
} from "../services/antiGamingService";
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

// ── Admin Dashboard ────────────────────────────────────────
function AdminDashboard({ onPageChange }: { onPageChange: (p: string) => void }) {
  return (
    <div className="fade-in">
      <SectionHeader title="Admin Dashboard" subtitle="Legal Metrology Department, Maharashtra — System Overview" />

      {/* KPI Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {[
          { label: "Total Instruments", val: "2,236", sub: "+48 this month", icon: "⚖️", color: "border-blue-300 bg-blue-50", txt: "text-blue-700" },
          { label: "Verified", val: "1,820", sub: "81.4% of total", icon: "✅", color: "border-green-300 bg-green-50", txt: "text-green-700" },
          { label: "Pending Applications", val: "184", sub: "12 high priority", icon: "📋", color: "border-yellow-300 bg-yellow-50", txt: "text-yellow-700" },
          { label: "Fraud Alerts", val: FRAUD_ALERTS.length, sub: "1 critical pending", icon: "🚨", color: "border-red-300 bg-red-50", txt: "text-red-700" },
        ].map(k => (
          <Card key={k.label} className={`p-5 border-l-4 ${k.color}`}>
            <div className="flex items-center justify-between mb-1"><span className="text-2xl">{k.icon}</span><span className={`text-3xl font-black ${k.txt}`}>{k.val}</span></div>
            <div className="text-sm font-medium text-gray-700">{k.label}</div>
            <div className="text-xs text-gray-400 mt-0.5">{k.sub}</div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Officers Active", val: OFFICERS_LIST.length, icon: "👮", color: "text-indigo-700" },
          { label: "Expired Certificates", val: "248", icon: "⏰", color: "text-orange-600" },
          { label: "Total Complaints", val: COMPLAINTS.length, icon: "📣", color: "text-pink-600" },
          { label: "Avg. Processing Time", val: "4.2 days", icon: "⏱️", color: "text-teal-700" },
        ].map(k => (
          <Card key={k.label} className="p-4 flex items-center gap-4">
            <span className="text-2xl">{k.icon}</span>
            <div>
              <div className={`text-2xl font-black ${k.color}`}>{k.val}</div>
              <div className="text-xs text-gray-500">{k.label}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
        <Card className="p-5">
          <h3 className="font-bold text-gray-800 mb-4">Applications Trend (6 months)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={ANALYTICS_DATA.applicationsTrend} margin={{ top: 0, right: 0, bottom: 0, left: -20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="submitted" name="Submitted" fill="#3b82f6" radius={[3, 3, 0, 0]} />
              <Bar dataKey="approved" name="Approved" fill="#16a34a" radius={[3, 3, 0, 0]} />
              <Bar dataKey="rejected" name="Rejected" fill="#dc2626" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h3 className="font-bold text-gray-800 mb-4">Pass / Fail Statistics</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={ANALYTICS_DATA.passFailRatio} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                {ANALYTICS_DATA.passFailRatio.map((entry, i) => <Cell key={i} fill={entry.color} />)}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* District-wise + Officers */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-gray-800">District-wise Summary</h3>
            <button onClick={() => onPageChange("analytics")} className="text-xs text-blue-600 hover:underline">Full analytics →</button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr className="text-left text-gray-400 border-b border-gray-100 pb-2">
                <th className="pb-2 pr-3">District</th>
                <th className="pb-2 pr-3">Instruments</th>
                <th className="pb-2 pr-3">Verified</th>
                <th className="pb-2 pr-3">Pending</th>
                <th className="pb-2">Complaints</th>
              </tr></thead>
              <tbody className="divide-y divide-gray-50">
                {ANALYTICS_DATA.districtWise.map(d => (
                  <tr key={d.district} className="hover:bg-gray-50">
                    <td className="py-2.5 pr-3 font-semibold text-gray-800">{d.district}</td>
                    <td className="py-2.5 pr-3 text-gray-700">{d.instruments}</td>
                    <td className="py-2.5 pr-3 text-green-700 font-medium">{d.verified}</td>
                    <td className="py-2.5 pr-3">
                      <div className="flex items-center gap-1">
                        <div className="w-12 bg-gray-100 rounded-full h-1.5"><div className="h-1.5 bg-yellow-400 rounded-full" style={{ width: `${(d.pending / d.instruments) * 100 * 3}%` }} /></div>
                        <span className="text-yellow-700">{d.pending}</span>
                      </div>
                    </td>
                    <td className="py-2.5 text-red-600">{d.complaints}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="font-bold text-gray-800 mb-4">Officer Workload</h3>
          <div className="space-y-3">
            {OFFICERS_LIST.map(o => (
              <div key={o.id} className="bg-gray-50 rounded-lg p-2.5 border border-gray-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-semibold text-gray-800 truncate">{o.name.replace("Officer ", "")}</span>
                  <StatusBadge status={o.workload === "Low" ? "Approved" : o.workload === "High" ? "High Risk" : "Scheduled"} />
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex-1 bg-gray-200 rounded-full h-1.5 overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${(o.activeAssignments / 10) * 100}%`, background: o.workload === "High" ? "#dc2626" : o.workload === "Medium" ? "#d97706" : "#16a34a" }} />
                  </div>
                  <span className="text-xs text-gray-500">{o.activeAssignments} cases</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── Advanced Analytics ─────────────────────────────────────
function AnalyticsPage() {
  const [dateFilter, setDateFilter] = useState("30d");
  const [activeTab, setActiveTab] = useState("applications");

  const TABS = [
    { key: "applications", label: "Applications" },
    { key: "geography", label: "Geography" },
    { key: "compliance", label: "Compliance" },
    { key: "fraud", label: "Fraud" },
    { key: "officers", label: "Officers" },
  ];

  const OFFICER_WORKLOAD_DATA = OFFICERS_LIST.map(o => ({
    name: o.name.replace("Officer ", ""),
    assignments: o.activeAssignments,
    score: o.score,
  }));

  const FRAUD_TREND = [
    { month: "Mar", alerts: 2, confirmed: 0 }, { month: "Apr", alerts: 3, confirmed: 1 },
    { month: "May", alerts: 4, confirmed: 1 }, { month: "Jun", alerts: 3, confirmed: 2 },
    { month: "Jul", alerts: 5, confirmed: 2 }, { month: "Aug", alerts: 3, confirmed: 1 },
  ];

  return (
    <div className="fade-in">
      <SectionHeader title="Advanced Analytics" subtitle="Comprehensive platform intelligence and reporting"
        actions={
          <div className="flex gap-2">
            {["7d", "30d", "6m", "1y"].map(d => (
              <button key={d} onClick={() => setDateFilter(d)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${dateFilter === d ? "bg-blue-600 text-white" : "bg-white text-gray-600 border border-gray-200"}`}>{d}</button>
            ))}
            <button className="px-3 py-1.5 rounded-lg text-xs font-medium bg-white text-gray-600 border border-gray-200 hover:bg-gray-50">Export ↓</button>
          </div>
        }
      />

      {/* Tab bar */}
      <div className="flex gap-1 bg-white rounded-xl border border-gray-200 p-1 mb-5 overflow-x-auto">
        {TABS.map(tab => (
          <button key={tab.key} onClick={() => setActiveTab(tab.key)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === tab.key ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}>
            {tab.label}
          </button>
        ))}
      </div>

      {activeTab === "applications" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {/* Applications trend */}
          <Card className="p-5 lg:col-span-2">
            <h3 className="font-bold text-gray-800 mb-4">Applications — Submitted vs Approved vs Rejected</h3>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={ANALYTICS_DATA.applicationsTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                <Line type="monotone" dataKey="submitted" name="Submitted" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="approved" name="Approved" stroke="#16a34a" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="rejected" name="Rejected" stroke="#dc2626" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-5">
            <h3 className="font-bold text-gray-800 mb-4">Instrument Types Distribution</h3>
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={ANALYTICS_DATA.instrumentTypes} dataKey="count" nameKey="type" cx="50%" cy="50%" outerRadius={80}>
                  {ANALYTICS_DATA.instrumentTypes.map((_, i) => (
                    <Cell key={i} fill={["#3b82f6", "#16a34a", "#d97706", "#8b5cf6", "#ec4899", "#6b7280"][i]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} formatter={(v, n) => [v, n]} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-5">
            <h3 className="font-bold text-gray-800 mb-4">District-wise Instruments</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={ANALYTICS_DATA.districtWise} layout="vertical" margin={{ left: 20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="district" tick={{ fontSize: 11 }} width={80} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Bar dataKey="verified" name="Verified" fill="#16a34a" radius={[0, 3, 3, 0]} />
                <Bar dataKey="pending" name="Pending" fill="#d97706" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {activeTab === "geography" && (
        <div className="space-y-5">
          <Card className="p-5">
            <h3 className="font-bold text-gray-800 mb-4">Inspections by District</h3>
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={ANALYTICS_DATA.districtWise}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="district" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Bar dataKey="instruments" name="Instruments" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                <Bar dataKey="complaints" name="Complaints" fill="#dc2626" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>
        </div>
      )}

      {activeTab === "compliance" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card className="p-5">
            <h3 className="font-bold text-gray-800 mb-4">Compliance Score Distribution</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={ANALYTICS_DATA.complianceDist} layout="vertical" margin={{ left: 10 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                <XAxis type="number" tick={{ fontSize: 11 }} />
                <YAxis type="category" dataKey="range" tick={{ fontSize: 10 }} width={150} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Bar dataKey="count" name="Businesses" radius={[0, 3, 3, 0]}>
                  {ANALYTICS_DATA.complianceDist.map((_, i) => (
                    <Cell key={i} fill={["#16a34a", "#22c55e", "#d97706", "#f97316", "#dc2626"][i]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </Card>
          <Card className="p-5">
            <h3 className="font-bold text-gray-800 mb-4">Compliance Summary</h3>
            <div className="space-y-4">
              {[["Certificate Compliance", 92], ["Inspection Compliance", 84], ["Complaint Record", 78], ["Documentation", 89], ["Renewal History", 76]].map(([label, score]) => (
                <div key={label}>
                  <div className="flex justify-between text-sm mb-1"><span className="text-gray-700 font-medium">{label}</span><span className="font-bold">{score}%</span></div>
                  <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div className="h-full rounded-full" style={{ width: `${score}%`, background: Number(score) >= 85 ? "#16a34a" : Number(score) >= 70 ? "#d97706" : "#dc2626" }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {activeTab === "fraud" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Card className="p-5">
            <h3 className="font-bold text-gray-800 mb-4">Fraud Alerts Trend</h3>
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={FRAUD_TREND}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Line type="monotone" dataKey="alerts" name="Alerts" stroke="#d97706" strokeWidth={2} dot={{ r: 3 }} />
                <Line type="monotone" dataKey="confirmed" name="Confirmed" stroke="#dc2626" strokeWidth={2} dot={{ r: 3 }} />
              </LineChart>
            </ResponsiveContainer>
          </Card>
          <Card className="p-5">
            <h3 className="font-bold text-gray-800 mb-4">Active Fraud Alerts</h3>
            {FRAUD_ALERTS.map(f => (
              <div key={f.id} className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-mono text-xs text-blue-700">{f.id}</span>
                  <StatusBadge status={f.riskLevel} />
                </div>
                <div className="text-sm font-medium text-gray-800">{f.business}</div>
                <div className="flex items-center gap-2 mt-1">
                  <div className="flex-1 h-1.5 bg-gray-200 rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${f.riskScore}%`, background: "#dc2626" }} /></div>
                  <span className="text-xs font-bold text-gray-700">{f.riskScore}/100</span>
                </div>
              </div>
            ))}
          </Card>
        </div>
      )}

      {activeTab === "officers" && (
        <Card className="p-5">
          <h3 className="font-bold text-gray-800 mb-4">Officer Performance</h3>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={OFFICER_WORKLOAD_DATA}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="assignments" name="Active Cases" fill="#3b82f6" radius={[3, 3, 0, 0]} />
              <Bar dataKey="score" name="Performance Score" fill="#16a34a" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      )}
    </div>
  );
}

// ── Users Management ───────────────────────────────────────
function UsersPage() {
  const USERS = [
    { id: "USR001", name: "Rajesh Kumar", email: "rajesh@globalweigh.in", business: "Global Weigh Industries", district: "Pune", instruments: 5, status: "Active", joined: "2023-01-15" },
    { id: "USR002", name: "Meera Joshi", email: "meera@nashikfuels.in", business: "Nashik Fuels Pvt Ltd", district: "Nashik", instruments: 8, status: "Active", joined: "2022-08-20" },
    { id: "USR003", name: "Amit Patil", email: "amit@mumbaigems.in", business: "Mumbai Gems & Jewels", district: "Mumbai", instruments: 3, status: "Active", joined: "2024-01-10" },
    { id: "USR004", name: "Sanjay Chavan", email: "sanjay@nagpurpetro.in", business: "Nagpur Petrochemicals", district: "Nagpur", instruments: 12, status: "Suspended", joined: "2021-11-05" },
  ];
  return (
    <div className="fade-in">
      <SectionHeader title="User Management" subtitle="All registered businesses and users" actions={<button className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">+ Add User</button>} />
      <Card className="p-5">
        <div className="flex gap-3 mb-4 flex-wrap">
          <input placeholder="Search users…" className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400 w-52" />
          <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none text-gray-600">
            <option>All Districts</option>
            {["Pune", "Mumbai", "Nashik", "Nagpur", "Aurangabad", "Thane"].map(d => <option key={d}>{d}</option>)}
          </select>
        </div>
        <table className="w-full text-sm">
          <thead><tr className="text-left text-xs text-gray-500 border-b border-gray-100">
            <th className="pb-2 pr-4">ID</th><th className="pb-2 pr-4">Name</th><th className="pb-2 pr-4">Business</th>
            <th className="pb-2 pr-4">District</th><th className="pb-2 pr-4">Instruments</th><th className="pb-2 pr-4">Status</th><th className="pb-2">Joined</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-50">
            {USERS.map(u => (
              <tr key={u.id} className="hover:bg-gray-50">
                <td className="py-3 pr-4 font-mono text-xs text-blue-700">{u.id}</td>
                <td className="py-3 pr-4 font-medium text-gray-900">{u.name}</td>
                <td className="py-3 pr-4 text-gray-600 text-xs">{u.business}</td>
                <td className="py-3 pr-4 text-gray-600">{u.district}</td>
                <td className="py-3 pr-4 text-center font-bold text-blue-700">{u.instruments}</td>
                <td className="py-3 pr-4"><StatusBadge status={u.status} /></td>
                <td className="py-3 text-xs text-gray-400">{u.joined}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ── Officers Management ────────────────────────────────────
function OfficersPage() {
  const [showAssign, setShowAssign] = useState(false);

  return (
    <div className="fade-in">
      <SectionHeader title="Officer Management" subtitle="Smart assignment engine & workload overview"
        actions={<button onClick={() => setShowAssign(!showAssign)} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700">🤖 Smart Assignment</button>} />

      {showAssign && (
        <Card className="p-5 mb-5 bg-blue-50 border-blue-200">
          <h3 className="font-bold text-gray-800 mb-3">AI-Powered Officer Assignment</h3>
          <div className="text-sm text-gray-600 mb-4">Application: LM-APP-2024-0893 · Nagpur Petrochemicals · Tank Truck Meter</div>
          <div className="space-y-3">
            {OFFICERS_LIST.sort((a, b) => b.score - a.score).map((o, i) => (
              <div key={o.id} className={`p-3 rounded-xl border bg-white ${i === 0 ? "border-green-400 ring-2 ring-green-100" : "border-gray-200"}`}>
                <div className="flex items-center justify-between">
                  <div>
                    {i === 0 && <span className="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-bold mr-2">🤖 Recommended</span>}
                    <span className="font-semibold text-sm text-gray-900">{o.name}</span>
                  </div>
                  <button className={`px-3 py-1.5 rounded-lg text-xs font-medium ${i === 0 ? "bg-green-600 text-white hover:bg-green-700" : "border border-gray-200 text-gray-600 hover:bg-gray-50"} transition-all`}>
                    {i === 0 ? "✓ Assign" : "Override"}
                  </button>
                </div>
                <div className="mt-2 grid grid-cols-3 gap-2 text-xs text-gray-500">
                  <span>📍 {o.district}</span>
                  <span>📋 {o.activeAssignments} cases</span>
                  <span>⭐ {o.specialization.split(" ")[0]}</span>
                </div>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full rounded-full bg-blue-500" style={{ width: `${o.score}%` }} /></div>
                  <span className="text-xs font-bold text-blue-700">{o.score} pts</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      <Card className="p-5">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-xs text-gray-500 border-b border-gray-100">
            <th className="pb-2 pr-4">ID</th><th className="pb-2 pr-4">Name</th><th className="pb-2 pr-4">District</th>
            <th className="pb-2 pr-4">Specialization</th><th className="pb-2 pr-4">Active Cases</th><th className="pb-2 pr-4">Workload</th><th className="pb-2">Score</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-50">
            {OFFICERS_LIST.map(o => (
              <tr key={o.id} className="hover:bg-gray-50">
                <td className="py-3 pr-4 font-mono text-xs text-blue-700">{o.id}</td>
                <td className="py-3 pr-4 font-medium text-gray-900">{o.name}</td>
                <td className="py-3 pr-4 text-gray-600">{o.district}</td>
                <td className="py-3 pr-4 text-gray-600 text-xs">{o.specialization}</td>
                <td className="py-3 pr-4 text-center font-bold">{o.activeAssignments}</td>
                <td className="py-3 pr-4"><StatusBadge status={o.workload === "Low" ? "Approved" : o.workload === "High" ? "High Risk" : "Scheduled"} /></td>
                <td className="py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full rounded-full bg-blue-500" style={{ width: `${o.score}%` }} /></div>
                    <span className="text-xs font-bold text-gray-700">{o.score}</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ── Admin Complaints ───────────────────────────────────────
function AdminComplaintsPage() {
  const [filter, setFilter] = useState("All");
  const filtered = filter === "All" ? COMPLAINTS : COMPLAINTS.filter(c => c.status === filter || c.priority === filter);

  return (
    <div className="fade-in">
      <SectionHeader title="Complaint Management" subtitle="Monitor, assign and resolve all complaints" />

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mb-5">
        {[["Total", COMPLAINTS.length, "📣", "text-blue-700"], ["Assigned", COMPLAINTS.filter(c => c.status === "Assigned" || c.status === "Under Investigation").length, "🔍", "text-yellow-700"], ["Resolved", COMPLAINTS.filter(c => c.status === "Resolved").length, "✅", "text-green-700"], ["High Priority", COMPLAINTS.filter(c => c.priority === "High" || c.priority === "Urgent").length, "🔴", "text-red-700"], ["Avg Resolution", "3.4d", "⏱️", "text-purple-700"]].map(([l, v, i, c]) => (
          <Card key={String(l)} className="p-4 text-center">
            <div className="text-xl mb-1">{i}</div>
            <div className={`text-2xl font-black ${c}`}>{v}</div>
            <div className="text-xs text-gray-500 mt-0.5">{l}</div>
          </Card>
        ))}
      </div>

      <div className="flex gap-2 mb-4 flex-wrap">
        {["All", "Submitted", "Under Investigation", "Resolved", "Urgent", "High"].map(s => (
          <button key={s} onClick={() => setFilter(s)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filter === s ? "bg-blue-600 text-white" : "bg-white text-gray-600 border border-gray-200"}`}>{s}</button>
        ))}
      </div>

      <Card className="p-5">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-xs text-gray-500 border-b border-gray-100">
            <th className="pb-2 pr-3">ID</th><th className="pb-2 pr-3">Category</th><th className="pb-2 pr-3">Business</th>
            <th className="pb-2 pr-3">Location</th><th className="pb-2 pr-3">Priority</th><th className="pb-2 pr-3">Status</th><th className="pb-2">Officer</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-50">
            {filtered.map(c => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="py-3 pr-3 font-mono text-xs text-blue-700">{c.id}</td>
                <td className="py-3 pr-3 font-medium text-gray-800 text-xs">{c.category}</td>
                <td className="py-3 pr-3 text-gray-600 text-xs">{c.businessName}</td>
                <td className="py-3 pr-3 text-gray-500 text-xs">{c.location}</td>
                <td className="py-3 pr-3"><StatusBadge status={c.priority} /></td>
                <td className="py-3 pr-3"><StatusBadge status={c.status} /></td>
                <td className="py-3 text-xs text-gray-500">{c.assignedOfficer ?? <span className="text-red-500">Unassigned</span>}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ── Audit Logs ─────────────────────────────────────────────
function AuditLogsPage() {
  return (
    <div className="fade-in">
      <SectionHeader title="Audit Logs" subtitle="Complete immutable trail of all system actions" actions={<button className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm border border-gray-200 hover:bg-gray-200">Export CSV</button>} />
      <Card className="p-5">
        <div className="flex gap-3 mb-4">
          <input placeholder="Search logs…" className="px-3 py-2 border border-gray-200 rounded-lg text-sm outline-none focus:border-blue-400 w-52" />
          <select className="px-3 py-2 border border-gray-200 rounded-lg text-sm text-gray-600"><option>All Roles</option><option>Officer</option><option>Admin</option><option>User</option><option>System</option></select>
        </div>
        <div className="space-y-2">
          {AUDIT_LOGS.map(log => (
            <div key={log.id} className="flex items-start gap-4 p-3 bg-gray-50 rounded-lg border border-gray-100 hover:border-gray-200 transition-all">
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center text-xs font-bold text-blue-700 shrink-0">
                {log.role.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-semibold text-sm text-gray-800">{log.user}</span>
                  <span className="text-xs px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded font-medium">{log.role}</span>
                </div>
                <div className="text-sm text-gray-600 mt-0.5">{log.action}</div>
                <div className="text-xs text-gray-400 mt-0.5">Record: <span className="font-mono text-blue-600">{log.record}</span></div>
                {log.prev && <div className="text-xs mt-0.5 text-gray-400">{log.prev} → <span className="text-green-600 font-medium">{log.next}</span></div>}
              </div>
              <div className="text-xs text-gray-400 shrink-0 text-right">{log.timestamp}</div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

// ── Settings ───────────────────────────────────────────────
function SettingsPage() {
  return (
    <div className="fade-in">
      <SectionHeader title="System Settings" subtitle="Configure fees, limits, and platform parameters" />
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <Card className="p-5">
          <h3 className="font-bold text-gray-800 mb-4">Verification Fees (Configurable)</h3>
          <div className="space-y-3">
            {[["Initial Verification — Weighing Scale", "800"], ["Initial Verification — Fuel Dispenser", "2500"], ["Re-verification — Weighing Scale", "1200"], ["Re-verification — Fuel Dispenser", "3000"], ["Jewellery Scale", "600"], ["Tank Truck Meter", "3500"]].map(([label, val]) => (
              <div key={label} className="flex items-center justify-between gap-3">
                <span className="text-sm text-gray-700">{label}</span>
                <div className="flex items-center gap-1"><span className="text-sm text-gray-500">₹</span><input defaultValue={val} className="w-20 px-2 py-1 border border-gray-200 rounded font-mono text-sm text-right outline-none focus:border-blue-400" /></div>
              </div>
            ))}
          </div>
          <button className="mt-4 px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all">Save Fees</button>
        </Card>
        <Card className="p-5">
          <h3 className="font-bold text-gray-800 mb-4">Permissible Limits (Configurable)</h3>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mb-4 text-xs text-amber-700">
            ⚠️ These limits are configurable placeholders. Always refer to official Legal Metrology regulations for actual permissible limits.
          </div>
          <div className="space-y-3">
            {[["Weighing Scale ± Error", "0.5", "%"], ["Fuel Dispenser ± Error", "0.3", "%"], ["Jewellery Scale ± Error", "0.1", "%"], ["Tank Truck Meter ± Error", "0.5", "%"]].map(([label, val, unit]) => (
              <div key={label} className="flex items-center justify-between gap-3">
                <span className="text-sm text-gray-700">{label}</span>
                <div className="flex items-center gap-1"><input defaultValue={val} className="w-16 px-2 py-1 border border-gray-200 rounded font-mono text-sm text-right outline-none focus:border-blue-400" /><span className="text-sm text-gray-500">{unit}</span></div>
              </div>
            ))}
          </div>
          <button className="mt-4 px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all">Save Limits</button>
        </Card>
        <Card className="p-5">
          <h3 className="font-bold text-gray-800 mb-4">Notification Settings</h3>
          <div className="space-y-3">
            {[["Certificate expiry — 90 days before", true], ["Certificate expiry — 60 days before", true], ["Certificate expiry — 30 days before", true], ["Fraud alert email to admin", true], ["Auto-assign officer on application", false]].map(([label, def]) => (
              <div key={String(label)} className="flex items-center justify-between">
                <span className="text-sm text-gray-700">{label}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" defaultChecked={def as boolean} className="sr-only peer" />
                  <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 transition-colors" />
                  <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5 shadow" />
                </label>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}

// ── Admin AI ───────────────────────────────────────────────
function AdminAIPage() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { id: "0", role: "assistant", content: "Hello Director Patil. I'm your admin AI assistant. I can provide insights on applications, complaints, officer workload, fraud alerts, and compliance trends. How can I help?", timestamp: new Date() }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const send = async (text?: string) => {
    const msg = text ?? input;
    if (!msg.trim()) return;
    setInput("");
    setMessages(prev => [...prev, { id: Date.now().toString(), role: "user", content: msg, timestamp: new Date() }]);
    setLoading(true);
    const reply = await chatWithAssistant(msg, "admin", messages);
    setMessages(prev => [...prev, { id: Date.now().toString() + "r", role: "assistant", content: reply, timestamp: new Date() }]);
    setLoading(false);
  };

  return (
    <div className="fade-in h-full flex flex-col max-h-[calc(100vh-120px)]">
      <SectionHeader title="AI Assistant" subtitle="Admin analytics assistant" />
      <Card className="flex-1 flex flex-col overflow-hidden">
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              {msg.role === "assistant" && <div className="w-7 h-7 rounded-full bg-purple-700 flex items-center justify-center text-white text-xs font-bold mr-2 shrink-0 mt-1">AI</div>}
              <div className={`max-w-[75%] rounded-2xl px-4 py-3 text-sm ${msg.role === "user" ? "bg-purple-700 text-white rounded-br-sm" : "bg-gray-100 text-gray-800 rounded-bl-sm"}`}>{msg.content}</div>
            </div>
          ))}
          {loading && <div className="flex gap-2 items-center"><div className="w-7 h-7 rounded-full bg-purple-700 flex items-center justify-center text-white text-xs font-bold">AI</div><div className="bg-gray-100 rounded-2xl px-4 py-3 flex gap-1">{[0, 0.2, 0.4].map(d => <div key={d} className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: `${d}s` }} />)}</div></div>}
        </div>
        {messages.length <= 1 && (
          <div className="px-5 pb-3 flex gap-2 flex-wrap">
            {SUGGESTED_QUESTIONS.admin.map(q => (
              <button key={q} onClick={() => send(q)} className="text-xs px-3 py-1.5 bg-purple-50 text-purple-700 border border-purple-200 rounded-full hover:bg-purple-100">{q}</button>
            ))}
          </div>
        )}
        <div className="p-4 border-t border-gray-100 flex gap-2">
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Ask an admin query…" className="flex-1 px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm outline-none focus:border-purple-400" />
          <button onClick={() => send()} className="px-4 py-2 bg-purple-700 text-white rounded-xl text-sm font-medium hover:bg-purple-800 transition-all">Send</button>
        </div>
      </Card>
    </div>
  );
}

// ── Admin Portal ───────────────────────────────────────────
// ── Anti-Gaming & Trust Engine Page ────────────────────────
const RISK_COLOR: Record<string, string> = { LOW: "text-green-700", MEDIUM: "text-amber-600", HIGH: "text-orange-600", CRITICAL: "text-red-700" };
const STATUS_STYLES: Record<AntiGamingStatus, string> = {
  NORMAL: "bg-green-50 text-green-700 border-green-200",
  UNDER_REVIEW: "bg-amber-50 text-amber-700 border-amber-200",
  CLEARED: "bg-blue-50 text-blue-700 border-blue-200",
  CONFIRMED_MANIPULATION: "bg-red-50 text-red-700 border-red-200",
};
const STATUS_LABEL: Record<AntiGamingStatus, string> = {
  NORMAL: "Normal",
  UNDER_REVIEW: "Under Review",
  CLEARED: "Cleared",
  CONFIRMED_MANIPULATION: "Confirmed Manipulation",
};

function AntiGamingPage() {
  const [selected, setSelected] = useState<AntiGamingCase | null>(null);
  const [localCases, setLocalCases] = useState<AntiGamingCase[]>(ANTI_GAMING_CASES);
  const [remarkDraft, setRemarkDraft] = useState("");

  const updateCase = (id: string, status: AntiGamingStatus, remark?: string) => {
    setLocalCases(prev => prev.map(c =>
      c.id === id ? { ...c, status, remarks: remark ?? c.remarks } : c
    ));
    if (selected?.id === id) {
      setSelected(prev => prev ? { ...prev, status, remarks: remark ?? prev.remarks } : prev);
    }
  };

  if (selected) {
    const ts = calculateTrustScore(selected.vendorId.toLowerCase().replace("vendor-", "shop-"));
    return (
      <div className="fade-in">
        <div className="flex items-center gap-3 mb-5">
          <button onClick={() => setSelected(null)} className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50">← Back</button>
          <div>
            <div className="font-bold text-gray-900 text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Case {selected.id} — {selected.vendorName}</div>
            <div className="text-xs text-amber-600 font-medium">⚠️ AI/Automated Detection — Human Review Required</div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-5">
          {/* Vendor profile */}
          <Card className="p-5 col-span-2">
            <h3 className="font-bold text-gray-800 mb-4 text-sm">Vendor Profile & Activity</h3>
            <div className="grid grid-cols-2 gap-4 mb-4">
              {[
                ["Vendor", selected.vendorName],
                ["Case ID", selected.id],
                ["Risk Level", selected.riskLevel],
                ["Status", STATUS_LABEL[selected.status]],
                ["Rating Before", selected.ratingBefore + " ★"],
                ["Rating Recent", selected.ratingRecent + " ★ ↑"],
                ["Activity Volume", selected.recentActivityVolume],
                ["Flagged At", new Date(selected.flaggedAt).toLocaleString("en-IN")],
              ].map(([l, v]) => (
                <div key={String(l)}>
                  <div className="text-xs text-gray-400 font-medium">{l}</div>
                  <div className={`text-sm font-semibold ${l === "Risk Level" ? RISK_COLOR[String(v).split(" ")[0]] ?? "text-gray-800" : "text-gray-800"}`}>{v}</div>
                </div>
              ))}
            </div>

            <div className="mb-4">
              <div className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Detection Reasons</div>
              <div className="space-y-2">
                {selected.detectionReasons.map((r, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
                    <span className="text-red-400 mt-0.5">⚠</span> {r}
                  </div>
                ))}
              </div>
            </div>

            {/* Rating comparison */}
            <div className="flex gap-4">
              <div className="flex-1 bg-gray-50 rounded-xl p-3 text-center">
                <div className="text-xs text-gray-400 mb-1">Historical Avg</div>
                <div className="text-2xl font-black text-gray-700">{selected.ratingBefore} ★</div>
              </div>
              <div className="flex items-center text-gray-300 text-xl">→</div>
              <div className="flex-1 bg-red-50 border border-red-200 rounded-xl p-3 text-center">
                <div className="text-xs text-red-400 mb-1">Recent (Suspicious)</div>
                <div className="text-2xl font-black text-red-600">{selected.ratingRecent} ★</div>
              </div>
            </div>
          </Card>

          {/* Trust Score breakdown */}
          <Card className="p-5">
            <h3 className="font-bold text-gray-800 mb-4 text-sm">Trust Score Breakdown</h3>
            <div className="flex justify-center mb-4">
              <div className="relative w-24 h-24">
                <svg viewBox="0 0 88 88" className="w-full h-full">
                  <circle cx="44" cy="44" r="36" fill="none" stroke="#f1f5f9" strokeWidth="8" />
                  <circle cx="44" cy="44" r="36" fill="none" stroke={ts.finalScore >= 70 ? "#16a34a" : ts.finalScore >= 50 ? "#d97706" : "#dc2626"} strokeWidth="8"
                    strokeDasharray={`${(ts.finalScore / 100) * 2 * Math.PI * 36} ${2 * Math.PI * 36}`}
                    strokeDashoffset={2 * Math.PI * 36 / 4} strokeLinecap="round" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <div className="text-xl font-black text-gray-900">{ts.finalScore}</div>
                  <div className="text-[9px] text-gray-400">/ 100</div>
                </div>
              </div>
            </div>
            <div className="space-y-2 text-xs">
              {[
                ["Customer Ratings", ts.ratingComponent, 35, "#f59e0b"],
                ["Verified Compliance", ts.complianceComponent, 30, "#16a34a"],
                ["Verification History", ts.verificationComponent, 25, "#3b82f6"],
              ].map(([l, v, m, c]) => (
                <div key={String(l)}>
                  <div className="flex justify-between mb-0.5"><span className="text-gray-600">{l}</span><span className="font-bold">{String(v)}/{m}</span></div>
                  <div className="h-1.5 bg-gray-100 rounded-full"><div className="h-full rounded-full" style={{ width: `${(Number(v) / Number(m)) * 100}%`, background: String(c) }} /></div>
                </div>
              ))}
              {ts.complaintPenalty < 0 && (
                <div className="flex justify-between text-red-600"><span>Complaint Penalty</span><span className="font-bold">{ts.complaintPenalty}</span></div>
              )}
              {ts.suspiciousPenalty < 0 && (
                <div className="flex justify-between text-red-600"><span>Suspicious Activity</span><span className="font-bold">{ts.suspiciousPenalty}</span></div>
              )}
              <div className="border-t border-gray-100 pt-2 flex justify-between font-bold text-gray-800"><span>Final Trust Score</span><span>{ts.finalScore}/100</span></div>
            </div>
          </Card>
        </div>

        {/* Officer actions */}
        <Card className="p-5">
          <h3 className="font-bold text-gray-800 mb-1 text-sm">Officer Actions</h3>
          <div className="text-xs text-amber-600 mb-4">Actions are recorded in the audit trail. Do not automatically accuse a vendor — review evidence before confirming manipulation.</div>
          <div className="flex flex-wrap gap-3 mb-4">
            {[
              { label: "Mark Under Review", status: "UNDER_REVIEW" as AntiGamingStatus, color: "bg-amber-600 text-white hover:bg-amber-700" },
              { label: "Clear Case", status: "CLEARED" as AntiGamingStatus, color: "bg-blue-600 text-white hover:bg-blue-700" },
              { label: "Confirm Manipulation", status: "CONFIRMED_MANIPULATION" as AntiGamingStatus, color: "bg-red-600 text-white hover:bg-red-700" },
            ].map(a => (
              <button key={a.label} onClick={() => updateCase(selected.id, a.status)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all ${a.color} ${selected.status === a.status ? "ring-2 ring-offset-1 ring-current" : ""}`}>
                {a.label}
              </button>
            ))}
          </div>
          <div className="flex gap-3">
            <textarea
              value={remarkDraft}
              onChange={e => setRemarkDraft(e.target.value)}
              placeholder="Add officer remarks (recorded in audit trail)…"
              rows={2}
              className="flex-1 text-xs border border-gray-200 rounded-xl p-3 outline-none focus:border-blue-400 resize-none text-gray-700"
            />
            <button onClick={() => { updateCase(selected.id, selected.status, remarkDraft); setRemarkDraft(""); }}
              disabled={!remarkDraft.trim()}
              className="px-4 rounded-xl bg-gray-800 text-white text-xs font-semibold hover:bg-gray-900 disabled:opacity-30 transition-all">
              Save
            </button>
          </div>
          {selected.remarks && (
            <div className="mt-3 bg-blue-50 border border-blue-200 rounded-xl p-3 text-xs text-blue-700">
              <strong>Remarks:</strong> {selected.remarks}
            </div>
          )}
        </Card>
      </div>
    );
  }

  return (
    <div className="fade-in">
      <SectionHeader title="Anti-Gaming & Trust Engine" subtitle="Rating manipulation detection · Trust Score monitoring · Human review required" />

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {[
          { label: "Ratings Analyzed", value: ANTI_GAMING_STATS.ratingsAnalyzed.toLocaleString(), icon: "📊", color: "text-blue-700" },
          { label: "Suspicious Ratings", value: ANTI_GAMING_STATS.suspiciousRatings, icon: "⚠️", color: "text-amber-600" },
          { label: "Vendors Under Review", value: ANTI_GAMING_STATS.vendorsUnderReview, icon: "🔍", color: "text-orange-600" },
          { label: "Confirmed Manipulation", value: ANTI_GAMING_STATS.confirmedManipulation, icon: "🚫", color: "text-red-600" },
        ].map(s => (
          <Card key={s.label} className="p-4 text-center">
            <div className="text-xl mb-1">{s.icon}</div>
            <div className={`text-2xl font-black ${s.color}`}>{s.value}</div>
            <div className="text-xs text-gray-500 mt-0.5">{s.label}</div>
          </Card>
        ))}
      </div>

      {/* Info banner */}
      <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-5 text-sm text-amber-800">
        <strong>⚠️ AI/Automated Detection — Human Review Required.</strong> The Anti-Gaming Engine flags suspicious patterns automatically.
        Do not take action solely based on automated flags. Always review evidence before confirming manipulation.
        Trust Score = Ratings + Compliance + History − Validated Complaints − Suspicious Penalties.
      </div>

      {/* Cases table */}
      <Card className="p-5">
        <h3 className="font-bold text-gray-800 mb-4 text-sm">Suspicious Activity Cases</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-gray-400 border-b border-gray-100">
                {["Case ID", "Vendor", "Rating Activity", "Trust Score", "Risk", "Status", "Last Activity", "Action"].map(h => (
                  <th key={h} className="pb-2 pr-4 font-medium whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {localCases.map(c => (
                <tr key={c.id} className="hover:bg-gray-50 transition-colors">
                  <td className="py-3 pr-4 font-mono text-gray-600">{c.id}</td>
                  <td className="py-3 pr-4 font-semibold text-gray-800 whitespace-nowrap">{c.vendorName}</td>
                  <td className="py-3 pr-4">
                    <span className="text-gray-500">{c.ratingBefore}★</span>
                    <span className="mx-1 text-red-400">→</span>
                    <span className="text-red-600 font-bold">{c.ratingRecent}★</span>
                  </td>
                  <td className="py-3 pr-4 font-bold text-gray-700">{c.trustScore}/100</td>
                  <td className={`py-3 pr-4 font-bold ${RISK_COLOR[c.riskLevel] ?? "text-gray-600"}`}>{c.riskLevel}</td>
                  <td className="py-3 pr-4">
                    <span className={`px-2 py-0.5 rounded-full border text-[10px] font-semibold ${STATUS_STYLES[c.status]}`}>
                      {STATUS_LABEL[c.status]}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-gray-400 whitespace-nowrap">{new Date(c.lastActivity).toLocaleDateString("en-IN")}</td>
                  <td className="py-3">
                    <button onClick={() => setSelected(c)}
                      className="px-3 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-[10px] font-semibold hover:bg-blue-100 transition-all whitespace-nowrap">
                      Review →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

export default function AdminPortal({ page, lang, onPageChange }: Props) {
  const INSTRUMENTS_PAGE = (
    <div className="fade-in">
      <SectionHeader title="Instruments" subtitle="All registered instruments" />
      <Card className="p-5">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-xs text-gray-500 border-b border-gray-100"><th className="pb-2 pr-4">Instrument ID</th><th className="pb-2 pr-4">Type</th><th className="pb-2 pr-4">Owner</th><th className="pb-2 pr-4">Location</th><th className="pb-2 pr-4">Compliance</th><th className="pb-2">Status</th></tr></thead>
          <tbody className="divide-y divide-gray-50">
            {INSTRUMENTS.map(i => (
              <tr key={i.id} className="hover:bg-gray-50">
                <td className="py-3 pr-4 font-mono text-xs text-blue-700">{i.id}</td>
                <td className="py-3 pr-4 text-gray-800">{i.type}</td>
                <td className="py-3 pr-4 text-gray-600 text-xs">{i.owner}</td>
                <td className="py-3 pr-4 text-gray-500 text-xs">{i.location}</td>
                <td className="py-3 pr-4"><div className="flex items-center gap-1"><div className="w-12 h-1.5 bg-gray-100 rounded-full overflow-hidden"><div className="h-full rounded-full" style={{ width: `${i.complianceScore}%`, background: i.complianceScore >= 75 ? "#16a34a" : i.complianceScore >= 50 ? "#d97706" : "#dc2626" }} /></div><span className="text-xs">{i.complianceScore}</span></div></td>
                <td className="py-3"><StatusBadge status={i.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );

  const APPLICATIONS_PAGE = (
    <div className="fade-in">
      <SectionHeader title="Applications" />
      <Card className="p-5">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-xs text-gray-500 border-b border-gray-100"><th className="pb-2 pr-4">Application ID</th><th className="pb-2 pr-4">Instrument</th><th className="pb-2 pr-4">Type</th><th className="pb-2 pr-4">Fee</th><th className="pb-2 pr-4">Officer</th><th className="pb-2">Status</th></tr></thead>
          <tbody className="divide-y divide-gray-50">
            {APPLICATIONS.map(a => (
              <tr key={a.id} className="hover:bg-gray-50">
                <td className="py-3 pr-4 font-mono text-xs text-blue-700">{a.id}</td>
                <td className="py-3 pr-4 font-mono text-xs text-gray-600">{a.instrumentId}</td>
                <td className="py-3 pr-4 text-gray-700 text-xs">{a.type}</td>
                <td className="py-3 pr-4 font-semibold">₹{a.fee.toLocaleString()}</td>
                <td className="py-3 pr-4 text-gray-500 text-xs">{a.officer ?? "Unassigned"}</td>
                <td className="py-3"><StatusBadge status={a.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );

  const CERTS_PAGE = (
    <div className="fade-in">
      <SectionHeader title="Certificates" />
      <Card className="p-5">
        <table className="w-full text-sm">
          <thead><tr className="text-left text-xs text-gray-500 border-b border-gray-100"><th className="pb-2 pr-4">Certificate ID</th><th className="pb-2 pr-4">Instrument</th><th className="pb-2 pr-4">Owner</th><th className="pb-2 pr-4">Valid Until</th><th className="pb-2">Status</th></tr></thead>
          <tbody className="divide-y divide-gray-50">
            {CERTIFICATES.map(c => (
              <tr key={c.id} className="hover:bg-gray-50">
                <td className="py-3 pr-4 font-mono text-xs text-blue-700">{c.id}</td>
                <td className="py-3 pr-4 font-mono text-xs text-gray-600">{c.instrumentId}</td>
                <td className="py-3 pr-4 text-gray-600 text-xs">{c.owner}</td>
                <td className="py-3 pr-4 text-xs">{c.validUntil}</td>
                <td className="py-3"><StatusBadge status={c.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );

  const pages: Record<string, React.ReactNode> = {
    dashboard: <AdminDashboard onPageChange={onPageChange} />,
    users: <UsersPage />,
    officers: <OfficersPage />,
    instruments: INSTRUMENTS_PAGE,
    applications: APPLICATIONS_PAGE,
    inspections: APPLICATIONS_PAGE,
    payments: APPLICATIONS_PAGE,
    certificates: CERTS_PAGE,
    complaints: <AdminComplaintsPage />,
    fraudDetection: <FraudDetectionPage />,
    antiGaming: <AntiGamingPage />,
    analytics: <AnalyticsPage />,
    advancedAnalytics: <AnalyticsPage />,
    auditLogs: <AuditLogsPage />,
    aiAssistant: <AdminAIPage />,
    notifications: <div className="fade-in"><Card className="p-5 text-sm text-gray-500 text-center py-10">All system notifications appear here.</Card></div>,
    settings: <SettingsPage />,
  };

  return <>{pages[page] ?? <AdminDashboard onPageChange={onPageChange} />}</>;
}

// Re-export FraudDetectionPage for officer portal re-use
function FraudDetectionPage() {
  const [selected, setSelected] = useState<string | null>(null);
  const alert = FRAUD_ALERTS.find(f => f.id === selected);
  return (
    <div className="fade-in">
      <SectionHeader title="Fraud Detection" subtitle="AI-powered suspicious pattern analysis" />
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
        {[["Records Analyzed", "2,236", "📊", "text-blue-700"], ["Flagged", FRAUD_ALERTS.length, "🚩", "text-orange-600"], ["High Risk", FRAUD_ALERTS.filter(f => f.riskLevel === "High" || f.riskLevel === "Critical").length, "🔴", "text-red-600"], ["Confirmed Fraud", "1", "🔒", "text-purple-700"]].map(([l, v, i, c]) => (
          <Card key={String(l)} className="p-4 text-center"><div className="text-xl mb-1">{i}</div><div className={`text-2xl font-black ${c}`}>{v}</div><div className="text-xs text-gray-500 mt-0.5">{l}</div></Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          <Card className="p-5">
            <h3 className="font-bold text-gray-800 mb-4">Flagged Cases</h3>
            <div className="space-y-3">
              {FRAUD_ALERTS.map(f => (
                <div key={f.id} onClick={() => setSelected(f.id === selected ? null : f.id)} className={`p-4 rounded-xl border cursor-pointer transition-all ${selected === f.id ? "border-blue-400 bg-blue-50" : "border-gray-200 hover:border-gray-300"}`}>
                  <div className="flex items-start justify-between gap-3 flex-wrap">
                    <div><div className="font-mono text-xs text-blue-700">{f.id}</div><div className="font-semibold text-sm text-gray-900 mt-0.5">{f.business}</div><div className="text-xs text-gray-500">{f.location} · {f.date}</div></div>
                    <div className="flex items-center gap-2"><StatusBadge status={f.riskLevel} /><StatusBadge status={f.status} /></div>
                  </div>
                  <div className="flex items-center gap-3 mt-2"><div className="flex-1 bg-gray-200 rounded-full h-2 overflow-hidden"><div className="h-full rounded-full" style={{ width: `${f.riskScore}%`, background: f.riskScore >= 70 ? "#dc2626" : "#d97706" }} /></div><span className="text-xs font-bold">{f.riskScore}/100</span></div>
                </div>
              ))}
            </div>
          </Card>
        </div>
        <Card className="p-5">
          {alert ? (
            <div>
              <h3 className="font-bold text-gray-800 mb-3">Case Details</h3>
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-3"><div className="font-mono text-xs text-red-700">{alert.id}</div><div className="font-bold text-gray-900">{alert.business}</div></div>
              <div className="text-xs text-gray-600 mb-4 leading-relaxed">{alert.reason}</div>
              <div className="space-y-2">
                {["Under Review", "False Positive", "Confirmed Fraud", "Cleared"].map(s => <button key={s} className="w-full py-2 rounded-lg text-xs font-medium border border-gray-200 text-gray-600 hover:bg-gray-50 transition-all">{s}</button>)}
              </div>
            </div>
          ) : <div className="text-center text-gray-400 py-10"><div className="text-4xl mb-2">🚨</div><div className="text-sm">Select a case to view</div></div>}
        </Card>
      </div>
    </div>
  );
}
