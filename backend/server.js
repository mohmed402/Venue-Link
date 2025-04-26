const express = require("express");
const cors = require("cors");

require("dotenv").config();
const supabase = require("./supabaseClient");
const app = express();
const PORT = process.env.PORT || 5001;


const corsOptions = {
  origin: [
    "http://localhost:3000",
    `${process.env.NEXT_PUBLIC_DOMAIN_URL}`,
  ],
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};


app.use(cors(corsOptions));

// Middleware
app.use(express.json()); // Parses JSON request bodies
// app.use(cors()); // Enables CORS

const userTable = require("./routes/userTable");
const authRoutes = require("./routes/authRoutes");
const geoNames = require("./routes/geoNames");
const geoLocationRoute = require("./routes/geoLocation");
const uploadData = require("./routes/uploadData");
const getData = require("./routes/getData");
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

app.use("/api/upload", uploadData);

app.use("/api/data", getData);

// Start Server
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
