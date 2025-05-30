const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";


export const checkAvailability = async (bookingData) => {
    console.log(bookingData);
    try {
        const response = await fetch(`${BASE_URL}/api/data/bookings/check-availability`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(bookingData)
        });

        console.log(response);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error checking availability:', error);
        throw error;
    }
}; 