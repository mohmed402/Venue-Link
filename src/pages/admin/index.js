'use client';

import React, { useState, useEffect } from 'react';
import AdminNav from '@/components/adminNav';
import styles from '@/styles/adminDashboard.module.css';
import BookingCalendar from '@/components/BookingCalendar';
import ProtectedRoute from '@/components/ProtectedRoute';
import { useUnifiedAuth } from "../../contexts/UnifiedAuthContext";
import { checkPermission } from "../../utils/roles";
import {
  getDashboardSummary,
  getDashboardTodayBookings,
  getDashboardActivity,
  getDashboardAlerts,
  createDashboardAlert,
  markAlertAsDone
} from '../../utils/api';
import AddNoteModal from '@/components/admin/AddNoteModal';
import SuccessNotification from '@/components/SuccessNotification';
import { useRouter } from 'next/router';
import { formatTimeAgo } from '../../utils/dateUtils';
import { initializeDarkMode } from '../../utils/darkMode';

function AdminDashboardContent() {
  const { user, userRole } = useUnifiedAuth();
  const router = useRouter();
  const venueId = 86;

  const [summary, setSummary] = useState(null);
  const [todayBookings, setTodayBookings] = useState([]);
  const [recentActivity, setRecentActivity] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState({
    title: "Success!",
    message: "Operation completed successfully."
  });

  const [isLoading, setIsLoading] = useState({
    summary: true,
    bookings: true,
    activity: true,
    alerts: true
  });

  const [errors, setErrors] = useState({
    summary: null,
    bookings: null,
    activity: null,
    alerts: null
  });

  // Initialize dark mode on component mount
  useEffect(() => {
    initializeDarkMode();
  }, []);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setErrors({
        summary: null,
        bookings: null,
        activity: null,
        alerts: null
      });

      try {
        const summaryData = await getDashboardSummary(venueId);
        setSummary(summaryData);
        setIsLoading(prev => ({ ...prev, summary: false }));
      } catch (error) {
        console.error('Failed to load summary data:', error);
        setErrors(prev => ({ ...prev, summary: 'Failed to load summary data' }));
        setIsLoading(prev => ({ ...prev, summary: false }));
      }

      try {
        const bookingsData = await getDashboardTodayBookings(venueId);
        setTodayBookings(bookingsData);
        setIsLoading(prev => ({ ...prev, bookings: false }));
      } catch (error) {
        console.error('Failed to load today\'s bookings:', error);
        setErrors(prev => ({ ...prev, bookings: 'Failed to load bookings' }));
        setIsLoading(prev => ({ ...prev, bookings: false }));
      }

      try {
        const activityData = await getDashboardActivity(venueId);
        setRecentActivity(activityData);
        setIsLoading(prev => ({ ...prev, activity: false }));
      } catch (error) {
        console.error('Failed to load recent activity:', error);
        setErrors(prev => ({ ...prev, activity: 'Failed to load activity' }));
        setIsLoading(prev => ({ ...prev, activity: false }));
      }

      try {
        const alertsData = await getDashboardAlerts(venueId);
        setAlerts(alertsData);
        setIsLoading(prev => ({ ...prev, alerts: false }));
      } catch (error) {
        console.error('Failed to load alerts:', error);
        setErrors(prev => ({ ...prev, alerts: 'Failed to load alerts' }));
        setIsLoading(prev => ({ ...prev, alerts: false }));
      }
    };

    fetchDashboardData();
  }, [venueId]);

  const getCurrentStatus = (booking) => {
    const now = new Date();
    const bookingTime = new Date(booking.date + 'T' + booking.time_from);
    const timeDiff = bookingTime - now;
    const hoursUntil = timeDiff / (1000 * 60 * 60);

    if (booking.status === "cancelled") return "cancelled";
    if (hoursUntil <= 0 && hoursUntil > -parseInt(booking.duration)) return "active";
    if (hoursUntil > 0 && hoursUntil < 2) return "upcoming";
    return booking.status;
  };

  // Button handlers
  const handleNewBooking = () => {
    router.push('/admin/employee-booking');
  };

  const handleAddNote = () => {
    setIsAddNoteModalOpen(true);
  };

  const handleSettings = () => {
    router.push('/admin/settings');
  };

  const handleSubmitNote = async (alertData) => {
    try {
      await createDashboardAlert(alertData);

      // Refresh alerts
      const alertsData = await getDashboardAlerts(venueId);
      setAlerts(alertsData);

      return Promise.resolve();
    } catch (error) {
      console.error('Failed to create alert:', error);
      throw error;
    }
  };

  const handleNoteSuccess = () => {
    setNotificationMessage({
      title: "Note Added!",
      message: "Your note has been successfully added to the venue."
    });
    setShowSuccessNotification(true);
  };

  const handleMarkAsDone = async (alertId) => {
    try {
      // Check if user is authenticated and has an ID
      if (!user || !user.id) {
        console.error('User not authenticated or missing ID');
        setNotificationMessage({
          title: "Authentication Error",
          message: "Please log in again to mark tasks as done."
        });
        setShowSuccessNotification(true);
        return;
      }

      await markAlertAsDone(alertId, user.id);

      // Refresh alerts to remove the completed one
      const alertsData = await getDashboardAlerts(venueId);
      setAlerts(alertsData);

      // Show success notification
      setNotificationMessage({
        title: "Task Completed!",
        message: "The task has been marked as done and recorded in your name."
      });
      setShowSuccessNotification(true);
    } catch (error) {
      console.error('Failed to mark alert as done:', error);
      setNotificationMessage({
        title: "Error",
        message: "Failed to mark task as done. Please try again."
      });
      setShowSuccessNotification(true);
    }
  };

  return (
    <div className={styles.pageContainer}>
      <AdminNav />
      <main className={styles.main}>
        <header className={styles.header}>
          <h1>Dashboard</h1>
          <div className={styles.quickActions}>
            <button className={styles.actionButton} onClick={handleNewBooking}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z" fill="currentColor"/>
              </svg>
              New Booking
            </button>
            <button className={styles.actionButton} onClick={handleAddNote}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z" fill="currentColor"/>
              </svg>
              Add Note
            </button>
            <button className={styles.actionButton} onClick={handleSettings}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19.14,12.94c0.04-0.3,0.06-0.61,0.06-0.94c0-0.32-0.02-0.64-0.07-0.94l2.03-1.58c0.18-0.14,0.23-0.41,0.12-0.61 l-1.92-3.32c-0.12-0.22-0.37-0.29-0.59-0.22l-2.39,0.96c-0.5-0.38-1.03-0.7-1.62-0.94L14.4,2.81c-0.04-0.24-0.24-0.41-0.48-0.41 h-3.84c-0.24,0-0.43,0.17-0.47,0.41L9.25,5.35C8.66,5.59,8.12,5.92,7.63,6.29L5.24,5.33c-0.22-0.08-0.47,0-0.59,0.22L2.74,8.87 C2.62,9.08,2.66,9.34,2.86,9.48l2.03,1.58C4.84,11.36,4.8,11.69,4.8,12s0.02,0.64,0.07,0.94l-2.03,1.58 c-0.18,0.14-0.23,0.41-0.12,0.61l1.92,3.32c0.12,0.22,0.37,0.29,0.59,0.22l2.39-0.96c0.5,0.38,1.03,0.7,1.62,0.94l0.36,2.54 c0.05,0.24,0.24,0.41,0.48,0.41h3.84c0.24,0,0.44-0.17,0.47-0.41l0.36-2.54c0.59-0.24,1.13-0.56,1.62-0.94l2.39,0.96 c0.22,0.08,0.47,0,0.59-0.22l1.92-3.32c0.12-0.22,0.07-0.47-0.12-0.61L19.14,12.94z M12,15.6c-1.98,0-3.6-1.62-3.6-3.6 s1.62-3.6,3.6-3.6s3.6,1.62,3.6,3.6S13.98,15.6,12,15.6z" fill="currentColor"/>
              </svg>
              Settings
            </button>
          </div>
        </header>

        <div className={styles.grid}>
          {/* Summary Cards */}
          <section className={styles.summaryCards}>
            <div className={styles.card}>
              <h3>Today&apos;s Bookings</h3>
              <div className={styles.metric}>
                {isLoading.summary ? 'Loading...' : errors.summary ? '—' : summary?.bookingsToday}
              </div>
            </div>
            <div className={styles.card}>
              <h3>This Week</h3>
              <div className={styles.metric}>
                {isLoading.summary ? 'Loading...' : errors.summary ? '—' : summary?.bookingsThisWeek}
              </div>
            </div>
           
            {checkPermission(userRole, 'canViewIncome') && (
              <div className={styles.card}>
                <h3>Est. Revenue</h3>
                <div className={styles.metric}>
                  {isLoading.summary ? 'Loading...' : errors.summary ? '—' : summary?.estimatedRevenue}
                </div>
              </div>
            )}

            <div className={styles.card}>
              <h3>Cancellations</h3>
              <div className={styles.metric}>
                {isLoading.summary ? 'Loading...' : errors.summary ? '—' : summary?.cancellations}
              </div>
            </div>
            <div className={styles.card}>
              <h3>Popular Slot</h3>
              <div className={styles.metric}>
                {isLoading.summary ? 'Loading...' : errors.summary ? '—' : summary?.mostBookedSlot}
              </div>
            </div>
          </section>

          {/* Today's Bookings */}
          <section className={styles.todayBookings}>
            <h2>Today&apos;s Bookings</h2>
            {isLoading.bookings ? (
              <div className={styles.loading}>Loading bookings...</div>
            ) : errors.bookings ? (
              <div className={styles.error}>{errors.bookings}</div>
            ) : todayBookings.length === 0 ? (
              <div className={styles.empty}>No bookings for today</div>
            ) : (
              <div className={styles.bookingsList}>
                {todayBookings.map((booking) => (
                  <div 
                    key={booking.id} 
                    className={`${styles.bookingCard} ${styles[getCurrentStatus(booking)]}`}
                  >
                    <div className={styles.bookingHeader}>
                      <h3>{booking.customer_name}</h3>
                      <span className={`${styles.status} ${styles[booking.status]}`}>
                        {booking.status}
                      </span>
                    </div>
                    <div className={styles.bookingDetails}>
                      <p>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" fill="currentColor"/>
                        </svg>
                        {booking.date} at {booking.time_from}
                      </p>
                      <p>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M16 4c0-1.11.89-2 2-2s2 .89 2 2-.89 2-2 2-2-.89-2-2zM4 1v2h14V1H4zm0 13.5h14v-2H4v2zm0 3.5h14v-2H4v2zm9-7h9v-2h-9v2zm0-4h9V3h-9v4z" fill="currentColor"/>
                        </svg>
                        {booking.guests} guests
                      </p>
                      <p>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M5.5 7A1.5 1.5 0 0 1 4 5.5A1.5 1.5 0 0 1 5.5 4A1.5 1.5 0 0 1 7 5.5A1.5 1.5 0 0 1 5.5 7zm15.91 4.58l-9-9C12.05 2.22 11.55 2 11 2H4c-1.1 0-2 .9-2 2v7c0 .55.22 1.05.59 1.42l8.99 8.99c.36.36.86.59 1.42.59s1.05-.23 1.41-.59l7-7c.37-.36.59-.86.59-1.41 0-.56-.23-1.06-.59-1.42z" fill="currentColor"/>
                        </svg>
                        {booking.type}
                      </p>
                    </div>
                    <a href={`/admin/bookings/${booking.id}`} className={styles.manageLink}>
                      Manage Booking →
                    </a>
                  </div>
                ))}
              </div>
            )}
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
              {isLoading.activity ? (
                <div className={styles.loading}>Loading activity...</div>
              ) : errors.activity ? (
                <div className={styles.error}>{errors.activity}</div>
              ) : (
                <div className={styles.activities}>
                  {recentActivity.map((activity) => (
                    <div key={activity.id} className={styles.activity}>
                      <p>{activity.action}</p>
                      <small>
                        by {activity.user_name} • {formatTimeAgo(activity.timestamp)}
                      </small>
                    </div>
                  ))}
                </div>
              )}
            </section>

            <section className={styles.alerts}>
              <h2>Alerts & Tasks</h2>
              {isLoading.alerts ? (
                <div className={styles.loading}>Loading alerts...</div>
              ) : errors.alerts ? (
                <div className={styles.error}>{errors.alerts}</div>
              ) : (
                <div className={styles.alertsList}>
                  {alerts.map((alert) => (
                    <div key={alert.id} className={`${styles.alert} ${styles[alert.priority]} ${styles.alertHoverable}`}>
                      <div className={styles.alertContent}>
                        <div className={styles.alertHeader}>
                          <span className={styles.alertIcon}>
                            {alert.type === "maintenance" ? (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M22.7 19l-9.1-9.1c.9-2.3.4-5-1.5-6.9-2-2-5-2.4-7.4-1.3L9 6 6 9 1.6 4.7C.4 7.1.9 10.1 2.9 12.1c1.9 1.9 4.6 2.4 6.9 1.5l9.1 9.1c.4.4 1 .4 1.4 0l2.3-2.3c.5-.4.5-1.1.1-1.4z" fill="currentColor"/>
                              </svg>
                            ) : alert.type === "booking" ? (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" fill="currentColor"/>
                              </svg>
                            ) : alert.type === "system" ? (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M1 21h22L12 2 1 21zm12-3h-2v-2h2v2zm0-4h-2v-4h2v4z" fill="currentColor"/>
                              </svg>
                            ) : (
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm4 18H6V4h7v5h5v11z" fill="currentColor"/>
                              </svg>
                            )}
                          </span>
                          <span className={`${styles.priorityBadge} ${styles[alert.priority]}`}>
                            {alert.priority}
                          </span>
                        </div>
                        <p className={styles.alertMessage}>{alert.message}</p>
                      </div>
                      <button
                        className={styles.markDoneButton}
                        onClick={() => handleMarkAsDone(alert.id)}
                        title="Mark as done"
                      >
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/>
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>
        </div>
      </main>

      {/* Add Note Modal */}
      <AddNoteModal
        isOpen={isAddNoteModalOpen}
        onClose={() => setIsAddNoteModalOpen(false)}
        onSubmit={handleSubmitNote}
        onSuccess={handleNoteSuccess}
        venueId={venueId}
      />

      {/* Success Notification */}
      <SuccessNotification
        isVisible={showSuccessNotification}
        onClose={() => setShowSuccessNotification(false)}
        title={notificationMessage.title}
        message={notificationMessage.message}
        autoClose={true}
        autoCloseDelay={3000}
      />
    </div>
  );
}

export default function AdminDashboard() {
  return (
    <ProtectedRoute>
      <AdminDashboardContent />
    </ProtectedRoute>
  );
} 