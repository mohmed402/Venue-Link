// import MapLocation from "@/components/MapLocation";
import { useState } from "react";
import CitiesList from "./CitiesList";
import CountrySelect from "./CountrySelect";
import AboutVenueList from "./AboutVenueList";
import JoinInfoForm from "./JoinInfoForm";
import VenueImagesUploader from "./VenueImagesUploader";
import SignUp from "./signUp";
import dynamic from "next/dynamic";
const MapLocation = dynamic(() => import("@/components/MapLocation"), {
  ssr: false,
});
export default function QuestionJoin({
  questionNum,
  selectedValue,
  setSelectedValue,
  handleStepData,
  setUserId,
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
    "Tell us more about it?",
    "Venue details",
    "Venue details",
  ];
  const options = [
    [<SignUp handleClick={handleClick} setUserId={setUserId} key={"@0"} />],
    ["Venue", "Hotel hall", "Meeting room"],
    ["An entire place", "A shared place with more than a hall", "A room"],
    [
      <CountrySelect
        selectedCountry={selectedCountry}
        setSelectedCountry={(val) => {
          setSelectedCountry(val);
          setSelectedValue(val);
          handleStepData("country", val);
        }}
        key={"@1"}
      />,
    ],
    [
      <CitiesList
        selectedCountry={selectedCountry}
        selectedCity={selectedCity}
        setSelectedCity={(val) => {
          setSelectedCity(val);
          setSelectedValue(val);

          handleStepData("city", val);
        }}
        key={"@2"}
      />,
    ],
    [
      <MapLocation
        country={selectedCountry}
        city={selectedCity}
        handleClick={(value) => {
          handleStepData("location", value);
          setSelectedValue("location", value);
        }} // value: { lat, lng, address }
        key={"@3"}
      />,
    ],
    [
      <AboutVenueList
        questionNum={0}
        handleClick={(values) =>
          handleStepData("Catering&Drinks", { ...values })
        }
        key={"@4"}
      />,
    ],
    [
      <AboutVenueList
        questionNum={1}
        handleClick={(values) => handleStepData("MenuOffer", { ...values })}
        key={"@5"}
      />,
    ],
    [
      <AboutVenueList
        questionNum={2}
        handleClick={(values) => handleStepData("VenueType", { ...values })}
        key={"@6"}
      />,
    ],
    [
      <AboutVenueList
        questionNum={3}
        handleClick={(values) => handleStepData("Facilities", { ...values })}
        key={"@7"}
      />,
    ],
    [
      <AboutVenueList
        questionNum={4}
        handleClick={(values) => handleStepData("AllowedEvents", { ...values })}
        key={"@8"}
      />,
    ],
    [
      <AboutVenueList
        questionNum={5}
        handleClick={(values) => handleStepData("Parking", { ...values })}
        key={"@9"}
      />,
    ],
    [<JoinInfoForm handleStepData={handleStepData} key={"@10"} />],
    [<VenueImagesUploader handleStepData={handleStepData} key={"@11"} />],
    [""],
  ];

  function handleClick(value, i) {
    setSelectedValue(value);
    handleStepData(`type-${questionNum}`, value);
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
                onClick={() => handleClick(option, i)}
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
