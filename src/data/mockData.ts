export type Role = "user" | "officer" | "admin";
export type Lang = "en" | "hi" | "mr";

export const DEMO_USERS = {
  user: { id: "USR001", name: "Rajesh Kumar", email: "rajesh@globalweigh.in", role: "user" as Role, business: "Global Weigh Industries", district: "Pune", mobile: "+91 98765 43210" },
  officer: { id: "LM102", name: "Officer Priya Sharma", email: "priya@lm.gov.in", role: "officer" as Role, district: "Pune", designation: "Legal Metrology Officer", specialization: "Weighing Instruments" },
  admin: { id: "ADM001", name: "Director Suresh Patil", email: "admin@lm.gov.in", role: "admin" as Role, department: "Legal Metrology Department, Maharashtra" },
};

export const INSTRUMENTS = [
  { id: "LM-MH-PUN-000123", serial: "WM-2024-001-A", type: "Platform Weighing Scale", manufacturer: "Avery Weigh-Tronix", model: "E1110", capacity: "500 kg", owner: "Global Weigh Industries", location: "Pune, MH", registrationDate: "2024-03-15", status: "Verified", certificateNo: "CERT-MH-PUN-2024-0123", validUntil: "2026-03-14", complianceScore: 87, riskScore: 18 },
  { id: "LM-MH-PUN-000124", serial: "WM-2024-002-B", type: "Electronic Balance", manufacturer: "Mettler Toledo", model: "ME-T", capacity: "5 kg", owner: "Global Weigh Industries", location: "Nashik, MH", registrationDate: "2024-04-10", status: "Pending Verification", certificateNo: null, validUntil: null, complianceScore: 72, riskScore: 42 },
  { id: "LM-MH-NAS-000456", serial: "FM-2023-089-C", type: "Fuel Dispenser", manufacturer: "Tatsuno", model: "Tokico II", capacity: "60 L/min", owner: "Nashik Fuels Pvt Ltd", location: "Nashik, MH", registrationDate: "2023-11-20", status: "Expired", certificateNo: "CERT-MH-NAS-2023-0456", validUntil: "2025-11-19", complianceScore: 48, riskScore: 78 },
  { id: "LM-MH-MUM-000789", serial: "WT-2024-200-D", type: "Jewellery Scale", manufacturer: "Essae", model: "DS-852", capacity: "200 g", owner: "Mumbai Gems & Jewels", location: "Mumbai, MH", registrationDate: "2024-06-01", status: "Verified", certificateNo: "CERT-MH-MUM-2024-0789", validUntil: "2026-05-31", complianceScore: 94, riskScore: 8 },
  { id: "LM-MH-NAG-001012", serial: "TK-2024-055-E", type: "Tank Truck Meter", manufacturer: "Kent", model: "ProScribe", capacity: "10000 L", owner: "Nagpur Petrochemicals", location: "Nagpur, MH", registrationDate: "2024-01-12", status: "Re-verification Required", certificateNo: "CERT-MH-NAG-2024-1012", validUntil: "2025-01-11", complianceScore: 61, riskScore: 55 },
];

export const APPLICATIONS = [
  { id: "LM-APP-2024-0891", instrumentId: "LM-MH-PUN-000123", type: "Re-verification", status: "Certificate Generated", submittedDate: "2024-08-01", fee: 1200, paymentStatus: "Paid", officer: "Officer Priya Sharma", district: "Pune", scheduledDate: "2024-08-15", completedDate: "2024-08-15" },
  { id: "LM-APP-2024-0892", instrumentId: "LM-MH-PUN-000124", type: "Initial Verification", status: "Scheduled", submittedDate: "2024-08-10", fee: 800, paymentStatus: "Paid", officer: "Officer Amit Desai", district: "Pune", scheduledDate: "2024-08-28", completedDate: null },
  { id: "LM-APP-2024-0893", instrumentId: "LM-MH-NAG-001012", type: "Re-verification", status: "Under Review", submittedDate: "2024-08-20", fee: 2500, paymentStatus: "Pending", officer: null, district: "Nagpur", scheduledDate: null, completedDate: null },
  { id: "LM-APP-2024-0850", instrumentId: "LM-MH-MUM-000789", type: "Initial Verification", status: "Approved", submittedDate: "2024-07-01", fee: 600, paymentStatus: "Paid", officer: "Officer Ravi Nair", district: "Mumbai", scheduledDate: "2024-07-10", completedDate: "2024-07-10" },
];

