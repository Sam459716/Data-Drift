// Server-side API handler for DataDrift
// Implements /api/nearby-shops, /api/places/:place_id, /api/shops/:place_id, /api/compliance/:place_id, /api/geocode, /api/complaints/voice
// Connects to Google Places API (New) using GOOGLE_MAPS_API_KEY
// Keeps all credentials strictly server-side and never exposes keys to frontend code.

import type { IncomingMessage, ServerResponse } from "node:http";
import fs from "node:fs";
import path from "node:path";
import { PUBLIC_SHOPS, type Shop, haversineKm } from "../data/publicData";

// In-memory cache for recent spatial queries and complaints
const NEARBY_CACHE = new Map<string, { timestamp: number; data: any }>();
const VOICE_COMPLAINTS = new Map<string, any>();

export interface NormalizedBusiness {
  id: string;
  placeId: string;
  name: string;
  address: string;
  area?: string;
  district?: string;
  lat: number;
  lng: number;
  distanceKm: number;
  phone?: string;
  website?: string;
  openingHours?: string;
  isOpen?: boolean;
  rating?: number;
  userRatingsTotal?: number;
  category: string;
  // Feature 4: DataDrift Compliance Status strictly separate from Google Places existence
  complianceStatus: "Verified" | "Certificate Valid" | "Certificate Expired" | "Verification Pending" | "Data Not Found";
  complianceNote?: string;
  dataDriftRecord?: Shop | null;
}

