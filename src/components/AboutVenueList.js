// import { useState } from "react";
// import Checkbox from "./checkBox";
// import "@/styles/aboutVenueList.css";

// export default function AboutVenueList({ questionNum, handleClick}) {
//   const [filters, setFilters] = useState({});
//   const [step, setStep] = useState(questionNum); // controls the current group

//   const aboutVenue = [
//     {
//       title: "Catering and Drinks",
//       fields: {
//         offersCatering: ["Venue offers catering", false],
//         externalCateringAllowed: ["External catering allowed", false],
//         noBuyoutFeeforExternalCater: [
//           "No buyout fee for external catering",
//           false,
//         ],
//         kitchenFacilities: ["Kitchen facilities available for guests", false],
//       },
//     },
//     {
//       title: "Menu offer",
//       fields: {
//         vegetarianMenu: ["Vegetarian menu", false],
//         veganMenu: ["Vegan menu", false],
//         halalMenu: ["Halal menu", false],
//         glutenFreeMenu: ["Gluten-free menu", false],
//         freeRefreshments: ["Free refreshments", false],
//         freeDrinks: ["Free Drinks", false],
//       },
//     },
//     {
//       title: "Venue Type",
//       fields: {
//         hotel: ["Hotel", false],
//         restaurant: ["Restaurant", false],
//         hall: ["Hall", false],
//         countryHouse: ["Country House", false],
//         museum: ["Museum", false],
//         cafe: ["Cafe", false],
//         communityCentre: ["Community Centre", false],
//         boat: ["Boat", false],
//         openAirOutdoorVenue: ["Open Air / Outdoor Venue", false],
//         banquetingHall: ["Banqueting Hall", false],
//         castle: ["Castle", false],
//         house: ["House", false],
//       },
//     },
//     {
//       title: "Facilities",
//       fields: {
//         wiFi: ["Wi-Fi", false],
//         speakers: ["Speakers", false],
//         projector: ["Projector", false],
//         quietSpace: ["Quiet space", false],
//         flatScreenTV: ["Flatscreen TV", false],
//         naturalLight: ["Natural light", false],
//         airConditioning: ["Air conditioning", false],
//         whiteboard: ["Whiteboard", false],
//         storageSpace: ["Storage space", false],
//       },
//     },
//     {
//       title: "Allowed Events",
//       fields: {
//         playOwnMusic: ["Play your own music", false],
//         bringOwnDJ: ["Bring your own DJ", false],
//       },
//     },
//     {
//       title: "Parking",
//       fields: {
//         parkingAvailable: ["Parking available", false],
//       },
//     },
//   ];

//   const handleCheckboxChange = (key) => (e) => {
//     setFilters((prev) => ({
//       ...prev,
//       [key]: e.target.checked,
//     }));
//     handleClick(filters);
//   };

//   const currentGroup = aboutVenue[step];

//   return (
//     <div className="check-list-container">
//       <h3>{currentGroup.title}</h3>

//       {Object.entries(currentGroup.fields).map(([key, [label]]) => (
//         <div key={key}>
//           <Checkbox
//             label={label}
//             isChecked={filters[key] || false}
//             onChange={handleCheckboxChange(key)}
//             // setFilters((prev) => ({
//             //   ...prev,
//             //   [key]: e.target.checked,
//             // }))
//           />
//           <label>{label}</label>
//         </div>
//       ))}
//     </div>
//   );
// }

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
