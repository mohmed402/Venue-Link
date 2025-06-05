'use client';

import React from 'react';
import AdminNav from '@/components/adminNav';
import styles from '@/styles/adminDashboard.module.css';
import BookingCalendar from '@/components/BookingCalendar';

// Mock data for demonstration
const TODAY_BOOKINGS = [
  {
    id: 1,
    customerName: "John Smith",
    date: "2024-03-20",
    time: "14:00",
    duration: "3 hours",
    guests: 50,
    type: "Wedding Reception",
    status: "confirmed",
    startTime: new Date("2024-03-20T14:00:00"),
  },
  {
    id: 2,
    customerName: "Sarah Wilson",
    date: "2024-03-20",
    time: "10:00",
    duration: "2 hours",
    guests: 15,
    type: "Corporate Meeting",
    status: "pending",
    startTime: new Date("2024-03-20T10:00:00"),
  },
];

const SUMMARY_METRICS = {
  bookingsToday: 4,
  bookingsThisWeek: 12,
  estimatedRevenue: "£3,450",
  cancellations: 1,
  mostBookedSlot: "Friday 6–9pm"
};

const RECENT_ACTIVITY = [
  {
    id: 1,
    action: "Booking created",
    user: "Sarah",
    timestamp: "2 hours ago",
  },
  {
    id: 2,
    action: "Customer John Doe cancelled booking",
    user: "System",
    timestamp: "3 hours ago",
  },
  {
    id: 3,
    action: "Venue hours updated",
    user: "Admin",
    timestamp: "5 hours ago",
  },
];

const ALERTS = [
  {
    id: 1,
    type: "pending",
    message: "3 bookings pending approval",
    priority: "high",
  },
  {
    id: 2,
    type: "warning",
    message: "Missing customer info for booking #123",
    priority: "medium",
  },
];

export default function AdminDashboard() {
  const getCurrentStatus = (booking) => {
    const now = new Date();
    const bookingTime = booking.startTime;
    const timeDiff = bookingTime - now;
    const hoursUntil = timeDiff / (1000 * 60 * 60);

    if (booking.status === "cancelled") return "cancelled";
    if (hoursUntil <= 0 && hoursUntil > -parseInt(booking.duration)) return "active";
    if (hoursUntil > 0 && hoursUntil < 2) return "upcoming";
    return booking.status;
  };

  return (
    <div className={styles.pageContainer}>
      <AdminNav />
      <main className={styles.main}>
        <header className={styles.header}>
          <h1>Dashboard</h1>
          <div className={styles.quickActions}>
            <button className={styles.actionButton}>
              <span>➕</span> New Booking
            </button>
            <button className={styles.actionButton}>
              <span>📝</span> Add Note
            </button>
            <button className={styles.actionButton}>
              <span>⚙️</span> Settings
            </button>
          </div>
        </header>

        <div className={styles.grid}>
          {/* Summary Cards */}
          <section className={styles.summaryCards}>
            <div className={styles.card}>
              <h3>Today&apos;s Bookings</h3>
              <div className={styles.metric}>{SUMMARY_METRICS.bookingsToday}</div>
            </div>
            <div className={styles.card}>
              <h3>This Week</h3>
              <div className={styles.metric}>{SUMMARY_METRICS.bookingsThisWeek}</div>
            </div>
            <div className={styles.card}>
              <h3>Est. Revenue</h3>
              <div className={styles.metric}>{SUMMARY_METRICS.estimatedRevenue}</div>
            </div>
            <div className={styles.card}>
              <h3>Cancellations</h3>
              <div className={styles.metric}>{SUMMARY_METRICS.cancellations}</div>
            </div>
            <div className={styles.card}>
              <h3>Popular Slot</h3>
              <div className={styles.metric}>{SUMMARY_METRICS.mostBookedSlot}</div>
            </div>
          </section>

          {/* Today's Bookings */}
          <section className={styles.todayBookings}>
            <h2>Today&apos;s Bookings</h2>
            <div className={styles.bookingsList}>
              {TODAY_BOOKINGS.map((booking) => (
                <div 
                  key={booking.id} 
                  className={`${styles.bookingCard} ${styles[getCurrentStatus(booking)]}`}
                >
                  <div className={styles.bookingHeader}>
                    <h3>{booking.customerName}</h3>
                    <span className={`${styles.status} ${styles[booking.status]}`}>
                      {booking.status}
                    </span>
                  </div>
                  <div className={styles.bookingDetails}>
                    <p>
                      <span>📅</span> {booking.date} at {booking.time} ({booking.duration})
                    </p>
                    <p>
                      <span>👥</span> {booking.guests} guests
                    </p>
                    <p>
                      <span>🏷️</span> {booking.type}
                    </p>
                  </div>
                  <a href={`/admin/bookings/${booking.id}`} className={styles.manageLink}>
                    Manage Booking →
                  </a>
                </div>
              ))}
            </div>
          </section>

          {/* Calendar View */}
          <section className={styles.calendarView}>
            <h2>Booking Calendar</h2>
            <BookingCalendar />
          </section>

          {/* Activity Feed and Alerts */}
          <div className={styles.sidebar}>
            <section className={styles.activityFeed}>
              <h2>Recent Activity</h2>
              <div className={styles.activities}>
                {RECENT_ACTIVITY.map((activity) => (
                  <div key={activity.id} className={styles.activity}>
                    <p>{activity.action}</p>
                    <small>
                      by {activity.user} • {activity.timestamp}
                    </small>
                  </div>
                ))}
              </div>
            </section>

            <section className={styles.alerts}>
              <h2>Alerts & Tasks</h2>
              <div className={styles.alertsList}>
                {ALERTS.map((alert) => (
                  <div key={alert.id} className={`${styles.alert} ${styles[alert.type]}`}>
                    <span className={styles.alertIcon}>
                      {alert.type === "pending" ? "🛑" : "⚠️"}
                    </span>
                    <p>{alert.message}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </div>
      </main>
    </div>
  );
} 