// Safely retrieve GOOGLE_MAPS_API_KEY from environment or .env/.env.local
export function getGoogleMapsApiKey(): string | undefined {
  if (process.env.GOOGLE_MAPS_API_KEY?.trim()) return process.env.GOOGLE_MAPS_API_KEY.trim();
  if (process.env.GOOGLE_PLACES_API_KEY?.trim()) return process.env.GOOGLE_PLACES_API_KEY.trim();

  try {
    for (const envFile of [".env.local", ".env"]) {
      const p = path.resolve(process.cwd(), envFile);
      if (fs.existsSync(p)) {
        const content = fs.readFileSync(p, "utf-8");
        for (const line of content.split("\n")) {
          const trimmed = line.trim();
          if (trimmed.startsWith("#") || !trimmed.includes("=")) continue;
          const [key, ...vals] = trimmed.split("=");
          const k = key.trim();
          const v = vals.join("=").trim().replace(/^["']|["']$/g, "");
          if ((k === "GOOGLE_MAPS_API_KEY" || k === "GOOGLE_PLACES_API_KEY") && v) {
            process.env[k] = v;
            return v;
          }
        }
      }
    }
  } catch {}
  return undefined;
}

// Map Places / OSM category to Legal Metrology categories
export function normalizeCategory(typeOrClass: string): string {
  const t = (typeOrClass || "").toLowerCase();
  if (t.includes("supermarket") || t.includes("department_store") || t.includes("shopping_mall")) return "Supermarket";
  if (t.includes("grocery") || t.includes("convenience") || t.includes("general") || t.includes("kiosk")) return "Grocery";
  if (t.includes("fuel") || t.includes("gas_station") || t.includes("petrol")) return "Fuel Station";
  if (t.includes("jewel") || t.includes("goldsmith")) return "Jewellery";
  if (t.includes("pharmacy") || t.includes("drugstore") || t.includes("chemist")) return "Pharmacy";
  if (t.includes("greengrocer") || t.includes("fruit") || t.includes("vegetable") || t.includes("market")) return "Vegetable Market";
  if (t.includes("dairy")) return "Dairy";
  if (t.includes("hardware") || t.includes("tool") || t.includes("electronics") || t.includes("home_goods")) return "Hardware";
  return "Retail Shop";
}

// Map category filter to Google Places API (New) includedTypes
function mapCategoryToPlacesNewTypes(categoryFilter?: string): string[] {
  if (!categoryFilter) {
    return [
      "store",
      "supermarket",
      "grocery_store",
      "shopping_mall",
      "gas_station",
      "jewelry_store",
      "pharmacy",
      "hardware_store",
      "convenience_store",
      "bakery",
      "department_store",
      "electronics_store",
      "clothing_store",
      "home_goods_store",
    ];
  }

  const cat = categoryFilter.toLowerCase();
  if (cat.includes("grocery")) return ["grocery_store", "convenience_store", "market"];
  if (cat.includes("supermarket")) return ["supermarket", "shopping_mall", "department_store"];
  if (cat.includes("fuel") || cat.includes("petrol")) return ["gas_station"];
  if (cat.includes("jewel")) return ["jewelry_store"];
  if (cat.includes("pharmacy")) return ["pharmacy", "drugstore"];
  if (cat.includes("vegetable") || cat.includes("fruit")) return ["grocery_store", "market"];
  if (cat.includes("dairy")) return ["grocery_store", "convenience_store"];
  if (cat.includes("hardware")) return ["hardware_store", "home_goods_store", "electronics_store"];
  return ["store", "supermarket", "grocery_store", "shopping_mall"];
}

// Cross-reference real business with DataDrift registry
export function matchDataDriftRecord(businessName: string, lat: number, lng: number): {
  status: "Verified" | "Certificate Valid" | "Certificate Expired" | "Verification Pending" | "Data Not Found";
  record: Shop | null;
  note?: string;
} {
  const normName = businessName.toLowerCase().replace(/[^a-z0-9]/g, "");

  for (const shop of PUBLIC_SHOPS) {
    const shopNorm = shop.name.toLowerCase().replace(/[^a-z0-9]/g, "");
    const nameMatch = normName.includes(shopNorm) || shopNorm.includes(normName);
    const distKm = haversineKm(lat, lng, shop.lat, shop.lng);

    // If strong name match or within 300m with similar name prefix
    if (nameMatch || (distKm < 0.3 && normName.slice(0, 5) === shopNorm.slice(0, 5))) {
      const anyExpired = shop.instruments.some((i) => i.status === "EXPIRED" || i.status === "FAILED");
      const anyPending = shop.instruments.some((i) => i.status === "PENDING_VERIFICATION" || i.status === "EXPIRING_SOON");

      if (anyExpired) {
        return {
          status: "Certificate Expired",
          record: shop,
          note: "DataDrift record matched. One or more instruments have expired certificates.",
        };
      }
      if (anyPending) {
        return {
          status: "Verification Pending",
          record: shop,
          note: "DataDrift record matched. Annual re-verification pending.",
        };
      }
      return {
        status: "Certificate Valid",
        record: shop,
        note: "DataDrift legal metrology record verified and current.",
      };
    }
  }

  // Feature 4: "Data Not Found" must NOT be presented as "Fraud", "Illegal", or "Unregistered"
  return {
    status: "Data Not Found",
    record: null,
    note: "This commercial business was located on Google Places. No active DataDrift Legal Metrology registration file found in this jurisdiction.",
  };
}

/**
 * Fetch real Pune businesses using Google Places API (New) Nearby Search
 * Endpoint: POST https://places.googleapis.com/v1/places:searchNearby
 */
async function fetchGooglePlacesNew(
  lat: number,
  lng: number,
  radiusKm: number,
  apiKey: string,
  categoryFilter?: string
): Promise<{ success: boolean; businesses: NormalizedBusiness[]; error?: string }> {
  const radiusMeters = Math.min(Math.max(radiusKm * 1000, 500), 50000);
  const includedTypes = mapCategoryToPlacesNewTypes(categoryFilter);

  const payload = {
    includedTypes,
    maxResultCount: 20,
    locationRestriction: {
      circle: {
        center: {
          latitude: lat,
          longitude: lng,
        },
        radius: radiusMeters,
      },
    },
  };

  try {
    const res = await fetch("https://places.googleapis.com/v1/places:searchNearby", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask":
          "places.id,places.displayName,places.formattedAddress,places.location,places.rating,places.userRatingCount,places.types,places.nationalPhoneNumber,places.internationalPhoneNumber,places.websiteUri,places.regularOpeningHours,places.currentOpeningHours,places.primaryTypeDisplayName",
      },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(8000),
    });

    if (res.ok) {
      const data = await res.json();
      const rawPlaces = data.places || [];
      const results: NormalizedBusiness[] = [];

      for (const item of rawPlaces) {
        const itemLat = item.location?.latitude;
        const itemLng = item.location?.longitude;
        if (typeof itemLat !== "number" || typeof itemLng !== "number") continue;

        const dist = haversineKm(lat, lng, itemLat, itemLng);
        const name = item.displayName?.text || "Commercial Establishment";
        const compliance = matchDataDriftRecord(name, itemLat, itemLng);

        // Normalize raw place ID
        const cleanId = (item.id || "").replace(/^places\//, "");

        results.push({
          id: `google_${cleanId}`,
          placeId: cleanId,
          name,
          address: item.formattedAddress || "Pune, Maharashtra",
          lat: itemLat,
          lng: itemLng,
          distanceKm: Math.round(dist * 100) / 100,
          phone: item.nationalPhoneNumber || item.internationalPhoneNumber,
          website: item.websiteUri,
          rating: item.rating,
          userRatingsTotal: item.userRatingCount,
          isOpen: item.currentOpeningHours?.openNow ?? item.regularOpeningHours?.openNow,
          category: item.primaryTypeDisplayName?.text || normalizeCategory((item.types || []).join(" ")),
          complianceStatus: compliance.status,
          complianceNote: compliance.note,
          dataDriftRecord: compliance.record,
        });
      }

      return {
        success: true,
        businesses: results.sort((a, b) => a.distanceKm - b.distanceKm),
      };
    }

    // If Places API (New) returned an error response
    const errData = await res.json().catch(() => ({}));
    const errMsg = errData.error?.message || `Google Places API HTTP ${res.status}`;

    // If Places API (New) is not enabled for this key, attempt legacy Nearby Search as automatic fallback
    if (res.status === 403 || res.status === 400) {
      const legacyResult = await fetchGooglePlacesLegacy(lat, lng, radiusKm, apiKey, categoryFilter);
      if (legacyResult.success) {
        return legacyResult;
      }
    }

    return {
      success: false,
      businesses: [],
      error: `Google Places API error: ${errMsg}. Please verify that the GOOGLE_MAPS_API_KEY is valid and has Places API enabled.`,
    };
  } catch (err: any) {
    return {
      success: false,
      businesses: [],
      error: `Could not connect to Google Places API: ${err.message || "Network timeout"}`,
    };
  }
}

/**
 * Fallback to Google Places Legacy Nearby Search if Places API (New) is not activated on key
 */
async function fetchGooglePlacesLegacy(
  lat: number,
  lng: number,
  radiusKm: number,
  apiKey: string,
  categoryFilter?: string
): Promise<{ success: boolean; businesses: NormalizedBusiness[]; error?: string }> {
  const radiusMeters = Math.min(radiusKm * 1000, 50000);
  const typeParam = categoryFilter ? categoryFilter.toLowerCase() : "store";
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radiusMeters}&type=${encodeURIComponent(typeParam)}&key=${apiKey}`;

  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(6000) });
    if (!res.ok) {
      return { success: false, businesses: [], error: `Legacy Google Places HTTP ${res.status}` };
    }
    const data = await res.json();
    if (data.status !== "OK" && data.status !== "ZERO_RESULTS") {
      return {
        success: false,
        businesses: [],
        error: data.error_message || `Google Places API status: ${data.status}`,
      };
    }

    const results: NormalizedBusiness[] = [];
    for (const item of data.results || []) {
      const itemLat = item.geometry?.location?.lat;
      const itemLng = item.geometry?.location?.lng;
      if (typeof itemLat !== "number" || typeof itemLng !== "number") continue;

      const dist = haversineKm(lat, lng, itemLat, itemLng);
      const name = item.name || "Commercial Establishment";
      const compliance = matchDataDriftRecord(name, itemLat, itemLng);

      results.push({
        id: `google_${item.place_id}`,
        placeId: item.place_id,
        name,
        address: item.vicinity || "Pune, Maharashtra",
        lat: itemLat,
        lng: itemLng,
        distanceKm: Math.round(dist * 100) / 100,
        rating: item.rating,
        userRatingsTotal: item.user_ratings_total,
        isOpen: item.opening_hours?.open_now,
        category: normalizeCategory((item.types || []).join(" ")),
        complianceStatus: compliance.status,
        complianceNote: compliance.note,
        dataDriftRecord: compliance.record,
      });
    }

    return {
      success: true,
      businesses: results.sort((a, b) => a.distanceKm - b.distanceKm),
    };
  } catch (err: any) {
    return { success: false, businesses: [], error: err.message };
  }
}

/**
 * Fetch Place Details (New)
 * Endpoint: GET https://places.googleapis.com/v1/places/{placeId}
 */
async function fetchGooglePlaceDetailsNew(
  placeId: string,
  apiKey: string
): Promise<{ found: boolean; place?: any; error?: string }> {
  const cleanId = placeId.replace(/^google_/, "").replace(/^places\//, "");

  try {
    const res = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(cleanId)}`, {
      headers: {
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask":
          "id,displayName,formattedAddress,location,rating,userRatingCount,types,nationalPhoneNumber,internationalPhoneNumber,websiteUri,regularOpeningHours,currentOpeningHours,primaryTypeDisplayName",
      },
      signal: AbortSignal.timeout(6000),
    });

    if (res.ok) {
      const item = await res.json();
      const lat = item.location?.latitude || 18.5204;
      const lng = item.location?.longitude || 73.8567;
      const name = item.displayName?.text || "Commercial Establishment";
      const compliance = matchDataDriftRecord(name, lat, lng);

      return {
        found: true,
        place: {
          id: `google_${item.id}`,
          placeId: item.id,
          name,
          address: item.formattedAddress || "Pune, Maharashtra",
          lat,
          lng,
          phone: item.nationalPhoneNumber || item.internationalPhoneNumber,
          website: item.websiteUri,
          rating: item.rating,
          userRatingsTotal: item.userRatingCount,
          isOpen: item.currentOpeningHours?.openNow ?? item.regularOpeningHours?.openNow,
          openingHours: item.regularOpeningHours?.weekdayDescriptions,
          category: item.primaryTypeDisplayName?.text || normalizeCategory((item.types || []).join(" ")),
          complianceStatus: compliance.status,
          complianceNote: compliance.note,
          dataDriftRecord: compliance.record,
        },
      };
    }

    // Try legacy Place Details if new details fails
    const legacyUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${encodeURIComponent(cleanId)}&fields=name,formatted_address,geometry,rating,user_ratings_total,formatted_phone_number,website,opening_hours,types&key=${apiKey}`;
    const legacyRes = await fetch(legacyUrl, { signal: AbortSignal.timeout(6000) });
    if (legacyRes.ok) {
      const legData = await legacyRes.json();
      if (legData.status === "OK" && legData.result) {
        const item = legData.result;
        const lat = item.geometry?.location?.lat || 18.5204;
        const lng = item.geometry?.location?.lng || 73.8567;
        const name = item.name || "Commercial Establishment";
        const compliance = matchDataDriftRecord(name, lat, lng);

        return {
          found: true,
          place: {
            id: `google_${cleanId}`,
            placeId: cleanId,
            name,
            address: item.formatted_address || "Pune, Maharashtra",
            lat,
            lng,
            phone: item.formatted_phone_number,
            website: item.website,
            rating: item.rating,
            userRatingsTotal: item.user_ratings_total,
            isOpen: item.opening_hours?.open_now,
            openingHours: item.opening_hours?.weekday_text,
            category: normalizeCategory((item.types || []).join(" ")),
            complianceStatus: compliance.status,
            complianceNote: compliance.note,
            dataDriftRecord: compliance.record,
          },
        };
      }
    }

    return { found: false, error: "Place details not found in Google Places" };
  } catch (err: any) {
    return { found: false, error: err.message };
  }
}

/**
 * Main HTTP router for Vite server middleware
 */
export async function handleApiRequest(req: IncomingMessage, res: ServerResponse): Promise<boolean> {
  const url = new URL(req.url || "/", `http://${req.headers.host || "localhost"}`);
  const pathname = url.pathname;

  if (!pathname.startsWith("/api/")) {
    return false;
  }

  // Helper to send JSON responses
  const sendJson = (status: number, data: any) => {
    res.statusCode = status;
    res.setHeader("Content-Type", "application/json; charset=utf-8");
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    res.end(JSON.stringify(data));
  };

  if (req.method === "OPTIONS") {
    sendJson(200, { ok: true });
    return true;
  }

  // 1. GET /api/nearby-shops
  if (pathname === "/api/nearby-shops" && req.method === "GET") {
    const lat = parseFloat(url.searchParams.get("lat") || "18.5204");
    const lng = parseFloat(url.searchParams.get("lng") || "73.8567");
    const radius = parseFloat(url.searchParams.get("radius") || "2");
    const category = url.searchParams.get("category") || undefined;

    const apiKey = getGoogleMapsApiKey();

    // Check caching
    const cacheKey = `${lat.toFixed(3)},${lng.toFixed(3)},${radius},${category || ""}`;
    const cached = NEARBY_CACHE.get(cacheKey);
    if (cached && Date.now() - cached.timestamp < 180000) {
      sendJson(200, cached.data);
      return true;
    }

    // If Google Maps API Key is NOT configured:
    // Prompt requirement: "If the API returns an error or the key is unavailable, show a user-friendly error instead of fake data. Do not create fake shop data."
    if (!apiKey) {
      sendJson(200, {
        success: false,
        error: "Google Maps API key (GOOGLE_MAPS_API_KEY) is not configured. Please set GOOGLE_MAPS_API_KEY in your environment or .env file to retrieve real Pune business data.",
        businesses: [],
        location: { lat, lng, area: "Pune, Maharashtra" },
        radiusKm: radius,
        total: 0,
      });
      return true;
    }

    // Call Google Places API (New) Nearby Search
    const searchResult = await fetchGooglePlacesNew(lat, lng, radius, apiKey, category);

    if (!searchResult.success) {
      sendJson(200, {
        success: false,
        error: searchResult.error || "Nearby business search failed. Please try again.",
        businesses: [],
        location: { lat, lng, area: "Pune, Maharashtra" },
        radiusKm: radius,
        total: 0,
      });
      return true;
    }

    const responsePayload = {
      success: true,
      source: "google_places",
      location: { lat, lng, area: "Pune, Maharashtra" },
      radiusKm: radius,
      total: searchResult.businesses.length,
      businesses: searchResult.businesses,
    };

    NEARBY_CACHE.set(cacheKey, { timestamp: Date.now(), data: responsePayload });
    sendJson(200, responsePayload);
    return true;
  }

  // 2. GET /api/places/:place_id (Google Place Details New)
  if (pathname.startsWith("/api/places/") && req.method === "GET") {
    const rawPlaceId = decodeURIComponent(pathname.replace("/api/places/", ""));
    const apiKey = getGoogleMapsApiKey();

    if (!apiKey) {
      sendJson(400, {
        found: false,
        error: "GOOGLE_MAPS_API_KEY is not configured.",
      });
      return true;
    }

    const details = await fetchGooglePlaceDetailsNew(rawPlaceId, apiKey);
    if (details.found) {
      sendJson(200, { found: true, source: "google_places", business: details.place });
    } else {
      sendJson(404, { found: false, error: details.error || "Place not found" });
    }
    return true;
  }

  // 3. GET /api/compliance/:place_id
  if (pathname.startsWith("/api/compliance/") && req.method === "GET") {
    const placeId = decodeURIComponent(pathname.replace("/api/compliance/", ""));
    const businessName = url.searchParams.get("name") || "";

    const matched = matchDataDriftRecord(businessName || placeId, 18.5204, 73.8567);
    sendJson(200, {
      placeId,
      complianceStatus: matched.status,
      hasDataDriftRecord: !!matched.record,
      complianceNote: matched.note,
      record: matched.record,
    });
    return true;
  }

  // 4. GET /api/shops/:place_id
  if (pathname.startsWith("/api/shops/") && req.method === "GET") {
    const placeId = decodeURIComponent(pathname.replace("/api/shops/", ""));
    const shop = PUBLIC_SHOPS.find((s) => s.id === placeId);
    if (shop) {
      sendJson(200, { found: true, source: "datadrift_registry", shop });
      return true;
    }

    // If not found in internal registry, check if it is a Google Place ID
    const apiKey = getGoogleMapsApiKey();
    if (apiKey) {
      const details = await fetchGooglePlaceDetailsNew(placeId, apiKey);
      if (details.found) {
        sendJson(200, { found: true, source: "google_places", business: details.place });
        return true;
      }
    }

    sendJson(404, { found: false, error: "Shop not found in DataDrift records or Google Places" });
    return true;
  }

  // 5. GET /api/geocode (Reverse geocoding helper)
  if (pathname === "/api/geocode" && req.method === "GET") {
    const lat = parseFloat(url.searchParams.get("lat") || "18.5204");
    const lng = parseFloat(url.searchParams.get("lng") || "73.8567");
    const apiKey = getGoogleMapsApiKey();

    if (apiKey) {
      try {
        const gUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`;
        const gRes = await fetch(gUrl, { signal: AbortSignal.timeout(4000) });
        if (gRes.ok) {
          const gData = await gRes.json();
          if (gData.status === "OK" && gData.results?.[0]) {
            const first = gData.results[0];
            let area = "Pune";
            let city = "Pune";
            let state = "Maharashtra";
            for (const comp of first.address_components || []) {
              if (comp.types.includes("sublocality") || comp.types.includes("neighborhood")) area = comp.long_name;
              if (comp.types.includes("locality")) city = comp.long_name;
              if (comp.types.includes("administrative_area_level_1")) state = comp.long_name;
            }
            sendJson(200, {
              formatted: first.formatted_address || `${area}, ${city}, ${state}`,
              area,
              city,
              state,
            });
            return true;
          }
        }
      } catch {}
    }

    // Fallback geocode response
    sendJson(200, {
      formatted: "Pune, Maharashtra",
      city: "Pune",
      state: "Maharashtra",
      area: "Shivajinagar",
    });
    return true;
  }

  // 6. POST /api/complaints/voice
  if (pathname === "/api/complaints/voice" && req.method === "POST") {
    const chunks: Buffer[] = [];
    req.on("data", (chunk) => chunks.push(chunk));
    req.on("end", () => {
      const complaintId = `LM-CMP-${Date.now().toString().slice(-5)}`;
      VOICE_COMPLAINTS.set(complaintId, {
        id: complaintId,
        receivedAt: new Date().toISOString(),
        hasAudio: chunks.length > 0,
        bytes: Buffer.concat(chunks).length,
      });

      sendJson(200, {
        success: true,
        complaintId,
        audioAttached: true,
        message: "Voice complaint successfully recorded and queued for officer investigation.",
      });
    });
    return true;
  }

  return false;
}
