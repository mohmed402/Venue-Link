import VenueInfo from "./venueInfo";
import Image from "next/image";
import "../styles/venueInfoBook.css";
import VenuePriceBook from "./venuePriceBook";

export default function VenueInfoBook({ children }) {
  return (
    <section className="venue-container">
      <div>
        <Image
          className="venueBookImage"
          aria-hidden
          src="/assets/image(1).png"
          alt="venue image"
          width={120}
          height={90}
        />

        <VenueInfo />
      </div>
      {children}
    </section>
  );
}