export const CERTIFICATES = [
  { id: "CERT-MH-PUN-2024-0123", instrumentId: "LM-MH-PUN-000123", instrumentType: "Platform Weighing Scale", owner: "Global Weigh Industries", verificationDate: "2024-08-15", validUntil: "2026-03-14", officerId: "LM102", officerName: "Officer Priya Sharma", verificationId: "VRF-2024-0891", status: "Valid", qrCode: "QR-CERT-MH-PUN-2024-0123" },
  { id: "CERT-MH-MUM-2024-0789", instrumentId: "LM-MH-MUM-000789", instrumentType: "Jewellery Scale", owner: "Mumbai Gems & Jewels", verificationDate: "2024-07-10", validUntil: "2026-05-31", officerId: "LM105", officerName: "Officer Ravi Nair", verificationId: "VRF-2024-0850", status: "Valid", qrCode: "QR-CERT-MH-MUM-2024-0789" },
  { id: "CERT-MH-NAS-2023-0456", instrumentId: "LM-MH-NAS-000456", instrumentType: "Fuel Dispenser", owner: "Nashik Fuels Pvt Ltd", verificationDate: "2023-11-25", validUntil: "2025-11-19", officerId: "LM103", officerName: "Officer Sunil More", verificationId: "VRF-2023-0456", status: "Expired", qrCode: "QR-CERT-MH-NAS-2023-0456" },
];

export const COMPLAINTS = [
  { id: "LM-CMP-2026-00125", category: "Inaccurate Weighing", businessName: "Quick Mart, Camp", instrumentType: "Counter Scale", location: "Pune", description: "The weighing scale at billing counter was showing excess weight. Bought 1 kg vegetables but scale showed 1.15 kg.", date: "2026-08-20", status: "Under Investigation", priority: "High", evidence: "photo_receipt.jpg", instrumentId: "LM-MH-PUN-000124", applicationId: null, assignedOfficer: "Officer Priya Sharma" },
  { id: "LM-CMP-2026-00120", category: "Expired Certificate", businessName: "Nashik Fuels Station 3", instrumentType: "Fuel Dispenser", location: "Nashik", description: "The fuel dispenser certificate visible at the pump had expired 3 months ago. Staff refused to show updated certificate.", date: "2026-08-15", status: "Resolved", priority: "Medium", evidence: null, instrumentId: "LM-MH-NAS-000456", applicationId: null, assignedOfficer: "Officer Sunil More" },
  { id: "LM-CMP-2026-00118", category: "Tampered Seal", businessName: "Rajdhani Grocers", instrumentType: "Platform Scale", location: "Nagpur", description: "Verification seal on the weighing machine appears tampered. Scale consistently gives readings 50-100g more than actual.", date: "2026-08-10", status: "Assigned", priority: "Urgent", evidence: "tamper_photo.jpg", instrumentId: null, applicationId: null, assignedOfficer: null },
];

export const OFFICER_ASSIGNMENTS = [
  { id: "ASSGN-001", instrumentId: "LM-MH-PUN-000124", applicationId: "LM-APP-2024-0892", business: "Global Weigh Industries", type: "Platform Weighing Scale", address: "Plot 45, MIDC, Pune 411019", scheduledDate: "2026-08-29", scheduledTime: "10:00 AM", priority: "Medium", status: "Pending", riskScore: 42, complianceScore: 72 },
  { id: "ASSGN-002", instrumentId: "LM-MH-NAG-001012", applicationId: "LM-APP-2024-0893", business: "Nagpur Petrochemicals", type: "Tank Truck Meter", address: "MIDC Butibori, Nagpur 441108", scheduledDate: "2026-08-29", scheduledTime: "02:00 PM", priority: "High", status: "Pending", riskScore: 55, complianceScore: 61 },
  { id: "ASSGN-003", instrumentId: "LM-MH-NAS-000456", applicationId: "LM-APP-2024-0850", business: "Nashik Fuels Pvt Ltd", type: "Fuel Dispenser", address: "NH-3 Service Road, Nashik 422101", scheduledDate: "2026-08-28", scheduledTime: "11:30 AM", priority: "Urgent", status: "Completed", riskScore: 78, complianceScore: 48 },
];

