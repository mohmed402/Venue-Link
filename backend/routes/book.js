const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient");

// Helper function to add/subtract hours from time string
function addHoursToTime(timeString, hours) {
  const [h, m] = timeString.split(':').map(Number);
  
  // Convert hours to minutes for accurate calculation
  const totalMinutes = Math.round(hours * 60);
  
  // Create date object and add minutes
  const date = new Date();
  date.setHours(h, m, 0, 0);
  date.setMinutes(date.getMinutes() + totalMinutes);
  
  // Check if we're still within the same day (0-23 hours)
  if (date.getHours() < 0 || date.getHours() >= 24) {
    return null; // Outside of current day
  }
  
  // Return formatted time string
  const resultHours = date.getHours().toString().padStart(2, '0');
  const resultMinutes = date.getMinutes().toString().padStart(2, '0');
  return `${resultHours}:${resultMinutes}`;
}

// Helper function to get venue buffer settings
async function getVenueBufferSettings(venue_id) {
  const { data, error } = await supabase
    .from('venues')
    .select('default_setup_time, default_breakdown_time')
    .eq('id', venue_id)
    .single();
    
  if (error || !data) {
    // Default buffer times if not set
    return { default_setup_time: 0.5, default_breakdown_time: 0.5 };
  }
  
  return data;
}

router.get("/book", async (req, res) => {
  const fullUrl = req.protocol + '://' + req.get('host') + req.originalUrl;
  console.log('Full request URL:', fullUrl);
  console.log('Referer:', req.get('referer'));
  console.log('Headers:', req.headers);
  const { data, error } = await supabase.from("bookings").select("*");
  
  if (error) {
    console.error('Supabase error:', error);
    return res.status(500).json({ error: error.message });
  }
  
  console.log('Sending response:', data);
  res.json(data);
});

router.post('/check-availability', async (req, res) => {
  const { venue_id, date, time_from, time_to, setup_time = 0, breakdown_time = 0, exclude_booking_id = null } = req.body;

  if (!venue_id || !date || !time_from || !time_to) {
    return res.status(400).json({ error: 'Missing required booking details' });
  }

  try {
    // Calculate buffer times
    const setupHours = parseFloat(setup_time) || 0;
    const breakdownHours = parseFloat(breakdown_time) || 0;
    
    // If no custom setup/breakdown provided, use venue defaults
    let effectiveSetupTime = setupHours;
    let effectiveBreakdownTime = breakdownHours;
    
    if (setupHours === 0 && breakdownHours === 0) {
      const bufferSettings = await getVenueBufferSettings(venue_id);
      effectiveSetupTime = bufferSettings.default_setup_time || 0;
      effectiveBreakdownTime = bufferSettings.default_breakdown_time || 0;
    }
    
    // Calculate actual time range including buffers
    const bufferStartTime = addHoursToTime(time_from, -effectiveSetupTime);
    const bufferEndTime = addHoursToTime(time_to, effectiveBreakdownTime);
    
    const checkStartTime = bufferStartTime || time_from;
    const checkEndTime = bufferEndTime || time_to;

    // Check for conflicts with other bookings (including their buffers)
    // Only consider non-overridden bookings as real conflicts
    let query = supabase
      .from('bookings')
      .select('id, time_from, time_to, setup_time, breakdown_time, override_availability')
      .eq('venue_id', venue_id)
      .eq('date', date)
      .neq('status', 'cancelled')
      .eq('override_availability', false); // Only check against non-overridden bookings

    // Exclude the current booking if editing
    if (exclude_booking_id) {
      query = query.neq('id', exclude_booking_id);
    }

    const { data: conflicts, error } = await query;

    if (error) {
      console.error('Supabase query error:', error);
      return res.status(500).json({ error: 'Failed to check availability' });
    }

    // Check each existing booking with its buffer times
    let hasConflict = false;
    for (const booking of conflicts) {
      const existingSetup = parseFloat(booking.setup_time) || 0;
      const existingBreakdown = parseFloat(booking.breakdown_time) || 0;
      
      // If existing booking has no buffer, use venue defaults
      let existingEffectiveSetup = existingSetup;
      let existingEffectiveBreakdown = existingBreakdown;
      
      if (existingSetup === 0 && existingBreakdown === 0) {
        const bufferSettings = await getVenueBufferSettings(venue_id);
        existingEffectiveSetup = bufferSettings.default_setup_time || 0;
        existingEffectiveBreakdown = bufferSettings.default_breakdown_time || 0;
      }
      
      const existingBufferStart = addHoursToTime(booking.time_from, -existingEffectiveSetup) || booking.time_from;
      const existingBufferEnd = addHoursToTime(booking.time_to, existingEffectiveBreakdown) || booking.time_to;
      
      // Check for overlap
      if (checkStartTime < existingBufferEnd && checkEndTime > existingBufferStart) {
        hasConflict = true;
        break;
      }
    }

    const available = !hasConflict;
    res.json({ 
      available,
      buffer_start_time: bufferStartTime,
      buffer_end_time: bufferEndTime,
      setup_time: effectiveSetupTime,
      breakdown_time: effectiveBreakdownTime
    });
  } catch (err) {
    console.error('Availability check failed:', err);
    res.status(500).json({ error: 'Server error checking availability' });
  }
});

