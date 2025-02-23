import { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const Map = ({ lat, lng }) => {
  useEffect(() => {
    const map = L.map("map", {
      center: [lat, lng],
      zoom: 13,
    });

    // Add the OpenStreetMap tile layer
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution:
        "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors",
    }).addTo(map);

    // Create a custom icon using L.icon()
    const customIcon = L.icon({
      iconUrl: "/assets/markLocation.png", // Update this path with your custom image
      iconSize: [40, 40], // Size of the icon (adjust based on your image)
      iconAnchor: [16, 32], // Anchor point of the icon (centered at the bottom)
      popupAnchor: [0, -32], // Adjust popup positioning if needed
    });

    // Add the custom marker with the custom icon
    L.marker([lat, lng], { icon: customIcon }).addTo(map);
  }, [lat, lng]);

  return (
    <section>
      <hr className="sec-line" />
      <h3>Location</h3>
      <div id="map" style={{ height: "400px", width: "100%" }}></div>
    </section>
  );
};

export default Map;
