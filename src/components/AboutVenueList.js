import { useState } from "react";
import Checkbox from "./checkBox";
import "@/styles/aboutVenueList.css";

export default function AboutVenueList({ questionNum, handleClick }) {
  const [filters, setFilters] = useState({});
  const step = questionNum;

  const aboutVenue = [
    {
      title: "Catering and Drinks",
      fields: {
        offersCatering: ["Venue offers catering"],
        externalCateringAllowed: ["External catering allowed"],
        noBuyoutFeeforExternalCater: ["No buyout fee for external catering"],
        kitchenFacilities: ["Kitchen facilities available for guests"],
      },
    },
    {
      title: "Menu offer",
      fields: {
        vegetarianMenu: ["Vegetarian menu"],
        veganMenu: ["Vegan menu"],
        halalMenu: ["Halal menu"],
        glutenFreeMenu: ["Gluten-free menu"],
        freeRefreshments: ["Free refreshments"],
        freeDrinks: ["Free Drinks"],
      },
    },
    {
      title: "Venue Type",
      fields: {
        hotel: ["Hotel"],
        restaurant: ["Restaurant"],
        hall: ["Hall"],
        countryHouse: ["Country House"],
        museum: ["Museum"],
        cafe: ["Cafe"],
        communityCentre: ["Community Centre"],
        boat: ["Boat"],
        openAirOutdoorVenue: ["Open Air / Outdoor Venue"],
        banquetingHall: ["Banqueting Hall"],
        castle: ["Castle"],
        house: ["House"],
      },
    },
    {
      title: "Facilities",
      fields: {
        wiFi: ["Wi-Fi"],
        speakers: ["Speakers"],
        projector: ["Projector"],
        quietSpace: ["Quiet space"],
        flatScreenTV: ["Flatscreen TV"],
        naturalLight: ["Natural light"],
        airConditioning: ["Air conditioning"],
        whiteboard: ["Whiteboard"],
        storageSpace: ["Storage space"],
      },
    },
    {
      title: "Allowed Events",
      fields: {
        playOwnMusic: ["Play your own music"],
        bringOwnDJ: ["Bring your own DJ"],
      },
    },
    {
      title: "Parking",
      fields: {
        parkingAvailable: ["Parking available"],
      },
    },
  ];

  const handleCheckboxChange = (key) => (e) => {
    const updated = {
      ...filters,
      [key]: e.target.checked,
    };
    setFilters(updated);
    handleClick(updated); // Send data to parent
  };

  const currentGroup = aboutVenue[step];

  return (
    <div className="check-list-container">
      <h3>{currentGroup.title}</h3>

      {Object.entries(currentGroup.fields).map(([key, [label]]) => (
        <div key={key}>
          <Checkbox
            label={label}
            isChecked={filters[key] || false}
            onChange={handleCheckboxChange(key)}
          />
          <label>{label}</label>
        </div>
      ))}
    </div>
  );
}