// Create booking with setup/breakdown times
router.post('/create-booking', async (req, res) => {
  const { 
    venue_id, 
    customer_id, 
    date, 
    time_from, 
    time_to, 
    people_count,
    event_type,
    amount,
    setup_time = 0,
    breakdown_time = 0,
    created_by,
    status = 'confirmed',
    notes,
    // New admin control fields
    priority = 'standard',
    revenue_category = '',
    risk_level = 'low',
    cancellation_policy = 'standard',
    override_availability = false,
    override_deposit = false,
    override_capacity = false,
    override_custom_pricing = false,
    pricing_reason = '',
    managed_by = null
  } = req.body;

  if (!venue_id || !customer_id || !date || !time_from || !time_to) {
    return res.status(400).json({ error: 'Missing required booking details' });
  }

  try {
    // Check availability unless override is enabled
    if (!override_availability) {
      const availabilityCheck = await fetch(`${req.protocol}://${req.get('host')}/api/check-availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ venue_id, date, time_from, time_to, setup_time, breakdown_time })
      });
      
      const availability = await availabilityCheck.json();
      
      if (!availability.available) {
        return res.status(409).json({ error: 'Time slot not available with buffer times' });
      }
    }

    // Create the booking with all admin control fields
    const { data: booking, error } = await supabase
      .from('bookings')
      .insert([{
        venue_id,
        customer_id,
        date,
        time_from,
        time_to,
        people_count,
        event_type,
        amount,
        setup_time: parseFloat(setup_time) || 0,
        breakdown_time: parseFloat(breakdown_time) || 0,
        created_by,
        status,
        notes,
        // Admin control fields
        priority,
        revenue_category,
        risk_level,
        cancellation_policy,
        override_availability,
        override_deposit,
        override_capacity,
        override_custom_pricing,
        pricing_reason,
        managed_by,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      console.error('Booking creation error:', error);
      return res.status(500).json({ error: 'Failed to create booking' });
    }

    res.status(201).json({
      success: true,
      booking,
      buffer_info: override_availability ? null : {
        setup_time: parseFloat(setup_time) || 0,
        breakdown_time: parseFloat(breakdown_time) || 0
      }
    });
  } catch (err) {
    console.error('Booking creation failed:', err);
    res.status(500).json({ error: 'Server error creating booking' });
  }
});

// Update existing booking with setup/breakdown times
router.put('/update-booking/:id', async (req, res) => {
  const { id } = req.params;
  const { 
    venue_id, 
    customer_id, 
    date, 
    time_from, 
    time_to, 
    people_count,
    event_type,
    amount,
    setup_time = 0,
    breakdown_time = 0,
    notes,
    // New admin control fields
    priority = 'standard',
    revenue_category = '',
    risk_level = 'low',
    cancellation_policy = 'standard',
    override_availability = false,
    override_deposit = false,
    override_capacity = false,
    override_custom_pricing = false,
    pricing_reason = '',
    managed_by = null
  } = req.body;

  if (!venue_id || !customer_id || !date || !time_from || !time_to) {
    return res.status(400).json({ error: 'Missing required booking details' });
  }

  try {
    // Check availability unless override is enabled (excluding the current booking)
    if (!override_availability) {
      const availabilityCheck = await fetch(`${req.protocol}://${req.get('host')}/api/check-availability`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          venue_id, 
          date, 
          time_from, 
          time_to, 
          setup_time, 
          breakdown_time,
          exclude_booking_id: id
        })
      });
      
      const availability = await availabilityCheck.json();
      
      if (!availability.available) {
        return res.status(409).json({ error: 'Time slot not available with buffer times' });
      }
    }

    // Update the booking with all admin control fields
    const { data: booking, error } = await supabase
      .from('bookings')
      .update({
        venue_id,
        customer_id,
        date,
        time_from,
        time_to,
        people_count,
        event_type,
        amount,
        setup_time: parseFloat(setup_time) || 0,
        breakdown_time: parseFloat(breakdown_time) || 0,
        notes,
        // Admin control fields
        priority,
        revenue_category,
        risk_level,
        cancellation_policy,
        override_availability,
        override_deposit,
        override_capacity,
        override_custom_pricing,
        pricing_reason,
        managed_by,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Booking update error:', error);
      return res.status(500).json({ error: 'Failed to update booking' });
    }

    res.json({
      success: true,
      booking,
      buffer_info: override_availability ? null : {
        setup_time: parseFloat(setup_time) || 0,
        breakdown_time: parseFloat(breakdown_time) || 0
      }
    });
  } catch (err) {
    console.error('Booking update failed:', err);
    res.status(500).json({ error: 'Server error updating booking' });
  }
});

