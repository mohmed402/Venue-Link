import { useState, useEffect } from 'react';
import { useUnifiedAuth } from '../../contexts/UnifiedAuthContext';
import styles from '../../styles/customer/PaymentForm.module.css';

export default function PaymentForm({ bookings, selectedBookingId, onPaymentSuccess }) {
  const { getSession } = useUnifiedAuth();
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [paymentData, setPaymentData] = useState({
    amount: '',
    payment_method: 'card',
    reference: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (selectedBookingId && bookings.length > 0) {
      const booking = bookings.find(b => b.id.toString() === selectedBookingId);
      if (booking) {
        setSelectedBooking(booking);
        setPaymentData(prev => ({
          ...prev,
          amount: booking.remaining_balance.toString()
        }));
      }
    } else if (bookings.length > 0) {
      setSelectedBooking(bookings[0]);
      setPaymentData(prev => ({
        ...prev,
        amount: bookings[0].remaining_balance.toString()
      }));
    }
  }, [selectedBookingId, bookings]);

  const handleBookingChange = (bookingId) => {
    const booking = bookings.find(b => b.id.toString() === bookingId);
    setSelectedBooking(booking);
    setPaymentData(prev => ({
      ...prev,
      amount: booking?.remaining_balance.toString() || ''
    }));
    setError('');
    setSuccess('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setPaymentData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (!selectedBooking) {
      setError('Please select a booking');
      return false;
    }

    const amount = parseFloat(paymentData.amount);
    if (!amount || amount <= 0) {
      setError('Please enter a valid payment amount');
      return false;
    }

    if (amount > selectedBooking.remaining_balance) {
      setError(`Payment amount cannot exceed remaining balance of £${selectedBooking.remaining_balance}`);
      return false;
    }

    if (!paymentData.payment_method) {
      setError('Please select a payment method');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const { data: { session } } = await getSession();
      if (!session?.access_token) {
        setError('Authentication required. Please log in again.');
        setLoading(false);
        return;
      }

      console.log('Submitting payment:', {
        booking_id: selectedBooking.id,
        amount: parseFloat(paymentData.amount),
        payment_method: paymentData.payment_method
      });

      const response = await fetch('http://localhost:5001/api/customer/payments', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          booking_id: selectedBooking.id,
          amount: parseFloat(paymentData.amount),
          payment_method: paymentData.payment_method,
          reference: paymentData.reference || undefined
        }),
      });

      const data = await response.json();
      console.log('Payment response:', data);

      if (response.ok) {
        setSuccess(`Payment of £${paymentData.amount} recorded successfully!`);
        setPaymentData({
          amount: '',
          payment_method: 'card',
          reference: ''
        });

        if (onPaymentSuccess) {
          onPaymentSuccess(data.payment);
        }
      } else {
        // Handle specific error types with better messages
        if (data.details) {
          setError(`${data.error}\n${data.details}`);
        } else {
          setError(data.error || 'Failed to process payment');
        }
        
        // If the error is about customer profile, suggest a solution
        if (data.error && data.error.includes('Customer profile not found')) {
          setError('Your account needs to be linked to a customer profile. Please contact support or try logging out and logging back in.');
        }
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      setError('Network error: Failed to process payment. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (bookings.length === 0) {
    return null;
  }

  return (
    <div className={styles.paymentForm}>
      <div className={styles.formHeader}>
        <h2>Make a Payment</h2>
        <p>Select a booking and enter payment details</p>
      </div>

      {error && (
        <div className={styles.errorMessage}>
          {error.split('\n').map((line, index) => (
            <div key={index}>{line}</div>
          ))}
        </div>
      )}
      {success && <div className={styles.successMessage}>{success}</div>}

      <form onSubmit={handleSubmit}>
        {/* Booking Selection */}
        <div className={styles.formGroup}>
          <label htmlFor="booking">Select Booking</label>
          <select
            id="booking"
            value={selectedBooking?.id || ''}
            onChange={(e) => handleBookingChange(e.target.value)}
            className={styles.formSelect}
          >
            {bookings.map((booking) => (
              <option key={booking.id} value={booking.id}>
                {booking.venues?.venue_title || 'Venue'} - {formatDate(booking.date)} - £{booking.remaining_balance} remaining
              </option>
            ))}
          </select>
        </div>

        {/* Booking Details */}
        {selectedBooking && (
          <div className={styles.bookingDetails}>
            <h3>Booking Details</h3>
            <div className={styles.detailsGrid}>
              <div className={styles.detailItem}>
                <span className={styles.label}>Venue:</span>
                <span className={styles.value}>{selectedBooking.venues?.venue_title}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.label}>Date:</span>
                <span className={styles.value}>{formatDate(selectedBooking.date)}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.label}>Total Amount:</span>
                <span className={styles.value}>£{selectedBooking.amount}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.label}>Paid:</span>
                <span className={styles.value}>£{selectedBooking.total_paid || 0}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.label}>Remaining:</span>
                <span className={styles.value}>£{selectedBooking.remaining_balance}</span>
              </div>
              <div className={styles.detailItem}>
                <span className={styles.label}>Status:</span>
                <span className={`${styles.value} ${styles.status} ${styles[selectedBooking.payment_status]}`}>
                  {selectedBooking.payment_status}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Payment Amount */}
        <div className={styles.formGroup}>
          <label htmlFor="amount">Payment Amount (£)</label>
          <input
            type="number"
            id="amount"
            name="amount"
            value={paymentData.amount}
            onChange={handleInputChange}
            min="0.01"
            max={selectedBooking?.remaining_balance || 0}
            step="0.01"
            className={styles.formInput}
            placeholder="Enter amount"
          />
          {selectedBooking && (
            <div className={styles.amountHelp}>
              Maximum: £{selectedBooking.remaining_balance}
            </div>
          )}
        </div>

        {/* Payment Method */}
        <div className={styles.formGroup}>
          <label htmlFor="payment_method">Payment Method</label>
          <select
            id="payment_method"
            name="payment_method"
            value={paymentData.payment_method}
            onChange={handleInputChange}
            className={styles.formSelect}
          >
            <option value="card">Credit/Debit Card</option>
            <option value="bank_transfer">Bank Transfer</option>
            <option value="cash">Cash</option>
            <option value="cheque">Cheque</option>
          </select>
        </div>

        {/* Reference */}
        <div className={styles.formGroup}>
          <label htmlFor="reference">Reference (Optional)</label>
          <input
            type="text"
            id="reference"
            name="reference"
            value={paymentData.reference}
            onChange={handleInputChange}
            className={styles.formInput}
            placeholder="Payment reference or transaction ID"
          />
        </div>



        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className={styles.submitButton}
        >
          {loading ? 'Processing...' : `Pay £${paymentData.amount || '0.00'}`}
        </button>
      </form>
    </div>
  );
}
