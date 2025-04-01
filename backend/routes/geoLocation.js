// const express = require("express");
// const fetch = require("node-fetch");
// const router = express.Router();
// require("dotenv").config();

// const RAPIDAPIKEY = process.env.RAPID_API;
// // Your RapidAPI URL and options
// const url =
//   "https://address-from-to-latitude-longitude.p.rapidapi.com/geolocationapi?address=LY%20Al%20Bay%E1%B8%91%C4%81%E2%80%99";
// const options = {
//   method: "GET",
//   headers: {
//     "x-rapidapi-key": RAPIDAPIKEY, // Make sure to keep this secure in production (use env vars)
//     "x-rapidapi-host": "address-from-to-latitude-longitude.p.rapidapi.com",
//   },
// };

// // Route to fetch geolocation data
// router.get("/", async (req, res) => {
//   console.log("here");
//   try {
//     const { address } = req.query;
//     console.log("Received address:", address); // Debugging log

//     // Your geolocation logic goes here...
//     if (!address) {
//       return res.status(400).json({ error: "Address parameter is missing" });
//     }

//     // Call your geolocation API or logic to fetch the geolocation
//     const geolocation = await fetchGeolocation(address);

//     return res.json(geolocation);
//   } catch (error) {
//     console.error("Error fetching geolocation:", error);
//     res.status(500).json({ error: "Internal Server Error" });
//   }
// });

// const fetchGeolocation = async (address) => {
//   // Assuming you are using OpenStreetMap's Nominatim API
//   const osmUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
//     address
//   )}&format=json&addressdetails=1&limit=1`;

//   const response = await fetch(osmUrl);
//   const data = await response.json();

//   if (!data || data.length === 0) {
//     throw new Error("Geolocation not found for the address");
//   }

//   const { lat, lon } = data[0];
//   return { lat, lon }; // Return the latitude and longitude
// };

// module.exports = router;
// backend/routes/geoLocation.js
const express = require("express");
const fetch = require("node-fetch"); // Importing fetch for server-side usage

const router = express.Router();

// Handle geolocation request
router.get("/", async (req, res) => {
  const { address } = req.query;

  if (!address) {
    return res.status(400).json({ error: "Address is required" });
  }

  try {
    const geolocationData = await fetchGeolocation(address);
    res.json(geolocationData); // Send the latitude and longitude to the frontend
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Function to fetch geolocation data
const fetchGeolocation = async (address) => {
  // Assuming you are using OpenStreetMap's Nominatim API
  const osmUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
    address
  )}&format=json&addressdetails=1&limit=1`;

  const response = await fetch(osmUrl);
  const data = await response.json();

  if (!data || data.length === 0) {
    throw new Error("Geolocation not found for the address");
  }

  const { lat, lon } = data[0];
  return { lat, lon }; // Return the latitude and longitude
};

module.exports = router;