export const FRAUD_ALERTS = [
  { id: "FR-2026-001", instrumentId: "LM-MH-NAS-000456", business: "Nashik Fuels Pvt Ltd", riskScore: 76, riskLevel: "High", category: "Certificate Anomaly", reason: "Certificate renewed 3 times in 18 months; measurements show recurring pattern near upper error limit. Previous 2 inspections barely passed.", location: "Nashik", date: "2026-08-18", status: "Under Review", assignedOfficer: "Officer Priya Sharma" },
  { id: "FR-2026-002", instrumentId: "LM-MH-NAG-001012", business: "Nagpur Petrochemicals", riskScore: 58, riskLevel: "Medium", category: "Location Anomaly", reason: "Instrument registered at Nagpur but 2 of last 3 inspections were conducted in Aurangabad without location update.", location: "Nagpur", date: "2026-08-22", status: "Flagged", assignedOfficer: null },
  { id: "FR-2026-003", instrumentId: null, business: "Sunrise Kirana Store", riskScore: 84, riskLevel: "Critical", category: "Duplicate Data", reason: "Same serial number (WM-2024-001-A) found in applications from two different businesses in two districts simultaneously.", location: "Pune", date: "2026-08-25", status: "Under Investigation", assignedOfficer: "Officer Amit Desai" },
];

export const NOTIFICATIONS = [
  { id: "N001", type: "warning", title: "Certificate Expiring Soon", message: "Instrument LM-MH-NAG-001012 certificate expires in 28 days. Apply for re-verification.", date: "2026-08-29", read: false },
  { id: "N002", type: "success", title: "Certificate Generated", message: "Digital certificate CERT-MH-PUN-2024-0123 has been generated for your instrument.", date: "2026-08-15", read: true },
  { id: "N003", type: "info", title: "Inspection Scheduled", message: "Inspection for LM-MH-PUN-000124 scheduled on 28 Aug 2026 at 10:00 AM.", date: "2026-08-20", read: false },
  { id: "N004", type: "error", title: "Complaint Update", message: "Your complaint LM-CMP-2026-00125 is now Under Investigation.", date: "2026-08-22", read: false },
];

export const AUDIT_LOGS = [
  { id: "AL001", user: "Officer Priya Sharma", role: "Officer", action: "Completed field verification", record: "LM-APP-2024-0891", timestamp: "2026-08-28 10:42 AM", prev: "Inspection Completed", next: "Approved" },
  { id: "AL002", user: "System", role: "System", action: "Certificate generated automatically", record: "CERT-MH-PUN-2024-0123", timestamp: "2026-08-28 10:45 AM", prev: null, next: "Certificate Generated" },
  { id: "AL003", user: "Rajesh Kumar", role: "User", action: "Submitted re-verification application", record: "LM-APP-2024-0893", timestamp: "2026-08-20 09:15 AM", prev: null, next: "Submitted" },
  { id: "AL004", user: "Director Suresh Patil", role: "Admin", action: "Assigned fraud alert for investigation", record: "FR-2026-001", timestamp: "2026-08-22 03:00 PM", prev: "Flagged", next: "Under Review" },
  { id: "AL005", user: "Officer Amit Desai", role: "Officer", action: "Captured GPS location for inspection", record: "ASSGN-001", timestamp: "2026-08-29 10:05 AM", prev: null, next: "GPS Captured" },
];

