import React from "react";

interface InstructionBoxProps {
  onDismiss: () => void;
}

const HOW_IT_WORKS_STEPS = [
  { num: "①", title: "Login", desc: "Securely access the platform." },
  { num: "②", title: "Register Instrument", desc: "Register weighing and measuring instruments." },
  { num: "③", title: "Submit Application", desc: "Submit required Legal Metrology details." },
  { num: "④", title: "Payment", desc: "Complete the applicable payment." },
  { num: "⑤", title: "AI-Assisted Verification", desc: "AI-assisted analysis where available." },
  { num: "⑥", title: "Officer Verification", desc: "Authorized officer review." },
  { num: "⑦", title: "Digital Certificate", desc: "Certificate generation after approval." },
  { num: "⑧", title: "QR Verification", desc: "Verify certificate information using QR." },
  { num: "⑨", title: "Public Verification", desc: "Public certificate verification." },
  { num: "⑩", title: "Complaints & Monitoring", desc: "Monitor businesses and submit complaints." },
];

const SMART_FEATURES = [
  {
    icon: "📍",
    title: "Real Location",
    desc: "Find nearby businesses using browser location permission.",
    accent: "bg-blue-50 border-blue-200 text-blue-900",
  },
  {
    icon: "🏪",
    title: "Nearby Shops",
    desc: "View real nearby business information.",
    accent: "bg-teal-50 border-teal-200 text-teal-900",
  },
  {
    icon: "🎤",
    title: "Voice Complaints",
    desc: "Record a complaint using microphone permission.",
    accent: "bg-indigo-50 border-indigo-200 text-indigo-900",
  },
  {
    icon: "🤖",
    title: "AI Assistance",
    desc: "AI-assisted document and compliance analysis.",
    accent: "bg-purple-50 border-purple-200 text-purple-900",
  },
];

const WORKFLOW_PIPELINE = [
  "LOGIN",
  "APPLICATION",
  "PAYMENT",
  "VERIFICATION",
  "APPROVAL",
  "CERTIFICATE",
  "QR",
];

