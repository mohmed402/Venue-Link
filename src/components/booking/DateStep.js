import React from 'react';
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

export const DateStep = ({ 
  selected, 
  onChange, 
  venueDetails 
}) => {
  return (
    <div className="booking-step">
      <h4>Select Date</h4>
      <DatePicker
        selected={selected ? new Date(selected) : null}
        onChange={onChange}
        dateFormat="dd/MM/yyyy"
        minDate={new Date()}
        inline
        showTimeSelect={false}
        calendarClassName="custom-calendar"
        dayClassName={date => {
          const dayOfWeek = date.toLocaleString('en-US', { weekday: 'long' });
          const dayPricing = venueDetails?.pricing?.find(p => p.day_of_week === dayOfWeek);
          return !dayPricing?.is_available ? 'react-datepicker__day--disabled' : undefined;
        }}
      />
    </div>
  );
}; 