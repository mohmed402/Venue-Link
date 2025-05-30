import React, { useState } from "react";
import Button from "../components/button";
import Input from "@/components/input";
import Image from "next/image";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { checkAvailability } from "@/services/bookingService";
import { format } from 'date-fns';

const DURATION_OPTIONS = [
  { value: 90, label: '1h 30m' },
  { value: 120, label: '2h' },
  { value: 180, label: '3h' },
  { value: 240, label: '4h' },
  { value: 300, label: '5h' },
  { value: 360, label: '6h' },
  { value: 420, label: '7h' },
  { value: 720, label: 'Full Day' },
];

const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const hour = Math.floor(i / 2);
  const minute = i % 2 === 0 ? '00' : '30';
  return {
    value: `${hour.toString().padStart(2, '0')}:${minute}`,
    label: `${hour.toString().padStart(2, '0')}:${minute}`
  };
});

export default function BookingForm({ venueId }) {
  const [formData, setFormData] = useState({
    venue_id: venueId,
    date: null,
    start_time: "",
    duration: 120,
    people: "",
  });
  const [step, setStep] = useState('date');
  const [availability, setAvailability] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDateSelect = (date) => {
    setFormData(prev => ({
      ...prev,
      date: format(date, 'yyyy-MM-dd')
    }));
    if (!formData.start_time) {
      setStep('time');
    }
    setAvailability(null);
    setError(null);
  };

  const handleTimeSelect = (time) => {
    setFormData(prev => ({
      ...prev,
      start_time: time
    }));
    if (!formData.duration || formData.duration === 0) {
      setStep('duration');
    }
  };

  const handleDurationSelect = (duration) => {
    setFormData(prev => ({
      ...prev,
      duration: parseInt(duration)
    }));
    if (!formData.people) {
      setStep('people');
    }
  };

  const handleInputChange = (id, value) => {
    setFormData(prev => ({
      ...prev,
      [id]: value
    }));
    setAvailability(null);
    setError(null);
  };

  const calculateEndTime = (start, durationMinutes) => {
    const [hours, minutes] = start.split(":").map(Number);
    const startDate = new Date(2000, 0, 1, hours, minutes);
    const endDate = new Date(startDate.getTime() + durationMinutes * 60000);
    return `${endDate.getHours().toString().padStart(2, "0")}:${endDate.getMinutes().toString().padStart(2, "0")}`;
  };

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

    const time_to = calculateEndTime(start_time, parseInt(duration));

    try {
      setIsLoading(true);
      setError(null);

      const response = await checkAvailability({
        venue_id: venueId,
        date,
        time_from: start_time,
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

  const renderSummary = () => {
    if (!formData.date) return null;
    
    const summaryItems = [
      {
        label: 'Date',
        value: formData.date ? format(new Date(formData.date), 'dd MMM yyyy') : null,
        onClick: () => setStep('date')
      },
      {
        label: 'Time',
        value: formData.start_time || null,
        onClick: () => setStep('time')
      },
      {
        label: 'Duration',
        value: formData.duration ? DURATION_OPTIONS.find(opt => opt.value === formData.duration)?.label : null,
        onClick: () => setStep('duration')
      },
      {
        label: 'People',
        value: formData.people ? `${formData.people} people` : null,
        onClick: () => setStep('people')
      }
    ];

    return (
      <div className="booking-summary">
        {summaryItems.map((item, index) => (
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

  const renderStep = () => {
    switch (step) {
      case 'date':
        return (
          <div className="booking-step">
            <h4>Select Date</h4>
            <DatePicker
              selected={formData.date ? new Date(formData.date) : null}
              onChange={handleDateSelect}
              dateFormat="dd/MM/yyyy"
              minDate={new Date()}
              inline
              showTimeSelect={false}
              calendarClassName="custom-calendar"
            />
          </div>
        );
      
      case 'time':
        return (
          <div className="booking-step">
            <h4>Select Start Time</h4>
            <div className="time-options">
              {TIME_OPTIONS.map((time) => (
                <button
                  key={time.value}
                  className={`time-button ${formData.start_time === time.value ? 'selected' : ''}`}
                  onClick={() => handleTimeSelect(time.value)}
                >
                  {time.label}
                </button>
              ))}
            </div>
          </div>
        );
      
      case 'duration':
        return (
          <div className="booking-step">
            <h4>Select Duration</h4>
            <div className="duration-options">
              {DURATION_OPTIONS.map((option) => (
                <button
                  key={option.value}
                  className={`duration-button ${formData.duration === option.value ? 'selected' : ''}`}
                  onClick={() => handleDurationSelect(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>
        );
      
      case 'people':
        return (
          <div className="booking-step">
            <h4>Number of People</h4>
            <Input
              type="number"
              id="people"
              width="100%"
              height={35}
              value={formData.people}
              onChange={(value) => handleInputChange("people", value)}
              min="1"
              placeholder="Enter number of people"
            />
          </div>
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
            <h3>Oddfellows E.</h3>
            <p>Your Personal Event Manager from Oddfellows On The Park</p>
          </div>
        </div>
        
        <section className="form-inputs">
          {renderSummary()}
          {renderStep()}
          
          {formData.date && formData.start_time && formData.duration && formData.people && (
            <Button
              title={isLoading ? "Checking..." : "Check availability"}
              width={"75%"}
              height={40}
              colour={"main"}
              hide={false}
              click={handleCheckAvailability}
              disabled={isLoading}
            />
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
