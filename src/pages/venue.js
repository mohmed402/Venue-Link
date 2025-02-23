import SideNav from "@/components/sideNav";
import NavIcon from "@/components/navIcon";
import { useNavHandler } from "@/context/NavContext";

import Button from "../components/button";

import Navigation from "@/components/navigation";
import AddToFavorites from "@/components/addToFavorites";
import BookingForm from "@/components/bookingForm";
import VenueDisplayImg from "@/components/venueDisplayImg";
import VenueInfo from "@/components/venueInfo";
import Logo from "@/components/logo";
import ImageGallery from "@/pages/ImageGallery";
import Footer from "@/components/footer";

import "../styles/venue.css";
import VenueFacilities from "@/components/venueFacilities";
import VenuePrices from "@/components/VenuePrices";
import VenueAboutSpace from "@/components/venueAboutSpace";

const Map = dynamic(() => import("@/components/map"), { ssr: false });

import dynamic from "next/dynamic";
export default function Venue() {
  const venueData = {
    venueProvidesDrinks: true,
    externalCateringNotAllowed: true,
    inHouseCatering: true,
  };
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
        <section className="venue-info-container">
          <VenueInfo />
          <section>
            <VenueFacilities facilities={venueData} />
            <VenueAboutSpace />
            <VenuePrices />
            <Map lat={32.888247} lng={13.2408143} />
          </section>
        </section>
        <BookingForm />
        <section className="mobile-book-sec">
          <div>
            <h4>£1000</h4>
            <p>14 Mar 2025</p>
          </div>
          <Button
            title={"Reserve"}
            width={120}
            height={40}
            colour={"main"}
            hide={false}
          />
        </section>
      </main>
      <Footer />
    </>
  );
}
