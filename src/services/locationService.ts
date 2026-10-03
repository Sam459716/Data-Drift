// Location Service — wraps navigator.geolocation.
// Swap the implementation for a production provider without touching UI code.

export interface GeoPosition {
  lat: number;
  lng: number;
  accuracy: number; // metres
  timestamp: number;
}

export type GeoError = "denied" | "unavailable" | "timeout";

export interface LocationResult {
  position?: GeoPosition;
  error?: GeoError;
}

export async function getCurrentLocation(): Promise<LocationResult> {
  if (!navigator.geolocation) {
    return { error: "unavailable" };
  }

  return new Promise(resolve => {
    navigator.geolocation.getCurrentPosition(
      pos => {
        resolve({
          position: {
            lat: pos.coords.latitude,
            lng: pos.coords.longitude,
            accuracy: pos.coords.accuracy,
            timestamp: pos.timestamp,
          },
        });
      },
      err => {
        const map: Record<number, GeoError> = {
          1: "denied",
          2: "unavailable",
          3: "timeout",
        };
        resolve({ error: map[err.code] ?? "unavailable" });
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  });
}

export function watchLocation(
  onUpdate: (pos: GeoPosition) => void,
  onError: (err: GeoError) => void
): () => void {
  if (!navigator.geolocation) {
    onError("unavailable");
    return () => {};
  }
  const id = navigator.geolocation.watchPosition(
    pos =>
      onUpdate({
        lat: pos.coords.latitude,
        lng: pos.coords.longitude,
        accuracy: pos.coords.accuracy,
        timestamp: pos.timestamp,
      }),
    err => {
      const map: Record<number, GeoError> = { 1: "denied", 2: "unavailable", 3: "timeout" };
      onError(map[err.code] ?? "unavailable");
    },
    { enableHighAccuracy: true }
  );
  return () => navigator.geolocation.clearWatch(id);
}

export function formatAccuracy(metres: number): string {
  return metres < 50 ? `±${Math.round(metres)} m` : `±${(metres / 1000).toFixed(1)} km`;
}
