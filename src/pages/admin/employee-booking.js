'use client';
import React, { useState } from 'react';
import AdminNav from '@/components/adminNav';

// import { getVenuePricing, createBooking, isVenueAvailable } from '@/mockData/bookingData';

import styles from '@/styles/employeeBooking.module.css';






// import styles from './page.module.css';
import ClientSelection from '@/components/admin/EmployeeBooking/ClientSelection';
import BookingDetails from '@/components/admin/EmployeeBooking/BookingDetails';
import BookingPolicies from '@/components/admin/EmployeeBooking/BookingPolicies';
import PricingSummary from '@/components/admin/EmployeeBooking/PricingSummary';
import PaymentManagement from '@/components/admin/EmployeeBooking/PaymentManagement';
import AdminControls from '@/components/admin/EmployeeBooking/AdminControls';
import BookingActions from '@/components/admin/EmployeeBooking/BookingActions';

export default function EmployeeBooking() {
  const [bookingData, setBookingData] = useState({
    client: null,
    eventDate: '2024-03-17',
    startTime: '08:00',
    endTime: '14:00',
    numberOfGuests: 80,
    eventType: '',
    totalAmount: 1800.00,
    depositAmount: 540.00,
    remainingBalance: 1260.00,
    payments: [{
      id: 1,
      amount: 200.00,
      method: 'Cash',
      reference: '3748732897433',
      date: '2025-06-03T01:29:00.000Z',
      recordedBy: 'John Smith'
    }]
  });

  const handleSubmitBooking = () => {
    // TODO: Implement booking submission logic
    console.log('Submitting booking:', bookingData);
  };

  const handleSaveDraft = () => {
    // TODO: Implement draft saving logic
    console.log('Saving draft:', bookingData);
  };

  const handleClearForm = () => {
    setBookingData({
      client: null,
      eventDate: '2024-03-17',
      startTime: '08:00',
      endTime: '14:00',
      numberOfGuests: 80,
      eventType: '',
      totalAmount: 1800.00,
      depositAmount: 540.00,
      remainingBalance: 1260.00,
      payments: []
    });
  };

  return (
    <div className={styles.pageContainer}>
      <AdminNav />
      <main className={styles.main}>
        <header className={styles.header}>
          <div className={styles.headerTop}>
            <div>
              <h1 className={styles.title}>Employee Booking System</h1>
              <p className={styles.subtitle}>Create and manage venue bookings for clients and internal events</p>
            </div>
            <div className={styles.userInfo}>
              Logged in as: <span className={styles.userName}>John Smith</span> 
              <span className={styles.userRole}>(manager)</span>
            </div>
          </div>
        </header>

        <div className={styles.content}>
          <div className={styles.leftColumn}>
            <ClientSelection 
              isActive={true}
              bookingData={bookingData}
              setBookingData={setBookingData}
            />
            
            <BookingDetails 
              isActive={true}
              bookingData={bookingData}
              setBookingData={setBookingData}
            />
          </div>

          <div className={styles.rightColumn}>
            <PricingSummary 
              bookingData={bookingData}
              setBookingData={setBookingData}
            />
            <PaymentManagement
              bookingData={bookingData}
              setBookingData={setBookingData}
            />
            <AdminControls />
            <BookingActions
              onSubmit={handleSubmitBooking}
              onSaveDraft={handleSaveDraft}
              onClear={handleClearForm}
            />
          </div>
        </div>
      </main>
    </div>
  );
} 