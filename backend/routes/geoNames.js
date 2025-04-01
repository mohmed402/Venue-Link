const express = require("express");
const fetch = require("node-fetch"); // Import node-fetch for backend requests
require("dotenv").config();

const router = express.Router();
const GEONAMES_USERNAME = process.env.GEONAMES_USERNAME;

router.get("/cities", async (req, res) => {
  const { country } = req.query;

  if (!country) {
    return res.status(400).json({ error: "Country is required" });
  }

  try {
    const response = await fetch(
      `http://api.geonames.org/searchJSON?country=${country}&featureClass=P&maxRows=15&username=${GEONAMES_USERNAME}`
    );

    if (!response.ok) {
      const errorData = await response.text(); // Get the response body if error occurs
      console.log("GeoNames API error response:", errorData);
      throw new Error(`Failed to fetch data: ${errorData}`);
    }

    const data = await response.json();
    res.json({ cities: data.geonames.map((city) => city.name) });
  } catch (error) {
    console.error("Error fetching cities:", error.message);
    res.status(500).json({ error: "Failed to fetch cities" });
  }
});

module.exports = router;
