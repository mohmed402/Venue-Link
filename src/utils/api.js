const BASE_URL = 'http://localhost:5001/api/admin/dashboard';
const EMPLOYEE_BOOKING_URL = 'http://localhost:5001/api/admin/employee-booking';
const BOOKING_URL = 'http://localhost:5001/api';
const CUSTOMER_URL = 'http://localhost:5001/api/customer';

// Dashboard APIs
export async function getDashboardSummary(venue_id) {
  const res = await fetch(`${BASE_URL}/summary?venue_id=${venue_id}`);
  if (!res.ok) throw new Error('Failed to fetch dashboard summary');
  return res.json();
}

export async function getDashboardTodayBookings(venue_id) {
  const res = await fetch(`${BASE_URL}/today-bookings?venue_id=${venue_id}`);
  if (!res.ok) throw new Error('Failed to fetch today bookings');
  return res.json();
}

export async function getDashboardActivity(venue_id) {
  const res = await fetch(`${BASE_URL}/activity?venue_id=${venue_id}`);
  if (!res.ok) throw new Error('Failed to fetch dashboard activity');
  return res.json();
}

export async function getDashboardAlerts(venue_id) {
  const res = await fetch(`${BASE_URL}/alerts?venue_id=${venue_id}`);
  if (!res.ok) throw new Error('Failed to fetch dashboard alerts');
  return res.json();
}

export async function createDashboardAlert(alertData) {
  const res = await fetch(`${BASE_URL}/alerts`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(alertData),
  });
  if (!res.ok) throw new Error('Failed to create alert');
  return res.json();
}

export async function markAlertAsDone(alertId, staffId) {
  console.log('markAlertAsDone called with:', { alertId, staffId });

  const url = `${BASE_URL}/alerts/${alertId}/done`;
  const body = { recorded_by: staffId };

  console.log('Request URL:', url);
  console.log('Request body:', body);

  const res = await fetch(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  console.log('Response status:', res.status);
  console.log('Response ok:', res.ok);

  if (!res.ok) {
    const errorText = await res.text();
    console.error('Response error:', errorText);
    throw new Error(`Failed to mark alert as done: ${res.status} - ${errorText}`);
  }

  return res.json();
}

// Employee Booking APIs

// Client Management
export async function getClients() {
  const res = await fetch(`${EMPLOYEE_BOOKING_URL}/clients`);
  if (!res.ok) throw new Error('Failed to fetch clients');
  return res.json();
}

export async function createClient(clientData) {
  const res = await fetch(`${EMPLOYEE_BOOKING_URL}/clients`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(clientData),
  });
  if (!res.ok) throw new Error('Failed to create client');
  return res.json();
}

export async function createClientWithoutAuth(clientData) {
  const res = await fetch(`${EMPLOYEE_BOOKING_URL}/clients/no-auth`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(clientData),
  });
  if (!res.ok) throw new Error('Failed to create client');
  return res.json();
}

