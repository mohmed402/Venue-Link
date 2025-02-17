import Image from "next/image";
import Hart from "./hart";

// import "../styles/services.css";

const venues = [
  {
    imageSrc: "/assets/venue-1.png",
    altText: "venue 1",
    venueType: "Hall",
    venueName: "500 Haldar Tower",
    venueDetails: "400 Chairs | 2 parking | In-house catering",
    venueDescription: "Event Space in a Hotel Private space",
  },
  {
    imageSrc: "/assets/venue-2.png",
    altText: "venue 2",
    venueType: "Conference Room",
    venueName: "Central Conference Hall",
    venueDetails: "200 Chairs | 3 parking | AV Equipment",
    venueDescription: "Perfect for corporate meetings",
  },
  {
    imageSrc: "/assets/venue-3.png",
    altText: "venue 3",
    venueType: "Banquet Hall",
    venueName: "Oceanview Banquet",
    venueDetails: "300 Chairs | 5 parking | Catering services",
    venueDescription: "Spacious banquet with ocean view",
  },
  {
    imageSrc: "/assets/venue-1.png",
    altText: "venue 1",
    venueType: "Hall",
    venueName: "500 Haldar Tower",
    venueDetails: "400 Chairs | 2 parking | In-house catering",
    venueDescription: "Event Space in a Hotel Private space",
  },
  {
    imageSrc: "/assets/venue-2.png",
    altText: "venue 2",
    venueType: "Conference Room",
    venueName: "Central Conference Hall",
    venueDetails: "200 Chairs | 3 parking | AV Equipment",
    venueDescription: "Perfect for corporate meetings",
  },
  {
    imageSrc: "/assets/venue-3.png",
    altText: "venue 3",
    venueType: "Banquet Hall",
    venueName: "Oceanview Banquet",
    venueDetails: "300 Chairs | 5 parking | Catering services",
    venueDescription: "Spacious banquet with ocean view",
  },
  {
    imageSrc: "/assets/venue-1.png",
    altText: "venue 1",
    venueType: "Hall",
    venueName: "500 Haldar Tower",
    venueDetails: "400 Chairs | 2 parking | In-house catering",
    venueDescription: "Event Space in a Hotel Private space",
  },
  {
    imageSrc: "/assets/venue-2.png",
    altText: "venue 2",
    venueType: "Conference Room",
    venueName: "Central Conference Hall",
    venueDetails: "200 Chairs | 3 parking | AV Equipment",
    venueDescription: "Perfect for corporate meetings",
  },
  {
    imageSrc: "/assets/venue-3.png",
    altText: "venue 3",
    venueType: "Banquet Hall",
    venueName: "Oceanview Banquet",
    venueDetails: "300 Chairs | 5 parking | Catering services",
    venueDescription: "Spacious banquet with ocean view",
  },
];

export default function Venue() {
  return (
    <section className="venue-section">
      {venues.map((venue, index) => (
        <section key={index} className="venue">
          <Image
            className=""
            aria-hidden
            src="/assets/mainBackground-home.png"
            alt="venue background"
            width={280}
            height={200}
          />
          <section className="venue-info">
            <div>
              <p className="venueType">{venue.venueType}</p>
              <h3 className="venueText">{venue.venueName}</h3>
              <p className="venueText">{venue.venueDetails}</p>
              <p className="venueText">{venue.venueDescription}</p>
            </div>
            <div>
              <Hart />
            </div>
          </section>
        </section>
      ))}
    </section>
  );
}
