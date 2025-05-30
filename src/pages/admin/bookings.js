import React, { useState } from 'react';
import AdminNav from '@/components/adminNav';
import BookingList from '@/components/admin/BookingList';
import BookingFilters from '@/components/admin/BookingFilters';
import BookingStats from '@/components/admin/BookingStats';
import styles from '@/styles/AdminBookings.module.css';

export default function AdminBookings() {
  const [filters, setFilters] = useState({
    status: 'all',
    dateRange: 'all',
    searchQuery: '',
  });

  // Mock data - Replace with actual API call
  const bookings = [
    {
      id: 1,
      customerName: 'John Doe',
      date: '2024-03-20',
      time: '14:00',
      duration: '2h',
      people: 4,
      status: 'confirmed',
      venue: 'Main Hall',
      totalAmount: 250.00
    },
    {
      id: 2,
      customerName: 'Jane Smith',
      date: '2024-03-21',
      time: '18:30',
      duration: '3h',
      people: 8,
      status: 'pending',
      venue: 'Garden Room',
      totalAmount: 375.00
    },
    // Add more mock bookings as needed
  ];

  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  return (
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
          />
        </section>
      </main>
    </div>
  );
} 