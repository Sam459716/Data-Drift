// AI Service abstraction — replace mock implementations with real LLM API calls
// by updating the functions below without changing any UI code.

export interface RiskAnalysis {
  score: number;
  level: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  pattern: string;
  explanation: string;
  recommendation: string;
}

export interface FraudAnalysis {
  score: number;
  status: "CLEAR" | "SUSPICIOUS" | "HIGH_RISK" | "CONFIRMED";
  categories: string[];
  flags: string[];
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

// Deterministic risk scores based on instrument data
export function analyzeRisk(instrumentId: string, riskScore?: number): RiskAnalysis {
  const score = riskScore ?? 25;
  const level = score >= 80 ? "CRITICAL" : score >= 60 ? "HIGH" : score >= 35 ? "MEDIUM" : "LOW";
  const patterns: Record<string, { pattern: string; explanation: string; recommendation: string }> = {
    LOW: {
      pattern: "Consistent Readings",
      explanation: "Measurements appear consistent with previous verification records. No anomalies detected in inspection history.",
      recommendation: "Standard periodic re-verification schedule. No priority action required.",
    },
    MEDIUM: {
      pattern: "Marginal Drift Detected",
      explanation: "One previous inspection showed readings near the upper permissible limit. Compliance score shows moderate trend.",
      recommendation: "Schedule inspection within 30 days. Review measurement history carefully during next visit.",
    },
    HIGH: {
      pattern: "Repeated Near-Failure Pattern",
      explanation: "Two of the last three inspections showed readings close to or at the permissible error limit. Complaint history and location changes noted.",
      recommendation: "Priority inspection recommended. Capture geo-tagged evidence and review seal integrity.",
    },
    CRITICAL: {
      pattern: "Multiple Risk Indicators",
      explanation: "Certificate anomalies, duplicate data flags, and abnormal application patterns detected. Manual review required.",
      recommendation: "Immediate investigation warranted. Do not issue certificate until cleared by senior officer.",
    },
  };
  return { score, level, ...patterns[level] };
}

export function analyzeFraud(instrumentId: string, fraudScore?: number): FraudAnalysis {
  const score = fraudScore ?? 20;
  const status = score >= 80 ? "CONFIRMED" : score >= 60 ? "HIGH_RISK" : score >= 40 ? "SUSPICIOUS" : "CLEAR";
  const flagSets: Record<string, string[]> = {
    CLEAR: [],
    SUSPICIOUS: ["Measurement readings near upper limit on last 2 inspections"],
    HIGH_RISK: ["Repeated near-failure measurements", "Location mismatch detected", "3 re-verifications in 18 months"],
    CONFIRMED: ["Duplicate serial number detected", "Two businesses claim same instrument", "Forged seal suspected"],
  };
  const catSets: Record<string, string[]> = {
    CLEAR: [],
    SUSPICIOUS: ["Measurement Anomaly"],
    HIGH_RISK: ["Measurement Anomaly", "Location Anomaly", "Certificate Anomaly"],
    CONFIRMED: ["Duplicate Data", "Certificate Anomaly", "Behavioral Anomaly"],
  };
  return { score, status, categories: catSets[status], flags: flagSets[status] };
}

// Role-aware chatbot with contextual responses
export async function chatWithAssistant(
  message: string,
  role: "user" | "officer" | "admin",
  history: ChatMessage[]
): Promise<string> {
  await new Promise(r => setTimeout(r, 600));

  const msg = message.toLowerCase();

  const responses: Record<string, string> = {
    "register": "To register an instrument: Go to **My Instruments → Register Instrument**, fill in the instrument details, upload required documents (manufacturer certificate, purchase invoice), and submit. You will receive a unique Instrument ID like **LM-MH-PUN-000XXX**.",
    "verify": "To apply for verification: Open **My Instruments**, click on the instrument, then select **Apply for Verification**. Pay the applicable fee and request an inspection date.",
    "certificate": "Your digital certificate is available under **Certificates**. You can download it as a PDF or share the QR code for public verification. Certificates include a unique QR that anyone can scan to verify authenticity.",
    "complaint": role === "user" ? "To file a complaint: Go to **Complaints → New Complaint**, select the category, describe the issue, attach evidence if available, and submit. You will receive a Complaint ID like **LM-CMP-2026-XXXXX**." : "Complaints assigned to you appear under the **Complaints** section. You can update status, add remarks, and upload evidence.",
    "status": "Check your application status under **Applications**. Each application shows a progress indicator: Submitted → Under Review → Scheduled → Inspection → Approved → Certificate.",
    "renew": "Renewal reminders are sent 90, 60, and 30 days before expiry. Click the renewal notification or go to **My Instruments** and select **Apply for Re-verification**.",
    "payment": "Fee details are shown during the application process. Pay online via UPI, Net Banking, or Debit/Credit Card. Payment receipts are available under **Payments**.",
    "document": "Required documents typically include: Manufacturer's calibration certificate, Purchase invoice, Business registration, Proof of address, Previous verification certificate (for re-verification). **Note:** Always confirm exact requirements with your local Legal Metrology office.",
    "inspection": role === "officer" ? "Your assigned inspections are shown in **My Assignments**. Click **Start Inspection** to begin the geo-tagged workflow, upload evidence, enter measurements, and submit your findings." : "Inspection scheduling is shown under **Applications**. Once scheduled, you will receive a notification with the officer's name and scheduled date/time.",
    "high risk": "High-risk cases are flagged by the AI Risk Analysis engine based on inspection history, complaint records, and measurement patterns. Use the **Priority Queue** filter to view these first.",
    "fraud": "The Fraud Detection module flags suspicious patterns automatically. Access it via **Fraud Detection** in the admin/officer panel. Each alert includes a risk score and specific reasons for flagging.",
    "compliance": "Compliance Score (0–100) reflects certificate validity, inspection history, complaint record, and documentation completeness. View the breakdown under **My Instruments → Instrument Details**.",
  };

  for (const [key, response] of Object.entries(responses)) {
    if (msg.includes(key)) return response;
  }

  if (msg.includes("hello") || msg.includes("hi") || msg.includes("namaste")) {
    return `Hello! I am the **Legal Metrology AI Assistant**. I can help you with instrument registration, verification process, certificates, complaints, and general navigation. What would you like to know?`;
  }

  return "I can help you with instrument registration, verification applications, certificate information, complaints, and system navigation. For specific legal requirements, fee amounts, or permissible limits, please contact your local Legal Metrology Office or your assigned officer.\n\n**Try asking:** How do I register an instrument? | What documents are required? | How do I track my application?";
}

export const SUGGESTED_QUESTIONS: Record<string, string[]> = {
  user: [
    "How do I register an instrument?",
    "How can I apply for re-verification?",
    "What documents are required?",
    "How do I verify a certificate?",
    "When does my certificate expire?",
  ],
  officer: [
    "What inspections are pending today?",
    "How do I capture GPS location?",
    "How do I upload evidence?",
    "What is the measurement error formula?",
    "How do I escalate a high-risk case?",
  ],
  admin: [
    "How many complaints this month?",
    "Which district has highest violations?",
    "Show officer workload summary",
    "How many fraud alerts are pending?",
    "Which certificates expire this week?",
  ],
};
