'use client'

import styles from '@/styles/EmployeeBooking/BookingActions.module.css'

export default function BookingActions({ onSubmit, onSaveDraft, onClear }) {
  return (
    <div className={styles.container}>
      <button 
        className={styles.submitButton}
        onClick={onSubmit}
      >
        <span className={styles.submitIcon}>✈️</span>
        Submit Booking
      </button>

      <button 
        className={styles.draftButton}
        onClick={onSaveDraft}
      >
        <span className={styles.draftIcon}>📄</span>
        Save as Draft
      </button>

      <button 
        className={styles.clearButton}
        onClick={onClear}
      >
        <span className={styles.clearIcon}>🗑️</span>
        Clear Form
      </button>
    </div>
  )
} 