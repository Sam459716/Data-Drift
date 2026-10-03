// Compliance Cost Service — Verify vs Replace calculator.
// IMPORTANT: All values are configurable demo assumptions, NOT official government pricing.
// Clearly label as demo/configurable in UI.

export interface CostInputs {
  verificationFee: number;       // ₹
  maintenanceCostPerYear: number; // ₹
  instrumentAge: number;          // years
  remainingLifeYears: number;     // years
  replacementCost: number;        // ₹
  setupCost: number;              // ₹
  analysisYears: number;          // comparison horizon (typically 3)
}

export interface CostResult {
  verifyTotalCost: number;
  replaceTotalCost: number;
  difference: number;            // positive = verify is cheaper
  recommendation: "VERIFY" | "REPLACE";
  verifyBreakdown: { label: string; amount: number }[];
  replaceBreakdown: { label: string; amount: number }[];
  explanationVerify: string;
  explanationReplace: string;
  disclaimer: string;
}

export const DEFAULT_INPUTS: CostInputs = {
  verificationFee: 1200,
  maintenanceCostPerYear: 800,
  instrumentAge: 4,
  remainingLifeYears: 3,
  replacementCost: 18000,
  setupCost: 2500,
  analysisYears: 3,
};

export function calculateCostComparison(inputs: CostInputs): CostResult {
  const {
    verificationFee,
    maintenanceCostPerYear,
    remainingLifeYears,
    replacementCost,
    setupCost,
    analysisYears,
  } = inputs;

  const years = Math.min(analysisYears, remainingLifeYears);

  // Option A: Verify existing
  const maintenanceTotal = maintenanceCostPerYear * years;
  const verifyTotal = verificationFee + maintenanceTotal;

  // Option B: Replace
  const replaceVerifFee = verificationFee; // new instrument also needs verification
  const replaceTotal = replacementCost + setupCost + replaceVerifFee;

  const difference = replaceTotal - verifyTotal;
  const recommendation: "VERIFY" | "REPLACE" = verifyTotal <= replaceTotal ? "VERIFY" : "REPLACE";

  return {
    verifyTotalCost: verifyTotal,
    replaceTotalCost: replaceTotal,
    difference: Math.abs(difference),
    recommendation,
    verifyBreakdown: [
      { label: "Verification fee", amount: verificationFee },
      { label: `Maintenance (${years} yr)`, amount: maintenanceTotal },
    ],
    replaceBreakdown: [
      { label: "New instrument", amount: replacementCost },
      { label: "Setup cost", amount: setupCost },
      { label: "New verification fee", amount: replaceVerifFee },
    ],
    explanationVerify:
      `Based on the configured demo assumptions, continuing with the existing instrument appears more economical over ${years} year${years !== 1 ? "s" : ""}. Existing compliance history is preserved.`,
    explanationReplace:
      `Based on the configured demo assumptions, replacement may be more economical over ${years} year${years !== 1 ? "s" : ""}. Note: previous compliance history will not transfer to a new instrument.`,
    disclaimer:
      "⚠️ These are demo/configurable estimates. Actual government fees, replacement costs, and service life will vary. This tool is for planning purposes only. Consult your Legal Metrology officer for official guidance.",
  };
}