export const ANALYTICS_DATA = {
  applicationsTrend: [
    { month: "Mar", submitted: 42, approved: 35, rejected: 5 },
    { month: "Apr", submitted: 58, approved: 48, rejected: 7 },
    { month: "May", submitted: 63, approved: 55, rejected: 6 },
    { month: "Jun", submitted: 71, approved: 60, rejected: 8 },
    { month: "Jul", submitted: 84, approved: 72, rejected: 9 },
    { month: "Aug", submitted: 96, approved: 80, rejected: 11 },
  ],
  districtWise: [
    { district: "Pune", instruments: 420, verified: 380, pending: 40, complaints: 28 },
    { district: "Mumbai", instruments: 612, verified: 560, pending: 52, complaints: 45 },
    { district: "Nashik", instruments: 218, verified: 185, pending: 33, complaints: 22 },
    { district: "Nagpur", instruments: 295, verified: 248, pending: 47, complaints: 31 },
    { district: "Aurangabad", instruments: 178, verified: 142, pending: 36, complaints: 18 },
    { district: "Thane", instruments: 334, verified: 290, pending: 44, complaints: 27 },
  ],
  instrumentTypes: [
    { type: "Weighing Scales", count: 845, pct: 38 },
    { type: "Fuel Dispensers", count: 412, pct: 18 },
    { type: "Medical Devices", count: 224, pct: 10 },
    { type: "Tank Meters", count: 198, pct: 9 },
    { type: "Jewellery Scales", count: 312, pct: 14 },
    { type: "Others", count: 245, pct: 11 },
  ],
  passFailRatio: [
    { name: "Passed", value: 1820, color: "#16a34a" },
    { name: "Failed", value: 180, color: "#dc2626" },
    { name: "Re-verify", value: 240, color: "#d97706" },
  ],
  complianceDist: [
    { range: "90–100 (Excellent)", count: 420 },
    { range: "75–89 (Good)", count: 680 },
    { range: "50–74 (Moderate)", count: 390 },
    { range: "25–49 (High Risk)", count: 180 },
    { range: "0–24 (Critical)", count: 62 },
  ],
};

export const INSTRUMENT_PASSPORT_TIMELINE = [
  { date: "2024-03-15", event: "Instrument Registered", details: "Registered at Pune, MH", icon: "📋", status: "completed" },
  { date: "2024-03-20", event: "Application Submitted", details: "Application LM-APP-2024-0851 submitted", icon: "📝", status: "completed" },
  { date: "2024-03-22", event: "Fee Paid", details: "Payment of ₹1,200 received", icon: "💳", status: "completed" },
  { date: "2024-04-02", event: "Officer Assigned", details: "Officer Priya Sharma assigned", icon: "👮", status: "completed" },
  { date: "2024-04-05", event: "Field Inspection", details: "Conducted at Pune facility — Passed", icon: "🔍", status: "completed" },
  { date: "2024-04-06", event: "Certificate Issued", details: "CERT-MH-PUN-2024-0051 issued", icon: "🏆", status: "completed" },
  { date: "2024-08-01", event: "Re-verification Applied", details: "Application LM-APP-2024-0891 submitted", icon: "🔄", status: "completed" },
  { date: "2024-08-15", event: "Re-verification Completed", details: "Passed — new certificate issued", icon: "✅", status: "completed" },
  { date: "2026-03-14", event: "Certificate Expires", details: "Renewal required before this date", icon: "⚠️", status: "upcoming" },
];

export const OFFICERS_LIST = [
  { id: "LM102", name: "Officer Priya Sharma", district: "Pune", workload: "Medium", activeAssignments: 4, specialization: "Weighing Instruments", score: 88 },
  { id: "LM103", name: "Officer Sunil More", district: "Nashik", workload: "Low", activeAssignments: 2, specialization: "Fuel Dispensers", score: 92 },
  { id: "LM104", name: "Officer Amit Desai", district: "Pune", workload: "High", activeAssignments: 8, specialization: "All Types", score: 75 },
  { id: "LM105", name: "Officer Ravi Nair", district: "Mumbai", workload: "High", activeAssignments: 7, specialization: "Medical & Precision", score: 79 },
  { id: "LM106", name: "Officer Kavita Joshi", district: "Nagpur", workload: "Low", activeAssignments: 1, specialization: "Tank Meters", score: 95 },
];
