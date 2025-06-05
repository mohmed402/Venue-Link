'use client';

import React, { useState } from 'react';
import styles from './BookingCalendar.module.css';
import DayView from './DayView';
import WeekView from './WeekView';
import MonthView from './MonthView';
import { format, startOfWeek, addDays } from 'date-fns';

// Mock data for demonstration
const MOCK_BOOKINGS = [
  // Today's bookings
  {
    id: 1,
    customerName: "Team Meeting - Marketing",
    space: "Room A",
    date: format(new Date(), 'yyyy-MM-dd'),
    startTime: "09:00",
    endTime: "10:30",
    guests: 8,
    status: "confirmed",
    type: "meeting",
  },
  {
    id: 2,
    customerName: "Johnson Wedding Reception",
    space: "Main Hall",
    date: format(new Date(), 'yyyy-MM-dd'),
    startTime: "11:00",
    endTime: "16:00",
    guests: 150,
    status: "confirmed",
    type: "wedding",
  },
  {
    id: 3,
    customerName: "Tech Conference",
    space: "Main Hall",
    date: format(new Date(), 'yyyy-MM-dd'),
    startTime: "17:00",
    endTime: "21:00",
    guests: 200,
    status: "pending",
    type: "corporate",
  },
  {
    id: 4,
    customerName: "Venue Maintenance",
    space: "Room B",
    date: format(new Date(), 'yyyy-MM-dd'),
    startTime: "08:00",
    endTime: "09:00",
    guests: 0,
    status: "internal",
    type: "maintenance",
  },

  // Tomorrow's bookings
  {
    id: 5,
    customerName: "Birthday Party - Emma Smith",
    space: "Main Hall",
    date: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
    startTime: "12:00",
    endTime: "17:00",
    guests: 50,
    status: "confirmed",
    type: "party",
  },
  {
    id: 6,
    customerName: "Yoga Workshop",
    space: "Room A",
    date: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
    startTime: "07:00",
    endTime: "09:00",
    guests: 15,
    status: "confirmed",
    type: "fitness",
  },
  {
    id: 7,
    customerName: "Corporate Training",
    space: "Room B",
    date: format(addDays(new Date(), 1), 'yyyy-MM-dd'),
    startTime: "10:00",
    endTime: "16:00",
    guests: 25,
    status: "cancelled",
    type: "corporate",
  },

  // Day after tomorrow
  {
    id: 8,
    customerName: "Photography Exhibition",
    space: "Main Hall",
    date: format(addDays(new Date(), 2), 'yyyy-MM-dd'),
    startTime: "09:00",
    endTime: "20:00",
    guests: 100,
    status: "confirmed",
    type: "exhibition",
  },
  {
    id: 9,
    customerName: "Dance Class",
    space: "Room A",
    date: format(addDays(new Date(), 2), 'yyyy-MM-dd'),
    startTime: "18:00",
    endTime: "20:00",
    guests: 20,
    status: "confirmed",
    type: "fitness",
  },

  // Later in the week
  {
    id: 10,
    customerName: "Charity Gala Dinner",
    space: "Main Hall",
    date: format(addDays(new Date(), 4), 'yyyy-MM-dd'),
    startTime: "18:00",
    endTime: "23:00",
    guests: 180,
    status: "confirmed",
    type: "charity",
  },
  {
    id: 11,
    customerName: "Product Launch - TechCo",
    space: "Main Hall",
    date: format(addDays(new Date(), 5), 'yyyy-MM-dd'),
    startTime: "10:00",
    endTime: "15:00",
    guests: 120,
    status: "pending",
    type: "corporate",
  },
  {
    id: 12,
    customerName: "Monthly Staff Meeting",
    space: "Room B",
    date: format(addDays(new Date(), 5), 'yyyy-MM-dd'),
    startTime: "09:00",
    endTime: "10:00",
    guests: 12,
    status: "internal",
    type: "meeting",
  },
];

const TIME_SLOTS = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, '0');
  return `${hour}:00`;
});

const SPACES = ["Main Hall", "Room A", "Room B"];

export default function BookingCalendar() {
  const [view, setView] = useState('month');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [filters, setFilters] = useState({
    space: 'all',
    status: 'all',
    type: 'all',
    search: '',
  });

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const filteredBookings = MOCK_BOOKINGS.filter(booking => {
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
                {SPACES.map(space => (
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
      </div>

      <div className={styles.calendar}>
        {view === 'month' ? (
          <MonthView
            date={selectedDate}
            bookings={MOCK_BOOKINGS}
            onDateClick={handleDateClick}
          />
        ) : view === 'day' ? (
          <DayView
            date={selectedDate}
            bookings={filteredBookings}
            timeSlots={TIME_SLOTS}
            spaces={SPACES}
            onBookingClick={handleBookingClick}
          />
        ) : (
          <WeekView
            startDate={startOfWeek(selectedDate)}
            bookings={filteredBookings}
            timeSlots={TIME_SLOTS}
            spaces={SPACES}
            onBookingClick={handleBookingClick}
          />
        )}
      </div>
    </div>
  );
} 