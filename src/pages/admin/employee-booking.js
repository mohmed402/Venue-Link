'use client';
import React, { useState, useEffect } from 'react';
import AdminNav from '@/components/adminNav';
import ProtectedRoute from '@/components/ProtectedRoute';
import SuccessNotification from '@/components/SuccessNotification';
import { useAuth } from '@/contexts/AuthContext';
import { useLanguage } from '@/contexts/LanguageContext';
import {
  getClients,
  createClient,
  checkAvailability,
  getVenuePricing,
  createBooking,
  saveDraftBooking,
  addPayment,
  getPayments,
  updateBooking
} from '@/utils/api';

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
  const venueId = 86;
  const { user, userRole } = useAuth();
  const { t, isRTL } = useLanguage();
  
  const [bookingData, setBookingData] = useState({
    id: null, // Track booking ID
    client: null,
    eventDate: '2025-11-20',
    startTime: '08:00',
    endTime: '10:00',
    duration: 2,
    peopleCount: 80,
    eventType: '',
    totalAmount: 0,
    depositAmount: 0,
    remainingBalance: 0,
    payments: [],
    status: null, // Track booking status
    payment_status: 'unpaid' // Track payment status
  });

  // Track current booking ID after creation
  const [currentBookingId, setCurrentBookingId] = useState(null);
  const [isEditingExistingBooking, setIsEditingExistingBooking] = useState(false);

  // Administrative controls state
  const [adminControls, setAdminControls] = useState({
    setupTime: 0,
    breakdownTime: 0,
    priority: 'standard',
    revenueCategory: '',
    riskLevel: 'low',
    cancellationPolicy: 'standard',
    overrides: {
      availability: false,
      deposit: false,
      capacity: false,
      customPricing: false
    },
    pricingReason: '',
    notes: ''
  });

  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState({
    clients: false,
    pricing: false,
    availability: false,
    booking: false,
    draft: false
  });
  const [errors, setErrors] = useState({});

  // Success notification state
  const [notification, setNotification] = useState({
    isVisible: false,
    title: '',
    message: ''
  });

  // Load clients on component mount
  useEffect(() => {
    loadClients();
  }, []);

  // Helper function to show success notifications
  const showNotification = (title, message) => {
    setNotification({
      isVisible: true,
      title,
      message
    });
  };

  // Helper function to close notifications
  const closeNotification = () => {
    setNotification({
      isVisible: false,
      title: '',
      message: ''
    });
  };

  const loadClients = async () => {
    setLoading(prev => ({ ...prev, clients: true }));
    try {
      const clientsData = await getClients();
      setClients(clientsData);
    } catch (error) {
      setErrors(prev => ({ ...prev, clients: error.message }));
    } finally {
      setLoading(prev => ({ ...prev, clients: false }));
    }
  };

  const handleCreateClient = async (clientData) => {
    try {
      const newClient = await createClient({ ...clientData, venue_id: venueId });
      setClients(prev => [...prev, newClient]);
      setBookingData(prev => ({ ...prev, client: newClient }));
      return newClient;
    } catch (error) {
      setErrors(prev => ({ ...prev, createClient: error.message }));
      throw error;
    }
  };

  const checkVenueAvailability = async () => {
    setLoading(prev => ({ ...prev, availability: true }));
    try {
      // Use current booking ID if we're editing an existing booking
      const bookingIdToExclude = bookingData.id || currentBookingId;

      const availability = await checkAvailability(
        venueId,
        bookingData.eventDate,
        bookingData.startTime,
        bookingData.endTime,
        adminControls.setupTime,
        adminControls.breakdownTime,
        bookingIdToExclude
      );

      if (!availability.available) {
        setErrors(prev => ({
          ...prev,
          availability: 'Venue is not available at this time. Please choose a different time slot.'
        }));
        return false;
      }

      setErrors(prev => ({ ...prev, availability: null }));
      return true;
    } catch (error) {
      setErrors(prev => ({ ...prev, availability: error.message }));
      return false;
    } finally {
      setLoading(prev => ({ ...prev, availability: false }));
    }
  };

  const handleSubmitBooking = async () => {
    console.log('Submit booking clicked!', { bookingData, adminControls, user });

    if (!bookingData.client) {
      setErrors(prev => ({ ...prev, booking: 'Please select a client first' }));
      return;
    }

    // Determine if this is an update or create operation
    const isUpdate = bookingData.id || currentBookingId;
    const bookingIdToUse = bookingData.id || currentBookingId;

    // Check availability first with setup/breakdown times (exclude current booking if updating)
    const isAvailable = await checkVenueAvailability();
    if (!isAvailable) return;

    setLoading(prev => ({ ...prev, booking: true }));
    setErrors(prev => ({ ...prev, booking: null })); // Clear previous errors

    try {
      const bookingPayload = {
        venue_id: venueId,
        customer_id: bookingData.client.id,
        date: bookingData.eventDate,
        time_from: bookingData.startTime,
        time_to: bookingData.endTime,
        people_count: parseInt(bookingData.peopleCount) || 0,
        event_type: bookingData.eventType,
        amount: parseFloat(bookingData.totalAmount) || 0,
        deposit_amount: parseFloat(bookingData.depositAmount) || 0,
        deposit_percentage: bookingData.depositAmount && bookingData.totalAmount ?
          Math.round((bookingData.depositAmount / bookingData.totalAmount) * 100) : 0,
        setup_time: parseFloat(adminControls.setupTime) || 0,
        breakdown_time: parseFloat(adminControls.breakdownTime) || 0,
        notes: adminControls.notes || '',
        status: bookingData.status || 'confirmed',
        created_by: user?.id || null
      };

      let result;
      let resultBooking;
      
      if (isUpdate) {
        // Update existing booking
        console.log('Updating existing booking:', bookingIdToUse);
        result = await updateBooking(bookingIdToUse, bookingPayload);
        console.log('Booking updated successfully:', result);

        // Handle both response formats: { success: true, booking: {...} } or direct booking data
        resultBooking = result.booking || result;

        // Update local state with the updated booking data
        setBookingData(prev => ({
          ...prev,
          id: resultBooking.id || bookingIdToUse,
          status: resultBooking.status || 'confirmed',
          payment_status: resultBooking.payment_status || prev.payment_status || 'unpaid'
        }));
        setCurrentBookingId(resultBooking.id || bookingIdToUse);
        setIsEditingExistingBooking(true);

        showNotification(
          'Booking Updated Successfully!', 
          `Booking ID ${resultBooking.id || bookingIdToUse} has been updated for ${bookingData.client?.full_name || 'customer'}.`
        );
      } else {
        // Create new booking
        console.log('Creating new booking');
        result = await createBooking(bookingPayload);
        console.log('Booking created successfully:', result);

        // Create booking typically returns direct booking data
        resultBooking = result;

        // Update local state with the new booking data
        setBookingData(prev => ({
          ...prev,
          id: resultBooking.id,
          status: resultBooking.status || 'confirmed',
          payment_status: resultBooking.payment_status || 'unpaid'
        }));
        setCurrentBookingId(resultBooking.id);
        setIsEditingExistingBooking(true);

        showNotification(
          'Booking Created Successfully!', 
          `New booking ID ${resultBooking.id} has been created for ${bookingData.client?.full_name || 'customer'}.`
        );
      }
    } catch (error) {
      console.error('Booking submission error:', error);
      setErrors(prev => ({ ...prev, booking: error.message }));
    } finally {
      setLoading(prev => ({ ...prev, booking: false }));
    }
  };

  const handleSaveDraft = async () => {
    setLoading(prev => ({ ...prev, draft: true }));
    try {
      const draft = await saveDraftBooking({
        venue_id: venueId,
        customer_id: bookingData.client?.id,
        date: bookingData.eventDate,
        time_from: bookingData.startTime,
        time_to: bookingData.endTime,
        guests: bookingData.peopleCount,
        event_type: bookingData.eventType,
        amount: bookingData.totalAmount
      });
      
      console.log('Draft saved successfully:', draft);
      showNotification(
        'Draft Saved Successfully!', 
        'Your booking draft has been saved and can be completed later.'
      );
    } catch (error) {
      setErrors(prev => ({ ...prev, draft: error.message }));
    } finally {
      setLoading(prev => ({ ...prev, draft: false }));
    }
  };

  const handleClearForm = () => {
    setBookingData({
      id: null,
      client: null,
      eventDate: '2025-11-16',
      startTime: '08:00',
      endTime: '10:00',
      duration: 2,
      peopleCount: 80,
      eventType: '',
      totalAmount: 0,
      depositAmount: 0,
      remainingBalance: 0,
      payments: [],
      status: null,
      payment_status: 'unpaid'
    });

    // Reset booking tracking state
    setCurrentBookingId(null);
    setIsEditingExistingBooking(false);
    setErrors({});
  };

  const handleAddPayment = async (paymentData) => {
    try {
      console.log('handleAddPayment called with:', paymentData);

      // Check if this is a payment with booking creation (from PaymentManagement component)
      if (paymentData.booking && paymentData.payment) {
        // This is from the deposit payment flow - booking was already created
        console.log('Payment with booking creation:', paymentData);

        setCurrentBookingId(paymentData.booking.id);
        setIsEditingExistingBooking(true);

        // Update booking data with the created booking information
        setBookingData(prev => ({
          ...prev,
          id: paymentData.booking.id,
          status: paymentData.booking.status || 'confirmed',
          payment_status: paymentData.booking.payment_status || 'deposit_paid',
          payments: [...prev.payments, paymentData.payment]
        }));

        return paymentData.payment;
      } else {
        // This is a regular payment addition - call the API
        console.log('Adding regular payment:', paymentData);
        const newPayment = await addPayment(paymentData);

        // Update local state with the new payment
        setBookingData(prev => ({
          ...prev,
          payments: [...prev.payments, newPayment]
        }));

        return newPayment;
      }
    } catch (error) {
      console.error('Error in handleAddPayment:', error);
      setErrors(prev => ({ ...prev, payment: error.message }));
      throw error;
    }
  };

  return (
    <ProtectedRoute requiredPermission="canManageBookings">
      <div className={`${styles.pageContainer} ${isRTL ? styles.rtl : ''}`}>
        <AdminNav />
        <main className={styles.main}>
          <header className={styles.header}>
            <div className={styles.headerTop}>
              <div>
                <h1 className={styles.title}>{t('booking.title')}</h1>
                <p className={styles.subtitle}>{t('booking.subtitle')}</p>
              </div>
              <div className={styles.userInfo}>
                {t('booking.logged_in_as')} <span className={styles.userName}>{user?.user_metadata?.full_name || 'User'}</span> 
                <span className={styles.userRole}>({userRole || 'staff'})</span>
              </div>
            </div>
          </header>

          <div className={styles.content}>
            <div className={styles.leftColumn}>
              <ClientSelection 
                isActive={true}
                bookingData={bookingData}
                setBookingData={setBookingData}
                clients={clients}
                loading={loading.clients}
                onCreateClient={handleCreateClient}
                error={errors.clients || errors.createClient}
              />
              
              <BookingDetails 
                isActive={true}
                bookingData={bookingData}
                setBookingData={setBookingData}
                loading={loading.pricing}
                error={errors.pricing || errors.availability}
                setupTime={adminControls.setupTime}
                breakdownTime={adminControls.breakdownTime}
                currentBookingId={currentBookingId}
              />
            </div>

            <div className={styles.rightColumn}>
              <PricingSummary 
                bookingData={bookingData}
                setBookingData={setBookingData}
                loading={loading.pricing}
              />
              <PaymentManagement
                bookingData={bookingData}
                setBookingData={setBookingData}
                onAddPayment={handleAddPayment}
                error={errors.payment}
              />
              <AdminControls 
                adminControls={adminControls}
                setAdminControls={setAdminControls}
              />
              <BookingActions
                onSubmit={handleSubmitBooking}
                onSaveDraft={handleSaveDraft}
                onClear={handleClearForm}
                bookingData={bookingData}
                loading={{
                  submit: loading.booking,
                  draft: loading.draft
                }}
                errors={{
                  submit: errors.booking,
                  draft: errors.draft
                }}
              />
            </div>
          </div>
        </main>
      </div>

      {/* Success Notification */}
      <SuccessNotification
        isVisible={notification.isVisible}
        onClose={closeNotification}
        title={notification.title}
        message={notification.message}
      />
    </ProtectedRoute>
  );
} 