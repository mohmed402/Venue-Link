const express = require('express');
const router = express.Router();
const supabase = require('../supabaseClient');

// Middleware to authenticate customer requests
const authenticateCustomer = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'No authorization token provided' });
    }

    const token = authHeader.substring(7);
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' });
    }

    // Check if user has staff role - staff cannot use customer endpoints
    if (user.user_metadata?.role === 'staff') {
      return res.status(403).json({ error: 'Staff accounts cannot access customer endpoints' });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    res.status(401).json({ error: 'Authentication failed' });
  }
};

// Get customer profile
router.get('/profile', authenticateCustomer, async (req, res) => {
  try {
    const { data: customer, error } = await supabase
      .from('customers')
      .select('*')
      .eq('id', req.user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      return res.status(400).json({ error: error.message });
    }

    res.json({ 
      user: req.user,
      customer: customer || null
    });
  } catch (error) {
    console.error('Error fetching customer profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update customer profile
router.put('/profile', authenticateCustomer, async (req, res) => {
  try {
    const updates = req.body;
    const { data, error } = await supabase
      .from('customers')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', req.user.id)
      .select()
      .single();

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ 
      message: "Profile updated successfully",
      customer: data
    });
  } catch (error) {
    console.error('Error updating customer profile:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get customer bookings
router.get('/bookings', authenticateCustomer, async (req, res) => {
  try {
    const { status } = req.query;

    console.log('=== CUSTOMER BOOKINGS DEBUG ===');
    console.log('Fetching bookings for customer ID:', req.user.id);
    console.log('User object:', JSON.stringify(req.user, null, 2));
    console.log('Customer ID type:', typeof req.user.id);

    // FIX: Check if the user has a customer record first
    const { data: customerRecord, error: customerError } = await supabase
      .from('customers')
      .select('id, full_name')
      .eq('id', req.user.id)
      .single();

    console.log('Customer record:', customerRecord);

    if (customerError && customerError.code === 'PGRST116') {
      return res.status(403).json({ 
        error: 'Customer profile not found. Please contact support to link your account.',
        details: 'Your user account exists but is not properly linked to a customer profile.'
      });
    }

    let query = supabase
      .from('bookings')
      .select(`
        *,
        venues:venue_id (
          venue_id,
          venue_name,
          venue_title,
          venue_place_type,
          city,
          country,
          venue_capacity,
          images!venue_id (
            image_url,
            is_main
          )
        )
      `)
      .eq('customer_id', req.user.id)
      .eq('venues.images.is_main', true);

    // Filter by status if provided
    const today = new Date().toISOString().split('T')[0];
    
    if (status === 'upcoming') {
      query = query.gte('date', today);
    } else if (status === 'past') {
      query = query.lt('date', today);
    }

    // Order by date
    if (status === 'past') {
      query = query.order('date', { ascending: false });
    } else {
      query = query.order('date', { ascending: true });
    }

    const { data: bookings, error } = await query;

    console.log('Found', bookings?.length || 0, 'bookings for this customer');
    console.log('Bookings query error:', error);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // If no bookings found, return empty array
    if (!bookings || bookings.length === 0) {
      return res.json({ bookings: [] });
    }

    // Fetch payments for all bookings
    const bookingIds = bookings.map(booking => booking.id);
    let payments = [];
    
    if (bookingIds.length > 0) {
      const { data: paymentsData, error: paymentsError } = await supabase
        .from('payments')
        .select('*')
        .in('booking_id', bookingIds);
      
      if (!paymentsError) {
        payments = paymentsData || [];
      }
    }

    // Calculate payment status for each booking and process venue images
    const bookingsWithPaymentStatus = bookings.map(booking => {
      const bookingPayments = payments.filter(payment => payment.booking_id === booking.id);
      const totalPaid = bookingPayments.reduce((sum, payment) => sum + payment.amount, 0);
      const paymentStatus = totalPaid >= booking.amount ? 'paid' : totalPaid > 0 ? 'partial' : 'unpaid';

      return {
        ...booking,
        venues: booking.venues ? {
          ...booking.venues,
          main_image: booking.venues.images?.[0]?.image_url || null,
          images: undefined // Remove the images array to clean up the response
        } : null,
        payments: bookingPayments,
        total_paid: totalPaid,
        payment_status: paymentStatus,
        remaining_balance: Math.max(0, booking.amount - totalPaid)
      };
    });

    console.log('Returning', bookingsWithPaymentStatus.length, 'bookings with payment status');

    res.json({ bookings: bookingsWithPaymentStatus });
  } catch (error) {
    console.error('Error fetching customer bookings:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Cancel booking
router.post('/bookings/cancel', authenticateCustomer, async (req, res) => {
  try {
    const { booking_id, cancellation_reason } = req.body;

    if (!booking_id) {
      return res.status(400).json({ error: 'booking_id is required' });
    }

    // Get booking and verify ownership
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('*')
      .eq('id', booking_id)
      .eq('customer_id', req.user.id)
      .single();

    if (fetchError || !booking) {
      return res.status(404).json({ error: "Booking not found or access denied" });
    }

    if (booking.status === 'cancelled') {
      return res.status(400).json({ error: "Booking is already cancelled" });
    }

    // Cancel the booking
    const { data: cancelledBooking, error: cancelError } = await supabase
      .from('bookings')
      .update({
        status: 'cancelled',
        notes: booking.notes ? `${booking.notes}\n\nCancelled: ${cancellation_reason || 'No reason provided'}` : `Cancelled: ${cancellation_reason || 'No reason provided'}`,
        updated_at: new Date().toISOString()
      })
      .eq('id', booking_id)
      .eq('customer_id', req.user.id)
      .select()
      .single();

    if (cancelError) {
      return res.status(400).json({ error: cancelError.message });
    }

    res.json({ 
      message: "Booking cancelled successfully",
      booking: cancelledBooking
    });
  } catch (error) {
    console.error('Error cancelling booking:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get customer favorites
router.get('/favorites', authenticateCustomer, async (req, res) => {
  try {
    const { data: favorites, error } = await supabase
      .from('customer_favorites')
      .select(`
        id,
        venue_id,
        created_at,
        venues:venue_id (
          venue_id,
          venue_name,
          venue_title,
          venue_price,
          venue_capacity,
          venue_place_type,
          city,
          country,
          about,
          images!venue_id (
            image_url,
            is_main
          )
        )
      `)
      .eq('customer_id', req.user.id)
      .eq('venues.images.is_main', true)
      .order('created_at', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Process the data to include only the main image
    const processedFavorites = favorites?.map(favorite => ({
      ...favorite,
      venues: {
        ...favorite.venues,
        main_image: favorite.venues?.images?.[0]?.image_url || null,
        images: undefined // Remove the images array to clean up the response
      }
    })) || [];

    res.json({ favorites: processedFavorites });
  } catch (error) {
    console.error('Error fetching favorites:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Add favorite
router.post('/favorites', authenticateCustomer, async (req, res) => {
  try {
    const { venue_id } = req.body;

    if (!venue_id) {
      return res.status(400).json({ error: 'venue_id is required' });
    }

    const { data, error } = await supabase
      .from('customer_favorites')
      .insert([{
        customer_id: req.user.id,
        venue_id: venue_id,
        created_at: new Date().toISOString()
      }])
      .select()
      .single();

    if (error) {
      if (error.code === '23505') { // Unique constraint violation
        return res.status(400).json({ error: 'Venue is already in favorites' });
      }
      return res.status(400).json({ error: error.message });
    }

    res.json({ 
      message: "Added to favorites successfully",
      favorite: data
    });
  } catch (error) {
    console.error('Error adding favorite:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Remove favorite
router.delete('/favorites', authenticateCustomer, async (req, res) => {
  try {
    const { venue_id } = req.body;

    if (!venue_id) {
      return res.status(400).json({ error: 'venue_id is required' });
    }

    const { error } = await supabase
      .from('customer_favorites')
      .delete()
      .eq('customer_id', req.user.id)
      .eq('venue_id', venue_id);

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    res.json({ message: "Removed from favorites successfully" });
  } catch (error) {
    console.error('Error removing favorite:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Check if venue is favorited
router.post('/favorites/check', authenticateCustomer, async (req, res) => {
  try {
    const { venue_id } = req.body;

    if (!venue_id) {
      return res.status(400).json({ error: 'venue_id is required' });
    }

    const { data, error } = await supabase
      .from('customer_favorites')
      .select('id')
      .eq('customer_id', req.user.id)
      .eq('venue_id', venue_id)
      .single();

    if (error && error.code !== 'PGRST116') {
      return res.status(400).json({ error: error.message });
    }

    res.json({ 
      isFavorite: !!data,
      favoriteId: data?.id || null
    });
  } catch (error) {
    console.error('Error checking favorite:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get customer payments
router.get('/payments', authenticateCustomer, async (req, res) => {
  try {
    const { booking_id } = req.query;

    let query = supabase
      .from('payments')
      .select(`
        *,
        bookings:booking_id (
          id,
          venue_id,
          customer_id,
          date,
          time_from,
          time_to,
          amount,
          event_type,
          venues:venue_id (
            venue_name,
            venue_title
          ),
          customers:customer_id (
            id,
            full_name,
            phone_number
          )
        )
      `);

    if (booking_id) {
      query = query.eq('booking_id', booking_id);
    } else {
      // Get all payments for the customer's bookings
      const { data: customerBookings } = await supabase
        .from('bookings')
        .select('id')
        .eq('customer_id', req.user.id);

      if (customerBookings && customerBookings.length > 0) {
        const bookingIds = customerBookings.map(b => b.id);
        query = query.in('booking_id', bookingIds);
      } else {
        return res.json({ payments: [] });
      }
    }

    const { data: payments, error } = await query
      .order('payment_date', { ascending: false });

    if (error) {
      return res.status(400).json({ error: error.message });
    }

    // Filter out payments for bookings that don't belong to the customer
    const validPayments = payments.filter(payment =>
      payment.bookings?.customer_id === req.user.id
    );

    // Add customer email from auth user to each payment
    const paymentsWithEmail = validPayments.map(payment => {
      if (payment.bookings && payment.bookings.customers) {
        payment.bookings.customers.email = req.user.email;
      }
      return payment;
    });

    res.json({ payments: paymentsWithEmail });
  } catch (error) {
    console.error('Error fetching payments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create customer payment
router.post('/payments', authenticateCustomer, async (req, res) => {
  try {
    const { booking_id, amount, payment_method, reference } = req.body;

    // Validate required fields
    if (!booking_id || !amount || !payment_method) {
      return res.status(400).json({ error: 'booking_id, amount, and payment_method are required' });
    }

    // Enhanced debugging - log user info
    console.log('=== PAYMENT REQUEST DEBUG ===');
    console.log('User ID:', req.user.id);
    console.log('User object:', JSON.stringify(req.user, null, 2));
    console.log('Booking ID:', booking_id);
    console.log('User ID type:', typeof req.user.id);
    console.log('Booking ID type:', typeof booking_id);

    // FIX: Check if the user has a customer record
    const { data: customerRecord, error: customerError } = await supabase
      .from('customers')
      .select('id, full_name')
      .eq('id', req.user.id)
      .single();

    console.log('Customer record:', customerRecord);
    console.log('Customer error:', customerError);

    if (customerError && customerError.code === 'PGRST116') {
      return res.status(403).json({ 
        error: 'Customer profile not found. Please contact support to link your account.',
        details: 'Your user account exists but is not properly linked to a customer profile.'
      });
    }

    // First, let's see what bookings exist for this customer
    const { data: allCustomerBookings, error: allBookingsError } = await supabase
      .from('bookings')
      .select('id, customer_id, amount, venue_id, status, payment_status, date')
      .eq('customer_id', req.user.id);

    console.log('All customer bookings:', JSON.stringify(allCustomerBookings, null, 2));
    console.log('All bookings error:', allBookingsError);

    if (!allCustomerBookings || allCustomerBookings.length === 0) {
      // This user has no bookings at all
      return res.status(404).json({ 
        error: 'No bookings found for your account',
        details: 'You don\'t have any bookings associated with your customer account.'
      });
    }

    // Now let's try to get the specific booking without customer_id filter first
    const { data: specificBooking, error: specificError } = await supabase
      .from('bookings')
      .select('id, customer_id, amount, venue_id, status, payment_status')
      .eq('id', booking_id)
      .single();

    console.log('Specific booking (no customer filter):', JSON.stringify(specificBooking, null, 2));
    console.log('Specific booking error:', specificError);

    if (specificError) {
      return res.status(404).json({ 
        error: 'Booking not found',
        details: `No booking exists with ID ${booking_id}`
      });
    }

    // Check if this booking belongs to the authenticated customer
    if (specificBooking.customer_id !== req.user.id) {
      return res.status(403).json({ 
        error: 'Access denied - this booking belongs to another customer',
        details: `Booking ${booking_id} is not associated with your account`
      });
    }

    // Check if booking is in a payable state
    if (specificBooking.status === 'cancelled') {
      return res.status(400).json({ 
        error: 'Cannot make payment for cancelled booking',
        details: 'This booking has been cancelled and cannot accept payments'
      });
    }

    if (specificBooking.payment_status === 'paid') {
      return res.status(400).json({ 
        error: 'Booking is already fully paid',
        details: 'This booking has already been paid in full'
      });
    }

    // Use the verified booking data
    const booking = specificBooking;

    // Validate payment amount
    if (amount <= 0) {
      return res.status(400).json({ error: 'Payment amount must be greater than 0' });
    }

    // Get existing payments to calculate remaining balance
    const { data: existingPayments } = await supabase
      .from('payments')
      .select('amount')
      .eq('booking_id', booking_id);

    const totalPaid = existingPayments ? existingPayments.reduce((sum, p) => sum + p.amount, 0) : 0;
    const remainingBalance = Math.max(0, booking.amount - totalPaid);

    if (amount > remainingBalance) {
      return res.status(400).json({ 
        error: `Payment amount exceeds remaining balance`,
        details: `Remaining balance is £${remainingBalance}, but you tried to pay £${amount}`
      });
    }

    // Create the payment record
    const { data: payment, error: paymentError } = await supabase
      .from('payments')
      .insert([{
        booking_id,
        amount: parseFloat(amount),
        payment_method,
        reference: reference || null,
        payment_date: new Date().toISOString(),
        recorded_by: req.user.id,
        recorded_by_customer_id: req.user.id
      }])
      .select()
      .single();

    if (paymentError) {
      console.error('Payment creation error:', paymentError);
      return res.status(400).json({ error: paymentError.message });
    }

    // Update booking payment status
    // Get all payments for this booking to calculate total paid
    const { data: allPayments } = await supabase
      .from('payments')
      .select('amount')
      .eq('booking_id', booking_id);

    const newTotalPaid = allPayments ? allPayments.reduce((sum, p) => sum + p.amount, 0) : 0;
    const paymentStatus = newTotalPaid >= booking.amount ? 'paid' : newTotalPaid > 0 ? 'partial' : 'unpaid';

    // Update booking payment status
    await supabase
      .from('bookings')
      .update({ payment_status: paymentStatus })
      .eq('id', booking_id);

    // Log activity
    await supabase
      .from('activity_log')
      .insert([{
        venue_id: booking.venue_id,
        action: `Customer payment of £${amount} recorded`,
        user: req.user.email || req.user.id,
        timestamp: new Date().toISOString()
      }]);

    console.log('Payment successful:', payment);

    res.json({
      message: 'Payment recorded successfully',
      payment: payment,
      booking_status: paymentStatus,
      remaining_balance: Math.max(0, booking.amount - newTotalPaid)
    });
  } catch (error) {
    console.error('Error creating payment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Check if customer can review a booking
router.get('/bookings/:booking_id/can-review', authenticateCustomer, async (req, res) => {
  try {
    const { booking_id } = req.params;

    // Get booking and verify ownership
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('id, customer_id, date, status, payment_status, amount, venue_id')
      .eq('id', booking_id)
      .eq('customer_id', req.user.id)
      .single();

    if (fetchError || !booking) {
      return res.status(404).json({ error: "Booking not found or access denied" });
    }

    // Check if booking date has passed
    const today = new Date().toISOString().split('T')[0];
    const bookingDate = booking.date;

    if (bookingDate >= today) {
      return res.json({
        canReview: false,
        reason: "Cannot review future bookings"
      });
    }

    // Check if booking is confirmed
    if (booking.status !== 'confirmed') {
      return res.json({
        canReview: false,
        reason: "Can only review confirmed bookings"
      });
    }

    // Check if booking is fully paid
    if (booking.payment_status !== 'paid') {
      return res.json({
        canReview: false,
        reason: "Can only review fully paid bookings"
      });
    }

    // Check if review already exists
    const { data: existingReview, error: reviewError } = await supabase
      .from('reviews')
      .select('id')
      .eq('venue_id', booking.venue_id)
      .eq('name', req.user.email) // Using email as identifier for now
      .single();

    if (existingReview) {
      return res.json({
        canReview: false,
        reason: "Review already submitted for this venue",
        hasReview: true
      });
    }

    res.json({
      canReview: true,
      booking: {
        id: booking.id,
        venue_id: booking.venue_id,
        date: booking.date
      }
    });

  } catch (error) {
    console.error('Error checking review eligibility:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Submit a review for a booking
router.post('/bookings/:booking_id/review', authenticateCustomer, async (req, res) => {
  try {
    const { booking_id } = req.params;
    const { rating, content } = req.body;

    // Validate input
    if (!rating || !content) {
      return res.status(400).json({ error: 'Rating and content are required' });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ error: 'Rating must be between 1 and 5' });
    }

    if (content.length < 10) {
      return res.status(400).json({ error: 'Review content must be at least 10 characters' });
    }

    // Get booking and verify ownership and eligibility
    const { data: booking, error: fetchError } = await supabase
      .from('bookings')
      .select('id, customer_id, date, status, payment_status, amount, venue_id')
      .eq('id', booking_id)
      .eq('customer_id', req.user.id)
      .single();

    if (fetchError || !booking) {
      return res.status(404).json({ error: "Booking not found or access denied" });
    }

    // Verify booking eligibility (same checks as can-review endpoint)
    const today = new Date().toISOString().split('T')[0];

    if (booking.date >= today) {
      return res.status(400).json({ error: "Cannot review future bookings" });
    }

    if (booking.status !== 'confirmed') {
      return res.status(400).json({ error: "Can only review confirmed bookings" });
    }

    if (booking.payment_status !== 'paid') {
      return res.status(400).json({ error: "Can only review fully paid bookings" });
    }

    // Get customer info for the review
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('full_name')
      .eq('id', req.user.id)
      .single();

    const reviewerName = customer?.full_name || req.user.email || 'Anonymous';

    // Check if review already exists
    const { data: existingReview, error: reviewError } = await supabase
      .from('reviews')
      .select('id')
      .eq('venue_id', booking.venue_id)
      .eq('name', reviewerName)
      .single();

    if (existingReview) {
      return res.status(400).json({ error: "Review already submitted for this venue" });
    }

    // Create the review
    const { data: review, error: insertError } = await supabase
      .from('reviews')
      .insert([{
        venue_id: booking.venue_id,
        name: reviewerName,
        rating: parseInt(rating),
        content: content.trim(),
        review_date: new Date().toISOString().split('T')[0]
      }])
      .select()
      .single();

    if (insertError) {
      console.error('Error creating review:', insertError);
      return res.status(500).json({ error: 'Failed to create review' });
    }

    // Log activity
    await supabase
      .from('activity_log')
      .insert([{
        venue_id: booking.venue_id,
        action: `Customer review submitted (${rating} stars)`,
        user: reviewerName,
        timestamp: new Date().toISOString()
      }]);

    res.json({
      message: 'Review submitted successfully',
      review: review
    });

  } catch (error) {
    console.error('Error submitting review:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

// Get customer's reviews
router.get('/reviews', authenticateCustomer, async (req, res) => {
  try {
    // Get customer info
    const { data: customer, error: customerError } = await supabase
      .from('customers')
      .select('full_name')
      .eq('id', req.user.id)
      .single();

    const reviewerName = customer?.full_name || req.user.email || 'Anonymous';

    // Get reviews by this customer
    const { data: reviews, error } = await supabase
      .from('reviews')
      .select(`
        *,
        venues:venue_id (
          venue_name,
          venue_title
        )
      `)
      .eq('name', reviewerName)
      .order('review_date', { ascending: false });

    if (error) {
      console.error('Error fetching customer reviews:', error);
      return res.status(500).json({ error: 'Failed to fetch reviews' });
    }

    res.json({ reviews: reviews || [] });

  } catch (error) {
    console.error('Error in get customer reviews:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
