import React from 'react';

export const DurationStep = ({
  durationOptions,
  selectedDuration,
  onDurationSelect,
  minimumHours
}) => {
  return (
    <div className="booking-step">
      <h4>Select Duration</h4>
      <div className="duration-options">
        {durationOptions.map((option) => (
          <button
            key={option.value}
            className={`duration-button ${selectedDuration === option.value ? 'selected' : ''}`}
            onClick={() => onDurationSelect(option.value)}
          >
            {option.label}
          </button>
        ))}
      </div>
      {minimumHours && (
        <p className="minimum-hours-notice">
          Minimum booking duration: {minimumHours} hours
        </p>
      )}
    </div>
  );
}; 