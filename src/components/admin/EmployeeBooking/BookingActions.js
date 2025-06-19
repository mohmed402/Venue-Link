'use client'

import styles from '@/styles/EmployeeBooking/BookingActions.module.css'

export default function BookingActions({ onSubmit, onSaveDraft, onClear, loading, errors, bookingData }) {
  // Determine if this is an update or create operation
  const isUpdate = bookingData?.id;
  const hasPayments = bookingData?.payments?.length > 0;
  const paymentStatus = bookingData?.payment_status || 'unpaid';

  // Determine button text and style based on booking state
  const getSubmitButtonText = () => {
    if (loading?.submit) {
      return isUpdate ? 'Updating...' : 'Creating...';
    }

    if (isUpdate) {
      return 'Update Booking';
    } else {
      return 'Create Booking';
    }
  };

  const getSubmitButtonClass = () => {
    if (isUpdate && paymentStatus === 'unpaid') {
      return `${styles.submitButton} ${styles.unpaidBooking}`;
    }
    return styles.submitButton;
  };

  return (
    <div className={styles.container}>
      {/* Booking Status Info */}
      {isUpdate && (
        <div className={styles.statusInfo}>
          <div className={styles.statusItem}>
            <span className={styles.statusLabel}>Status:</span>
            <span className={`${styles.statusValue} ${styles[bookingData.status]}`}>
              {bookingData.status?.toUpperCase() || 'CONFIRMED'}
            </span>
          </div>
          <div className={styles.statusItem}>
            <span className={styles.statusLabel}>Payment:</span>
            <span className={`${styles.statusValue} ${styles[paymentStatus]}`}>
              {paymentStatus?.toUpperCase().replace('_', ' ') || 'UNPAID'}
            </span>
          </div>
        </div>
      )}

      {/* Error Messages */}
      {errors?.submit && (
        <div className={styles.errorMessage}>
          {errors.submit}
        </div>
      )}
      {errors?.draft && (
        <div className={styles.errorMessage}>
          {errors.draft}
        </div>
      )}

      <button
        className={getSubmitButtonClass()}
        onClick={onSubmit}
        disabled={loading?.submit}
      >
        {loading?.submit ? (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.loadingIcon}>
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="31.416" strokeDashoffset="31.416">
                <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
                <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
              </circle>
            </svg>
            {getSubmitButtonText()}
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.submitIcon}>
              {isUpdate ? (
                <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/>
              ) : (
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/>
              )}
            </svg>
            {getSubmitButtonText()}
          </>
        )}
      </button>

      <button
        className={styles.draftButton}
        onClick={onSaveDraft}
        disabled={loading?.draft}
      >
        {loading?.draft ? (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.loadingIcon}>
              <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="31.416" strokeDashoffset="31.416">
                <animate attributeName="stroke-dasharray" dur="2s" values="0 31.416;15.708 15.708;0 31.416" repeatCount="indefinite"/>
                <animate attributeName="stroke-dashoffset" dur="2s" values="0;-15.708;-31.416" repeatCount="indefinite"/>
              </circle>
            </svg>
            Saving...
          </>
        ) : (
          <>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.draftIcon}>
              <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z" fill="currentColor"/>
            </svg>
            Save as Draft
          </>
        )}
      </button>

      <button
        className={styles.clearButton}
        onClick={onClear}
        disabled={loading?.submit || loading?.draft}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" className={styles.clearIcon}>
          <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="currentColor"/>
        </svg>
        Clear Form
      </button>
    </div>
  )
}