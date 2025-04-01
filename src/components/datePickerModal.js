import { useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";
import "../styles/datePickerModal.css";
import Button from "@/components/button";

export default function DatePickerModal({ isDateState, dateOpenSeter }) {
  const [date, setDate] = useState(new Date());

  // Function to handle date change
  const handleDateChange = (newDate) => {
    setDate(newDate);
  };

  return (
    <section className="card">
      <div className="date-picker-container ">
        <h2 className="date-picker-title ">Select a Date</h2>
        <div className="date-picker-calendar">
          <div>
            <Calendar onChange={handleDateChange} value={date} />
            <p className="date-picker-date">
              Selected Date: <strong>{date.toDateString()}</strong>
            </p>
          </div>
        </div>
      </div>
      <Button
        title={"Done"}
        width={"100%"}
        height={40}
        colour={"main"}
        classN={"btn-book"}
        action={dateOpenSeter}
        actionState={isDateState}
        hide={false}
      />
    </section>
  );
}
