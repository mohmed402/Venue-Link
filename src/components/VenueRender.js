import Image from "next/image";
import Hart from "./hart";
import Stars from "@/components/Stars";
import Button from "./button";

// import "../styles/services.css";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import getToReview from "@/context/getToReview";
import GetImage from "./GetImage";

export default function VenueRender({ setQauntity }) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  function setVenueId(value) {
    localStorage.setItem("venid", value);

    router.push("/venue");
  }

  useEffect(() => {
    async function fetchData() {
      try {
        const venues = await getToReview("venues");
        console.log(venues);
        console.log("typeof venues:", typeof venues);
        console.log("venues instanceof Array:", venues instanceof Array);
        console.log("venues:", venues);
        
        if (Array.isArray(venues)) {
          setData(venues);
          setQauntity(venues.length);
        } else {
          console.error("Invalid venue data:", venues);
          setData([]); // fallback to empty array
        }
      
        setLoading(false);
        
      } catch (err) {
        console.error("Error fetching data:", err.message);
        setData([]); // prevent undefined
      }
    }

    fetchData();
  }, []);

  return (
    <section className="venue-section">
      {data.map((venue) => (
        <section key={venue.venue_id} className="venue">
          <GetImage
            width={280}
            height={200}
            venueId={venue.venue_id}
            isMain={true}
            classN={"venue-image"}
          />
          <section className="venue-info">
            <div className="venue-info-one">
              <p className="venueType">{venue.venue_place_type}</p>
              <div>
                <h3 className="venueText t-header">{venue.venue_title}</h3>
                <Stars rating={4} />
              </div>
              <div>
                <p className="venueText">
                  400 Chairs | 2 parking | In-house catering
                </p>
                <p className="venueText">
                  Event Space in a Hotel Private space
                </p>
              </div>
            </div>
            <div className="venue-info-two">
              <Hart
                isHart={true}
                onToggle={(status) => console.log("Favorite:", status)}
              />

              <h3 className="venuePrice">£{venue.venue_price}</h3>
              <Button
                classN={"btn-mobile"}
                title={"Select"}
                width={100}
                height={40}
                colour={"main"}
                click={() => setVenueId(venue.venue_id)}
                hide={false}
              />
            </div>
          </section>
        </section>
      ))}
    </section>
  );
}

// const venues = [
//   {
//     imageSrc: "/assets/venue-1.png",
//     altText: "venue 1",
//     venueType: "Hall",
//     venueName: "500 Haldar Tower",
//     rating: 4.2,
//     venueDetails: "400 Chairs | 2 parking | In-house catering",
//     venueDescription: "Event Space in a Hotel Private space",
//     price: "£1000",
//     isHart: true,
//   },
//   {
//     imageSrc: "/assets/venue-2.png",
//     altText: "venue 2",
//     venueType: "Conference Room",
//     venueName: "Central Conference Hall",
//     rating: 1,
//     venueDetails: "200 Chairs | 3 parking | AV Equipment",
//     venueDescription: "Perfect for corporate meetings",
//     price: "£1200",
//     isHart: true,
//   },
//   {
//     imageSrc: "/assets/venue-3.png",
//     altText: "venue 3",
//     venueType: "Banquet Hall",
//     venueName: "Oceanview Banquet",
//     rating: 3.1,
//     venueDetails: "300 Chairs | 5 parking | Catering services",
//     venueDescription: "Spacious banquet with ocean view",
//     price: "£500",
//     isHart: false,
//   },
// ];
