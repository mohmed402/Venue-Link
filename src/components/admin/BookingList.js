import React from 'react';
import styles from '@/styles/AdminBookings.module.css';
import { format } from 'date-fns';

export default function BookingList({ bookings, filters, onViewBooking, onEditBooking }) {
  const calculateDuration = (startTime, endTime) => {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    const diffMs = end - start;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours === 0) {
      return `${diffMinutes}m`;
    } else if (diffMinutes === 0) {
      return `${diffHours}h`;
    } else {
      return `${diffHours}h ${diffMinutes}m`;
    }
  };

  const getStatusClass = (status) => {
    switch (status.toLowerCase()) {
      case 'confirmed':
        return styles.statusConfirmed;
      case 'pending':
        return styles.statusPending;
      case 'cancelled':
        return styles.statusCancelled;
      default:
        return '';
    }
  };

  const filteredBookings = bookings.filter(booking => {
    if (filters.status !== 'all' && booking.status !== filters.status) {
      return false;
    }
    
    if (filters.searchTerm) {
      const query = filters.searchTerm.toLowerCase();
      return (
        booking.customer?.full_name?.toLowerCase().includes(query) ||
        booking.event_type?.toLowerCase().includes(query) ||
        booking.id.toString().includes(query)
      );
    }
    
    return true;
  });

  return (
    <div className={styles.bookingListContainer}>
      <table className={styles.bookingTable}>
        <thead>
          <tr>
            <th>Booking ID</th>
            <th>Customer</th>
            <th>Date & Time</th>
            <th>Duration</th>
            <th>Venue</th>
            <th>People</th>
            <th>Amount</th>
            <th>Status</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {filteredBookings.map(booking => {
            const startTime = booking.time_from || '00:00';
            const endTime = booking.time_to || '00:00';
            const duration = calculateDuration(startTime, endTime);
            
            return (
              <tr key={booking.id}>
                <td>#{booking.id.toString().padStart(5, '0')}</td>
                <td>{booking.customer?.full_name || 'Unknown Customer'}</td>
                <td>
                  {format(new Date(booking.date), 'dd MMM yyyy')}
                  <br />
                  <span className={styles.timeText}>{startTime}</span>
                </td>
                <td>{duration}</td>
                <td>{booking.event_type || 'Event'}</td>
                <td>{booking.people_count || 0}</td>
                <td>£{(booking.amount || 0).toFixed(2)}</td>
                <td>
                  <span className={`${styles.statusBadge} ${getStatusClass(booking.status)}`}>
                    {booking.status}
                  </span>
                </td>
                <td>
                  <div className={styles.actionButtons}>
                    <button 
                      className={styles.viewButton}
                      onClick={() => onViewBooking(booking.id)}
                    >
                      View
                    </button>
                    <button
                      className={styles.editButton}
                      onClick={() => onEditBooking && onEditBooking(booking.id)}
                    >
                      Edit
                    </button>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
} 