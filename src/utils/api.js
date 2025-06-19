const BASE_URL = 'http://localhost:5001/api/admin/dashboard';
const EMPLOYEE_BOOKING_URL = 'http://localhost:5001/api/admin/employee-booking';
const BOOKING_URL = 'http://localhost:5001/api';

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
export async function checkAvailability(venue_id, date, time_from, time_to, setup_time = 0, breakdown_time = 0, exclude_booking_id = null) {
  const params = new URLSearchParams();
  params.append('venue_id', venue_id);
  params.append('date', date);
  params.append('start_time', time_from);
  params.append('end_time', time_to);
  
  if (setup_time) params.append('setup_time', setup_time);
  if (breakdown_time) params.append('breakdown_time', breakdown_time);
  if (exclude_booking_id) params.append('exclude_booking_id', exclude_booking_id);

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

// Check if a time slot is booked
export function isSlotBooked(timeSlot, bookings) {
  return bookings.some(booking => {
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

// Get specific booking by ID
export async function getBookingById(id) {
  const res = await fetch(`${EMPLOYEE_BOOKING_URL}/bookings/${id}`);
  if (!res.ok) throw new Error('Failed to fetch booking');
  return res.json();
}