import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { format } from 'date-fns';

const DURATION_OPTIONS = [
  { value: 90, label: '1h 30m' },
  { value: 120, label: '2h' },
  { value: 180, label: '3h' },
  { value: 240, label: '4h' },
  { value: 300, label: '5h' },
  { value: 360, label: '6h' },
  { value: 420, label: '7h' },
  { value: 'full', label: 'Full Day' }
];

export default function MobileDatePicker({ isOpen, onClose, onSelect, selectedDate }) {
  const [date, setDate] = useState(selectedDate || new Date());
  const [duration, setDuration] = useState(DURATION_OPTIONS[0].value);

  const handleDateSelect = (date) => {
    setDate(date);
  };

  const handleDurationSelect = (durationValue) => {
    setDuration(durationValue);
  };

  const handleConfirm = () => {
    onSelect({ date, duration });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="mobile-date-picker-overlay">
      <div className="mobile-date-picker-content">
        <div className="mobile-date-picker-header">
          <h3>Select Date & Time</h3>
          <button onClick={onClose} className="close-button">
            ✕
          </button>
        </div>
        <DatePicker
          selected={date}
          onChange={handleDateSelect}
          inline
          showTimeSelect
          timeFormat="HH:mm"
          timeIntervals={30}
          minDate={new Date()}
          dateFormat="MMMM d, yyyy h:mm aa"
          calendarClassName="mobile-calendar"
        />
        
        <div className="duration-selector">
          <h4>Duration</h4>
          <div className="duration-options">
            {DURATION_OPTIONS.map((option) => (
              <button
                key={option.value}
                className={`duration-button ${duration === option.value ? 'selected' : ''}`}
                onClick={() => handleDurationSelect(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <button className="confirm-button" onClick={handleConfirm}>
          Confirm Selection
        </button>
      </div>
    </div>
  );
} 