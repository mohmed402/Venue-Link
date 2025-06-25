import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { useUnifiedAuth } from '../../contexts/UnifiedAuthContext';
import PaymentForm from './PaymentForm';
import PaymentHistory from './PaymentHistory';
import styles from '../../styles/customer/CustomerPayments.module.css';

export default function CustomerPayments() {
  const { user, getSession } = useUnifiedAuth();
  const router = useRouter();
  const bookingId = router.query.booking;

  const [activeTab, setActiveTab] = useState(bookingId ? 'make-payment' : 'history');
  const [bookings, setBookings] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    try {
      const { data: { session } } = await getSession();
      if (!session?.access_token) {
        setError('Authentication required');
        setLoading(false);
        return;
      }

      // Fetch bookings with outstanding balances
      const bookingsResponse = await fetch('http://localhost:5001/api/customer/bookings', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });
      const bookingsData = await bookingsResponse.json();

      if (bookingsResponse.ok) {
        // Filter bookings that need payment
        const unpaidBookings = bookingsData.bookings.filter(booking =>
          booking.payment_status !== 'paid' && booking.status !== 'cancelled'
        );
        setBookings(unpaidBookings);
      } else {
        setError(bookingsData.error || 'Failed to load bookings');
      }

      // Fetch payment history
      const paymentsResponse = await fetch('http://localhost:5001/api/customer/payments', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
      });
      const paymentsData = await paymentsResponse.json();

      if (paymentsResponse.ok) {
        setPayments(paymentsData.payments || []);
      } else {
        setError(paymentsData.error || 'Failed to load payments');
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      setError('Failed to load payment information');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentSuccess = (newPayment) => {
    // Refresh data after successful payment
    fetchData();
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading payment information...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.error}>
        <p>{error}</p>
        <button onClick={fetchData} className={styles.retryButton}>
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className={styles.paymentsContainer}>
      <div className={styles.header}>
        <h1>Payments</h1>
        <p>Manage your payments and view transaction history</p>
      </div>

      {/* Tab Navigation */}
      <div className={styles.tabNavigation}>
        <button
          className={`${styles.tab} ${activeTab === 'make-payment' ? styles.active : ''}`}
          onClick={() => setActiveTab('make-payment')}
        >
          Make Payment
          {bookings.length > 0 && (
            <span className={styles.badge}>{bookings.length}</span>
          )}
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'history' ? styles.active : ''}`}
          onClick={() => setActiveTab('history')}
        >
          Payment History
        </button>
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {activeTab === 'make-payment' && (
          <div className={styles.makePaymentTab}>
            {bookings.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>
                  <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10"/>
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                    <line x1="12" y1="17" x2="12.01" y2="17"/>
                  </svg>
                </div>
                <h2>All payments up to date!</h2>
                <p>You don`t have any outstanding payments at the moment.</p>
              </div>
            ) : (
              <PaymentForm 
                bookings={bookings}
                selectedBookingId={bookingId}
                onPaymentSuccess={handlePaymentSuccess}
              />
            )}
          </div>
        )}

        {activeTab === 'history' && (
          <PaymentHistory payments={payments} />
        )}
      </div>
    </div>
  );
}
