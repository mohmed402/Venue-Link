'use client';
import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminNav from '@/components/adminNav';
import ProtectedRoute from '@/components/ProtectedRoute';
import SuccessNotification from '@/components/SuccessNotification';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
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
  updateBooking,
  getBookingById,
  deleteDraftBooking
} from '@/utils/api';
import { initializeDarkMode } from '../../utils/darkMode';

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
import { useBooking } from '@/hooks/useBooking';

export default function EmployeeBooking() {
  const venueId = 86;
  const router = useRouter();
  const { user, userRole } = useUnifiedAuth();
  const { t, isRTL } = useLanguage();
  
  const [bookingData, setBookingData] = useState({
    id: null, // Track booking ID
    client: null,
    eventDate: '2025-11-20',
    startTime: '',
    endTime: '',
    duration: '', // Empty by default to show "Select duration"
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

  // Refresh trigger for BookingDetails component
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const {
    selectedDate,
    selectedTimeSlot,
    selectedEndTime,
    clientData,
    bookingDetails,
    pricingDetails,
    paymentDetails,
    availableSlots,
    bookedSlots,
    isLoading,
    error,
    setSelectedDate,
    setSelectedTimeSlot,
    setSelectedEndTime,
    setClientData,
    setBookingDetails,
    updatePricingDetails,
    setPaymentDetails,
    fetchAvailableSlots,
    submitBooking,
    resetBooking
  } = useBooking();

  // Initialize dark mode on component mount
  useEffect(() => {
    initializeDarkMode();
  }, []);

  // Load clients on component mount
  useEffect(() => {
    loadClients();
  }, []);

  // Helper function to calculate duration from start and end times
  const calculateDuration = (startTime, endTime) => {
    if (!startTime || !endTime) return '';

    const start = new Date(`2000-01-01T${startTime}`);
    const end = new Date(`2000-01-01T${endTime}`);
    const diffMs = end - start;
    const diffHours = diffMs / (1000 * 60 * 60);

    return diffHours.toString();
  };

  // Fetch complete booking data from database
  const fetchBookingData = async (bookingId) => {
    try {
      const bookingData = await getBookingById(bookingId);
      return bookingData;
    } catch (error) {
      console.error('Error fetching booking data:', error);
      throw error;
    }
  };

  // Handle URL parameters for booking modification
  useEffect(() => {
    if (router.isReady && router.query.modify === 'true' && clients.length > 0) {
      const { bookingId } = router.query;

      if (bookingId) {
        // Fetch complete booking data from database
        fetchBookingData(bookingId)
          .then(booking => {
            // Find the full client object from the clients array
            const fullClient = clients.find(client => client.id === booking.customer_id);

            // Calculate duration from start and end times
            const calculatedDuration = calculateDuration(booking.time_from, booking.time_to);

            console.log('Modifying booking:', {
              bookingId,
              booking,
              fullClient,
              calculatedDuration
            });

            // Pre-fill form with complete booking data
            setBookingData(prev => ({
              ...prev,
              id: bookingId,
              client: fullClient,
              eventDate: booking.date,
              startTime: booking.time_from,
              endTime: booking.time_to,
              duration: calculatedDuration,
              peopleCount: booking.people_count || 80,
              eventType: booking.event_type || '',
              totalAmount: booking.amount || 0,
              depositAmount: booking.deposit_amount || 0,
              status: booking.status,
              payment_status: booking.payment_status || 'unpaid'
            }));

            // Pre-fill admin controls with booking data
            setAdminControls(prev => ({
              ...prev,
              setupTime: booking.setup_time || 0,
              breakdownTime: booking.breakdown_time || 0,
              priority: booking.priority || 'standard',
              revenueCategory: booking.revenue_category || '',
              riskLevel: booking.risk_level || 'low',
              cancellationPolicy: booking.cancellation_policy || 'standard',
              notes: booking.notes || '',
              overrides: {
                availability: booking.override_availability || false,
                deposit: booking.override_deposit || false,
                capacity: booking.override_capacity || false,
                customPricing: booking.override_custom_pricing || false
              },
              pricingReason: booking.pricing_reason || '',
              managedBy: booking.managed_by || null
            }));

            setCurrentBookingId(bookingId);
            setIsEditingExistingBooking(true);

            showNotification(
              'Booking Loaded',
              `Booking #${bookingId} has been loaded for modification.`
            );
          })
          .catch(error => {
            console.error('Failed to load booking data:', error);
            showNotification(
              'Error',
              'Failed to load booking data. Please try again.'
            );
          });
      }
    }
  }, [router.isReady, router.query, clients]);

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
        bookingIdToExclude,
        adminControls.overrides.availability
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
    // Skip availability check if override is enabled
    if (!adminControls.overrides.availability) {
      const isAvailable = await checkVenueAvailability();
      if (!isAvailable) return;
    }

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
        status: adminControls.status || bookingData.status || 'confirmed',
        created_by: user?.id || null,
        // Admin control fields
        priority: adminControls.priority || 'standard',
        revenue_category: adminControls.revenueCategory || '',
        risk_level: adminControls.riskLevel || 'low',
        cancellation_policy: adminControls.cancellationPolicy || 'standard',
        override_availability: adminControls.overrides.availability || false,
        override_deposit: adminControls.overrides.deposit || false,
        override_capacity: adminControls.overrides.capacity || false,
        override_custom_pricing: adminControls.overrides.customPricing || false,
        pricing_reason: adminControls.pricingReason || '',
        managed_by: user?.id || null // Set current user as manager
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
          status: resultBooking.status || adminControls.status || 'confirmed',
          payment_status: resultBooking.payment_status || prev.payment_status || 'unpaid'
        }));
        setCurrentBookingId(resultBooking.id || bookingIdToUse);
        setIsEditingExistingBooking(true);

        const priorityText = adminControls.priority === 'vip' ? ' (VIP)' :
                           adminControls.priority === 'urgent' ? ' (URGENT)' : '';

        showNotification(
          'Booking Updated Successfully!',
          `Booking ID ${resultBooking.id || bookingIdToUse}${priorityText} has been updated for ${bookingData.client?.full_name || 'customer'}.`
        );

        // Trigger refresh of bookings list
        setRefreshTrigger(prev => prev + 1);
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
          status: resultBooking.status || adminControls.status || 'confirmed',
          payment_status: resultBooking.payment_status || 'unpaid'
        }));
        setCurrentBookingId(resultBooking.id);
        setIsEditingExistingBooking(true);

        const priorityText = adminControls.priority === 'vip' ? ' (VIP)' :
                           adminControls.priority === 'urgent' ? ' (URGENT)' : '';

        showNotification(
          'Booking Created Successfully!',
          `New booking ID ${resultBooking.id}${priorityText} has been created for ${bookingData.client?.full_name || 'customer'}.`
        );

        // Trigger refresh of bookings list
        setRefreshTrigger(prev => prev + 1);

        // If this booking was created from a draft, delete the draft
        console.log('Main booking: Checking for draft ID to delete:', bookingData.draftId);
        console.log('Main booking: Full booking data:', bookingData);
        if (bookingData.draftId && bookingData.draftId !== null && bookingData.draftId !== undefined) {
          try {
            console.log('Main booking: Deleting draft booking with ID:', bookingData.draftId);
            await deleteDraftBooking(bookingData.draftId);
            console.log('Main booking: Draft booking deleted after conversion to real booking.');

            // Clear the draftId from booking data
            setBookingData(prev => ({
              ...prev,
              draftId: null
            }));
          } catch (err) {
            console.error('Main booking: Failed to delete draft booking after conversion:', err);
            // Don't fail the whole operation if draft deletion fails
          }
        } else {
          console.log('Main booking: No valid draft ID found, skipping draft deletion.');
        }
      }

      // For both create and update operations, if there was a draft, delete it
      // Check again in case it wasn't deleted above (e.g., booking without payment)
      if (!isUpdate && bookingData.draftId) {
        try {
          console.log('Secondary check: Deleting draft booking with ID:', bookingData.draftId);
          await deleteDraftBooking(bookingData.draftId);
          console.log('Secondary check: Draft booking deleted after booking completion.');

          // Clear the draftId from booking data
          setBookingData(prev => ({
            ...prev,
            draftId: null
          }));
        } catch (err) {
          console.error('Secondary check: Failed to delete draft booking after completion:', err);
          // Don't fail the whole operation if draft deletion fails
        }
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
        amount: bookingData.totalAmount,
        deposit_amount: bookingData.depositAmount,
        notes: adminControls.notes || '',
        setup_time: parseFloat(adminControls.setupTime) || 0,
        breakdown_time: parseFloat(adminControls.breakdownTime) || 0,
        status: 'draft',
        override_availability: adminControls.overrides?.availability || false,
        staff_id: user?.id || null,
        deposit_percentage: bookingData.depositAmount && bookingData.totalAmount 
          ? Math.round((bookingData.depositAmount / bookingData.totalAmount) * 100) 
          : 0,
        system_fee_percentage: 1
      });
      
      console.log('Draft saved successfully:', draft);
      showNotification(
        'Draft Saved Successfully!',
        'Your booking draft has been saved and can be completed later.'
      );

      // Trigger refresh of bookings and drafts list
      setRefreshTrigger(prev => prev + 1);
    } catch (error) {
      setErrors(prev => ({ ...prev, draft: error.message }));
    } finally {
      setLoading(prev => ({ ...prev, draft: false }));
    }
  };

  const handleClearForm = () => {
    // Reset booking data to default values
    setBookingData({
      id: null,
      client: null,
      eventDate: new Date().toISOString().split('T')[0], // Today's date
      startTime: '',
      endTime: '',
      duration: '', // Empty to show "Select duration"
      peopleCount: 80,
      eventType: '',
      totalAmount: 0,
      depositAmount: 0,
      remainingBalance: 0,
      payments: [],
      status: null,
      payment_status: 'unpaid',
      draftId: null // Clear draft ID when clearing form
    });

    // Reset admin controls to default values
    setAdminControls({
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
      managedBy: null
    });

    // Reset booking tracking state
    setCurrentBookingId(null);
    setIsEditingExistingBooking(false);
    setErrors({});

    // Clear URL parameters to remove any booking/client IDs
    router.replace('/admin/employee-booking', undefined, { shallow: true });

    // Show confirmation notification
    setNotification({
      isVisible: true,
      title: 'New Booking Started',
      message: 'Form cleared and ready for a new booking'
    });

    // Hide notification after 3 seconds
    setTimeout(() => {
      setNotification(prev => ({ ...prev, isVisible: false }));
    }, 3000);
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

        // Trigger refresh of bookings list when payment creates a booking
        setRefreshTrigger(prev => prev + 1);

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
              <div className={styles.headerLeft}>
                <h1 className={styles.title}>{t('booking.title')}</h1>
                <p className={styles.subtitle}>{t('booking.subtitle')}</p>
              </div>
              <div className={styles.headerActions}>
                <button
                  className={styles.newBookingButton}
                  onClick={handleClearForm}
                  title="Start a new booking"
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14M5 12h14"/>
                  </svg>
                  New Booking
                </button>
                <div className={styles.userInfo}>
                  {t('booking.logged_in_as')} <span className={styles.userName}>{user?.user_metadata?.full_name || 'User'}</span>
                  <span className={styles.userRole}>({userRole || 'staff'})</span>
                </div>
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
                adminControls={adminControls}
                refreshTrigger={refreshTrigger}
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
                bookingId={currentBookingId}
                userId={user?.id}
                venueId={86} // Pass venue_id for document uploads
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