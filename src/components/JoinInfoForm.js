import { useState } from "react";
import Input from "@/components/input";
import Button from "../components/button";
import Tooltip from "./Tooltip";
import "@/styles/joinInfoForm.css";

export default function JoinInfoForm({ handleStepData }) {
  const [venueName, setVenueName] = useState("");
  const [venueTitle, setVenueTitle] = useState("");
  const [venuePrice, setVenuePrice] = useState("");
  const [venueCapacity, setVenueCapacity] = useState("");
  const [about, setAbout] = useState("");

  function handleClick(e) {
    e.preventDefault();

    // Combine all values into one object
    handleStepData("info", {
      venueName,
      venueTitle,
      venuePrice,
      venueCapacity,
      about,
    });
  }

  return (
    <div className="venue-info-contaner">
      <form onSubmit={handleClick}>
        <div className="form-input-sec-one">
          <fieldset className="input-container-join">
            <label htmlFor="venueName">Venue Name</label>
            <Input
              type="text"
              value={venueName ? venueName : "Type venue Name"}
              onChange={(value) => setVenueName(value)}
              id="venueName"
              width="95%"
              height={50}
            />
          </fieldset>
          <fieldset className="input-container-join">
            <label htmlFor="venueTitle">
              Venue Title
              <Tooltip text="This title will be visible to users when your venue is displayed." />
            </label>
            <Input
              type="text"
              value={venueTitle}
              onChange={(value) => setVenueTitle(value)}
              id="venueTitle"
              width="95%"
              height={50}
            />
          </fieldset>
        </div>
        <div className="form-input-sec-one">
          <fieldset className="input-container-join">
            <label htmlFor="venueCapacity">Venue Capacity</label>
            <Input
              type="number"
              value={venueCapacity ? venueCapacity : "Type max venue capacity"}
              onChange={(value) => setVenueCapacity(value)}
              id="venueCapacity"
              width="95%"
              height={50}
            />
          </fieldset>
          <fieldset className="input-container-join">
            <label htmlFor="venuePrice">Price</label>
            <Input
              type="number"
              value={venuePrice ? venuePrice : "Price"}
              onChange={(value) => setVenuePrice(value)}
              id="venuePrice"
              width="95%"
              height={50}
            />
          </fieldset>
        </div>

        <label htmlFor="about-space-text">About the space</label>
        <textarea
          placeholder="Describe the place, tell the customer why they should book with you"
          rows={10}
          cols={92}
          value={about}
          className="about-space-text"
          onChange={(e) => setAbout(e.target.value)}
        ></textarea>

        <Button title="Save" width={200} height={40} colour="main" />
      </form>
    </div>
  );
}
