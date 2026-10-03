// Public Consumer Transparency Layer — shop/instrument data with geo-coordinates.
// Lat/lng attached directly to each shop entity (not just inspection logs).

export type ComplianceTier = "GREEN" | "YELLOW" | "RED";

export interface PublicInstrument {
  id: string;
  serial: string;
  type: string;
  capacity: string;
  status:
    | "REGISTERED_VERIFIED"
    | "PENDING_VERIFICATION"
    | "EXPIRING_SOON"      // within 30 days
    | "EXPIRED"
    | "FAILED"
    | "SUSPENDED"
    | "UNREGISTERED";
  certId: string | null;
  certValidUntil: string | null;
  lastVerified: string | null;
}

export interface ShopReview {
  id: string;
  author: string;             // first name + last initial only
  rating: 1 | 2 | 3 | 4 | 5;
  category: "accuracy" | "fairness" | "behavior" | "general";
  comment: string;
  date: string;
  helpful: number;
  verified: boolean;          // consumer verified the instrument on-site via QR
}

export interface PublicComplaint {
  id: string;
  shopId: string;
  category: string;
  description: string;
  date: string;
  status: "Submitted" | "Under Review" | "Assigned" | "Resolved" | "Rejected";
  anonymous: boolean;
}

export interface Shop {
  id: string;
  name: string;
  category: "Grocery" | "Fuel Station" | "Jewellery" | "Pharmacy" | "Supermarket" | "Hardware" | "Dairy" | "Vegetable Market";
  address: string;
  area: string;
  district: string;
  lat: number;
  lng: number;
  phone: string;
  owner: string;
  registeredSince: string;
  instruments: PublicInstrument[];
  reviews: ShopReview[];
  complaints: PublicComplaint[];
}

// Haversine distance — returns km between two coords
export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

