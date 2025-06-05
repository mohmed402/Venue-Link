'use client';

import React from 'react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  startOfWeek,
  endOfWeek
} from 'date-fns';
import styles from './BookingCalendar.module.css';

export default function MonthView({ date, bookings, onDateClick }) {
  // Get all days in the month, including padding days for complete weeks
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const days = eachDayOfInterval({ start: startDate, end: endDate });

  // Get booking status for a specific date
  const getDateStatus = (day) => {
    const dayBookings = bookings.filter(booking => 
      isSameDay(new Date(booking.date), day)
    );

    if (dayBookings.length === 0) return 'available';
    
    // If any booking is confirmed or pending, consider the day busy
    if (dayBookings.some(b => b.status === 'confirmed' || b.status === 'pending')) {
      return 'busy';
    }

    // If there are only internal or cancelled bookings, consider the day partially available
    return 'partially-available';
  };

  // Get booking summary for a date
  const getDateSummary = (day) => {
    const dayBookings = bookings.filter(booking => 
      isSameDay(new Date(booking.date), day)
    );

    return {
      total: dayBookings.length,
      confirmed: dayBookings.filter(b => b.status === 'confirmed').length,
      pending: dayBookings.filter(b => b.status === 'pending').length
    };
  };

  return (
    <div className={styles.monthView}>
      <div className={styles.monthHeader}>
        <h2>{format(date, 'MMMM yyyy')}</h2>
      </div>
      
      <div className={styles.weekDays}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className={styles.weekDay}>{day}</div>
        ))}
      </div>

      <div className={styles.monthGrid}>
        {days.map((day, index) => {
          const isCurrentMonth = isSameMonth(day, date);
          const status = getDateStatus(day);
          const summary = getDateSummary(day);
          
          return (
            <button
              key={day.toString()}
              onClick={() => onDateClick(day)}
              className={`${styles.dateCell} 
                ${!isCurrentMonth ? styles.otherMonth : ''} 
                ${styles[status]}`}
            >
              <div className={styles.dateNumber}>
                {format(day, 'd')}
              </div>
              {isCurrentMonth && summary.total > 0 && (
                <div className={styles.dateSummary}>
                  {summary.confirmed > 0 && (
                    <span className={styles.confirmedDot} title={`${summary.confirmed} confirmed`} />
                  )}
                  {summary.pending > 0 && (
                    <span className={styles.pendingDot} title={`${summary.pending} pending`} />
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
} 