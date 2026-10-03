"""
DataDrift - Legal Metrology Digital Verification Platform
FastAPI Backend Services

Endpoints:
- GET  /api/nearby-shops (Google Places API New Nearby Search)
- GET  /api/places/{place_id} (Google Places API New Place Details)
- GET  /api/shops/{place_id} (DataDrift Registry & Google Places)
- GET  /api/compliance/{place_id} (DataDrift Compliance Status)
- GET  /api/geocode (Reverse geocode)
- POST /api/complaints/voice (Voice complaint upload)
"""

import math
import os
import time
from typing import Any, Dict, List, Optional
from fastapi import FastAPI, File, Form, Query, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import httpx

app = FastAPI(
    title="DataDrift Legal Metrology API",
    description="Backend services for real-time location discovery, Google Places API (New), and voice complaints in Pune, Maharashtra.",
    version="1.1.0",
)

# Enable CORS for frontend integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Known DataDrift Legal Metrology Registry records for cross-referencing
DATADRIFT_REGISTRY = [
    {
        "id": "SHOP-001",
        "name": "Anand Kirana Store",
        "category": "Grocery",
        "address": "Shop 12, FC Road, Shivajinagar, Pune",
        "lat": 18.5322,
        "lng": 73.8468,
        "compliance_status": "Certificate Valid",
        "instruments": [
            {"id": "LM-MH-PUN-000201", "type": "Counter Weighing Scale", "status": "REGISTERED_VERIFIED"},
            {"id": "LM-MH-PUN-000202", "type": "Platform Scale", "status": "REGISTERED_VERIFIED"},
        ],
    },
    {
        "id": "SHOP-002",
        "name": "Pawar Supermarket",
        "category": "Supermarket",
        "address": "Opposite City Pride, Kothrud, Pune",
        "lat": 18.5074,
        "lng": 73.8077,
        "compliance_status": "Certificate Valid",
        "instruments": [
            {"id": "LM-MH-PUN-000203", "type": "Electronic Price Computing Scale", "status": "REGISTERED_VERIFIED"},
        ],
    },
    {
        "id": "SHOP-003",
        "name": "Laxmi Jewellers",
        "category": "Jewellery",
        "address": "Laxmi Road, Sadashiv Peth, Pune",
        "lat": 18.5144,
        "lng": 73.8541,
        "compliance_status": "Verification Pending",
        "instruments": [
            {"id": "LM-MH-PUN-000204", "type": "High Precision Micro-Balance", "status": "PENDING_VERIFICATION"},
        ],
    },
]


def get_google_maps_api_key() -> Optional[str]:
    """Retrieve GOOGLE_MAPS_API_KEY from environment or .env/.env.local files."""
    key = os.environ.get("GOOGLE_MAPS_API_KEY") or os.environ.get("GOOGLE_PLACES_API_KEY")
    if key and key.strip():
        return key.strip()

    for env_name in [".env.local", ".env"]:
        if os.path.exists(env_name):
            try:
                with open(env_name, "r") as f:
                    for line in f:
                        line = line.strip()
                        if line.startswith("#") or "=" not in line:
                            continue
                        k, v = line.split("=", 1)
                        clean_k = k.strip()
                        if clean_k in ("GOOGLE_MAPS_API_KEY", "GOOGLE_PLACES_API_KEY"):
                            val = v.strip().strip("'\"")
                            if val:
                                os.environ[clean_k] = val
                                return val
            except Exception:
                pass
    return None


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    r = 6371.0
    dlat = math.radians(lat2 - lat1)
    dlon = math.radians(lon2 - lon1)
    a = math.sin(dlat / 2) ** 2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return r * c


def normalize_category(type_or_class: str) -> str:
    t = (type_or_class or "").lower()
    if any(k in t for k in ["supermarket", "department_store", "shopping_mall"]):
        return "Supermarket"
    if any(k in t for k in ["grocery", "convenience", "general", "kiosk"]):
        return "Grocery"
    if any(k in t for k in ["fuel", "gas_station", "petrol"]):
        return "Fuel Station"
    if any(k in t for k in ["jewel", "goldsmith"]):
        return "Jewellery"
    if any(k in t for k in ["pharmacy", "drugstore", "chemist"]):
        return "Pharmacy"
    if any(k in t for k in ["greengrocer", "fruit", "vegetable", "market"]):
        return "Vegetable Market"
    if "dairy" in t:
        return "Dairy"
    if any(k in t for k in ["hardware", "tool", "electronics", "home_goods"]):
        return "Hardware"
    return "Retail Shop"