// Get bookings for a specific date with buffer calculations
router.get('/bookings-by-date', async (req, res) => {
  const { venue_id, date } = req.query;

  if (!venue_id || !date) {
    return res.status(400).json({ error: 'venue_id and date are required' });
  }

  try {
    // First get bookings
    const { data: bookings, error: bookingsError } = await supabase
      .from('bookings')
      .select('*')
      .eq('venue_id', venue_id)
      .eq('date', date)
      .neq('status', 'cancelled')
      .order('time_from');

    if (bookingsError) {
      console.error('Error fetching bookings:', bookingsError);
      return res.status(500).json({ error: 'Failed to fetch bookings' });
    }

    // Get customer information for all bookings
    const customerIds = [...new Set(bookings.map(b => b.customer_id).filter(id => id))];
    let customers = [];
    
    console.log('Customer IDs to fetch:', customerIds);
    
    if (customerIds.length > 0) {
      const { data: customersData, error: customersError } = await supabase
        .from('customers')
        .select('id, full_name, phone_number')
        .in('id', customerIds);

      console.log('Customers query result:', { customersData, customersError });

      if (customersError) {
        console.error('Error fetching customers:', customersError);
        // Continue without customer data if there's an error
      } else {
        customers = customersData || [];
      }
    }

    // Create a customer lookup map
    const customerMap = {};
    customers.forEach(customer => {
      customerMap[customer.id] = customer;
    });
    
    console.log('Customer map:', customerMap);

    // Get venue buffer settings for bookings without custom buffer
    const bufferSettings = await getVenueBufferSettings(venue_id);

    // Calculate buffer times for each booking and add customer info
    const bookingsWithBuffers = bookings.map(booking => {
      const setupTime = parseFloat(booking.setup_time) || bufferSettings.default_setup_time || 0;
      const breakdownTime = parseFloat(booking.breakdown_time) || bufferSettings.default_breakdown_time || 0;
      
      return {
        ...booking,
        customer: customerMap[booking.customer_id] || null,
        effective_setup_time: setupTime,
        effective_breakdown_time: breakdownTime,
        buffer_start_time: addHoursToTime(booking.time_from, -setupTime),
        buffer_end_time: addHoursToTime(booking.time_to, breakdownTime)
      };
    });

    res.json(bookingsWithBuffers);
  } catch (err) {
    console.error('Error in bookings-by-date:', err);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
