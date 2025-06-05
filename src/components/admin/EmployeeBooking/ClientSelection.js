'use client'

import { useState } from 'react';
import styles from '@/styles/EmployeeBooking/ClientSelection.module.css'
import AddClientModal from './AddClientModal';

export default function ClientSelection({ isActive, bookingData, setBookingData }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  if (!isActive) return null

  const handleAddClient = (clientData) => {
    // Here you would typically send the data to your backend
    // For now, we'll just update the booking data
    setBookingData({
      ...bookingData,
      client: clientData
    });
  };

  const handleChangeClient = () => {
    setBookingData({
      ...bookingData,
      client: null
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h2 className={styles.title}>
          <span>👤</span> Client Selection
        </h2>
      </div>

      {!bookingData.client ? (
        <>
          <p className={styles.description}>
            Search for an existing client or add a new one to continue
          </p>

          <div className={styles.searchContainer}>
            <input
              type="text"
              placeholder="Search existing client..."
              className={styles.searchInput}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <button 
              className={styles.addButton}
              onClick={() => setIsModalOpen(true)}
            >
              <span>+</span> Add New
            </button>
          </div>
        </>
      ) : (
        <div className={styles.selectedClientCard}>
          <div className={styles.clientName}>
            {bookingData.client.fullName}
            <span className={styles.checkIcon}>✓</span>
            <button 
              className={styles.changeButton}
              onClick={handleChangeClient}
            >
              Change
            </button>
          </div>
          <div className={styles.clientInfo}>
            <div className={styles.infoRow}>
              <span className={styles.infoIcon}>✉️</span>
              {bookingData.client.email}
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoIcon}>📞</span>
              {bookingData.client.phone}
            </div>
          </div>
        </div>
      )}

      <AddClientModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddClient={handleAddClient}
      />
    </div>
  )
} 