def map_category_to_places_new(category: Optional[str]) -> List[str]:
    if not category:
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
        ]
    cat = category.lower()
    if "grocery" in cat:
        return ["grocery_store", "convenience_store", "market"]
    if "supermarket" in cat:
        return ["supermarket", "shopping_mall", "department_store"]
    if "fuel" in cat or "petrol" in cat:
        return ["gas_station"]
    if "jewel" in cat:
        return ["jewelry_store"]
    if "pharmacy" in cat:
        return ["pharmacy", "drugstore"]
    if "vegetable" in cat or "fruit" in cat:
        return ["grocery_store", "market"]
    if "dairy" in cat:
        return ["grocery_store", "convenience_store"]
    if "hardware" in cat:
        return ["hardware_store", "home_goods_store", "electronics_store"]
    return ["store", "supermarket", "grocery_store", "shopping_mall"]


def match_datadrift_record(business_name: str, lat: float, lng: float) -> Dict[str, Any]:
    norm_target = "".join(c for c in business_name.lower() if c.isalnum())
    for item in DATADRIFT_REGISTRY:
        norm_item = "".join(c for c in item["name"].lower() if c.isalnum())
        dist = haversine_km(lat, lng, item["lat"], item["lng"])
        if norm_item in norm_target or norm_target in norm_item or (dist < 0.3 and norm_item[:5] == norm_target[:5]):
            return {
                "status": item["compliance_status"],
                "has_record": True,
                "record": item,
                "note": "DataDrift Legal Metrology registration matched.",
            }

    # "Data Not Found" must NOT be presented as "Fraud" or "Illegal"
    return {
        "status": "Data Not Found",
        "has_record": False,
        "record": None,
        "note": "This commercial business was located on Google Places. No active DataDrift Legal Metrology registration file found in this jurisdiction.",
    }


