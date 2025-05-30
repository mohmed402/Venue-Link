import React from 'react';
import styles from '@/styles/AdminBookings.module.css';

export default function BookingStats({ bookings }) {
  const stats = {
    total: bookings.length,
    confirmed: bookings.filter(b => b.status === 'confirmed').length,
    pending: bookings.filter(b => b.status === 'pending').length,
    cancelled: bookings.filter(b => b.status === 'cancelled').length,
    totalRevenue: bookings
      .filter(b => b.status === 'confirmed')
      .reduce((sum, b) => sum + b.totalAmount, 0)
  };

  return (
    <div className={styles.statsContainer}>
      <div className={styles.statCard}>
        <div className={styles.statIcon}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm.31-8.86c-1.77-.45-2.34-.94-2.34-1.67 0-.84.79-1.43 2.1-1.43 1.38 0 1.9.66 1.94 1.64h1.71c-.05-1.34-.87-2.57-2.49-2.97V5H10.9v1.69c-1.51.32-2.72 1.3-2.72 2.81 0 1.79 1.49 2.69 3.66 3.21 1.95.46 2.34 1.15 2.34 1.87 0 .53-.39 1.39-2.1 1.39-1.6 0-2.23-.72-2.32-1.64H8.04c.1 1.7 1.36 2.66 2.86 2.97V19h2.34v-1.67c1.52-.29 2.72-1.16 2.73-2.77-.01-2.2-1.9-2.96-3.66-3.42z" fill="currentColor"/>
          </svg>
        </div>
        <div className={styles.statInfo}>
          <h3>Total Revenue</h3>
          <p>£{stats.totalRevenue.toFixed(2)}</p>
        </div>
      </div>

      <div className={styles.statCard}>
        <div className={styles.statIcon}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M19 3h-4.18C14.4 1.84 13.3 1 12 1c-1.3 0-2.4.84-2.82 2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-7 0c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1zm-2 14l-4-4 1.41-1.41L10 14.17l6.59-6.59L18 9l-8 8z" fill="currentColor"/>
          </svg>
        </div>
        <div className={styles.statInfo}>
          <h3>Confirmed</h3>
          <p>{stats.confirmed}</p>
        </div>
      </div>

      <div className={styles.statCard}>
        <div className={styles.statIcon}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.42 2 2 6.42 2 12s4.42 10 10 10 10-4.42 10-10S17.58 2 12 2zm0 18c-4.42 0-8-3.58-8-8s3.58-8 8-8 8 3.58 8 8-3.58 8-8 8zm4.17-5.24l-1.1-1.1c.71-1.33.53-3.01-.59-4.13-1.38-1.38-3.61-1.38-4.99 0-1.38 1.38-1.38 3.61 0 4.99 1.12 1.12 2.8 1.31 4.13.59l1.1 1.1c.19.19.45.29.71.29.26 0 .52-.1.71-.29.39-.39.39-1.03 0-1.42z" fill="currentColor"/>
          </svg>
        </div>
        <div className={styles.statInfo}>
          <h3>Pending</h3>
          <p>{stats.pending}</p>
        </div>
      </div>

      <div className={styles.statCard}>
        <div className={styles.statIcon}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.47 2 2 6.47 2 12s4.47 10 10 10 10-4.47 10-10S17.53 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.59-13L12 10.59 8.41 7 7 8.41 10.59 12 7 15.59 8.41 17 12 13.41 15.59 17 17 15.59 13.41 12 17 8.41z" fill="currentColor"/>
          </svg>
        </div>
        <div className={styles.statInfo}>
          <h3>Cancelled</h3>
          <p>{stats.cancelled}</p>
        </div>
      </div>
    </div>
  );
} 