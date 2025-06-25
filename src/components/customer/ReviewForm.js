import { useState } from 'react';
import styles from '../../styles/customer/ReviewForm.module.css';

export default function ReviewForm({ onSubmit, onCancel, loading = false, venueInfo = null }) {
  const [rating, setRating] = useState(0);
  const [hoveredRating, setHoveredRating] = useState(0);
  const [content, setContent] = useState('');
  const [errors, setErrors] = useState({});

  const validateForm = () => {
    const newErrors = {};

    if (rating === 0) {
      newErrors.rating = 'Please select a rating';
    }

    if (!content.trim()) {
      newErrors.content = 'Please write a review';
    } else if (content.trim().length < 10) {
      newErrors.content = 'Review must be at least 10 characters long';
    } else if (content.trim().length > 1000) {
      newErrors.content = 'Review must be less than 1000 characters';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    onSubmit({
      rating,
      content: content.trim()
    });
  };

  const handleStarClick = (starRating) => {
    setRating(starRating);
    if (errors.rating) {
      setErrors(prev => ({ ...prev, rating: null }));
    }
  };

  const handleContentChange = (e) => {
    setContent(e.target.value);
    if (errors.content) {
      setErrors(prev => ({ ...prev, content: null }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.reviewForm}>
      {venueInfo && (
        <div className={styles.venueInfo}>
          <h3>Review for {venueInfo.venue_name}</h3>
          <p>Booking Date: {new Date(venueInfo.date).toLocaleDateString()}</p>
        </div>
      )}

      {/* Rating Section */}
      <div className={styles.formGroup}>
        <label className={styles.label}>
          Rating <span className={styles.required}>*</span>
        </label>
        <div className={styles.starsContainer}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              className={`${styles.star} ${
                star <= (hoveredRating || rating) ? styles.filled : styles.empty
              }`}
              onClick={() => handleStarClick(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              disabled={loading}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
              </svg>
            </button>
          ))}
        </div>
        {rating > 0 && (
          <p className={styles.ratingText}>
            {rating === 1 && "Poor"}
            {rating === 2 && "Fair"}
            {rating === 3 && "Good"}
            {rating === 4 && "Very Good"}
            {rating === 5 && "Excellent"}
          </p>
        )}
        {errors.rating && <span className={styles.error}>{errors.rating}</span>}
      </div>

      {/* Review Content */}
      <div className={styles.formGroup}>
        <label htmlFor="content" className={styles.label}>
          Your Review <span className={styles.required}>*</span>
        </label>
        <textarea
          id="content"
          value={content}
          onChange={handleContentChange}
          placeholder="Share your experience with this venue. What did you like? What could be improved?"
          className={`${styles.textarea} ${errors.content ? styles.errorInput : ''}`}
          rows={6}
          disabled={loading}
        />
        <div className={styles.charCount}>
          {content.length}/1000 characters
        </div>
        {errors.content && <span className={styles.error}>{errors.content}</span>}
      </div>

      {/* Action Buttons */}
      <div className={styles.actions}>
        <button
          type="button"
          onClick={onCancel}
          className={styles.cancelButton}
          disabled={loading}
        >
          Cancel
        </button>
        <button
          type="submit"
          className={styles.submitButton}
          disabled={loading}
        >
          {loading ? (
            <>
              <div className={styles.spinner}></div>
              Submitting...
            </>
          ) : (
            'Submit Review'
          )}
        </button>
      </div>
    </form>
  );
}