// Get bookings for a specific date with buffer information
export async function getBookingsByDate(venue_id, date, signal) {
  const params = new URLSearchParams({
    venue_id,
    date
  });
  
  try {
    const res = await fetch(`${BOOKING_URL}/bookings-by-date?${params}`, {
      signal
    });
    
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to get bookings for date: ${res.status} - ${errorText}`);
    }
    
    return await res.json();
  } catch (error) {
    if (error.name === 'AbortError') {
      throw error; // Re-throw abort errors
    }
    console.error('Error fetching bookings:', error);
    throw new Error('Failed to get bookings for date');
  }
}

// Enhanced availability check with setup/breakdown time support
export async function checkAvailability(venue_id, date, time_from, time_to, setup_time = 0, breakdown_time = 0, exclude_booking_id = null, override_availability = false) {
  const params = new URLSearchParams();
  params.append('venue_id', venue_id);
  params.append('date', date);
  params.append('start_time', time_from);
  params.append('end_time', time_to);
  
  if (setup_time) params.append('setup_time', setup_time);
  if (breakdown_time) params.append('breakdown_time', breakdown_time);
  if (exclude_booking_id) params.append('exclude_booking_id', exclude_booking_id);
  if (override_availability) params.append('override_availability', 'true');

  const res = await fetch(`${EMPLOYEE_BOOKING_URL}/availability?${params}`);
  if (!res.ok) throw new Error('Failed to check availability');
  return res.json();
}

// Generate time slots with buffer zones
export function generateTimeSlots(startHour = 8, endHour = 22, intervalMinutes = 30) {
  const slots = [];
  
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minute = 0; minute < 60; minute += intervalMinutes) {
      const timeString = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      slots.push(timeString);
    }
  }
  
  return slots;
}

// Check if a time slot is within buffer zone
export function isSlotInBuffer(timeSlot, bookings) {
  return bookings.some(booking => {
    // Skip overridden bookings - they don't count as real conflicts
    if (booking.override_availability === true) {
      return false;
    }
    
    if (booking.buffer_start_time && booking.buffer_end_time) {
      // Convert times to comparable format (remove seconds if present)
      const slot = timeSlot.substring(0, 5);
      const bufferStart = booking.buffer_start_time.substring(0, 5);
      const bufferEnd = booking.buffer_end_time.substring(0, 5);
      const bookingStart = booking.time_from.substring(0, 5);
      const bookingEnd = booking.time_to.substring(0, 5);
      
      // Check if slot is in setup buffer (before booking start) or breakdown buffer (after booking end)
      const isInSetupBuffer = slot >= bufferStart && slot < bookingStart;
      const isInBreakdownBuffer = slot >= bookingEnd && slot < bufferEnd;
      
      return isInSetupBuffer || isInBreakdownBuffer;
    }
    return false;
  });
}

// Check if a time slot is booked (only considers non-overridden bookings as conflicts)
export function isSlotBooked(timeSlot, bookings) {
  return bookings.some(booking => {
    // Skip overridden bookings - they don't count as real conflicts
    if (booking.override_availability === true) {
      return false;
    }
    
    // Convert times to comparable format (remove seconds if present)
    const slot = timeSlot.substring(0, 5);
    const bookingStart = booking.time_from.substring(0, 5);
    const bookingEnd = booking.time_to.substring(0, 5);
    
    return slot >= bookingStart && slot < bookingEnd;
  });
}

// Calculate booking statistics including buffer zones
export function calculateBookingStats(timeSlots, bookings) {
  let availableCount = 0;
  let bookedCount = 0;
  let bufferCount = 0;

  timeSlots.forEach(slot => {
    if (isSlotBooked(slot, bookings)) {
      bookedCount++;
    } else if (isSlotInBuffer(slot, bookings)) {
      bufferCount++;
    } else {
      availableCount++;
    }
  });

  return {
    available: availableCount,
    booked: bookedCount,
    buffer: bufferCount,
    bookedAndBuffer: bookedCount + bufferCount
  };
}

export async function getVenuePricing(venue_id, date, start_time, end_time, people_count) {
  const params = new URLSearchParams({
    venue_id,
    date,
    start_time,
    end_time,
    people_count
  });
  const res = await fetch(`${EMPLOYEE_BOOKING_URL}/pricing?${params}`);
  if (!res.ok) throw new Error('Failed to get venue pricing');
  return res.json();
}

// Get venue deposit percentage based on booking date
export async function getVenueDepositPercentage(venue_id, booking_date, signal) {
  const params = new URLSearchParams({
    venue_id,
    booking_date
  });
  const res = await fetch(`${EMPLOYEE_BOOKING_URL}/deposit-percentage?${params}`, {
    signal
  });
  if (!res.ok) throw new Error('Failed to get venue deposit percentage');
  return res.json();
}

// Enhanced booking creation with setup/breakdown time support
export async function createBooking(bookingData) {
  const res = await fetch(`${EMPLOYEE_BOOKING_URL}/bookings`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(bookingData),
  });
  if (!res.ok) throw new Error('Failed to create booking');
  return res.json();
}

// Update existing booking with setup/breakdown time support
export async function updateBooking(bookingId, bookingData) {
  console.log('updateBooking called with:', { bookingId, bookingData });

  // Validate booking ID
  if (!bookingId || bookingId === 'undefined' || bookingId === 'null') {
    throw new Error(`Invalid booking ID: ${bookingId}`);
  }

  const url = `${EMPLOYEE_BOOKING_URL}/bookings/${bookingId}`;
  console.log('Update URL:', url);

  try {
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData),
    });

    console.log('Update response status:', res.status);
    console.log('Update response ok:', res.ok);

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Update response error:', errorText);
      throw new Error(`Failed to update booking: ${res.status} ${errorText}`);
    }

    const result = await res.json();
    console.log('Update response data:', result);
    return result;
  } catch (error) {
    console.error('updateBooking error:', error);
    throw error;
  }
}

export async function saveDraftBooking(bookingData) {
  const res = await fetch(`${EMPLOYEE_BOOKING_URL}/bookings/draft`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(bookingData),
  });
  if (!res.ok) throw new Error('Failed to save draft booking');
  return res.json();
}

export async function getDraftBookings(venue_id = 86, date = null) {
  const params = new URLSearchParams({ venue_id });
  if (date) params.append('date', date);
  
  const res = await fetch(`${EMPLOYEE_BOOKING_URL}/bookings/draft?${params}`);
  if (!res.ok) throw new Error('Failed to fetch draft bookings');
  return res.json();
}

export async function deleteDraftBooking(draftId) {
  console.log('Attempting to delete draft booking with ID:', draftId);

  // Validate draft ID
  if (!draftId || draftId === null || draftId === undefined) {
    throw new Error('Invalid draft ID provided for deletion');
  }

  const res = await fetch(`${EMPLOYEE_BOOKING_URL}/bookings/draft/${draftId}`, {
    method: 'DELETE',
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error('Failed to delete draft booking:', {
      status: res.status,
      statusText: res.statusText,
      error: errorText,
      draftId: draftId
    });

    // If the draft is already deleted (404), don't throw an error
    if (res.status === 404) {
      console.log('Draft booking already deleted or not found, continuing...');
      return { message: 'Draft already deleted' };
    }

    throw new Error(`Failed to delete draft booking: ${res.status} ${res.statusText} - ${errorText}`);
  }

  const result = await res.json();
  console.log('Draft booking deleted successfully:', result);
  return result;
}

// Payment Management
export async function addPayment(paymentData) {
  const res = await fetch(`${EMPLOYEE_BOOKING_URL}/payments`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(paymentData),
  });
  if (!res.ok) throw new Error('Failed to add payment');
  return res.json();
}

export async function getPayments(booking_id) {
  const res = await fetch(`${EMPLOYEE_BOOKING_URL}/payments?booking_id=${booking_id}`);
  if (!res.ok) throw new Error('Failed to fetch payments');
  return res.json();
}

// Get all bookings with filters
export async function getAllBookings(filters = {}) {
  const params = new URLSearchParams();

  if (filters.venue_id) params.append('venue_id', filters.venue_id);
  if (filters.status && filters.status !== 'all') params.append('status', filters.status);
  if (filters.date_from) params.append('date_from', filters.date_from);
  if (filters.date_to) params.append('date_to', filters.date_to);
  if (filters.search) params.append('search', filters.search);
  if (filters.limit) params.append('limit', filters.limit);
  if (filters.offset) params.append('offset', filters.offset);

  const res = await fetch(`${EMPLOYEE_BOOKING_URL}/bookings?${params}`);
  if (!res.ok) throw new Error('Failed to fetch bookings');
  return res.json();
}

// Get bookings for calendar display with date range support
export async function getCalendarBookings(venue_id, startDate, endDate) {
  const params = new URLSearchParams({
    venue_id,
    date_from: startDate,
    date_to: endDate
  });

  const res = await fetch(`${EMPLOYEE_BOOKING_URL}/bookings?${params}`);
  if (!res.ok) throw new Error('Failed to fetch calendar bookings');
  return res.json();
}

// Get specific booking by ID
export async function getBookingById(id) {
  const res = await fetch(`${EMPLOYEE_BOOKING_URL}/bookings/${id}`);
  if (!res.ok) throw new Error('Failed to fetch booking');
  return res.json();
}

// Staff Management APIs
export async function getStaff(venue_id = 86) {
  try {
    const res = await fetch(`${EMPLOYEE_BOOKING_URL}/staff?venue_id=${venue_id}`);
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to fetch staff: ${res.status} - ${errorText}`);
    }
    return res.json();
  } catch (error) {
    console.error('getStaff error:', error);
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Cannot connect to server. Please ensure the backend server is running on port 5001.');
    }
    throw error;
  }
}

