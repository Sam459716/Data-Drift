// Anti-Gaming & Trust Engine Service
// Deterministic demo implementation — swap individual functions for real API calls.
// IMPORTANT: No automatic fraud accusation. Flag for human review only.

export type AntiGamingStatus = "NORMAL" | "UNDER_REVIEW" | "CLEARED" | "CONFIRMED_MANIPULATION";
export type ReviewAuthenticity = "NORMAL" | "SUSPICIOUS" | "FLAGGED" | "REVIEWED" | "CLEARED";
export type RiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface TrustScoreBreakdown {
  vendorId: string;
  ratingComponent: number;    // max 35
  complianceComponent: number; // max 30
  verificationComponent: number; // max 25
  complaintPenalty: number;   // negative
  suspiciousPenalty: number;  // negative
  finalScore: number;         // 0–100
}

export interface AntiGamingCase {
  id: string;
  vendorId: string;
  vendorName: string;
  riskLevel: RiskLevel;
  status: AntiGamingStatus;
  detectionReasons: string[];
  ratingBefore: number;
  ratingRecent: number;
  recentActivityVolume: "LOW" | "NORMAL" | "HIGH" | "UNUSUAL";
  trustScore: number;
  flaggedAt: string;
  lastActivity: string;
  remarks: string;
}

export interface TransactionReview {
  transactionId: string;
  vendorId: string;
  customerId: string;
  rating: number;
  reviewText: string;
  authenticityStatus: ReviewAuthenticity;
  createdAt: string;
  canReview: boolean;
  alreadyReviewed: boolean;
}

// ─── Deterministic demo dataset ──────────────────────────

export const ANTI_GAMING_CASES: AntiGamingCase[] = [
  {
    id: "AG-2026-001",
    vendorId: "VENDOR-001",
    vendorName: "Sunrise Kirana Store",
    riskLevel: "HIGH",
    status: "UNDER_REVIEW",
    detectionReasons: [
      "14 five-star ratings received in 4 hours",
      "Rating jumped from 4.1 to 4.9 within 24 hours",
      "Unusual concentration from similar IP ranges",
      "Review text patterns show near-identical phrasing",
    ],
    ratingBefore: 4.1,
    ratingRecent: 4.9,
    recentActivityVolume: "UNUSUAL",
    trustScore: 61,
    flaggedAt: "2026-08-28T14:22:00",
    lastActivity: "2026-08-28T18:45:00",
    remarks: "",
  },
  {
    id: "AG-2026-002",
    vendorId: "VENDOR-002",
    vendorName: "Metro Traders",
    riskLevel: "MEDIUM",
    status: "UNDER_REVIEW",
    detectionReasons: [
      "Abnormal rating distribution — 90% five-star, 10% one-star",
      "Recent rating increase inconsistent with verified transaction volume",
      "Multiple reviews from accounts with no prior activity",
    ],
    ratingBefore: 3.9,
    ratingRecent: 4.7,
    recentActivityVolume: "HIGH",
    trustScore: 54,
    flaggedAt: "2026-08-20T09:15:00",
    lastActivity: "2026-08-25T11:30:00",
    remarks: "",
  },
  {
    id: "AG-2026-003",
    vendorId: "VENDOR-003",
    vendorName: "Nashik Fuels Pump 3",
    riskLevel: "LOW",
    status: "CLEARED",
    detectionReasons: [
      "Slight rating uptick after promotional event (explained)",
    ],
    ratingBefore: 3.8,
    ratingRecent: 4.2,
    recentActivityVolume: "NORMAL",
    trustScore: 72,
    flaggedAt: "2026-08-10T11:00:00",
    lastActivity: "2026-08-12T09:00:00",
    remarks: "Reviewed by Officer Priya M. — Rating increase attributable to verified post-event transactions.",
  },
  {
    id: "AG-2026-004",
    vendorId: "VENDOR-004",
    vendorName: "City Super Mart",
    riskLevel: "CRITICAL",
    status: "CONFIRMED_MANIPULATION",
    detectionReasons: [
      "Confirmed: 22 duplicate reviews from same device",
      "Reviews submitted before verified transaction timestamps",
      "Officer investigation confirmed coordinated rating manipulation",
    ],
    ratingBefore: 3.5,
    ratingRecent: 4.8,
    recentActivityVolume: "UNUSUAL",
    trustScore: 28,
    flaggedAt: "2026-07-15T08:00:00",
    lastActivity: "2026-07-30T16:00:00",
    remarks: "Confirmed manipulation. Trust Score penalized. Officer notified. Badge suspended.",
  },
];

// ─── Trust Score calculation ──────────────────────────────

