import React, { useEffect, useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { Loader2 } from 'lucide-react';

// Fix for default marker icons in React-Leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconUrl: markerIcon,
  iconRetinaUrl: markerIcon2x,
  shadowUrl: markerShadow,
});

// Custom marker icons for different facility types
const createCustomIcon = (color: string) => {
  return L.divIcon({
    className: 'custom-marker',
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

const hospitalIcon = createCustomIcon('#EF4444'); // Red
const clinicIcon = createCustomIcon('#F59E0B'); // Orange
const pharmacyIcon = createCustomIcon('#8B5CF6'); // Purple
const userIcon = createCustomIcon('#0EA5E9'); // Blue

interface Facility {
  id: string;
  name: string;
  lat: number;
  lon: number;
  type: string;
  address?: string;
  tags?: any;
}

const HealthcareMap: React.FC = () => {
  const [currentLocation, setCurrentLocation] = useState({ lat: 17.3850, lon: 78.4867 }); // Hyderabad
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchRadius, setSearchRadius] = useState(5000);
  const [filterType, setFilterType] = useState<string>('all');
  const [searchArea, setSearchArea] = useState('');
  const [isSearchingArea, setIsSearchingArea] = useState(false);
  const mapRef = useRef<L.Map | null>(null);

  // Calculate distance between two coordinates (Haversine formula)
  const calculateDistance = (lat1: number, lon1: number, lat2: number, lon2: number): string => {
    const R = 6371; // Earth's radius in kilometers
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    if (distance < 1) {
      return `${Math.round(distance * 1000)} meters`;
    }
    return `${distance.toFixed(2)} km`;
  };

  // Fetch healthcare facilities from OpenStreetMap Overpass API
  // List of Overpass API instances to try
  const OVERPASS_INSTANCES = [
    'https://overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter',
    'https://lz4.overpass-api.de/api/interpreter',
  ];

  const fetchFacilities = async (location: { lat: number; lon: number }, radius = searchRadius) => {
    setLoading(true);
    setError(null);
    console.log('Fetching facilities for location:', location, 'with radius:', radius);

    const query = `
      [out:json][timeout:25];
      (
        node["amenity"="hospital"](around:${radius},${location.lat},${location.lon});
        node["amenity"="clinic"](around:${radius},${location.lat},${location.lon});
        node["amenity"="doctors"](around:${radius},${location.lat},${location.lon});
        node["amenity"="pharmacy"](around:${radius},${location.lat},${location.lon});
        way["amenity"="hospital"](around:${radius},${location.lat},${location.lon});
        way["amenity"="clinic"](around:${radius},${location.lat},${location.lon});
        way["amenity"="doctors"](around:${radius},${location.lat},${location.lon});
        way["amenity"="pharmacy"](around:${radius},${location.lat},${location.lon});
      );
      out center;
    `;

    let lastError;

    for (const instance of OVERPASS_INSTANCES) {
      try {
        console.log(`Trying Overpass instance: ${instance}`);
        const response = await fetch(instance, {
          method: 'POST',
          body: query,
        });

        if (!response.ok) {
          throw new Error(`Status ${response.status} ${response.statusText}`);
        }

        const data = await response.json();
        console.log('Overpass API response:', data);

        // Process the results
        const processedFacilities: Facility[] = data.elements.map((element: any) => {
          const lat = element.lat || element.center?.lat;
          const lon = element.lon || element.center?.lon;

          // Build comprehensive address
          let address = '';
          if (element.tags?.['addr:street']) {
            address = `${element.tags['addr:housenumber'] || ''} ${element.tags['addr:street']}`.trim();
            if (element.tags?.['addr:city']) {
              address += `, ${element.tags['addr:city']}`;
            }
          } else if (element.tags?.['addr:city']) {
            address = element.tags['addr:city'];
          } else if (element.tags?.['addr:suburb']) {
            address = element.tags['addr:suburb'];
          } else if (element.tags?.['addr:district']) {
            address = element.tags['addr:district'];
          }

          return {
            id: element.id.toString(),
            name: element.tags?.name || `${element.tags?.amenity || 'Healthcare Facility'}`,
            lat,
            lon,
            type: element.tags?.amenity || 'healthcare',
            address: address || undefined,
            tags: element.tags,
          };
        }).filter((f: Facility) => f.lat && f.lon); // Filter out any without coordinates

        console.log(`✅ Found ${processedFacilities.length} healthcare facilities using ${instance}`);
        setFacilities(processedFacilities);
        setLoading(false);
        return; // Success, exit function
      } catch (err) {
        console.warn(`Failed to fetch from ${instance}:`, err);
        lastError = err;
        // Continue to next instance
      }
    }

    // If we get here, all instances failed
    console.error('All Overpass instances failed:', lastError);
    setError(`Failed to load healthcare facilities: ${lastError instanceof Error ? lastError.message : 'Unknown error'}`);
    setLoading(false);
  };

  // Filter facilities based on selected type
  const filteredFacilities = filterType === 'all'
    ? facilities
    : facilities.filter(f => f.type === filterType);

  // Handle search radius change
  const handleRadiusChange = (newRadius: number) => {
    setSearchRadius(newRadius);
    fetchFacilities(currentLocation, newRadius);
  };

  // Get user location on mount
  useEffect(() => {
    const getUserLocation = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userLocation = {
              lat: position.coords.latitude,
              lon: position.coords.longitude,
            };
            console.log('✅ User location obtained:', userLocation);
            setCurrentLocation(userLocation);
            fetchFacilities(userLocation);
          },
          (error) => {
            console.log('⚠️ Location access denied:', error.message);
            console.log('Using default location: Hyderabad');
            // Use default location (Hyderabad)
            fetchFacilities({ lat: 17.3850, lon: 78.4867 });
          }
        );
      } else {
        console.log('⚠️ Geolocation not supported');
        console.log('Using default location: Hyderabad');
        // Use default location (Hyderabad)
        fetchFacilities({ lat: 17.3850, lon: 78.4867 });
      }
    };

    getUserLocation();
  }, []); // Empty dependency array - only run once on mount

  // Get appropriate icon based on facility type
  const getIcon = (type: string) => {
    switch (type) {
      case 'hospital':
        return hospitalIcon;
      case 'clinic':
      case 'doctors':
        return clinicIcon;
      case 'pharmacy':
        return pharmacyIcon;
      default:
        return clinicIcon;
    }
  };

  return (
    <div className="relative w-full h-[600px] rounded-lg overflow-hidden shadow-lg">
      {/* Search Controls */}
      <div className="absolute top-4 left-1/2 transform -translate-x-1/2 bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-lg z-[1000] w-[90%] max-w-2xl">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Radius */}
          <div className="flex-1">
            <label className="text-xs font-semibold text-gray-700 block mb-1">Search Radius</label>
            <select
              value={searchRadius}
              onChange={(e) => handleRadiusChange(Number(e.target.value))}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value={1000}>1 km</option>
              <option value={2000}>2 km</option>
              <option value={5000}>5 km</option>
              <option value={10000}>10 km</option>
              <option value={15000}>15 km</option>
            </select>
          </div>

          {/* Filter by Type */}
          <div className="flex-1">
            <label className="text-xs font-semibold text-gray-700 block mb-1">Filter Type</label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Facilities</option>
              <option value="hospital">Hospitals</option>
              <option value="clinic">Clinics</option>
              <option value="doctors">Doctors</option>
              <option value="pharmacy">Pharmacies</option>
            </select>
          </div>

          {/* Results Count */}
          <div className="flex items-end">
            <div className="px-3 py-2 bg-blue-50 border border-blue-200 rounded-md text-sm font-semibold text-blue-700">
              {filteredFacilities.length} found
            </div>
          </div>
        </div>
      </div>

      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-background/80 backdrop-blur-sm z-[1000]">
          <div className="text-center">
            <Loader2 className="w-8 h-8 animate-spin text-primary mx-auto" />
            <p className="text-sm text-muted-foreground mt-2">Searching for healthcare facilities...</p>
          </div>
        </div>
      )}

      {error && (
        <div className="absolute top-24 left-1/2 transform -translate-x-1/2 bg-red-100 border border-red-400 text-red-800 px-4 py-2 rounded-lg shadow-lg z-[1000] max-w-md text-sm">
          {error}
        </div>
      )}

      <MapContainer
        center={[currentLocation.lat, currentLocation.lon]}
        zoom={13}
        style={{ height: '100%', width: '100%' }}
        scrollWheelZoom={true}
        ref={mapRef}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {/* User Location Marker */}
        <Marker position={[currentLocation.lat, currentLocation.lon]} icon={userIcon}>
          <Popup>
            <div className="text-center">
              <strong>Your Location</strong>
            </div>
          </Popup>
        </Marker>

        {/* Healthcare Facility Markers */}
        {filteredFacilities.map((facility) => (
          <Marker
            key={facility.id}
            position={[facility.lat, facility.lon]}
            icon={getIcon(facility.type)}
          >
            <Popup>
              <div className="p-1 min-w-[200px]">
                <h3 className="font-semibold text-sm mb-1">{facility.name}</h3>
                <p className="text-xs text-gray-500 capitalize mb-2">
                  <span className="inline-block w-2 h-2 rounded-full mr-1"
                    style={{ backgroundColor: facility.type === 'hospital' ? '#EF4444' : facility.type === 'pharmacy' ? '#8B5CF6' : '#F59E0B' }}>
                  </span>
                  {facility.type}
                </p>

                {/* Distance */}
                <div className="text-xs text-blue-600 font-semibold mb-2">
                  📍 {calculateDistance(currentLocation.lat, currentLocation.lon, facility.lat, facility.lon)} away
                </div>

                {/* Address or Coordinates */}
                {facility.address ? (
                  <p className="text-xs text-gray-600 mb-2">
                    <span className="font-semibold">Address:</span> {facility.address}
                  </p>
                ) : (
                  <p className="text-xs text-gray-500 mb-2">
                    <span className="font-semibold">Coordinates:</span> {facility.lat.toFixed(6)}, {facility.lon.toFixed(6)}
                  </p>
                )}

                {/* Contact Information */}
                {(facility.tags?.phone || facility.tags?.website || facility.tags?.opening_hours || facility.tags?.email || facility.tags?.emergency === 'yes') && (
                  <div className="border-t pt-2 mt-2 space-y-1">
                    {facility.tags?.phone && (
                      <p className="text-xs text-gray-700">
                        <span className="font-semibold">📞 Phone:</span> {facility.tags.phone}
                      </p>
                    )}
                    {facility.tags?.website && (
                      <div className="text-xs">
                        <span className="font-semibold">🌐 Website:</span>{' '}
                        <a
                          href={facility.tags.website.startsWith('http') ? facility.tags.website : `https://${facility.tags.website}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          Visit Site
                        </a>
                      </div>
                    )}
                    {facility.tags?.opening_hours && (
                      <p className="text-xs text-green-700">
                        <span className="font-semibold">🕐 Hours:</span> {facility.tags.opening_hours}
                      </p>
                    )}
                    {facility.tags?.email && (
                      <p className="text-xs text-gray-700">
                        <span className="font-semibold">✉️ Email:</span> {facility.tags.email}
                      </p>
                    )}
                    {facility.tags?.emergency === 'yes' && (
                      <p className="text-xs text-red-600 font-semibold">
                        🚨 Emergency Services Available
                      </p>
                    )}
                  </div>
                )}
              </div>
            </Popup>
          </Marker>
        ))}
      </MapContainer>

      {/* Legend */}
      <div className="absolute bottom-4 left-4 bg-white/95 backdrop-blur-sm p-3 rounded-lg shadow-lg text-xs z-[1000]">
        <div className="flex flex-col gap-2">
          <div className="font-semibold mb-1 text-sm">Healthcare Facilities</div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#EF4444]"></div>
            <span>Hospitals</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#F59E0B]"></div>
            <span>Clinics & Doctors</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#8B5CF6]"></div>
            <span>Pharmacies</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[#0EA5E9]"></div>
            <span>Your Location</span>
          </div>
          {facilities.length > 0 && (
            <div className="text-xs text-gray-500 mt-2 pt-2 border-t">
              Total: {facilities.length} | Showing: {filteredFacilities.length}
            </div>
          )}
          {facilities.length === 0 && !loading && (
            <div className="text-xs text-yellow-600 mt-2 pt-2 border-t">
              No facilities found nearby
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default HealthcareMap;