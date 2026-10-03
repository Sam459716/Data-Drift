// Compliance Score Service — deterministic, 0–100.
// Do NOT use random values. Score depends only on instrument/certificate data.

import { INSTRUMENTS, CERTIFICATES, COMPLAINTS } from "../data/mockData";

export interface ScoreBreakdown {
  total: number;
  category: "Excellent" | "Good" | "Moderate" | "High Risk" | "Critical";
  components: {
    certificateValidity: number;   // /25
    verificationHistory: number;  // /20
    renewalTimeliness: number;    // /20
    documentation: number;        // /15
    inspectionRecord: number;     // /12
    complaintRecord: number;      // /8
  };
  recentEvents: { label: string; delta: number }[];
}

export interface ScoreHistoryEntry {
  year: string;
  score: number;
  events: string[];
}

export function calcComplianceScore(): ScoreBreakdown {
  const total = INSTRUMENTS.length;
  const verified = INSTRUMENTS.filter(i => i.status === "Verified").length;
  const expired = INSTRUMENTS.filter(i => i.status === "Expired").length;
  const pending = INSTRUMENTS.filter(i => i.status === "Pending Verification").length;
  const reverif = INSTRUMENTS.filter(i => i.status === "Re-verification Required").length;
  const validCerts = CERTIFICATES.filter(c => c.status === "Valid").length;
  const validatedComplaints = COMPLAINTS.filter(c => c.status === "Resolved").length;

  const certValidity = total > 0 ? Math.round((validCerts / total) * 25) : 25;
  const verifHist = total > 0 ? Math.round(((verified + validCerts) / (total * 2)) * 20) : 20;
  const timeliness = reverif > 0 ? Math.max(8, 20 - reverif * 4) : 20;
  const documentation = expired > 0 ? Math.max(8, 15 - expired * 3) : 15;
  const inspection = Math.max(5, 12 - pending * 2);
  const complaint = Math.max(2, 8 - validatedComplaints * 2);

  const final = certValidity + verifHist + timeliness + documentation + inspection + complaint;

  const category = final >= 90 ? "Excellent" : final >= 75 ? "Good" : final >= 50 ? "Moderate" : final >= 25 ? "High Risk" : "Critical";

  const recentEvents: { label: string; delta: number }[] = [];
  if (verified > 0) recentEvents.push({ label: "Successful verification", delta: 3 });
  if (validCerts > 0) recentEvents.push({ label: "Timely renewal", delta: 2 });
  if (validatedComplaints > 0) recentEvents.push({ label: "Validated complaint", delta: -4 });
  recentEvents.push({ label: "Documentation completed", delta: 1 });

  return {
    total: Math.min(100, final),
    category,
    components: {
      certificateValidity: certValidity,
      verificationHistory: verifHist,
      renewalTimeliness: timeliness,
      documentation,
      inspectionRecord: inspection,
      complaintRecord: complaint,
    },
    recentEvents,
  };
}

export const SCORE_HISTORY: ScoreHistoryEntry[] = [
  { year: "2026", score: 87, events: ["Instrument verified", "Certificate issued"] },
  { year: "2025", score: 82, events: ["Inspection completed", "Verification passed"] },
  { year: "2024", score: 78, events: ["Certificate renewed", "New instrument registered"] },
  { year: "2023", score: 69, events: ["Verification delayed (1 instrument)", "Documentation gap noted"] },
];
