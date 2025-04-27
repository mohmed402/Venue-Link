const express = require("express");
const cors = require("cors");

require("dotenv").config();
const supabase = require("./supabaseClient");
const app = express();
const PORT = process.env.PORT || 5001;



app.use(cors());

// Middleware
app.use(express.json()); 


const userTable = require("./routes/userTable");
const authRoutes = require("./routes/authRoutes");
const geoNames = require("./routes/geoNames");
const geoLocationRoute = require("./routes/geoLocation");
const uploadData = require("./routes/uploadData");
const getData = require("./routes/getData");

app.get("/", (req, res) => {
  res.send("Backend is running 🚀");
});



app.use("/users", userTable);

app.use("/auth", authRoutes);

app.use("/api", geoNames);

app.use("/api/geolocation", geoLocationRoute);

app.use("/api/upload", uploadData);

app.use("/api/data", getData);


app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
