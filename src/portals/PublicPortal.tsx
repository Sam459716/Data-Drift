/**
 * Public Consumer Transparency & Participation Layer
 * Routes: /public  /consumer  /nearby
 * Fully unauthenticated — no login required for any feature.
 *
 * Sections:
 *   1.  Home — search bar, hero, transparency stats
 *   2.  Nearby Discovery — spatial query with radius selector
 *   3.  Shop Detail — compliance breakdown, instruments, reviews
 *   4.  File Complaint — anonymous or named
 *   5.  Track Complaint — by complaint ID
 *   6.  Certificate Verify — QR / ID lookup
 *   7.  Reviews — submit & browse
 *   8.  Consumer Education — FAQ + rights guide
 *   9.  Transparency Dashboard — aggregate statistics
 *  10.  Consumer Rights & How-To guide
 */

import { useState, useEffect, useRef, useCallback } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from "recharts";
import { PUBLIC_SHOPS, TRANSPARENCY_STATS, PUBLIC_FAQS, type Shop, type ComplianceTier } from "../data/publicData";
import {
  calcShopTier, tierMeta, queryNearby, searchShops, getShopById, avgRating,
  INSTRUMENT_STATUS_META, generateComplaintId,
  type ShopWithDistance, type SpatialQuery,
} from "../services/complianceService";
import { getCurrentLocation, formatAccuracy, type GeoPosition } from "../services/locationService";
import { startListening, isSpeechSupported, type SpeechStatus } from "../services/speechToTextService";
import { CERTIFICATES } from "../data/mockData";

// Fix Leaflet default marker icon paths broken by Vite's asset bundling
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Custom coloured SVG marker factory
function makeShopIcon(hex: string) {
  return L.divIcon({
    className: "",
    html: `<svg width="28" height="36" viewBox="0 0 28 36" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 0C6.27 0 0 6.27 0 14c0 9.75 14 22 14 22s14-12.25 14-22C28 6.27 21.73 0 14 0z" fill="${hex}" stroke="white" stroke-width="2"/>
      <circle cx="14" cy="14" r="6" fill="white" opacity="0.9"/>
    </svg>`,
    iconSize: [28, 36],
    iconAnchor: [14, 36],
    popupAnchor: [0, -36],
  });
}

function makeUserIcon() {
  return L.divIcon({
    className: "",
    html: `<div style="width:20px;height:20px;border-radius:50%;background:#3b82f6;border:3px solid white;box-shadow:0 0 0 3px rgba(59,130,246,0.3)"></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });
}

// Helper: fly map to new center when coords change
function MapFly({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  useEffect(() => { map.flyTo([lat, lng], 14, { duration: 1.2 }); }, [lat, lng]);
  return null;
}

interface Props { onBack: () => void; }

// ─── Shared primitives ────────────────────────────────────

function Card({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <div className={`bg-white rounded-2xl border border-gray-200 shadow-sm ${className}`}>{children}</div>;
}

function TierBadge({ tier, size = "sm" }: { tier: ComplianceTier; size?: "sm" | "md" | "lg" }) {
  const m = tierMeta(tier);
  const sz = { sm: "text-xs px-2.5 py-0.5", md: "text-sm px-3 py-1", lg: "text-base px-4 py-1.5 font-bold" }[size];
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full font-semibold border ${sz} ${m.bgClass} ${m.textClass} ${m.borderClass}`}>
      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: m.hex }} />
      {m.label}
    </span>
  );
}

function TierDot({ tier, pulse = false }: { tier: ComplianceTier; pulse?: boolean }) {
  const m = tierMeta(tier);
  return (
    <span className="relative inline-flex h-3 w-3 shrink-0">
      {pulse && <span className="animate-ping absolute inline-flex h-full w-full rounded-full opacity-50" style={{ background: m.hex }} />}
      <span className="relative inline-flex rounded-full h-3 w-3" style={{ background: m.hex }} />
    </span>
  );
}

function StarRating({ rating, max = 5, size = 14 }: { rating: number; max?: number; size?: number }) {
  return (
    <span className="inline-flex gap-0.5">
      {Array.from({ length: max }).map((_, i) => (
        <svg key={i} width={size} height={size} viewBox="0 0 20 20" fill={i < Math.round(rating) ? "#f59e0b" : "#e5e7eb"}>
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.957a1 1 0 00.95.69h4.162c.969 0 1.371 1.24.588 1.81l-3.37 2.448a1 1 0 00-.364 1.118l1.287 3.957c.3.921-.755 1.688-1.54 1.118l-3.37-2.448a1 1 0 00-1.175 0l-3.37 2.448c-.784.57-1.838-.197-1.539-1.118l1.287-3.957a1 1 0 00-.364-1.118L2.05 9.384c-.783-.57-.38-1.81.588-1.81h4.162a1 1 0 00.95-.69l1.287-3.957z" />
        </svg>
      ))}
    </span>
  );
}

function ShopCard({ shop, onSelect }: { shop: ShopWithDistance; onSelect: () => void }) {
  const m = tierMeta(shop.tier);
  const rating = avgRating(shop);
  return (
    <button onClick={onSelect}
      className={`w-full text-left p-4 rounded-2xl border-2 transition-all hover:shadow-md hover:-translate-y-0.5 ${m.borderClass} ${m.bgClass}/30 bg-white`}>
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg shrink-0" style={{ background: m.hex + "20" }}>
            {shop.category === "Grocery" ? "🛒" : shop.category === "Fuel Station" ? "⛽" : shop.category === "Jewellery" ? "💍" : shop.category === "Pharmacy" ? "💊" : shop.category === "Supermarket" ? "🏪" : shop.category === "Vegetable Market" ? "🥦" : shop.category === "Dairy" ? "🥛" : "🔧"}
          </div>
          <div>
            <div className="font-bold text-gray-900 text-sm leading-tight">{shop.name}</div>
            <div className="text-xs text-gray-500 mt-0.5">{shop.area}, {shop.district}</div>
          </div>
        </div>
        <TierBadge tier={shop.tier} />
      </div>
      <div className="text-xs text-gray-500 mb-2">{m.description}</div>
      <div className="flex items-center gap-4 text-xs">
        {shop.distanceKm > 0 && <span className="text-blue-700 font-medium">📍 {shop.distanceKm.toFixed(1)} km</span>}
        <span className="text-gray-500">⚖️ {shop.instruments.length} instrument{shop.instruments.length !== 1 ? "s" : ""}</span>
        {rating > 0 && <span className="flex items-center gap-1 text-gray-500"><StarRating rating={rating} size={10} /> {rating.toFixed(1)}</span>}
        {shop.complaints.length > 0 && <span className="text-red-600">📣 {shop.complaints.length} complaint{shop.complaints.length !== 1 ? "s" : ""}</span>}
      </div>
    </button>
  );
}

// ─── Section 1: Home ──────────────────────────────────────

