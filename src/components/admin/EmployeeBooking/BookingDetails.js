'use client'

import styles from '@/styles/EmployeeBooking/BookingDetails.module.css'

export default function BookingDetails({ isActive, bookingData, setBookingData }) {
  if (!isActive) return null

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
    '12:00', '12:30', '13:00', '13:30', '14:00', '14:30', '15:00', '15:30',
    '16:00', '16:30', '17:00', '17:30', '18:00', '18:30', '19:00', '19:30',
    '20:00', '20:30', '21:00', '21:30', '22:00'
  ]

  const isTimeInRange = (time) => {
    if (!bookingData.startTime || !bookingData.endTime) return false;
    
    const convertTimeToMinutes = (time) => {
      const [hours, minutes] = time.split(':').map(Number);
      return hours * 60 + minutes;
    };

    const timeInMinutes = convertTimeToMinutes(time);
    const startInMinutes = convertTimeToMinutes(bookingData.startTime);
    const endInMinutes = convertTimeToMinutes(bookingData.endTime);

    return timeInMinutes >= startInMinutes && timeInMinutes <= endInMinutes;
  };

  const handleTimeSelect = (time) => {
    const getEndTime = (startTime, durationHours = 6) => {
      const [hours, minutes] = startTime.split(':').map(Number);
      const endHours = hours + durationHours;
      return `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    };

    setBookingData(prev => ({
      ...prev,
      startTime: time,
      endTime: getEndTime(time, prev.duration || 6)
    }));
  };

  const handleDurationChange = (newDuration) => {
    const getEndTime = (startTime, durationHours) => {
      const [hours, minutes] = startTime.split(':').map(Number);
      const endHours = hours + durationHours;
      return `${endHours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    };

    setBookingData(prev => ({
      ...prev,
      duration: newDuration,
      endTime: getEndTime(prev.startTime, newDuration)
    }));
  };

  const handleBookFullDay = () => {
    setBookingData(prev => ({
      ...prev,
      startTime: '08:00',
      endTime: '22:00',
      duration: 14
    }));
  };

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>
        <span>📅</span> Booking Details
      </h2>

      <div className={styles.formGrid}>
        <div className={styles.formGroup}>
          <label>Event Date *</label>
          <input
            type="date"
            className={styles.input}
            value={bookingData.eventDate}
            onChange={(e) => setBookingData({ ...bookingData, eventDate: e.target.value })}
          />
        </div>

        <div className={styles.flexGroup}>
          <div className={styles.formGroup}>
            <label>Start Time *</label>
            <select 
              className={styles.input}
              value={bookingData.startTime}
              onChange={(e) => handleTimeSelect(e.target.value)}
            >
              <option value="">Select time</option>
              {timeSlots.map((time) => (
                <option key={time} value={time}>{time}</option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Duration *</label>
            <div className={styles.durationInput}>
              <input
                type="number"
                min="1"
                max="14"
                className={styles.input}
                value={bookingData.duration || 6}
                onChange={(e) => handleDurationChange(parseInt(e.target.value))}
              />
              <span>hours</span>
            </div>
          </div>

          <button 
            className={styles.fullDayButton}
            onClick={handleBookFullDay}
            type="button"
          >
            Book Full Day
          </button>
        </div>

        <div className={styles.formGroup}>
          <label>Number of Guests *</label>
          <input
            type="number"
            min="1"
            className={styles.input}
            value={bookingData.numberOfGuests}
            onChange={(e) => setBookingData({ ...bookingData, numberOfGuests: parseInt(e.target.value) })}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Event Type *</label>
          <select 
            className={styles.input}
            value={bookingData.eventType}
            onChange={(e) => setBookingData({ ...bookingData, eventType: e.target.value })}
          >
            <option value="">Select event type</option>
            <option value="corporate">Corporate Event</option>
            <option value="wedding">Wedding</option>
            <option value="birthday">Birthday Party</option>
            <option value="conference">Conference</option>
            <option value="other">Other</option>
          </select>
        </div>
      </div>

      <div className={styles.timeSection}>
        <div className={styles.stats}>
          <div className={styles.statItem}>
            <span className={styles.availableDot}></span>
            <span>Available</span>
            <span className={styles.statCount}>29 slots</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.bookedDot}></span>
            <span>Booked</span>
            <span className={styles.statCount}>0 slots</span>
          </div>
          <div className={styles.statItem}>
            <span className={styles.selectedDot}></span>
            <span>Selected</span>
          </div>
        </div>

        {bookingData.startTime && bookingData.endTime && (
          <div className={styles.bookingInfo}>
            <h3>Your Booking</h3>
            <div className={styles.selectedTimeRange}>
              <span className={styles.checkIcon}>✓</span>
              {bookingData.startTime} - {bookingData.endTime}
              <span className={styles.availabilityBadge}>Available</span>
            </div>
          </div>
        )}

        <div className={styles.timeGrid}>
          {timeSlots.map((time) => (
            <button
              key={time}
              className={`${styles.timeSlot} ${isTimeInRange(time) ? styles.selected : ''}`}
              onClick={() => handleTimeSelect(time)}
            >
              {time}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
} 