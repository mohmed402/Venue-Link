'use client'

import { useState, useEffect } from 'react'
import styles from '@/styles/EmployeeBooking/PaymentManagement.module.css'
import { savePriceChangeAfterBooking } from './PricingSummary';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import SuccessNotification from '../../SuccessNotification';
import AlertNotification from '../../AlertNotification';
import ConfirmationNotification from '../../ConfirmationNotification';
import { deleteDraftBooking } from '@/utils/api';

const PAYMENT_METHODS = [
  { id: 'cash', label: 'Cash', icon: 
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M11 17h2v-1h1c.55 0 1-.45 1-1v-3c0-.55-.45-1-1-1h-3v-1h4V8h-2V7h-2v1h-1c-.55 0-1 .45-1 1v3c0 .55.45 1 1 1h3v1H9v2h2v1zm9-13H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2z" fill="currentColor"/>
    </svg>
  },
  { id: 'credit', label: 'Credit Card', icon: 
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" fill="currentColor"/>
    </svg>
  },
  { id: 'debit', label: 'Debit Card', icon: 
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" fill="currentColor"/>
    </svg>
  },
  { id: 'bank', label: 'Bank Transfer', icon: 
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M11 9h2V6h3l-4-4-4 4h3v3zm-4 2c-.55 0-1 .45-1 1v7c0 .55.45 1 1 1s1-.45 1-1v-7c0-.55-.45-1-1-1zm2.5 0c-.55 0-1 .45-1 1v7c0 .55.45 1 1 1s1-.45 1-1v-7c0-.55-.45-1-1-1zm2.5 0c-.55 0-1 .45-1 1v7c0 .55.45 1 1 1s1-.45 1-1v-7c0-.55-.45-1-1-1zm2.5 0c-.55 0-1 .45-1 1v7c0 .55.45 1 1 1s1-.45 1-1v-7c0-.55-.45-1-1-1zm2.5 0c-.55 0-1 .45-1 1v7c0 .55.45 1 1 1s1-.45 1-1v-7c0-.55-.45-1-1-1z" fill="currentColor"/>
    </svg>
  },
  { id: 'check', label: 'Check', icon: 
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11zm-5.5-2.5L9 14l1.41-1.41L12.5 14.67l3.59-3.58L17.5 12.5l-5 5z" fill="currentColor"/>
    </svg>
  },
  { id: 'paypal', label: 'PayPal', icon: 
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8z" fill="currentColor"/>
    </svg>
  },
  { id: 'venmo', label: 'Venmo', icon: 
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M7 4V2C7 1.45 7.45 1 8 1s1 .45 1 1v2h1V2c0-.55.45-1 1-1s1 .45 1 1v2h1c1.1 0 2 .9 2 2v14c0 1.1-.9 2-2 2H6c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2h1zm5 8c0-1.66-1.34-3-3-3s-3 1.34-3 3 1.34 3 3 3 3-1.34 3-3z" fill="currentColor"/>
    </svg>
  },
  { id: 'zelle', label: 'Zelle', icon: 
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z" fill="currentColor"/>
    </svg>
  },
  { id: 'apple', label: 'Apple Pay', icon: 
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.09999 22C7.78999 22.05 6.79999 20.68 5.95999 19.47C4.24999 17 2.93999 12.45 4.69999 9.39C5.56999 7.87 7.13999 6.91 8.81999 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z" fill="currentColor"/>
    </svg>
  },
  { id: 'google', label: 'Google Pay', icon: 
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.545 10.239v3.821h5.445c-.712 2.315-2.647 3.972-5.445 3.972-3.332 0-6.033-2.701-6.033-6.032s2.701-6.032 6.033-6.032c1.498 0 2.866.549 3.921 1.453l2.814-2.814C17.503 2.988 15.139 2 12.545 2 7.021 2 2.543 6.477 2.543 12s4.478 10 10.002 10c8.396 0 10.249-7.85 9.426-11.748L12.545 10.239z" fill="currentColor"/>
    </svg>
  },
  { id: 'other', label: 'Other', icon: 
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z" fill="currentColor"/>
    </svg>
  }
];

