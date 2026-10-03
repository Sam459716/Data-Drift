interface Props { status: string; size?: "sm" | "md"; }

const STATUS_STYLES: Record<string, string> = {
  "Verified": "bg-green-100 text-green-800",
  "Valid": "bg-green-100 text-green-800",
  "Approved": "bg-green-100 text-green-800",
  "Passed": "bg-green-100 text-green-800",
  "Completed": "bg-green-100 text-green-800",
  "Resolved": "bg-green-100 text-green-800",
  "Active": "bg-green-100 text-green-800",
  "Certificate Generated": "bg-emerald-100 text-emerald-800",
  "Pending": "bg-yellow-100 text-yellow-800",
  "Payment Pending": "bg-yellow-100 text-yellow-800",
  "Under Review": "bg-yellow-100 text-yellow-800",
  "Submitted": "bg-blue-100 text-blue-800",
  "Scheduled": "bg-blue-100 text-blue-800",
  "In Progress": "bg-blue-100 text-blue-800",
  "Assigned": "bg-indigo-100 text-indigo-800",
  "Flagged": "bg-orange-100 text-orange-800",
  "Suspicious": "bg-orange-100 text-orange-800",
  "Under Investigation": "bg-orange-100 text-orange-800",
  "High Risk": "bg-red-100 text-red-800",
  "Expired": "bg-red-100 text-red-800",
  "Rejected": "bg-red-100 text-red-800",
  "Failed": "bg-red-100 text-red-800",
  "Pending Verification": "bg-slate-100 text-slate-700",
  "Re-verification Required": "bg-purple-100 text-purple-800",
  "LOW": "bg-green-100 text-green-800",
  "MEDIUM": "bg-yellow-100 text-yellow-800",
  "HIGH": "bg-red-100 text-red-800",
  "CRITICAL": "bg-purple-100 text-purple-800",
  "CLEAR": "bg-green-100 text-green-800",
  "SUSPICIOUS": "bg-orange-100 text-orange-800",
  "HIGH_RISK": "bg-red-100 text-red-800",
  "CONFIRMED": "bg-purple-100 text-purple-800",
  "Paid": "bg-green-100 text-green-800",
  "Low": "bg-green-100 text-green-800",
  "Medium": "bg-yellow-100 text-yellow-800",
  "High": "bg-red-100 text-red-800",
  "Urgent": "bg-purple-100 text-purple-800",
  "Closed": "bg-gray-100 text-gray-700",
  "False Positive": "bg-gray-100 text-gray-700",
  "Inspection Completed": "bg-teal-100 text-teal-800",
};

export default function StatusBadge({ status, size = "sm" }: Props) {
  const cls = STATUS_STYLES[status] ?? "bg-gray-100 text-gray-600";
  const sizeCls = size === "sm" ? "text-xs px-2 py-0.5" : "text-sm px-2.5 py-1";
  return (
    <span className={`${cls} ${sizeCls} rounded-full font-medium inline-block`}>{status}</span>
  );
}
