import Logo from "@/components/logo";
import Input from "@/components/input";
import Button from "@/components/button";

import "../styles/venue.css";

import "../styles/book.css";

import BookingForm from "@/components/bookingForm";
import CountriesPhoneCodes from "@/components/countriesPhoneCodes";

export default function Book() {
  return (
    <>
      <header>
        <section className="header-bar xzx">
          <Logo />
        </section>
      </header>
      <main>
        <section className="payment-section">
          <h1>Confirm and pay</h1>
          <section className="venue-details">
            <h2>Your Venue details</h2>
            <div className="venue-details-one">
              <div>
                <p>Date</p>
                <p>15 Mar 2025</p>
              </div>
              <p onClick={() => console.log("moe")}>Edit</p>
            </div>

            <div className="venue-details-two">
              <div>
                <p>Guests</p>
                <p>250 guest</p>
              </div>
              <p onClick={() => console.log("moe")}>Edit</p>
            </div>
          </section>
          <hr></hr>
          <section className="payway-sec">
            <h2>Choose how to pay</h2>
            <section>
              <div>
                <label for="option1">Pay £{1200.0} Now</label>
                <Input
                  type={"radio"}
                  value={"option1"}
                  name={"payment-type"}
                  classN={"payway-op"}
                  width={20}
                  height={20}
                />
              </div>
              <div>
                <label for="option2">
                  Pay part now, part later £125.00 due today, £135.00 on 1 Mar
                  2025. No extra fees.
                </label>
                <Input
                  type={"radio"}
                  value={"option2"}
                  name={"payment-type"}
                  classN={"payway-op"}
                  width={20}
                  height={20}
                />
              </div>
              <div className="cbc selected">
                <label for="option3">
                  Pay £10 now to secure your booking for 24 hours while you make
                  your choice
                </label>
                <Input
                  type={"radio"}
                  value={"option3"}
                  name={"payment-type"}
                  classN={"payway-op"}
                  width={20}
                  height={20}
                />
              </div>
            </section>
            <hr></hr>
          </section>
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
              <div>
                <CountriesPhoneCodes />
                {/* <Input
                  type={"number"}
                  value={"phoneNumber"}
                  id={"phone-number"}
                  width={120}
                  height={20}
                /> */}
                <div className="input-container">
                  <div className="country-code">+44</div>
                  <input
                    type="number"
                    placeholder="Phone Number"
                    className="phone-input input-field"
                  />
                  <label for="input-field" className="input-label">
                    Phone Number
                  </label>
                </div>
              </div>

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
                  title={"Continue with Email"}
                  width={"100%"}
                  height={40}
                  colour={"main"}
                  classN={"btn-book"}
                  hide={false}
                />
              </div>
            </section>
          </section>
        </section>
        <section className="venue-info-section">
          <BookingForm />
        </section>
      </main>
    </>
  );
}
