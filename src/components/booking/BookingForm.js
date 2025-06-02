import React from 'react';
import Image from "next/image";
import Button from "@/components/button";
import { useBooking } from '@/hooks/useBooking';
import { DateStep } from './DateStep';
import { TimeStep } from './TimeStep';
import { DurationStep } from './DurationStep';
import { PeopleStep } from './PeopleStep';
import { BookingSummary } from './BookingSummary';
import { format } from 'date-fns';

export default function BookingForm({ venueId }) {
  const {
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
  } = useBooking(venueId);

  const handleDateSelect = (date) => {
    const dayOfWeek = date.toLocaleString('en-US', { weekday: 'long' });
    const dayPricing = venueDetails?.pricing?.find(p => p.day_of_week === dayOfWeek);

    if (!dayPricing?.is_available) {
      setError('Venue is not available on this day');
      return;
    }

    setFormData(prev => ({
      ...prev,
      date: format(date, 'yyyy-MM-dd')
    }));
    setStep('time');
    setAvailability(null);
    setError(null);
  };

  const handleTimeSelect = (time) => {
    setFormData(prev => ({
      ...prev,
      start_time: time,
      duration: null
    }));
    setStep('duration');
    setAvailability(null);
    setError(null);
  };

  const handleDurationSelect = (duration) => {
    setFormData(prev => ({
      ...prev,
      duration,
      ...(duration === 'full' ? {
        start_time: selectedDayPricing.start_time,
        end_time: selectedDayPricing.end_time
      } : {})
    }));
    setAvailability(null);
    if (!formData.people) {
      setStep('people');
    }
  };

  const handlePeopleChange = (value) => {
    const numPeople = parseInt(value);
    if (venueDetails && numPeople > venueDetails.capacity) {
      setError(`This venue has a maximum capacity of ${venueDetails.capacity} people`);
    } else {
      setError(null);
    }
    setFormData(prev => ({ ...prev, people: value }));
    setAvailability(null);
  };

  const renderStep = () => {
    switch (step) {
      case 'date':
        return (
          <DateStep
            selected={formData.date}
            onChange={handleDateSelect}
            venueDetails={venueDetails}
          />
        );
      
      case 'time':
        return (
          <TimeStep
            selectedDayPricing={selectedDayPricing}
            selectedTime={formData.start_time}
            onTimeSelect={handleTimeSelect}
          />
        );
      
      case 'duration':
        return (
          <DurationStep
            durationOptions={getDurationOptions()}
            selectedDuration={formData.duration}
            onDurationSelect={handleDurationSelect}
            minimumHours={selectedDayPricing?.minimum_hours}
          />
        );
      
      case 'people':
        return (
          <PeopleStep
            value={formData.people}
            onChange={handlePeopleChange}
            maxCapacity={venueDetails?.capacity}
          />
        );
    }
  };

  return (
    <section className="main-sec-booking-container">
      <section className="booking-form">
        <div className="venue-profile">
          <Image
            className="profile-image"
            aria-hidden
            src="/assets/cateringAd.png"
            alt="profile picture"
            width={70}
            height={70}
          />
          <div className="profile-info">
            <h3>{venueDetails?.name || 'Loading...'}</h3>
            <p>{venueDetails?.title || 'Loading venue details...'}</p>
          </div>
        </div>
        
        <section className="form-inputs">
          <BookingSummary
            formData={formData}
            selectedDayPricing={selectedDayPricing}
            step={step}
            onStepClick={setStep}
          />
          {renderStep()}
          
          {formData.date && formData.start_time && formData.duration && formData.people && (
            <>
              {calculatedPrice !== null && (
                <div className="price-display" style={{
                  textAlign: 'center',
                  margin: '20px 0',
                  padding: '15px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  fontSize: '1.2rem'
                }}>
                  <span style={{ fontWeight: 'bold' }}>Total Price: </span>
                  <span style={{ color: '#2c5282', fontSize: '1.3rem' }}>£{calculatedPrice}</span>
                </div>
              )}
              <Button
                title={isLoading ? "Checking..." : "Check availability"}
                width={"75%"}
                height={40}
                colour={"main"}
                hide={false}
                click={handleCheckAvailability}
                disabled={isLoading}
              />
            </>
          )}
          
          {error && (
            <p className="error-message" style={{ color: "red", marginTop: "10px" }}>
              {error}
            </p>
          )}
        </section>
      </section>
      
      {(availability !== null || error) && (
        <section className={`booking-form isbooking-available ${availability ? "available" : "unavailable"}`}>
          <p>
            {availability
              ? `${formData.date} at ${formData.start_time} is available`
              : `Sorry, the venue is not available at the selected time.`}
          </p>
          {availability && (
            <Button
              title="Proceed to book"
              width={"75%"}
              height={40}
              colour={"main"}
              hide={false}
              style={{ marginTop: "10px" }}
            />
          )}
        </section>
      )}
    </section>
  );
} 