export async function createStaff(staffData) {
  const res = await fetch(`${EMPLOYEE_BOOKING_URL}/staff`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(staffData),
  });
  if (!res.ok) throw new Error('Failed to create staff member');
  return res.json();
}

export async function updateStaff(staffId, staffData) {
  console.log('updateStaff called with:', { staffId, staffData });

  const url = `${EMPLOYEE_BOOKING_URL}/staff/${staffId}`;
  console.log('Update URL:', url);

  try {
    const res = await fetch(url, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(staffData),
    });

    console.log('Update response status:', res.status);
    console.log('Update response ok:', res.ok);

    if (!res.ok) {
      const errorText = await res.text();
      console.error('Update response error:', errorText);
      throw new Error(`Failed to update staff member: ${res.status} - ${errorText}`);
    }

    const result = await res.json();
    console.log('Update response data:', result);
    return result;
  } catch (error) {
    console.error('updateStaff error:', error);
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Cannot connect to server. Please ensure the backend server is running on port 5001.');
    }
    throw error;
  }
}

export async function deleteStaff(staffId) {
  const res = await fetch(`${EMPLOYEE_BOOKING_URL}/staff/${staffId}`, {
    method: 'DELETE',
  });
  if (!res.ok) throw new Error('Failed to delete staff member');
  return res.json();
}

