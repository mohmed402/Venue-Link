const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient");

router.get("/venues", async (req, res) => {
  const { data, error } = await supabase.from("venues").select("*");

  if (error) return res.status(500).json({ error: error.message });

  res.json(data);
});

router.get("/venueById", async (req, res) => {
  const venueId = req.query.venueId;

  const { data, error } = await supabase
    .from("venues")
    .select("*")
    .eq("venue_id", venueId);
  if (error) return res.status(500).json({ error: error.message });

  res.json(data);
});

router.get("/imageById", async (req, res) => {
  const venueId = req.query.venueId;

  const { data, error } = await supabase
    .from("images")
    .select("*")
    .eq("venue_id", venueId);
  if (error) return res.status(500).json({ error: error.message });

  res.json({ data });
});

router.get("/updateStateById", async (req, res) => {
  const venueId = req.query.venueId;
  const status = req.query.status;

  if (!venueId || !status) {
    return res.status(400).json({ error: "venueId and status are required" });
  }

  try {
    const { data, error } = await supabase
      .from("venues")
      .update({ status: status })
      .eq("venue_id", venueId)
      .select();

    if (error) return res.status(500).json({ error: error.message });

    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
// router.get("/deleteVenueById", async (req, res) => {
//   try {
//     const { error } = await supabase
//       .from("venues")
//       .delete()
//       .eq("venue_id", venueId);

//     if (error) return res.status(500).json({ error: error.message });
//   } catch (err) {
//     res.status(500).json({ error: err.message });
//   }
// });

module.exports = router;
