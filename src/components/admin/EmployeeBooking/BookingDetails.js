'use client'

import { useState, useEffect, useRef } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { 
  getBookingsByDate, 
  generateTimeSlots, 
  isSlotInBuffer, 
  isSlotBooked, 
  calculateBookingStats 
} from '@/utils/api'
import styles from '@/styles/EmployeeBooking/BookingDetails.module.css'
import { getPaymentStatusInfo, getPaymentStatusIcon } from '@/utils/paymentStatus'

export default function BookingDetails({ isActive, bookingData, setBookingData, loading, error, setupTime = 0, breakdownTime = 0, currentBookingId = null }) {
  const { t, isRTL } = useLanguage();
  const [existingBookings, setExistingBookings] = useState([])
  const [loadingBookings, setLoadingBookings] = useState(false)
  const [bufferMinutes, setBufferMinutes] = useState(0)
  const [venuePricing, setVenuePricing] = useState([])
  const [timeSlots, setTimeSlots] = useState([])
  const [columnsPerRow, setColumnsPerRow] = useState(8)

  // Ref to store AbortController for request cancellation
  const bookingsAbortControllerRef = useRef(null);

  // Handle responsive columns
  useEffect(() => {
    const updateColumnsPerRow = () => {
      if (window.innerWidth <= 768) {
        setColumnsPerRow(4); // Mobile
      } else if (window.innerWidth <= 1024) {
        setColumnsPerRow(6); // Tablet
      } else {
        setColumnsPerRow(8); // Desktop
      }
    };

    // Set initial value
    updateColumnsPerRow();

    // Add resize listener
    window.addEventListener('resize', updateColumnsPerRow);

    // Cleanup
    return () => window.removeEventListener('resize', updateColumnsPerRow);
  }, []);

  // Fetch venue pricing data
  useEffect(() => {
    const fetchVenuePricing = async () => {
      try {
        const response = await fetch(`http://localhost:5001/api/data/venue-pricing/86`)
        if (!response.ok) throw new Error('Failed to fetch venue pricing')
        const data = await response.json()
        setVenuePricing(data)
      } catch (error) {
        console.error('Failed to fetch venue pricing:', error)
        setVenuePricing([])
      }
    }
    
    fetchVenuePricing()
  }, [])

  // Generate time slots based on venue pricing and selected date
  useEffect(() => {
    if (bookingData.eventDate && venuePricing.length > 0) {
      const date = new Date(bookingData.eventDate)
      const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' })
      
      // Find pricing for the selected day
      const dayPricing = venuePricing.find(pricing => 
        pricing.day_of_week.toLowerCase() === dayOfWeek.toLowerCase() && pricing.is_available
      )
      
      if (dayPricing) {
        // Generate time slots based on venue's available hours
        const slots = generateTimeSlots(dayPricing.start_time, dayPricing.end_time)
        setTimeSlots(slots)
      } else {
        // No pricing available for this day
        setTimeSlots([])
      }
    }
  }, [bookingData.eventDate, venuePricing])

  // Load bookings when date changes
  useEffect(() => {
    if (bookingData.eventDate) {
      loadBookingsForDate(bookingData.eventDate)
    }
  }, [bookingData.eventDate])

  const loadBookingsForDate = async (date) => {
    // Cancel previous request if exists
    if (bookingsAbortControllerRef.current) {
      bookingsAbortControllerRef.current.abort()
    }

    const abortController = new AbortController()
    bookingsAbortControllerRef.current = abortController

    setLoadingBookings(true)
    try {
      const bookings = await getBookingsByDate(86, date, abortController.signal)
      setExistingBookings(bookings)
      generateAvailableTimeSlots(bookings)
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Failed to load bookings:', error)
        setExistingBookings([])
      }
    } finally {
      setLoadingBookings(false)
    }
  }

  const generateAvailableTimeSlots = (bookings) => {
    // Generate time slots from 8 AM to 10 PM with 30-minute intervals
    const slots = generateTimeSlots(8, 22, 30);
    setTimeSlots(slots);
  }

  // Check if a time slot is booked
  const isTimeBooked = (timeSlot) => {
    return isSlotBooked(timeSlot, existingBookings);
  }

  // Check if a time slot is in buffer zone
  const isTimeInBuffer = (timeSlot) => {
    return isSlotInBuffer(timeSlot, existingBookings);
  }

  // Check if time slot is in selected range (including setup/breakdown)
  const isTimeInRange = (timeSlot) => {
    if (!bookingData.startTime || !bookingData.endTime) return false;
    
    // Calculate buffer times for current booking
    const currentSetupHours = parseFloat(setupTime) || 0;
    const currentBreakdownHours = parseFloat(breakdownTime) || 0;
    
    // Add helper function to subtract/add hours
    const addHoursToTime = (timeString, hours) => {
      const [h, m] = timeString.split(':').map(Number);
      const date = new Date();
      date.setHours(h, m, 0, 0);
      date.setHours(date.getHours() + hours);
      return date.toTimeString().slice(0, 5);
    };
    
    const bufferStart = currentSetupHours > 0 ? addHoursToTime(bookingData.startTime, -currentSetupHours) : bookingData.startTime;
    const bufferEnd = currentBreakdownHours > 0 ? addHoursToTime(bookingData.endTime, currentBreakdownHours) : bookingData.endTime;
    
    return timeSlot >= bufferStart && timeSlot < bufferEnd;
  }

  // Get booking statistics
  const getBookingStats = () => {
    return calculateBookingStats(timeSlots, existingBookings);
  }

  const stats = getBookingStats();
  const availableSlots = stats.available;
  const bookedSlots = stats.bookedAndBuffer;

  // Check if a proposed time range conflicts with existing bookings (including buffer)
  const hasConflict = (startTime, endTime) => {
    if (!startTime || !endTime) return false;
    
    // Calculate buffer times for the proposed booking
    const currentSetupHours = parseFloat(setupTime) || 0;
    const currentBreakdownHours = parseFloat(breakdownTime) || 0;
    
    // Add helper function to subtract/add hours
    const addHoursToTime = (timeString, hours) => {
      const [h, m] = timeString.split(':').map(Number);
      const date = new Date();
      date.setHours(h, m, 0, 0);
      date.setHours(date.getHours() + hours);
      return date.toTimeString().slice(0, 5);
    };
    
    const proposedBufferStart = currentSetupHours > 0 ? addHoursToTime(startTime, -currentSetupHours) : startTime;
    const proposedBufferEnd = currentBreakdownHours > 0 ? addHoursToTime(endTime, currentBreakdownHours) : endTime;
    
    // Check against all existing bookings with their buffer zones, excluding current booking
    return existingBookings.some(booking => {
      // Skip the current booking if we're editing it
      if (currentBookingId && booking.id === currentBookingId) {
        return false;
      }
      
      const existingBufferStart = booking.buffer_start_time || booking.time_from;
      const existingBufferEnd = booking.buffer_end_time || booking.time_to;
      
      // Check for overlap between proposed buffer zone and existing buffer zone
      return proposedBufferStart < existingBufferEnd && proposedBufferEnd > existingBufferStart;
    });
  };

  if (!isActive) return null

  const convertTimeToMinutes = (time) => {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  };

  // Helper to normalize time format (remove seconds if present)
  const normalizeTime = (time) => {
    if (time.includes(':')) {
      const parts = time.split(':');
      return `${parts[0]}:${parts[1]}`;
    }
    return time;
  };

  const handleTimeSelect = (time) => {
    const getEndTime = (startTime, durationHours = 6) => {
      const [hours, minutes] = startTime.split(':').map(Number);
      const endHours = hours + durationHours;
      return `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    };

    const proposedEndTime = getEndTime(time, bookingData.duration || 6);
    
    // Check for conflicts before allowing selection
    if (hasConflict(time, proposedEndTime)) {
      alert(`This time slot conflicts with existing bookings (including ${bufferMinutes} minute buffer). Please select a different time.`);
      return;
    }

    setBookingData(prev => ({
      ...prev,
      startTime: time,
      endTime: proposedEndTime
    }));
  };

  const handleDurationChange = (newDuration) => {
    const getEndTime = (startTime, durationHours) => {
      const [hours, minutes] = startTime.split(':').map(Number);
      const endHours = hours + durationHours;
      return `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    };

    if (bookingData.startTime) {
      const proposedEndTime = getEndTime(bookingData.startTime, newDuration);
      
      // Check for conflicts with new duration
      if (hasConflict(bookingData.startTime, proposedEndTime)) {
        alert(`This duration conflicts with existing bookings (including ${bufferMinutes} minute buffer). Please select a shorter duration or different start time.`);
        return;
      }
    }

    setBookingData(prev => ({
      ...prev,
      duration: newDuration,
      endTime: prev.startTime ? getEndTime(prev.startTime, newDuration) : ''
    }));
  };

  const handleBookFullDay = () => {
    // Check for conflicts with full day booking
    if (hasConflict('08:00', '22:00')) {
      alert(`Full day booking conflicts with existing bookings (including ${bufferMinutes} minute buffer). Please check the time slots.`);
      return;
    }
    
    setBookingData(prev => ({
      ...prev,
      startTime: '08:00',
      endTime: '22:00',
      duration: 14
    }));
  };

  return (
    <div className={`${styles.container} ${isRTL ? styles.rtl : ''}`}>
      <h2 className={styles.title}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" fill="currentColor"/>
        </svg>
        {t('booking_details.title')}
      </h2>

      {error && (
        <div className={styles.error}>
          {error}
        </div>
      )}

      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label>{t('booking_details.event_date')} *</label>
          <input
            type="date"
            className={styles.input}
            value={bookingData.eventDate}
            onChange={(e) => setBookingData({ ...bookingData, eventDate: e.target.value })}
          />
        </div>

        <div className={styles.formGroup}>
          <label>{t('booking_details.event_type')}</label>
          <select
            className={styles.input}
            value={bookingData.eventType}
            onChange={(e) => setBookingData({ ...bookingData, eventType: e.target.value })}
          >
            <option value="">{t('booking_details.select_event_type')}</option>
            <option value="wedding">{t('event_type.wedding')}</option>
            <option value="corporate">{t('event_type.corporate')}</option>
            <option value="birthday">{t('event_type.birthday')}</option>
            <option value="anniversary">{t('event_type.anniversary')}</option>
            <option value="meeting">{t('event_type.meeting')}</option>
            <option value="conference">{t('event_type.conference')}</option>
            <option value="other">{t('event_type.other')}</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label>{t('booking_details.number_of_guests')}</label>
          <input
            type="number"
            className={styles.input}
            value={bookingData.guestCount}
            onChange={(e) => setBookingData({ ...bookingData, guestCount: e.target.value })}
            placeholder={t('booking_details.guests_placeholder')}
            min="1"
          />
        </div>

        <div className={styles.formGroup}>
          <label>{t('booking_details.duration')}</label>
          <select
            className={styles.input}
            value={bookingData.duration}
            onChange={(e) => handleDurationChange(Number(e.target.value))}
          >
            <option value="">{t('booking_details.select_duration')}</option>
            <option value="2">{t('duration.2_hours')}</option>
            <option value="3">{t('duration.3_hours')}</option>
            <option value="4">{t('duration.4_hours')}</option>
            <option value="5">{t('duration.5_hours')}</option>
            <option value="6">{t('duration.6_hours')}</option>
            <option value="8">{t('duration.8_hours')}</option>
            <option value="10">{t('duration.10_hours')}</option>
            <option value="12">{t('duration.12_hours')}</option>
            <option value="14">{t('duration.full_day')}</option>
          </select>
        </div>

        <div className={styles.formGroup}>
          <label>{t('booking_details.special_notes')}</label>
          <textarea
            className={styles.textarea}
            value={bookingData.notes}
            onChange={(e) => setBookingData({ ...bookingData, notes: e.target.value })}
            placeholder={t('booking_details.notes_placeholder')}
            rows="3"
          />
        </div>
      </div>

      {bookingData.eventDate && (
        <div className={styles.timeSlotSection}>
          <div className={styles.sectionHeader}>
            <h3>{t('booking_details.available_time_slots')}</h3>
            {loadingBookings ? (
              <div className={styles.loadingIndicator}>{t('common.loading')}</div>
            ) : (
              <div className={styles.stats}>
                <div className={styles.statItem}>
                  <div className={`${styles.statIcon} ${styles.available}`}></div>
                  <span>{stats.available} {t('booking_details.available')}</span>
                </div>
                <div className={styles.statItem}>
                  <div className={`${styles.statIcon} ${styles.booked}`}></div>
                  <span>{stats.booked} {t('booking_details.booked')}</span>
                </div>
                <div className={styles.statItem}>
                  <div className={`${styles.statIcon} ${styles.buffer}`}></div>
                  <span>{stats.buffer} {t('booking_details.buffer')}</span>
                </div>
              </div>
            )}
          </div>

          {timeSlots.length > 0 ? (
            <div 
              className={styles.timeGridContainer}
              style={{
                '--grid-rows': Math.ceil(timeSlots.length / columnsPerRow)
              }}
            >
              <div className={styles.timeGrid}>
                {timeSlots.map((time) => {
                  const isBooked = isSlotBooked(time, existingBookings);
                  const isBuffer = isSlotInBuffer(time, existingBookings);
                  const isSelected = isTimeInRange(time);
                  const isUnavailable = isBooked || isBuffer;

                  return (
                    <button
                      key={time}
                      className={`${styles.timeSlot} ${
                        isSelected ? styles.selected :
                        isBooked ? styles.bookedSlot : // Don't highlight individual booked slots
                        isBuffer ? styles.bufferSlot : // Don't highlight individual buffer slots
                        styles.available
                      }`}
                      onClick={() => !isUnavailable && handleTimeSelect(time)}
                      disabled={isUnavailable}
                      title={
                        isBooked ? t('time_slot.booked') :
                        isBuffer ? `${t('time_slot.buffer')} (${setupTime || breakdownTime || 'default'} hrs)` :
                        isSelected ? t('time_slot.selected') :
                        t('time_slot.available')
                      }
                    >
                      {time}
                      {isBuffer && <span className={styles.bufferIndicator}>●</span>}
                    </button>
                  );
                })}
              </div>
              
              {/* Render continuous booking bars and buffer bars */}
              <div className={styles.bookingBars}>
                {/* Render buffer bars first (so they appear behind booking bars) */}
                {existingBookings.flatMap((booking, index) => {
                  const bookingStart = normalizeTime(booking.time_from);
                  const bookingEnd = normalizeTime(booking.time_to);
                  
                  // Calculate buffer times (30 min before and after for demo)
                  const addMinutesToTime = (timeStr, minutes) => {
                    const [hours, mins] = timeStr.split(':').map(Number);
                    const totalMinutes = hours * 60 + mins + minutes;
                    const newHours = Math.floor(totalMinutes / 60);
                    const newMins = totalMinutes % 60;
                    return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
                  };
                  
                  const setupStart = addMinutesToTime(bookingStart, -30);
                  const setupEnd = bookingStart;
                  const breakdownStart = bookingEnd;
                  const breakdownEnd = addMinutesToTime(bookingEnd, 30);
                  
                  const buffers = [];
                  
                  // Setup buffer bar (before booking)
                  const setupStartSlot = timeSlots.findIndex(slot => slot === setupStart);
                  const setupEndSlot = timeSlots.findIndex(slot => slot === setupEnd);
                  
                  if (setupStartSlot !== -1 && setupEndSlot !== -1) {
                    const setupWidth = setupEndSlot - setupStartSlot;
                    if (setupWidth > 0) {
                      const setupRow = Math.floor(setupStartSlot / columnsPerRow);
                      const setupCol = setupStartSlot % columnsPerRow;
                      const actualSetupWidth = Math.min(setupWidth, columnsPerRow - setupCol);
                      
                      buffers.push(
                        <div
                          key={`setup-bar-${index}`}
                          className={`${styles.bufferBar} ${styles.setupBar}`}
                          style={{
                            left: `${(setupCol / columnsPerRow) * 100}%`,
                            width: `${(actualSetupWidth / columnsPerRow) * 100}%`,
                            top: `${(setupRow / Math.ceil(timeSlots.length / columnsPerRow)) * 100}%`
                          }}
                          title={`Setup time for ${booking.customer?.full_name || `Customer #${booking.customer_id?.slice(-8)}`} - ${setupStart} to ${setupEnd}`}
                        >
                          <span className={styles.bufferBarText}>
                            Setup
                          </span>
                          <span className={styles.bufferBarTime}>
                            {setupStart} - {setupEnd}
                          </span>
                        </div>
                      );
                    }
                  }
                  
                  // Breakdown buffer bar (after booking)
                  const breakdownStartSlot = timeSlots.findIndex(slot => slot === breakdownStart);
                  let breakdownEndSlot = timeSlots.findIndex(slot => slot >= breakdownEnd);
                  
                  // Calculate actual end index for breakdown
                  if (breakdownEndSlot === -1 || timeSlots[breakdownEndSlot] !== breakdownEnd) {
                    for (let i = breakdownStartSlot; i < timeSlots.length; i++) {
                      const slotTime = timeSlots[i];
                      const nextSlotIndex = i + 1;
                      const nextSlotTime = nextSlotIndex < timeSlots.length ? timeSlots[nextSlotIndex] : '24:00';
                      
                      if (breakdownEnd > slotTime && breakdownEnd <= nextSlotTime) {
                        breakdownEndSlot = nextSlotIndex;
                        break;
                      }
                    }
                    if (breakdownEndSlot === -1) breakdownEndSlot = timeSlots.length;
                  }
                  
                  if (breakdownStartSlot !== -1 && breakdownEndSlot !== -1) {
                    const breakdownWidth = breakdownEndSlot - breakdownStartSlot;
                    if (breakdownWidth > 0) {
                      const breakdownRow = Math.floor(breakdownStartSlot / columnsPerRow);
                      const breakdownCol = breakdownStartSlot % columnsPerRow;
                      const actualBreakdownWidth = Math.min(breakdownWidth, columnsPerRow - breakdownCol);
                      
                      buffers.push(
                        <div
                          key={`breakdown-bar-${index}`}
                          className={`${styles.bufferBar} ${styles.breakdownBar}`}
                          style={{
                            left: `${(breakdownCol / columnsPerRow) * 100}%`,
                            width: `${(actualBreakdownWidth / columnsPerRow) * 100}%`,
                            top: `${(breakdownRow / Math.ceil(timeSlots.length / columnsPerRow)) * 100}%`
                          }}
                          title={`Breakdown time for ${booking.customer?.full_name || `Customer #${booking.customer_id?.slice(-8)}`} - ${breakdownStart} to ${breakdownEnd}`}
                        >
                          <span className={styles.bufferBarText}>
                            Breakdown
                          </span>
                          <span className={styles.bufferBarTime}>
                            {breakdownStart} - {breakdownEnd}
                          </span>
                        </div>
                      );
                    }
                  }
                  
                  return buffers;
                })}
                
                {/* Render booking bars */}
                {existingBookings.map((booking, index) => {
                  // Calculate position and width of booking bar
                  const startTime = normalizeTime(booking.time_from);
                  const endTime = normalizeTime(booking.time_to);
                  
                  // Find start and end slot indices
                  const startSlotIndex = timeSlots.findIndex(slot => slot === startTime);
                  const endSlotIndex = timeSlots.findIndex(slot => slot >= endTime);
                  
                  if (startSlotIndex === -1) return null;
                  
                  // Calculate actual end index (if endTime doesn't match exactly, find the slot that would contain it)
                  let actualEndIndex = endSlotIndex;
                  if (endSlotIndex === -1 || timeSlots[endSlotIndex] !== endTime) {
                    // Find the slot that the end time falls into
                    for (let i = startSlotIndex; i < timeSlots.length; i++) {
                      const slotTime = timeSlots[i];
                      const nextSlotIndex = i + 1;
                      const nextSlotTime = nextSlotIndex < timeSlots.length ? timeSlots[nextSlotIndex] : '24:00';
                      
                      if (endTime > slotTime && endTime <= nextSlotTime) {
                        actualEndIndex = nextSlotIndex;
                        break;
                      }
                    }
                    if (actualEndIndex === -1) actualEndIndex = timeSlots.length;
                  }
                  
                  const width = actualEndIndex - startSlotIndex;
                  
                  if (width <= 0) return null;
                  
                  // Determine booking type for styling
                  let bookingType = 'confirmed';
                  if (booking.status === 'cancelled') {
                    bookingType = 'cancelled';
                  } else if (booking.payment_status === 'unpaid' && booking.status === 'pending') {
                    bookingType = 'pending';
                  }
                  
                  // Calculate row and column positions
                  const startRow = Math.floor(startSlotIndex / columnsPerRow);
                  const startCol = startSlotIndex % columnsPerRow;
                  const endCol = Math.min(startCol + width - 1, columnsPerRow - 1);
                  const actualWidth = endCol - startCol + 1;
                  
                  return (
                    <div
                      key={`booking-bar-${index}`}
                      className={`${styles.bookingBar} ${styles[bookingType]}`}
                      style={{
                        left: `${(startCol / columnsPerRow) * 100}%`,
                        width: `${(actualWidth / columnsPerRow) * 100}%`,
                        top: `${(startRow / Math.ceil(timeSlots.length / columnsPerRow)) * 100}%`
                      }}
                      title={`${booking.customer?.full_name || `Customer #${booking.customer_id?.slice(-8)}`} - ${startTime} to ${endTime}`}
                    >
                      <span className={styles.bookingBarText}>
                        {booking.customer?.full_name || `Customer #${booking.customer_id?.slice(-8) || 'Unknown'}`}
                      </span>
                      <span className={styles.bookingBarTime}>
                        {startTime} - {endTime}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className={styles.noSlots}>
              {t('booking_details.no_slots')}
            </div>
          )}

          {bookingData.startTime && bookingData.endTime && (
            <div className={styles.selectedTime}>
              <h4>Selected Time</h4>
              <p>{bookingData.startTime} - {bookingData.endTime} ({bookingData.duration} hours)</p>
            </div>
          )}

          {existingBookings.length > 0 && (
            <div className={styles.existingBookings}>
              <h4>Existing Bookings</h4>
              <div className={styles.bookingsList}>
                {existingBookings.map((booking, index) => {
                  // Calculate time until booking
                  const bookingDateTime = new Date(`${booking.date}T${booking.time_from}`);
                  const now = new Date();
                  const hoursUntil = (bookingDateTime - now) / (1000 * 60 * 60);
                  const daysUntil = Math.ceil(hoursUntil / 24);
                  
                  // Calculate duration
                  const startTime = booking.time_from.split(':');
                  const endTime = booking.time_to.split(':');
                  const startMinutes = parseInt(startTime[0]) * 60 + parseInt(startTime[1]);
                  const endMinutes = parseInt(endTime[0]) * 60 + parseInt(endTime[1]);
                  const durationHours = (endMinutes - startMinutes) / 60;
                  
                  // Calculate 48-hour hold information for online bookings
                  const holdExpiresAt = booking.hold_expires_at ? new Date(booking.hold_expires_at) : null;
                  const hoursUntilHoldExpires = holdExpiresAt ? (holdExpiresAt - now) / (1000 * 60 * 60) : 0;
                  const isHoldActive = booking.is_online && booking.status === 'pending' && holdExpiresAt && hoursUntilHoldExpires > 0;
                  const isHoldExpired = booking.is_online && booking.status === 'pending' && holdExpiresAt && hoursUntilHoldExpires <= 0;
                  
                  // Determine risk level for cancellation
                  const getRiskLevel = () => {
                    if (isHoldExpired) return 'expired';
                    if (booking.status === 'pending') return 'high';
                    if (daysUntil <= 7) return 'medium';
                    if (daysUntil <= 30) return 'low';
                    return 'very-low';
                  };
                  
                  const riskLevel = getRiskLevel();
                  
                  // Format hold time remaining
                  const formatHoldTimeRemaining = () => {
                    if (!booking.is_online || booking.status !== 'pending') return null;
                    
                    if (hoursUntilHoldExpires <= 0) {
                      return 'Hold expired - Available for walk-ins';
                    }
                    
                    if (hoursUntilHoldExpires < 1) {
                      const minutesRemaining = Math.ceil(hoursUntilHoldExpires * 60);
                      return `${minutesRemaining} minutes left to confirm`;
                    }
                    
                    if (hoursUntilHoldExpires < 24) {
                      const hoursRemaining = Math.floor(hoursUntilHoldExpires);
                      const minutesRemaining = Math.ceil((hoursUntilHoldExpires - hoursRemaining) * 60);
                      if (minutesRemaining > 0) {
                        return `${hoursRemaining}h ${minutesRemaining}m left to confirm`;
                      } else {
                        return `${hoursRemaining} hours left to confirm`;
                      }
                    }
                    
                    const daysRemaining = Math.floor(hoursUntilHoldExpires / 24);
                    const remainingHours = Math.floor(hoursUntilHoldExpires % 24);
                    if (remainingHours > 0) {
                      return `${daysRemaining}d ${remainingHours}h left to confirm`;
                    } else {
                      return `${daysRemaining} days left to confirm`;
                    }
                  };
                  
                  // Get urgency level for countdown styling
                  const getCountdownUrgency = () => {
                    if (!booking.is_online || booking.status !== 'pending') return 'none';
                    if (hoursUntilHoldExpires <= 0) return 'expired';
                    if (hoursUntilHoldExpires < 2) return 'critical';
                    if (hoursUntilHoldExpires < 12) return 'urgent';
                    return 'normal';
                  };
                  
                  const countdownUrgency = getCountdownUrgency();
                  
                  return (
                    <div key={index} className={`${styles.bookingCard} ${styles[riskLevel]}`}>
                      <div className={styles.bookingHeader}>
                        <div className={styles.bookingTime}>
                          <span className={styles.timeRange}>
                            {normalizeTime(booking.time_from)} - {normalizeTime(booking.time_to)}
                          </span>
                          <span className={styles.duration}>({durationHours}h)</span>
                        </div>
                        <div className={styles.bookingBadges}>
                          <span className={`${styles.statusBadge} ${styles[booking.status]}`}>
                            {booking.status}
                          </span>
                          <span className={`${styles.sourceBadge} ${booking.is_online ? styles.online : styles.inPerson}`}>
                            {booking.is_online ? (
                              <>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                                </svg>
                                Online
                              </>
                            ) : (
                              <>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                                </svg>
                                In-Person
                              </>
                            )}
                          </span>
                          <span 
                            className={`${styles.paymentBadge} ${styles[getPaymentStatusInfo(booking.payment_status).className]}`}
                            title={getPaymentStatusInfo(booking.payment_status).description}
                          >
                            {getPaymentStatusIcon(booking.payment_status)}
                            {getPaymentStatusInfo(booking.payment_status).label}
                          </span>
                          {isHoldExpired && (
                            <span className={styles.expiredBadge}>
                              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm3.5 6L12 10.5 8.5 8 7 9.5l3.5 3.5L7 16.5 8.5 18l3.5-3.5L15.5 18 17 16.5 13.5 13 17 9.5 15.5 8z"/>
                              </svg>
                              Hold Expired
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* 48-Hour Hold Information for Online Bookings */}
                      {booking.is_online && booking.status === 'pending' && (
                        <div className={`${styles.holdInfo} ${isHoldExpired ? styles.holdExpired : styles.holdActive}`}>
                          <div className={styles.holdHeader}>
                            <span className={styles.holdIcon}>
                              {isHoldExpired ? (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6z"/>
                                </svg>
                              ) : (
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M15 1H9v2h6V1zm-4 13h2V8h-2v6zm8.03-6.61l1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42C16.07 4.74 14.12 4 12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9 9-4.03 9-9c0-2.12-.74-4.07-1.97-5.61zM12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
                                </svg>
                              )}
                            </span>
                            <span className={styles.holdTitle}>
                              {isHoldExpired ? 'Hold Period Expired' : '48-Hour Hold Active'}
                            </span>
                          </div>
                          <div className={styles.holdDetails}>
                            <div className={`${styles.countdownDisplay} ${styles[countdownUrgency]}`}>
                              <span className={styles.countdownIcon}>
                                {countdownUrgency === 'critical' && (
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                                  </svg>
                                )}
                                {countdownUrgency === 'urgent' && (
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                                  </svg>
                                )}
                                {countdownUrgency === 'normal' && (
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M15 1H9v2h6V1zm-4 13h2V8h-2v6zm8.03-6.61l1.42-1.42c-.43-.51-.9-.99-1.41-1.41l-1.42 1.42C16.07 4.74 14.12 4 12 4c-4.97 0-9 4.03-9 9s4.02 9 9 9 9-4.03 9-9c0-2.12-.74-4.07-1.97-5.61zM12 20c-3.87 0-7-3.13-7-7s3.13-7 7-7 7 3.13 7 7-3.13 7-7 7z"/>
                                  </svg>
                                )}
                                {countdownUrgency === 'expired' && (
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6z"/>
                                  </svg>
                                )}
                              </span>
                              <span className={styles.countdownTime}>
                                {formatHoldTimeRemaining()}
                              </span>
                            </div>
                            {isHoldExpired ? (
                              <span className={styles.walkInAvailable}>
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                                </svg>
                                This slot can be offered to walk-in customers
                              </span>
                            ) : (
                              <span className={styles.holdInstructions}>
                                Customer must visit in-person to pay deposit and confirm
                              </span>
                            )}
                          </div>
                        </div>
                      )}
                      
                      <div className={styles.bookingDetails}>
                        <div className={styles.customerInfo}>
                          <div className={styles.customerName}>
                            <strong>{booking.customer?.full_name || `Customer #${booking.customer_id?.slice(-8) || 'Unknown'}`}</strong>
                          </div>
                          {booking.customer?.phone_number && (
                            <div className={styles.customerPhone}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                              </svg>
                              {booking.customer.phone_number}
                            </div>
                          )}
                        </div>
                        
                        <div className={styles.bookingMeta}>
                          <div className={styles.eventInfo}>
                            <span className={styles.eventType}>
                              {booking.event_type || 'Event'} • {booking.people_count || 0} guests
                            </span>
                          </div>
                          
                          {booking.amount && (
                            <div className={styles.financialInfo}>
                              <span className={styles.totalAmount}>
                                Total: £{booking.amount.toFixed(2)}
                              </span>
                              {booking.deposit_amount && (
                                <span className={styles.depositAmount}>
                                  Deposit: £{booking.deposit_amount.toFixed(2)}
                                </span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className={styles.bookingFooter}>
                        <div className={styles.riskIndicator}>
                          <span className={`${styles.riskBadge} ${styles[riskLevel]}`}>
                            {riskLevel === 'expired' && (
                              <>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6z"/>
                                </svg>
                                Available
                              </>
                            )}
                            {riskLevel === 'high' && (
                              <>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z"/>
                                </svg>
                                High Risk
                              </>
                            )}
                            {riskLevel === 'medium' && (
                              <>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M7 14l5-5 5 5z"/>
                                </svg>
                                Medium Risk
                              </>
                            )}
                            {riskLevel === 'low' && (
                              <>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/>
                                </svg>
                                Low Risk
                              </>
                            )}
                            {riskLevel === 'very-low' && (
                              <>
                                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M12 1L3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4z"/>
                                </svg>
                                Secure
                              </>
                            )}
                          </span>
                          <span className={styles.timeUntil}>
                            {daysUntil > 0 ? `${daysUntil} days away` : 
                             hoursUntil > 0 ? `${Math.ceil(hoursUntil)} hours away` : 
                             'Today'}
                          </span>
                        </div>
                        
                        {booking.notes && (
                          <div className={styles.bookingNotes}>
                            <span className={styles.notesLabel}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
                              </svg>
                              Notes:
                            </span>
                            <span className={styles.notesText}>{booking.notes}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {!bookingData.eventDate && (
        <div className={styles.noSlots}>
          {t('booking_details.select_date')}
        </div>
      )}
    </div>
  )
} 