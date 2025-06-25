import { useState, useEffect } from 'react';
import { useUnifiedAuth } from '../../contexts/UnifiedAuthContext';
import FavoriteButton from './FavoriteButton';
import { getCustomerFavorites, removeCustomerFavorite } from '../../utils/api';
import styles from '../../styles/customer/CustomerFavorites.module.css';

export default function CustomerFavorites() {
  const { user, getSession } = useUnifiedAuth();
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchFavorites();
    }
  }, [user]);

  const fetchFavorites = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await getSession();      
      if (!session?.access_token) {
        console.error('No access token available');
        return;
      }
      
      const data = await getCustomerFavorites(session.access_token);
      setFavorites(data.favorites || []);
    } catch (error) {
      console.error('Error fetching favorites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (venueId) => {
    try {
      const { data: { session } } = await getSession();
      if (!session?.access_token) {
        console.error('Authentication required');
        return;
      }

      await removeCustomerFavorite(session.access_token, venueId);
      
      // Remove from local state
      setFavorites(favorites.filter(fav => fav.venue_id !== venueId));
    } catch (error) {
      console.error('Error removing favorite:', error);
    }
  };

  if (loading) {
    return (
      <div className={styles.loading}>
        <div className={styles.spinner}></div>
        <p>Loading your favorites...</p>
      </div>
    );
  }

  return (
    <div className={styles.favoritesContainer}>
      <div className={styles.header}>
        <h1>My Favorites</h1>
        <p>Your saved venues for quick access and future bookings</p>
      </div>

      {favorites.length > 0 ? (
        <div className={styles.favoritesList}>
          {favorites.map((favorite) => (
            <div key={favorite.id} className={styles.favoriteCard}>
              <div className={styles.venueImage}>
                {favorite.venues?.main_image ? (
                  <img src={favorite.venues.main_image} alt={favorite.venues.venue_name} />
                ) : (
                  <div className={styles.placeholderImage}>
                    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
                      <polyline points="9,22 9,12 15,12 15,22"/>
                    </svg>
                  </div>
                )}
              </div>

              <div className={styles.venueInfo}>
                <div className={styles.venueHeader}>
                  <h3>{favorite.venues?.venue_name || 'Venue'}</h3>
                  <span className={styles.venueType}>
                    {favorite.venues?.venue_place_type || 'Venue'}
                  </span>
                </div>

                <div className={styles.venueDetails}>
                  <p>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                      <circle cx="12" cy="10" r="3"/>
                    </svg>
                    {favorite.venues?.city}, {favorite.venues?.country}
                  </p>
                  <p>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
                      <circle cx="9" cy="7" r="4"/>
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
                      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
                    </svg>
                    Capacity: {favorite.venues?.venue_capacity || 'N/A'} people
                  </p>
                  {favorite.venues?.venue_price && (
                    <p className={styles.price}>
                      From £{favorite.venues.venue_price}
                    </p>
                  )}
                </div>

                <div className={styles.venueActions}>
                  <FavoriteButton
                    venueId={favorite.venue_id}
                    initialFavorite={true}
                    onToggle={() => handleRemoveFavorite(favorite.venue_id)}
                    className={styles.favoriteButton}
                  />
                  <a
                    href={`/venue?id=${favorite.venue_id}`}
                    className={styles.bookButton}
                  >
                    View & Book
                  </a>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <svg width="80" height="80" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </div>
          <h2>No favorites yet</h2>
          <p>Browse venues and add them to your favorites for quick access.</p>
          <button 
            className={styles.browseButton}
            onClick={() => window.location.href = '/services'}
          >
            Browse Venues
          </button>
        </div>
      )}
    </div>
  );
}
