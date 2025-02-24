import Stars from "@/components/Stars";
import Image from "next/image";

export default function VenueInfo() {
  return (
    <section className="venue-info-header">
      <h1>The whole Venue at Oddfellows On The Park</h1>
      <p>Event Space in a Hotel Private space</p>
      <div>
        <Stars rating={3} /> <span>10 reviews – Read all</span>
      </div>
      <div>
        <Image
          className=""
          aria-hidden
          src="/assets/locationIcon.png"
          alt="location Icon"
          width={20}
          height={20}
        />
        <span>
          <a target="_blank" href="https://maps.app.goo.gl/yofbda3Y1h1ukYEt8">
            BRUNTWOOD PARK, CHEADLE, Manchester, SK8 1HX
          </a>
        </span>
      </div>
    </section>
  );
}
