const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient");

router.post('/check-availability', async (req, res) => {
  const { venue_id, date, time_from, time_to } = req.body;

  if (!venue_id || !date || !time_from || !time_to) {
    return res.status(400).json({ error: 'Missing required booking details' });
  }

  try {
    const { data: conflicts, error } = await supabase
      .from('bookings')
      .select('id')
      .eq('venue_id', venue_id)
      .eq('date', date)
      .lt('time_from', time_to)
      .gt('time_to', time_from);

    if (error) {
      console.error('Supabase query error:', error);
      return res.status(500).json({ error: 'Failed to check availability' });
    }

    const available = conflicts.length === 0;
    res.json({ available });
  } catch (err) {
    console.error('Availability check failed:', err);
    res.status(500).json({ error: 'Server error checking availability' });
  }
});

module.exports = router;
