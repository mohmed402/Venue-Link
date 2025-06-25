const express = require('express');
const router = express.Router();
const employeeBookingController = require('../controllers/employeeBookingController');

// Client Management
router.post('/clients', employeeBookingController.createClient);
router.get('/clients', employeeBookingController.getClients);
router.post('/clients/no-auth', employeeBookingController.createClientWithoutAuth);

// Get bookings for a specific date
router.get('/bookings/date', employeeBookingController.getBookingsByDate);

// Venue Availability & Pricing
router.get('/availability', employeeBookingController.checkAvailability);
router.get('/pricing', employeeBookingController.getVenuePricing);
router.get('/deposit-percentage', employeeBookingController.getVenueDepositPercentage);

// Booking Management
router.get('/bookings', employeeBookingController.getAllBookings);
router.post('/bookings/draft', employeeBookingController.saveDraftBooking);
router.get('/bookings/draft', employeeBookingController.getDraftBookings);
router.delete('/bookings/draft/:id', employeeBookingController.deleteDraftBooking);
router.get('/bookings/:id', employeeBookingController.getBookingById);
router.post('/bookings', employeeBookingController.createBooking);
router.put('/bookings/:id', employeeBookingController.updateBooking);

// Payment Management
router.post('/payments', employeeBookingController.addPayment);
router.get('/payments', employeeBookingController.getPayments);
router.delete('/payments/:id', employeeBookingController.deletePayment);

// Payment status update
router.put('/bookings/:booking_id/payment-status', employeeBookingController.updatePaymentStatus);
router.put('/bookings/payment-status/update-all', employeeBookingController.updatePaymentStatus);

// Price Change Management
router.post('/price-change', employeeBookingController.recordPriceChange);

// Staff management
router.get('/staff', employeeBookingController.getStaff);
router.post('/staff', employeeBookingController.createStaff);
router.post('/staff/with-auth', employeeBookingController.createStaffWithAuth);
router.put('/staff/:id', employeeBookingController.updateStaff);
router.delete('/staff/:id', employeeBookingController.deleteStaff);

// Activity log
router.get('/activity-log', employeeBookingController.getActivityLog);

module.exports = router;