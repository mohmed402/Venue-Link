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