import Logo from "@/components/logo";
import Button from "@/components/button";
import Image from "next/image";
import Footer from "@/components/footer";

import "../styles/venue.css";

import "../styles/book.css";
import "../styles/success.css";
function success() {
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
          page={"home"}
          hide={false}
        />
        <div>
          <h1 className="header-title">Your reservation is comfimed!</h1>
          <p>Details about the booking has been sent to benoun204@gmail.com</p>
        </div>
      </section>
      <main>
        <section className="confirm-sec">
          <div>
            <h3>Manchester - The whole Venue at Oddfellows On The Park</h3>
            <h4>Date - 12/02/2025</h4>
          </div>
          <div>
            <h1>TY4NUM</h1>
            <p>Booking Reference</p>
          </div>
        </section>
        <Image
          className="booked-venue-img"
          aria-hidden
          src="/assets/mainBackground-home.png"
          alt="venue background"
          width={1600}
          height={1080}
        />
        <section className="booking-info-container">
          <div>
            <h3>18 March 2025</h3>
            <p>Date</p>
          </div>
          <div>
            <h3>18:00 - 23:00</h3>
            <p>Time</p>
          </div>
          <div>
            <h3>5000</h3>
            <p>Guests</p>
          </div>
        </section>
        <section className="contact-info">
          <p>
            If there are any changes to your circumstances, please feel free to
            contact customer support team at +44 7030039000. Our team is happy
            to assist you with any inquiries or updates.
          </p>
        </section>
      </main>
      <Footer />
    </>
  );
}

export default success;
