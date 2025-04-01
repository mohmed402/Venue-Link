import { useState, useEffect } from "react";
import Logo from "@/components/logo";
import Input from "@/components/input";
import Button from "@/components/button";
import Image from "next/image";

import "../styles/venue.css";

import "../styles/book.css";

import BookingForm from "@/components/bookingForm";

import PhoneNumberInput from "@/components/phoneNumberInput";
import EmailInput from "@/components/emailInput";
import PaymentOptions from "@/components/paymentOptions";
import DatePickerModal from "@/components/datePickerModal";
import VenueInfo from "@/components/venueInfo";
import VenueInfoBook from "@/components/venueInfoBook";
import VenuePriceBook from "@/components/venuePriceBook";
import Payment from "@/components/payment";
import Loader from "@/components/loader";
import PaymentTypes from "@/components/paymentTypes";

export default function Book() {
  const [isEmail, setIsEmail] = useState(false);
  const [isToken, setIsToken] = useState(false);
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [width, setWidth] = useState(0);
  const [paymentType, setPaymentType] = useState("");

  // function submitAccount() {}

  // useEffect(() => {
  //   fetch("http://localhost:5001/signup")
  //     .then((res) => res.json())
  //     .then((data) => console.log(data));
  // }, []);

  // useEffect(() => {
  //   fetch("http://localhost:5001/auth/signin", {
  //     method: "POST", // Must be POST since we're sending data
  //     headers: {
  //       "Content-Type": "application/json", // Tells server it's JSON data
  //     },
  //     body: JSON.stringify({
  //       email: "benoun204@gmail.com",
  //       password: "Asdfghjkl123",
  //     }),
  //   })
  //     .then((res) => res.json())
  //     .then((data) => console.log(data))
  //     .catch((error) => console.error("Error:", error));
  //   fetch("http://localhost:5001/auth/user", {
  //     method: "get", // Must be POST since we're sending data
  //     headers: {
  //       "Content-Type": "application/json", // Tells server it's JSON data
  //     },
  //   })
  //     .then((res) => res.json())
  //     .then((data) => console.log(data))
  //     .catch((error) => console.error("Error:", error));
  // }, []);
  useEffect(() => {
    const storedEmail = localStorage.getItem("user_email");
    const storedPhone = localStorage.getItem("user_phone");

    if (storedPhone) {
      setIsEmail(false);
    } else if (storedEmail) {
      setIsEmail(true);
    }
  }, []);

  useEffect(() => {
    // Function to update width
    const updateWidth = () => {
      setWidth(window.innerWidth);
    };

    // Set initial width
    updateWidth();

    // Listen for resize events
    window.addEventListener("resize", updateWidth);

    // Cleanup event listener on component unmount
    return () => window.removeEventListener("resize", updateWidth);
  }, []);
  return (
    <>
      <header>
        <section className="header-bar xzx">
          <Logo />
        </section>
      </header>
      <section className="header-tile-container">
        <Button
          title={`❮`}
          width={60}
          height={60}
          colour={"#ffffff00"}
          classN={"return-btn"}
          page={"services"}
          hide={false}
        />
        <h1 className="header-title">Confirm and pay</h1>
      </section>
      <main className="main-book">
        {isDateOpen && (
          <DatePickerModal
            isDateState={isDateOpen}
            dateOpenSeter={setIsDateOpen}
          />
        )}
        <section className="payment-section">
          <section className="venue-details">
            <h2>Your Venue details</h2>
            <div className="venue-details-one">
              <div>
                <p>Date</p>
                <p>15 Mar 2025</p>
              </div>
              <p className="edit" onClick={() => setIsDateOpen(!isDateOpen)}>
                Edit
              </p>
            </div>

            <div className="venue-details-two">
              <div>
                <p>Guests</p>
                <p>250 guest</p>
              </div>
              <p className="edit" onClick={() => console.log("moe")}>
                Edit
              </p>
            </div>
          </section>
          <hr></hr>
          <PaymentOptions />
          {width < 831 && <VenuePriceBook />}
          <section className="account-sec">
            <h2>Log in or sign up to book</h2>
            {isLoading ? (
              <Loader />
            ) : (
              <section>
                {isEmail ? (
                  <EmailInput
                    setIsToken={setIsToken}
                    setIsLoading={setIsLoading}
                  />
                ) : (
                  <PhoneNumberInput />
                )}
                {!isToken ? (
                  <Button
                    title={`Continue with ${
                      isEmail ? "Phone Number" : "Email"
                    } `}
                    width={"100%"}
                    height={40}
                    colour={"main"}
                    classN={"btn-book"}
                    action={setIsEmail}
                    actionState={isEmail}
                    hide={false}
                  />
                ) : (
                  <section>
                    <h2>Payment method</h2>
                    <section className="payment-sec">
                      <PaymentTypes
                        paymentTypeSetter={setPaymentType}
                        paymentTypeValue={paymentType}
                      />
                      {paymentType == "visa" && (
                        <Payment setIsLoading={setIsLoading} />
                      )}
                    </section>
                  </section>
                )}
              </section>
            )}
          </section>
        </section>
        <section className="venue-info-section">
          <VenueInfoBook>{width > 831 && <VenuePriceBook />}</VenueInfoBook>
        </section>
      </main>
    </>
  );
}
{
  /* <hr></hr>
<p>Due now</p> */
}
