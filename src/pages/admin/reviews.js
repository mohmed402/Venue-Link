'use client';

import React, { useState, useEffect } from 'react';
import AdminNav from '@/components/adminNav';
import ProtectedRoute from '@/components/ProtectedRoute';
import styles from '@/styles/adminReviews.module.css';
import { initializeDarkMode } from '../../utils/darkMode';
import { fetchReviews } from '../../services/reviewsService';

const MOCK_REVIEWS = [
  {
    id: 1,
    customerName: 'Sarah Johnson',
    rating: 5,
    date: '2024-03-15',
    eventType: 'Wedding Reception',
    review: 'Absolutely amazing venue! The staff was incredibly helpful and professional. The space was perfect for our wedding reception and all our guests were impressed.',
    status: 'pending',
    images: ['/assets/review1.jpg', '/assets/review2.jpg']
  },
  {
    id: 2,
    customerName: 'Michael Chen',
    rating: 4,
    date: '2024-03-14',
    eventType: 'Corporate Event',
    review: 'Great venue for our company conference. Good facilities and technical setup. Only minor issue was parking availability.',
    status: 'approved',
    images: []
  },
  {
    id: 3,
    customerName: 'Emma Wilson',
    rating: 5,
    date: '2024-03-13',
    eventType: 'Birthday Party',
    review: 'Perfect venue for my 30th birthday celebration! The lighting and sound system were excellent, and the staff helped with all the decorations.',
    status: 'pending',
    images: ['/assets/review3.jpg']
  }
];

export default function AdminReviews() {
  const venueId = 86; // Using the same venue ID as other admin pages
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all'); // all, pending, approved, rejected
  const [sortBy, setSortBy] = useState('date'); // date, rating

  // Initialize dark mode on component mount
  useEffect(() => {
    initializeDarkMode();
  }, []);

  // Fetch reviews from database
  useEffect(() => {
    const loadReviews = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await fetchReviews(venueId);

        // Transform the data to match the expected format
        const transformedReviews = data.map(review => ({
          id: review.id,
          customerName: review.name || 'Anonymous',
          rating: review.rating,
          date: review.review_date,
          review: review.content,
          status: 'approved', // Default status since we don't have moderation yet
          images: [] // No images support yet
        }));

        setReviews(transformedReviews);
      } catch (err) {
        console.error('Error loading reviews:', err);
        setError('Failed to load reviews. Please try again.');
        // Fallback to mock data if there's an error
        setReviews(MOCK_REVIEWS);
      } finally {
        setLoading(false);
      }
    };

    loadReviews();
  }, [venueId]);

  const handleStatusChange = (reviewId, newStatus) => {
    setReviews(reviews.map(review => 
      review.id === reviewId ? { ...review, status: newStatus } : review
    ));
  };

  const filteredReviews = reviews.filter(review => 
    filter === 'all' ? true : review.status === filter
  ).sort((a, b) => {
    if (sortBy === 'date') {
      return new Date(b.date) - new Date(a.date);
    }
    return b.rating - a.rating;
  });

  return (
    <ProtectedRoute requiredPermission="canAccessReview">
      <div className={styles.pageContainer}>
        <AdminNav />
      <main className={styles.main}>
        <header className={styles.header}>
          <div className={styles.headerTop}>
            <div>
              <h1 className={styles.title}>Customer Reviews</h1>
              <p className={styles.subtitle}>Manage and moderate venue reviews from customers</p>
            </div>
            <div className={styles.controls}>
              <select 
                className={styles.select}
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All Reviews</option>
                <option value="pending">Pending</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
              </select>
              <select
                className={styles.select}
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="date">Sort by Date</option>
                <option value="rating">Sort by Rating</option>
              </select>
            </div>
          </div>
        </header>

        {loading ? (
          <div className={styles.loadingState}>
            <div className={styles.spinner}></div>
            <p>Loading reviews...</p>
          </div>
        ) : error ? (
          <div className={styles.errorState}>
            <p>{error}</p>
            <button
              onClick={() => window.location.reload()}
              className={styles.retryButton}
            >
              Retry
            </button>
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className={styles.emptyState}>
            <p>No reviews found for this venue.</p>
            <p>Reviews will appear here once customers submit them.</p>
          </div>
        ) : (
          <div className={styles.reviewsGrid}>
            {filteredReviews.map(review => (
            <div key={review.id} className={styles.reviewCard}>
              <div className={styles.reviewHeader}>
                <div className={styles.customerInfo}>
                  <h3 className={styles.customerName}>{review.customerName}</h3>
                  <span className={styles.eventType}>{review.eventType}</span>
                </div>
                <div className={styles.rating}>
                  {'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}
                </div>
              </div>

              <div className={styles.reviewContent}>
                <p className={styles.reviewText}>{review.review}</p>
                {review.images.length > 0 && (
                  <div className={styles.imageGrid}>
                    {review.images.map((image, index) => (
                      <div key={index} className={styles.imageContainer}>
                        <img src={image} alt={`Review image ${index + 1}`} />
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className={styles.reviewFooter}>
                <div className={styles.reviewDate}>
                  {new Date(review.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </div>
                <div className={styles.actions}>
                  {review.status === 'pending' && (
                    <>
                      <button 
                        className={`${styles.actionButton} ${styles.approveButton}`}
                        onClick={() => handleStatusChange(review.id, 'approved')}
                      >
                        Approve
                      </button>
                      <button 
                        className={`${styles.actionButton} ${styles.rejectButton}`}
                        onClick={() => handleStatusChange(review.id, 'rejected')}
                      >
                        Reject
                      </button>
                    </>
                  )}
                  {review.status === 'approved' && (
                    <span className={styles.statusBadge}>Approved</span>
                  )}
                  {review.status === 'rejected' && (
                    <span className={`${styles.statusBadge} ${styles.rejected}`}>Rejected</span>
                  )}
                </div>
              </div>
            </div>
          ))}
          </div>
        )}
      </main>
    </div>
    </ProtectedRoute>
  );
} 