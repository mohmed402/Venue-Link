const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient"); // Adjust path if necessary

// Define your GET route
router.get("/c", async (req, res) => {
  const { data, error } = await supabase.from("users").select("*");

  if (error) return res.status(500).json({ error: error.message });

  res.json(data);
});

module.exports = router;
