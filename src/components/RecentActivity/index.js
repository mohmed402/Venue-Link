import React, { useState, useEffect } from 'react';
import { getActivityLog } from '@/utils/api';
import { formatTimeAgo } from '@/utils/timeUtils';
import styles from './RecentActivity.module.css';

const RecentActivity = ({ venueId = 86, limit = 10 }) => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    loadActivityLog();
  }, [venueId, limit]);

  const loadActivityLog = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getActivityLog(venueId, limit);
      setActivities(data);
    } catch (error) {
      console.error('Error loading activity log:', error);
      setError('Failed to load recent activity. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getActivityIcon = (action) => {
    if (action.includes('Booking created')) {
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 3h-1V1h-2v2H8V1H6v2H5c-1.11 0-1.99.9-1.99 2L3 19c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V8h14v11zM7 10h5v5H7z" fill="currentColor"/>
        </svg>
      );
    }
    if (action.includes('Payment')) {
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M11.8 10.9c-2.27-.59-3-1.2-3-2.15 0-1.09 1.01-1.85 2.7-1.85 1.78 0 2.44.85 2.5 2.1h2.21c-.07-1.72-1.12-3.3-3.21-3.81V3h-3v2.16c-1.94.42-3.5 1.68-3.5 3.61 0 2.31 1.91 3.46 4.7 4.13 2.5.6 3 1.48 3 2.41 0 .69-.49 1.79-2.7 1.79-2.06 0-2.87-.92-2.98-2.1h-2.2c.12 2.19 1.76 3.42 3.68 3.83V21h3v-2.15c1.95-.37 3.5-1.5 3.5-3.55 0-2.84-2.43-3.81-4.7-4.4z" fill="currentColor"/>
        </svg>
      );
    }
    if (action.includes('updated')) {
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/>
        </svg>
      );
    }
    if (action.includes('cancelled') || action.includes('deleted')) {
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
        </svg>
      );
    }
    if (action.includes('confirmed')) {
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z" fill="currentColor"/>
        </svg>
      );
    }
    if (action.includes('Staff')) {
      return (
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" fill="currentColor"/>
        </svg>
      );
    }
    // Default icon for general actions
    return (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M14 2H6c-1.1 0-1.99.9-1.99 2L4 20c0 1.1.89 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm2 16H8v-2h8v2zm0-4H8v-2h8v2zm-3-5V3.5L18.5 9H13z" fill="currentColor"/>
      </svg>
    );
  };

  const getActivityColor = (action) => {
    if (action.includes('Booking created')) return '#800200'; // Main theme color
    if (action.includes('Payment')) return '#000000'; // Black for payments
    if (action.includes('updated')) return '#9ca3af'; // Light grey for updates/edits
    if (action.includes('cancelled') || action.includes('deleted')) return '#dc2626'; // Red for negative actions
    if (action.includes('confirmed')) return '#800200'; // Main theme color for positive actions
    if (action.includes('Staff')) return '#800200'; // Main theme color
    return '#6b7280'; // Neutral gray for general actions
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h3>Recent Activity</h3>
        </div>
        <div className={styles.loading}>
          <div className={styles.spinner}></div>
          <p>Loading recent activity...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.header}>
          <h3>Recent Activity</h3>
        </div>
        <div className={styles.error}>
          <p>{error}</p>
          <button onClick={loadActivityLog} className={styles.retryButton}>
            Try Again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h3>Recent Activity</h3>
        <button onClick={loadActivityLog} className={styles.refreshButton}>
          🔄
        </button>
      </div>
      
      {activities.length === 0 ? (
        <div className={styles.empty}>
          <p>No recent activity found.</p>
        </div>
      ) : (
        <div className={styles.activityList}>
          {activities.map((activity) => (
            <div key={activity.id} className={styles.activityItem}>
              <div 
                className={styles.activityIcon}
                style={{ backgroundColor: getActivityColor(activity.action) }}
              >
                {getActivityIcon(activity.action)}
              </div>
              
              <div className={styles.activityContent}>
                <div className={styles.activityAction}>
                  {activity.action}
                </div>
                
                <div className={styles.activityMeta}>
                  {activity.staff?.full_name && (
                    <span className={styles.activityUser}>
                      by {activity.staff.full_name}
                    </span>
                  )}
                  <span className={styles.activityTime}>
                    {formatTimeAgo(activity.timestamp)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentActivity;
