import React, { useState, useEffect } from 'react';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { updateBooking, addPayment, getClients } from '@/utils/api';
import SuccessNotification from '@/components/SuccessNotification';
import styles from '@/styles/EditBookingModal.module.css';

export default function EditBookingModal({ isOpen, onClose, booking, onBookingUpdated }) {
  const { user } = useUnifiedAuth();
  const [activeTab, setActiveTab] = useState('details');
  const [loading, setLoading] = useState(false);
  const [clients, setClients] = useState([]);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  // Booking form data
  const [bookingData, setBookingData] = useState({
    customer_id: '',
    date: '',
    time_from: '',
    time_to: '',
    people_count: '',
    event_type: '',
    amount: '',
    deposit_amount: '',
    notes: '',
    status: 'confirmed'
  });

  // Payment form data
  const [paymentData, setPaymentData] = useState({
    amount: '',
    payment_method: '',
    reference: '',
    notes: ''
  });

  // Initialize form data when booking changes
  useEffect(() => {
    if (booking && isOpen) {
      setBookingData({
        customer_id: booking.customer_id || '',
        date: booking.date || '',
        time_from: booking.time_from || '',
        time_to: booking.time_to || '',
        people_count: booking.people_count || '',
        event_type: booking.event_type || '',
        amount: booking.amount || '',
        deposit_amount: booking.deposit_amount || '',
        notes: booking.notes || '',
        status: booking.status || 'confirmed'
      });
      
      // Reset payment form
      setPaymentData({
        amount: '',
        payment_method: '',
        reference: '',
        notes: ''
      });
    }
  }, [booking, isOpen]);

  // Load clients when modal opens
  useEffect(() => {
    if (isOpen) {
      loadClients();
    }
  }, [isOpen]);

  const loadClients = async () => {
    try {
      const clientsData = await getClients();
      setClients(clientsData);
    } catch (error) {
      console.error('Failed to load clients:', error);
    }
  };

  const handleBookingUpdate = async () => {
    if (!booking?.id) return;

    try {
      setLoading(true);

      // Update booking details
      const updateData = {
        ...bookingData,
        venue_id: 86, // Default venue ID
        created_by: user.id
      };

      const result = await updateBooking(booking.id, updateData);

      // Also record payment if payment data is provided
      if (paymentData.amount && paymentData.payment_method) {
        const payment = {
          booking_id: booking.id,
          amount: parseFloat(paymentData.amount),
          payment_method: paymentData.payment_method,
          reference: paymentData.reference || `Ref: ${Math.random().toString(36).slice(2, 11).toUpperCase()}`,
          notes: paymentData.notes,
          recorded_by: user.id
        };

        await addPayment(payment);

        // Reset payment form after successful payment
        setPaymentData({
          amount: '',
          payment_method: '',
          reference: '',
          notes: ''
        });

        setSuccessMessage('Booking updated and payment recorded successfully!');
      } else {
        setSuccessMessage('Booking updated successfully!');
      }

      setShowSuccessNotification(true);

      // Notify parent component
      if (onBookingUpdated) {
        onBookingUpdated(result);
      }

      // Close modal after short delay
      setTimeout(() => {
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Failed to update booking:', error);
      alert('Failed to update booking. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentAdd = async () => {
    if (!booking?.id || !paymentData.amount || !paymentData.payment_method) {
      alert('Please fill in all required payment fields');
      return;
    }

    try {
      setLoading(true);

      // Update booking details first if any changes were made
      const hasBookingChanges =
        bookingData.customer_id !== booking.customer_id ||
        bookingData.date !== booking.date ||
        bookingData.time_from !== booking.time_from ||
        bookingData.time_to !== booking.time_to ||
        bookingData.people_count !== booking.people_count ||
        bookingData.event_type !== booking.event_type ||
        bookingData.amount !== booking.amount ||
        bookingData.deposit_amount !== booking.deposit_amount ||
        bookingData.notes !== booking.notes ||
        bookingData.status !== booking.status;

      if (hasBookingChanges) {
        const updateData = {
          ...bookingData,
          venue_id: 86, // Default venue ID
          created_by: user.id
        };

        await updateBooking(booking.id, updateData);
      }

      // Record the payment
      const payment = {
        booking_id: booking.id,
        amount: parseFloat(paymentData.amount),
        payment_method: paymentData.payment_method,
        reference: paymentData.reference || `Ref: ${Math.random().toString(36).slice(2, 11).toUpperCase()}`,
        notes: paymentData.notes,
        recorded_by: user.id
      };

      await addPayment(payment);

      // Reset payment form
      setPaymentData({
        amount: '',
        payment_method: '',
        reference: '',
        notes: ''
      });

      if (hasBookingChanges) {
        setSuccessMessage('Booking updated and payment recorded successfully!');
      } else {
        setSuccessMessage('Payment recorded successfully!');
      }

      setShowSuccessNotification(true);

      // Notify parent component to refresh booking data
      if (onBookingUpdated) {
        // Trigger a refresh of the booking data
        window.location.reload(); // Simple refresh for now
      }

    } catch (error) {
      console.error('Failed to record payment:', error);
      alert('Failed to record payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen || !booking) return null;

  const totalPaid = booking.payments?.reduce((sum, payment) => sum + (payment.amount || 0), 0) || 0;
  const remainingBalance = (booking.amount || 0) - totalPaid;

  return (
    <>
      <div className={styles.modalOverlay}>
        <div className={styles.modal}>
          <div className={styles.modalHeader}>
            <h2>Edit Booking #{booking.id?.toString().padStart(5, '0')}</h2>
            <button 
              className={styles.closeButton}
              onClick={onClose}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
              </svg>
            </button>
          </div>

          <div className={styles.modalTabs}>
            <button 
              className={`${styles.tab} ${activeTab === 'details' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('details')}
            >
              Booking Details
            </button>
            <button 
              className={`${styles.tab} ${activeTab === 'payment' ? styles.activeTab : ''}`}
              onClick={() => setActiveTab('payment')}
            >
              Record Payment
            </button>
          </div>

          <div className={styles.modalContent}>
            {activeTab === 'details' && (
              <div className={styles.tabContent}>
                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label>Customer *</label>
                    <select
                      value={bookingData.customer_id}
                      onChange={(e) => setBookingData({...bookingData, customer_id: e.target.value})}
                      className={styles.input}
                    >
                      <option value="">Select Customer</option>
                      {clients.map(client => (
                        <option key={client.id} value={client.id}>
                          {client.full_name} - {client.phone_number}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Event Date *</label>
                    <input
                      type="date"
                      value={bookingData.date}
                      onChange={(e) => setBookingData({...bookingData, date: e.target.value})}
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Start Time *</label>
                    <input
                      type="time"
                      value={bookingData.time_from}
                      onChange={(e) => setBookingData({...bookingData, time_from: e.target.value})}
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>End Time *</label>
                    <input
                      type="time"
                      value={bookingData.time_to}
                      onChange={(e) => setBookingData({...bookingData, time_to: e.target.value})}
                      className={styles.input}
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Number of People *</label>
                    <input
                      type="number"
                      value={bookingData.people_count}
                      onChange={(e) => setBookingData({...bookingData, people_count: e.target.value})}
                      className={styles.input}
                      min="1"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Event Type</label>
                    <input
                      type="text"
                      value={bookingData.event_type}
                      onChange={(e) => setBookingData({...bookingData, event_type: e.target.value})}
                      className={styles.input}
                      placeholder="e.g., Wedding, Birthday, Corporate"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Total Amount (£) *</label>
                    <input
                      type="number"
                      value={bookingData.amount}
                      onChange={(e) => setBookingData({...bookingData, amount: e.target.value})}
                      className={styles.input}
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Deposit Amount (£)</label>
                    <input
                      type="number"
                      value={bookingData.deposit_amount}
                      onChange={(e) => setBookingData({...bookingData, deposit_amount: e.target.value})}
                      className={styles.input}
                      min="0"
                      step="0.01"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Status</label>
                    <select
                      value={bookingData.status}
                      onChange={(e) => setBookingData({...bookingData, status: e.target.value})}
                      className={styles.input}
                    >
                      <option value="confirmed">Confirmed</option>
                      <option value="pending">Pending</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Notes</label>
                    <textarea
                      value={bookingData.notes}
                      onChange={(e) => setBookingData({...bookingData, notes: e.target.value})}
                      className={styles.textarea}
                      rows="3"
                      placeholder="Additional notes about the booking..."
                    />
                  </div>
                </div>

                <div className={styles.helpText}>
                  <p>💡 Tip: If you also want to record a payment, switch to the "Record Payment" tab and fill in the payment details. The "Save Changes" button will save both booking details and any payment information.</p>
                </div>

                <div className={styles.formActions}>
                  <button
                    type="button"
                    onClick={handleBookingUpdate}
                    disabled={loading}
                    className={styles.updateButton}
                  >
                    {loading ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'payment' && (
              <div className={styles.tabContent}>
                <div className={styles.paymentSummary}>
                  <div className={styles.summaryItem}>
                    <span>Total Amount:</span>
                    <span className={styles.amount}>£{(booking.amount || 0).toFixed(2)}</span>
                  </div>
                  <div className={styles.summaryItem}>
                    <span>Total Paid:</span>
                    <span className={styles.amount}>£{totalPaid.toFixed(2)}</span>
                  </div>
                  <div className={styles.summaryItem}>
                    <span>Remaining Balance:</span>
                    <span className={`${styles.amount} ${remainingBalance > 0 ? styles.outstanding : styles.paid}`}>
                      £{remainingBalance.toFixed(2)}
                    </span>
                  </div>
                </div>

                <div className={styles.formGrid}>
                  <div className={styles.formGroup}>
                    <label>Payment Amount (£) *</label>
                    <input
                      type="number"
                      value={paymentData.amount}
                      onChange={(e) => setPaymentData({...paymentData, amount: e.target.value})}
                      className={styles.input}
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Payment Method *</label>
                    <select
                      value={paymentData.payment_method}
                      onChange={(e) => setPaymentData({...paymentData, payment_method: e.target.value})}
                      className={styles.input}
                    >
                      <option value="">Select Method</option>
                      <option value="cash">Cash</option>
                      <option value="card">Card</option>
                      <option value="bank_transfer">Bank Transfer</option>
                      <option value="cheque">Cheque</option>
                      <option value="other">Other</option>
                    </select>
                  </div>

                  <div className={styles.formGroup}>
                    <label>Reference</label>
                    <input
                      type="text"
                      value={paymentData.reference}
                      onChange={(e) => setPaymentData({...paymentData, reference: e.target.value})}
                      className={styles.input}
                      placeholder="Transaction reference (optional)"
                    />
                  </div>

                  <div className={styles.formGroup}>
                    <label>Payment Notes</label>
                    <textarea
                      value={paymentData.notes}
                      onChange={(e) => setPaymentData({...paymentData, notes: e.target.value})}
                      className={styles.textarea}
                      rows="2"
                      placeholder="Additional payment notes..."
                    />
                  </div>
                </div>

                <div className={styles.helpText}>
                  <p>💡 Tip: This button will save any changes made to booking details AND record the payment above.</p>
                </div>

                <div className={styles.formActions}>
                  <button
                    type="button"
                    onClick={handlePaymentAdd}
                    disabled={loading || !paymentData.amount || !paymentData.payment_method}
                    className={styles.paymentButton}
                  >
                    {loading ? 'Saving...' : 'Save & Record Payment'}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <SuccessNotification
        isVisible={showSuccessNotification}
        onClose={() => setShowSuccessNotification(false)}
        title="Success!"
        message={successMessage}
      />
    </>
  );
}
