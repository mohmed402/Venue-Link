import { useState, useEffect } from 'react';

export default function VenuePrices({ venueId }) {
  const [prices, setPrices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchPrices = async () => {
      try {
        const response = await fetch(`http://localhost:5001/api/data/venue-pricing/${venueId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch pricing data');
        }
        const data = await response.json();
        
        // Transform the data to match the display format
        const formattedPrices = data.map(price => ({
          day: price.day_of_week,
          time: `${price.start_time}-${price.end_time}`,
          price: formatPrice(price)
        }));
        
        setPrices(formattedPrices);
        setError(null);
      } catch (error) {
        console.error('Error fetching prices:', error);
        setError('Unable to load pricing information');
      } finally {
        setLoading(false);
      }
    };

    if (venueId) {
      fetchPrices();
    }
  }, [venueId]);

  const formatPrice = (price) => {
    if (!price.is_available) return 'Not available';
    
    let priceText = 'from ';
    if (price.pricing_type === 'hourly' || price.pricing_type === 'both') {
      priceText += `£${price.hourly_price}/hour`;
      if (price.minimum_hours) {
        priceText += ` (min ${price.minimum_hours}h)`;
      }
    }
    if (price.pricing_type === 'full_day') {
      priceText += `£${price.full_day_price} per day`;
    }
    if (price.pricing_type === 'both') {
      priceText += ` or £${price.full_day_price} full day`;
    }
    
    return priceText;
  };

  if (loading) return <div>Loading prices...</div>;
  if (error) return <div>{error}</div>;
  if (!prices.length) return null;

  return (
    <section>
      <hr className="sec-line" />
      <h3>Prices</h3>
      <table className="price-table">
        <thead>
          <tr>
            <th>Day</th>
            <th>Time</th>
            <th>Price Starts from</th>
          </tr>
        </thead>
        <tbody>
          {prices.map((item, index) => (
            <tr key={index}>
              <td>{item.day}</td>
              <td>{item.time}</td>
              <td>{item.price}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </section>
  );
}