export const PUBLIC_SHOPS: Shop[] = [
  {
    id: "SHOP-001",
    name: "Anand Kirana Store",
    category: "Grocery",
    address: "Shop 12, FC Road, Shivajinagar",
    area: "Shivajinagar",
    district: "Pune",
    lat: 18.5322,
    lng: 73.8468,
    phone: "+91 98700 11111",
    owner: "Ramesh Anand",
    registeredSince: "2019-04-10",
    instruments: [
      { id: "LM-MH-PUN-000201", serial: "WS-2024-A01", type: "Counter Weighing Scale", capacity: "30 kg", status: "REGISTERED_VERIFIED", certId: "CERT-MH-PUN-2024-0201", certValidUntil: "2026-06-30", lastVerified: "2024-06-15" },
      { id: "LM-MH-PUN-000202", serial: "WS-2024-A02", type: "Platform Scale", capacity: "150 kg", status: "REGISTERED_VERIFIED", certId: "CERT-MH-PUN-2024-0202", certValidUntil: "2026-06-28", lastVerified: "2024-06-15" },
    ],
    reviews: [
      { id: "R001", author: "Priya M.", rating: 5, category: "accuracy", comment: "Weighing machine is accurate and certificate is displayed clearly. Trustworthy shop.", date: "2026-08-20", helpful: 14, verified: true },
      { id: "R002", author: "Suresh K.", rating: 4, category: "general", comment: "Good service. I verified the instrument QR and it was valid.", date: "2026-07-15", helpful: 8, verified: true },
      { id: "R003", author: "Meena T.", rating: 5, category: "fairness", comment: "Never felt cheated here. Scale shows correct weight every time.", date: "2026-06-22", helpful: 22, verified: false },
    ],
    complaints: [],
  },
  {
    id: "SHOP-002",
    name: "Nashik Fuels — Pump No. 3",
    category: "Fuel Station",
    address: "NH-3 Bypass, Gangapur Road",
    area: "Gangapur Road",
    district: "Nashik",
    lat: 20.0027,
    lng: 73.7832,
    phone: "+91 98700 22222",
    owner: "Suresh Patil",
    registeredSince: "2018-09-15",
    instruments: [
      { id: "LM-MH-NAS-000456", serial: "FM-2023-089-C", type: "Fuel Dispenser", capacity: "60 L/min", status: "EXPIRED", certId: "CERT-MH-NAS-2023-0456", certValidUntil: "2025-11-19", lastVerified: "2023-11-25" },
      { id: "LM-MH-NAS-000457", serial: "FM-2023-090-D", type: "Fuel Dispenser", capacity: "60 L/min", status: "PENDING_VERIFICATION", certId: null, certValidUntil: null, lastVerified: null },
    ],
    reviews: [
      { id: "R004", author: "Ashok R.", rating: 2, category: "accuracy", comment: "Certificate was expired when I checked. Staff was rude when I asked about it.", date: "2026-08-10", helpful: 31, verified: true },
      { id: "R005", author: "Rekha N.", rating: 1, category: "fairness", comment: "Reported to Legal Metrology. Dispenser shows less fuel than paid for.", date: "2026-07-28", helpful: 45, verified: false },
    ],
    complaints: [
      { id: "LM-CMP-2026-00120", shopId: "SHOP-002", category: "Expired Certificate", description: "Fuel dispenser certificate expired 3 months ago. Staff refused to show updated certificate.", date: "2026-08-15", status: "Under Review", anonymous: false },
    ],
  },
  {
    id: "SHOP-003",
    name: "Swarna Jewellers",
    category: "Jewellery",
    address: "15, MG Road, Camp",
    area: "Camp",
    district: "Pune",
    lat: 18.5204,
    lng: 73.8650,
    phone: "+91 98700 33333",
    owner: "Vijay Mehta",
    registeredSince: "2020-02-28",
    instruments: [
      { id: "LM-MH-PUN-000780", serial: "JW-2026-001", type: "Jewellery Scale 100g", capacity: "100 g", status: "EXPIRING_SOON", certId: "CERT-MH-PUN-2026-0780", certValidUntil: "2026-09-15", lastVerified: "2024-09-10" },
      { id: "LM-MH-PUN-000781", serial: "JW-2024-200", type: "Jewellery Scale 200g", capacity: "200 g", status: "REGISTERED_VERIFIED", certId: "CERT-MH-PUN-2024-0781", certValidUntil: "2026-12-01", lastVerified: "2024-12-01" },
    ],
    reviews: [
      { id: "R006", author: "Kiran V.", rating: 4, category: "accuracy", comment: "Certificate is displayed. One scale shows 'expiring soon' notice — good transparency.", date: "2026-08-25", helpful: 6, verified: true },
    ],
    complaints: [],
  },
  {
    id: "SHOP-004",
    name: "Sunrise Kirana — Model Colony",
    category: "Grocery",
    address: "Plot 8, Model Colony, Shivajinagar",
    area: "Model Colony",
    district: "Pune",
    lat: 18.5297,
    lng: 73.8551,
    phone: "+91 98700 44444",
    owner: "Babu Sharma",
    registeredSince: "2022-11-05",
    instruments: [
      { id: "LM-MH-PUN-000999", serial: "WM-2024-001-A", type: "Counter Scale", capacity: "30 kg", status: "UNREGISTERED", certId: null, certValidUntil: null, lastVerified: null },
    ],
    reviews: [
      { id: "R007", author: "Deepak S.", rating: 1, category: "accuracy", comment: "No registration certificate visible anywhere. Scale seems to give extra weight.", date: "2026-08-18", helpful: 52, verified: false },
      { id: "R008", author: "Anita B.", rating: 2, category: "general", comment: "I asked to see the verification stamp — owner couldn't show one.", date: "2026-08-22", helpful: 29, verified: false },
    ],
    complaints: [
      { id: "LM-CMP-2026-00125", shopId: "SHOP-004", category: "Inaccurate Weighing", description: "Scale showing excess weight. Bought 1 kg vegetables but scale showed 1.15 kg.", date: "2026-08-20", status: "Under Review", anonymous: true },
    ],
  },
  {
    id: "SHOP-005",
    name: "City Super Mart",
    category: "Supermarket",
    address: "Ground Floor, Orbit Mall, Wakad",
    area: "Wakad",
    district: "Pune",
    lat: 18.5988,
    lng: 73.7634,
    phone: "+91 98700 55555",
    owner: "Rajesh Gupta",
    registeredSince: "2021-03-20",
    instruments: [
      { id: "LM-MH-PUN-000301", serial: "SM-2024-001", type: "Checkout Counter Scale", capacity: "15 kg", status: "REGISTERED_VERIFIED", certId: "CERT-MH-PUN-2024-0301", certValidUntil: "2026-11-30", lastVerified: "2024-11-20" },
      { id: "LM-MH-PUN-000302", serial: "SM-2024-002", type: "Checkout Counter Scale", capacity: "15 kg", status: "REGISTERED_VERIFIED", certId: "CERT-MH-PUN-2024-0302", certValidUntil: "2026-11-30", lastVerified: "2024-11-20" },
      { id: "LM-MH-PUN-000303", serial: "SM-2024-003", type: "Hanging Scale", capacity: "50 kg", status: "REGISTERED_VERIFIED", certId: "CERT-MH-PUN-2024-0303", certValidUntil: "2026-10-15", lastVerified: "2024-10-10" },
    ],
    reviews: [
      { id: "R009", author: "Neeha P.", rating: 5, category: "accuracy", comment: "All scales are certified and QR stickers are on each machine. Very transparent.", date: "2026-08-12", helpful: 18, verified: true },
      { id: "R010", author: "Rohit M.", rating: 5, category: "fairness", comment: "Staff showed me the certificate when asked. Everything in order.", date: "2026-07-30", helpful: 11, verified: true },
    ],
    complaints: [],
  },
  {
    id: "SHOP-006",
    name: "Ram Medical & Pharmacy",
    category: "Pharmacy",
    address: "42, Tilak Road, Sadashiv Peth",
    area: "Sadashiv Peth",
    district: "Pune",
    lat: 18.5118,
    lng: 73.8498,
    phone: "+91 98700 66666",
    owner: "Dr. Ram Kulkarni",
    registeredSince: "2020-07-01",
    instruments: [
      { id: "LM-MH-PUN-000401", serial: "PH-2024-001", type: "Precision Balance", capacity: "500 g", status: "REGISTERED_VERIFIED", certId: "CERT-MH-PUN-2024-0401", certValidUntil: "2027-01-15", lastVerified: "2025-01-10" },
    ],
    reviews: [
      { id: "R011", author: "Gayatri R.", rating: 5, category: "accuracy", comment: "Pharmaceutical scale is certified. Great pharmacy.", date: "2026-08-01", helpful: 7, verified: true },
    ],
    complaints: [],
  },
  {
    id: "SHOP-007",
    name: "Nagpur Fresh Vegetables",
    category: "Vegetable Market",
    address: "Stall 22, Cotton Market Area",
    area: "Cotton Market",
    district: "Nagpur",
    lat: 21.1441,
    lng: 79.0800,
    phone: "+91 98700 77777",
    owner: "Santosh Raut",
    registeredSince: "2023-05-12",
    instruments: [
      { id: "LM-MH-NAG-000501", serial: "VM-2024-001", type: "Platform Scale", capacity: "100 kg", status: "FAILED", certId: "CERT-MH-NAG-2024-0501", certValidUntil: "2025-06-10", lastVerified: "2024-06-05" },
    ],
    reviews: [
      { id: "R012", author: "Pooja W.", rating: 2, category: "accuracy", comment: "Scale failed verification. Please get it fixed.", date: "2026-07-20", helpful: 19, verified: false },
    ],
    complaints: [
      { id: "LM-CMP-2026-00118", shopId: "SHOP-007", category: "Tampered Seal", description: "Verification seal appears tampered. Scale consistently overestimates by 50-100g.", date: "2026-08-10", status: "Assigned", anonymous: false },
    ],
  },
  {
    id: "SHOP-008",
    name: "Mumbai Gems & Jewels",
    category: "Jewellery",
    address: "208, Zaveri Bazaar, Marine Lines",
    area: "Zaveri Bazaar",
    district: "Mumbai",
    lat: 18.9498,
    lng: 72.8330,
    phone: "+91 98700 88888",
    owner: "Harish Shah",
    registeredSince: "2022-01-15",
    instruments: [
      { id: "LM-MH-MUM-000789", serial: "WT-2024-200-D", type: "Jewellery Scale", capacity: "200 g", status: "REGISTERED_VERIFIED", certId: "CERT-MH-MUM-2024-0789", certValidUntil: "2026-05-31", lastVerified: "2024-07-10" },
    ],
    reviews: [
      { id: "R013", author: "Sunita H.", rating: 5, category: "accuracy", comment: "Certified scale. Trustworthy jeweller.", date: "2026-08-05", helpful: 9, verified: true },
    ],
    complaints: [],
  },
];

