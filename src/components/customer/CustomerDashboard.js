import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useUnifiedAuth } from '../../contexts/UnifiedAuthContext';
import styles from '../../styles/customer/CustomerDashboard.module.css';

export default function CustomerDashboard() {
  const { customer, user } = useUnifiedAuth();
  const [stats, setStats] = useState({
    upcomingBookings: 0,
    totalBookings: 0,
    pendingPayments: 0,
    favoriteVenues: 0
  });
  const [recentBookings, setRecentBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDashboardData();
    }
  }, [user]);

  const fetchDashboardData = async () => {
    try {
      // This would typically fetch from your API
      // For now, using mock data
      setStats({
        upcomingBookings: 3,
        totalBookings: 12,
        pendingPayments: 1,
        favoriteVenues: 5
      });

      setRecentBookings([
        {
          id: 1,
          venue_name: 'Grand Ballroom',
          date: '2024-01-15',
          time: '18:00',
          status: 'confirmed',
          amount: 1200
        },
        {
          id: 2,
          venue_name: 'Garden Pavilion',
          date: '2024-01-22',
          time: '14:00',
          status: 'pending',
          amount: 800
        }
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading your dashboard...</p>
      </div>
    );
  }

  return (
    <div className={styles.dashboard}>
      {/* Welcome Section */}
      <div className={styles.welcomeSection}>
        <h1>Welcome back, {customer?.full_name || 'Customer'}!</h1>
        <p>Here&apos;s what&apos;s happening with your bookings and account.</p>
      </div>

      {/* Stats Cards */}
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          </div>
          <div className={styles.statContent}>
            <h3>{stats.upcomingBookings}</h3>
            <p>Upcoming Bookings</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9,22 9,12 15,12 15,22"/>
            </svg>
          </div>
          <div className={styles.statContent}>
            <h3>{stats.totalBookings}</h3>
            <p>Total Bookings</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="6" x2="12" y2="10"/>
              <line x1="12" y1="16" x2="12.01" y2="16"/>
            </svg>
          </div>
          <div className={styles.statContent}>
            <h3>{stats.pendingPayments}</h3>
            <p>Pending Payments</p>
          </div>
        </div>

        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </div>
          <div className={styles.statContent}>
            <h3>{stats.favoriteVenues}</h3>
            <p>Favorite Venues</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className={styles.quickActions}>
        <h2>Quick Actions</h2>
        <div className={styles.actionGrid}>
          <Link href="/book" className={styles.actionCard}>
            <div className={styles.actionIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="16"/>
                <line x1="8" y1="12" x2="16" y2="12"/>
              </svg>
            </div>
            <h3>New Booking</h3>
            <p>Book a new venue for your event</p>
          </Link>

          <Link href="/customer/payments" className={styles.actionCard}>
            <div className={styles.actionIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2"/>
                <line x1="1" y1="10" x2="23" y2="10"/>
              </svg>
            </div>
            <h3>Make Payment</h3>
            <p>Pay deposits or outstanding balances</p>
          </Link>

          <Link href="/customer/favorites" className={styles.actionCard}>
            <div className={styles.actionIcon}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
              </svg>
            </div>
            <h3>Browse Favorites</h3>
            <p>View your saved favorite venues</p>
          </Link>
        </div>
      </div>

      {/* Recent Bookings */}
      <div className={styles.recentBookings}>
        <div className={styles.sectionHeader}>
          <h2>Recent Bookings</h2>
          <Link href="/customer/bookings" className={styles.viewAllLink}>
            View All
          </Link>
        </div>
        
        <div className={styles.bookingsList}>
          {recentBookings.map((booking) => (
            <div key={booking.id} className={styles.bookingCard}>
              <div className={styles.bookingInfo}>
                <h3>{booking.venue_name}</h3>
                <p>{booking.date} at {booking.time}</p>
              </div>
              <div className={styles.bookingMeta}>
                <span className={`${styles.status} ${styles[booking.status]}`}>
                  {booking.status}
                </span>
                <span className={styles.amount}>£{booking.amount}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
