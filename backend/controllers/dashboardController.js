const supabase = require('../supabaseClient');

// Helper: get start/end of today and week
function getTodayRange() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const end = new Date(start);
  end.setDate(start.getDate() + 1);
  return { start, end };
}
function getWeekRange() {
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - now.getDay()); // Sunday
  start.setHours(0,0,0,0);
  const end = new Date(start);
  end.setDate(start.getDate() + 7);
  return { start, end };
}

// Dashboard controller - mock data for now

exports.getSummaryMetrics = async (req, res) => {
  const venue_id = parseInt(req.query.venue_id, 10) || 86;
  const { start: todayStart, end: todayEnd } = getTodayRange();
  const { start: weekStart, end: weekEnd } = getWeekRange();

  try {
    // Bookings today
    const { count: bookingsToday } = await supabase
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .eq('venue_id', venue_id)
      .gte('date', todayStart.toISOString().slice(0, 10))
      .lt('date', todayEnd.toISOString().slice(0, 10));

    // Bookings this week
    const { count: bookingsThisWeek } = await supabase
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .eq('venue_id', venue_id)
      .gte('date', weekStart.toISOString().slice(0, 10))
      .lt('date', weekEnd.toISOString().slice(0, 10));

    // Estimated revenue (sum of amount for this week)
    const { data: revenueRows } = await supabase
      .from('bookings')
      .select('amount')
      .eq('venue_id', venue_id)
      .gte('date', weekStart.toISOString().slice(0, 10))
      .lt('date', weekEnd.toISOString().slice(0, 10));
    const estimatedRevenue = revenueRows ? revenueRows.reduce((sum, b) => sum + (b.amount || 0), 0) : 0;

    // Cancellations this week
    const { count: cancellations } = await supabase
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .eq('venue_id', venue_id)
      .eq('status', 'cancelled')
      .gte('date', weekStart.toISOString().slice(0, 10))
      .lt('date', weekEnd.toISOString().slice(0, 10));

    // Most booked slot (by time)
    const { data: weekBookings } = await supabase
      .from('bookings')
      .select('time_from')
      .eq('venue_id', venue_id)
      .gte('date', weekStart.toISOString().slice(0, 10))
      .lt('date', weekEnd.toISOString().slice(0, 10));
    const slotCounts = {};
    if (weekBookings) {
      weekBookings.forEach(b => {
        if (b.time_from) slotCounts[b.time_from] = (slotCounts[b.time_from] || 0) + 1;
      });
    }
    let mostBookedSlot = null;
    let maxCount = 0;
    for (const slot in slotCounts) {
      if (slotCounts[slot] > maxCount) {
        mostBookedSlot = slot;
        maxCount = slotCounts[slot];
      }
    }

    res.json({
      bookingsToday: bookingsToday || 0,
      bookingsThisWeek: bookingsThisWeek || 0,
      estimatedRevenue: `£${estimatedRevenue}`,
      cancellations: cancellations || 0,
      mostBookedSlot: mostBookedSlot || 'N/A'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getTodayBookings = async (req, res) => {
  const venue_id = parseInt(req.query.venue_id, 10) || 86;
  const { start: todayStart, end: todayEnd } = getTodayRange();
  try {
    const { data, error } = await supabase
      .from('bookings')
      .select(`
        *,
        customer:customer_id (
          full_name,
          phone_number
        )
      `)
      .eq('venue_id', venue_id)
      .gte('date', todayStart.toISOString().slice(0, 10))
      .lt('date', todayEnd.toISOString().slice(0, 10))
      .order('time_from', { ascending: true });
    if (error) throw error;

    // Transform the data to include customer_name for backward compatibility
    const transformedData = data.map(booking => ({
      ...booking,
      customer_name: booking.customer?.full_name || `Customer #${booking.customer_id?.slice(-8) || 'Unknown'}`,
      guests: booking.people_count,
      type: booking.event_type || 'Event'
    }));

    res.json(transformedData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getRecentActivity = async (req, res) => {
  const venue_id = parseInt(req.query.venue_id, 10) || 86;
  try {
    const { data, error } = await supabase
      .from('activity_log')
      .select('id, action, user, timestamp')
      .eq('venue_id', venue_id)
      .order('timestamp', { ascending: false })
      .limit(10);
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAlerts = async (req, res) => {
  const venue_id = parseInt(req.query.venue_id, 10) || 86;
  try {
    const { data, error } = await supabase
      .from('alerts')
      .select('id, type, message, priority, created_at')
      .eq('venue_id', venue_id)
      .order('created_at', { ascending: false })
      .limit(5);
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};