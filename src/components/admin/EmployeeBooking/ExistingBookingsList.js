import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { checkPermission } from '@/utils/roles';
import { getPaymentStatusInfo, getPaymentStatusIcon } from '@/utils/paymentStatus';
import styles from '@/styles/EmployeeBooking/BookingDetails.module.css';

const ExistingBookingsList = ({ 
  existingBookings, 
  selectedBooking, 
  onBookingClick, 
  normalizeTime,
  overrideFilter = 'all'
}) => {
  const { t } = useLanguage();

  if (existingBookings.length === 0) {
    return null;
  }

  // Filter bookings based on override filter (matching TimeSlotGrid logic)
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

  // Count overridden bookings for display
  const overriddenCount = existingBookings.filter(booking => booking.override_availability === true).length;

  return (
    <div className={styles.existingBookings}>
      <div className={styles.existingBookingsHeader}>
        <h4>
          Existing Bookings ({filteredBookings.length}{overrideFilter !== 'all' ? ` of ${existingBookings.length}` : ''})
          {overrideFilter === 'only' && overriddenCount > 0 && (
            <span className={styles.filterIndicator}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
              Override Only
            </span>
          )}
          {overrideFilter === 'hide' && (
            <span className={styles.filterIndicator}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.3 5.71c-.39-.39-1.02-.39-1.41 0L12 10.59 7.11 5.7c-.39-.39-1.02-.39-1.41 0-.39.39-.39 1.02 0 1.41L10.59 12 5.7 16.89c-.39.39-.39 1.02 0 1.41.39.39 1.02.39 1.41 0L12 13.41l4.89 4.89c.39.39 1.02.39 1.41 0 .39-.39.39-1.02 0-1.41L13.41 12l4.89-4.89c.39-.39.39-1.02 0-1.41z"/>
              </svg>
              Override Hidden
            </span>
          )}
          <span className={styles.clickHint}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
            Click to highlight time slots
          </span>
        </h4>
      </div>
      
      <div className={styles.bookingsList}>
        {filteredBookings.length === 0 ? (
          <div className={styles.noBookingsMessage}>
            {overrideFilter === 'only' 
              ? 'No overridden bookings found for this date.' 
              : overrideFilter === 'hide'
              ? 'No regular bookings found for this date (overridden bookings are hidden).'
              : 'No bookings found for this date.'
            }
          </div>
        ) : (
          filteredBookings.map((booking, index) => (
            <BookingCard 
              key={index}
              booking={booking}
              index={index}
              selectedBooking={selectedBooking}
              onBookingClick={onBookingClick}
              normalizeTime={normalizeTime}
            />
          ))
        )}
      </div>
    </div>
  );
};

// Extract the booking card into its own component
const BookingCard = ({ booking, index, selectedBooking, onBookingClick, normalizeTime }) => {
  const router = useRouter();
  const { userRole } = useUnifiedAuth();
  
  // Handle navigation to booking detail page
  const handleViewDetails = (e) => {
    e.stopPropagation(); // Prevent triggering the card click
    router.push(`/admin/bookings/${booking.id}`);
  };
  
  // Handle navigation to employee booking page for modification
  const handleModifyBooking = (e) => {
    e.stopPropagation(); // Prevent triggering the card click

    // Pass only the booking ID - complete data will be fetched from database
    const queryParams = new URLSearchParams({
      modify: 'true',
      bookingId: booking.id
    });

    router.push(`/admin/employee-booking?${queryParams.toString()}`);
  };

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
    <div 
      className={`${styles.bookingCard} ${styles[riskLevel]} ${booking.override_availability ? styles.overridden : ''} ${selectedBooking && selectedBooking.id === booking.id ? styles.selectedBookingCard : ''}`}
      onClick={() => onBookingClick(booking)}
      style={{ cursor: 'pointer' }}
    >
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
          {booking.override_availability && (
            <span className={styles.overrideBadge}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
              Override
            </span>
          )}
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
        <div className={styles.bookingFooterLeft}>
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
        
        <div className={styles.bookingActions}>
          <button 
            className={styles.viewDetailsBtn}
            onClick={handleViewDetails}
            title="View booking details"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
            </svg>
            View Details
          </button>
          
          {checkPermission(userRole, 'canModifyBookings') && (
            <button 
              className={styles.modifyBtn}
              onClick={handleModifyBooking}
              title="Modify booking"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
              </svg>
              Modify
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExistingBookingsList; 