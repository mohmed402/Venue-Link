'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/router';
import AdminNav from '@/components/adminNav';
import BookingList from '@/components/admin/BookingList';
import BookingFilters from '@/components/admin/BookingFilters';
import BookingStats from '@/components/admin/BookingStats';
import ProtectedRoute from '@/components/ProtectedRoute';
import EditBookingModal from '@/components/admin/EditBookingModal';
import AddNoteModal from '@/components/admin/AddNoteModal';
import SuccessNotification from '@/components/SuccessNotification';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { getAllBookings, updateBooking, deleteBooking, getBookingStats } from '@/utils/api';
import styles from '@/styles/AdminBookings.module.css';
import { initializeDarkMode } from '../../utils/darkMode';

export default function AdminBookings() {
  const router = useRouter();
  const { user } = useUnifiedAuth();
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddNoteModalOpen, setIsAddNoteModalOpen] = useState(false);
  const [showSuccessNotification, setShowSuccessNotification] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState({
    title: "Success!",
    message: "Operation completed successfully."
  });
  
  const [filters, setFilters] = useState({
    status: 'all',
    dateRange: 'all',
    searchTerm: '',
    sortBy: 'date',
    sortOrder: 'desc'
  });

  // Initialize dark mode on component mount
  useEffect(() => {
    initializeDarkMode();
  }, []);

  // Fetch bookings from API
  const fetchBookings = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const apiFilters = {
        venue_id: 86,
        status: filters.status === 'all' ? '' : filters.status,
        search: filters.searchTerm,
        limit: 100
      };

      // Add date range filters
      if (filters.dateRange !== 'all') {
        const today = new Date();
        switch (filters.dateRange) {
          case 'today':
            apiFilters.date_from = today.toISOString().split('T')[0];
            apiFilters.date_to = today.toISOString().split('T')[0];
            break;
          case 'week':
            const weekStart = new Date(today);
            weekStart.setDate(today.getDate() - today.getDay());
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekStart.getDate() + 6);
            apiFilters.date_from = weekStart.toISOString().split('T')[0];
            apiFilters.date_to = weekEnd.toISOString().split('T')[0];
            break;
          case 'month':
            const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
            const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 0);
            apiFilters.date_from = monthStart.toISOString().split('T')[0];
            apiFilters.date_to = monthEnd.toISOString().split('T')[0];
            break;
        }
      }

      const data = await getAllBookings(apiFilters);
      setBookings(data);
    } catch (err) {
      setError(err.message);
      console.error('Failed to fetch bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBookings();
  }, [filters]);

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  const handleViewBooking = (bookingId) => {
    router.push(`/admin/bookings/${bookingId}`);
  };

  const handleEditBooking = (bookingId) => {
    router.push(`/admin/bookings/${bookingId}`);
  };

  if (loading) {
    return (
      <ProtectedRoute requiredPermission="canManageBookings">
        <div className={styles.adminLayout}>
          <AdminNav />
          <main className={styles.mainContent}>
            <div className={styles.loading}>Loading bookings...</div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  if (error) {
    return (
      <ProtectedRoute requiredPermission="canManageBookings">
        <div className={styles.adminLayout}>
          <AdminNav />
          <main className={styles.mainContent}>
            <div className={styles.error}>
              Error loading bookings: {error}
              <button onClick={fetchBookings} className={styles.retryButton}>
                Retry
              </button>
            </div>
          </main>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute requiredPermission="canManageBookings">
      <div className={styles.adminLayout}>
        <AdminNav />
        <main className={styles.mainContent}>
          <header className={styles.pageHeader}>
            <h1>Bookings Management</h1>
            <div className={styles.headerActions}>
              <button className={styles.exportButton}>
                Export Data
              </button>
            </div>
          </header>

          <BookingStats bookings={bookings} />
          
          <section className={styles.bookingSection}>
            <BookingFilters 
              filters={filters} 
              onFilterChange={handleFilterChange} 
            />
            <BookingList
              bookings={bookings}
              filters={filters}
              onViewBooking={handleViewBooking}
              onEditBooking={handleEditBooking}
            />
          </section>
        </main>
      </div>
    </ProtectedRoute>
  );
} 