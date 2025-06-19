const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');

// GET /api/admin/dashboard/summary?venue_id=86
router.get('/summary', dashboardController.getSummaryMetrics);

// GET /api/admin/dashboard/today-bookings?venue_id=86
router.get('/today-bookings', dashboardController.getTodayBookings);

// GET /api/admin/dashboard/activity?venue_id=86
router.get('/activity', dashboardController.getRecentActivity);

// GET /api/admin/dashboard/alerts?venue_id=86
router.get('/alerts', dashboardController.getAlerts);

module.exports = router; 