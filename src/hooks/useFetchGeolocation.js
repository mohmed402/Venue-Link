import { useState, useEffect } from "react";

const useFetchGeolocation = (address) => {
  const [location, setLocation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!address) return;

    const fetchGeolocation = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch(
          `http://localhost:5001/api/geolocation?address=${encodeURIComponent(
            address
          )}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch geolocation");
        }

        const data = await response.json();

        // Ensure valid lat/lon
        if (!data || !data.lat || !data.lon) {
          throw new Error("Invalid geolocation data");
        }

        setLocation({ lat: parseFloat(data.lat), lon: parseFloat(data.lon) });
      } catch (err) {
        setError(err.message);
        setLocation(null); // Reset location on error
      } finally {
        setLoading(false);
      }
    };

    fetchGeolocation();
  }, [address]);

  return { location, loading, error };
};

export default useFetchGeolocation;
