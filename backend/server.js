const express = require("express");
const cors = require("cors");

require("dotenv").config();
const supabase = require("./supabaseClient");
const app = express();
const PORT = process.env.PORT || 5001;

// Allow requests from your frontend (http://localhost:3000)
const corsOptions = {
  origin: "http://localhost:3000", // Allow requests only from this origin
  methods: "GET,POST", // Allowed request methods
  allowedHeaders: "Content-Type,Authorization", // Allowed headers
};

app.use(cors(corsOptions));

// Middleware
app.use(express.json()); // Parses JSON request bodies
// app.use(cors()); // Enables CORS

const userTable = require("./routes/userTable");
const authRoutes = require("./routes/authRoutes");
const geoNames = require("./routes/geoNames");
const geoLocationRoute = require("./routes/geoLocation");
// Sample Route
app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});
app.get("/name", (req, res) => {
  res.send("My name is muhmmad 🚀");
});

// Use the geoLocation route

app.use("/users", userTable);

app.use("/auth", authRoutes);

app.use("/api", geoNames);

app.use("/api/geolocation", geoLocationRoute);

// Start Server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
