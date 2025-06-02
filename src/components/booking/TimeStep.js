import React from 'react';
import { TIME_OPTIONS } from '@/utils/booking/timeUtils';

export const TimeStep = ({
  selectedDayPricing,
  selectedTime,
  onTimeSelect
}) => {
  if (selectedDayPricing?.pricing_type === 'full_day') {
    return (
      <div className="booking-step">
        <h4>Full Day Booking</h4>
        <p>This venue is only available for full-day bookings</p>
        <p>Hours: {selectedDayPricing.start_time} - {selectedDayPricing.end_time}</p>
      </div>
    );
  }

  return (
    <div className="booking-step">
      <h4>Select Start Time</h4>
      <div className="time-options">
        {TIME_OPTIONS
          .filter(time => {
            if (!selectedDayPricing) return true;
            return time.value >= selectedDayPricing.start_time && 
                   time.value <= selectedDayPricing.end_time;
          })
          .map((time) => (
            <button
              key={time.value}
              className={`time-button ${selectedTime === time.value ? 'selected' : ''}`}
              onClick={() => onTimeSelect(time.value)}
            >
              {time.label}
            </button>
          ))}
      </div>
    </div>
  );
}; 