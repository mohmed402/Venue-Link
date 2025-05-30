import React from 'react';
import styles from '@/styles/AdminBookings.module.css';

export default function BookingFilters({ filters, onFilterChange }) {
  const handleStatusChange = (e) => {
    onFilterChange({
      ...filters,
      status: e.target.value
    });
  };

  const handleDateRangeChange = (e) => {
    onFilterChange({
      ...filters,
      dateRange: e.target.value
    });
  };

  const handleSearchChange = (e) => {
    onFilterChange({
      ...filters,
      searchQuery: e.target.value
    });
  };

  return (
    <div className={styles.filtersContainer}>
      <div className={styles.filterGroup}>
        <input
          type="text"
          placeholder="Search by customer or venue..."
          className={styles.searchInput}
          value={filters.searchQuery}
          onChange={handleSearchChange}
        />
      </div>

      <div className={styles.filterGroup}>
        <select
          value={filters.status}
          onChange={handleStatusChange}
          className={styles.filterSelect}
        >
          <option value="all">All Status</option>
          <option value="confirmed">Confirmed</option>
          <option value="pending">Pending</option>
          <option value="cancelled">Cancelled</option>
        </select>

        <select
          value={filters.dateRange}
          onChange={handleDateRangeChange}
          className={styles.filterSelect}
        >
          <option value="all">All Time</option>
          <option value="today">Today</option>
          <option value="week">This Week</option>
          <option value="month">This Month</option>
          <option value="custom">Custom Range</option>
        </select>
      </div>
    </div>
  );
} 