export const PUBLIC_FAQS = [
  { q: "What is Legal Metrology?", a: "Legal Metrology is the application of government-regulated measurement standards to commercial transactions — ensuring that weighing machines, fuel dispensers, and measuring instruments used in trade are accurate and cannot be tampered with." },
  { q: "Why should I check a shop's compliance status?", a: "Verified instruments mean accurate measurements. If a shop's scale is unregistered or expired, the government cannot confirm it gives correct readings. Compliant (Green) shops have been independently inspected and approved." },
  { q: "What should I do if a shop refuses to show a certificate?", a: "You can file a complaint directly from this portal — no account needed. Alternatively, you can call the Legal Metrology helpline. Every certified instrument must display a valid certificate or QR sticker on the instrument itself." },
  { q: "How do I verify a certificate myself?", a: "Scan the QR sticker on the instrument using your phone camera, or enter the Certificate ID on this portal. The system will show whether it is Valid, Expired, or Invalid." },
  { q: "How often are instruments re-verified?", a: "Verification periods vary by instrument type and are set by the Legal Metrology Department. Businesses must apply for re-verification before their certificate expires." },
  { q: "My complaint was marked Resolved — what does that mean?", a: "It means the assigned officer has investigated and taken action (warning, penalty, or enforcement). You can track your complaint status using your Complaint ID without logging in." },
  { q: "Is my complaint information kept private?", a: "You can choose to file anonymously. If you submit your contact details, they are only accessible to assigned officers — not shown publicly." },
  { q: "What is a Fraud Risk alert?", a: "If AI analysis detects suspicious patterns (duplicate instruments, repeated failures, tampered seals), the record is flagged for officer investigation. These are not confirmed fraud — they are referrals for human review." },
];

export const TRANSPARENCY_STATS = {
  totalShops: 4218,
  greenShops: 3420,
  yellowShops: 528,
  redShops: 270,
  totalInstruments: 11842,
  verifiedInstruments: 10024,
  pendingInstruments: 982,
  expiredInstruments: 836,
  complaintsFiled: 1248,
  complaintsResolved: 1086,
  avgResolutionDays: 3.4,
  districtStats: [
    { district: "Pune", shops: 1120, green: 920, yellow: 130, red: 70 },
    { district: "Mumbai", shops: 1580, green: 1290, yellow: 200, red: 90 },
    { district: "Nashik", shops: 480, green: 370, yellow: 72, red: 38 },
    { district: "Nagpur", shops: 620, green: 484, yellow: 88, red: 48 },
    { district: "Aurangabad", shops: 218, green: 164, yellow: 34, red: 20 },
    { district: "Thane", shops: 200, green: 192, yellow: 4, red: 4 },
  ],
};
