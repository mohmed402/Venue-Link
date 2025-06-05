'use client'

import { useState } from 'react'
import styles from '@/styles/EmployeeBooking/PaymentManagement.module.css'

const PAYMENT_METHODS = [
  { id: 'cash', label: 'Cash', icon: '💵' },
  { id: 'credit', label: 'Credit Card', icon: '💳' },
  { id: 'debit', label: 'Debit Card', icon: '💳' },
  { id: 'bank', label: 'Bank Transfer', icon: '🏦' },
  { id: 'check', label: 'Check', icon: '✏️' },
  { id: 'paypal', label: 'PayPal', icon: '🔷' },
  { id: 'venmo', label: 'Venmo', icon: '💰' },
  { id: 'zelle', label: 'Zelle', icon: '💰' },
  { id: 'apple', label: 'Apple Pay', icon: '🍎' },
  { id: 'google', label: 'Google Pay', icon: '⭕' },
  { id: 'other', label: 'Other', icon: '💰' }
];

export default function PaymentManagement({ bookingData, setBookingData }) {
  const [showAddPayment, setShowAddPayment] = useState(false);
  const [newPayment, setNewPayment] = useState({
    amount: '',
    method: '',
    reference: '',
    notes: ''
  });

  const totalPaid = bookingData.payments?.reduce((sum, payment) => sum + payment.amount, 0) || 0;
  const remainingBalance = bookingData.totalAmount - totalPaid;
  const progressPercentage = (totalPaid / bookingData.totalAmount) * 100;

  const handleAddPayment = () => {
    if (!newPayment.amount || !newPayment.method) return;

    const payment = {
      id: Date.now(),
      amount: parseFloat(newPayment.amount),
      method: newPayment.method,
      reference: newPayment.reference || `Ref: ${Math.random().toString(36).slice(2, 11).toUpperCase()}`,
      notes: newPayment.notes,
      date: new Date().toISOString(),
      recordedBy: 'John Smith'
    };

    const updatedPayments = [...(bookingData.payments || []), payment];
    setBookingData({
      ...bookingData,
      payments: updatedPayments
    });

    setNewPayment({ amount: '', method: '', reference: '', notes: '' });
    setShowAddPayment(false);
  };

  const handleDeletePayment = (paymentId) => {
    const updatedPayments = bookingData.payments.filter(payment => payment.id !== paymentId);
    setBookingData({
      ...bookingData,
      payments: updatedPayments
    });
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
        <span>💳</span> Payment Management
      </h2>

      <div className={styles.summary}>
        <div className={styles.row}>
          <span>Total Amount</span>
          <span className={styles.amount}>${bookingData.totalAmount.toFixed(2)}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.paid}>Total Paid</span>
          <span className={styles.paidAmount}>${totalPaid.toFixed(2)}</span>
        </div>
        <div className={styles.row}>
          <span className={styles.remaining}>Remaining Balance</span>
          <span className={styles.remainingAmount}>${remainingBalance.toFixed(2)}</span>
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
          <h3>Record Payment</h3>
          <button 
            className={styles.addButton}
            onClick={() => setShowAddPayment(true)}
          >
            + Add Payment
          </button>
        </div>
      </div>

      <div className={styles.historySection}>
        <h3>Payment History</h3>
        {bookingData.payments?.length > 0 ? (
          <div className={styles.paymentList}>
            {bookingData.payments.map((payment) => (
              <div key={payment.id} className={styles.paymentItem}>
                <div className={styles.paymentHeader}>
                  <div className={styles.paymentAmount}>
                    <span className={styles.currencyIcon}>💵</span>
                    ${payment.amount.toFixed(2)}
                    <span className={styles.paymentMethod}>{payment.method}</span>
                  </div>
                  <button
                    className={styles.deleteButton}
                    onClick={() => handleDeletePayment(payment.id)}
                  >
                    🗑️
                  </button>
                </div>
                <div className={styles.paymentInfo}>
                  <div className={styles.paymentMeta}>
                    <span>Payment #{payment.id}</span>
                  </div>
                  <div className={styles.paymentMeta}>
                    <span>📅 {formatDate(payment.date)}</span>
                  </div>
                  <div className={styles.paymentMeta}>
                    <span>👤 Recorded by {payment.recordedBy}</span>
                  </div>
                  <div className={styles.paymentMeta}>
                    <span>🔢 {payment.reference}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyHistory}>
            <span>📝</span>
            <p>No payments recorded yet</p>
          </div>
        )}
      </div>

      {showAddPayment && (
        <div className={styles.modalOverlay}>
          <div className={styles.modal}>
            <div className={styles.modalHeader}>
              <h3>Record New Payment</h3>
              <button 
                className={styles.closeButton}
                onClick={() => setShowAddPayment(false)}
              >
                ✕
              </button>
            </div>
            <div className={styles.modalContent}>
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
                      <span>{method.icon}</span>
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
                  disabled={!newPayment.amount || !newPayment.method}
                >
                  Save Payment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
} 