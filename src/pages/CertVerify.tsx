import { useState } from "react";
import { CERTIFICATES } from "../data/mockData";

interface Props { onBack: () => void; }

export default function CertVerify({ onBack }: Props) {
  const [certId, setCertId] = useState("");
  const [result, setResult] = useState<"idle" | "valid" | "expired" | "invalid">("idle");
  const [certData, setCertData] = useState<typeof CERTIFICATES[0] | null>(null);
  const [loading, setLoading] = useState(false);

  const verify = () => {
    if (!certId.trim()) return;
    setLoading(true);
    setTimeout(() => {
      const found = CERTIFICATES.find(c => c.id.toLowerCase() === certId.toLowerCase().trim());
      if (!found) {
        setResult("invalid");
        setCertData(null);
      } else if (found.status === "Expired") {
        setResult("expired");
        setCertData(found);
      } else {
        setResult("valid");
        setCertData(found);
      }
      setLoading(false);
    }, 800);
  };

  const RESULT_STYLE = {
    valid: { bg: "from-green-600 to-green-700", text: "✅ VALID", sub: "This certificate is valid and authentic.", badge: "bg-white text-green-700" },
    expired: { bg: "from-red-600 to-red-700", text: "❌ EXPIRED", sub: "This certificate has expired. Contact the business to verify renewal.", badge: "bg-white text-red-700" },
    invalid: { bg: "from-gray-600 to-gray-800", text: "⚠️ INVALID", sub: "No certificate found with this ID. The certificate may be forged or the ID may be incorrect.", badge: "bg-white text-gray-700" },
  };

  return (
    <div className="min-h-full" style={{ background: "linear-gradient(135deg, #f0f4f8 0%, #e8f0fe 100%)" }}>
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-700 to-blue-900 flex items-center justify-center text-white font-black text-sm">LM</div>
            <div>
              <div className="font-bold text-gray-900 text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Certificate Verification</div>
              <div className="text-xs text-gray-400">Legal Metrology Department, Maharashtra</div>
            </div>
          </div>
          <button onClick={onBack} className="text-sm text-blue-600 hover:underline">← Back to Home</button>
        </div>
      </header>

      <div className="max-w-lg mx-auto px-6 py-14">
        <div className="text-center mb-10">
          <div className="text-5xl mb-4">🔐</div>
          <h1 className="text-3xl font-black text-gray-900 mb-2" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Verify Certificate</h1>
          <p className="text-gray-500">Enter a Certificate ID or scan the QR code to verify the authenticity of a Legal Metrology certificate.</p>
        </div>

        <div className="bg-white rounded-2xl border border-gray-200 shadow-md p-6 mb-6">
          <div className="flex gap-3 mb-4">
            <input
              value={certId}
              onChange={e => { setCertId(e.target.value); setResult("idle"); }}
              onKeyDown={e => e.key === "Enter" && verify()}
              placeholder="e.g. CERT-MH-PUN-2024-0123"
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-50 font-mono"
            />
            <button
              onClick={verify}
              disabled={loading || !certId.trim()}
              className="px-5 py-3 bg-blue-700 text-white rounded-xl font-semibold text-sm hover:bg-blue-800 transition-all disabled:opacity-50 shadow-md"
            >
              {loading ? (
                <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Checking…</span>
              ) : "Verify"}
            </button>
          </div>
          <div className="text-center">
            <div className="text-xs text-gray-400 mb-2">— or —</div>
            <button className="flex items-center gap-2 mx-auto px-4 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-all">
              📷 Scan QR Code
            </button>
          </div>

          <div className="mt-4 pt-4 border-t border-gray-100">
            <div className="text-xs text-gray-400 mb-2 font-medium">Demo Certificate IDs to try:</div>
            <div className="flex flex-wrap gap-2">
              {CERTIFICATES.map(c => (
                <button key={c.id} onClick={() => { setCertId(c.id); setResult("idle"); }} className="text-xs px-2.5 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg hover:bg-blue-100 transition-all font-mono">
                  {c.id}
                </button>
              ))}
            </div>
          </div>
        </div>

        {result !== "idle" && (
          <div className="fade-in rounded-2xl overflow-hidden shadow-lg border border-gray-200">
            <div className={`bg-gradient-to-r ${RESULT_STYLE[result].bg} p-6 text-white text-center`}>
              <div className="text-4xl font-black mb-1">{RESULT_STYLE[result].text}</div>
              <p className="text-white/80 text-sm">{RESULT_STYLE[result].sub}</p>
            </div>
            {certData && (
              <div className="bg-white p-6">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  {[
                    ["Certificate ID", certData.id],
                    ["Instrument ID", certData.instrumentId],
                    ["Instrument Type", certData.instrumentType],
                    ["Verified On", certData.verificationDate],
                    ["Valid Until", certData.validUntil],
                    ["Certificate Status", certData.status],
                  ].map(([k, v]) => (
                    <div key={k} className="bg-gray-50 p-3 rounded-lg border border-gray-100">
                      <div className="text-xs text-gray-400">{k}</div>
                      <div className="font-semibold text-gray-800 mt-0.5 break-all text-xs">{v}</div>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-700">
                  ℹ️ Sensitive business information is not shown in public verification for privacy protection.
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="text-center pb-8 text-xs text-gray-400">
        Legal Metrology Digital Verification System · Government of Maharashtra · SIH 2026
      </div>
    </div>
  );
}
