import React from 'react';
import Input from "@/components/input";

export const PeopleStep = ({
  value,
  onChange,
  maxCapacity
}) => {
  return (
    <div className="booking-step">
      <h4>Number of People</h4>
      <Input
        type="number"
        id="people"
        width="90%"
        height={35}
        value={value}
        onChange={onChange}
        min="1"
        max={maxCapacity}
        placeholder={`Enter number of people (max ${maxCapacity})`}
      />
    </div>
  );
}; 