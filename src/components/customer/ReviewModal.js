import { useState, useEffect } from 'react';
import { useUnifiedAuth } from '../../contexts/UnifiedAuthContext';
import { canReviewBooking, submitBookingReview } from '../../utils/api';
import ReviewForm from './ReviewForm';
import styles from '../../styles/customer/ReviewModal.module.css';

export default function ReviewModal({ isOpen, onClose, booking, onReviewSubmitted }) {
  const { getSession } = useUnifiedAuth();
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [canReview, setCanReview] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && booking) {
      checkReviewEligibility();
    }
  }, [isOpen, booking]);

  const checkReviewEligibility = async () => {
    try {
      setLoading(true);
      setError('');

      const { data: { session } } = await getSession();
      if (!session?.access_token) {
        setError('Authentication required. Please log in again.');
        return;
      }

      console.log('Checking review eligibility for booking:', booking.id);
      const result = await canReviewBooking(session.access_token, booking.id);
      console.log('Review eligibility result:', result);

      setCanReview(result);

      if (!result.canReview) {
        setError(result.reason || 'Cannot review this booking');
      }
    } catch (err) {
      console.error('Error checking review eligibility:', err);
      setError(err.message || 'Failed to check review eligibility. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitReview = async (reviewData) => {
    try {
      setSubmitting(true);
      setError('');

      const { data: { session } } = await getSession();
      if (!session?.access_token) {
        setError('Authentication required');
        return;
      }

      await submitBookingReview(session.access_token, booking.id, reviewData);
      
      setSuccess(true);
      
      // Call the callback to refresh bookings
      if (onReviewSubmitted) {
        onReviewSubmitted();
      }

      // Close modal after a short delay
      setTimeout(() => {
        handleClose();
      }, 2000);

    } catch (err) {
      console.error('Error submitting review:', err);
      setError(err.message || 'Failed to submit review');
    } finally {
      setSubmitting(false);
    }
  };

  const handleClose = () => {
    setCanReview(null);
    setError('');
    setSuccess(false);
    setLoading(false);
    setSubmitting(false);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.overlay} onClick={handleClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <h2>Write a Review</h2>
          <button 
            className={styles.closeButton}
            onClick={handleClose}
            disabled={submitting}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div className={styles.content}>
          {loading ? (
            <div className={styles.loading}>
              <div className={styles.spinner}></div>
              <p>Checking review eligibility...</p>
            </div>
          ) : success ? (
            <div className={styles.success}>
              <div className={styles.successIcon}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22,4 12,14.01 9,11.01"></polyline>
                </svg>
              </div>
              <h3>Review Submitted Successfully!</h3>
              <p>Thank you for your feedback. Your review will help other customers.</p>
            </div>
          ) : error ? (
            <div className={styles.error}>
              <div className={styles.errorIcon}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="15" y1="9" x2="9" y2="15"></line>
                  <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
              </div>
              <h3>Cannot Submit Review</h3>
              <p>{error}</p>
              <button 
                className={styles.retryButton}
                onClick={checkReviewEligibility}
              >
                Try Again
              </button>
            </div>
          ) : canReview?.canReview ? (
            <ReviewForm
              onSubmit={handleSubmitReview}
              onCancel={handleClose}
              loading={submitting}
              venueInfo={{
                venue_name: booking.venues?.venue_name || booking.venues?.venue_title || 'Venue',
                date: booking.date
              }}
            />
          ) : (
            <div className={styles.notEligible}>
              <div className={styles.infoIcon}>
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <line x1="12" y1="16" x2="12" y2="12"></line>
                  <line x1="12" y1="8" x2="12.01" y2="8"></line>
                </svg>
              </div>
              <h3>Review Not Available</h3>
              <p>{canReview?.reason || 'This booking is not eligible for review.'}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
