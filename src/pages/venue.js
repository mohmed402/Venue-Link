import SideNav from "@/components/sideNav";
import NavIcon from "@/components/navIcon";
import { useNavHandler } from "@/context/NavContext";

import Navigation from "@/components/navigation";
import AddToFavorites from "@/components/addToFavorites";
import BookingForm from "@/components/bookingForm";
import VenueDisplayImg from "@/components/venueDisplayImg";
import VenueInfo from "@/components/venueInfo";
import Logo from "@/components/logo";
import ImageGallery from "@/pages/ImageGallery";

import "../styles/venue.css";

export default function Venue() {
  return (
    <>
      {/* <SideNav /> */}
      <header>
        <section className="header-bar">
          <Logo />
          <Navigation selcted={2} />
          {/* <NavIcon /> */}
        </section>
        <AddToFavorites />
        <VenueDisplayImg />
      </header>
      <main>
        {/* <section> */}
        <VenueInfo />
        {/* </section> */}
        <BookingForm />
      </main>
      {/* <Footer /> */}
      {/* <ImageGallery /> */}
    </>
  );
}
