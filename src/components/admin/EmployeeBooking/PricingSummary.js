'use client'

import { useState } from 'react'
import styles from '@/styles/EmployeeBooking/PricingSummary.module.css'

export default function PricingSummary({ bookingData, setBookingData }) {
  const [isEditing, setIsEditing] = useState(false);
  const [newPrice, setNewPrice] = useState(bookingData.totalAmount);
  const [priceReason, setPriceReason] = useState('');
  const [showError, setShowError] = useState(false);

  const baseRate = bookingData.totalAmount;
  const calculatedTotal = baseRate * bookingData.duration;

  const handlePriceChange = (value) => {
    setNewPrice(value);
    if (value !== calculatedTotal) {
      setIsEditing(true);
    } else {
      setIsEditing(false);
      setPriceReason('');
    }
  };

  const handlePriceConfirm = () => {
    if (newPrice !== calculatedTotal && !priceReason.trim()) {
      setShowError(true);
      return;
    }
    setShowError(false);
    setBookingData({
      ...bookingData,
      totalAmount: newPrice,
      depositAmount: newPrice * 0.3,
      remainingBalance: newPrice * 0.7,
      priceChangeHistory: [
        ...(bookingData.priceChangeHistory || []),
        {
          from: calculatedTotal,
          to: newPrice,
          reason: priceReason,
          date: new Date().toISOString(),
          by: 'John Smith' // This should come from user context
        }
      ]
    });
    setIsEditing(false);
    setPriceReason('');
  };

  const handlePriceCancel = () => {
    setNewPrice(calculatedTotal);
    setIsEditing(false);
    setPriceReason('');
    setShowError(false);
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>
        <span>💰</span> Pricing Summary
      </h2>

      <div className={styles.content}>
        <div className={styles.row}>
          <span>Base Rate</span>
          <span>${baseRate.toFixed(2)}</span>
        </div>

        <div className={styles.row}>
          <span>{bookingData.duration} hours × ${baseRate.toFixed(2)}</span>
          <span>${calculatedTotal.toFixed(2)}</span>
        </div>

        <div className={styles.totalSection}>
          <div className={styles.totalRow}>
            <span>Total Price</span>
            <div className={styles.totalAmount}>
              <div className={styles.priceInput}>
                <span>$</span>
                <input
                  type="number"
                  value={newPrice}
                  onChange={(e) => handlePriceChange(Number(e.target.value))}
                  className={styles.priceField}
                />
                {newPrice !== calculatedTotal && (
                  <div className={styles.priceActions}>
                    <button onClick={handlePriceConfirm} className={styles.confirmButton}>
                      ✓
                    </button>
                    <button onClick={handlePriceCancel} className={styles.cancelButton}>
                      ✕
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {isEditing && (
            <div className={styles.reasonSection}>
              <label className={styles.reasonLabel}>
                Reason for price change *
                <textarea
                  value={priceReason}
                  onChange={(e) => setPriceReason(e.target.value)}
                  placeholder="Please explain why the price is being changed (e.g., special discount, VIP customer, manager approval, etc.)"
                  className={`${styles.reasonInput} ${showError ? styles.error : ''}`}
                />
              </label>
              {showError && (
                <p className={styles.errorMessage}>
                  A reason is required when changing the price from the calculated amount.
                </p>
              )}
              <p className={styles.priceChange}>
                Price change: ${calculatedTotal.toFixed(2)} → ${newPrice.toFixed(2)}
                ({(newPrice - calculatedTotal) > 0 ? '+' : ''}{(newPrice - calculatedTotal).toFixed(2)})
              </p>
            </div>
          )}

          {bookingData.priceChangeHistory && bookingData.priceChangeHistory.length > 0 && !isEditing && (
            <div className={styles.priceHistory}>
              <h4>Price Change History</h4>
              {bookingData.priceChangeHistory.map((change, index) => (
                <div key={index} className={styles.historyItem}>
                  <p className={styles.historyReason}>{change.reason}</p>
                  <p className={styles.historyDetails}>
                    ${change.from.toFixed(2)} → ${change.to.toFixed(2)}
                    <span className={styles.historyMeta}>
                      by {change.by} • {new Date(change.date).toLocaleDateString()}
                    </span>
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={styles.depositSection}>
        <h3 className={styles.depositTitle}>
          <span>💳</span> Deposit Information
        </h3>
        <div className={styles.depositContent}>
          <div className={styles.depositRow}>
            <span>Deposit Required (30%)</span>
            <span>${(newPrice * 0.3).toFixed(2)}</span>
          </div>
          <div className={styles.depositRow}>
            <span>Remaining Balance</span>
            <span>${(newPrice * 0.7).toFixed(2)}</span>
          </div>
        </div>
      </div>
    </div>
  )
} 