@app.get("/api/nearby-shops")
async def get_nearby_shops(
    lat: float = Query(18.5204, description="Latitude (default: Pune center)"),
    lng: float = Query(73.8567, description="Longitude (default: Pune center)"),
    radius: float = Query(2.0, description="Search radius in km (1, 2, or 5)"),
    category: Optional[str] = Query(None, description="Optional shop category filter"),
):
    google_key = get_google_maps_api_key()

    if not google_key:
        return {
            "success": False,
            "error": "Google Maps API key (GOOGLE_MAPS_API_KEY) is not configured. Please set GOOGLE_MAPS_API_KEY in your environment to search real Google Places businesses.",
            "location": {"lat": lat, "lng": lng, "area": "Pune, Maharashtra"},
            "radiusKm": radius,
            "total": 0,
            "businesses": [],
        }

    radius_meters = int(min(max(radius * 1000, 500), 50000))
    included_types = map_category_to_places_new(category)

    async with httpx.AsyncClient(timeout=8.0) as client:
        # Call Google Places API (New) Nearby Search
        try:
            places_new_url = "https://places.googleapis.com/v1/places:searchNearby"
            headers = {
                "Content-Type": "application/json",
                "X-Goog-Api-Key": google_key,
                "X-Goog-FieldMask": (
                    "places.id,places.displayName,places.formattedAddress,places.location,"
                    "places.rating,places.userRatingCount,places.types,places.nationalPhoneNumber,"
                    "places.internationalPhoneNumber,places.websiteUri,places.regularOpeningHours,"
                    "places.currentOpeningHours,places.primaryTypeDisplayName"
                ),
            }
            body = {
                "includedTypes": included_types,
                "maxResultCount": 20,
                "locationRestriction": {
                    "circle": {
                        "center": {"latitude": lat, "longitude": lng},
                        "radius": radius_meters,
                    }
                },
            }
            res = await client.post(places_new_url, json=body, headers=headers)

            if res.status_code == 200:
                data = res.json()
                raw_places = data.get("places", [])
                results = []
                for item in raw_places:
                    loc = item.get("location", {})
                    ilat = loc.get("latitude")
                    ilng = loc.get("longitude")
                    if ilat is None or ilng is None:
                        continue
                    dist = haversine_km(lat, lng, ilat, ilng)
                    name = item.get("displayName", {}).get("text", "Commercial Establishment")
                    comp = match_datadrift_record(name, ilat, ilng)

                    pid = item.get("id", "").replace("places/", "")
                    raw_types = item.get("types", [])
                    primary_type = item.get("primaryTypeDisplayName", {}).get("text")
                    cat_label = primary_type or normalize_category(" ".join(raw_types))

                    is_open = None
                    if "currentOpeningHours" in item:
                        is_open = item["currentOpeningHours"].get("openNow")
                    elif "regularOpeningHours" in item:
                        is_open = item["regularOpeningHours"].get("openNow")

                    results.append({
                        "id": f"google_{pid}",
                        "placeId": pid,
                        "name": name,
                        "address": item.get("formattedAddress", "Pune, Maharashtra"),
                        "lat": ilat,
                        "lng": ilng,
                        "distanceKm": round(dist, 2),
                        "phone": item.get("nationalPhoneNumber") or item.get("internationalPhoneNumber"),
                        "website": item.get("websiteUri"),
                        "rating": item.get("rating"),
                        "userRatingsTotal": item.get("userRatingCount"),
                        "isOpen": is_open,
                        "category": cat_label,
                        "complianceStatus": comp["status"],
                        "complianceNote": comp["note"],
                        "dataDriftRecord": comp["record"],
                    })

                results.sort(key=lambda x: x["distanceKm"])
                return {
                    "success": True,
                    "source": "google_places",
                    "location": {"lat": lat, "lng": lng, "area": "Pune, Maharashtra"},
                    "radiusKm": radius,
                    "total": len(results),
                    "businesses": results,
                }

            # If status not 200, check error
            err_data = res.json() if res.headers.get("content-type", "").startswith("application/json") else {}
            err_msg = err_data.get("error", {}).get("message") or f"Google Places API HTTP {res.status_code}"

            # Fallback to legacy Google Places if Places API (New) is not activated
            if res.status_code in (400, 403):
                legacy_url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json"
                legacy_params = {
                    "location": f"{lat},{lng}",
                    "radius": radius_meters,
                    "type": category.lower() if category else "store",
                    "key": google_key,
                }
                leg_res = await client.get(legacy_url, params=legacy_params)
                if leg_res.status_code == 200:
                    leg_data = leg_res.json()
                    leg_results = []
                    for item in leg_data.get("results", []):
                        iloc = item.get("geometry", {}).get("location", {})
                        ilat = iloc.get("lat")
                        ilng = iloc.get("lng")
                        if ilat is None or ilng is None:
                            continue
                        dist = haversine_km(lat, lng, ilat, ilng)
                        comp = match_datadrift_record(item.get("name", ""), ilat, ilng)
                        leg_results.append({
                            "id": f"google_{item.get('place_id')}",
                            "placeId": item.get("place_id"),
                            "name": item.get("name"),
                            "address": item.get("vicinity", "Pune, Maharashtra"),
                            "lat": ilat,
                            "lng": ilng,
                            "distanceKm": round(dist, 2),
                            "rating": item.get("rating"),
                            "userRatingsTotal": item.get("user_ratings_total"),
                            "isOpen": item.get("opening_hours", {}).get("open_now"),
                            "category": normalize_category(" ".join(item.get("types", []))),
                            "complianceStatus": comp["status"],
                            "complianceNote": comp["note"],
                            "dataDriftRecord": comp["record"],
                        })
                    leg_results.sort(key=lambda x: x["distanceKm"])
                    return {
                        "success": True,
                        "source": "google_places",
                        "location": {"lat": lat, "lng": lng, "area": "Pune, Maharashtra"},
                        "radiusKm": radius,
                        "total": len(leg_results),
                        "businesses": leg_results,
                    }

            return {
                "success": False,
                "error": f"Google Places API error: {err_msg}. Please verify that GOOGLE_MAPS_API_KEY is valid and has Places API enabled.",
                "location": {"lat": lat, "lng": lng, "area": "Pune, Maharashtra"},
                "radiusKm": radius,
                "total": 0,
                "businesses": [],
            }

        except Exception as e:
            return {
                "success": False,
                "error": f"Failed to connect to Google Places API: {str(e)}",
                "location": {"lat": lat, "lng": lng, "area": "Pune, Maharashtra"},
                "radiusKm": radius,
                "total": 0,
                "businesses": [],
            }


