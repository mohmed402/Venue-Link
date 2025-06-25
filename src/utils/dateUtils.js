/**
 * Formats a date string into a human-readable format
 * @param {string} dateString - ISO date string (YYYY-MM-DD)
 * @returns {string} Formatted date string
 */
export const formatDate = (dateString) => {
    try {
        if (!dateString) return 'Date not available';
        
        // Parse the ISO date string (YYYY-MM-DD)
        const date = new Date(dateString);
        
        if (isNaN(date.getTime())) return dateString; // Return original if parsing fails
        
        const now = new Date();
        const diffTime = Math.abs(now - date);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        // Check if it's today
        if (date.toDateString() === now.toDateString()) return 'Today';
        
        // Check if it's yesterday
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
        
        // Less than a week
        if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
        
        // Less than a month
        if (diffDays < 30) {
            const weeks = Math.floor(diffDays / 7);
            return `${weeks} ${weeks === 1 ? 'week' : 'weeks'} ago`;
        }
        
        // Less than a year
        if (diffDays < 365) {
            const months = Math.floor(diffDays / 30);
            return `${months} ${months === 1 ? 'month' : 'months'} ago`;
        }
        
        // More than a year, return formatted date
        return date.toLocaleDateString('en-GB', { 
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    } catch (error) {
        console.error('Error formatting date:', error);
        return dateString; // Return original string if any error occurs
    }
};

/**
 * Formats a timestamp into a relative time format (e.g., "2 hours ago", "5 minutes ago")
 * @param {string} timestamp - ISO timestamp string
 * @returns {string} Formatted relative time string
 */
export const formatTimeAgo = (timestamp) => {
    try {
        if (!timestamp) return 'Unknown time';

        const date = new Date(timestamp);

        if (isNaN(date.getTime())) return timestamp; // Return original if parsing fails

        const now = new Date();
        const diffMs = now - date;

        // Convert to different time units
        const diffSeconds = Math.floor(diffMs / 1000);
        const diffMinutes = Math.floor(diffMs / (1000 * 60));
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        const diffWeeks = Math.floor(diffDays / 7);
        const diffMonths = Math.floor(diffDays / 30);
        const diffYears = Math.floor(diffDays / 365);

        // Handle future dates
        if (diffMs < 0) return 'In the future';

        // Less than a minute
        if (diffSeconds < 60) return 'Just now';

        // Less than an hour
        if (diffMinutes < 60) return `${diffMinutes} ${diffMinutes === 1 ? 'minute' : 'minutes'} ago`;

        // Less than a day
        if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;

        // Less than a week
        if (diffDays < 7) return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;

        // Less than a month
        if (diffWeeks < 4) return `${diffWeeks} ${diffWeeks === 1 ? 'week' : 'weeks'} ago`;

        // Less than a year
        if (diffMonths < 12) return `${diffMonths} ${diffMonths === 1 ? 'month' : 'months'} ago`;

        // More than a year
        return `${diffYears} ${diffYears === 1 ? 'year' : 'years'} ago`;

    } catch (error) {
        console.error('Error formatting time ago:', error);
        return timestamp; // Return original string if any error occurs
    }
};