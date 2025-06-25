const supabase = require('../supabaseClient');

// Client Management
exports.getClients = async (req, res) => {
  try {
    // First try to get customers with auth relation
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('full_name', { ascending: true });
    
    if (error) throw error;
    
    // For each customer with an ID, try to get their email from auth.users
    const customersWithEmail = await Promise.all(
      data.map(async (customer) => {
        if (customer.id) {
          try {
            const { data: userData, error: userError } = await supabase.auth.admin.getUserById(customer.id);
            return {
              ...customer,
              auth_users: userData?.user ? { email: userData.user.email } : null
            };
          } catch (userError) {
            // If auth lookup fails, just return customer without email
            return { ...customer, auth_users: null };
          }
        }
        return { ...customer, auth_users: null };
      })
    );
    
    res.json(customersWithEmail);
  } catch (error) {
    console.error('Error fetching clients:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.createClient = async (req, res) => {
  const { full_name, phone_number, preferences, email, password } = req.body;
  
  try {
    // First, create the auth user if email/password provided
    let authUserId = null;
    if (email && password) {
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true
      });
      
      if (authError) throw authError;
      authUserId = authData.user.id;
    }
    
    // Create the customer record
    const { data, error } = await supabase
      .from('customers')
      .insert([{
        id: authUserId, // Link to auth.users.id if user was created
        full_name,
        phone_number,
        preferences,
        created_at: new Date().toISOString()
      }])
      .select(`
        *,
        auth_users:id (
          email
        )
      `);
    
    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.createClientWithoutAuth = async (req, res) => {
  const { full_name, phone_number, preferences } = req.body;
  
  try {
    // Create customer without auth (for walk-in customers, etc.)
    const { data, error } = await supabase
      .from('customers')
      .insert([{
        full_name,
        phone_number,
        preferences,
        created_at: new Date().toISOString()
      }])
      .select();
    
    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get bookings for a specific date with venue buffer info
exports.getBookingsByDate = async (req, res) => {
  const venue_id = parseInt(req.query.venue_id, 10) || 86;
  const { date } = req.query;
  
  try {
    // Get venue buffer_minutes
    const { data: venueData, error: venueError } = await supabase
      .from('venues')
      .select('buffer_minutes')
      .eq('venue_id', venue_id)
      .single();
    
    if (venueError) throw venueError;
    
    // Get bookings for the date with additional employee-useful information
    const { data: bookingsData, error: bookingsError } = await supabase
      .from('bookings')
      .select(`
        id, 
        date, 
        time_from, 
        time_to, 
        people_count, 
        event_type, 
        status,
        is_online,
        amount,
        deposit_amount,
        payment_status,
        created_at,
        hold_expires_at,
        notes,
        customer:customer_id (
          full_name,
          phone_number
        )
      `)
      .eq('venue_id', venue_id)
      .eq('date', date)
      .neq('status', 'cancelled');
    
    if (bookingsError) throw bookingsError;
    
    res.json({
      bookings: bookingsData,
      buffer_minutes: venueData.buffer_minutes || 0
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Venue Availability & Pricing
exports.checkAvailability = async (req, res) => {
  const venue_id = parseInt(req.query.venue_id, 10) || 86;
  const { date, start_time, end_time, exclude_booking_id, override_availability } = req.query;
  
  try {
    // If override is enabled, skip availability check and return available
    if (override_availability === 'true') {
      console.log('Override availability enabled - skipping conflict check');
      return res.json({ 
        available: true, 
        conflictingBookings: [],
        buffer_minutes: 0,
        override_enabled: true
      });
    }

    // Get venue buffer_minutes
    const { data: venueData, error: venueError } = await supabase
      .from('venues')
      .select('buffer_minutes')
      .eq('venue_id', venue_id)
      .single();
    
    if (venueError) throw venueError;
    
    const bufferMinutes = venueData.buffer_minutes || 0;
    
    // Get existing bookings, excluding the specified booking if provided
    // Only consider non-overridden bookings as real conflicts
    let query = supabase
      .from('bookings')
      .select('id, date, time_from, time_to, override_availability')
      .eq('venue_id', venue_id)
      .eq('date', date)
      .neq('status', 'cancelled')
      .eq('override_availability', false); // Only check against non-overridden bookings

    // Exclude the current booking if editing
    if (exclude_booking_id) {
      query = query.neq('id', exclude_booking_id);
    }

    const { data: bookingsData, error: bookingsError } = await query;
    
    if (bookingsError) throw bookingsError;
    
    // Helper function to add/subtract minutes from time
    const adjustTime = (timeStr, minutes) => {
      const [hours, mins] = timeStr.split(':').map(Number);
      const totalMinutes = hours * 60 + mins + minutes;
      const newHours = Math.floor(totalMinutes / 60);
      const newMins = totalMinutes % 60;
      return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
    };
    
    // Check for time conflicts including buffer
    const hasConflict = bookingsData.some(booking => {
      const bookingStart = adjustTime(booking.time_from, -bufferMinutes);
      const bookingEnd = adjustTime(booking.time_to, bufferMinutes);
      return (start_time < bookingEnd && end_time > bookingStart);
    });
    
    res.json({ 
      available: !hasConflict, 
      conflictingBookings: hasConflict ? bookingsData : [],
      buffer_minutes: bufferMinutes,
      override_enabled: false
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getVenuePricing = async (req, res) => {
  const venue_id = parseInt(req.query.venue_id, 10) || 86;
  const { date, start_time, end_time, people_count } = req.query;
  
  try {
    // Get base pricing rules
    const basePrice = 300; // Base hourly rate
    const startHour = parseInt(start_time.split(':')[0]);
    const endHour = parseInt(end_time.split(':')[0]);
    const duration = endHour - startHour;
    
    let totalAmount = basePrice * duration;
    
    // Weekend surcharge
    const bookingDate = new Date(date);
    if (bookingDate.getDay() === 0 || bookingDate.getDay() === 6) {
      totalAmount *= 1.2; // 20% weekend surcharge
    }
    
    // Guest count pricing
    if (people_count > 50) {
      totalAmount += (people_count - 50) * 5; // £5 per additional guest over 50
    }
    
    const depositAmount = totalAmount * 0.3; // 30% deposit
    const remainingBalance = totalAmount - depositAmount;
    
    res.json({
      totalAmount: Math.round(totalAmount * 100) / 100,
      depositAmount: Math.round(depositAmount * 100) / 100,
      remainingBalance: Math.round(remainingBalance * 100) / 100,
      breakdown: {
        baseRate: basePrice,
        duration,
        weekendSurcharge: bookingDate.getDay() === 0 || bookingDate.getDay() === 6,
        peopleCount: people_count,
        additionalGuestFee: people_count > 50 ? (people_count - 50) * 5 : 0
      }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Booking Management
exports.createBooking = async (req, res) => {
  const {
    venue_id = 86,
    customer_id,
    date,
    time_from,
    time_to,
    people_count,
    event_type,
    amount,
    deposit_amount,
    deposit_percentage,
    system_fee_percentage = 1,
    status = 'confirmed',
    notes,
    created_by,
    // New admin control fields
    setup_time = 0,
    breakdown_time = 0,
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
  
  try {
    // Note: The following database columns need to be added to the 'bookings' table:
    // - setup_time (DECIMAL)
    // - breakdown_time (DECIMAL) 
    // - priority (VARCHAR) - 'standard', 'high', 'vip', 'urgent'
    // - revenue_category (VARCHAR) - 'wedding', 'corporate', 'charity', 'internal', 'social'
    // - risk_level (VARCHAR) - 'low', 'medium', 'high'
    // - cancellation_policy (VARCHAR) - 'standard', 'flexible', 'strict', 'custom'
    // - override_availability (BOOLEAN)
    // - override_deposit (BOOLEAN) 
    // - override_capacity (BOOLEAN)
    // - override_custom_pricing (BOOLEAN)
    // - pricing_reason (TEXT)
    // - managed_by (UUID) - References the manager/staff member

    // Log the incoming data for debugging
    console.log('Creating booking with data:', {
      venue_id,
      customer_id,
      date,
      time_from,
      time_to,
      people_count,
      event_type,
      amount,
      deposit_amount,
      deposit_percentage,
      system_fee_percentage,
      status,
      notes,
      created_by,
      setup_time,
      breakdown_time,
      priority,
      revenue_category,
      risk_level,
      cancellation_policy,
      override_availability,
      override_deposit,
      override_capacity,
      override_custom_pricing,
      pricing_reason,
      managed_by
    });

    // Validate required fields
    if (!customer_id) {
      return res.status(400).json({ error: 'customer_id is required' });
    }
    if (!date) {
      return res.status(400).json({ error: 'date is required' });
    }
    if (!time_from) {
      return res.status(400).json({ error: 'time_from is required' });
    }
    if (!time_to) {
      return res.status(400).json({ error: 'time_to is required' });
    }

    const { data, error } = await supabase
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
        deposit_amount,
        deposit_percentage,
        system_fee_percentage,
        status,
        notes,
        handled_by: created_by,
        is_online: false,
        // Admin control fields
        setup_time: parseFloat(setup_time) || 0,
        breakdown_time: parseFloat(breakdown_time) || 0,
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
      .select(`
        *,
        customer:customer_id (*)
      `);
    
    if (error) {
      console.error('Supabase error creating booking:', error);
      throw error;
    }
    
    // Log activity with priority information
    const activityMessage = priority === 'vip' ? 'VIP Booking created' :
                           priority === 'urgent' ? 'Urgent Booking created' :
                           'Booking created';
    
    await supabase
      .from('activity_log')
      .insert([{
        venue_id,
        action: activityMessage,
        user: created_by || 'Employee',
        timestamp: new Date().toISOString()
      }]);
    
    console.log('Booking created successfully:', data[0]);
    res.json(data[0]);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update existing booking
exports.updateBooking = async (req, res) => {
  const { id } = req.params;
  const {
    venue_id = 86,
    customer_id,
    date,
    time_from,
    time_to,
    people_count,
    event_type,
    amount,
    deposit_amount,
    deposit_percentage,
    system_fee_percentage = 1,
    status = 'confirmed',
    notes,
    setup_time,
    breakdown_time,
    created_by,
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

  try {
    // Handle both integer and UUID booking IDs
    // If the ID looks like an integer, try to find the booking using integer comparison
    // If it's a UUID format, use it directly
    const isIntegerId = /^\d+$/.test(id);
    let bookingQuery;
    
    if (isIntegerId) {
      // For integer IDs, cast to integer for comparison
      bookingQuery = supabase
        .from('bookings')
        .select('id')
        .eq('id', parseInt(id))
        .single();
    } else {
      // For UUID format, use as string
      bookingQuery = supabase
        .from('bookings')
        .select('id')
        .eq('id', id)
        .single();
    }
    
    // First, verify the booking exists and get its actual ID
    const { data: existingBooking, error: findError } = await bookingQuery;
    
    if (findError) {
      if (findError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Booking not found' });
      }
      throw findError;
    }
    
    // Use the actual booking ID from the database for the update
    const actualBookingId = existingBooking.id;
    // Log the incoming data for debugging
    console.log('Updating booking with data:', {
      id,
      venue_id,
      customer_id,
      date,
      time_from,
      time_to,
      people_count,
      event_type,
      amount,
      deposit_amount,
      deposit_percentage,
      system_fee_percentage,
      status,
      notes,
      setup_time,
      breakdown_time,
      created_by,
      priority,
      revenue_category,
      risk_level,
      cancellation_policy,
      override_availability,
      override_deposit,
      override_capacity,
      override_custom_pricing,
      pricing_reason,
      managed_by
    });

    // Validate required fields
    if (!customer_id) {
      return res.status(400).json({ error: 'customer_id is required' });
    }
    if (!date) {
      return res.status(400).json({ error: 'date is required' });
    }
    if (!time_from) {
      return res.status(400).json({ error: 'time_from is required' });
    }
    if (!time_to) {
      return res.status(400).json({ error: 'time_to is required' });
    }

    const { data, error } = await supabase
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
        deposit_amount,
        deposit_percentage,
        system_fee_percentage,
        status,
        notes,
        setup_time: setup_time ? parseFloat(setup_time) : 0.0,
        breakdown_time: breakdown_time ? parseFloat(breakdown_time) : 0.0,
        handled_by: created_by,
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
        managed_by
      })
      .eq('id', actualBookingId)
      .select(`
        *,
        customer:customer_id (*)
      `);

    if (error) {
      console.error('Supabase error updating booking:', error);
      throw error;
    }

    if (data.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    // Log activity with priority information
    const activityMessage = priority === 'vip' ? 'VIP Booking updated' :
                           priority === 'urgent' ? 'Urgent Booking updated' :
                           'Booking updated';

    await supabase
      .from('activity_log')
      .insert([{
        venue_id,
        action: activityMessage,
        user: created_by || 'Employee',
        timestamp: new Date().toISOString()
      }]);

    console.log('Booking updated successfully:', data[0]);
    res.json({ success: true, booking: data[0] });
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.saveDraftBooking = async (req, res) => {
  const {
    venue_id = 86,
    customer_id,
    date,
    time_from,
    time_to,
    guests,
    event_type,
    amount,
    deposit_amount,
    notes,
    created_at,
    setup_time,
    breakdown_time,
    status,
    override_availability,
    staff_id,
    deposit_percentage,
    system_fee_percentage = 1
  } = req.body;
  
  try {
    const { data, error } = await supabase
      .from('booking_drafts')
      .insert([{
        venue_id,
        customer_id,
        date,
        time_from,
        time_to,
        guests,
        event_type,
        amount,
        deposit_amount,
        notes,
        created_at: created_at || new Date().toISOString(),
        setup_time,
        breakdown_time,
        status,
        override_availability,
        staff_id,
        deposit_percentage,
        system_fee_percentage
      }])
      .select();
    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getDraftBookings = async (req, res) => {
  const { venue_id = 86, date } = req.query;
  
  try {
    let query = supabase
      .from('booking_drafts')
      .select(`
        *,
        customer:customer_id (*)
      `)
      .eq('venue_id', venue_id)
      .order('created_at', { ascending: false });

    // Filter by date if provided
    if (date) {
      query = query.eq('date', date);
    }

    const { data, error } = await query;
    if (error) throw error;
    
    res.json(data);
  } catch (error) {
    console.error('getDraftBookings error:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteDraftBooking = async (req, res) => {
  const { id } = req.params;
  
  try {
    const { data, error } = await supabase
      .from('booking_drafts')
      .delete()
      .eq('id', id)
      .select();
    
    if (error) throw error;
    
    if (data.length === 0) {
      return res.status(404).json({ error: 'Draft booking not found' });
    }
    
    res.json({ success: true, deleted: data[0] });
  } catch (error) {
    console.error('deleteDraftBooking error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Payment Management
exports.addPayment = async (req, res) => {
  const {
    booking_id,
    amount,
    payment_method,
    reference,
    recorded_by
  } = req.body;
  
  try {
    const { data, error } = await supabase
      .from('payments')
      .insert([{
        booking_id,
        amount,
        payment_method,
        reference,
        recorded_by,
        payment_date: new Date().toISOString()
      }])
      .select();
    if (error) throw error;
    
    // Update booking payment status
    await updateBookingPaymentStatus(booking_id);
    
    // Log activity
    await supabase
      .from('activity_log')
      .insert([{
        venue_id: 86, // You might want to get this from the booking
        action: `Payment of £${amount} recorded`,
        user: recorded_by,
        timestamp: new Date().toISOString()
      }]);
    
    res.json(data[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getPayments = async (req, res) => {
  const booking_id = parseInt(req.query.booking_id, 10);
  
  try {
    const { data, error } = await supabase
      .from('payments')
      .select(`
        *,
        staff:recorded_by (
          full_name
        )
      `)
      .eq('booking_id', booking_id)
      .order('payment_date', { ascending: false });
    if (error) throw error;
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete payment
exports.deletePayment = async (req, res) => {
  const { id } = req.params;
  
  try {
    const { data, error } = await supabase
      .from('payments')
      .delete()
      .eq('id', id)
      .select();
    
    if (error) throw error;
    
    if (data.length === 0) {
      return res.status(404).json({ error: 'Payment not found' });
    }
    
    // Update booking payment status after deletion
    await updateBookingPaymentStatus(data[0].booking_id);
    
    // Log activity
    await supabase
      .from('activity_log')
      .insert([{
        venue_id: 86, // You might want to get this from the booking
        action: `Payment of £${data[0].amount} deleted`,
        user: req.body.deleted_by || 'Unknown',
        timestamp: new Date().toISOString()
      }]);
    
    res.json({ success: true, deleted: data[0] });
  } catch (error) {
    console.error("Error deleting payment:", error);
    res.status(500).json({ error: "Failed to delete payment" });
  }
};

// Record booking price change
exports.recordPriceChange = async (req, res) => {
  try {
    const { 
      booking_id,
      old_amount,
      new_amount,
      reason,
      updated_by
    } = req.body;

    const { data, error } = await supabase
      .from("booking_price_changes")
      .insert([{
        booking_id,
        old_amount,
        new_amount,
        reason,
        updated_by,
        updated_at: new Date().toISOString()
      }]);

    if (error) throw error;

    res.json({ success: true, data });
  } catch (error) {
    console.error("Error recording price change:", error);
    res.status(500).json({ error: "Failed to record price change" });
  }
};

// Get all bookings with filters
exports.getAllBookings = async (req, res) => {
  try {
    const { 
      venue_id = 86, 
      status, 
      date_from, 
      date_to, 
      search,
      limit = 50,
      offset = 0 
    } = req.query;

    let query = supabase
      .from('bookings')
      .select(`
        *,
        customer:customer_id (*)
      `)
      .eq('venue_id', venue_id)
      .order('created_at', { ascending: false });

    // Apply filters
    if (status && status !== 'all') {
      query = query.eq('status', status);
    }

    if (date_from) {
      query = query.gte('date', date_from);
    }

    if (date_to) {
      query = query.lte('date', date_to);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1);

    const { data, error } = await query;

    if (error) throw error;

    // Filter by search query if provided (client-side filtering for now)
    let filteredData = data;
    if (search) {
      const searchLower = search.toLowerCase();
      filteredData = data.filter(booking => 
        booking.customer?.full_name?.toLowerCase().includes(searchLower) ||
        booking.event_type?.toLowerCase().includes(searchLower) ||
        booking.id.toString().includes(searchLower)
      );
    }

    res.json(filteredData);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get venue deposit percentage based on booking date
exports.getVenueDepositPercentage = async (req, res) => {
  try {
    const { venue_id, booking_date } = req.query;

    if (!venue_id || !booking_date) {
      return res.status(400).json({ error: 'venue_id and booking_date are required' });
    }

    const currentDate = new Date();
    const eventDate = new Date(booking_date);
    const daysDifference = Math.ceil((eventDate - currentDate) / (1000 * 60 * 60 * 24));

    // Get venue deposit rules
    const { data: rules, error } = await supabase
      .from('venue_deposit_rules')
      .select('*')
      .eq('venue_id', venue_id)
      .order('min_days_before', { ascending: false });

    if (error) throw error;

    if (!rules || rules.length === 0) {
      // Default to 30% if no rules found
      return res.json({ deposit_percentage: 30, days_before: daysDifference });
    }

    // Find the appropriate rule based on days before event
    let applicableRule = rules.find(rule => daysDifference >= rule.min_days_before);
    
    // If no rule matches (booking is very last minute), use the rule with the smallest min_days_before
    if (!applicableRule) {
      applicableRule = rules[rules.length - 1];
    }

    res.json({ 
      deposit_percentage: applicableRule.deposit_percentage,
      days_before: daysDifference,
      rule_applied: applicableRule
    });
  } catch (error) {
    console.error('Error fetching venue deposit percentage:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get specific booking by ID
exports.getBookingById = async (req, res) => {
  try {
    const { id } = req.params;

    // Handle both integer and UUID booking IDs
    const isIntegerId = /^\d+$/.test(id);
    let bookingQuery;
    
    if (isIntegerId) {
      // For integer IDs, cast to integer for comparison
      bookingQuery = supabase
        .from('bookings')
        .select(`
          *,
          customer:customer_id (*)
        `)
        .eq('id', parseInt(id))
        .single();
    } else {
      // For UUID format, use as string
      bookingQuery = supabase
        .from('bookings')
        .select(`
          *,
          customer:customer_id (*)
        `)
        .eq('id', id)
        .single();
    }

    // Get booking with customer data
    const { data: booking, error: bookingError } = await bookingQuery;

    if (bookingError) {
      if (bookingError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Booking not found' });
      }
      throw bookingError;
    }

    // Get payments for this booking
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select(`
        *,
        staff:recorded_by (
          full_name
        )
      `)
      .eq('booking_id', booking.id)
      .order('payment_date', { ascending: false });

    if (paymentsError) {
      console.error('Error fetching payments:', paymentsError);
    }

    // Get price changes for this booking
    const { data: priceChanges, error: priceChangesError } = await supabase
      .from('booking_price_changes')
      .select('*')
      .eq('booking_id', booking.id)
      .order('updated_at', { ascending: false });

    if (priceChangesError) {
      console.error('Error fetching price changes:', priceChangesError);
    }

    // Combine all data
    const result = {
      ...booking,
      payments: payments || [],
      booking_price_changes: priceChanges || []
    };

    res.json(result);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ error: error.message });
  }
};

// Staff Management
exports.getStaff = async (req, res) => {
  try {
    const { venue_id = 86 } = req.query;
    
    const { data, error } = await supabase
      .from('staff')
      .select('*')
      .eq('venue_id', venue_id)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    res.json(data);
  } catch (error) {
    console.error('Error fetching staff:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.createStaff = async (req, res) => {
  try {
    const {
      id, // Supabase auth user ID
      full_name,
      email,
      role,
      status = 'active',
      venue_id = 86
    } = req.body;

    const { data, error } = await supabase
      .from('staff')
      .insert([{
        id,
        full_name,
        email,
        role,
        status,
        venue_id,
        created_at: new Date().toISOString()
      }])
      .select();

    if (error) throw error;
    res.json(data[0]);
  } catch (error) {
    console.error('Error creating staff:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateStaff = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const { data, error } = await supabase
      .from('staff')
      .update(updates)
      .eq('id', id)
      .select();

    if (error) throw error;
    
    if (data.length === 0) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    res.json(data[0]);
  } catch (error) {
    console.error('Error updating staff:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteStaff = async (req, res) => {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('staff')
      .delete()
      .eq('id', id)
      .select();

    if (error) throw error;

    if (data.length === 0) {
      return res.status(404).json({ error: 'Staff member not found' });
    }

    res.json({ success: true, deleted: data[0] });
  } catch (error) {
    console.error('Error deleting staff:', error);
    res.status(500).json({ error: error.message });
  }
};

exports.createStaffWithAuth = async (req, res) => {
  try {
    const {
      full_name,
      email,
      password,
      role,
      status = 'active',
      venue_id = 86
    } = req.body;

    // First, create the auth user
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        role: 'staff',
        staff_role: role,
        full_name
      }
    });

    if (authError) throw authError;

    // Then create the staff record
    const { data: staffData, error: staffError } = await supabase
      .from('staff')
      .insert([{
        id: authData.user.id,
        full_name,
        email,
        role,
        status,
        venue_id,
        created_at: new Date().toISOString()
      }])
      .select();

    if (staffError) {
      // If staff creation fails, try to delete the auth user
      await supabase.auth.admin.deleteUser(authData.user.id);
      throw staffError;
    }

    res.json(staffData[0]);
  } catch (error) {
    console.error('Error creating staff with auth:', error);
    res.status(500).json({ error: error.message });
  }
};

// Function to calculate and update payment status
const updateBookingPaymentStatus = async (booking_id) => {
  try {
    // Get booking details
    const { data: booking, error: bookingError } = await supabase
      .from('bookings')
      .select('amount, deposit_amount, deposit_percentage')
      .eq('id', booking_id)
      .single();

    if (bookingError) throw bookingError;

    // Get all payments for this booking
    const { data: payments, error: paymentsError } = await supabase
      .from('payments')
      .select('amount')
      .eq('booking_id', booking_id);

    if (paymentsError) throw paymentsError;

    const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
    const totalAmount = booking.amount || 0;
    const depositAmount = booking.deposit_amount || 0;
    const depositPercentage = booking.deposit_percentage || 0;

    let payment_status = 'unpaid';
    let is_fully_paid = false;

    if (totalPaid === 0) {
      payment_status = 'unpaid';
    } else if (totalPaid > totalAmount) {
      payment_status = 'overpaid';
    } else if (totalPaid >= totalAmount) {
      payment_status = 'paid';
      is_fully_paid = true;
    } else if (totalPaid >= depositAmount) {
      // Payment is at least the deposit amount
      if (totalPaid === depositAmount) {
        payment_status = 'deposit_paid';
      } else {
        payment_status = 'partial';
      }
    } else if (totalPaid > 0) {
      // Payment is less than deposit amount
      if (depositPercentage === 100) {
        // Special case: when deposit is 100%, any partial payment is considered "partial"
        payment_status = 'partial';
      } else {
        // Normal case: payment less than required deposit is "deposit_pending"
        payment_status = 'deposit_pending';
      }
    }

    // Update the booking with new payment status
    const { error: updateError } = await supabase
      .from('bookings')
      .update({
        payment_status,
        is_fully_paid
      })
      .eq('id', booking_id);

    if (updateError) throw updateError;

    console.log(`Updated booking ${booking_id} payment status to: ${payment_status}, is_fully_paid: ${is_fully_paid}`);
    
    return { payment_status, is_fully_paid, totalPaid, totalAmount, depositAmount, depositPercentage };
  } catch (error) {
    console.error('Error updating booking payment status:', error);
    throw error;
  }
};

// Manual payment status update endpoint
exports.updatePaymentStatus = async (req, res) => {
  try {
    const { booking_id } = req.params;
    
    if (booking_id) {
      // Update specific booking
      const result = await updateBookingPaymentStatus(booking_id);
      res.json({ 
        success: true, 
        booking_id, 
        ...result 
      });
    } else {
      // Update all bookings
      const { data: bookings, error } = await supabase
        .from('bookings')
        .select('id')
        .neq('status', 'cancelled');
      
      if (error) throw error;
      
      const results = [];
      for (const booking of bookings) {
        try {
          const result = await updateBookingPaymentStatus(booking.id);
          results.push({ booking_id: booking.id, ...result });
        } catch (error) {
          console.error(`Failed to update payment status for booking ${booking.id}:`, error);
          results.push({ booking_id: booking.id, error: error.message });
        }
      }
      
      res.json({ 
        success: true, 
        updated_count: results.length,
        results 
      });
    }
  } catch (error) {
    console.error('Error updating payment status:', error);
    res.status(500).json({ error: error.message });
  }
};

// Activity Log Management
exports.getActivityLog = async (req, res) => {
  try {
    const { venue_id = 86, limit = 10 } = req.query;

    // First try to get activity log with staff join
    let { data, error } = await supabase
      .from('activity_log')
      .select(`
        id,
        venue_id,
        action,
        user,
        timestamp
      `)
      .eq('venue_id', venue_id)
      .order('timestamp', { ascending: false })
      .limit(parseInt(limit));

    if (error) {
      console.error('Error fetching activity log:', error);
      throw error;
    }

    // Try to get staff information for each user
    const enrichedData = await Promise.all(
      data.map(async (activity) => {
        if (activity.user) {
          try {
            const { data: staffData } = await supabase
              .from('staff')
              .select('full_name, email')
              .eq('id', activity.user)
              .single();

            return {
              ...activity,
              staff: staffData
            };
          } catch (staffError) {
            console.warn(`Could not fetch staff data for user ${activity.user}:`, staffError);
            return activity;
          }
        }
        return activity;
      })
    );

    res.json(enrichedData);
  } catch (error) {
    console.error('Error fetching activity log:', error);
    res.status(500).json({ error: error.message });
  }
};

