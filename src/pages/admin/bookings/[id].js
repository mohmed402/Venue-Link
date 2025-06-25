import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminNav from '@/components/adminNav';
import ProtectedRoute from '@/components/ProtectedRoute';
import EditBookingModal from '@/components/admin/EditBookingModal';
import { getBookingById } from '@/utils/api';
import { format } from 'date-fns';
import styles from '@/styles/BookingDetail.module.css';
import { initializeDarkMode } from '../../../utils/darkMode';

export default function BookingDetail() {
  const router = useRouter();
  const { id } = router.query;
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);

  // Initialize dark mode on component mount
  useEffect(() => {
    initializeDarkMode();
  }, []);

  useEffect(() => {
    if (id) {
      fetchBooking();
    }
  }, [id]);

  const fetchBooking = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getBookingById(id);
      setBooking(data);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch booking:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleBookingUpdated = (updatedBooking) => {
    setBooking(updatedBooking);
    setShowEditModal(false);
    // Optionally refresh the booking data
    fetchBooking();
  };

  const calculateDuration = (startTime, endTime) => {
    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    const diffMs = end - start;
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHours === 0) {
      return `${diffMinutes} minutes`;
    } else if (diffMinutes === 0) {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''}`;
    } else {
      return `${diffHours} hour${diffHours > 1 ? 's' : ''} ${diffMinutes} minutes`;
    }
  };

  const getTotalPaid = (payments) => {
    return payments?.reduce((total, payment) => total + (payment.amount || 0), 0) || 0;
  };

  const getStatusClass = (status) => {
    switch (status?.toLowerCase()) {
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

  const formatPreferences = (preferences) => {
    if (!preferences || typeof preferences !== 'object') return 'None';
    
    const parts = [];
    if (preferences.event_types && Array.isArray(preferences.event_types)) {
      parts.push(`Event Types: ${preferences.event_types.join(', ')}`);
    }
    if (preferences.preferred_venue_ids && Array.isArray(preferences.preferred_venue_ids)) {
      parts.push(`Preferred Venues: ${preferences.preferred_venue_ids.join(', ')}`);
    }
    
    return parts.length > 0 ? parts.join(' | ') : 'None';
  };

  if (loading) {
    return (
      <ProtectedRoute requiredPermission="canManageBookings">
        <div className={styles.adminLayout}>
          <AdminNav />
          <main className={styles.mainContent}>
            <div className={styles.loading}>Loading booking details...</div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute requiredPermission="canManageBookings">
        <div className={styles.adminLayout}>
          <AdminNav />
          <main className={styles.mainContent}>
            <div className={styles.error}>
              Error loading booking: {error}
              <button onClick={fetchBooking} className={styles.retryButton}>
                Retry
              </button>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  if (!booking) {
    return (
      <ProtectedRoute requiredPermission="canManageBookings">
        <div className={styles.adminLayout}>
          <AdminNav />
          <main className={styles.mainContent}>
            <div className={styles.notFound}>Booking not found</div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  const totalPaid = getTotalPaid(booking.payments);
  const remainingBalance = (booking.amount || 0) - totalPaid;

  return (
    <ProtectedRoute requiredPermission="canManageBookings">
      <div className={styles.adminLayout}>
        <AdminNav />
        <main className={styles.mainContent}>
          <header className={styles.pageHeader}>
            <div className={styles.headerLeft}>
              <button 
                onClick={() => router.back()} 
                className={styles.backButton}
              >
                ← Back
              </button>
              <h1>Booking #{booking.id.toString().padStart(5, '0')}</h1>
              <span className={`${styles.statusBadge} ${getStatusClass(booking.status)}`}>
                {booking.status}
              </span>
            </div>
            <div className={styles.headerActions}>
              <button
                className={styles.editButton}
                onClick={() => setShowEditModal(true)}
              >
                Edit Booking
              </button>
              <button className={styles.printButton}>
                Print Details
              </button>
            </div>
          </header>

          <div className={styles.bookingGrid}>
            {/* Customer Information */}
            <section className={styles.card}>
              <h2>Customer Information</h2>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <label>Name:</label>
                  <span>{booking.customer?.full_name || 'Unknown Customer'}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>Phone:</label>
                  <span>{booking.customer?.phone_number || 'Not provided'}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>Email:</label>
                  <span>Not provided</span>
                </div>
                <div className={styles.infoItem}>
                  <label>Preferences:</label>
                  <span>{formatPreferences(booking.customer?.preferences)}</span>
                </div>
              </div>
            </section>

            {/* Booking Details */}
            <section className={styles.card}>
              <h2>Booking Details</h2>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <label>Date:</label>
                  <span>{format(new Date(booking.date), 'EEEE, dd MMMM yyyy')}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>Time:</label>
                  <span>{booking.time_from} - {booking.time_to}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>Duration:</label>
                  <span>{calculateDuration(booking.time_from, booking.time_to)}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>Event Type:</label>
                  <span>{booking.event_type || 'Not specified'}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>Number of People:</label>
                  <span>{booking.people_count || 0}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>Created:</label>
                  <span>{format(new Date(booking.created_at), 'dd MMM yyyy, HH:mm')}</span>
                </div>
                {booking.notes && (
                  <div className={styles.infoItem}>
                    <label>Notes:</label>
                    <span>{booking.notes}</span>
                  </div>
                )}
              </div>
            </section>

            {/* Financial Information */}
            <section className={styles.card}>
              <h2>Financial Information</h2>
              <div className={styles.infoGrid}>
                <div className={styles.infoItem}>
                  <label>Total Amount:</label>
                  <span className={styles.amount}>£{(booking.amount || 0).toFixed(2)}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>Deposit Amount:</label>
                  <span className={styles.amount}>£{(booking.deposit_amount || 0).toFixed(2)}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>Total Paid:</label>
                  <span className={styles.amount}>£{totalPaid.toFixed(2)}</span>
                </div>
                <div className={styles.infoItem}>
                  <label>Remaining Balance:</label>
                  <span className={`${styles.amount} ${remainingBalance > 0 ? styles.outstanding : styles.paid}`}>
                    £{remainingBalance.toFixed(2)}
                  </span>
                </div>
                <div className={styles.infoItem}>
                  <label>System Fee:</label>
                  <span>{booking.system_fee_percentage || 1}%</span>
                </div>
              </div>
            </section>

            {/* Payment History */}
            <section className={styles.card}>
              <h2>Payment History</h2>
              {booking.payments && booking.payments.length > 0 ? (
                <div className={styles.paymentList}>
                  {booking.payments.map((payment) => (
                    <div key={payment.id} className={styles.paymentItem}>
                      <div className={styles.paymentInfo}>
                        <span className={styles.paymentAmount}>£{(payment.amount || 0).toFixed(2)}</span>
                        <span className={styles.paymentMethod}>{payment.payment_method || 'Unknown'}</span>
                        <span className={styles.paymentDate}>
                          {payment.payment_date ? format(new Date(payment.payment_date), 'dd MMM yyyy, HH:mm') : 'Unknown date'}
                        </span>
                      </div>
                      {payment.reference && (
                        <div className={styles.paymentReference}>
                          Ref: {payment.reference}
                        </div>
                      )}
                      {payment.recorded_by && (
                        <div className={styles.paymentRecordedBy}>
                          Recorded by: {payment.staff?.full_name || payment.recorded_by || 'Unknown'}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className={styles.noData}>No payments recorded</p>
              )}
            </section>

            {/* Price Change History */}
            {booking.booking_price_changes && booking.booking_price_changes.length > 0 && (
              <section className={styles.card}>
                <h2>Price Change History</h2>
                <div className={styles.priceChangeList}>
                  {booking.booking_price_changes.map((change) => (
                    <div key={change.id} className={styles.priceChangeItem}>
                      <div className={styles.priceChangeInfo}>
                        <span className={styles.priceChange}>
                          £{(change.old_amount || 0).toFixed(2)} → £{(change.new_amount || 0).toFixed(2)}
                        </span>
                        <span className={styles.priceChangeDate}>
                          {change.updated_at ? format(new Date(change.updated_at), 'dd MMM yyyy, HH:mm') : 'Unknown date'}
                        </span>
                      </div>
                      {change.reason && (
                        <div className={styles.priceChangeReason}>
                          Reason: {change.reason}
                        </div>
                      )}
                      {change.updated_by && (
                        <div className={styles.priceChangeUpdatedBy}>
                          Updated by: {change.updated_by}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        </main>
      </div>

      <EditBookingModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        booking={booking}
        onBookingUpdated={handleBookingUpdated}
      />
    </ProtectedRoute>
  );
}