export default function PaymentManagement({ bookingData, setBookingData, onAddPayment }) {
  const { user } = useUnifiedAuth();
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [newPayment, setNewPayment] = useState({
    amount: '',
    method: '',
    reference: '',
    notes: ''
  });

  // Alert notification state
  const [alertNotification, setAlertNotification] = useState({
    isVisible: false,
    title: '',
    message: '',
    type: 'warning'
  });

  // Confirmation notification state
  const [confirmationNotification, setConfirmationNotification] = useState({
    isVisible: false,
    title: '',
    message: '',
    type: 'warning',
    onConfirm: null
  });

  // Helper function to show alert notifications
  const showAlert = (title, message, type = 'warning') => {
    setAlertNotification({
      isVisible: true,
      title,
      message,
      type
    });
  };

  // Helper function to close alert notifications
  const closeAlert = () => {
    setAlertNotification({
      isVisible: false,
      title: '',
      message: '',
      type: 'warning'
    });
  };

  // Helper function to show confirmation notifications
  const showConfirmation = (title, message, onConfirm, type = 'warning') => {
    setConfirmationNotification({
      isVisible: true,
      title,
      message,
      type,
      onConfirm
    });
  };

  // Helper function to close confirmation notifications
  const closeConfirmation = () => {
    setConfirmationNotification({
      isVisible: false,
      title: '',
      message: '',
      type: 'warning',
      onConfirm: null
    });
  };

  const totalPaid = bookingData.payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
  const totalAmount = bookingData.totalAmount || 0;
  const remainingBalance = totalAmount - totalPaid;
  const progressPercentage = totalAmount > 0 ? (totalPaid / totalAmount) * 100 : 0;

  // Function to save booking when deposit is paid
  const saveBookingWithPayment = async (paymentData) => {
    try {
      // Debug: Log the booking data being sent
      const bookingPayload = {
        venue_id: bookingData.venue_id || 86,
        customer_id: bookingData.client?.id || bookingData.customer_id,
        date: bookingData.eventDate,
        time_from: bookingData.startTime,
        time_to: bookingData.endTime,
        people_count: bookingData.peopleCount,
        event_type: bookingData.eventType,
        amount: bookingData.totalAmount,
        deposit_amount: bookingData.depositAmount,
        deposit_percentage: bookingData.depositPercentage || 30,
        status: 'confirmed',
        notes: bookingData.notes || '',
        created_by: user.id // This should come from user context
      };

      console.log('Booking payload:', bookingPayload);

      // Validate required fields
      if (!bookingPayload.customer_id) {
        throw new Error('Customer ID is required. Please select a customer first.');
      }
      if (!bookingPayload.date) {
        throw new Error('Event date is required. Please select a date.');
      }
      if (!bookingPayload.time_from) {
        throw new Error('Start time is required. Please select a start time.');
      }
      if (!bookingPayload.time_to) {
        throw new Error('End time is required. Please select an end time.');
      }

      // First, create the booking
      const bookingResponse = await fetch('http://localhost:5001/api/admin/employee-booking/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(bookingPayload),
      });

      if (!bookingResponse.ok) {
        const errorData = await bookingResponse.json();
        console.error('Booking creation failed:', errorData);
        throw new Error(errorData.error || 'Failed to create booking');
      }
      
      const savedBooking = await bookingResponse.json();
      
      // Update booking data with the new ID
      setBookingData(prev => ({
        ...prev,
        id: savedBooking.id,
        status: 'confirmed'
      }));

      // If this booking was created from a draft, delete the draft
      console.log('PaymentManagement: Checking for draft ID to delete:', bookingData.draftId);
      console.log('PaymentManagement: Full booking data:', bookingData);
      if (bookingData.draftId) {
        try {
          console.log('PaymentManagement: Deleting draft booking with ID:', bookingData.draftId);
          await deleteDraftBooking(bookingData.draftId);
          console.log('PaymentManagement: Draft booking deleted after conversion to real booking.');

          // Clear the draft ID to prevent duplicate deletion attempts
          setBookingData(prev => ({
            ...prev,
            draftId: null
          }));
        } catch (err) {
          console.error('PaymentManagement: Failed to delete draft booking after conversion:', err);
        }
      } else {
        console.log('PaymentManagement: No draft ID found, skipping draft deletion.');
      }

      // Save price change if there was one
      if (bookingData.priceChangeData) {
        await savePriceChangeAfterBooking(savedBooking.id, bookingData.priceChangeData);
      }

      // Now save the payment
      const paymentResponse = await fetch('http://localhost:5001/api/admin/employee-booking/payments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          booking_id: savedBooking.id,
          amount: paymentData.amount,
          payment_method: paymentData.method,
          reference: paymentData.reference,
          recorded_by: user.id // This should come from user context
        }),
      });

      if (!paymentResponse.ok) {
        const errorData = await paymentResponse.json();
        console.error('Payment creation failed:', errorData);
        throw new Error(errorData.error || 'Failed to save payment');
      }

      const savedPayment = await paymentResponse.json();
      
      // Refresh payments from database instead of manually updating local state
      await fetchPayments(savedBooking.id);

      return { booking: savedBooking, payment: savedPayment };
    } catch (error) {
      console.error('Failed to save booking and payment:', error);
      throw error;
    }
  };

  // Fetch payments when booking ID is available
  const fetchPayments = async (bookingId = bookingData.id) => {
    if (!bookingId) return;
    
    try {
      setLoading(true);
      console.log('Fetching payments for booking ID:', bookingId);
      const response = await fetch(`http://localhost:5001/api/admin/employee-booking/payments?booking_id=${bookingId}`);
      if (!response.ok) throw new Error('Failed to fetch payments');
      
      const payments = await response.json();
      console.log('Fetched payments:', payments);
      setBookingData(prev => ({
        ...prev,
        payments: payments
      }));
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch payments when component mounts or booking ID changes
  useEffect(() => {
    if (bookingData.id) {
      fetchPayments(bookingData.id);
    }
  }, [bookingData.id]);

  const handleAddPayment = async () => {
    if (!newPayment.amount || !newPayment.method) return;

    const paymentAmount = parseFloat(newPayment.amount);
    const isDepositPayment = !bookingData.id && paymentAmount > 0;

    try {
      setLoading(true);
      console.log('Adding payment:', { paymentAmount, isDepositPayment, bookingId: bookingData.id });

      const paymentData = {
        amount: paymentAmount,
        method: newPayment.method,
        reference: newPayment.reference || `Ref: ${Math.random().toString(36).slice(2, 11).toUpperCase()}`,
        notes: newPayment.notes
      };

      if (isDepositPayment) {
        // This is the first payment (deposit) - save booking and payment together
        console.log('Saving booking with deposit payment');
        const result = await saveBookingWithPayment(paymentData);

        // Use the callback to notify parent component about the booking creation
        if (onAddPayment && result.booking) {
          await onAddPayment({
            ...paymentData,
            booking: result.booking,
            payment: result.payment
          });
        }

        // Show success notification instead of alert
        setShowSuccessNotification(true);
      } else {
        // Booking already exists - just add the payment
        if (!bookingData.id) {
          showAlert('Booking Required', 'Please save the booking first before adding payments', 'warning');
          return;
        }

        console.log('Adding payment to existing booking:', bookingData.id);

        // Use the callback to add payment through the parent component
        if (onAddPayment) {
          const paymentToAdd = {
            booking_id: bookingData.id,
            amount: paymentAmount,
            payment_method: newPayment.method,
            reference: paymentData.reference,
            recorded_by: user.id
          };

          await onAddPayment(paymentToAdd);
        } else {
          // Fallback: call API directly if no callback
          const response = await fetch('http://localhost:5001/api/admin/employee-booking/payments', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              booking_id: bookingData.id,
              amount: paymentAmount,
              payment_method: newPayment.method,
              reference: paymentData.reference,
              recorded_by: user.id
            }),
          });

          if (!response.ok) throw new Error('Failed to save payment');

          const savedPayment = await response.json();
          console.log('Payment saved successfully:', savedPayment);

          // Refresh payments from database
          await fetchPayments();
        }
      }

      setNewPayment({ amount: '', method: '', reference: '', notes: '' });
      setShowAddPayment(false);
    } catch (error) {
      console.error('Failed to save payment:', error);
      showAlert('Payment Error', 'Failed to save payment. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeletePayment = (paymentId) => {
    showConfirmation(
      'Delete Payment',
      'Are you sure you want to delete this payment? This action cannot be undone.',
      () => deletePayment(paymentId),
      'danger'
    );
  };

  const deletePayment = async (paymentId) => {
    closeConfirmation();
    
    try {
      setLoading(true);
      console.log('Attempting to delete payment with ID:', paymentId);
      console.log('Current bookingData:', bookingData);
      
      const response = await fetch(`http://localhost:5001/api/admin/employee-booking/payments/${paymentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deleted_by: user.id // This should come from user context
        })
      });

      console.log('Delete response status:', response.status);
      console.log('Delete response ok:', response.ok);

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Delete response error:', errorData);
        throw new Error(errorData.error || 'Failed to delete payment');
      }

      const result = await response.json();
      console.log('Delete successful:', result);

      // Remove from local state
      const updatedPayments = (bookingData.payments || []).filter(payment => payment.id !== paymentId);
      console.log('Updated payments:', updatedPayments);
      
      setBookingData(prev => ({
        ...prev,
        payments: updatedPayments
      }));
      
      showAlert('Success', 'Payment deleted successfully!', 'info');
    } catch (error) {
      console.error('Failed to delete payment:', error);
      showAlert('Delete Error', `Failed to delete payment: ${error.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: 'numeric',
      hour12: true
    });
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" fill="currentColor"/>
        </svg>
        Payment Management
      </h2>

      <div className={styles.summary}>
        <div className={styles.row}>
          <span>Total Amount</span>
          <span className={styles.amount}>£{(bookingData.totalAmount || 0).toFixed(2)}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.paid}>Total Paid</span>
          <span className={styles.paidAmount}>£{totalPaid.toFixed(2)}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.remaining}>Remaining Balance</span>
          <span className={styles.remainingAmount}>£{remainingBalance.toFixed(2)}</span>
        </div>

        <div className={styles.progressSection}>
          <div className={styles.progressLabel}>
            <span>Payment Progress</span>
            <span>{Math.round(progressPercentage)}%</span>
          </div>
          <div className={styles.progressBar}>
            <div 
              className={styles.progressFill} 
              style={{ width: `${progressPercentage}%` }}
            />
          </div>
        </div>
      </div>

      <div className={styles.recordSection}>
        <div className={styles.recordHeader}>
          <h3>
            {!bookingData.id ? 'Record Deposit to Confirm Booking' : 'Record Payment'}
          </h3>
          <button 
            className={styles.addButton}
            onClick={() => setShowAddPayment(true)}
            disabled={!bookingData.id && (!bookingData.client || !bookingData.eventDate || !bookingData.startTime || !bookingData.endTime)}
          >
            {!bookingData.id ? '+ Record Deposit' : '+ Add Payment'}
          </button>
        </div>
        {!bookingData.id && (
          <div className={styles.depositInfo}>
            <p>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" fill="currentColor"/>
              </svg>
              Recording a deposit payment will immediately save the booking and all details to the database.
            </p>
          </div>
        )}
        {!bookingData.id && (!bookingData.client || !bookingData.eventDate || !bookingData.startTime || !bookingData.endTime) && (
          <div className={styles.requirementsInfo}>
            <p>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z" fill="currentColor"/>
              </svg>
              Please complete the following before recording deposit:
            </p>
            <ul>
              {!bookingData.client && <li>Select a customer</li>}
              {!bookingData.eventDate && <li>Choose event date</li>}
              {!bookingData.startTime && <li>Set start time</li>}
              {!bookingData.endTime && <li>Set end time</li>}
            </ul>
          </div>
        )}
      </div>

      <div className={styles.historySection}>
        <h3>Payment History</h3>
        {bookingData.payments?.length > 0 ? (
          <div className={styles.paymentList}>
            {bookingData.payments.map((payment) => (
              <div key={payment.id} className={styles.paymentItem}>
                <div className={styles.paymentHeader}>
                  <div className={styles.paymentAmount}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.currencyIcon}>
                      <path d="M11 17h2v-1h1c.55 0 1-.45 1-1v-3c0-.55-.45-1-1-1h-3v-1h4V8h-2V7h-2v1h-1c-.55 0-1 .45-1 1v3c0 .55.45 1 1 1h3v1H9v2h2v1zm9-13H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2z" fill="currentColor"/>
                    </svg>
                    £{payment.amount.toFixed(2)}
                    <span className={styles.paymentMethod}>{payment.payment_method}</span>
                  </div>
                  <button
                    className={styles.deleteButton}
                    onClick={() => handleDeletePayment(payment.id)}
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/>
                    </svg>
                  </button>
                </div>
                <div className={styles.paymentInfo}>
                  <div className={styles.paymentMeta}>
                    <span>Payment #{payment.id}</span>
                  </div>
                  <div className={styles.paymentMeta}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" fill="currentColor"/>
                    </svg>
                    <span>{formatDate(payment.payment_date)}</span>
                  </div>
                  <div className={styles.paymentMeta}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor"/>
                    </svg>
                    <span>Recorded by {payment.staff?.full_name || payment.recorded_by || 'Unknown'}</span>
                  </div>
                  <div className={styles.paymentMeta}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11zm-5.5-2.5L9 14l1.41-1.41L12.5 14.67l3.59-3.58L17.5 12.5l-5 5z" fill="currentColor"/>
                    </svg>
                    <span>{payment.reference}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyHistory}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z" fill="currentColor"/>
            </svg>
            <p>No payments recorded yet</p>
          </div>
        )}
      </div>

      {showAddPayment && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>
                {!bookingData.id ? 'Record Deposit Payment' : 'Record Additional Payment'}
              </h3>
              <button 
                className={styles.closeButton}
                onClick={() => setShowAddPayment(false)}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
                </svg>
              </button>
            </div>
            <div className={styles.modalContent}>
              {!bookingData.id && (
                <div className={styles.depositNotice}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.58L19 8l-9 9z" fill="currentColor"/>
                  </svg>
                  <p>Recording this payment will confirm the booking and save all details to the database.</p>
                </div>
              )}
              <div className={styles.formGroup}>
                <label>Amount *</label>
                <input
                  type="number"
                  value={newPayment.amount}
                  onChange={(e) => setNewPayment({ ...newPayment, amount: e.target.value })}
                  placeholder="0.00"
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Payment Method *</label>
                <div className={styles.methodGrid}>
                  {PAYMENT_METHODS.map((method) => (
                    <button
                      key={method.id}
                      className={`${styles.methodButton} ${newPayment.method === method.label ? styles.methodSelected : ''}`}
                      onClick={() => setNewPayment({ ...newPayment, method: method.label })}
                    >
                      {method.icon}
                      {method.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className={styles.formGroup}>
                <label>Reference/Transaction ID</label>
                <input
                  type="text"
                  value={newPayment.reference}
                  onChange={(e) => setNewPayment({ ...newPayment, reference: e.target.value })}
                  placeholder="Check number, transaction ID, etc."
                  className={styles.input}
                />
              </div>
              <div className={styles.formGroup}>
                <label>Notes</label>
                <textarea
                  value={newPayment.notes}
                  onChange={(e) => setNewPayment({ ...newPayment, notes: e.target.value })}
                  placeholder="Optional notes about this payment."
                  className={styles.textarea}
                />
              </div>
              <div className={styles.modalActions}>
                <button 
                  className={styles.saveButton}
                  onClick={handleAddPayment}
                  disabled={!newPayment.amount || !newPayment.method || loading}
                >
                  {loading 
                    ? 'Saving...' 
                    : !bookingData.id 
                      ? 'Confirm Booking & Record Payment' 
                      : 'Save Payment'
                  }
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <SuccessNotification
        isVisible={showSuccessNotification}
        onClose={() => setShowSuccessNotification(false)}
        title="Booking Confirmed!"
        message="Booking confirmed and deposit payment recorded successfully!"
      />

      {/* Alert Notification */}
      <AlertNotification
        isVisible={alertNotification.isVisible}
        onClose={closeAlert}
        title={alertNotification.title}
        message={alertNotification.message}
        type={alertNotification.type}
        autoClose={true}
        autoCloseDelay={5000}
      />

      {/* Confirmation Notification */}
      <ConfirmationNotification
        isVisible={confirmationNotification.isVisible}
        onConfirm={confirmationNotification.onConfirm}
        onCancel={closeConfirmation}
        title={confirmationNotification.title}
        message={confirmationNotification.message}
        type={confirmationNotification.type}
        confirmText="Delete"
        cancelText="Cancel"
      />
    </div>
  )
}