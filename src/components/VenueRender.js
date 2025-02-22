import Image from "next/image";
import Hart from "./hart";
import Stars from "@/components/Stars";
import Button from "./button";
// import "../styles/services.css";

const venues = [
  {
    imageSrc: "/assets/venue-1.png",
    altText: "venue 1",
    venueType: "Hall",
    venueName: "500 Haldar Tower",
    rating: 4.2,
    venueDetails: "400 Chairs | 2 parking | In-house catering",
    venueDescription: "Event Space in a Hotel Private space",
    price: "£1000",
    isHart: true,
  },
  {
    imageSrc: "/assets/venue-2.png",
    altText: "venue 2",
    venueType: "Conference Room",
    venueName: "Central Conference Hall",
    rating: 1,
    venueDetails: "200 Chairs | 3 parking | AV Equipment",
    venueDescription: "Perfect for corporate meetings",
    price: "£1200",
    isHart: true,
  },
  {
    imageSrc: "/assets/venue-3.png",
    altText: "venue 3",
    venueType: "Banquet Hall",
    venueName: "Oceanview Banquet",
    rating: 3.1,
    venueDetails: "300 Chairs | 5 parking | Catering services",
    venueDescription: "Spacious banquet with ocean view",
    price: "£500",
    isHart: false,
  },
];

export default function VenueRender() {
  return (
    <section className="venue-section">
      {venues.map((venue, index) => (
        <section key={index} className="venue">
          <Image
            className="venue-image"
            aria-hidden
            src={venue.imageSrc}
            alt="venue background"
            width={280}
            height={200}
          />
          <section className="venue-info">
            <div className="venue-info-one">
              <p className="venueType">{venue.venueType}</p>
              <div>
                <h3 className="venueText t-header">{venue.venueName}</h3>
                <Stars rating={venue.rating} />
              </div>
              <div>
                <p className="venueText">{venue.venueDetails}</p>
                <p className="venueText">{venue.venueDescription}</p>
              </div>
            </div>
            <div className="venue-info-two">
              <Hart
                isHart={venue.isHart}
                onToggle={(status) => console.log("Favorite:", status)}
              />

              <h3 className="venuePrice">{venue.price}</h3>
              <Button
                classN={"btn-mobile"}
                title={"Select"}
                width={100}
                height={40}
                colour={"main"}
                hide={false}
              />
            </div>
          </section>
        </section>
      ))}
    </section>
  );
}
