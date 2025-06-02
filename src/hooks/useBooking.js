import { useState, useEffect } from 'react';
import { checkAvailability } from "@/services/bookingService";
import { getTimeInMinutes, calculateEndTime } from '@/utils/booking/timeUtils';
import getToReview  from "@/context/getToReview";

const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

export const useBooking = (venueId) => {
  const [formData, setFormData] = useState({
    venue_id: venueId,
    date: null,
    start_time: "",
    duration: null,
    people: "",
  });
  const [venueDetails, setVenueDetails] = useState(null);
  const [selectedDayPricing, setSelectedDayPricing] = useState(null);
  const [step, setStep] = useState('date');
  const [availability, setAvailability] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [calculatedPrice, setCalculatedPrice] = useState(null);

  // Fetch venue details including pricing and capacity
  useEffect(() => {
    const fetchVenueDetails = async () => {
      try {
        const [pricingResponse, venueData] = await Promise.all([
          fetch(`${BASE_URL}/api/data/venue-pricing/${venueId}`),
          getToReview("venueById", venueId)
        ]);
  
        if (!pricingResponse.ok) {
          throw new Error('Failed to fetch venue pricing');
        }
  
        const pricingData = await pricingResponse.json();
  
        setVenueDetails({
          pricing: pricingData,
          capacity: venueData.venue_capacity,
          name: venueData.venue_name,
          title: venueData.venue_title,
        });
      } catch (error) {
        console.error('Error fetching venue details:', error);
        setError('Unable to load venue details');
      }
    };
  
    if (venueId) {
      fetchVenueDetails();
    }
  }, [venueId]);

  // Update selected day pricing when date changes
  useEffect(() => {
    if (formData.date && venueDetails?.pricing) {
      const dayOfWeek = new Date(formData.date).toLocaleString('en-US', { weekday: 'long' });
      const dayPricing = venueDetails.pricing.find(p => p.day_of_week === dayOfWeek);
      setSelectedDayPricing(dayPricing);
      setFormData(prev => ({ ...prev, duration: null }));
    }
  }, [formData.date, venueDetails]);

  // Handle full day time selection
  useEffect(() => {
    if (step === 'time' && selectedDayPricing?.pricing_type === 'full_day') {
      setFormData(prev => ({
        ...prev,
        start_time: selectedDayPricing.start_time
      }));
      setStep('duration');
    }
  }, [step, selectedDayPricing]);

  // Calculate price when duration or pricing changes
  useEffect(() => {
    if (!selectedDayPricing || !formData.duration) {
      setCalculatedPrice(null);
      return;
    }

    let price;
    if (formData.duration === 'full' || selectedDayPricing.pricing_type === 'full_day') {
      price = selectedDayPricing.full_day_price;
    } else {
      const hours = formData.duration / 60;
      price = hours * selectedDayPricing.hourly_price;
    }

    setCalculatedPrice(price);
  }, [formData.duration, selectedDayPricing]);

  const handleCheckAvailability = async () => {
    const { date, start_time, duration, people } = formData;
    if (!date || !start_time || !duration || !people) {
      setError("Please fill in all fields");
      return;
    }

    if (parseInt(people) <= 0) {
      setError("Number of people must be greater than 0");
      return;
    }

    let time_from, time_to;
    if (duration === 'full' || selectedDayPricing?.pricing_type === 'full_day') {
      time_from = selectedDayPricing.start_time;
      time_to = selectedDayPricing.end_time;
    } else {
      time_from = start_time;
      time_to = calculateEndTime(start_time, parseInt(duration));
    }

    try {
      setIsLoading(true);
      setError(null);

      const response = await checkAvailability({
        venue_id: venueId,
        date,
        time_from,
        time_to,
        people: parseInt(people),
      });

      setAvailability(response.available);
    } catch (err) {
      setError("Failed to check availability. Please try again.");
      console.error("Error checking availability:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const getDurationOptions = () => {
    if (!selectedDayPricing || !formData.start_time) return [];

    const hourlyOptions = [
      { value: 90, label: '1h 30m' },
      { value: 120, label: '2h' },
      { value: 180, label: '3h' },
      { value: 240, label: '4h' },
      { value: 300, label: '5h' },
      { value: 360, label: '6h' },
      { value: 420, label: '7h' }
    ];

    if (selectedDayPricing.pricing_type === 'full_day') {
      return [{ value: 'full', label: 'Full Day' }];
    }

    const startTimeInMinutes = getTimeInMinutes(formData.start_time);
    const endTimeInMinutes = getTimeInMinutes(selectedDayPricing.end_time);
    const maxPossibleDuration = endTimeInMinutes - startTimeInMinutes;

    const filteredHourlyOptions = hourlyOptions.filter(option => 
      option.value >= (selectedDayPricing.minimum_hours * 60) &&
      option.value <= maxPossibleDuration
    );

    if (selectedDayPricing.pricing_type === 'both') {
      const isStartingAtOpeningTime = formData.start_time === selectedDayPricing.start_time;
      return [
        ...filteredHourlyOptions,
        ...(isStartingAtOpeningTime ? [{ value: 'full', label: 'Full Day' }] : [])
      ];
    }

    return filteredHourlyOptions;
  };

  return {
    formData,
    setFormData,
    venueDetails,
    selectedDayPricing,
    step,
    setStep,
    availability,
    setAvailability,
    isLoading,
    error,
    setError,
    calculatedPrice,
    handleCheckAvailability,
    getDurationOptions
  };
};