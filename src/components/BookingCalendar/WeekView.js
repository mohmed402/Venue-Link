'use client';

import React from 'react';
import { format, addDays } from 'date-fns';
import styles from './BookingCalendar.module.css';

export default function WeekView({ startDate, bookings, timeSlots, spaces, onBookingClick }) {
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(startDate, i));

  const parseTime = (timeString) => {
    const [hours, minutes] = timeString.split(':').map(Number);
    return { hours, minutes };
  };

  const getBookingStyle = (booking, dayIndex) => {
    const startTime = parseTime(booking.startTime);
    const endTime = parseTime(booking.endTime);

    // Calculate the position based on hours and minutes
    const startPosition = startTime.hours + (startTime.minutes / 60);
    const endPosition = endTime.hours + (endTime.minutes / 60);

    // Grid rows are 1-indexed, so we add 1 to the hour
    const startRow = Math.floor(startPosition) + 1;
    const endRow = Math.ceil(endPosition) + 1;
    const minuteOffset = (startTime.minutes / 60) * 60; // Convert to pixels

    return {
      gridRow: `${startRow} / ${endRow}`,
      gridColumn: `${dayIndex}`,
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

  return (
    <div className={styles.weekView}>
      <div className={styles.weekHeader}>
        <div className={styles.timeGutter}></div>
        {weekDays.map((day, index) => (
          <div key={index} className={styles.dayHeader}>
            <div className={styles.dayName}>{format(day, 'EEE')}</div>
            <div className={styles.dayDate}>{format(day, 'd MMM')}</div>
          </div>
        ))}
      </div>

      <div className={styles.weekBody}>
        <div className={styles.timeGutter}>
          {timeSlots.map(time => (
            <div key={time} className={styles.timeSlot}>
              {time}
            </div>
          ))}
        </div>

        <div className={styles.weekGrid}>
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

          {/* Day grid lines */}
          {weekDays.map((_, index) => (
            <div
              key={`day-${index}`}
              className={styles.dayGridLine}
              style={{
                gridRow: '1 / -1',
                gridColumn: `day-${index + 1} / day-${index + 2}`
              }}
            />
          ))}

          {/* Bookings */}
          {weekDays.map((day, dayIndex) => {
            const dayBookings = bookings.filter(booking => 
              booking.date === format(day, 'yyyy-MM-dd')
            );

            return dayBookings.map(booking => (
              <div
                key={`${dayIndex}-${booking.id}`}
                className={`${styles.bookingBlock} ${getStatusClass(booking.status)}`}
                style={getBookingStyle(booking, dayIndex + 1)}
                onClick={() => onBookingClick(booking)}
              >
                <div className={styles.bookingContent}>
                  <h4>{booking.customerName}</h4>
                  <div className={styles.bookingDetails}>
                    <div className={styles.bookingTime}>
                      {booking.startTime} - {booking.endTime}
                    </div>
                    <div className={styles.bookingInfo}>
                      <span>{booking.space}</span>
                      <span>👥 {booking.guests}</span>
                    </div>
                    <span className={styles.bookingType}>{booking.type}</span>
                  </div>
                </div>
              </div>
            ));
          })}
        </div>
      </div>
    </div>
  );
} 