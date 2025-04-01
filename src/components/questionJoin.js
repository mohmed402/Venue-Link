import MapLocation from "@/components/MapLocation";
import { useState } from "react";
import CitiesList from "./CitiesList";
import CountrySelect from "./CountrySelect";
import AboutVenueList from "./AboutVenueList";
import JoinInfoForm from "./JoinInfoForm";
import VenueImagesUploader from "./VenueImagesUploader";
import SignUp from "./signUp";

export default function QuestionJoin({
  questionNum,
  selectedValue,
  setSelectedValue,
}) {
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedCity, setSelectedCity] = useState(""); // Track the selected city

  const questions = [
    "",
    "Which of these best describes your place?",
    "What type of place will guests have?",
    "Select a Country",
    "Select a City",
    "Where's your place located?",
    "Tell us more about it?",
    "Tell us more about it?",
    "Tell us more about it?",
    "Tell us more about it?",
    "Tell us more about it?",
    "Venue details",
  ];
  const options = [
    [<SignUp key={"@0"} />],
    ["Venue", "Hotel hall", "Meeting room"],
    ["An entire place", "A shared place with more than a hall", "A room"],
    [
      <CountrySelect
        selectedCountry={selectedCountry}
        setSelectedCountry={setSelectedCountry}
        key={"@1"}
      />,
    ],
    [
      <CitiesList
        selectedCountry={selectedCountry}
        selectedCity={selectedCity}
        setSelectedCity={setSelectedCity}
        key={"@2"}
      />,
    ],
    [
      <MapLocation
        country={selectedCountry}
        city={selectedCity}
        handleClick={handleClick}
        key={"@3"}
      />,
    ],
    [<AboutVenueList questionNum={0} handleClick={handleClick} key={"@4"} />],
    [<AboutVenueList questionNum={1} handleClick={handleClick} key={"@5"} />],
    [<AboutVenueList questionNum={2} handleClick={handleClick} key={"@6"} />],
    [<AboutVenueList questionNum={3} handleClick={handleClick} key={"@7"} />],
    [<AboutVenueList questionNum={4} handleClick={handleClick} key={"@8"} />],
    [<JoinInfoForm key={"@9"} />],
    [<VenueImagesUploader key={"@10"} />],
  ];

  function handleClick(value) {
    setSelectedValue(value);
  }

  return (
    <>
      <h1 key={questionNum}>{questions[questionNum]}</h1>
      <section className="list-q">
        {options[questionNum].map((option, i) =>
          typeof option === "string" ? (
            <div key={i}>
              <h2
                className={selectedValue === option ? "list-q-selected" : ""}
                onClick={() => handleClick(option)}
              >
                {option}
              </h2>
            </div>
          ) : (
            <div key={i}>{option}</div>
          )
        )}
      </section>
    </>
  );
}
