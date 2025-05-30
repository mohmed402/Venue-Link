import Stars from "@/components/Stars";
import Image from "next/image";
import { useState } from "react";
import ReviewsModal from "./ReviewsModal";
import "../styles/ReviewsModal.css";

export default function VenueInfo({venueId}) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  console.log(venueId);
  return (
    <section className="venue-info-header">
      <h1>The whole Venue at Oddfellows On The Park</h1>
      <p>Event Space in a Hotel Private space</p>
      <div>
        <Stars rating={3} /> 
        <span>
          10 reviews – 
          <button 
            onClick={() => setIsModalOpen(true)}
            style={{
              background: 'none',
              border: 'none',
              color: '#0066cc',
              cursor: 'pointer',
              padding: 0,
              font: 'inherit',
              textDecoration: 'underline'
            }}
          >
            Read all
          </button>
        </span>
      </div>
      <div className="spann">
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
      
      <ReviewsModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        venueId={venueId}
      />
    </section>
  );
}