function HomeSection({ onSection, onShopSelect }: { onSection: (s: string) => void; onShopSelect: (id: string) => void }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ShopWithDistance[]>([]);
  const [searched, setSearched] = useState(false);

  const handleSearch = () => {
    if (!query.trim()) return;
    setResults(searchShops(query));
    setSearched(true);
  };

  const g = TRANSPARENCY_STATS.greenShops;
  const y = TRANSPARENCY_STATS.yellowShops;
  const r = TRANSPARENCY_STATS.redShops;
  const total = g + y + r;

  return (
    <div className="fade-in">
      {/* Hero */}
      <div className="text-center py-12 px-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-full text-sm font-medium border border-blue-200 mb-6">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse inline-block" />
          Public Transparency Portal — No login required
        </div>
        <h1 className="text-4xl font-black text-gray-900 mb-3 leading-tight" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
          Is Your Shopkeeper's
          <br />
          <span style={{ color: "#1e40af" }}>Scale Fair & Legal?</span>
        </h1>
        <p className="text-gray-500 text-lg max-w-xl mx-auto mb-8">
          Search any shop, fuel pump, or jeweller. Instantly see government-verified compliance status.
          File complaints anonymously. Your consumer rights, enforced.
        </p>

        {/* Search bar */}
        <div className="max-w-xl mx-auto flex gap-2">
          <div className="flex-1 flex items-center gap-2 bg-white rounded-xl border-2 border-gray-200 px-4 py-3 focus-within:border-blue-400 shadow-sm transition-all">
            <span className="text-gray-400">🔍</span>
            <input
              value={query}
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === "Enter" && handleSearch()}
              placeholder="Shop name, area, or instrument type…"
              className="flex-1 text-sm outline-none text-gray-800 placeholder-gray-400"
            />
          </div>
          <button onClick={handleSearch}
            className="px-5 py-3 bg-blue-700 text-white rounded-xl font-semibold text-sm hover:bg-blue-800 transition-all shadow-md">
            Search
          </button>
        </div>

        <div className="flex justify-center gap-3 mt-4 flex-wrap">
          {["Grocery stores near me", "Fuel stations Pune", "Jewellers Mumbai", "Vegetable markets Nagpur"].map(s => (
            <button key={s} onClick={() => { setQuery(s); setResults(searchShops(s)); setSearched(true); }}
              className="text-xs px-3 py-1.5 bg-white border border-gray-200 rounded-full text-gray-600 hover:bg-gray-50 hover:border-blue-300 transition-all shadow-sm">
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Search results */}
      {searched && (
        <div className="mb-10 fade-in">
          {results.length === 0 ? (
            <Card className="p-8 text-center text-gray-400 max-w-xl mx-auto">
              <div className="text-4xl mb-3">🔎</div>
              <div className="font-semibold text-gray-600 mb-1">No shops found</div>
              <div className="text-sm">Try a different name or area, or <button onClick={() => onSection("nearby")} className="text-blue-600 underline">use Nearby Search</button> with your location.</div>
            </Card>
          ) : (
            <div>
              <div className="text-sm text-gray-500 mb-3">{results.length} result{results.length !== 1 ? "s" : ""} for "<strong className="text-gray-800">{query}</strong>"</div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {results.map(s => <ShopCard key={s.id} shop={s} onSelect={() => onShopSelect(s.id)} />)}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Compliance tier legend */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
        {(["GREEN", "YELLOW", "RED"] as ComplianceTier[]).map(tier => {
          const m = tierMeta(tier);
          return (
            <Card key={tier} className={`p-5 border-2 ${m.borderClass}`}>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-2xl" style={{ background: m.hex + "20" }}>
                  {tier === "GREEN" ? "✅" : tier === "YELLOW" ? "⚠️" : "❌"}
                </div>
                <div>
                  <div className={`font-bold text-sm ${m.textClass}`}>{m.label}</div>
                  <div className="text-xs text-gray-500">{m.description}</div>
                </div>
              </div>
              <div className="text-xs text-gray-500 leading-relaxed">
                {tier === "GREEN" && "All instruments are registered and hold a valid, current verification certificate."}
                {tier === "YELLOW" && "One or more instruments have pending verification or a certificate expiring within 30 days."}
                {tier === "RED" && "At least one instrument is unregistered, has an expired certificate, or has failed/been suspended."}
              </div>
              <div className="mt-3 pt-3 border-t border-gray-100 text-right">
                <span className={`text-2xl font-black ${m.textClass}`}>
                  {tier === "GREEN" ? g.toLocaleString() : tier === "YELLOW" ? y.toLocaleString() : r.toLocaleString()}
                </span>
                <span className="text-xs text-gray-400 ml-1">/ {total.toLocaleString()} shops</span>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
        {[
          { label: "Find Nearby Shops", icon: "📍", section: "nearby", color: "bg-blue-600" },
          { label: "Verify Certificate", icon: "🔐", section: "verify", color: "bg-green-600" },
          { label: "File a Complaint", icon: "📣", section: "complaint", color: "bg-orange-600" },
          { label: "Transparency Data", icon: "📊", section: "dashboard", color: "bg-purple-600" },
        ].map(a => (
          <button key={a.label} onClick={() => onSection(a.section)}
            className={`flex flex-col items-center gap-2 p-4 ${a.color} text-white rounded-2xl font-semibold text-sm hover:opacity-90 transition-all shadow-md active:scale-95`}>
            <span className="text-2xl">{a.icon}</span>{a.label}
          </button>
        ))}
      </div>

      {/* Featured shops */}
      <div className="mb-4 flex items-center justify-between">
        <h2 className="font-bold text-gray-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>All Listed Shops</h2>
        <button onClick={() => onSection("nearby")} className="text-xs text-blue-600 hover:underline">Find near me →</button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {PUBLIC_SHOPS.map(s => {
          const sw: ShopWithDistance = { ...s, distanceKm: 0, tier: calcShopTier(s.instruments) };
          return <ShopCard key={s.id} shop={sw} onSelect={() => onShopSelect(s.id)} />;
        })}
      </div>
    </div>
  );
}

// ─── Section 2: Nearby Discovery ─────────────────────────

function NearbySection({ onShopSelect }: { onShopSelect: (id: string) => void }) {
  const [locStatus, setLocStatus] = useState<"idle" | "requesting" | "granted" | "denied" | "unavailable">("idle");
  const [geoPos, setGeoPos] = useState<GeoPosition | null>(null);
  const [radius, setRadius] = useState<1 | 2 | 5 | 10>(2);
  const [category, setCategory] = useState<Shop["category"] | "">("");
  const [tierFilter, setTierFilter] = useState<ComplianceTier[]>([]);
  const [results, setResults] = useState<ShopWithDistance[]>([]);
  const [searched, setSearched] = useState(false);
  const [selectedShopOnMap, setSelectedShopOnMap] = useState<string | null>(null);

  const requestLocation = useCallback(async () => {
    setLocStatus("requesting");
    const result = await getCurrentLocation();
    if (result.position) {
      setGeoPos(result.position);
      setLocStatus("granted");
    } else if (result.error === "denied") {
      setLocStatus("denied");
    } else {
      setLocStatus("unavailable");
    }
  }, []);

  useEffect(() => {
    if (!geoPos) return;
    const q: SpatialQuery = {
      lat: geoPos.lat,
      lng: geoPos.lng,
      radiusKm: radius,
      categories: category ? [category as Shop["category"]] : undefined,
      tierFilter: tierFilter.length ? tierFilter : undefined,
    };
    setResults(queryNearby(q));
    setSearched(true);
  }, [geoPos, radius, category, tierFilter]);

  const CATEGORIES: Shop["category"][] = ["Grocery", "Fuel Station", "Jewellery", "Pharmacy", "Supermarket", "Vegetable Market", "Dairy", "Hardware"];

  // Demo fallback: if location is denied/unavailable, show Pune-area data for demonstration
  const useDemoLocation = () => {
    setGeoPos({ lat: 18.5204, lng: 73.8567, accuracy: 0, timestamp: Date.now() });
    setLocStatus("granted");
  };

  return (
    <div className="fade-in">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Nearby Shop Discovery</h2>
        <p className="text-sm text-gray-500">Find compliant shops and verified instruments close to you. No account needed.</p>
      </div>

      {/* Location card */}
      <Card className="p-5 mb-5">
        {locStatus === "idle" && (
          <div className="text-center py-4">
            <div className="text-4xl mb-3">📍</div>
            <div className="font-semibold text-gray-800 mb-1">Find verified shops near you</div>
            <div className="text-sm text-gray-500 mb-4">Your location is used only for this search — it is never stored or shared with vendors.</div>
            <button onClick={requestLocation}
              className="px-6 py-3 bg-blue-700 text-white rounded-xl font-semibold text-sm hover:bg-blue-800 transition-all shadow-md">
              📍 Use My Location
            </button>
          </div>
        )}

        {locStatus === "requesting" && (
          <div className="text-center py-4 text-gray-500">
            <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            Detecting your location…
          </div>
        )}

        {(locStatus === "denied" || locStatus === "unavailable") && (
          <div className="space-y-3">
            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm text-amber-700">
              <div className="font-semibold mb-1">
                {locStatus === "denied" ? "⚠️ Location access is unavailable." : "⚠️ Location could not be detected."}
              </div>
              <div>You can <button onClick={requestLocation} className="underline font-medium">try again</button>, or use the demo data below.</div>
            </div>
            <button onClick={useDemoLocation}
              className="w-full px-4 py-2.5 border border-blue-200 bg-blue-50 text-blue-700 rounded-xl text-sm font-medium hover:bg-blue-100 transition-all">
              🗺️ View Demo — Pune Area Shops
            </button>
          </div>
        )}

        {locStatus === "granted" && geoPos && (
          <div>
            <div className="flex items-center gap-3 mb-4 text-sm">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 shrink-0">✓</div>
              <div>
                <div className="font-semibold text-gray-800">Location detected</div>
                <div className="text-xs text-gray-500 font-mono">
                  {geoPos.lat.toFixed(5)}°N, {geoPos.lng.toFixed(5)}°E
                  {geoPos.accuracy > 0 && <span className="ml-2 text-amber-600">{formatAccuracy(geoPos.accuracy)}{geoPos.accuracy > 200 && " · Your location may be approximate."}</span>}
                </div>
              </div>
              <button onClick={requestLocation} className="ml-auto text-xs text-blue-600 hover:underline shrink-0">↺ Update</button>
            </div>

            {/* Filters */}
            <div className="flex flex-wrap gap-3 items-center">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-600">Radius:</span>
                <div className="flex gap-1">
                  {([1, 2, 5, 10] as const).map(r => (
                    <button key={r} onClick={() => setRadius(r)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${radius === r ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"}`}>
                      {r} km
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-600">Type:</span>
                <select value={category} onChange={e => setCategory(e.target.value as any)}
                  className="text-xs px-2 py-1.5 border border-gray-200 rounded-lg outline-none focus:border-blue-400 text-gray-700">
                  <option value="">All types</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-gray-600">Status:</span>
                {(["GREEN", "YELLOW", "RED"] as ComplianceTier[]).map(t => {
                  const m = tierMeta(t);
                  const active = tierFilter.includes(t);
                  return (
                    <button key={t} onClick={() => setTierFilter(prev => active ? prev.filter(x => x !== t) : [...prev, t])}
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold border transition-all ${active ? `${m.bgClass} ${m.textClass} ${m.borderClass}` : "bg-gray-50 text-gray-500 border-gray-200"}`}>
                      {m.shortLabel}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Real Leaflet Map */}
      {locStatus === "granted" && geoPos && (
        <div className="mb-5 rounded-2xl overflow-hidden border border-gray-200 shadow-sm" style={{ height: 340 }}>
          <MapContainer
            center={[geoPos.lat, geoPos.lng]}
            zoom={14}
            style={{ height: "100%", width: "100%" }}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <MapFly lat={geoPos.lat} lng={geoPos.lng} />

            {/* User location marker */}
            <Marker position={[geoPos.lat, geoPos.lng]} icon={makeUserIcon()}>
              <Popup>
                <div className="text-center font-semibold text-blue-700">📍 You are here</div>
                {geoPos.accuracy > 0 && <div className="text-xs text-gray-500 text-center">{formatAccuracy(geoPos.accuracy)}</div>}
              </Popup>
            </Marker>

            {/* Radius circle */}
            <Circle
              center={[geoPos.lat, geoPos.lng]}
              radius={radius * 1000}
              pathOptions={{ color: "#3b82f6", fillColor: "#3b82f6", fillOpacity: 0.05, weight: 1.5, dashArray: "6 4" }}
            />

            {/* Shop markers */}
            {results.map(shop => {
              const meta = tierMeta(shop.tier);
              return (
                <Marker
                  key={shop.id}
                  position={[shop.lat, shop.lng]}
                  icon={makeShopIcon(meta.hex)}
                  eventHandlers={{ click: () => setSelectedShopOnMap(shop.id) }}
                >
                  <Popup>
                    <div style={{ minWidth: 180 }}>
                      <div className="font-bold text-gray-800 text-sm mb-1">{shop.name}</div>
                      <div className="text-xs text-gray-500 mb-2">{shop.address}</div>
                      <div className="flex items-center gap-1.5 mb-1">
                        <span className="w-2 h-2 rounded-full" style={{ background: meta.hex }} />
                        <span className="text-xs font-semibold" style={{ color: meta.hex }}>{meta.label}</span>
                      </div>
                      <div className="text-xs text-gray-500 mb-2">{shop.distanceKm < 1 ? `${Math.round(shop.distanceKm * 1000)} m away` : `${shop.distanceKm.toFixed(1)} km away`}</div>
                      <button
                        onClick={() => onShopSelect(shop.id)}
                        style={{ background: "#1e40af", color: "white", border: "none", borderRadius: 8, padding: "4px 12px", fontSize: 11, cursor: "pointer", width: "100%" }}>
                        View Shop →
                      </button>
                    </div>
                  </Popup>
                </Marker>
              );
            })}
          </MapContainer>
        </div>
      )}

      {/* Map legend */}
      {locStatus === "granted" && (
        <div className="flex items-center gap-4 mb-5 px-1 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs text-blue-600">
            <div className="w-3 h-3 rounded-full bg-blue-500 border-2 border-white shadow" />
            <span>You</span>
          </div>
          {(["GREEN", "YELLOW", "RED"] as ComplianceTier[]).map(t => {
            const m = tierMeta(t);
            return <span key={t} className="flex items-center gap-1.5 text-xs text-gray-600"><span className="w-3 h-3 rounded-full" style={{ background: m.hex }} />{m.label}</span>;
          })}
        </div>
      )}

      {/* Results list */}
      {searched && (
        <div className="fade-in">
          {results.length === 0 ? (
            <Card className="p-8 text-center text-gray-400">
              <div className="text-3xl mb-2">🔍</div>
              <div className="font-semibold text-gray-600">No registered DataDrift vendors found within {radius} km</div>
              <div className="text-sm mt-1">Try increasing the search radius or removing filters. Only businesses registered with DataDrift are shown.</div>
            </Card>
          ) : (
            <div>
              <div className="text-sm text-gray-500 mb-3">
                <strong className="text-gray-800">{results.length} DataDrift-registered shop{results.length !== 1 ? "s" : ""}</strong> within {radius} km · sorted by distance
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {results.map(s => <ShopCard key={s.id} shop={s} onSelect={() => onShopSelect(s.id)} />)}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ─── Section 3: Shop Detail ───────────────────────────────

function ShopDetailSection({ shopId, onComplaint, onSection }: { shopId: string; onComplaint: (shopId: string) => void; onSection: (s: string) => void }) {
  const shop = getShopById(shopId);
  const [activeTab, setActiveTab] = useState<"instruments" | "reviews" | "complaints">("instruments");
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewRating, setReviewRating] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewSubmitted, setReviewSubmitted] = useState(false);

  if (!shop) return <Card className="p-10 text-center text-gray-400">Shop not found.</Card>;

  const m = tierMeta(shop.tier);
  const rating = avgRating(shop);

  const ratingDist = [5, 4, 3, 2, 1].map(n => ({
    n,
    count: shop.reviews.filter(r => r.rating === n).length,
    pct: shop.reviews.length ? (shop.reviews.filter(r => r.rating === n).length / shop.reviews.length) * 100 : 0,
  }));

  return (
    <div className="fade-in">
      {/* Header card */}
      <Card className={`p-6 mb-5 border-2 ${m.borderClass}`}>
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl shrink-0" style={{ background: m.hex + "20" }}>
              {shop.category === "Grocery" ? "🛒" : shop.category === "Fuel Station" ? "⛽" : shop.category === "Jewellery" ? "💍" : shop.category === "Pharmacy" ? "💊" : shop.category === "Supermarket" ? "🏪" : shop.category === "Vegetable Market" ? "🥦" : "🔧"}
            </div>
            <div>
              <div className="font-black text-xl text-gray-900" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>{shop.name}</div>
              <div className="text-sm text-gray-500 mt-0.5">{shop.address}</div>
              <div className="flex items-center gap-3 mt-2 flex-wrap">
                <span className="text-xs text-gray-400 bg-gray-100 px-2 py-0.5 rounded-full">{shop.category}</span>
                <span className="text-xs text-gray-400">{shop.district}</span>
                {rating > 0 && (
                  <span className="flex items-center gap-1"><StarRating rating={rating} size={12} /><span className="text-xs text-gray-500">{rating.toFixed(1)} ({shop.reviews.length})</span></span>
                )}
              </div>
            </div>
          </div>
          <div className="text-right">
            <TierBadge tier={shop.tier} size="lg" />
            <div className={`text-xs mt-1 ${m.textClass}`}>{m.description}</div>
          </div>
        </div>

        {/* Compliance bar */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="flex items-center gap-3">
            <div className="text-xs font-medium text-gray-600">Compliance:</div>
            <div className="flex gap-2 flex-wrap">
              {shop.instruments.map(inst => {
                const im = INSTRUMENT_STATUS_META[inst.status];
                return (
                  <div key={inst.id} className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium ${im.bg} ${im.color}`}>
                    {im.icon} {inst.type.split(" ")[0]}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </Card>

      {/* Action buttons */}
      <div className="flex gap-2 mb-5 flex-wrap">
        <button onClick={() => onComplaint(shop.id)}
          className="flex items-center gap-2 px-4 py-2.5 bg-orange-600 text-white rounded-xl text-sm font-semibold hover:bg-orange-700 transition-all shadow-md">
          📣 Report an Issue
        </button>
        <button onClick={() => onSection("verify")}
          className="flex items-center gap-2 px-4 py-2.5 bg-green-600 text-white rounded-xl text-sm font-semibold hover:bg-green-700 transition-all shadow-md">
          🔐 Verify Certificate
        </button>
        <button onClick={() => setShowReviewForm(!showReviewForm)}
          className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all shadow-md">
          ⭐ Leave a Review
        </button>
      </div>

      {/* Review form */}
      {showReviewForm && !reviewSubmitted && (
        <Card className="p-5 mb-5 border-2 border-blue-200 bg-blue-50/30 fade-in">
          <h3 className="font-bold text-gray-800 mb-3">Your Review</h3>
          <div className="flex gap-2 mb-3">
            {[1, 2, 3, 4, 5].map(n => (
              <button key={n} onClick={() => setReviewRating(n)}
                className={`text-2xl transition-transform hover:scale-110 ${n <= reviewRating ? "opacity-100" : "opacity-30"}`}>★</button>
            ))}
          </div>
          <textarea value={reviewText} onChange={e => setReviewText(e.target.value)} rows={3}
            className="w-full px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 mb-3"
            placeholder="Share your experience — accurate weight? Certificate visible? Staff cooperative?" />
          <div className="flex gap-2">
            <button onClick={() => setReviewSubmitted(true)} disabled={reviewRating === 0 || !reviewText.trim()}
              className="px-5 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 disabled:opacity-40 disabled:cursor-not-allowed transition-all">
              Submit Review
            </button>
            <button onClick={() => setShowReviewForm(false)} className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50">Cancel</button>
          </div>
        </Card>
      )}
      {reviewSubmitted && (
        <Card className="p-4 mb-5 bg-green-50 border-green-200 border-2 fade-in">
          <div className="flex items-center gap-2 text-green-800 font-semibold text-sm">✅ Review submitted — thank you for helping other consumers!</div>
        </Card>
      )}

      {/* Tabs */}
      <div className="flex gap-1 bg-white rounded-xl border border-gray-200 p-1 mb-4 overflow-x-auto">
        {([["instruments", "⚖️ Instruments"], ["reviews", "⭐ Reviews"], ["complaints", "📣 Complaints"]] as const).map(([key, label]) => (
          <button key={key} onClick={() => setActiveTab(key)}
            className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === key ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}>
            {label}
          </button>
        ))}
      </div>

      {/* Instruments tab */}
      {activeTab === "instruments" && (
        <div className="space-y-3 fade-in">
          {shop.instruments.map(inst => {
            const im = INSTRUMENT_STATUS_META[inst.status];
            const instM = tierMeta(calcShopTier([inst]));
            return (
              <Card key={inst.id} className={`p-4 border-l-4`} style={{ borderLeftColor: instM.hex }}>
                <div className="flex items-start justify-between gap-3 flex-wrap mb-2">
                  <div>
                    <div className="font-bold text-gray-900 text-sm">{inst.type}</div>
                    <div className="font-mono text-xs text-blue-700 mt-0.5">{inst.id}</div>
                  </div>
                  <span className={`inline-flex items-center gap-1.5 text-xs px-2.5 py-0.5 rounded-full font-semibold ${im.bg} ${im.color}`}>
                    {im.icon} {im.label}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-gray-50 p-2 rounded border border-gray-100"><div className="text-gray-400">Serial No.</div><div className="font-medium text-gray-700 font-mono">{inst.serial}</div></div>
                  <div className="bg-gray-50 p-2 rounded border border-gray-100"><div className="text-gray-400">Capacity</div><div className="font-medium text-gray-700">{inst.capacity}</div></div>
                  <div className="bg-gray-50 p-2 rounded border border-gray-100"><div className="text-gray-400">Certificate</div><div className="font-medium text-gray-700 font-mono">{inst.certId ?? "—"}</div></div>
                  <div className="bg-gray-50 p-2 rounded border border-gray-100"><div className="text-gray-400">Valid Until</div><div className={`font-medium ${inst.certValidUntil ? "text-gray-700" : "text-red-500"}`}>{inst.certValidUntil ?? "Not issued"}</div></div>
                </div>
                {inst.certId && (
                  <button onClick={() => onSection("verify")} className="mt-2 text-xs text-blue-600 hover:underline font-medium">🔐 Verify this certificate →</button>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {/* Reviews tab */}
      {activeTab === "reviews" && (
        <div className="fade-in">
          {shop.reviews.length === 0 ? (
            <Card className="p-8 text-center text-gray-400">No reviews yet. Be the first!</Card>
          ) : (
            <div>
              {/* Rating summary */}
              <Card className="p-4 mb-4">
                <div className="flex items-center gap-6">
                  <div className="text-center">
                    <div className="text-5xl font-black text-gray-900">{rating.toFixed(1)}</div>
                    <StarRating rating={rating} size={16} />
                    <div className="text-xs text-gray-400 mt-1">{shop.reviews.length} reviews</div>
                  </div>
                  <div className="flex-1 space-y-1">
                    {ratingDist.map(r => (
                      <div key={r.n} className="flex items-center gap-2 text-xs">
                        <span className="text-gray-500 w-3">{r.n}</span>
                        <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                          <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${r.pct}%` }} />
                        </div>
                        <span className="text-gray-400 w-5">{r.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </Card>
              <div className="space-y-3">
                {shop.reviews.map(rev => (
                  <Card key={rev.id} className="p-4">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 text-xs font-bold">{rev.author.charAt(0)}</div>
                        <div>
                          <div className="text-sm font-semibold text-gray-800">{rev.author}</div>
                          <div className="flex items-center gap-2"><StarRating rating={rev.rating} size={12} />{rev.verified && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">✓ QR Verified</span>}</div>
                        </div>
                      </div>
                      <div className="text-xs text-gray-400">{rev.date}</div>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">{rev.comment}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
                      <button className="hover:text-blue-600 transition-colors">👍 Helpful ({rev.helpful})</button>
                      <span className="capitalize">{rev.category}</span>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Complaints tab */}
      {activeTab === "complaints" && (
        <div className="fade-in">
          {shop.complaints.length === 0 ? (
            <Card className="p-8 text-center text-gray-400">No complaints filed against this shop.</Card>
          ) : (
            <div className="space-y-3">
              {shop.complaints.map(c => (
                <Card key={c.id} className="p-4">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-mono text-xs text-blue-700">{c.id}</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${c.status === "Resolved" ? "bg-green-100 text-green-800" : c.status === "Assigned" ? "bg-indigo-100 text-indigo-800" : "bg-yellow-100 text-yellow-800"}`}>{c.status}</span>
                  </div>
                  <div className="text-sm font-semibold text-gray-800">{c.category}</div>
                  <p className="text-xs text-gray-500 mt-1">{c.description}</p>
                  <div className="text-[10px] text-gray-400 mt-1">{c.date} · {c.anonymous ? "Anonymous" : "Named"}</div>
                </Card>
              ))}
            </div>
          )}
          <button onClick={() => onComplaint(shop.id)}
            className="mt-4 w-full py-3 border-2 border-dashed border-orange-300 text-orange-600 rounded-xl text-sm font-medium hover:bg-orange-50 transition-all">
            + File a New Complaint
          </button>
        </div>
      )}
    </div>
  );
}

// ─── Section 4: Complaint Filing ─────────────────────────

function ComplaintSection({ prefilledShopId, onTrack }: { prefilledShopId?: string; onTrack: () => void }) {
  const [form, setForm] = useState({
    shopId: prefilledShopId ?? "",
    category: "",
    description: "",
    shopName: "",
    location: "",
    date: new Date().toISOString().split("T")[0],
    anonymous: true,
    name: "",
    phone: "",
    evidence: false,
  });
  const [submitted, setSubmitted] = useState(false);
  const [complaintId, setComplaintId] = useState("");

  const shop = form.shopId ? PUBLIC_SHOPS.find(s => s.id === form.shopId) : null;

  const handleSubmit = () => {
    setComplaintId(generateComplaintId());
    setSubmitted(true);
  };

  if (submitted) return (
    <div className="fade-in">
      <Card className="p-10 text-center max-w-lg mx-auto">
        <div className="text-5xl mb-4">✅</div>
        <h2 className="text-2xl font-bold text-gray-900 mb-2">Complaint Submitted</h2>
        <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 my-4">
          <div className="text-xs text-gray-500 mb-1">Your Complaint ID</div>
          <div className="text-xl font-black text-blue-700 font-mono">{complaintId}</div>
        </div>
        <p className="text-gray-500 text-sm mb-4">An officer will be assigned within 48 hours. Track your complaint below — no login required.</p>
        <div className="flex gap-3 justify-center">
          <button onClick={onTrack} className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-medium hover:bg-blue-700 transition-all">Track Complaint →</button>
          <button onClick={() => setSubmitted(false)} className="px-5 py-2.5 border border-gray-200 rounded-xl text-sm text-gray-600 hover:bg-gray-50 transition-all">File Another</button>
        </div>
      </Card>
    </div>
  );

  return (
    <div className="fade-in">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>File a Complaint</h2>
        <p className="text-sm text-gray-500">Report inaccurate scales, expired certificates, or tampered instruments. You can file anonymously — your identity is protected.</p>
      </div>

      <Card className="p-6 max-w-2xl">
        <div className="space-y-4">
          {/* Shop picker */}
          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Shop / Establishment *</label>
            <select value={form.shopId} onChange={e => setForm({ ...form, shopId: e.target.value })}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400">
              <option value="">Select a listed shop or enter manually below</option>
              {PUBLIC_SHOPS.map(s => <option key={s.id} value={s.id}>{s.name} — {s.area}, {s.district}</option>)}
            </select>
            {!form.shopId && (
              <input value={form.shopName} onChange={e => setForm({ ...form, shopName: e.target.value })}
                placeholder="Or type shop name if not listed"
                className="mt-2 w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400" />
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Complaint Category *</label>
              <select value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 text-gray-700">
                <option value="">Select category</option>
                {["Inaccurate Weighing", "Expired Certificate", "Tampered Seal", "Missing Certificate", "Unregistered Instrument", "Incorrect Price by Volume (Fuel)", "Refused to Show Certificate", "Other"].map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Date of Incident *</label>
              <input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })}
                className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Location (Area / Address)</label>
            <input value={form.location} onChange={e => setForm({ ...form, location: e.target.value })}
              placeholder={shop ? shop.address : "Enter location if different from above"}
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Description *</label>
            <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={4}
              placeholder="Describe what happened. E.g. 'Paid for 1 kg but scale showed 1.15 kg. Certificate sticker was peeling off and showed 2024 date.'"
              className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400 leading-relaxed" />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-700 mb-1">Evidence (optional)</label>
            <div className="border-2 border-dashed border-gray-200 rounded-xl p-4 text-center hover:border-blue-300 transition-colors cursor-pointer" onClick={() => setForm({ ...form, evidence: true })}>
              {form.evidence ? (
                <div className="text-green-600 text-sm font-medium">✅ File attached</div>
              ) : (
                <div className="text-gray-400 text-sm">📷 Tap to upload photo or document<br /><span className="text-xs">JPG, PNG, PDF — max 10 MB</span></div>
              )}
            </div>
          </div>

          {/* Anonymous toggle */}
          <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
            <label className="flex items-center gap-3 cursor-pointer">
              <div className="relative">
                <input type="checkbox" checked={form.anonymous} onChange={e => setForm({ ...form, anonymous: e.target.checked })} className="sr-only peer" />
                <div className="w-10 h-5 bg-gray-200 rounded-full peer peer-checked:bg-blue-600 transition-colors" />
                <div className="absolute left-0.5 top-0.5 w-4 h-4 bg-white rounded-full transition-transform peer-checked:translate-x-5 shadow" />
              </div>
              <div>
                <div className="text-sm font-semibold text-gray-800">Submit Anonymously</div>
                <div className="text-xs text-gray-500">Your identity will not be shared publicly or with the shopkeeper.</div>
              </div>
            </label>
          </div>

          {!form.anonymous && (
            <div className="grid grid-cols-2 gap-4 fade-in">
              <div><label className="block text-xs font-semibold text-gray-700 mb-1">Your Name</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400" /></div>
              <div><label className="block text-xs font-semibold text-gray-700 mb-1">Phone (for updates)</label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} placeholder="+91 XXXXX XXXXX" className="w-full px-3 py-2.5 border border-gray-200 rounded-xl text-sm outline-none focus:border-blue-400" /></div>
            </div>
          )}

          <button onClick={handleSubmit}
            disabled={!form.category || !form.description.trim() || (!form.shopId && !form.shopName.trim())}
            className="w-full py-3.5 bg-orange-600 text-white rounded-xl font-bold text-sm hover:bg-orange-700 transition-all shadow-md disabled:opacity-40 disabled:cursor-not-allowed">
            Submit Complaint
          </button>
        </div>
      </Card>
    </div>
  );
}

// ─── Section 5: Track Complaint ───────────────────────────

function TrackSection() {
  const [cid, setCid] = useState("");
  const [result, setResult] = useState<null | "found" | "notfound">(null);

  const ALL_COMPLAINTS = PUBLIC_SHOPS.flatMap(s => s.complaints);

  const found = ALL_COMPLAINTS.find(c => c.id.toLowerCase() === cid.toLowerCase().trim());

  const TRACK_STATUSES = ["Submitted", "Under Review", "Assigned", "Resolved"];

  return (
    <div className="fade-in">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Track Your Complaint</h2>
        <p className="text-sm text-gray-500">Enter your Complaint ID to view the current investigation status. No login required.</p>
      </div>
      <Card className="p-6 max-w-lg">
        <div className="flex gap-3 mb-4">
          <input value={cid} onChange={e => { setCid(e.target.value); setResult(null); }} onKeyDown={e => e.key === "Enter" && setResult(found ? "found" : "notfound")}
            placeholder="e.g. LM-CMP-2026-00120"
            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm font-mono outline-none focus:border-blue-400" />
          <button onClick={() => setResult(found ? "found" : "notfound")}
            className="px-5 py-3 bg-blue-700 text-white rounded-xl font-semibold text-sm hover:bg-blue-800 transition-all">Track</button>
        </div>

        <div className="text-xs text-gray-400 mb-4">Demo IDs: {ALL_COMPLAINTS.map(c => c.id).join(", ")}</div>

        {result === "notfound" && (
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm text-gray-500 text-center fade-in">
            No complaint found with ID <strong className="font-mono">{cid}</strong>
          </div>
        )}

        {result === "found" && found && (
          <div className="fade-in">
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
              <div className="font-mono text-sm font-bold text-blue-700 mb-1">{found.id}</div>
              <div className="font-semibold text-gray-800">{found.category}</div>
              <div className="text-sm text-gray-500 mt-0.5">{found.description}</div>
              <div className="text-xs text-gray-400 mt-1">Filed: {found.date} · {found.anonymous ? "Anonymous" : "Named"}</div>
            </div>
            {/* Progress stepper */}
            <div className="flex items-center gap-1 mb-4 overflow-x-auto">
              {TRACK_STATUSES.map((s, i) => {
                const active = TRACK_STATUSES.indexOf(found.status) >= i;
                const current = found.status === s;
                return (
                  <div key={s} className="flex items-center gap-1 shrink-0">
                    <div className={`flex flex-col items-center`}>
                      <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold border-2 transition-all ${active ? "bg-blue-600 border-blue-600 text-white" : "bg-gray-100 border-gray-200 text-gray-400"} ${current ? "ring-2 ring-blue-200 ring-offset-1" : ""}`}>
                        {active ? "✓" : i + 1}
                      </div>
                      <div className={`text-[10px] mt-1 text-center whitespace-nowrap ${current ? "font-bold text-blue-700" : "text-gray-400"}`}>{s}</div>
                    </div>
                    {i < TRACK_STATUSES.length - 1 && <div className={`h-0.5 w-8 mt-[-14px] ${active && TRACK_STATUSES.indexOf(found.status) > i ? "bg-blue-500" : "bg-gray-200"}`} />}
                  </div>
                );
              })}
            </div>
            <div className={`p-3 rounded-xl text-sm font-medium ${found.status === "Resolved" ? "bg-green-50 text-green-800 border border-green-200" : "bg-blue-50 text-blue-800 border border-blue-200"}`}>
              Current Status: <strong>{found.status}</strong>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

// ─── Section 6: Certificate Verify ───────────────────────

function VerifySection() {
  const [certId, setCertId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<"idle" | "valid" | "expired" | "invalid">("idle");
  const [certData, setCertData] = useState<typeof CERTIFICATES[0] | null>(null);

  const verify = () => {
    if (!certId.trim()) return;
    setLoading(true);
    setTimeout(() => {
      const found = CERTIFICATES.find(c => c.id.toLowerCase() === certId.toLowerCase().trim());
      if (!found) { setResult("invalid"); setCertData(null); }
      else if (found.status === "Expired") { setResult("expired"); setCertData(found); }
      else { setResult("valid"); setCertData(found); }
      setLoading(false);
    }, 700);
  };

  const RESULT = {
    valid: { bg: "bg-green-600", text: "✅ VALID", sub: "This certificate is authentic and current.", badge: "text-green-700" },
    expired: { bg: "bg-red-600", text: "❌ EXPIRED", sub: "Certificate has expired. Ask the business for renewed certificate.", badge: "text-red-700" },
    invalid: { bg: "bg-gray-700", text: "⚠️ NOT FOUND", sub: "No certificate matches this ID. It may be forged or incorrectly entered.", badge: "text-gray-700" },
  };

  return (
    <div className="fade-in">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Verify Certificate</h2>
        <p className="text-sm text-gray-500">Scan the QR sticker on any instrument or enter the Certificate ID to confirm authenticity.</p>
      </div>
      <Card className="p-6 max-w-lg">
        <div className="flex gap-3 mb-3">
          <input value={certId} onChange={e => { setCertId(e.target.value); setResult("idle"); }} onKeyDown={e => e.key === "Enter" && verify()}
            placeholder="e.g. CERT-MH-PUN-2024-0123"
            className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-sm font-mono outline-none focus:border-blue-400" />
          <button onClick={verify} disabled={loading || !certId.trim()}
            className="px-5 py-3 bg-green-700 text-white rounded-xl font-semibold text-sm hover:bg-green-800 transition-all disabled:opacity-50">
            {loading ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block" /> : "Verify"}
          </button>
        </div>
        <button className="flex items-center gap-2 text-sm text-blue-600 hover:underline mb-3">📷 Scan QR Code instead</button>
        <div className="text-xs text-gray-400 mb-4">
          Demo IDs: {CERTIFICATES.map(c => <button key={c.id} onClick={() => { setCertId(c.id); setResult("idle"); }} className="font-mono hover:text-blue-600 underline mr-2">{c.id}</button>)}
        </div>

        {result !== "idle" && (
          <div className="fade-in rounded-2xl overflow-hidden border border-gray-200">
            <div className={`${RESULT[result].bg} p-5 text-white text-center`}>
              <div className="text-3xl font-black mb-1">{RESULT[result].text}</div>
              <p className="text-white/80 text-sm">{RESULT[result].sub}</p>
            </div>
            {certData && (
              <div className="p-4 bg-white">
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {[["Certificate ID", certData.id], ["Instrument ID", certData.instrumentId], ["Type", certData.instrumentType], ["Verified On", certData.verificationDate], ["Valid Until", certData.validUntil], ["Status", certData.status]].map(([k, v]) => (
                    <div key={k} className="bg-gray-50 p-2 rounded border border-gray-100"><div className="text-gray-400">{k}</div><div className="font-semibold text-gray-800 mt-0.5 break-all">{v}</div></div>
                  ))}
                </div>
                <div className="mt-3 p-2 bg-amber-50 border border-amber-100 rounded-lg text-xs text-amber-700">ℹ️ Business details are not shown publicly to protect privacy.</div>
              </div>
            )}
          </div>
        )}
      </Card>
    </div>
  );
}

// ─── Section 7: Education & Rights ───────────────────────

function EducationSection() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const RIGHTS = [
    { icon: "⚖️", right: "Right to Accurate Measurement", desc: "Every weighing instrument used in trade must be registered and verified under the Legal Metrology Act. You have the right to receive exactly what you pay for." },
    { icon: "📜", right: "Right to See the Certificate", desc: "Every certified instrument must display a valid verification certificate or QR sticker. You may ask the shopkeeper to show it at any time." },
    { icon: "📣", right: "Right to Complain Without Fear", desc: "You can file a complaint anonymously. Shopkeepers are prohibited from retaliating against consumers for filing Legal Metrology complaints." },
    { icon: "🔍", right: "Right to Verify a Certificate", desc: "Any QR code on a verified instrument can be scanned by any member of the public to confirm validity — no account needed." },
    { icon: "📞", right: "Right to Escalate", desc: "If a complaint is not resolved, you may escalate to the state Director of Legal Metrology or the National Consumer Helpline at 1800-11-4000." },
  ];

  const HOW_TO = [
    { step: 1, title: "Check the sticker", desc: "Look for a round verification seal/sticker on the instrument. It should show the year of verification and a serial number." },
    { step: 2, title: "Scan the QR code", desc: "Newer instruments have a QR sticker. Scan it with your phone camera. If there is no QR, enter the Certificate ID on this portal." },
    { step: 3, title: "Check the compliance badge", desc: "Search the shop on this portal. A green badge means all instruments are verified. Yellow or red requires attention." },
    { step: 4, title: "If you suspect tampering", desc: "Don't confront the shopkeeper. File a complaint on this portal — include a photo if possible. An officer will investigate." },
    { step: 5, title: "Track your complaint", desc: "Use your Complaint ID on the Track tab. No login required. Updates may also arrive via SMS if you shared a phone number." },
  ];

  return (
    <div className="fade-in">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Consumer Education & Rights</h2>
        <p className="text-sm text-gray-500">Understanding your rights and how to protect yourself from measurement fraud.</p>
      </div>

      {/* Your Rights */}
      <h3 className="font-bold text-gray-800 mb-3">Your Legal Rights as a Consumer</h3>
      <div className="space-y-3 mb-8">
        {RIGHTS.map((r, i) => (
          <Card key={i} className="p-4 flex gap-4">
            <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-200 flex items-center justify-center text-xl shrink-0">{r.icon}</div>
            <div>
              <div className="font-semibold text-gray-900 text-sm">{r.right}</div>
              <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">{r.desc}</div>
            </div>
          </Card>
        ))}
      </div>

      {/* How to check */}
      <h3 className="font-bold text-gray-800 mb-3">How to Check if a Scale is Legal</h3>
      <div className="space-y-3 mb-8">
        {HOW_TO.map(s => (
          <div key={s.step} className="flex gap-4">
            <div className="w-8 h-8 rounded-full bg-blue-700 text-white flex items-center justify-center text-sm font-bold shrink-0 mt-0.5">{s.step}</div>
            <Card className="flex-1 p-4">
              <div className="font-semibold text-gray-900 text-sm">{s.title}</div>
              <div className="text-xs text-gray-500 mt-0.5 leading-relaxed">{s.desc}</div>
            </Card>
          </div>
        ))}
      </div>

      {/* FAQ */}
      <h3 className="font-bold text-gray-800 mb-3">Frequently Asked Questions</h3>
      <div className="space-y-2">
        {PUBLIC_FAQS.map((faq, i) => (
          <Card key={i} className="overflow-hidden">
            <button onClick={() => setOpenFaq(openFaq === i ? null : i)}
              className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-gray-50 transition-colors">
              <span className="font-medium text-gray-800 text-sm pr-4">{faq.q}</span>
              <span className={`text-gray-400 text-sm shrink-0 transition-transform ${openFaq === i ? "rotate-180" : ""}`}>▼</span>
            </button>
            {openFaq === i && (
              <div className="px-5 pb-4 text-sm text-gray-600 leading-relaxed border-t border-gray-100 fade-in">{faq.a}</div>
            )}
          </Card>
        ))}
      </div>

      {/* Helpline */}
      <Card className="mt-6 p-5 bg-blue-50 border-2 border-blue-200">
        <div className="flex items-start gap-4">
          <div className="text-3xl">📞</div>
          <div>
            <div className="font-bold text-blue-900">Helpline Numbers</div>
            <div className="text-sm text-blue-700 mt-1 space-y-1">
              <div>National Consumer Helpline: <strong>1800-11-4000</strong> (toll-free)</div>
              <div>Maharashtra Legal Metrology: <strong>1800-22-9999</strong> (demo placeholder)</div>
              <div>Email: <strong>consumer@lm.maharashtra.gov.in</strong> (demo)</div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}

// ─── Section 8: Transparency Dashboard ───────────────────

function DashboardSection() {
  const stats = TRANSPARENCY_STATS;
  const totalShops = stats.greenShops + stats.yellowShops + stats.redShops;

  const PIE_DATA = [
    { name: "Compliant", value: stats.greenShops, color: "#16a34a" },
    { name: "Attention", value: stats.yellowShops, color: "#d97706" },
    { name: "Non-Compliant", value: stats.redShops, color: "#dc2626" },
  ];

  const INST_PIE = [
    { name: "Verified", value: stats.verifiedInstruments, color: "#16a34a" },
    { name: "Pending", value: stats.pendingInstruments, color: "#d97706" },
    { name: "Expired", value: stats.expiredInstruments, color: "#dc2626" },
  ];

  return (
    <div className="fade-in">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900 mb-1" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Public Transparency Dashboard</h2>
        <p className="text-sm text-gray-500">Maharashtra-wide Legal Metrology compliance statistics. Updated daily.</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Total Shops", val: stats.totalShops.toLocaleString(), icon: "🏪", color: "text-blue-700", border: "border-blue-200" },
          { label: "Compliant Shops", val: stats.greenShops.toLocaleString(), icon: "✅", color: "text-green-700", border: "border-green-200" },
          { label: "Complaints Filed", val: stats.complaintsFiled.toLocaleString(), icon: "📣", color: "text-orange-600", border: "border-orange-200" },
          { label: "Avg Resolution", val: `${stats.avgResolutionDays} days`, icon: "⏱️", color: "text-purple-700", border: "border-purple-200" },
        ].map(k => (
          <Card key={k.label} className={`p-4 border-l-4 ${k.border}`}>
            <div className="flex items-center justify-between mb-1"><span className="text-xl">{k.icon}</span><span className={`text-2xl font-black ${k.color}`}>{k.val}</span></div>
            <div className="text-xs text-gray-500 font-medium">{k.label}</div>
          </Card>
        ))}
      </div>

      {/* Compliance % banner */}
      <Card className="p-5 mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-semibold text-gray-700">Maharashtra Compliance Rate</span>
          <span className="text-2xl font-black text-green-700">{((stats.greenShops / totalShops) * 100).toFixed(1)}%</span>
        </div>
        <div className="h-4 bg-gray-100 rounded-full overflow-hidden flex">
          <div className="h-full bg-green-500 transition-all" style={{ width: `${(stats.greenShops / totalShops) * 100}%` }} />
          <div className="h-full bg-amber-400 transition-all" style={{ width: `${(stats.yellowShops / totalShops) * 100}%` }} />
          <div className="h-full bg-red-500 transition-all" style={{ width: `${(stats.redShops / totalShops) * 100}%` }} />
        </div>
        <div className="flex gap-4 mt-2 text-xs text-gray-500">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" />Compliant: {stats.greenShops.toLocaleString()}</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-400" />Attention: {stats.yellowShops.toLocaleString()}</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-red-500" />Non-Compliant: {stats.redShops.toLocaleString()}</span>
        </div>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        <Card className="p-5">
          <h3 className="font-bold text-gray-800 mb-4 text-sm">Shop Compliance Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={PIE_DATA} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {PIE_DATA.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-5">
          <h3 className="font-bold text-gray-800 mb-4 text-sm">Instrument Verification Status</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={INST_PIE} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={75} label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`} labelLine={false}>
                {INST_PIE.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* District-wise bar */}
      <Card className="p-5 mb-6">
        <h3 className="font-bold text-gray-800 mb-4 text-sm">District-wise Compliance</h3>
        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={stats.districtStats} margin={{ left: -10 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
            <XAxis dataKey="district" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
            <Legend wrapperStyle={{ fontSize: 11 }} />
            <Bar dataKey="green" name="Compliant" fill="#16a34a" stackId="a" radius={[0, 0, 0, 0]} />
            <Bar dataKey="yellow" name="Attention" fill="#d97706" stackId="a" />
            <Bar dataKey="red" name="Non-Compliant" fill="#dc2626" stackId="a" radius={[3, 3, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* District table */}
      <Card className="p-5">
        <h3 className="font-bold text-gray-800 mb-4 text-sm">District Summary</h3>
        <table className="w-full text-sm">
          <thead><tr className="text-left text-xs text-gray-400 border-b border-gray-100">
            <th className="pb-2 pr-4">District</th><th className="pb-2 pr-4">Shops</th><th className="pb-2 pr-4">✅ Compliant</th><th className="pb-2 pr-4">⚠️ Attention</th><th className="pb-2 pr-4">❌ Non-Compliant</th><th className="pb-2">Rate</th>
          </tr></thead>
          <tbody className="divide-y divide-gray-50">
            {stats.districtStats.map(d => (
              <tr key={d.district} className="hover:bg-gray-50">
                <td className="py-2.5 pr-4 font-semibold text-gray-800">{d.district}</td>
                <td className="py-2.5 pr-4 text-gray-600">{d.shops}</td>
                <td className="py-2.5 pr-4 text-green-700 font-medium">{d.green}</td>
                <td className="py-2.5 pr-4 text-amber-600">{d.yellow}</td>
                <td className="py-2.5 pr-4 text-red-600">{d.red}</td>
                <td className="py-2.5">
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-gray-100 rounded-full h-1.5 overflow-hidden"><div className="h-full bg-green-500 rounded-full" style={{ width: `${(d.green / d.shops) * 100}%` }} /></div>
                    <span className="text-xs font-bold text-green-700">{((d.green / d.shops) * 100).toFixed(0)}%</span>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

// ─── Consumer AI Assistant + Voice ────────────────────────

const CONSUMER_SUGGESTED = [
  "How do I verify a weighing machine?",
  "Where can I find verified shops near me?",
  "How do I submit a complaint?",
  "What does Trust Score mean?",
  "Is this certificate valid?",
  "How do I track my complaint?",
];

const CONSUMER_RESPONSES: Record<string, string> = {
  "verify": "To verify a weighing machine or instrument: scan the **QR code** on the instrument using any camera app, or enter the **Certificate ID** in the Verify tab above. You will see the instrument's current verification status, expiry, and the issuing officer's details.",
  "complaint": "To file a complaint: go to the **Complaint** tab and describe the issue. You do not need to log in — complaints can be submitted anonymously. You will receive a **Complaint ID** to track the resolution.",
  "track": "To track your complaint: go to the **Track** tab and enter your Complaint ID (format: LM-CMP-2026-XXXXX). You can see the current status, assigned officer, and any updates.",
  "trust score": "The **Trust Score** (0–100) is calculated from verified compliance history, customer ratings from verified transactions, and complaint records. It is NOT based only on star ratings — an Anti-Gaming Engine prevents manipulation. A score of 90+ means a highly trusted vendor.",
  "anti-gaming": "DataDrift uses an **Anti-Gaming Engine** to prevent fake ratings. Only customers linked to a genuine verified transaction can submit a review. Suspicious rating patterns are flagged automatically for officer review.",
  "certificate": "A DataDrift **Digital Certificate** is issued after a government officer verifies the instrument. It contains a unique QR code. Scan or enter the Certificate ID on the **Verify** tab to check authenticity.",
  "shop": "To find verified shops near you: go to the **Nearby** tab and tap **Use My Location**. You will see a real map with shops colour-coded GREEN (compliant), YELLOW (attention needed), or RED (non-compliant).",
  "nearby": "Use the **Nearby** tab to discover DataDrift-registered shops and instruments close to you. Select a radius (1–10 km) and filter by shop type or compliance status. Only businesses registered with DataDrift appear.",
  "report": "To report an inaccurate instrument: go to **Complaint** tab, select the shop and instrument, describe the inaccuracy (e.g., weighing scale shows wrong reading), and submit. An officer will investigate.",
  "helpline": "Consumer Helpline: **1800-11-4000** (toll-free). You can also email **consumer@legalmetrology.mh.gov.in**. Officers are available Monday–Saturday, 10 AM – 5 PM.",
};

function ConsumerAIAssistant({ onNavigate }: { onNavigate: (s: string) => void }) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<{ role: "user" | "ai"; text: string; time: Date }[]>([
    { role: "ai", text: "Hello! I'm the DataDrift Consumer Assistant. Ask me anything about instrument verification, nearby shops, complaints, or certificates. You can also **speak** your question using the mic button.", time: new Date() },
  ]);
  const [input, setInput] = useState("");
  const [speechStatus, setSpeechStatus] = useState<SpeechStatus>("idle");
  const [speechError, setSpeechError] = useState("");
  const [loading, setLoading] = useState(false);
  const speechRef = useRef<{ stop: () => void; cancel: () => void } | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (open) bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, open]);

  const respond = async (msg: string) => {
    if (!msg.trim()) return;
    setInput("");
    setMessages(prev => [...prev, { role: "user", text: msg, time: new Date() }]);
    setLoading(true);
    await new Promise(r => setTimeout(r, 500));

    const lower = msg.toLowerCase();
    let reply = "";

    // Check if asking for nearby — navigate there
    if (lower.includes("near") || lower.includes("nearby") || lower.includes("map") || lower.includes("location")) {
      reply = "I can show you verified shops nearby! I'm opening the **Nearby Discovery** tab for you — tap **Use My Location** to see shops on the real map, filtered by distance and compliance status.";
      setTimeout(() => onNavigate("nearby"), 1200);
    } else {
      for (const [key, response] of Object.entries(CONSUMER_RESPONSES)) {
        if (lower.includes(key)) { reply = response; break; }
      }
      if (!reply) {
        reply = "I can help you with: **instrument verification**, **finding nearby shops**, **filing complaints**, **tracking complaint status**, **certificate verification**, and **Trust Score information**. Try one of the suggested questions below, or type your question.";
      }
    }

    setMessages(prev => [...prev, { role: "ai", text: reply, time: new Date() }]);
    setLoading(false);
  };

  const startVoice = () => {
    if (!isSpeechSupported()) {
      setSpeechError("Microphone access is unavailable. You can type your question instead.");
      return;
    }
    setSpeechError("");
    const session = startListening({
      lang: "hi-IN",
      onInterim: t => setInput(t),
      onFinal: t => { setInput(t); setSpeechStatus("done"); },
      onStatusChange: s => setSpeechStatus(s),
      onError: msg => { setSpeechError(msg); setSpeechStatus("idle"); },
    });
    speechRef.current = session;
  };

  const stopVoice = () => { speechRef.current?.stop(); setSpeechStatus("idle"); };
  const cancelVoice = () => { speechRef.current?.cancel(); setInput(""); setSpeechStatus("idle"); };

  const renderAIText = (text: string) =>
    text.split("\n").map((line, i) => {
      const html = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
      return <p key={i} dangerouslySetInnerHTML={{ __html: html }} className="mb-0.5 last:mb-0" />;
    });

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-xl flex items-center justify-center text-2xl transition-all hover:scale-110 active:scale-95"
        style={{ background: "linear-gradient(135deg, #1e40af, #0f766e)", color: "white" }}
        title="Consumer AI Assistant">
        {open ? "✕" : "🤖"}
        {!open && <span className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white animate-pulse" />}
      </button>

      {/* Chat panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-80 sm:w-96 rounded-2xl shadow-2xl flex flex-col overflow-hidden" style={{ maxHeight: 520, background: "white", border: "1px solid #e5e7eb" }}>
          {/* Header */}
          <div className="px-4 py-3 flex items-center gap-3" style={{ background: "linear-gradient(135deg, #1e3a8a, #0f766e)" }}>
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white font-black text-sm">AI</div>
            <div className="flex-1">
              <div className="text-white font-bold text-sm">DataDrift Consumer Assistant</div>
              <div className="text-white/60 text-[10px]">AI-assisted · Demo Mode · EN / हि / मराठी</div>
            </div>
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight: 200 }}>
            {messages.map((m, i) => (
              <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
                {m.role === "ai" && <div className="w-6 h-6 rounded-full bg-blue-700 text-white text-[10px] font-bold flex items-center justify-center shrink-0 mr-2 mt-1">AI</div>}
                <div className={`max-w-[82%] rounded-2xl px-3 py-2.5 text-xs leading-relaxed ${m.role === "user" ? "bg-blue-600 text-white rounded-br-sm" : "bg-gray-100 text-gray-800 rounded-bl-sm"}`}>
                  {m.role === "ai" ? renderAIText(m.text) : m.text}
                  <div className={`text-[9px] mt-1 ${m.role === "user" ? "text-blue-200 text-right" : "text-gray-400"}`}>{m.time.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-blue-700 text-white text-[10px] font-bold flex items-center justify-center shrink-0">AI</div>
                <div className="bg-gray-100 rounded-2xl rounded-bl-sm px-3 py-2.5 flex gap-1">
                  {[0, 0.15, 0.3].map(d => <div key={d} className="w-1.5 h-1.5 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: `${d}s` }} />)}
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Suggested questions */}
          {messages.length <= 1 && (
            <div className="px-3 pb-2 flex gap-1.5 flex-wrap border-t border-gray-100 pt-2">
              {CONSUMER_SUGGESTED.slice(0, 3).map(q => (
                <button key={q} onClick={() => respond(q)} className="text-[10px] px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 rounded-full hover:bg-blue-100 transition-all">{q}</button>
              ))}
            </div>
          )}

          {/* Speech error */}
          {speechError && (
            <div className="mx-3 mb-1 text-[10px] text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-2 py-1.5">
              ⚠️ {speechError}
            </div>
          )}

          {/* Recording indicator */}
          {speechStatus === "listening" && (
            <div className="mx-3 mb-1 flex items-center justify-between bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                <span className="text-xs text-red-700 font-medium">Listening…</span>
                <div className="flex gap-0.5 items-center h-4">
                  {[1,2,3,4,5].map(i => (
                    <div key={i} className="w-0.5 rounded-full bg-red-400 animate-bounce" style={{ height: `${8 + (i % 3) * 4}px`, animationDelay: `${i * 0.1}s` }} />
                  ))}
                </div>
              </div>
              <button onClick={cancelVoice} className="text-[10px] text-red-600 font-medium hover:underline">Cancel</button>
            </div>
          )}

          {/* Input bar */}
          <div className="p-3 border-t border-gray-100">
            <div className="flex items-center gap-2 bg-gray-50 rounded-xl border border-gray-200 px-3 py-2 focus-within:border-blue-400 focus-within:ring-1 focus-within:ring-blue-100">
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === "Enter" && !e.shiftKey && respond(input)}
                placeholder={speechStatus === "listening" ? "Listening…" : "Type or 🎙 speak in EN / हि / मराठी…"}
                className="flex-1 bg-transparent text-xs outline-none text-gray-700 placeholder-gray-400"
                readOnly={speechStatus === "listening"}
              />
              {/* Mic button */}
              <button
                onClick={speechStatus === "listening" ? stopVoice : startVoice}
                title={speechStatus === "listening" ? "Stop recording" : "Speak your question"}
                className={`w-8 h-8 rounded-xl flex items-center justify-center transition-all shrink-0 relative ${speechStatus === "listening" ? "bg-red-100 text-red-600 ring-2 ring-red-300" : "bg-blue-50 text-blue-600 hover:bg-blue-100"}`}>
                <span className="text-sm">{speechStatus === "listening" ? "⏹" : "🎙️"}</span>
                {speechStatus !== "listening" && <span className="absolute -top-0.5 -right-0.5 w-2 h-2 bg-green-400 rounded-full border border-white animate-pulse" />}
              </button>
              {/* Send button */}
              <button
                onClick={() => respond(input)}
                disabled={!input.trim() || loading}
                className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center hover:bg-blue-700 transition-all disabled:opacity-40 shrink-0">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z"/></svg>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ─── Main Public Portal ───────────────────────────────────

type Section = "home" | "nearby" | "shop" | "complaint" | "track" | "verify" | "education" | "dashboard";

export default function PublicPortal({ onBack }: Props) {
  const [section, setSection] = useState<Section>("home");
  const [selectedShop, setSelectedShop] = useState<string | null>(null);
  const [complaintShopId, setComplaintShopId] = useState<string | undefined>(undefined);
  const scrollRef = useRef<HTMLDivElement>(null);

  const navigate = (s: string) => {
    setSection(s as Section);
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  const goToShop = (id: string) => {
    setSelectedShop(id);
    navigate("shop");
  };

  const goToComplaint = (shopId?: string) => {
    setComplaintShopId(shopId);
    navigate("complaint");
  };

  const NAV_ITEMS = [
    { key: "home", label: "Home", icon: "🏠" },
    { key: "nearby", label: "Nearby", icon: "📍" },
    { key: "verify", label: "Verify", icon: "🔐" },
    { key: "complaint", label: "Complaint", icon: "📣" },
    { key: "track", label: "Track", icon: "🔍" },
    { key: "education", label: "Rights", icon: "📚" },
    { key: "dashboard", label: "Data", icon: "📊" },
  ];

  return (
    <div className="min-h-full flex flex-col" style={{ background: "#f0f4f8" }}>
      {/* Top bar */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-700 to-blue-900 flex items-center justify-center text-white font-black text-sm">LM</div>
            <div className="hidden sm:block">
              <div className="font-bold text-gray-900 text-sm" style={{ fontFamily: "'Plus Jakarta Sans', sans-serif" }}>Consumer Transparency Portal</div>
              <div className="text-[10px] text-gray-400">Legal Metrology Dept — Maharashtra</div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="hidden sm:flex items-center gap-1 text-xs px-2.5 py-1.5 bg-green-50 text-green-700 border border-green-200 rounded-lg font-medium">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse" />No Login Required
            </span>
            <button onClick={onBack} className="text-xs px-3 py-1.5 border border-gray-200 rounded-lg text-gray-600 hover:bg-gray-50 transition-all">← Gov Portal</button>
          </div>
        </div>

        {/* Navigation */}
        <div className="border-t border-gray-100 overflow-x-auto">
          <div className="max-w-5xl mx-auto px-4 flex gap-1 py-1.5">
            {NAV_ITEMS.map(item => (
              <button key={item.key} onClick={() => navigate(item.key)}
                className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${section === item.key ? "bg-blue-600 text-white" : "text-gray-600 hover:bg-gray-100"}`}>
                <span>{item.icon}</span> {item.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Content */}
      <div ref={scrollRef} className="flex-1 overflow-auto">
        <div className="max-w-5xl mx-auto px-4 py-6">
          {section === "home" && <HomeSection onSection={navigate} onShopSelect={goToShop} />}
          {section === "nearby" && <NearbySection onShopSelect={goToShop} />}
          {section === "shop" && selectedShop && <ShopDetailSection shopId={selectedShop} onComplaint={goToComplaint} onSection={navigate} />}
          {section === "complaint" && <ComplaintSection prefilledShopId={complaintShopId} onTrack={() => navigate("track")} />}
          {section === "track" && <TrackSection />}
          {section === "verify" && <VerifySection />}
          {section === "education" && <EducationSection />}
          {section === "dashboard" && <DashboardSection />}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-100 py-4 text-center text-xs text-gray-400">
        Public Consumer Portal · Legal Metrology Department, Maharashtra · SIH 2026 — Team DataDrift
        <span className="mx-2">·</span>
        Consumer Helpline: <strong className="text-gray-600">1800-11-4000</strong>
      </footer>

      {/* Floating AI Assistant */}
      <ConsumerAIAssistant onNavigate={navigate} />
    </div>
  );
}
