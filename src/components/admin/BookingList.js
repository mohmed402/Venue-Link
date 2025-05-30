import React from 'react';
import styles from '@/styles/AdminBookings.module.css';
import { format } from 'date-fns';

export default function BookingList({ bookings, filters }) {
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
    
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      return (
        booking.customerName.toLowerCase().includes(query) ||
        booking.venue.toLowerCase().includes(query)
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
          {filteredBookings.map(booking => (
            <tr key={booking.id}>
              <td>#{booking.id.toString().padStart(5, '0')}</td>
              <td>{booking.customerName}</td>
              <td>
                {format(new Date(booking.date), 'dd MMM yyyy')}
                <br />
                <span className={styles.timeText}>{booking.time}</span>
              </td>
              <td>{booking.duration}</td>
              <td>{booking.venue}</td>
              <td>{booking.people}</td>
              <td>£{booking.totalAmount.toFixed(2)}</td>
              <td>
                <span className={`${styles.statusBadge} ${getStatusClass(booking.status)}`}>
                  {booking.status}
                </span>
              </td>
              <td>
                <div className={styles.actionButtons}>
                  <button className={styles.viewButton}>
                    View
                  </button>
                  <button className={styles.editButton}>
                    Edit
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
} 