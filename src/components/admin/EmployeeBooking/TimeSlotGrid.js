'use client'

import { useState } from 'react'
import { useLanguage } from '@/contexts/LanguageContext'
import { isSlotBooked, isSlotInBuffer } from '@/utils/api'
import styles from '@/styles/EmployeeBooking/BookingDetails.module.css'

import {
  normalizeTime,
  addMinutesToTime,
  findOverriddenBookings
} from '@/utils/booking/bookingHelpers'

import OverriddenTooltipBooking from './OverriddenTooltipBooking'

export default function TimeSlotGrid({
  timeSlots,
  existingBookings,
  bookingData,
  selectedBooking,
  adminControls,
  setupTime,
  breakdownTime,
  columnsPerRow,
  viewMode,
  setViewMode,
  overrideFilter = 'all',
  setOverrideFilter,
  loadingBookings,
  stats,
  onTimeSelect,
  isTimeInRange,
  isTimeInSelectedBooking
}) {
  const { t } = useLanguage()

  // State for hover preview
  const [hoverPreview, setHoverPreview] = useState(null)

  // Filter bookings based on override filter
  const filteredBookings = (() => {
    switch (overrideFilter) {
      case 'hide':
        return existingBookings.filter(booking => !booking.override_availability)
      case 'only':
        return existingBookings.filter(booking => booking.override_availability)
      case 'all':
      default:
        return existingBookings
    }
  })()

  // Sort bookings: non-overrides first, then overrides by created_at (or id), newest first
  const sortedBookings = [...filteredBookings].sort((a, b) => {
    if (a.override_availability && b.override_availability) {
      const aTime = new Date(a.created_at || 0).getTime() || a.id;
      const bTime = new Date(b.created_at || 0).getTime() || b.id;
      return bTime - aTime; // Newest first
    }
    if (a.override_availability) return 1;
    if (b.override_availability) return -1;
    return 0;
  });

  // Helper to get z-index for each booking
  const getZIndex = (booking) => {
    if (booking.override_availability) {
      const base = 20;
      const time = new Date(booking.created_at || 0).getTime() || booking.id;
      // Normalize to a reasonable range if needed
      return base + (time % 10000);
    }
    return 10;
  };

  // Helper function to calculate end time based on duration
  const calculateEndTime = (startTime, durationHours) => {
    const [hours, minutes] = startTime.split(':').map(Number);
    const endHours = hours + durationHours;
    return `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  // Helper function to check if a slot is in the hover preview range
  const isSlotInHoverPreview = (slotTime) => {
    if (!hoverPreview) return false;
    return slotTime >= hoverPreview.startTime && slotTime < hoverPreview.endTime;
  };

  // Helper function to handle hover preview
  const handleSlotHover = (time) => {
    // Only show preview for available slots and if duration is selected
    if (!bookingData.duration) return;

    const isBooked = isSlotBooked(time, filteredBookings);
    const isBuffer = isSlotInBuffer(time, filteredBookings);
    const isOverrideEnabled = adminControls?.overrides?.availability || false;
    const isUnavailable = isOverrideEnabled ? false : (isBooked || isBuffer);

    if (isUnavailable) return;

    const endTime = calculateEndTime(time, bookingData.duration);

    // Generate all affected time slots for the preview
    const startIndex = timeSlots.findIndex(slot => slot === time);
    const endIndex = timeSlots.findIndex(slot => slot >= endTime);
    const actualEndIndex = endIndex === -1 ? timeSlots.length : endIndex;

    const affectedSlots = timeSlots.slice(startIndex, actualEndIndex);

    setHoverPreview({
      startTime: time,
      endTime: endTime,
      duration: bookingData.duration,
      affectedSlots: affectedSlots
    });
  };

  const handleSlotLeave = () => {
    setHoverPreview(null);
  };



  if (timeSlots.length === 0) {
    return (
      <div className={styles.noSlots}>
        {t('booking_details.no_slots')}
      </div>
    )
  }

  return (
    <>
      {/* Override Mode Notification */}
      {adminControls?.overrides?.availability && (
        <div className={styles.overrideNotification}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M13 10V3L4 14h7v7l9-11h-7z" fill="currentColor"/>
          </svg>
          <div>
            <div><strong>Override Mode Active</strong></div>
            <div>Booked and buffer slots are now selectable. Diagonal striped slots were created with override.</div>
            <div className={styles.overrideStats}>
              <div className={styles.overrideStatItem}>
                <div className={`${styles.overrideStatIcon} ${styles.overridable}`}></div>
                <span>Overridable slots available</span>
              </div>
              {bookingData.startTime && bookingData.endTime && (
                <div className={styles.overrideStatItem}>
                  <div className={`${styles.overrideStatIcon} ${styles.selected}`}></div>
                  <span>Override selection: {bookingData.startTime} - {bookingData.endTime}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      
      <div className={styles.sectionHeader}>
        <h3>{t('booking_details.available_time_slots')}</h3>
        <div className={styles.headerControls}>
          <div className={styles.viewToggle}>
            <button
              className={`${styles.toggleButton} ${viewMode === 'slots' ? styles.active : ''}`}
              onClick={() => setViewMode('slots')}
              title="Show only time slots"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 3h18v18H3V3zm16 16V5H5v14h14zm-8-2h2V9h-2v8zm-4 0h2v-4H7v4z"/>
              </svg>
              Slots Only
            </button>
            <button
              className={`${styles.toggleButton} ${viewMode === 'bars' ? styles.active : ''}`}
              onClick={() => setViewMode('bars')}
              title="Show time slots with booking bars"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 13h8V3H3v10zm0 8h8v-6H3v6zm10 0h8V11h-8v10zm0-18v6h8V3h-8z"/>
              </svg>
              With Bars
            </button>
          </div>
          <div className={styles.overrideToggle}>
            <button
              className={`${styles.toggleButton} ${styles.overrideToggleButton} ${overrideFilter === 'only' ? styles.onlyMode : overrideFilter !== 'all' ? styles.active : ''}`}
              onClick={() => {
                const nextFilter = overrideFilter === 'all' ? 'hide' : overrideFilter === 'hide' ? 'only' : 'all'
                setOverrideFilter(nextFilter)
              }}
              title={
                overrideFilter === 'all' ? "Click to hide overridden bookings" :
                overrideFilter === 'hide' ? "Click to show only overridden bookings" :
                "Click to show all bookings"
              }
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
              {overrideFilter === 'all' ? 'Show Overridden' : 
               overrideFilter === 'hide' ? 'Hide Overridden' : 
               'Only Overridden'}
            </button>
          </div>
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
      </div>

      <div 
        className={styles.timeGridContainer}
        style={{
          '--grid-rows': Math.ceil(timeSlots.length / columnsPerRow)
        }}
      >
        <div className={styles.timeGrid}>
          {timeSlots.map((time) => {
            const isBooked = isSlotBooked(time, filteredBookings);
            const isBuffer = isSlotInBuffer(time, filteredBookings);
            const isSelected = isTimeInRange(time);
            const isSelectedBookingSlot = isTimeInSelectedBooking(time);
            const isInHoverPreview = isSlotInHoverPreview(time);

            // Check if this slot was created with override (permanent styling)
            // Find ALL bookings that overlap with this time slot (use original existingBookings for override detection)
            const slotBookings = existingBookings.filter(booking => {
              const bookingStart = normalizeTime(booking.time_from);
              const bookingEnd = normalizeTime(booking.time_to);
              return time >= bookingStart && time < bookingEnd;
            });

            const slotBufferBookings = existingBookings.filter(booking => {
              if (booking.buffer_start_time && booking.buffer_end_time) {
                const bufferStart = normalizeTime(booking.buffer_start_time);
                const bufferEnd = normalizeTime(booking.buffer_end_time);
                const bookingStart = normalizeTime(booking.time_from);
                const bookingEnd = normalizeTime(booking.time_to);
                
                // Check if in buffer zone but not in booking zone
                const isInBuffer = time >= bufferStart && time < bufferEnd;
                const isInBooking = time >= bookingStart && time < bookingEnd;
                return isInBuffer && !isInBooking;
              }
              return false;
            });
            
            // Check if ANY of the overlapping bookings was created with override (permanent diagonal stripes)
            const wasCreatedWithOverride = slotBookings.some(booking => booking.override_availability) || 
                                          slotBufferBookings.some(booking => booking.override_availability);
            
            // Override logic - current override toggle for making slots selectable
            const isOverrideEnabled = adminControls?.overrides?.availability || false;
            const isUnavailable = isOverrideEnabled ? false : (isBooked || isBuffer);
            const isOverrideSlot = wasCreatedWithOverride && (isBooked || isBuffer);

            // Determine CSS class based on override state
            let slotClass = styles.timeSlot;
            if (isSelected) {
              slotClass += ` ${styles.selected}`;
            } else if (isInHoverPreview && !isSelected) {
              slotClass += ` ${styles.hoverPreviewSlot}`;
            } else if (viewMode === 'slots' && isSelectedBookingSlot) {
              slotClass += ` ${styles.highlighted}`;
            } else if (isOverrideSlot) {
              // Override mode: blur booked/buffer slots but make them selectable
              const overrideClass = isBooked ? styles.overrideBooked : styles.overrideBuffer;
              slotClass += ` ${styles.overrideSlot} ${overrideClass}`;
            } else if (viewMode === 'slots') {
              // Normal slots only mode
              if (isBooked) slotClass += ` ${styles.booked}`;
              else if (isBuffer) slotClass += ` ${styles.buffer}`;
              else slotClass += ` ${styles.available}`;
            } else {
              // Bars mode with muted styles
              if (isBooked) slotClass += ` ${styles.bookedSlot}`;
              else if (isBuffer) slotClass += ` ${styles.bufferSlot}`;
              else slotClass += ` ${styles.available}`;
            }

            return (
              <button
                key={time}
                className={slotClass}
                onClick={() => onTimeSelect(time)}
                onMouseEnter={() => handleSlotHover(time)}
                onMouseLeave={handleSlotLeave}
                disabled={isUnavailable}
                title={
                  isOverrideSlot ?
                    `Override Mode: ${isBooked ? 'Booked slot' : 'Buffer slot'} - Click to override` :
                  isSelectedBookingSlot ?
                    `Highlighted: ${selectedBooking.customer?.full_name || 'Customer'} (${normalizeTime(selectedBooking.time_from)} - ${normalizeTime(selectedBooking.time_to)})` :
                  isBooked ? t('time_slot.booked') :
                  isBuffer ? `${t('time_slot.buffer')} (${setupTime || breakdownTime || 'default'} hrs)` :
                  isSelected ?
                    `Selected: ${bookingData.startTime} - ${bookingData.endTime} (${bookingData.duration}h)` :
                  isInHoverPreview ?
                    `Preview: ${hoverPreview.startTime} - ${hoverPreview.endTime} (${hoverPreview.duration}h)` :
                  t('time_slot.available')
                }
              >
                {time}
                {isBuffer && <span className={styles.bufferIndicator}>●</span>}
                {isOverrideSlot && <span className={styles.overrideIndicator}>⚡</span>}
                {hoverPreview && hoverPreview.startTime === time && (
                  <span className={styles.hoverPreview}>
                    {hoverPreview.startTime} – {hoverPreview.endTime}
                  </span>
                )}
              </button>
            );
          })}
        </div>
        
        {/* Render continuous booking bars and buffer bars (only in 'bars' view mode) */}
        {viewMode === 'bars' && (
          <div className={styles.bookingBars}>
          {/* Render buffer bars first (so they appear behind booking bars) */}
          {filteredBookings.flatMap((booking, index) => {
            const bookingStart = normalizeTime(booking.time_from);
            const bookingEnd = normalizeTime(booking.time_to);
            
            // Use the booking's own setup_time and breakdown_time values (convert hours to minutes)
            const bookingSetupMinutes = (booking.setup_time || 0.5) * 60; // Default 30 minutes if not specified
            const bookingBreakdownMinutes = (booking.breakdown_time || 0.5) * 60; // Default 30 minutes if not specified
            
            const setupStart = addMinutesToTime(bookingStart, -bookingSetupMinutes);
            const setupEnd = bookingStart;
            const breakdownStart = bookingEnd;
            const breakdownEnd = addMinutesToTime(bookingEnd, bookingBreakdownMinutes);
            
            const buffers = [];
            
            // Setup buffer bar (before booking)
            const setupStartSlot = timeSlots.findIndex(slot => slot >= setupStart);
            let setupEndSlot = timeSlots.findIndex(slot => slot >= setupEnd);
            
            // Calculate actual end index for setup - similar to booking logic
            if (setupStartSlot !== -1) {
              // If exact setup start time not found, find the slot that contains it
              let actualSetupStartIndex = setupStartSlot;
              if (timeSlots[setupStartSlot] !== setupStart && setupStartSlot > 0) {
                const prevSlot = timeSlots[setupStartSlot - 1];
                if (setupStart >= prevSlot) {
                  actualSetupStartIndex = setupStartSlot - 1;
                }
              }
              
              // Calculate setup end index
              let actualSetupEndIndex = setupEndSlot;
              if (setupEndSlot === -1) {
                actualSetupEndIndex = timeSlots.length;
              } else if (timeSlots[setupEndSlot] !== setupEnd) {
                for (let i = actualSetupStartIndex; i < timeSlots.length; i++) {
                  const slotTime = timeSlots[i];
                  const nextSlotTime = i + 1 < timeSlots.length ? timeSlots[i + 1] : '24:00';
                  
                  if (setupEnd > slotTime && setupEnd <= nextSlotTime) {
                    actualSetupEndIndex = i + 1;
                    break;
                  }
                }
              }
              
              const setupWidth = actualSetupEndIndex - actualSetupStartIndex;
              if (setupWidth > 0) {
                // Generate setup bars for each row that spans
                let remainingSetupSlots = setupWidth;
                let currentSetupSlotIndex = actualSetupStartIndex;
                let setupBarIndex = 0;
                
                // Calculate total number of setup bars needed
                let tempRemainingSetupSlots = setupWidth;
                let tempCurrentSetupSlotIndex = actualSetupStartIndex;
                let totalSetupBarsNeeded = 0;
                
                while (tempRemainingSetupSlots > 0) {
                  const tempSetupCol = tempCurrentSetupSlotIndex % columnsPerRow;
                  const tempSlotsInThisRow = Math.min(tempRemainingSetupSlots, columnsPerRow - tempSetupCol);
                  totalSetupBarsNeeded++;
                  tempRemainingSetupSlots -= tempSlotsInThisRow;
                  tempCurrentSetupSlotIndex += tempSlotsInThisRow;
                }
                
                while (remainingSetupSlots > 0) {
                  const setupRow = Math.floor(currentSetupSlotIndex / columnsPerRow);
                  const setupCol = currentSetupSlotIndex % columnsPerRow;
                  const slotsInThisRow = Math.min(remainingSetupSlots, columnsPerRow - setupCol);
                  
                  const isFirstSetupBar = setupBarIndex === 0;
                  const isLastSetupBar = setupBarIndex === totalSetupBarsNeeded - 1;
                  
                  buffers.push(
                    <div
                      key={`setup-bar-${index}-row-${setupRow}`}
                      className={`${styles.bufferBar} ${styles.setupBar} ${booking.override_availability ? styles.overrideBuffer : ''}`}
                      style={{
                        left: `${(setupCol / columnsPerRow) * 100}%`,
                        width: `${(slotsInThisRow / columnsPerRow) * 100}%`,
                        top: `${setupRow * (100 / Math.ceil(timeSlots.length / columnsPerRow))}%`,
                        height: `${100 / Math.ceil(timeSlots.length / columnsPerRow)}%`
                      }}
                      title={`Setup time for ${booking.customer?.full_name || `Customer #${booking.customer_id?.slice(-8)}`} - ${setupStart} to ${setupEnd}`}
                    >
                      {totalSetupBarsNeeded === 1 ? (
                        // Single setup bar - show full time range
                        <>
                          <span className={styles.bufferBarText}>
                            Setup
                          </span>
                          <span className={styles.bufferBarTime}>
                            {setupStart} - {setupEnd}
                          </span>
                        </>
                      ) : (
                        // Multiple setup bars
                        <>
                          {isFirstSetupBar && (
                            <>
                              <span className={styles.bufferBarText}>
                                Setup
                              </span>
                              <span className={styles.bufferBarTime}>
                                {setupStart}
                              </span>
                            </>
                          )}
                          {isLastSetupBar && !isFirstSetupBar && (
                            <span className={styles.bufferBarTime}>
                              {setupEnd}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  );
                  
                  remainingSetupSlots -= slotsInThisRow;
                  currentSetupSlotIndex += slotsInThisRow;
                  setupBarIndex++;
                }
              }
            }
            
            // Breakdown buffer bar (after booking)
            const breakdownStartSlot = timeSlots.findIndex(slot => slot >= breakdownStart);
            let breakdownEndSlot = timeSlots.findIndex(slot => slot >= breakdownEnd);
            
            // Calculate actual end index for breakdown - similar to booking logic
            if (breakdownStartSlot !== -1) {
              // If exact breakdown start time not found, find the slot that contains it
              let actualBreakdownStartIndex = breakdownStartSlot;
              if (timeSlots[breakdownStartSlot] !== breakdownStart && breakdownStartSlot > 0) {
                const prevSlot = timeSlots[breakdownStartSlot - 1];
                if (breakdownStart >= prevSlot) {
                  actualBreakdownStartIndex = breakdownStartSlot - 1;
                }
              }
              
              // Calculate breakdown end index
              let actualBreakdownEndIndex = breakdownEndSlot;
              if (breakdownEndSlot === -1) {
                actualBreakdownEndIndex = timeSlots.length;
              } else if (timeSlots[breakdownEndSlot] !== breakdownEnd) {
                for (let i = actualBreakdownStartIndex; i < timeSlots.length; i++) {
                  const slotTime = timeSlots[i];
                  const nextSlotTime = i + 1 < timeSlots.length ? timeSlots[i + 1] : '24:00';
                  
                  if (breakdownEnd > slotTime && breakdownEnd <= nextSlotTime) {
                    actualBreakdownEndIndex = i + 1;
                    break;
                  }
                }
              }
              
              const breakdownWidth = actualBreakdownEndIndex - actualBreakdownStartIndex;
              if (breakdownWidth > 0) {
                // Generate breakdown bars for each row that spans
                let remainingBreakdownSlots = breakdownWidth;
                let currentBreakdownSlotIndex = actualBreakdownStartIndex;
                let breakdownBarIndex = 0;
                
                // Calculate total number of breakdown bars needed
                let tempRemainingBreakdownSlots = breakdownWidth;
                let tempCurrentBreakdownSlotIndex = actualBreakdownStartIndex;
                let totalBreakdownBarsNeeded = 0;
                
                while (tempRemainingBreakdownSlots > 0) {
                  const tempBreakdownCol = tempCurrentBreakdownSlotIndex % columnsPerRow;
                  const tempSlotsInThisRow = Math.min(tempRemainingBreakdownSlots, columnsPerRow - tempBreakdownCol);
                  totalBreakdownBarsNeeded++;
                  tempRemainingBreakdownSlots -= tempSlotsInThisRow;
                  tempCurrentBreakdownSlotIndex += tempSlotsInThisRow;
                }
                
                while (remainingBreakdownSlots > 0) {
                  const breakdownRow = Math.floor(currentBreakdownSlotIndex / columnsPerRow);
                  const breakdownCol = currentBreakdownSlotIndex % columnsPerRow;
                  const slotsInThisRow = Math.min(remainingBreakdownSlots, columnsPerRow - breakdownCol);
                  
                  const isFirstBreakdownBar = breakdownBarIndex === 0;
                  const isLastBreakdownBar = breakdownBarIndex === totalBreakdownBarsNeeded - 1;
                  
                  buffers.push(
                    <div
                      key={`breakdown-bar-${index}-row-${breakdownRow}`}
                      className={`${styles.bufferBar} ${styles.breakdownBar} ${booking.override_availability ? styles.overrideBuffer : ''}`}
                      style={{
                        left: `${(breakdownCol / columnsPerRow) * 100}%`,
                        width: `${(slotsInThisRow / columnsPerRow) * 100}%`,
                        top: `${breakdownRow * (100 / Math.ceil(timeSlots.length / columnsPerRow))}%`,
                        height: `${100 / Math.ceil(timeSlots.length / columnsPerRow)}%`
                      }}
                      title={`Breakdown time for ${booking.customer?.full_name || `Customer #${booking.customer_id?.slice(-8)}`} - ${breakdownStart} to ${breakdownEnd}`}
                    >
                      {totalBreakdownBarsNeeded === 1 ? (
                        // Single breakdown bar - show full time range
                        <>
                          <span className={styles.bufferBarText}>
                            Breakdown
                          </span>
                          <span className={styles.bufferBarTime}>
                            {breakdownStart} - {breakdownEnd}
                          </span>
                        </>
                      ) : (
                        // Multiple breakdown bars
                        <>
                          {isFirstBreakdownBar && (
                            <>
                              <span className={styles.bufferBarText}>
                                Breakdown
                              </span>
                              <span className={styles.bufferBarTime}>
                                {breakdownStart}
                              </span>
                            </>
                          )}
                          {isLastBreakdownBar && !isFirstBreakdownBar && (
                            <span className={styles.bufferBarTime}>
                              {breakdownEnd}
                            </span>
                          )}
                        </>
                      )}
                    </div>
                  );
                  
                  remainingBreakdownSlots -= slotsInThisRow;
                  currentBreakdownSlotIndex += slotsInThisRow;
                  breakdownBarIndex++;
                }
              }
            }
            
            return buffers;
          })}
          
          {(() => {
            // Render all booking bars in a single flat array for correct stacking
            const bars = [];
            sortedBookings.forEach((booking, index) => {
              const startTime = normalizeTime(booking.time_from);
              const endTime = normalizeTime(booking.time_to);
              const startSlotIndex = timeSlots.findIndex(slot => slot >= startTime);
              let endSlotIndex = timeSlots.findIndex(slot => slot >= endTime);
              if (startSlotIndex === -1) return;
              let actualStartIndex = startSlotIndex;
              if (timeSlots[startSlotIndex] !== startTime && startSlotIndex > 0) {
                const prevSlot = timeSlots[startSlotIndex - 1];
                if (startTime >= prevSlot) {
                  actualStartIndex = startSlotIndex - 1;
                }
              }
              let actualEndIndex = endSlotIndex;
              if (endSlotIndex === -1) {
                actualEndIndex = timeSlots.length;
              } else if (timeSlots[endSlotIndex] !== endTime) {
                for (let i = actualStartIndex; i < timeSlots.length; i++) {
                  const slotTime = timeSlots[i];
                  const nextSlotTime = i + 1 < timeSlots.length ? timeSlots[i + 1] : '24:00';
                  if (endTime > slotTime && endTime <= nextSlotTime) {
                    actualEndIndex = i + 1;
                    break;
                  }
                }
              }
              const totalWidth = actualEndIndex - actualStartIndex;
              if (totalWidth <= 0) return;
              let bookingType = 'confirmed';
              if (booking.override_availability) {
                bookingType = 'overrideBooked';
              } else if (booking.status === 'cancelled') {
                bookingType = 'cancelled';
              } else if (booking.payment_status === 'unpaid' && booking.status === 'pending') {
                bookingType = 'pending';
              }
              const overriddenBookings = booking.override_availability ?
                findOverriddenBookings(booking, existingBookings) : [];
              let zIndex = getZIndex(booking);
              const overlappingOverrides = booking.override_availability 
                ? sortedBookings.filter(otherBooking => 
                    otherBooking.override_availability && 
                    otherBooking.id !== booking.id &&
                    normalizeTime(otherBooking.time_from) < normalizeTime(booking.time_to) &&
                    normalizeTime(otherBooking.time_to) > normalizeTime(booking.time_from)
                  ).length
                : 0;
              // Multi-row segment rendering
              let remainingSlots = totalWidth;
              let currentSlotIndex = actualStartIndex;
              let segmentIndex = 0;
              let totalSegments = 0;
              let tempRemainingSlots = totalWidth;
              let tempCurrentSlotIndex = actualStartIndex;
              while (tempRemainingSlots > 0) {
                const tempCurrentCol = tempCurrentSlotIndex % columnsPerRow;
                const tempSlotsInThisRow = Math.min(tempRemainingSlots, columnsPerRow - tempCurrentCol);
                totalSegments++;
                tempRemainingSlots -= tempSlotsInThisRow;
                tempCurrentSlotIndex += tempSlotsInThisRow;
              }
              while (remainingSlots > 0) {
                const currentRow = Math.floor(currentSlotIndex / columnsPerRow);
                const currentCol = currentSlotIndex % columnsPerRow;
                const slotsInThisRow = Math.min(remainingSlots, columnsPerRow - currentCol);
                const isFirstSegment = segmentIndex === 0;
                const isLastSegment = segmentIndex === totalSegments - 1;
                const segmentStartTime = isFirstSegment ? startTime : null;
                const segmentEndTime = isLastSegment ? endTime : null;
                const bookingBar = (
                  <div
                    key={`booking-bar-${booking.id}-row-${currentRow}`}
                    className={`${styles.bookingBar} ${styles[bookingType]}`}
                    style={{
                      position: 'absolute',
                      left: `${(currentCol / columnsPerRow) * 100}%`,
                      width: `${(slotsInThisRow / columnsPerRow) * 100}%`,
                      top: `${currentRow * (100 / Math.ceil(timeSlots.length / columnsPerRow))}%`,
                      height: `${100 / Math.ceil(timeSlots.length / columnsPerRow)}%`,
                      zIndex: zIndex
                    }}
                    title={`${booking.override_availability ? '⚡ OVERRIDE: ' : ''}${booking.customer?.full_name || `Customer #${booking.customer_id?.slice(-8)}`} - ${startTime} to ${endTime}${overlappingOverrides > 0 ? ` (${overlappingOverrides + 1} overlapping overrides)` : ''}`}
                  >
                    {isFirstSegment && (
                      <span className={styles.bookingBarText}>
                        {booking.override_availability ? '⚡ ' : ''}{booking.customer?.full_name || `Customer #${booking.customer_id?.slice(-8) || 'Unknown'}`}{overlappingOverrides > 0 ? ` (+${overlappingOverrides})` : ''}
                      </span>
                    )}
                    <span className={styles.bookingBarTime}>
                      {segmentStartTime && `${segmentStartTime} - `}{segmentEndTime || ''}
                    </span>
                  </div>
                );
                if (booking.override_availability && overriddenBookings.length > 0 && isFirstSegment) {
                  bars.push(
                    <OverriddenTooltipBooking
                      key={`tooltip-booking-bar-${booking.id}-row-${currentRow}`}
                      overriddenBookings={overriddenBookings}
                      triggerBooking={booking}
                    >
                      {bookingBar}
                    </OverriddenTooltipBooking>
                  );
                } else {
                  bars.push(bookingBar);
                }
                remainingSlots -= slotsInThisRow;
                currentSlotIndex += slotsInThisRow;
                segmentIndex++;
              }
            });
            return bars;
          })()}

          {/* Render highlighted bar for selected booking */}
          {selectedBooking && (() => {
            const bookingStart = normalizeTime(selectedBooking.time_from);
            const bookingEnd = normalizeTime(selectedBooking.time_to);
            
            // Find start and end slot indices
            const startSlotIndex = timeSlots.findIndex(slot => slot >= bookingStart);
            let endSlotIndex = timeSlots.findIndex(slot => slot >= bookingEnd);
            
            if (startSlotIndex === -1) return null;
            
            // Calculate actual start index
            let actualStartIndex = startSlotIndex;
            if (timeSlots[startSlotIndex] !== bookingStart && startSlotIndex > 0) {
              const prevSlot = timeSlots[startSlotIndex - 1];
              if (bookingStart >= prevSlot) {
                actualStartIndex = startSlotIndex - 1;
              }
            }
            
            // Calculate actual end index
            let actualEndIndex = endSlotIndex;
            if (endSlotIndex === -1) {
              actualEndIndex = timeSlots.length;
            } else if (timeSlots[endSlotIndex] !== bookingEnd) {
              for (let i = actualStartIndex; i < timeSlots.length; i++) {
                const slotTime = timeSlots[i];
                const nextSlotTime = i + 1 < timeSlots.length ? timeSlots[i + 1] : '24:00';
                
                if (bookingEnd > slotTime && bookingEnd <= nextSlotTime) {
                  actualEndIndex = i + 1;
                  break;
                }
              }
            }
            
            const totalWidth = actualEndIndex - actualStartIndex;
            
            if (totalWidth <= 0) return null;
            
            // Generate highlighted bars for each row that this booking spans
            const highlightBars = [];
            let remainingSlots = totalWidth;
            let currentSlotIndex = actualStartIndex;
            
            // Calculate total number of bars needed
            let tempRemainingSlots = totalWidth;
            let tempCurrentSlotIndex = actualStartIndex;
            let totalBarsNeeded = 0;
            
            while (tempRemainingSlots > 0) {
              const tempCurrentCol = tempCurrentSlotIndex % columnsPerRow;
              const tempSlotsInThisRow = Math.min(tempRemainingSlots, columnsPerRow - tempCurrentCol);
              totalBarsNeeded++;
              tempRemainingSlots -= tempSlotsInThisRow;
              tempCurrentSlotIndex += tempSlotsInThisRow;
            }
            
            while (remainingSlots > 0) {
              const currentRow = Math.floor(currentSlotIndex / columnsPerRow);
              const currentCol = currentSlotIndex % columnsPerRow;
              const slotsInThisRow = Math.min(remainingSlots, columnsPerRow - currentCol);
              
              const isFirstBar = highlightBars.length === 0;
              const isLastBar = highlightBars.length === totalBarsNeeded - 1;
              
              highlightBars.push(
                <div
                  key={`highlight-bar-row-${currentRow}`}
                  className={`${styles.bookingBar} ${styles.highlightedBar}`}
                  style={{
                    left: `${(currentCol / columnsPerRow) * 100}%`,
                    width: `${(slotsInThisRow / columnsPerRow) * 100}%`,
                    top: `${currentRow * (100 / Math.ceil(timeSlots.length / columnsPerRow))}%`,
                    height: `${100 / Math.ceil(timeSlots.length / columnsPerRow)}%`,
                    zIndex: 1000 // Ensure it appears above other bars
                  }}
                  title={`HIGHLIGHTED: ${selectedBooking.customer?.full_name || 'Customer'} - ${bookingStart} to ${bookingEnd}`}
                >
                  {totalBarsNeeded === 1 ? (
                    // Single bar - show customer name and full time range
                    <>
                      <span className={styles.bookingBarText}>
                        ⭐ {selectedBooking.customer?.full_name || `Customer #${selectedBooking.customer_id?.slice(-8) || 'Unknown'}`}
                      </span>
                      <span className={styles.bookingBarTime}>
                        {bookingStart} - {bookingEnd}
                      </span>
                    </>
                  ) : (
                    // Multiple bars
                    <>
                      {isFirstBar && (
                        <>
                          <span className={styles.bookingBarText}>
                            ⭐ {selectedBooking.customer?.full_name || `Customer #${selectedBooking.customer_id?.slice(-8) || 'Unknown'}`}
                          </span>
                          <span className={styles.bookingBarTime}>
                            {bookingStart}
                          </span>
                        </>
                      )}
                      {isLastBar && !isFirstBar && (
                        <span className={styles.bookingBarTime}>
                          {bookingEnd}
                        </span>
                      )}
                    </>
                  )}
                </div>
              );
              
              remainingSlots -= slotsInThisRow;
              currentSlotIndex += slotsInThisRow;
            }
            
            return highlightBars;
          })()}
          </div>
        )}
      </div>
    </>
  )
} 