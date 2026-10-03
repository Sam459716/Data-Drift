interface InstructionBoxProps {
  onDismiss: () => void;
}

const STEPS = [
  {
    title: "🔐 Login",
    description: "Log in using your authorized credentials.",
  },
  {
    title: "⚖️ Register Instrument",
    description: "Register and manage weighing and measuring instruments.",
  },
  {
    title: "📋 Submit Application",
    description: "Enter the required instrument and applicant details and submit the application.",
  },
  {
    title: "💳 Payment",
    description: "Complete the required payment for the application.",
  },
  {
    title: "🤖 AI-Assisted Verification",
    description: "Upload/scan the required information for AI-assisted analysis and anomaly detection.",
  },
  {
    title: "👮 Officer Verification",
    description: "The authorized officer reviews the application and verification results.",
  },
  {
    title: "📜 Certificate",
    description: "After approval, generate and access the digital Legal Metrology certificate.",
  },
  {
    title: "📱 QR Verification",
    description: "Scan the certificate QR code to verify its authenticity.",
  },
  {
    title: "🔎 Public Verification",
    description: "Citizens and businesses can verify certificates using the QR code or verification ID.",
  },
  {
    title: "🚨 Complaints & Monitoring",
    description: "Use the complaint and monitoring features for Legal Metrology issues.",
  },
];

export default function InstructionBox({ onDismiss }: InstructionBoxProps) {
  return (
    <section
      aria-labelledby="datadrift-instructions-title"
      className="mb-6 overflow-hidden rounded-xl border border-blue-200 bg-white shadow-sm fade-in"
    >
      <div className="flex items-start justify-between gap-4 border-b border-blue-100 bg-blue-50 px-4 py-4 sm:px-6">
        <div>
          <div
            id="datadrift-instructions-title"
            className="font-bold text-blue-900"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}
          >
            🛡️ Welcome to DataDrift
          </div>
          <div className="mt-1 text-sm font-medium text-blue-700">
            Smart Legal Metrology Compliance &amp; Verification Platform
          </div>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="shrink-0 rounded-lg border border-blue-200 bg-white px-3 py-1.5 text-xs font-medium text-blue-700 transition-all hover:bg-blue-100"
          aria-label="Close DataDrift instructions"
        >
          ×
        </button>
      </div>

      <ol className="grid grid-cols-1 divide-y divide-gray-100 px-4 sm:px-6 lg:grid-cols-2 lg:divide-y-0 lg:gap-x-8">
        {STEPS.map((step, index) => (
          <li key={step.title} className="flex gap-3 py-4 lg:border-b lg:border-gray-100">
            <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-blue-100 text-xs font-bold text-blue-800">
              {index + 1}
            </span>
            <div>
              <div className="text-sm font-semibold text-gray-800">{step.title}</div>
              <div className="mt-1 text-xs leading-5 text-gray-600">{step.description}</div>
            </div>
          </li>
        ))}
      </ol>

      <div className="mx-4 mb-4 mt-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs leading-5 text-amber-900 sm:mx-6 sm:mb-6">
        <span className="font-semibold">💡 Tip:</span> Follow the workflow from{" "}
        <span className="font-semibold">
          Application → Payment → Verification → Approval → Certificate → QR Verification
        </span>
      </div>
    </section>
  );
}
