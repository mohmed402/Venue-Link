// Helper functions for booking calculations and time handling

export const timeToMinutes = (time) => {
  const [hours, minutes] = time.split(':').map(Number);
  return hours * 60 + minutes;
};

export const normalizeTime = (time) => {
  if (time.includes(':')) {
    const parts = time.split(':');
    return `${parts[0]}:${parts[1]}`;
  }
  return time;
};

export const addHoursToTime = (timeString, hours) => {
  const [h, m] = timeString.split(':').map(Number);
  const date = new Date();
  date.setHours(h, m, 0, 0);
  date.setHours(date.getHours() + hours);
  return date.toTimeString().slice(0, 5);
};

export const addMinutesToTime = (timeStr, minutes) => {
  const [hours, mins] = timeStr.split(':').map(Number);
  const totalMinutes = hours * 60 + mins + minutes;
  const newHours = Math.floor(totalMinutes / 60);
  const newMins = totalMinutes % 60;
  return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
};

export const doBookingsOverlap = (booking1, booking2) => {
  const start1 = timeToMinutes(normalizeTime(booking1.time_from));
  const end1 = timeToMinutes(normalizeTime(booking1.time_to));
  const start2 = timeToMinutes(normalizeTime(booking2.time_from));
  const end2 = timeToMinutes(normalizeTime(booking2.time_to));

  return start1 < end2 && start2 < end1;
};



export const hasConflict = (startTime, endTime, existingBookings, setupTime = 0, breakdownTime = 0, currentBookingId = null, overrideEnabled = false) => {
  if (!startTime || !endTime) return false;

  // Skip conflict checking if override is enabled
  if (overrideEnabled) {
    console.log('🔓 Override availability enabled - skipping conflict check');
    return false;
  }

  // Calculate buffer times for the proposed booking
  const currentSetupHours = parseFloat(setupTime) || 0;
  const currentBreakdownHours = parseFloat(breakdownTime) || 0;

  const proposedBufferStart = currentSetupHours > 0 ? addHoursToTime(startTime, -currentSetupHours) : startTime;
  const proposedBufferEnd = currentBreakdownHours > 0 ? addHoursToTime(endTime, currentBreakdownHours) : endTime;

  // Check against existing bookings with their buffer zones, excluding current booking
  // Only consider non-overridden bookings as real conflicts
  console.log('🔍 Checking conflicts:', {
    startTime,
    endTime,
    existingBookingsCount: existingBookings.length,
    currentBookingId,
    overrideEnabled
  });

  const conflictingBookings = existingBookings.filter(booking => {
    // Skip the current booking if we're editing it
    if (currentBookingId && booking.id === parseInt(currentBookingId)) {
      console.log(`⏭️ Skipping current booking ${booking.id}`);
      return false;
    }

    // Skip overridden bookings - they don't count as real conflicts
    if (booking.override_availability === true) {
      console.log(`🔄 Skipping overridden booking ${booking.id} from conflict check`);
      return false;
    }

    const existingBufferStart = booking.buffer_start_time || booking.time_from;
    const existingBufferEnd = booking.buffer_end_time || booking.time_to;

    // Check for overlap between proposed buffer zone and existing buffer zone
    const hasOverlap = proposedBufferStart < existingBufferEnd && proposedBufferEnd > existingBufferStart;
    
    if (hasOverlap) {
      console.log(`❌ Conflict found with booking ${booking.id}:`, {
        bookingTime: `${booking.time_from}-${booking.time_to}`,
        bufferTime: `${existingBufferStart}-${existingBufferEnd}`,
        override_availability: booking.override_availability,
        proposedTime: `${proposedBufferStart}-${proposedBufferEnd}`
      });
    }

    return hasOverlap;
  });

  console.log(`📊 Conflict check result: ${conflictingBookings.length} conflicts found`);
  return conflictingBookings.length > 0;
};

// Find all bookings that are being overridden by a given override booking
export const findOverriddenBookings = (overrideBooking, allBookings) => {
  if (!overrideBooking.override_availability) {
    return [];
  }

  const overrideStart = timeToMinutes(normalizeTime(overrideBooking.time_from));
  const overrideEnd = timeToMinutes(normalizeTime(overrideBooking.time_to));

  return allBookings.filter(booking => {
    // Don't include the override booking itself
    if (booking.id === overrideBooking.id) {
      return false;
    }

    // Only include non-override bookings that overlap with the override booking
    if (booking.override_availability) {
      return false;
    }

    const bookingStart = timeToMinutes(normalizeTime(booking.time_from));
    const bookingEnd = timeToMinutes(normalizeTime(booking.time_to));

    // Check for time overlap
    return overrideStart < bookingEnd && overrideEnd > bookingStart;
  });
};

// Format time range for display
export const formatTimeRange = (startTime, endTime) => {
  const start = normalizeTime(startTime);
  const end = normalizeTime(endTime);
  return `${start} to ${end}`;
};