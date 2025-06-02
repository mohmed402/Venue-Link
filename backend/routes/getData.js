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
    .eq("venue_id", venueId)
    .single();
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

router.get('/reviews/:venueId', async (req, res) => {
  const venueId = parseInt(req.params.venueId);

  if (isNaN(venueId)) {
    return res.status(400).json({ error: 'Invalid venue ID' });
  }

  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .eq('venue_id', venueId)
    .order('review_date', { ascending: false });

  if (error) {
    console.error('Error fetching reviews:', error);
    return res.status(500).json({ error: 'Failed to fetch reviews' });
  }

  res.json(data);
});

// Get venue pricing
router.get("/venue-pricing/:venueId", async (req, res) => {
  const { venueId } = req.params;

  try {
    const { data: pricingData, error } = await supabase
      .from("venue_pricing")
      .select("*")
      .eq("venue_id", venueId)
      .order("day_of_week");

    if (error) throw error;

    if (!pricingData || pricingData.length === 0) {
      return res.status(404).json({ error: "No pricing data found for this venue" });
    }

    res.json(pricingData);
  } catch (error) {
    console.error("Error fetching venue pricing:", error);
    res.status(500).json({ error: error.message });
  }
});

// Get venue policies
router.get("/venue-policies/:venueId", async (req, res) => {
  const { venueId } = req.params;

  try {
    const { data: policiesData, error } = await supabase
      .from("venue_policies")
      .select("*")
      .eq("venue_id", venueId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: "No policies found for this venue" });
      }
      throw error;
    }

    res.json(policiesData);
  } catch (error) {
    console.error("Error fetching venue policies:", error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
