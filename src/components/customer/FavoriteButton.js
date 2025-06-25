import { useState, useEffect } from 'react';
import { useUnifiedAuth } from '../../contexts/UnifiedAuthContext';
import { checkCustomerFavorite, addCustomerFavorite, removeCustomerFavorite } from '../../utils/api';
import styles from '../../styles/customer/FavoriteButton.module.css';

export default function FavoriteButton({ 
  venueId, 
  size = 'medium', 
  showText = true,
  className = '',
  onToggle = null 
}) {
  const { user, getSession } = useUnifiedAuth();
  const [isFavorite, setIsFavorite] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (user && venueId) {
      checkFavoriteStatus();
    }
  }, [user, venueId]);

    const checkFavoriteStatus = async () => {
    try {
      const { data: { session } } = await getSession();
      if (!session?.access_token) {
        return; // Not authenticated
      }
      
      const data = await checkCustomerFavorite(session.access_token, venueId);
      setIsFavorite(data.isFavorite);
    } catch (error) {
      console.error('Error checking favorite status:', error);
    }
  };

  const toggleFavorite = async () => {
    if (!user) {
      setError('Please log in to add favorites');
      return;
    }

    if (loading) return;

    setLoading(true);
    setError('');

    try {
      const { data: { session } } = await getSession();      
      if (!session?.access_token) {
        setError('Authentication required');
        return;
      }

      let data;
      if (isFavorite) {
        await removeCustomerFavorite(session.access_token, venueId);
        data = { isFavorite: false };
      } else {
        await addCustomerFavorite(session.access_token, venueId);  
        data = { isFavorite: true };
      }

      setIsFavorite(data.isFavorite);
      if (onToggle) {
        onToggle(data.isFavorite);
      }
    } catch (error) {
      console.error('Error toggling favorite:', error);
      setError(error.message || 'Failed to update favorites');
    } finally {
      setLoading(false);
    }
  };

  const sizeClass = {
    small: styles.small,
    medium: styles.medium,
    large: styles.large
  }[size] || styles.medium;

  return (
    <div className={`${styles.favoriteContainer} ${className}`}>
      <button
        onClick={toggleFavorite}
        disabled={loading}
        className={`${styles.favoriteButton} ${sizeClass} ${isFavorite ? styles.favorited : ''}`}
        title={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
      >
        <svg 
          width="24" 
          height="24" 
          viewBox="0 0 24 24" 
          fill={isFavorite ? 'currentColor' : 'none'} 
          stroke="currentColor" 
          strokeWidth="2"
          className={styles.heartIcon}
        >
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
        </svg>
        
        {showText && (
          <span className={styles.buttonText}>
            {loading ? 'Loading...' : isFavorite ? 'Favorited' : 'Add to Favorites'}
          </span>
        )}
      </button>

      {error && (
        <div className={styles.errorTooltip}>
          {error}
        </div>
      )}
    </div>
  );
}
