import React, { useState, useEffect } from 'react';
import Stars from './Stars';
import Image from 'next/image';
import { formatDate } from '../utils/dateUtils';
import { fetchReviews } from '../services/reviewsService';

export default function ReviewsModal({ isOpen, onClose, venueId }) {
    const [reviews, setReviews] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (isOpen && venueId) {
            const loadReviews = async () => {
                try {
                    setIsLoading(true);
                    setError(null);
                    const data = await fetchReviews(venueId);
                    setReviews(Array.isArray(data) ? data : []);
                } catch (err) {
                    setError('Failed to load reviews. Please try again later.');
                    console.error('Error fetching reviews:', err);
                } finally {
                    setIsLoading(false);
                }
            };

            loadReviews();
        }
    }, [isOpen, venueId]);

    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <div className="modal-header">
                    <h2>Venue Reviews</h2>
                    <button className="close-button" onClick={onClose}>
                        <Image
                            src="/assets/cross.png"
                            alt="Close"
                            width={24}
                            height={24}
                        />
                    </button>
                </div>
                
                <div className="reviews-container">
                    {isLoading ? (
                        <div className="loading-state">
                            <p>Loading reviews...</p>
                        </div>
                    ) : error ? (
                        <div className="error-state">
                            <p>{error}</p>
                            <button 
                                onClick={() => {
                                    setError(null);
                                    setIsLoading(true);
                                    fetchReviews(venueId)
                                        .then(data => setReviews(Array.isArray(data) ? data : []))
                                        .catch(err => setError('Failed to load reviews. Please try again later.'))
                                        .finally(() => setIsLoading(false));
                                }}
                                className="retry-button"
                            >
                                Try Again
                            </button>
                        </div>
                    ) : reviews.length === 0 ? (
                        <div className="no-reviews">
                            <p>No reviews yet for this venue.</p>
                        </div>
                    ) : (
                        reviews.map((review) => (
                            <div key={review.id || Math.random()} className="review-item">
                                <div className="review-header">
                                    <h3>{review.name || 'Anonymous'}</h3>
                                    <Stars rating={Number(review.rating) || 0} />
                                    <span className="review-date">{formatDate(review.review_date)}</span>
                                </div>
                                <p className="review-content">{review.content || 'No review content available'}</p>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
} 