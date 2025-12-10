import { useState, useEffect, useRef } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Ambulance, MapPin, Clock, Hospital, X, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for default marker icons in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface Hospital {
  id: string;
  name: string;
  lat: number;
  lon: number;
  distance: number;
}

interface AmbulancePosition {
  lat: number;
  lon: number;
}


interface AmbulanceTrackingProps {
  onBack?: () => void;
  onCancel?: () => void;
}

const AmbulanceTracking = ({ onBack, onCancel }: AmbulanceTrackingProps) => {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [ambulanceLocation, setAmbulanceLocation] = useState<AmbulancePosition | null>(null);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [eta, setEta] = useState(12);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState("Dispatching ambulance...");
  const [isCancelled, setIsCancelled] = useState(false);
  const [locationAccuracy, setLocationAccuracy] = useState<number | null>(null);
  const isLowAccuracy = locationAccuracy !== null && locationAccuracy > 1000;
  const watchIdRef = useRef<number | null>(null);
  const hasLocationRef = useRef(false);

  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const ambulanceMarkerRef = useRef<L.Marker | null>(null);
  const hospitalLayerRef = useRef<L.LayerGroup | null>(null);
  const userCircleRef = useRef<L.Circle | null>(null);

  // Get user location with high accuracy and continuous tracking
  useEffect(() => {
    if (!navigator.geolocation) {
      console.error("Geolocation is not supported by this browser");
      const defaultPos: [number, number] = [28.6139, 77.2090]; // Delhi
      setUserLocation(defaultPos);
      setAmbulanceLocation({
        lat: defaultPos[0] + 0.03,
        lon: defaultPos[1] + 0.03,
      });
      setLoading(false);
      return;
    }

    const geoOptions = {
      enableHighAccuracy: true,
      timeout: 15000,
      maximumAge: 0
    };

    // Use watchPosition for continuous tracking
    watchIdRef.current = navigator.geolocation.watchPosition(
      (position) => {
        const userPos: [number, number] = [
          position.coords.latitude,
          position.coords.longitude,
        ];
        
        const accuracy = position.coords.accuracy;
        setLocationAccuracy(accuracy);
        
        console.log("Location updated:", {
          lat: userPos[0],
          lon: userPos[1],
          accuracy: `${accuracy.toFixed(0)} meters`,
          timestamp: new Date(position.timestamp).toISOString()
        });
        
        setUserLocation(userPos);
        hasLocationRef.current = true;
        
        // Set initial ambulance location only on first load
        if (!ambulanceLocation) {
          const distance = 0.03; // ~3km in degrees
          setAmbulanceLocation({
            lat: userPos[0] + distance,
            lon: userPos[1] + distance,
          });
        }
        
        setLoading(false);
      },
      (error) => {
        console.error("Geolocation error:", error.message);
        let errorMessage = "Location error: ";
        switch(error.code) {
          case error.PERMISSION_DENIED:
            errorMessage += "Please allow location access in your browser settings";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage += "Location information unavailable. Please check your GPS";
            break;
          case error.TIMEOUT:
            errorMessage += "Location request timed out. Retrying...";
            break;
          default:
            errorMessage += "Unknown error occurred";
        }
        console.error(errorMessage);
        
        // Only fall back to default location if we never got a valid fix
        if (!hasLocationRef.current) {
          const defaultPos: [number, number] = [28.6139, 77.2090]; // Delhi
          setUserLocation(defaultPos);
          if (!ambulanceLocation) {
            setAmbulanceLocation({
              lat: defaultPos[0] + 0.03,
              lon: defaultPos[1] + 0.03,
            });
          }
        }
        setLoading(false);
      },
      geoOptions
    );

    // Cleanup: stop watching position when component unmounts
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // Initialize and update Leaflet map when user location is available
  useEffect(() => {
    if (!userLocation || !mapContainerRef.current) return;

    if (!mapRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: userLocation,
        zoom: 13,
        zoomControl: true,
      });

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      }).addTo(map);

      mapRef.current = map;
    } else {
      mapRef.current.setView(userLocation, 13);
    }

    if (mapRef.current) {
      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng(userLocation);
      } else {
        userMarkerRef.current = L.marker(userLocation, { icon: userIcon }).addTo(
          mapRef.current
        );
        userMarkerRef.current.bindPopup("Your Location");
      }

      if (userCircleRef.current) {
        userCircleRef.current.setLatLng(userLocation);
      } else {
        userCircleRef.current = L.circle(userLocation, {
          radius: 200,
          color: "#3b82f6",
          fillColor: "#3b82f6",
          fillOpacity: 0.1,
        }).addTo(mapRef.current);
      }
    }
  }, [userLocation]);

  // Fetch nearby hospitals using Overpass API
  useEffect(() => {
    if (!userLocation) return;

    const fetchHospitals = async () => {
      try {
        const [lat, lon] = userLocation;
        const radius = 5000; // 5km radius
        
        const query = `
          [out:json];
          (
            node["amenity"="hospital"](around:${radius},${lat},${lon});
            way["amenity"="hospital"](around:${radius},${lat},${lon});
          );
          out center 10;
        `;

        const response = await fetch(
          `https://overpass-api.de/api/interpreter?data=${encodeURIComponent(query)}`
        );
        
        const data = await response.json();
        
        const hospitalList: Hospital[] = data.elements
          .map((element: any) => {
            const hospitalLat = element.lat || element.center?.lat;
            const hospitalLon = element.lon || element.center?.lon;
            
            if (!hospitalLat || !hospitalLon) return null;
            
            // Calculate distance
            const distance = Math.sqrt(
              Math.pow(lat - hospitalLat, 2) + Math.pow(lon - hospitalLon, 2)
            ) * 111; // Convert to km (approximate)
            
            return {
              id: element.id.toString(),
              name: element.tags?.name || "Hospital",
              lat: hospitalLat,
              lon: hospitalLon,
              distance: parseFloat(distance.toFixed(1)),
            };
          })
          .filter((h: Hospital | null) => h !== null)
          .sort((a: Hospital, b: Hospital) => a.distance - b.distance)
          .slice(0, 5);

        setHospitals(hospitalList);
      } catch (error) {
        console.error("Error fetching hospitals:", error);
        // Add some default hospitals if API fails
        setHospitals([
          {
            id: "1",
            name: "City General Hospital",
            lat: userLocation[0] + 0.01,
            lon: userLocation[1] + 0.01,
            distance: 1.2,
          },
          {
            id: "2",
            name: "Emergency Medical Center",
            lat: userLocation[0] - 0.015,
            lon: userLocation[1] + 0.015,
            distance: 2.1,
          },
        ]);
      }
    };

    fetchHospitals();
  }, [userLocation]);

  // Simulate ambulance movement
  useEffect(() => {
    if (!userLocation || !ambulanceLocation || isCancelled) return;

    const interval = setInterval(() => {
      setAmbulanceLocation((prev) => {
        if (!prev || !userLocation) return prev;

        // Calculate direction to user
        const latDiff = userLocation[0] - prev.lat;
        const lonDiff = userLocation[1] - prev.lon;
        
        // Move ambulance towards user (0.0005 degrees per second ~= 55m/s ~= 200km/h)
        const step = 0.0003;
        const distance = Math.sqrt(latDiff * latDiff + lonDiff * lonDiff);
        
        if (distance < 0.001) {
          setStatus("Ambulance arrived!");
          setEta(0);
          clearInterval(interval);
          return prev;
        }

        return {
          lat: prev.lat + (latDiff / distance) * step,
          lon: prev.lon + (lonDiff / distance) * step,
        };
      });

      // Update ETA
      setEta((prev) => {
        const newEta = Math.max(0, prev - 0.2);
        if (newEta > 5) {
          setStatus("Ambulance en route");
        } else if (newEta > 2) {
          setStatus("Ambulance nearby");
        } else if (newEta > 0) {
          setStatus("Ambulance arriving");
        }
        return newEta;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [userLocation, ambulanceLocation, isCancelled]);

  const handleCancelAmbulance = () => {
    setIsCancelled(true);
    setStatus("Emergency cancelled");
    if (onCancel) {
      onCancel();
    }
  };

  useEffect(() => {
    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
      }
      mapRef.current = null;
      userMarkerRef.current = null;
      ambulanceMarkerRef.current = null;
      hospitalLayerRef.current = null;
      userCircleRef.current = null;
    };
  }, []);

  // Custom icons
  const ambulanceIcon = L.divIcon({
    html: `<div style="color: #ef4444; font-size: 32px;">🚑</div>`,
    className: "custom-icon",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
  });

  const userIcon = L.divIcon({
    html: `<div style="color: #3b82f6; font-size: 32px;">📍</div>`,
    className: "custom-icon",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
  });

  const hospitalIcon = L.divIcon({
    html: `<div style="color: #10b981; font-size: 28px;">🏥</div>`,
    className: "custom-icon",
    iconSize: [28, 28],
    iconAnchor: [14, 14],
  });

  useEffect(() => {
    if (!mapRef.current || !ambulanceLocation) return;

    const position: [number, number] = [
      ambulanceLocation.lat,
      ambulanceLocation.lon,
    ];

    if (ambulanceMarkerRef.current) {
      ambulanceMarkerRef.current.setLatLng(position);
    } else {
      ambulanceMarkerRef.current = L.marker(position, {
        icon: ambulanceIcon,
      }).addTo(mapRef.current);
      ambulanceMarkerRef.current.bindPopup("Ambulance");
    }
  }, [ambulanceLocation]);

  useEffect(() => {
    if (!mapRef.current || hospitals.length === 0) return;

    if (!hospitalLayerRef.current) {
      hospitalLayerRef.current = L.layerGroup().addTo(mapRef.current);
    } else {
      hospitalLayerRef.current.clearLayers();
    }

    hospitals.forEach((hospital) => {
      const marker = L.marker([hospital.lat, hospital.lon], {
        icon: hospitalIcon,
      }).addTo(hospitalLayerRef.current!);
      marker.bindPopup(`${hospital.name} (${hospital.distance} km away)`);
    });
  }, [hospitals]);

  if (loading || !userLocation) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emergency"></div>
        </div>
        <p className="text-center text-muted-foreground mt-4">
          Getting your location...
        </p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {/* Back Button */}
      {onBack && (
        <Button
          variant="outline"
          onClick={onBack}
          className="mb-2"
        >
          <X className="h-4 w-4 mr-2" />
          Back to Emergency Menu
        </Button>
      )}

      {/* Status Header */}
      <Card className="p-4 bg-emergency/10 border-emergency/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="h-12 w-12 rounded-full bg-emergency flex items-center justify-center animate-pulse">
              <Ambulance className="h-6 w-6 text-emergency-foreground" />
            </div>
            <div>
              <h3 className="font-bold text-lg">{status}</h3>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                <span>ETA: {eta > 0 ? `${eta.toFixed(0)} minutes` : "Arrived"}</span>
              </div>
              {locationAccuracy && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <MapPin className="h-3 w-3" />
                  <span>Accuracy: ±{locationAccuracy.toFixed(0)}m</span>
                </div>
              )}
              {isLowAccuracy && (
                <p className="mt-1 text-xs text-warning">
                  Your device is only providing approximate location. Turn on precise GPS/location for better accuracy.
                </p>
              )}
            </div>
          </div>
          {!isCancelled && eta > 0 ? (
            <Badge variant="destructive" className="animate-pulse">
              Live
            </Badge>
          ) : isCancelled ? (
            <Badge variant="secondary">Cancelled</Badge>
          ) : (
            <Badge variant="default">Arrived</Badge>
          )}
        </div>
      </Card>

      {/* Cancel Button */}
      {!isCancelled && eta > 0 && (
        <Card className="p-4 bg-warning-light border-warning/20">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <XCircle className="h-5 w-5 text-warning" />
              <div>
                <p className="font-medium">Cancel Emergency</p>
                <p className="text-sm text-muted-foreground">
                  Stop the ambulance if situation is resolved
                </p>
              </div>
            </div>
            <Button
              variant="destructive"
              onClick={handleCancelAmbulance}
            >
              Cancel
            </Button>
          </div>
        </Card>
      )}

      <Card className="p-4">
        <div className="h-[500px] w-full rounded-lg overflow-hidden">
          <div ref={mapContainerRef} className="h-full w-full" />
        </div>
      </Card>

      {/* Nearby Hospitals List */}
      {hospitals.length > 0 && (
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Hospital className="h-5 w-5 text-success" />
            <h3 className="font-semibold">Nearby Hospitals</h3>
          </div>
          <div className="space-y-2">
            {hospitals.map((hospital, index) => (
              <div
                key={hospital.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-muted-foreground">
                    {index + 1}
                  </span>
                  <div>
                    <p className="font-medium">{hospital.name}</p>
                    <p className="text-sm text-muted-foreground">
                      {hospital.distance} km away
                    </p>
                  </div>
                </div>
                <MapPin className="h-5 w-5 text-success" />
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};

export default AmbulanceTracking; 