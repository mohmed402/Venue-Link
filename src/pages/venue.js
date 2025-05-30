import SideNav from "@/components/sideNav";
import NavIcon from "@/components/navIcon";
import { useNavHandler } from "@/context/NavContext";
import React, { useEffect, useState } from "react";

import Button from "../components/button";

import Navigation from "@/components/navigation";
import AddToFavorites from "@/components/addToFavorites";
import BookingForm from "@/components/bookingForm";
import VenueDisplayImg from "@/components/venueDisplayImg";
import VenueInfo from "@/components/venueInfo";
import Logo from "@/components/logo";

import Footer from "@/components/footer";

import "../styles/venue.css";
import "../styles/headerTransion.css";
import "../styles/MobileDatePicker.css";
import VenueFacilities from "@/components/venueFacilities";
import VenuePrices from "@/components/VenuePrices";
import VenueAboutSpace from "@/components/venueAboutSpace";
import MobileDatePicker from "@/components/MobileDatePicker";
import { format } from 'date-fns';

const Map = dynamic(() => import("@/components/map"), { ssr: false });

import dynamic from "next/dynamic";
import Loader from "@/components/loader";
export default function Venue() {
  const [venueId, setVenueId] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [selectedDateTime, setSelectedDateTime] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(null);

  const venueData = {
    venueProvidesDrinks: true,
    externalCateringNotAllowed: true,
    inHouseCatering: true,
  };

  useEffect(() => {
    const storedId = localStorage.getItem("venid");
    if (storedId) {
      setVenueId(storedId);
      setTimeout(() => {
        setLoading(false);
      }, 1000);
    }
  }, []);

  const handleDateTimeSelect = ({ date, duration }) => {
    setSelectedDateTime(date);
    setSelectedDuration(duration);
  };

  const formatDuration = (minutes) => {
    if (minutes === 'full') return 'Full Day';
    if (minutes < 60) return `${minutes}m`;
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return remainingMinutes ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  };

  const formatDateTime = () => {
    if (!selectedDateTime) return 'Select date and time';
    const dateStr = format(selectedDateTime, 'dd MMM yyyy HH:mm');
    const durationStr = selectedDuration ? ` • ${formatDuration(selectedDuration)}` : '';
    return `${dateStr}${durationStr}`;
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <>
      {/* <SideNav /> */}
      <header>
        <section className="header-bar xzx">
          <Logo />
          <Navigation selcted={2} />
          {/* <NavIcon /> */}
        </section>
        <AddToFavorites />
        <VenueDisplayImg venueId={venueId} />
      </header>
      <main className="venue-main">
        <section className="venue-info-container">
          <VenueInfo venueId={venueId}/>
          <section>
            <VenueFacilities facilities={venueData} />
            <VenueAboutSpace />
            <VenuePrices />
            <Map lat={32.888247} lng={13.2408143} />
          </section>
        </section>
        <BookingForm venueId={venueId} />
        <section className="mobile-book-sec">
          <div onClick={() => setIsDatePickerOpen(true)}>
            <h4>£1000</h4>
            <p>{formatDateTime()}</p>
          </div>
          <Button
            title={"Reserve"}
            width={120}
            height={40}
            colour={"main"}
            page={"book"}
            hide={false}
          />
        </section>
      </main>
      <Footer />
      <MobileDatePicker
        isOpen={isDatePickerOpen}
        onClose={() => setIsDatePickerOpen(false)}
        onSelect={handleDateTimeSelect}
        selectedDate={selectedDateTime}
      />
    </>
  );
}
