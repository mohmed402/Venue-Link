'use client';

import React, { useState, useEffect } from 'react';
import styles from './BookingCalendar.module.css';
import DayView from './DayView';
import WeekView from './WeekView';
import MonthView from './MonthView';
import { format, startOfWeek, addDays, startOfMonth, endOfMonth } from 'date-fns';
import { getCalendarBookings } from '../../utils/api';

// Data transformation functions
const transformBookingForCalendar = (booking, availableSpaces) => {
  return {
    id: booking.id,
    customerName: booking.customer?.full_name || 'Unknown Customer',
    space: getSpaceFromBooking(booking, availableSpaces),
    date: booking.date,
    startTime: booking.time_from,
    endTime: booking.time_to,
    guests: booking.people_count || 0,
    status: booking.status,
    type: booking.event_type || 'event',
    // Additional fields from the database
    amount: booking.amount,
    notes: booking.notes,
    isOnline: booking.is_online,
    setupTime: booking.setup_time || 0,
    breakdownTime: booking.breakdown_time || 0,
    customerPhone: booking.customer?.phone_number,
  };
};

// Helper function to determine space/room from booking data
// Since there's only one hall, all bookings go to "Main Hall"
const getSpaceFromBooking = (booking, availableSpaces = ["Main Hall"]) => {
  return "Main Hall";
};

const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0');
  return `${hour}:00`;
});

// Venue spaces configuration - this could be moved to an API call in the future
const getVenueSpaces = (venueId) => {
  // Since there's only one hall to book, we'll return just "Main Hall"
  return ["Main Hall"];
};

export default function BookingCalendar() {
  const [view, setView] = useState('month');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    space: 'all',
    status: 'all',
    type: 'all',
    search: '',
  });

  const venueId = 86; // This could be passed as a prop or from context
  const spaces = getVenueSpaces(venueId);

  // Fetch bookings based on current view and selected date
  const fetchBookings = async () => {
    setLoading(true);
    setError(null);

    try {
      let startDate, endDate;

      if (view === 'month') {
        // For month view, get the entire month plus some padding
        const monthStart = startOfMonth(selectedDate);
        const monthEnd = endOfMonth(selectedDate);
        startDate = format(monthStart, 'yyyy-MM-dd');
        endDate = format(monthEnd, 'yyyy-MM-dd');
      } else if (view === 'week') {
        // For week view, get the week
        const weekStart = startOfWeek(selectedDate);
        const weekEnd = addDays(weekStart, 6);
        startDate = format(weekStart, 'yyyy-MM-dd');
        endDate = format(weekEnd, 'yyyy-MM-dd');
      } else {
        // For day view, just get the selected day
        startDate = format(selectedDate, 'yyyy-MM-dd');
        endDate = format(selectedDate, 'yyyy-MM-dd');
      }

      const response = await getCalendarBookings(venueId, startDate, endDate);
      const transformedBookings = response.map(booking => transformBookingForCalendar(booking, spaces));
      setBookings(transformedBookings);
    } catch (err) {
      console.error('Error fetching bookings:', err);
      setError('Failed to load bookings. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Fetch bookings when view, selectedDate, or component mounts
  useEffect(() => {
    fetchBookings();
  }, [view, selectedDate]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const filteredBookings = bookings.filter(booking => {
    if (filters.space !== 'all' && booking.space !== filters.space) return false;
    if (filters.status !== 'all' && booking.status !== filters.status) return false;
    if (filters.type !== 'all' && booking.type !== filters.type) return false;
    if (filters.search && !booking.customerName.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  const handleBookingClick = (booking) => {
    // TODO: Implement modal with booking details
    console.log('Booking clicked:', booking);
  };

  const handleDateClick = (date) => {
    setSelectedDate(date);
    setView('day');
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.viewControls}>
          <button 
            className={`${styles.viewButton} ${view === 'month' ? styles.active : ''}`}
            onClick={() => setView('month')}
          >
            Month View
          </button>
          <button 
            className={`${styles.viewButton} ${view === 'day' ? styles.active : ''}`}
            onClick={() => setView('day')}
          >
            Day View
          </button>
          <button 
            className={`${styles.viewButton} ${view === 'week' ? styles.active : ''}`}
            onClick={() => setView('week')}
          >
            Week View
          </button>
        </div>

        <div className={styles.filters}>
          {view !== 'month' && (
            <>
              <select
                value={filters.space}
                onChange={(e) => handleFilterChange('space', e.target.value)}
                className={styles.select}
              >
                <option value="all">All Spaces</option>
                {spaces.map(space => (
                  <option key={space} value={space}>{space}</option>
                ))}
              </select>

              <select 
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className={styles.select}
              >
                <option value="all">All Statuses</option>
                <option value="confirmed">Confirmed</option>
                <option value="pending">Pending</option>
                <option value="cancelled">Cancelled</option>
                <option value="internal">Internal</option>
              </select>

              <select 
                value={filters.type}
                onChange={(e) => handleFilterChange('type', e.target.value)}
                className={styles.select}
              >
                <option value="all">All Types</option>
                <option value="wedding">Wedding</option>
                <option value="meeting">Meeting</option>
                <option value="corporate">Corporate</option>
                <option value="training">Training</option>
                <option value="party">Party</option>
                <option value="exhibition">Exhibition</option>
                <option value="charity">Charity</option>
              </select>

              <input
                type="text"
                placeholder="Search by customer name..."
                value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                className={styles.searchInput}
              />
            </>
          )}

          <input
            type="date"
            value={format(selectedDate, 'yyyy-MM-dd')}
            onChange={(e) => setSelectedDate(new Date(e.target.value))}
            className={styles.datePicker}
          />
        </div>

        {/* Status Legend */}
        {view !== 'month' && (
          <div className={styles.statusLegend}>
            <span className={styles.legendTitle}>Status:</span>
            <div className={styles.legendItem}>
              <div className={`${styles.legendDot} ${styles.confirmed}`}></div>
              <span>Confirmed</span>
            </div>
            <div className={styles.legendItem}>
              <div className={`${styles.legendDot} ${styles.pending}`}></div>
              <span>Pending</span>
            </div>
            <div className={styles.legendItem}>
              <div className={`${styles.legendDot} ${styles.cancelled}`}></div>
              <span>Cancelled</span>
            </div>
            <div className={styles.legendItem}>
              <div className={`${styles.legendDot} ${styles.internal}`}></div>
              <span>Internal</span>
            </div>
          </div>
        )}
      </div>

      <div className={styles.calendar}>
        {loading ? (
          <div className={styles.loading}>
            <p>Loading bookings...</p>
          </div>
        ) : error ? (
          <div className={styles.error}>
            <p>{error}</p>
            <button onClick={fetchBookings} className={styles.retryButton}>
              Retry
            </button>
          </div>
        ) : view === 'month' ? (
          <MonthView
            date={selectedDate}
            bookings={bookings}
            onDateClick={handleDateClick}
          />
        ) : view === 'day' ? (
          <DayView
            date={selectedDate}
            bookings={filteredBookings}
            timeSlots={TIME_SLOTS}
            spaces={spaces}
            onBookingClick={handleBookingClick}
          />
        ) : (
          <WeekView
            startDate={startOfWeek(selectedDate)}
            bookings={filteredBookings}
            timeSlots={TIME_SLOTS}
            spaces={spaces}
            onBookingClick={handleBookingClick}
          />
        )}
      </div>
    </div>
  );
} 