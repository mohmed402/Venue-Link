'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import {
  getBookingsByDate,
  generateTimeSlots,
  isSlotInBuffer,
  isSlotBooked,
  calculateBookingStats,
  getDraftBookings
} from '@/utils/api'
import styles from '@/styles/EmployeeBooking/BookingDetails.module.css'

import ExistingBookingsList from './ExistingBookingsList'
import DraftBookingsList from './DraftBookingsList'
import TimeSlotGrid from './TimeSlotGrid'
import AlertNotification from '../../AlertNotification'
import { 
  timeToMinutes, 
  normalizeTime, 
  addHoursToTime, 
  addMinutesToTime,
  doBookingsOverlap,
  hasConflict 
} from '@/utils/booking/bookingHelpers'

export default function BookingDetails({ isActive, bookingData, setBookingData, loading, error, setupTime = 0, breakdownTime = 0, currentBookingId = null, adminControls = null, refreshTrigger = 0 }) {
  const { t, isRTL } = useLanguage();
  const [existingBookings, setExistingBookings] = useState([])
  const [draftBookings, setDraftBookings] = useState([])
  const [loadingBookings, setLoadingBookings] = useState(false)
  const [loadingDrafts, setLoadingDrafts] = useState(false)
  const [bufferMinutes, setBufferMinutes] = useState(0)
  const [venuePricing, setVenuePricing] = useState([])
  const [timeSlots, setTimeSlots] = useState([])
  const [columnsPerRow, setColumnsPerRow] = useState(8)
  const [selectedBooking, setSelectedBooking] = useState(null)
  const [selectedDraft, setSelectedDraft] = useState(null)
  const [viewMode, setViewMode] = useState('bars')
  const [overrideFilter, setOverrideFilter] = useState('all') // 'all', 'hide', 'only'

  // Alert notification state
  const [alertNotification, setAlertNotification] = useState({
    isVisible: false,
    title: '',
    message: '',
    type: 'warning'
  })

  // Ref to store AbortController for request cancellation
  const bookingsAbortControllerRef = useRef(null);

  // Helper function to show alert notifications
  const showAlert = (title, message, type = 'warning') => {
    setAlertNotification({
      isVisible: true,
      title,
      message,
      type
    });
  };

  // Helper function to close alert notifications
  const closeAlert = () => {
    setAlertNotification({
      isVisible: false,
      title: '',
      message: '',
      type: 'warning'
    });
  };

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
        // Parse start and end times from venue pricing (format: "HH:MM:SS" or "HH:MM")
        const parseTimeToHour = (timeStr) => {
          const timeParts = timeStr.split(':');
          return parseInt(timeParts[0], 10);
        };
        
        const startHour = parseTimeToHour(dayPricing.start_time);
        const endHour = parseTimeToHour(dayPricing.end_time);
        
        // Generate time slots based on venue's available hours
        // Add 1 to endHour to include the closing time slot (e.g., if venue closes at 23:00, include 23:00 slot)
        const slots = generateTimeSlots(startHour, endHour + 1, 30)
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
      loadDraftBookingsForDate(bookingData.eventDate)
    }
  }, [bookingData.eventDate])

  // Refresh bookings when refreshTrigger changes (after booking creation/update)
  useEffect(() => {
    if (refreshTrigger > 0 && bookingData.eventDate) {
      console.log('Refreshing bookings due to trigger:', refreshTrigger);
      loadBookingsForDate(bookingData.eventDate)
      loadDraftBookingsForDate(bookingData.eventDate)
    }
  }, [refreshTrigger, bookingData.eventDate])

  // Clear selected booking when date changes
  useEffect(() => {
    setSelectedBooking(null)
  }, [bookingData.eventDate])

  // Reset duration and time selection when date changes
  useEffect(() => {
    setBookingData(prev => ({
      ...prev,
      duration: '', // Reset to empty to show "Select duration"
      startTime: '',
      endTime: ''
    }))
  }, [bookingData.eventDate, setBookingData])

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
      
      // Filter out the current booking being modified from existing bookings
      // This allows the user to reselect time slots that were previously occupied by the booking being modified
      const filteredBookings = currentBookingId 
        ? bookings.filter(booking => booking.id !== parseInt(currentBookingId))
        : bookings;
      
      setExistingBookings(filteredBookings)
      // Don't regenerate time slots here - they should already be set based on venue pricing
    } catch (error) {
      if (error.name !== 'AbortError') {
        console.error('Failed to load bookings:', error)
        setExistingBookings([])
      }
    } finally {
      setLoadingBookings(false)
    }
  }

  const loadDraftBookingsForDate = async (date) => {
    setLoadingDrafts(true)
    try {
      const drafts = await getDraftBookings(86, date)
      setDraftBookings(drafts)
    } catch (error) {
      console.error('Failed to load draft bookings:', error)
      setDraftBookings([])
    } finally {
      setLoadingDrafts(false)
    }
  }

  // Handle draft selection
  const handleDraftClick = (draft) => {
    setSelectedDraft(draft === selectedDraft ? null : draft)
    // Clear selected booking when selecting a draft
    setSelectedBooking(null)
  }

  // Resume draft booking
  const handleResumeDraft = (draft) => {
    try {
      console.log('Resuming draft booking:', draft);
      console.log('Setting draftId to:', draft.id);

      // Populate the booking form with draft data
      setBookingData(prev => ({
        ...prev,
        eventDate: draft.date || prev.eventDate,
        startTime: draft.time_from || '',
        endTime: draft.time_to || '',
        duration: draft.time_from && draft.time_to ?
          calculateDuration(draft.time_from, draft.time_to) : '',
        peopleCount: draft.guests || '',
        eventType: draft.event_type || '',
        totalAmount: draft.amount || 0,
        depositAmount: draft.deposit_amount || 0,
        client: draft.customer || null,
        draftId: draft.id // Store draft ID for deletion when booking is completed
      }))

      // Update admin controls if available
      if (adminControls && typeof adminControls.setNotes === 'function') {
        adminControls.setNotes(draft.notes || '')
      }
      if (adminControls && typeof adminControls.setSetupTime === 'function') {
        adminControls.setSetupTime(draft.setup_time || 0)
      }
      if (adminControls && typeof adminControls.setBreakdownTime === 'function') {
        adminControls.setBreakdownTime(draft.breakdown_time || 0)
      }

      showAlert('Draft Resumed', 'Draft booking has been loaded. You can continue editing and complete the booking.', 'success')
    } catch (error) {
      console.error('Failed to resume draft:', error)
      showAlert('Resume Failed', 'Failed to resume draft booking. Please try again.', 'error')
    }
  }

  // Delete draft booking
  const handleDeleteDraft = async (draftId) => {
    try {
      const response = await fetch(`http://localhost:5001/api/admin/employee-booking/bookings/draft/${draftId}`, {
        method: 'DELETE'
      })
      
      if (!response.ok) throw new Error('Failed to delete draft')
      
      // Reload draft bookings
      if (bookingData.eventDate) {
        loadDraftBookingsForDate(bookingData.eventDate)
      }
      
      // Clear selected draft if it was deleted
      if (selectedDraft && selectedDraft.id === draftId) {
        setSelectedDraft(null)
      }
      
      showAlert('Draft Deleted', 'Draft booking has been deleted successfully.', 'success')
    } catch (error) {
      console.error('Failed to delete draft:', error)
      showAlert('Delete Failed', 'Failed to delete draft booking. Please try again.', 'error')
    }
  }

  // Helper function to calculate duration from time strings
  const calculateDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return ''
    
    const startMinutes = timeToMinutes(startTime)
    const endMinutes = timeToMinutes(endTime)
    const durationMinutes = endMinutes - startMinutes
    const durationHours = durationMinutes / 60
    
    return durationHours.toString()
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

  // Check if time slot belongs to selected booking (including buffer)
  const isTimeInSelectedBooking = (timeSlot) => {
    if (!selectedBooking) return false;
    
    const bookingStart = normalizeTime(selectedBooking.time_from);
    const bookingEnd = normalizeTime(selectedBooking.time_to);
    
    // Add helper function to subtract/add hours from time
    const addMinutesToTime = (timeStr, minutes) => {
      const [hours, mins] = timeStr.split(':').map(Number);
      const totalMinutes = hours * 60 + mins + minutes;
      const newHours = Math.floor(totalMinutes / 60);
      const newMins = totalMinutes % 60;
      return `${newHours.toString().padStart(2, '0')}:${newMins.toString().padStart(2, '0')}`;
    };
    
    // Use the selected booking's setup and breakdown times (convert hours to minutes)
    const bookingSetupMinutes = (selectedBooking.setup_time || 0.5) * 60;
    const bookingBreakdownMinutes = (selectedBooking.breakdown_time || 0.5) * 60;
    
    const bufferStart = addMinutesToTime(bookingStart, -bookingSetupMinutes);
    const bufferEnd = addMinutesToTime(bookingEnd, bookingBreakdownMinutes);
    
    return timeSlot >= bufferStart && timeSlot < bufferEnd;
  }

  // Handle booking card click to highlight time slots
  const handleBookingClick = (booking) => {
    if (selectedBooking && selectedBooking.id === booking.id) {
      // Deselect if clicking the same booking
      setSelectedBooking(null);
    } else {
      // Select the new booking
      setSelectedBooking(booking);
    }
  }

  // Get booking statistics
  const getBookingStats = () => {
    return calculateBookingStats(timeSlots, existingBookings);
  }

  const stats = getBookingStats();
  const availableSlots = stats.available;
  const bookedSlots = stats.bookedAndBuffer;

  // Check if a proposed time range conflicts with existing bookings (including buffer)
  const checkConflict = (startTime, endTime) => {
    return hasConflict(
      startTime, 
      endTime, 
      existingBookings, 
      setupTime, 
      breakdownTime, 
      currentBookingId, 
      adminControls?.overrides?.availability
    );
  };

  if (!isActive) return null

  // These functions are now imported from utils

  const handleTimeSelect = (time) => {
    // Check if duration is selected first
    if (!bookingData.duration) {
      showAlert('Duration Required', 'Please select a duration first before choosing a time slot.', 'warning');
      return;
    }

    const getEndTime = (startTime, durationHours = 6) => {
      const [hours, minutes] = startTime.split(':').map(Number);
      const endHours = hours + durationHours;
      return `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    };

    const proposedEndTime = getEndTime(time, bookingData.duration);
    
    // Check for conflicts before allowing selection
    if (checkConflict(time, proposedEndTime)) {
      showAlert('Time Slot Conflict', `This time slot conflicts with existing bookings (including ${bufferMinutes} minute buffer). Please select a different time.`, 'warning');
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
      if (checkConflict(bookingData.startTime, proposedEndTime)) {
        showAlert('Duration Conflict', `This duration conflicts with existing bookings (including ${bufferMinutes} minute buffer). Please select a shorter duration or different start time.`, 'warning');
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
    if (checkConflict('08:00', '22:00')) {
      showAlert('Full Day Booking Conflict', `Full day booking conflicts with existing bookings (including ${bufferMinutes} minute buffer). Please check the time slots.`, 'warning');
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
            value={bookingData.peopleCount}
            onChange={(e) => setBookingData({ ...bookingData, peopleCount: e.target.value })}
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
          <TimeSlotGrid
            timeSlots={timeSlots}
            existingBookings={existingBookings}
            bookingData={bookingData}
            selectedBooking={selectedBooking}
            adminControls={adminControls}
            setupTime={setupTime}
            breakdownTime={breakdownTime}
            columnsPerRow={columnsPerRow}
            viewMode={viewMode}
            setViewMode={setViewMode}
            overrideFilter={overrideFilter}
            setOverrideFilter={setOverrideFilter}
            loadingBookings={loadingBookings}
            stats={stats}
            onTimeSelect={handleTimeSelect}
            isTimeInRange={isTimeInRange}
            isTimeInSelectedBooking={isTimeInSelectedBooking}
          />

          {bookingData.startTime && bookingData.endTime && (
            <div className={styles.selectedTime}>
              <h4>Selected Time</h4>
              <p>{normalizeTime(bookingData.startTime)} - {normalizeTime(bookingData.endTime)} ({bookingData.duration} hours)</p>
            </div>
          )}

          <ExistingBookingsList 
            existingBookings={existingBookings}
            selectedBooking={selectedBooking}
            onBookingClick={handleBookingClick}
            normalizeTime={normalizeTime}
            overrideFilter={overrideFilter}
          />

          <DraftBookingsList 
            draftBookings={draftBookings}
            selectedDraft={selectedDraft}
            onDraftClick={handleDraftClick}
            normalizeTime={normalizeTime}
            onResumeDraft={handleResumeDraft}
            onDeleteDraft={handleDeleteDraft}
          />
        </div>
      )}

      {!bookingData.eventDate && (
        <div className={styles.noSlots}>
          {t('booking_details.select_date')}
        </div>
      )}

      {/* Alert Notification */}
      <AlertNotification
        isVisible={alertNotification.isVisible}
        onClose={closeAlert}
        title={alertNotification.title}
        message={alertNotification.message}
        type={alertNotification.type}
        autoClose={true}
        autoCloseDelay={5000}
      />
    </div>
  )
} 