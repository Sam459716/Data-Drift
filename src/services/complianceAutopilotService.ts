// Compliance Autopilot Service
// Monitors vendor instruments, generates actionable compliance tasks.
// Deterministic — no random values.

import { INSTRUMENTS, CERTIFICATES } from "../data/mockData";

export type ActionPriority = "URGENT" | "HIGH" | "MEDIUM" | "LOW";
export type ActionType = "RENEW" | "VERIFY" | "UPDATE_DOCS" | "RESOLVE_FAILURE" | "REVIEW";

export interface ComplianceAction {
  id: string;
  instrumentId: string;
  instrumentType: string;
  actionType: ActionType;
  priority: ActionPriority;
  title: string;
  description: string;
  dueLabel: string;
  daysRemaining: number | null;
  targetPage: string;  // page to navigate to when action is clicked
}

export interface ExpiryAlert {
  instrumentId: string;
  instrumentType: string;
  certificateNo: string | null;
  validUntil: string | null;
  daysRemaining: number | null;
  alertLevel: "EXPIRED" | "URGENT" | "SOON" | "UPCOMING" | "OK";
  message: string;
}

// Days between today and a date string — negative = expired
function daysUntil(dateStr: string | null): number | null {
  if (!dateStr) return null;
  const then = new Date(dateStr).getTime();
  const now = new Date("2026-09-05").getTime(); // deterministic demo date
  return Math.ceil((then - now) / 86400000);
}

export function getComplianceActions(): ComplianceAction[] {
  const actions: ComplianceAction[] = [];

  INSTRUMENTS.forEach((inst, idx) => {
    const days = daysUntil(inst.validUntil);

    if (inst.status === "Expired") {
      actions.push({
        id: `ACT-${idx}-exp`,
        instrumentId: inst.id,
        instrumentType: inst.type,
        actionType: "RENEW",
        priority: "URGENT",
        title: "Certificate Expired",
        description: `Certificate for ${inst.type} has expired. Immediate re-verification required.`,
        dueLabel: "Expired",
        daysRemaining: days,
        targetPage: "applications",
      });
    } else if (inst.status === "Re-verification Required") {
      actions.push({
        id: `ACT-${idx}-reverif`,
        instrumentId: inst.id,
        instrumentType: inst.type,
        actionType: "RENEW",
        priority: "HIGH",
        title: "Re-verification Required",
        description: `${inst.type} requires re-verification. Certificate: ${inst.certificateNo ?? "N/A"}.`,
        dueLabel: days !== null ? (days <= 0 ? "Expired" : `${days} days remaining`) : "Action needed",
        daysRemaining: days,
        targetPage: "applications",
      });
    } else if (inst.status === "Pending Verification") {
      actions.push({
        id: `ACT-${idx}-pend`,
        instrumentId: inst.id,
        instrumentType: inst.type,
        actionType: "VERIFY",
        priority: "MEDIUM",
        title: "Verification Pending",
        description: `${inst.type} is registered but not yet verified. Schedule initial verification.`,
        dueLabel: "Schedule soon",
        daysRemaining: null,
        targetPage: "applications",
      });
    } else if (days !== null && days <= 60 && days > 0) {
      const priority: ActionPriority = days <= 7 ? "URGENT" : days <= 15 ? "HIGH" : days <= 30 ? "MEDIUM" : "LOW";
      actions.push({
        id: `ACT-${idx}-exp-soon`,
        instrumentId: inst.id,
        instrumentType: inst.type,
        actionType: "RENEW",
        priority,
        title: `Certificate Expiring in ${days} Days`,
        description: `Verification for ${inst.type} (${inst.id}) expires in ${days} days. Start renewal to avoid lapse.`,
        dueLabel: `${days} days`,
        daysRemaining: days,
        targetPage: "applications",
      });
    }
  });

  // Sort: URGENT → HIGH → MEDIUM → LOW
  const order: ActionPriority[] = ["URGENT", "HIGH", "MEDIUM", "LOW"];
  return actions.sort((a, b) => order.indexOf(a.priority) - order.indexOf(b.priority));
}

export function getExpiryAlerts(): ExpiryAlert[] {
  return INSTRUMENTS.map(inst => {
    const days = daysUntil(inst.validUntil);
    let alertLevel: ExpiryAlert["alertLevel"] = "OK";
    let message = "";

    if (inst.status === "Expired" || (days !== null && days <= 0)) {
      alertLevel = "EXPIRED";
      message = "Certificate expired. Immediate action required.";
    } else if (days !== null && days <= 7) {
      alertLevel = "URGENT";
      message = `Urgent: Verification expires in ${days} day${days === 1 ? "" : "s"}.`;
    } else if (days !== null && days <= 15) {
      alertLevel = "URGENT";
      message = "Verification expires soon.";
    } else if (days !== null && days <= 30) {
      alertLevel = "SOON";
      message = `Your instrument verification expires in ${days} days.`;
    } else if (days !== null && days <= 60) {
      alertLevel = "UPCOMING";
      message = `Your instrument verification expires in ${days} days.`;
    } else {
      alertLevel = "OK";
      message = "Certificate is valid.";
    }

    return {
      instrumentId: inst.id,
      instrumentType: inst.type,
      certificateNo: inst.certificateNo,
      validUntil: inst.validUntil,
      daysRemaining: days,
      alertLevel,
      message,
    };
  });
}

export function getWalletStats() {
  const total = INSTRUMENTS.length;
  const registered = INSTRUMENTS.length;
  const verified = INSTRUMENTS.filter(i => i.status === "Verified").length;
  const pending = INSTRUMENTS.filter(i => i.status === "Pending Verification").length;
  const expired = INSTRUMENTS.filter(i => i.status === "Expired").length;
  const reverif = INSTRUMENTS.filter(i => i.status === "Re-verification Required").length;
  const expiringSoon = getExpiryAlerts().filter(a => a.alertLevel === "SOON" || a.alertLevel === "UPCOMING").length;
  const actions = getComplianceActions();
  const lastInspection = "18 Aug 2026";
  const nextAction = actions.length > 0 ? actions[0] : null;
  return { total, registered, verified, pending, expired, reverif, expiringSoon, pendingActions: actions.length, lastInspection, nextAction };
}
