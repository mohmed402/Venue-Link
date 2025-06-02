import React from 'react';
import { format } from 'date-fns';
import { formatDurationDisplay } from '@/utils/booking/timeUtils';

export const BookingSummary = ({
  formData,
  selectedDayPricing,
  step,
  onStepClick
}) => {
  if (!formData.date) return null;
  
  const summaryItems = [
    {
      label: 'Date',
      value: formData.date ? format(new Date(formData.date), 'dd MMM yyyy') : null,
      onClick: () => onStepClick('date')
    },
    {
      label: 'Time',
      value: formData.start_time ? (
        formData.duration === 'full' 
          ? `Full Day (${formData.start_time} - ${selectedDayPricing?.end_time})` 
          : formData.start_time
      ) : null,
      onClick: () => onStepClick('time')
    },
    {
      label: 'Duration',
      value: formData.duration ? formatDurationDisplay(formData.duration) : null,
      onClick: () => onStepClick('duration')
    },
    {
      label: 'People',
      value: formData.people ? `${formData.people} people` : null,
      onClick: () => onStepClick('people')
    }
  ];

  return (
    <div className="booking-summary">
      {summaryItems.map((item) => (
        item.value && (
          <div 
            key={item.label} 
            className={`summary-item ${step === item.label.toLowerCase() ? 'active' : ''}`}
            onClick={item.onClick}
          >
            <span className="summary-label">{item.label}</span>
            <span className="summary-value">{item.value}</span>
          </div>
        )
      ))}
    </div>
  );
}; 