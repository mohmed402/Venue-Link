const supabase = require('../supabaseClient');

// Helper: get start/end of today and week
function getTodayRange() {
  const now = new Date();
  // Use local date to avoid timezone issues
  const year = now.getFullYear();
  const month = now.getMonth();
  const date = now.getDate();

  const start = new Date(year, month, date);
  const end = new Date(year, month, date + 1);
  return { start, end };
}

// Helper function to get today's date in YYYY-MM-DD format in local timezone
function getTodayDateString() {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
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

  // Get today's date in YYYY-MM-DD format using local timezone
  const todayDate = getTodayDateString();

  try {
    // Bookings today - simplified to just match today's date
    const { count: bookingsToday, error: todayError } = await supabase
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .eq('venue_id', venue_id)
      .eq('date', todayDate);

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
  const { start: todayStart } = getTodayRange();

  // Get today's date in YYYY-MM-DD format using local timezone
  const todayDate = getTodayDateString();

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
      .eq('date', todayDate)
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
      .select(`
        id,
        action,
        user,
        timestamp,
        staff:user (
          full_name
        )
      `)
      .eq('venue_id', venue_id)
      .order('timestamp', { ascending: false })
      .limit(10);
    if (error) throw error;

    // Transform the data to include user_name for display
    const transformedData = data.map(activity => ({
      ...activity,
      user_name: activity.staff?.full_name || activity.user || 'Unknown User'
    }));

    res.json(transformedData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getAlerts = async (req, res) => {
  const venue_id = parseInt(req.query.venue_id, 10) || 86;
  try {
    const { data, error } = await supabase
      .from('alerts')
      .select('id, type, message, priority, created_at, is_done, recorded_by')
      .eq('venue_id', venue_id)
      .eq('is_done', false)
      .order('created_at', { ascending: false })
      .limit(5);
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createAlert = async (req, res) => {
  const venue_id = parseInt(req.body.venue_id, 10) || 86;
  const { type, message, priority } = req.body;

  try {
    // Validate required fields
    if (!type || !message || !priority) {
      return res.status(400).json({
        error: 'Missing required fields: type, message, and priority are required'
      });
    }

    // Validate type
    const validTypes = ['maintenance', 'booking', 'system', 'task', 'reminder'];
    if (!validTypes.includes(type)) {
      return res.status(400).json({
        error: `Invalid type. Must be one of: ${validTypes.join(', ')}`
      });
    }

    // Validate priority
    const validPriorities = ['low', 'medium', 'high', 'critical'];
    if (!validPriorities.includes(priority)) {
      return res.status(400).json({
        error: `Invalid priority. Must be one of: ${validPriorities.join(', ')}`
      });
    }

    const { data, error } = await supabase
      .from('alerts')
      .insert([{
        venue_id,
        type,
        message,
        priority,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) throw error;
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.markAlertAsDone = async (req, res) => {
  const alertId = parseInt(req.params.id, 10);
  const { recorded_by } = req.body;

  if (!alertId) {
    return res.status(400).json({ error: 'Alert ID is required' });
  }

  if (!recorded_by) {
    return res.status(400).json({ error: 'recorded_by (staff ID) is required' });
  }

  try {
    const { data, error } = await supabase
      .from('alerts')
      .update({
        is_done: true,
        recorded_by: recorded_by
      })
      .eq('id', alertId)
      .select()
      .single();

    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};