// Create staff member with auth user
export async function createStaffWithAuth(staffData) {
  const res = await fetch(`${EMPLOYEE_BOOKING_URL}/staff/with-auth`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(staffData),
  });
  if (!res.ok) throw new Error('Failed to create staff member with auth');
  return res.json();
}

// Activity Log APIs
export async function getActivityLog(venue_id = 86, limit = 10) {
  try {
    const params = new URLSearchParams({
      venue_id,
      limit
    });
    const res = await fetch(`${EMPLOYEE_BOOKING_URL}/activity-log?${params}`);
    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to fetch activity log: ${res.status} - ${errorText}`);
    }
    return res.json();
  } catch (error) {
    console.error('getActivityLog error:', error);
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Cannot connect to server. Please ensure the backend server is running on port 5001.');
    }
    throw error;
  }
}

// Customer API Functions

// Get customer profile
export async function getCustomerProfile(token) {
  const res = await fetch(`${CUSTOMER_URL}/profile`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) throw new Error('Failed to fetch customer profile');
  return res.json();
}

// Update customer profile
export async function updateCustomerProfile(token, profileData) {
  const res = await fetch(`${CUSTOMER_URL}/profile`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(profileData),
  });
  if (!res.ok) throw new Error('Failed to update customer profile');
  return res.json();
}

// Get customer bookings
export async function getCustomerBookings(token, status = null) {
  let url = `${CUSTOMER_URL}/bookings`;
  
  if (status) {
    const params = new URLSearchParams();
    params.append('status', status);
    url += `?${params}`;
  }
  
  const res = await fetch(url, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  
  if (!res.ok) {
    throw new Error('Failed to fetch customer bookings');
  }
  return res.json();
}

// Cancel customer booking
export async function cancelCustomerBooking(token, booking_id, cancellation_reason) {
  const res = await fetch(`${CUSTOMER_URL}/bookings/cancel`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ booking_id, cancellation_reason }),
  });
  if (!res.ok) throw new Error('Failed to cancel booking');
  return res.json();
}

// Get customer favorites
export async function getCustomerFavorites(token) {
  const res = await fetch(`${CUSTOMER_URL}/favorites`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) throw new Error('Failed to fetch customer favorites');
  return res.json();
}

// Add venue to favorites
export async function addCustomerFavorite(token, venue_id) {
  const res = await fetch(`${CUSTOMER_URL}/favorites`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ venue_id }),
  });
  if (!res.ok) throw new Error('Failed to add favorite');
  return res.json();
}

// Remove venue from favorites
export async function removeCustomerFavorite(token, venue_id) {
  const res = await fetch(`${CUSTOMER_URL}/favorites`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ venue_id }),
  });
  if (!res.ok) throw new Error('Failed to remove favorite');
  return res.json();
}

// Check if venue is favorited
export async function checkCustomerFavorite(token, venue_id) {
  const res = await fetch(`${CUSTOMER_URL}/favorites/check`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ venue_id }),
  });
  if (!res.ok) throw new Error('Failed to check favorite');
  return res.json();
}

// Get customer payments
export async function getCustomerPayments(token, booking_id = null) {
  const params = new URLSearchParams();
  if (booking_id) params.append('booking_id', booking_id);

  const res = await fetch(`${CUSTOMER_URL}/payments?${params}`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) throw new Error('Failed to fetch customer payments');
  return res.json();
}

// Check if customer can review a booking
export async function canReviewBooking(token, booking_id) {
  const res = await fetch(`${CUSTOMER_URL}/bookings/${booking_id}/can-review`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Failed to check review eligibility (${res.status})`);
  }

  return res.json();
}

// Submit a review for a booking
export async function submitBookingReview(token, booking_id, reviewData) {
  const res = await fetch(`${CUSTOMER_URL}/bookings/${booking_id}/review`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(reviewData),
  });
  if (!res.ok) {
    const error = await res.json();
    throw new Error(error.error || 'Failed to submit review');
  }
  return res.json();
}

// Get customer's reviews
export async function getCustomerReviews(token) {
  const res = await fetch(`${CUSTOMER_URL}/reviews`, {
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
  });
  if (!res.ok) throw new Error('Failed to fetch customer reviews');
  return res.json();
}

// Create customer payment
export async function createCustomerPayment(token, paymentData) {
  const res = await fetch(`${CUSTOMER_URL}/payments`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(paymentData),
  });
  if (!res.ok) throw new Error('Failed to create payment');
  return res.json();
}