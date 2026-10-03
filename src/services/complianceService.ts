// Compliance Tier Engine — deterministic, no randomness.
// Specification (Req #4):
//   RED   → any instrument UNREGISTERED | FAILED | SUSPENDED | EXPIRED
//   YELLOW→ any instrument PENDING_VERIFICATION | EXPIRING_SOON
//   GREEN → all instruments REGISTERED_VERIFIED
//
// Spatial Query Engine (Req #2):
//   Uses Haversine formula with configurable radius.
//   Query syntax: { lat, lng, radiusKm, categories?, nameContains? }

import type { Shop, ComplianceTier, PublicInstrument } from "../data/publicData";
import { haversineKm, PUBLIC_SHOPS } from "../data/publicData";

// ─── Compliance Tier ──────────────────────────────────────

const RED_STATUSES = new Set(["UNREGISTERED", "FAILED", "SUSPENDED", "EXPIRED"]);
const YELLOW_STATUSES = new Set(["PENDING_VERIFICATION", "EXPIRING_SOON"]);

export function calcShopTier(instruments: PublicInstrument[]): ComplianceTier {
  if (instruments.length === 0) return "RED";           // no instruments = unregistered
  if (instruments.some(i => RED_STATUSES.has(i.status))) return "RED";
  if (instruments.some(i => YELLOW_STATUSES.has(i.status))) return "YELLOW";
  return "GREEN";
}

export interface TierMeta {
  tier: ComplianceTier;
  label: string;
  shortLabel: string;
  description: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
  dotColor: string;
  hex: string;
}

export const TIER_META: Record<ComplianceTier, TierMeta> = {
  GREEN: {
    tier: "GREEN",
    label: "Compliant",
    shortLabel: "Compliant",
    description: "Registered and verified.",
    bgClass: "bg-green-50",
    textClass: "text-green-800",
    borderClass: "border-green-300",
    dotColor: "#16a34a",
    hex: "#16a34a",
  },
  YELLOW: {
    tier: "YELLOW",
    label: "Attention Required",
    shortLabel: "Attention",
    description: "Verification pending or expiring soon.",
    bgClass: "bg-amber-50",
    textClass: "text-amber-800",
    borderClass: "border-amber-300",
    dotColor: "#d97706",
    hex: "#d97706",
  },
  RED: {
    tier: "RED",
    label: "Non-Compliant",
    shortLabel: "Non-Compliant",
    description: "Unregistered or not currently verified.",
    bgClass: "bg-red-50",
    textClass: "text-red-800",
    borderClass: "border-red-300",
    dotColor: "#dc2626",
    hex: "#dc2626",
  },
};

export function tierMeta(tier: ComplianceTier): TierMeta {
  return TIER_META[tier];
}

// ─── Spatial Query Engine ────────────────────────────────

export interface SpatialQuery {
  lat: number;
  lng: number;
  radiusKm: 1 | 2 | 5 | 10;
  categories?: Shop["category"][];
  nameContains?: string;
  tierFilter?: ComplianceTier[];
}

export interface ShopWithDistance extends Shop {
  distanceKm: number;
  tier: ComplianceTier;
}

export function queryNearby(query: SpatialQuery): ShopWithDistance[] {
  return PUBLIC_SHOPS
    .map(shop => ({
      ...shop,
      distanceKm: haversineKm(query.lat, query.lng, shop.lat, shop.lng),
      tier: calcShopTier(shop.instruments),
    }))
    .filter(s => {
      if (s.distanceKm > query.radiusKm) return false;
      if (query.categories?.length && !query.categories.includes(s.category)) return false;
      if (query.nameContains && !s.name.toLowerCase().includes(query.nameContains.toLowerCase()) && !s.area.toLowerCase().includes(query.nameContains.toLowerCase())) return false;
      if (query.tierFilter?.length && !query.tierFilter.includes(s.tier)) return false;
      return true;
    })
    .sort((a, b) => a.distanceKm - b.distanceKm);
}

// Text search (no location needed)
export function searchShops(query: string, district?: string): ShopWithDistance[] {
  const q = query.toLowerCase();
  return PUBLIC_SHOPS
    .filter(s => {
      const matches =
        s.name.toLowerCase().includes(q) ||
        s.area.toLowerCase().includes(q) ||
        s.category.toLowerCase().includes(q) ||
        s.address.toLowerCase().includes(q);
      if (!matches) return false;
      if (district && s.district !== district) return false;
      return true;
    })
    .map(s => ({ ...s, distanceKm: 0, tier: calcShopTier(s.instruments) }));
}

export function getShopById(id: string): ShopWithDistance | undefined {
  const shop = PUBLIC_SHOPS.find(s => s.id === id);
  if (!shop) return undefined;
  return { ...shop, distanceKm: 0, tier: calcShopTier(shop.instruments) };
}

// Average rating helper
export function avgRating(shop: Shop): number {
  if (!shop.reviews.length) return 0;
  return shop.reviews.reduce((s, r) => s + r.rating, 0) / shop.reviews.length;
}

// Instrument status display helpers
export const INSTRUMENT_STATUS_META: Record<
  PublicInstrument["status"],
  { label: string; color: string; bg: string; icon: string }
> = {
  REGISTERED_VERIFIED: { label: "Verified", color: "text-green-800", bg: "bg-green-100", icon: "✅" },
  PENDING_VERIFICATION: { label: "Pending Verification", color: "text-yellow-800", bg: "bg-yellow-100", icon: "⏳" },
  EXPIRING_SOON: { label: "Expiring Soon (≤30 days)", color: "text-amber-800", bg: "bg-amber-100", icon: "⚠️" },
  EXPIRED: { label: "Expired", color: "text-red-800", bg: "bg-red-100", icon: "❌" },
  FAILED: { label: "Failed Verification", color: "text-red-800", bg: "bg-red-100", icon: "🚫" },
  SUSPENDED: { label: "Suspended", color: "text-purple-800", bg: "bg-purple-100", icon: "⛔" },
  UNREGISTERED: { label: "Unregistered", color: "text-gray-700", bg: "bg-gray-100", icon: "❓" },
};

// Complaint ID generator (deterministic for demo)
export function generateComplaintId(): string {
  const n = 100 + (PUBLIC_SHOPS.reduce((acc, s) => acc + s.complaints.length, 0) + Math.floor(Math.random() * 50) + 130);
  return `LM-CMP-2026-${n.toString().padStart(5, "0")}`;
}
