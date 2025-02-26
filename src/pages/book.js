import Logo from "@/components/logo";
import Input from "@/components/input";
import Button from "@/components/button";
import Image from "next/image";

import "../styles/venue.css";

import "../styles/book.css";

import BookingForm from "@/components/bookingForm";

import { useState, useEffect } from "react";
import PhoneNumberInput from "@/components/phoneNumberInput";
import EmailInput from "@/components/emailInput";
import PaymentOptions from "@/components/paymentOptions";
import DatePickerModal from "@/components/datePickerModal";
import VenueInfo from "@/components/venueInfo";
import VenueInfoBook from "@/components/venueInfoBook";
import VenuePriceBook from "@/components/venuePriceBook";

export default function Book() {
  const [isEmail, setIsEmail] = useState(false);
  const [isDateOpen, setIsDateOpen] = useState(false);
  const [width, setWidth] = useState(0);

  useEffect(() => {
    // Function to update width
    const updateWidth = () => {
      setWidth(window.innerWidth);
    };

    // Set initial width
    updateWidth();

    // Listen for resize events
    window.addEventListener("resize", updateWidth);
    console.log(width);
    // Cleanup event listener on component unmount
    return () => window.removeEventListener("resize", updateWidth);
  }, [width]);
  return (
    <>
      <div className="background-br">
        <header>
          <section className="header-bar xzx">
            <Logo />
          </section>
        </header>
        <main>
          {isDateOpen && (
            <DatePickerModal
              isDateState={isDateOpen}
              dateOpenSeter={setIsDateOpen}
            />
          )}
          <section className="payment-section">
            <h1>Confirm and pay</h1>
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
            {/* <section>
            <h2>Payment method</h2>
            <section>
              <div>
                <p>Credit or debit card</p>
              </div>
              <div>
                <p>PayPal</p>
              </div>
            </section>
          </section> */}
            <section className="account-sec">
              <h2>Log in or sign up to book</h2>
              <section>
                {isEmail ? <EmailInput /> : <PhoneNumberInput />}

                <div>
                  <Button
                    title={"Continue"}
                    width={"100%"}
                    height={40}
                    colour={"main"}
                    classN={"btn-book"}
                    hide={false}
                  />
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
                </div>
              </section>
            </section>
          </section>
          <section className="venue-info-section">
            <VenueInfoBook>{width > 831 && <VenuePriceBook />}</VenueInfoBook>
          </section>
        </main>
      </div>
    </>
  );
}
{
  /* <hr></hr>
<p>Due now</p> */
}
