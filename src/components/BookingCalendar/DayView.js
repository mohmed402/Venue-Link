'use client';

import React from 'react';
import { format } from 'date-fns';
import styles from './BookingCalendar.module.css';

export default function DayView({ date, bookings, timeSlots, spaces, onBookingClick }) {
  const formatBookingTime = (time) => {
    return time.split(':')[0];
  };

  const getBookingStyle = (booking) => {
    const startHour = parseInt(formatBookingTime(booking.startTime));
    const endHour = parseInt(formatBookingTime(booking.endTime));
    const duration = endHour - startHour;
    
    return {
      gridRow: `time-${startHour} / time-${endHour}`,
      gridColumn: `space-${spaces.indexOf(booking.space) + 1}`,
    };
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'confirmed':
        return styles.confirmed;
      case 'pending':
        return styles.pending;
      case 'cancelled':
        return styles.cancelled;
      case 'internal':
        return styles.internal;
      default:
        return '';
    }
  };

  const todayBookings = bookings.filter(booking => 
    booking.date === format(date, 'yyyy-MM-dd')
  );

  return (
    <div className={styles.dayView}>
      <div className={styles.timelineHeader}>
        <div className={styles.timeGutter}></div>
        {spaces.map(space => (
          <div key={space} className={styles.spaceHeader}>
            {space}
          </div>
        ))}
      </div>

      <div className={styles.timelineBody}>
        <div className={styles.timeGutter}>
          {timeSlots.map(time => (
            <div key={time} className={styles.timeSlot}>
              {time}
            </div>
          ))}
        </div>

        <div className={styles.bookingsGrid}>
          {/* Time grid lines */}
          {timeSlots.map((time, index) => (
            <div
              key={`grid-${time}`}
              className={styles.gridLine}
              style={{
                gridRow: `time-${index} / time-${index + 1}`,
                gridColumn: '1 / -1'
              }}
            />
          ))}

          {/* Space grid lines */}
          {spaces.map((_, index) => (
            <div
              key={`space-${index}`}
              className={styles.spaceGridLine}
              style={{
                gridRow: '1 / -1',
                gridColumn: `space-${index + 1} / space-${index + 2}`
              }}
            />
          ))}

          {/* Bookings */}
          {todayBookings.map(booking => (
            <div
              key={booking.id}
              className={`${styles.bookingBlock} ${getStatusClass(booking.status)}`}
              style={getBookingStyle(booking)}
              onClick={() => onBookingClick(booking)}
            >
              <div className={styles.bookingContent}>
                <h4>{booking.customerName}</h4>
                <div className={styles.bookingDetails}>
                  <span>{booking.startTime} - {booking.endTime}</span>
                  <span>👥 {booking.guests}</span>
                  <span className={styles.bookingType}>{booking.type}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
} 