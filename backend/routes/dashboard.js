const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const supabase = require('../supabaseClient');

// GET /api/admin/dashboard/summary?venue_id=86
router.get('/summary', dashboardController.getSummaryMetrics);

// GET /api/admin/dashboard/today-bookings?venue_id=86
router.get('/today-bookings', dashboardController.getTodayBookings);

// GET /api/admin/dashboard/activity?venue_id=86
router.get('/activity', dashboardController.getRecentActivity);

// GET /api/admin/dashboard/alerts?venue_id=86
router.get('/alerts', dashboardController.getAlerts);

// POST /api/admin/dashboard/alerts
router.post('/alerts', dashboardController.createAlert);

// PUT /api/admin/dashboard/alerts/:id/done
router.put('/alerts/:id/done', dashboardController.markAlertAsDone);

// GET /api/admin/dashboard/reviews?venue_id=86
router.get('/reviews', async (req, res) => {
  try {
    const { venue_id, status, limit = 50, offset = 0 } = req.query;

    let query = supabase
      .from('reviews')
      .select(`
        *,
        venues:venue_id (
          venue_name,
          venue_title
        )
      `)
      .order('review_date', { ascending: false });

    // Filter by venue if specified
    if (venue_id) {
      query = query.eq('venue_id', venue_id);
    }

    // Add pagination
    query = query.range(parseInt(offset), parseInt(offset) + parseInt(limit) - 1);

    const { data: reviews, error } = await query;

    if (error) {
      console.error('Error fetching admin reviews:', error);
      return res.status(500).json({ error: 'Failed to fetch reviews' });
    }

    // Transform data to match admin interface expectations
    const transformedReviews = reviews.map(review => ({
      id: review.id,
      customerName: review.name,
      rating: review.rating,
      date: review.review_date,
      review: review.content,
      venueName: review.venues?.venue_name || review.venues?.venue_title || 'Unknown Venue',
      venueId: review.venue_id,
      status: 'approved' // Default status since we don't have moderation yet
    }));

    res.json({
      reviews: transformedReviews,
      total: reviews.length
    });

  } catch (error) {
    console.error('Error in admin reviews endpoint:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;