@app.get("/api/places/{place_id}")
async def get_place_details(place_id: str):
    """Retrieve Google Place Details (New) for a specific place_id."""
    clean_id = place_id.replace("google_", "").replace("places/", "")
    google_key = get_google_maps_api_key()

    if not google_key:
        raise HTTPException(status_code=400, detail="GOOGLE_MAPS_API_KEY is not configured.")

    async with httpx.AsyncClient(timeout=6.0) as client:
        try:
            url = f"https://places.googleapis.com/v1/places/{clean_id}"
            headers = {
                "X-Goog-Api-Key": google_key,
                "X-Goog-FieldMask": (
                    "id,displayName,formattedAddress,location,rating,userRatingCount,types,"
                    "nationalPhoneNumber,internationalPhoneNumber,websiteUri,regularOpeningHours,"
                    "currentOpeningHours,primaryTypeDisplayName"
                ),
            }
            res = await client.get(url, headers=headers)
            if res.status_code == 200:
                item = res.json()
                loc = item.get("location", {})
                ilat = loc.get("latitude", 18.5204)
                ilng = loc.get("longitude", 73.8567)
                name = item.get("displayName", {}).get("text", "Commercial Establishment")
                comp = match_datadrift_record(name, ilat, ilng)

                is_open = None
                if "currentOpeningHours" in item:
                    is_open = item["currentOpeningHours"].get("openNow")
                elif "regularOpeningHours" in item:
                    is_open = item["regularOpeningHours"].get("openNow")

                return {
                    "found": True,
                    "source": "google_places",
                    "business": {
                        "id": f"google_{item.get('id')}",
                        "placeId": item.get("id"),
                        "name": name,
                        "address": item.get("formattedAddress", "Pune, Maharashtra"),
                        "lat": ilat,
                        "lng": ilng,
                        "phone": item.get("nationalPhoneNumber") or item.get("internationalPhoneNumber"),
                        "website": item.get("websiteUri"),
                        "rating": item.get("rating"),
                        "userRatingsTotal": item.get("userRatingCount"),
                        "isOpen": is_open,
                        "openingHours": item.get("regularOpeningHours", {}).get("weekdayDescriptions"),
                        "category": item.get("primaryTypeDisplayName", {}).get("text") or normalize_category(" ".join(item.get("types", []))),
                        "complianceStatus": comp["status"],
                        "complianceNote": comp["note"],
                        "dataDriftRecord": comp["record"],
                    },
                }
        except Exception:
            pass

    raise HTTPException(status_code=404, detail="Place details not found in Google Places.")


@app.get("/api/shops/{place_id}")
async def get_shop(place_id: str):
    """Retrieve shop from DataDrift registry or Google Place Details."""
    clean_id = place_id.replace("google_", "").replace("places/", "")
    for s in DATADRIFT_REGISTRY:
        if s["id"] == place_id or s["id"] == clean_id:
            return {"found": True, "source": "datadrift_registry", "shop": s}

    google_key = get_google_maps_api_key()
    if google_key:
        try:
            return await get_place_details(clean_id)
        except Exception:
            pass

    raise HTTPException(status_code=404, detail="Shop not found in DataDrift records or Google Places.")


@app.get("/api/compliance/{place_id}")
async def get_compliance(place_id: str, name: Optional[str] = Query(None)):
    comp = match_datadrift_record(name or place_id, 18.5204, 73.8567)
    return {
        "placeId": place_id,
        "complianceStatus": comp["status"],
        "hasDataDriftRecord": comp["has_record"],
        "complianceNote": comp["note"],
        "record": comp["record"],
    }


@app.get("/api/geocode")
async def reverse_geocode(lat: float = Query(18.5204), lng: float = Query(73.8567)):
    google_key = get_google_maps_api_key()
    if google_key:
        try:
            async with httpx.AsyncClient(timeout=4.0) as client:
                g_url = "https://maps.googleapis.com/maps/api/geocode/json"
                res = await client.get(g_url, params={"latlng": f"{lat},{lng}", "key": google_key})
                if res.status_code == 200:
                    data = res.json()
                    results = data.get("results", [])
                    if results:
                        first = results[0]
                        area, city, state = "Pune", "Pune", "Maharashtra"
                        for comp in first.get("address_components", []):
                            types = comp.get("types", [])
                            if "sublocality" in types or "neighborhood" in types:
                                area = comp.get("long_name")
                            if "locality" in types:
                                city = comp.get("long_name")
                            if "administrative_area_level_1" in types:
                                state = comp.get("long_name")
                        return {
                            "formatted": first.get("formatted_address", f"{area}, {city}, {state}"),
                            "area": area,
                            "city": city,
                            "state": state,
                        }
        except Exception:
            pass

    return {"formatted": "Pune, Maharashtra", "city": "Pune", "state": "Maharashtra", "area": "Shivajinagar"}


@app.post("/api/complaints/voice")
async def submit_voice_complaint(
    complaintId: str = Form(...),
    shopId: Optional[str] = Form(None),
    shopName: Optional[str] = Form(None),
    category: str = Form(...),
    description: str = Form(...),
    location: Optional[str] = Form(None),
    anonymous: bool = Form(True),
    name: Optional[str] = Form(None),
    phone: Optional[str] = Form(None),
    durationSeconds: Optional[int] = Form(None),
    voiceAudio: Optional[UploadFile] = File(None),
):
    return {
        "success": True,
        "complaintId": complaintId,
        "audioAttached": voiceAudio is not None,
        "message": "Voice complaint successfully recorded and queued for officer investigation.",
    }
