import { useState, useEffect } from "react";
const BASE_URL =process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

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
          `${BASE_URL}/api/geolocation?address=${encodeURIComponent(
            address
          )}`
        );

        if (!response.ok) {
          throw new Error("Failed to fetch geolocation");
        }

        const data = await response.json();


        if (!data || !data.lat || !data.lon) {
          throw new Error("Invalid geolocation data");
        }

        setLocation({ lat: parseFloat(data.lat), lon: parseFloat(data.lon) });
      } catch (err) {
        setError(err.message);
        setLocation(null);
      } finally {
        setLoading(false);
      }
    };

    fetchGeolocation();
  }, [address]);

  return { location, loading, error };
};

export default useFetchGeolocation;
