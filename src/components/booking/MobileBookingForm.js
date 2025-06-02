import React, { useEffect } from 'react';
import { useBooking } from '@/hooks/useBooking';
import { format } from 'date-fns';
import Button from "@/components/button";
import { DateStep } from './DateStep';
import { TimeStep } from './TimeStep';
import { DurationStep } from './DurationStep';
import { PeopleStep } from './PeopleStep';

export const MobileBookingForm = ({ 
  venueId, 
  isOpen, 
  onClose,
  onPriceCalculated,
  onBookingDetailsChange
}) => {
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

  // Update parent component when price changes
  useEffect(() => {
    onPriceCalculated?.(calculatedPrice);
  }, [calculatedPrice, onPriceCalculated]);

  // Update parent component when form data changes
  useEffect(() => {
    console.log('Form data changed:', formData);
    if (formData.date && formData.start_time && formData.duration && formData.people) {
      onBookingDetailsChange?.(formData);
    }
  }, [formData, onBookingDetailsChange]);

  // Check if a step is completed
  const isStepCompleted = (stepName) => {
    switch (stepName) {
      case 'date':
        return Boolean(formData.date);
      case 'time':
        return Boolean(formData.start_time);
      case 'duration':
        return Boolean(formData.duration);
      case 'people':
        return Boolean(formData.people);
      default:
        return false;
    }
  };

  // Check if a step is accessible
  const canAccessStep = (stepName) => {
    switch (stepName) {
      case 'date':
        return true;
      case 'time':
        return Boolean(formData.date);
      case 'duration':
        return Boolean(formData.date && formData.start_time);
      case 'people':
        return Boolean(formData.date && formData.start_time && formData.duration);
      default:
        return false;
    }
  };

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

  // When closing the modal, don't clear the booking details if we have a valid selection
  const handleClose = () => {
    if (!availability) {
      onBookingDetailsChange?.(null);
    }
    onClose();
  };

  const handleStepClick = (stepName) => {
    if (canAccessStep(stepName)) {
      setStep(stepName);
      setAvailability(null);
      setError(null);
    }
  };

  const handleAvailabilityCheck = async () => {
    try {
      await handleCheckAvailability();
    } catch (err) {
      console.error('Error checking availability:', err);
    }
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

  if (!isOpen) return null;

  return (
    <div className="mobile-booking-modal">
      <div className="mobile-booking-content">
        <button className="close-button" onClick={handleClose}>×</button>
        
        <div className="mobile-booking-header">
          <h3>{venueDetails?.name || 'Loading...'}</h3>
          {calculatedPrice !== null && (
            <div className="price">£{calculatedPrice}</div>
          )}
        </div>

        <div className="mobile-booking-steps">
          <div className="step-indicator">
            {['date', 'time', 'duration', 'people'].map((stepName) => (
              <div 
                key={stepName}
                className={`step 
                  ${step === stepName ? 'active' : ''} 
                  ${isStepCompleted(stepName) ? 'completed' : ''} 
                  ${canAccessStep(stepName) ? 'accessible' : ''}`
                }
                onClick={() => handleStepClick(stepName)}
                style={{ 
                  cursor: canAccessStep(stepName) ? 'pointer' : 'default',
                  opacity: canAccessStep(stepName) ? 1 : 0.5
                }}
              >
                <div className="step-label">
                  {stepName.charAt(0).toUpperCase() + stepName.slice(1)}
                </div>
              </div>
            ))}
          </div>

          {renderStep()}

          {error && (
            <p className="error-message">{error}</p>
          )}

          {formData.date && formData.start_time && formData.duration && formData.people && (
            <div className="mobile-booking-actions">
              {!availability && (
                <Button
                  title={isLoading ? "Checking..." : "Check availability"}
                  width={"100%"}
                  height={50}
                  colour={"main"}
                  hide={false}
                  click={handleAvailabilityCheck}
                  disabled={isLoading}
                  margin={"10px auto"}
                />
              )}

              {availability && (
                <>
                  <div className="availability-message success">
                    ✓ This time slot is available
                  </div>
                  <Button
                    title="Proceed to book"
                    width={"100%"}
                    height={50}
                    colour={"main"}
                    hide={false}
                    page={"book"}
                    margin={"10px auto"}
                  />
                </>
              )}

              {availability === false && (
                <>
                  <div className="availability-message error">
                    ✗ Sorry, this time slot is not available
                  </div>
                  <p className="change-selection-prompt">
                    Change date or time duration to check again
                  </p>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 