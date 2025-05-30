const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";


export const fetchReviews = async (venueId) => {
    try {
        const response = await fetch(`${BASE_URL}/api/data/reviews/${venueId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const reviews = await response.json();
        return Array.isArray(reviews) ? reviews : [];
    } catch (error) {
        console.error('Error fetching reviews:', error);
        throw error;
    }
}; 