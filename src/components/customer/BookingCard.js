import { useState } from 'react';
import Link from 'next/link';
import styles from '../../styles/customer/BookingCard.module.css';

export default function BookingCard({ booking, onUpdate, onCancel, onOpenReview }) {
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancellationReason, setCancellationReason] = useState('');

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const formatTime = (timeString) => {
    return new Date(`2000-01-01T${timeString}`).toLocaleTimeString('en-GB', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return '#10b981';
      case 'pending': return '#f59e0b';
      case 'cancelled': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const getPaymentStatusColor = (status) => {
    switch (status) {
      case 'paid': return '#10b981';
      case 'partial': return '#f59e0b';
      case 'unpaid': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const canCancel = () => {
    if (booking.status === 'cancelled') return false;
    
    const bookingDate = new Date(booking.date);
    const today = new Date();
    const daysDifference = Math.ceil((bookingDate - today) / (1000 * 60 * 60 * 24));
    
    return daysDifference >= 7; // 7 days minimum cancellation policy
  };

  const canModify = () => {
    if (booking.status === 'cancelled') return false;

    const bookingDate = new Date(booking.date);
    const today = new Date();

    return bookingDate > today;
  };

  const canReview = () => {
    if (booking.status !== 'confirmed') return false;
    if (booking.payment_status !== 'paid') return false;

    const bookingDate = new Date(booking.date);
    const today = new Date();

    return bookingDate < today; // Booking date has passed
  };

  const handleCancel = async () => {
    setCancelling(true);
    
    try {
      const response = await fetch('http://localhost:5001/api/customer/bookings/cancel', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          booking_id: booking.id,
          cancellation_reason: cancellationReason
        }),
      });

      const data = await response.json();

      if (response.ok) {
        onCancel(data.booking);
        setShowCancelModal(false);
        setCancellationReason('');
      } else {
        alert(data.error || 'Failed to cancel booking');
      }
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert('Failed to cancel booking');
    } finally {
      setCancelling(false);
    }
  };

  return (
    <>
      <div className={styles.bookingCard}>
        <div className={styles.cardHeader}>
          {booking.venues?.main_image && (
            <div className={styles.venueImage}>
              <img src={booking.venues.main_image} alt={booking.venues.venue_name} />
            </div>
          )}
          <div className={styles.venueInfo}>
            <h3>{booking.venues?.venue_title || booking.venues?.venue_name || 'Venue'}</h3>
            <p className={styles.venueType}>{booking.venues?.venue_place_type || 'Event Space'}</p>
            <p className={styles.location}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                <circle cx="12" cy="10" r="3"/>
              </svg>
              {booking.venues?.city}, {booking.venues?.country}
            </p>
          </div>
          <div className={styles.statusBadges}>
            <span 
              className={styles.statusBadge}
              style={{ backgroundColor: getStatusColor(booking.status) }}
            >
              {booking.status}
            </span>
            <span 
              className={styles.paymentBadge}
              style={{ backgroundColor: getPaymentStatusColor(booking.payment_status) }}
            >
              {booking.payment_status}
            </span>
          </div>
        </div>

        <div className={styles.cardBody}>
          <div className={styles.bookingDetails}>
            <div className={styles.detailItem}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
              <div>
                <span className={styles.label}>Date</span>
                <span className={styles.value}>{formatDate(booking.date)}</span>
              </div>
            </div>

            <div className={styles.detailItem}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <polyline points="12,6 12,12 16,14"/>
              </svg>
              <div>
                <span className={styles.label}>Time</span>
                <span className={styles.value}>
                  {formatTime(booking.time_from)} - {formatTime(booking.time_to)}
                </span>
              </div>
            </div>

            <div className={styles.detailItem}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
              </svg>
              <div>
                <span className={styles.label}>Guests</span>
                <span className={styles.value}>{booking.people_count} people</span>
              </div>
            </div>

            <div className={styles.detailItem}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23"/>
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
              </svg>
              <div>
                <span className={styles.label}>Total Amount</span>
                <span className={styles.value}>£{booking.amount}</span>
              </div>
            </div>
          </div>

          {booking.payment_status !== 'paid' && (
            <div className={styles.paymentInfo}>
              <p>
                <strong>Paid:</strong> £{booking.total_paid || 0} | 
                <strong> Remaining:</strong> £{booking.remaining_balance || booking.amount}
              </p>
            </div>
          )}

          {booking.event_type && (
            <div className={styles.eventType}>
              <strong>Event Type:</strong> {booking.event_type}
            </div>
          )}

          {booking.notes && (
            <div className={styles.notes}>
              <strong>Notes:</strong> {booking.notes}
            </div>
          )}
        </div>

        <div className={styles.cardActions}>
          {booking.payment_status !== 'paid' && (
            <Link
              href={`http://localhost:5001/customer/payments?booking=${booking.id}`}
              className={styles.payButton}
            >
              Make Payment
            </Link>
          )}

          {canModify() && (
            <button className={styles.modifyButton} disabled>
              Modify Booking
            </button>
          )}

          {canCancel() && (
            <button
              className={styles.cancelButton}
              onClick={() => setShowCancelModal(true)}
            >
              Cancel Booking
            </button>
          )}

          {canReview() && onOpenReview && (
            <button
              className={styles.reviewButton}
              onClick={() => onOpenReview(booking)}
            >
              Write Review
            </button>
          )}

          <Link
            href={`http://localhost:5001/venue?id=${booking.venue_id}`}
            className={styles.viewVenueButton}
          >
            View Venue
          </Link>
        </div>
      </div>

      {/* Cancel Modal */}
      {showCancelModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Cancel Booking</h3>
              <button
                className={styles.closeButton}
                onClick={() => setShowCancelModal(false)}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18"/>
                  <line x1="6" y1="6" x2="18" y2="18"/>
                </svg>
              </button>
            </div>

            <div className={styles.modalBody}>
              <p>Are you sure you want to cancel this booking?</p>
              <p><strong>Venue:</strong> {booking.venues?.venue_title}</p>
              <p><strong>Date:</strong> {formatDate(booking.date)}</p>

              <div className={styles.formGroup}>
                <label htmlFor="cancellationReason">Reason for cancellation (optional):</label>
                <textarea
                  id="cancellationReason"
                  value={cancellationReason}
                  onChange={(e) => setCancellationReason(e.target.value)}
                  placeholder="Please let us know why you're cancelling..."
                  rows={3}
                />
              </div>
            </div>

            <div className={styles.modalActions}>
              <button
                className={styles.cancelModalButton}
                onClick={() => setShowCancelModal(false)}
                disabled={cancelling}
              >
                Keep Booking
              </button>
              <button
                className={styles.confirmCancelButton}
                onClick={handleCancel}
                disabled={cancelling}
              >
                {cancelling ? 'Cancelling...' : 'Cancel Booking'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