export default function InstructionBox({ onDismiss }: InstructionBoxProps) {
  const handleDismiss = () => {
    try {
      localStorage.setItem("datadrift_instructions_dismissed", "true");
    } catch {}
    onDismiss();
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="welcome-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-slate-950/75 backdrop-blur-xs animate-in fade-in duration-200"
    >
      {/* Centered instruction card: 850–1000px wide & responsive */}
      <div
        className="w-full max-w-[940px] max-h-[92vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all"
        style={{ fontFamily: "'Inter', sans-serif" }}
      >
        {/* HEADER */}
        <div
          className="relative px-6 py-4.5 sm:py-5 text-white shrink-0"
          style={{
            background: "linear-gradient(135deg, #090d16 0%, #0f172a 45%, #1e3a8a 100%)",
            borderBottom: "1px solid rgba(59, 130, 246, 0.25)",
          }}
        >
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-500/20 border border-blue-400/40 flex items-center justify-center text-xl shrink-0 mt-0.5">
                🛡️
              </div>
              <div>
                <h2
                  id="welcome-modal-title"
                  className="text-xl sm:text-2xl font-black text-white tracking-tight leading-tight"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  Welcome to DataDrift
                </h2>
                <p className="text-blue-200 text-xs sm:text-sm font-medium mt-0.5">
                  Smart Legal Metrology Compliance &amp; Verification Platform
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleDismiss}
              className="w-8 h-8 rounded-lg bg-white/10 hover:bg-white/20 text-slate-300 hover:text-white flex items-center justify-center text-lg transition-all shrink-0 cursor-pointer"
              aria-label="Close"
              title="Close modal"
            >
              ✕
            </button>
          </div>
        </div>

        {/* MAIN CONTENT: Clean Two-Column Layout */}
        <div className="flex-1 overflow-y-auto p-5 sm:p-6 bg-slate-50/70">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
            {/* LEFT COLUMN: How DataDrift Works */}
            <div className="lg:col-span-7 bg-white rounded-xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs">
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                <span className="text-base">📋</span>
                <h3
                  className="font-bold text-slate-900 text-sm sm:text-base tracking-tight"
                  style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                >
                  How DataDrift Works
                </h3>
              </div>

              <div className="space-y-2">
                {HOW_IT_WORKS_STEPS.map((step) => (
                  <div
                    key={step.num}
                    className="flex items-start gap-2.5 p-2 rounded-lg hover:bg-slate-50/80 transition-colors"
                  >
                    <span className="text-blue-700 font-bold text-sm shrink-0 mt-0.5 select-none font-mono">
                      {step.num}
                    </span>
                    <div className="min-w-0">
                      <div className="font-semibold text-slate-900 text-xs sm:text-sm leading-snug">
                        {step.title}
                      </div>
                      <div className="text-[11px] sm:text-xs text-slate-500 leading-snug mt-0.5">
                        {step.desc}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT COLUMN: Smart Features */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-white rounded-xl p-4 sm:p-5 border border-slate-200/90 shadow-2xs">
                <div className="flex items-center gap-2 mb-3 pb-2 border-b border-slate-100">
                  <span className="text-base">✨</span>
                  <h3
                    className="font-bold text-slate-900 text-sm sm:text-base tracking-tight"
                    style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
                  >
                    Smart Features
                  </h3>
                </div>

                {/* 4 Compact feature cards */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-1 gap-2.5">
                  {SMART_FEATURES.map((feat) => (
                    <div
                      key={feat.title}
                      className={`p-3 rounded-lg border ${feat.accent} transition-all`}
                    >
                      <div className="font-semibold text-xs sm:text-sm flex items-center gap-1.5 mb-1">
                        <span>{feat.icon}</span>
                        <span>{feat.title}</span>
                      </div>
                      <p className="text-[11px] sm:text-xs text-slate-600 leading-relaxed">
                        {feat.desc}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Privacy & Permissions and Notice */}
              <div className="bg-blue-50/70 rounded-xl p-3.5 border border-blue-200/80 text-xs space-y-2">
                <div>
                  <div className="font-bold text-blue-950 flex items-center gap-1 mb-0.5">
                    <span>🔒</span> Privacy &amp; Permissions
                  </div>
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    Location and microphone access are requested only with your permission.
                  </p>
                </div>
                <div className="pt-2 border-t border-blue-200/60">
                  <p className="text-slate-600 text-[11px] leading-relaxed">
                    <strong className="text-slate-800">Notice: </strong>
                    Business information from external place services is separate from DataDrift compliance records.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BOTTOM SECTION */}
        <div className="px-5 sm:px-6 py-4 bg-white border-t border-slate-200 shrink-0 space-y-3">
          {/* Highlighted horizontal workflow */}
          <div className="bg-slate-900 text-white rounded-xl px-3.5 py-2.5 border border-blue-900/60 flex items-center justify-between flex-wrap gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-blue-300 shrink-0 flex items-center gap-1">
              <span>⚡</span> Workflow:
            </span>
            <div className="flex items-center flex-wrap gap-1.5 text-[11px] font-semibold">
              {WORKFLOW_PIPELINE.map((stage, idx) => (
                <React.Fragment key={stage}>
                  <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-200 border border-blue-400/25">
                    {stage}
                  </span>
                  {idx < WORKFLOW_PIPELINE.length - 1 && (
                    <span className="text-blue-400 font-bold px-0.5 select-none">→</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Primary Action Button at Bottom-Right */}
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div className="text-[11px] text-slate-500">
              You can reopen these instructions anytime from the navigation bar.
            </div>
            <button
              type="button"
              onClick={handleDismiss}
              className="ml-auto w-full sm:w-auto px-6 py-2.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>✓</span> Got it, Continue to DataDrift
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
