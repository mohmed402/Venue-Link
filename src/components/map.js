// import { useEffect } from "react";
// import L from "leaflet";
// import "leaflet/dist/leaflet.css";

// const Map = ({ lat, lng }) => {
//   useEffect(() => {
//     const map = L.map("map", {
//       center: [lat, lng],
//       zoom: 13,
//     });

//     // Add the OpenStreetMap tile layer
//     L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
//       attribution:
//         "&copy; <a href='https://www.openstreetmap.org/copyright'>OpenStreetMap</a> contributors",
//     }).addTo(map);

//     // Create a custom icon using L.icon()
//     const customIcon = L.icon({
//       iconUrl: "/assets/markLocation.png", // Update this path with your custom image
//       iconSize: [40, 40], // Size of the icon (adjust based on your image)
//       iconAnchor: [16, 32], // Anchor point of the icon (centered at the bottom)
//       popupAnchor: [0, -32], // Adjust popup positioning if needed
//     });

//     // Add the custom marker with the custom icon
//     L.marker([lat, lng], { icon: customIcon }).addTo(map);
//   }, [lat, lng]);

//   return (
//     <section>
//       <hr className="sec-line" />
//       <h3>Location</h3>
//       <div id="map" style={{ height: "400px", width: "100%" }}></div>
//     </section>
//   );
// };

import { useEffect } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const mapTilerKey = "cHKqnd6KwKh3g5Fs36zK";
const mapTilerMapID = "streets";
// const mapTilerMapID = "winter-v2";

const Map = ({ lat, lng }) => {
  useEffect(() => {
    const map = L.map("map", {
      center: [lat, lng],
      zoom: 13,
    });

    // MapTiler Tile Layer
    L.tileLayer(
      `https://api.maptiler.com/maps/${mapTilerMapID}/{z}/{x}/{y}.png?key=${mapTilerKey}`,
      {
        attribution:
          'Tiles &copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a> | Data &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }
    ).addTo(map);

    // Custom Marker Icon
    const customIcon = L.icon({
      iconUrl: "/assets/markLocation.png", // Replace with your custom icon URL
      iconSize: [32, 32],
      iconAnchor: [16, 32],
      popupAnchor: [0, -32],
    });

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
