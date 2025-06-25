'use client';

import React from 'react';
import { format } from 'date-fns';
import styles from './BookingCalendar.module.css';

export default function DayView({ date, bookings, timeSlots, spaces, onBookingClick }) {
  const parseTime = (timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return { hours, minutes };
  };

  const getBookingStyle = (booking) => {
    const startTime = parseTime(booking.startTime);
    const endTime = parseTime(booking.endTime);

    // Calculate the position based on hours and minutes
    // Each hour slot is 60px, so we can position based on minutes too
    const startPosition = startTime.hours + (startTime.minutes / 60);
    const endPosition = endTime.hours + (endTime.minutes / 60);

    // Grid rows are 1-indexed, so we add 1 to the hour
    // For sub-hour positioning, we'll use CSS transforms
    const startRow = Math.floor(startPosition) + 1;
    const endRow = Math.ceil(endPosition) + 1;
    const minuteOffset = (startTime.minutes / 60) * 60; // Convert to pixels

    return {
      gridRow: `${startRow} / ${endRow}`,
      gridColumn: `1`,
      transform: `translateY(${minuteOffset}px)`,
      height: `${(endPosition - startPosition) * 60}px`,
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

          {/* No space grid lines needed since we only have one column */}

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