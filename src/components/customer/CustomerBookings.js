import { useState, useEffect } from 'react';
import { useUnifiedAuth } from '../../contexts/UnifiedAuthContext';
import BookingCard from './BookingCard';
import ReviewModal from './ReviewModal';
import { getCustomerBookings, cancelCustomerBooking } from '../../utils/api';
import styles from '../../styles/customer/CustomerBookings.module.css';

export default function CustomerBookings() {
  const { user, getSession } = useUnifiedAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all', 'upcoming', 'past'
  const [reviewModal, setReviewModal] = useState({ isOpen: false, booking: null });

  useEffect(() => {
    if (user) {
      fetchBookings();
    }
  }, [user, filter]);

  const fetchBookings = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await getSession();
      if (!session?.access_token) {
        console.error('No access token available');
        return;
      }
      
      const data = await getCustomerBookings(session.access_token, filter === 'all' ? null : filter);
      setBookings(data.bookings || []);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelBooking = async (bookingId) => {
    try {
      const { data: { session } } = await getSession();
      if (!session?.access_token) {
        alert('Authentication required');
        return;
      }

      console.log('Cancel booking - Session found, access token available:', !!session.access_token);
      const cancellationReason = prompt('Please provide a reason for cancellation (optional):');
      await cancelCustomerBooking(session.access_token, bookingId, cancellationReason);

      // Refresh bookings
      fetchBookings();
      alert('Booking cancelled successfully');
    } catch (error) {
      console.error('Error cancelling booking:', error);
      alert(error.message || 'Failed to cancel booking');
    }
  };

  const handleOpenReviewModal = (booking) => {
    setReviewModal({ isOpen: true, booking });
  };

  const handleCloseReviewModal = () => {
    setReviewModal({ isOpen: false, booking: null });
  };

  const handleReviewSubmitted = () => {
    // Refresh bookings to update any review status
    fetchBookings();
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading your bookings...</p>
      </div>
    );
  }

  return (
    <div className={styles.bookingsContainer}>
      <div className={styles.header}>
        <h1>My Bookings</h1>
        <p>Manage your venue bookings and reservations</p>
      </div>

      {/* Filter Tabs */}
      <div className={styles.filterTabs}>
        <button 
          className={`${styles.tab} ${filter === 'all' ? styles.active : ''}`}
          onClick={() => setFilter('all')}
        >
          All Bookings
        </button>
        <button 
          className={`${styles.tab} ${filter === 'upcoming' ? styles.active : ''}`}
          onClick={() => setFilter('upcoming')}
        >
          Upcoming
        </button>
        <button 
          className={`${styles.tab} ${filter === 'past' ? styles.active : ''}`}
          onClick={() => setFilter('past')}
        >
          Past
        </button>
      </div>

      {/* Bookings List */}
      <div className={styles.bookingsList}>
        {bookings.length > 0 ? (
          bookings.map((booking) => (
            <BookingCard
              key={booking.id}
              booking={booking}
              onCancel={handleCancelBooking}
              onOpenReview={handleOpenReviewModal}
            />
          ))
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                <line x1="16" y1="2" x2="16" y2="6"/>
                <line x1="8" y1="2" x2="8" y2="6"/>
                <line x1="3" y1="10" x2="21" y2="10"/>
              </svg>
            </div>
            <h2>No bookings found</h2>
            <p>
              {filter === 'upcoming' && "You don't have any upcoming bookings."}
              {filter === 'past' && "You don't have any past bookings."}
              {filter === 'all' && "You haven't made any bookings yet."}
            </p>
          </div>
        )}
      </div>

      {/* Review Modal */}
      <ReviewModal
        isOpen={reviewModal.isOpen}
        onClose={handleCloseReviewModal}
        booking={reviewModal.booking}
        onReviewSubmitted={handleReviewSubmitted}
      />
    </div>
  );
}