export function calculateTrustScore(vendorId: string): TrustScoreBreakdown {
  // Deterministic per-vendor scores based on vendorId hash
  const seed = vendorId.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const base = (seed % 10);

  const scores: Record<string, Partial<TrustScoreBreakdown>> = {
    "shop-1": { ratingComponent: 30, complianceComponent: 30, verificationComponent: 25, complaintPenalty: -3, suspiciousPenalty: -3 },
    "shop-2": { ratingComponent: 18, complianceComponent: 10, verificationComponent: 15, complaintPenalty: -8, suspiciousPenalty: -5 },
    "shop-3": { ratingComponent: 22, complianceComponent: 25, verificationComponent: 18, complaintPenalty: -5, suspiciousPenalty: -3 },
    "shop-4": { ratingComponent: 31, complianceComponent: 30, verificationComponent: 25, complaintPenalty: 0, suspiciousPenalty: 0 },
    "shop-5": { ratingComponent: 33, complianceComponent: 30, verificationComponent: 25, complaintPenalty: -1, suspiciousPenalty: 0 },
    "shop-6": { ratingComponent: 29, complianceComponent: 28, verificationComponent: 24, complaintPenalty: -2, suspiciousPenalty: 0 },
    "shop-7": { ratingComponent: 14, complianceComponent: 8, verificationComponent: 10, complaintPenalty: -10, suspiciousPenalty: -8 },
    "shop-8": { ratingComponent: 32, complianceComponent: 30, verificationComponent: 25, complaintPenalty: 0, suspiciousPenalty: 0 },
  };

  const s = scores[vendorId] ?? {
    ratingComponent: 20 + (base * 1.5),
    complianceComponent: 15 + (base),
    verificationComponent: 12 + (base * 0.8),
    complaintPenalty: -(base % 4),
    suspiciousPenalty: -(base % 3),
  };

  const rating = Math.min(35, Math.max(0, s.ratingComponent ?? 20));
  const compliance = Math.min(30, Math.max(0, s.complianceComponent ?? 15));
  const verification = Math.min(25, Math.max(0, s.verificationComponent ?? 12));
  const complaints = Math.min(0, s.complaintPenalty ?? 0);
  const suspicious = Math.min(0, s.suspiciousPenalty ?? 0);
  const final = Math.min(100, Math.max(0, rating + compliance + verification + complaints + suspicious));

  return {
    vendorId,
    ratingComponent: rating,
    complianceComponent: compliance,
    verificationComponent: verification,
    complaintPenalty: complaints,
    suspiciousPenalty: suspicious,
    finalScore: final,
  };
}

// ─── Review gate checks ───────────────────────────────────

export interface ReviewGateResult {
  allowed: boolean;
  reason: "OK" | "NO_TRANSACTION" | "ALREADY_REVIEWED" | "FLAGGED";
  message: string;
}

export function checkReviewGate(transactionId: string, vendorId: string): ReviewGateResult {
  // Demo: transactions starting with T-VER are valid verified transactions
  if (!transactionId.startsWith("T-VER")) {
    return {
      allowed: false,
      reason: "NO_TRANSACTION",
      message: "Rating unavailable. Ratings can only be submitted after a verified transaction.",
    };
  }
  // Demo: T-VER-REVIEWED transactions already have a review
  if (transactionId.includes("REVIEWED")) {
    return {
      allowed: false,
      reason: "ALREADY_REVIEWED",
      message: "Review already submitted. You can view your existing review below.",
    };
  }
  return { allowed: true, reason: "OK", message: "" };
}

// ─── Suspicious activity detection ───────────────────────

export interface SuspiciousDetection {
  isSuspicious: boolean;
  riskLevel: RiskLevel;
  reasons: string[];
  message: string;
}

export function detectSuspiciousActivity(
  vendorId: string,
  newRating: number,
  historicalAvg: number,
  recentRatingCount: number
): SuspiciousDetection {
  const reasons: string[] = [];
  let score = 0;

  const delta = newRating - historicalAvg;
  if (delta > 0.8) { reasons.push(`Rating jumped by ${delta.toFixed(1)} stars`); score += 3; }
  if (recentRatingCount > 10) { reasons.push(`${recentRatingCount} ratings in a short period`); score += 2; }
  if (newRating >= 4.9) { reasons.push("Unusually high concentration of maximum ratings"); score += 2; }

  const riskLevel: RiskLevel = score >= 6 ? "HIGH" : score >= 4 ? "MEDIUM" : score >= 2 ? "LOW" : "LOW";
  const isSuspicious = score >= 2;

  return {
    isSuspicious,
    riskLevel,
    reasons,
    message: isSuspicious
      ? "Suspicious rating activity detected. Flagged for human review. AI/Automated Detection — Human Review Required."
      : "",
  };
}

// Summary stats for admin dashboard cards
export const ANTI_GAMING_STATS = {
  ratingsAnalyzed: 1847,
  suspiciousRatings: 38,
  vendorsUnderReview: ANTI_GAMING_CASES.filter(c => c.status === "UNDER_REVIEW").length,
  confirmedManipulation: ANTI_GAMING_CASES.filter(c => c.status === "CONFIRMED_MANIPULATION").length,
};
