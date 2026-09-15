/**
 * Geospatial utilities for NearHire
 */

const KNOWN_LOCATIONS = {
  'noida sector 62': { lat: 28.6280, lng: 77.3649, city: 'Noida', state: 'Uttar Pradesh' },
  'noida sector 18': { lat: 28.5708, lng: 77.3261, city: 'Noida', state: 'Uttar Pradesh' },
  'noida': { lat: 28.5355, lng: 77.3910, city: 'Noida', state: 'Uttar Pradesh' },
  'delhi connaught place': { lat: 28.6315, lng: 77.2167, city: 'New Delhi', state: 'Delhi' },
  'delhi': { lat: 28.6139, lng: 77.2090, city: 'New Delhi', state: 'Delhi' },
  'gurgaon cyber city': { lat: 28.4952, lng: 77.0895, city: 'Gurugram', state: 'Haryana' },
  'gurgaon': { lat: 28.4595, lng: 77.0266, city: 'Gurugram', state: 'Haryana' },
  'gurugram': { lat: 28.4595, lng: 77.0266, city: 'Gurugram', state: 'Haryana' },
  'ghaziabad': { lat: 28.6692, lng: 77.4538, city: 'Ghaziabad', state: 'Uttar Pradesh' },
  'ghaziabad raj nagar': { lat: 28.6836, lng: 77.4431, city: 'Ghaziabad', state: 'Uttar Pradesh' },
  'faridabad': { lat: 28.4089, lng: 77.3178, city: 'Faridabad', state: 'Haryana' },
  'greater noida': { lat: 28.4744, lng: 77.5040, city: 'Greater Noida', state: 'Uttar Pradesh' },
  'bangalore': { lat: 12.9716, lng: 77.5946, city: 'Bengaluru', state: 'Karnataka' },
  'hyderabad': { lat: 17.3850, lng: 78.4867, city: 'Hyderabad', state: 'Telangana' },
  'pune': { lat: 18.5204, lng: 73.8567, city: 'Pune', state: 'Maharashtra' },
  'mumbai': { lat: 19.0760, lng: 72.8777, city: 'Mumbai', state: 'Maharashtra' },
};

/**
 * Calculate Haversine distance between two coordinates in kilometers
 */
function calculateHaversineDistance(lat1, lon1, lat2, lon2) {
  if (!lat1 || !lon1 || !lat2 || !lon2) return null;
  const R = 6371; // Earth radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c;
  return Math.round(d * 10) / 10; // 1 decimal place, e.g. 2.4 km
}

/**
 * Convert km to radians for MongoDB $centerSphere query
 */
function kmToRadians(km) {
  const earthRadiusInKm = 6378.1;
  return km / earthRadiusInKm;
}

/**
 * Create valid GeoJSON Point from [longitude, latitude]
 */
function createGeoPoint(longitude, latitude) {
  const lng = parseFloat(longitude);
  const lat = parseFloat(latitude);
  if (isNaN(lng) || isNaN(lat)) {
    throw new Error(`Invalid coordinates: lon=${longitude}, lat=${latitude}`);
  }
  return {
    type: 'Point',
    coordinates: [lng, lat],
  };
}

/**
 * Resolve known location by name or partial text match
 */
function resolveKnownLocation(locationName) {
  if (!locationName) return null;
  const cleaned = locationName.toLowerCase().trim();
  for (const [key, val] of Object.entries(KNOWN_LOCATIONS)) {
    if (cleaned.includes(key) || key.includes(cleaned)) {
      return val;
    }
  }
  return null;
}

module.exports = {
  KNOWN_LOCATIONS,
  calculateHaversineDistance,
  kmToRadians,
  createGeoPoint,
  resolveKnownLocation,
};
