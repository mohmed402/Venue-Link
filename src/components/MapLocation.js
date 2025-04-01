import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import useFetchGeolocation from "../hooks/useFetchGeolocation";
import MapUpdater from "./MapUpdater";
import L from "leaflet";

// Dynamically import Leaflet components (client-only)
const MapContainer = dynamic(
  () => import("react-leaflet").then((mod) => mod.MapContainer),
  { ssr: false }
);
const TileLayer = dynamic(
  () => import("react-leaflet").then((mod) => mod.TileLayer),
  { ssr: false }
);
const Marker = dynamic(
  () => import("react-leaflet").then((mod) => mod.Marker),
  { ssr: false }
);
const Popup = dynamic(() => import("react-leaflet").then((mod) => mod.Popup), {
  ssr: false,
});

const MapLocation = ({ country, city, handleClick }) => {
  const defaultPosition = [32.8922194, 13.1730786]; // Tripoli fallback
  const [position, setPosition] = useState(defaultPosition);
  const [address, setAddress] = useState("Fetching address...");
  const [loading, setLoading] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const { location, error } = useFetchGeolocation(`${country} ${city}`);

  const mapTilerAPIKey = "cHKqnd6KwKh3g5Fs36zK";

  const customIcon = L.icon({
    iconUrl: "/assets/markLocation.png", // path to image in /public
    iconSize: [42, 48], // size of the icon
    iconAnchor: [16, 48], // point of the icon which will correspond to marker's location
    popupAnchor: [0, -48], // where popup opens relative to iconAnchor
  });
  // Client-side only
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Set position from geolocation
  useEffect(() => {
    if (location?.lat && location?.lon) {
      setPosition([location.lat, location.lon]);
    }
  }, [location]);

  // Reverse geocode for address
  const fetchAddress = async (lat, lon) => {
    setLoading(true);
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
      );
      const data = await res.json();
      setAddress(data.display_name || "Address not found");
    } catch {
      setAddress("Failed to fetch address");
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchAddress(position[0], position[1]);
  }, [position]);

  const handleMapClick = (e) => {
    const { lat, lng } = e.latlng;
    setPosition([lat, lng]);
    fetchAddress(lat, lng);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(`${address}\nLat: ${position[0]}, Lng: ${position[1]}`);
    handleClick([
      {
        address: address,
        lat: position[0],
        lng: position[1],
      },
    ]);
  };

  if (!isClient) return <p>Loading map...</p>;

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h2>Is the pin in the right spot?</h2>
      <p>{loading ? "Fetching address..." : address}</p>
      <div
        style={{
          width: "100%",
          height: "400px",
          borderRadius: "10px",
          overflow: "hidden",
        }}
      >
        <MapContainer
          center={position}
          zoom={15}
          style={{ width: "100%", height: "100%" }}
          onClick={handleMapClick}
        >
          <MapUpdater position={position} />
          <TileLayer
            url={`https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=${mapTilerAPIKey}`}
            attribution='&copy; <a href="https://www.maptiler.com/copyright">MapTiler</a>'
          />
          <Marker
            position={position}
            icon={customIcon}
            draggable={true}
            eventHandlers={{
              dragend: (e) => {
                const newPos = e.target.getLatLng();
                setPosition([newPos.lat, newPos.lng]);
                fetchAddress(newPos.lat, newPos.lng);
              },
            }}
          >
            <Popup>{address}</Popup>
          </Marker>
        </MapContainer>
      </div>
      <form onSubmit={handleSubmit} style={{ marginTop: "10px" }}>
        <button
          type="submit"
          style={{ padding: "10px 20px", fontSize: "16px", cursor: "pointer" }}
        >
          Save Location
        </button>
      </form>
    </div>
  );
};

export default MapLocation;
