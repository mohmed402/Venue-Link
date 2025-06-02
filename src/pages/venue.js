import SideNav from "@/components/sideNav";
import NavIcon from "@/components/navIcon";
import { useNavHandler } from "@/context/NavContext";
import React, { useEffect, useState } from "react";

import Button from "../components/button";

import Navigation from "@/components/navigation";
import AddToFavorites from "@/components/addToFavorites";
import BookingForm from "@/components/booking/BookingForm";
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
import VenuePolicies from "@/components/VenuePolicies";
import { MobileBookingForm } from '@/components/booking/MobileBookingForm';
import '@/styles/MobileBooking.css';

export default function Venue() {
  const [venueId, setVenueId] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [selectedDateTime, setSelectedDateTime] = useState(null);
  const [selectedDuration, setSelectedDuration] = useState(null);
  const [isMobileBookingOpen, setIsMobileBookingOpen] = useState(false);
  const [venueDetails, setVenueDetails] = useState(null);
  const [calculatedPrice, setCalculatedPrice] = useState(null);
  const [bookingDetails, setBookingDetails] = useState(null);

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

  const formatBookingInfo = (details) => {
    if (!details || !details.date) return 'Select date & time';
    
    let formattedInfo = '';
    
    // Format date
    const date = new Date(details.date);
    const formattedDate = format(date, 'dd MMM yyyy');
    
    // Format time - remove seconds if they exist
    const time = details.start_time?.replace(':00', '');
    
    // Format duration
    let duration = '';
    if (details.duration === 'full') {
      duration = 'Full day';
    } else {
      // Convert duration to hours if it's in minutes
      const durationInHours = typeof details.duration === 'number' 
        ? Math.floor(details.duration / 60)
        : parseInt(details.duration);
      duration = `${durationInHours}h`;
    }
    
    // Format people
    const people = details.people ? `${details.people} people` : '';
    
    // Combine all parts that exist
    const parts = [formattedDate, time, duration, people].filter(Boolean);
    formattedInfo = parts.join(' • ');
    
    return formattedInfo;
  };

  const handleBookingDetailsChange = (details) => {
    console.log('Booking details received:', details);
    setBookingDetails(details);
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
            <VenuePrices venueId={venueId} />
            <VenuePolicies venueId={venueId} />
            <Map lat={32.888247} lng={13.2408143} />
          </section>
        </section>
        <BookingForm venueId={venueId} />
        <section className="mobile-book-sec">
          <div onClick={() => setIsMobileBookingOpen(true)}>
            {calculatedPrice && bookingDetails ? (
              <>
                <h4>£{calculatedPrice}</h4>
                <p style={{ 
                  textDecoration: 'underline', 
                  cursor: 'pointer',
                  color: '#2c5282',
                  marginTop: '4px',
                  fontSize: '14px'
                }}>
                  {formatBookingInfo(bookingDetails)}
                </p>
              </>
            ) : (
              <>
                <h4>Book now</h4>
                <p>Select date & time</p>
              </>
            )}
          </div>
          <Button
            title={"Reserve"}
            width={120}
            height={40}
            colour={"main"}
            hide={false}
            click={() => setIsMobileBookingOpen(true)}
          />
        </section>
      </main>
      <Footer />
      
      <MobileBookingForm
        venueId={venueId}
        isOpen={isMobileBookingOpen}
        onClose={() => setIsMobileBookingOpen(false)}
        onPriceCalculated={setCalculatedPrice}
        onBookingDetailsChange={handleBookingDetailsChange}
      />
    </>
  );
}
