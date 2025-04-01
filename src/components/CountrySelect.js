import React, { useState } from "react";

const CountrySelect = ({ selectedCountry, setSelectedCountry }) => {
  // Country data with country name and code
  const countries = [
    { name: "United States", code: "US" },
    { name: "United Kingdom", code: "GB" },
    { name: "Canada", code: "CA" },
    { name: "Germany", code: "DE" },
    { name: "France", code: "FR" },
    { name: "Australia", code: "AU" },
    { name: "India", code: "IN" },
    // Add more countries as needed
  ];

  // State to store selected country code
  //   const [selectedCountry, setSelectedCountry] = useState("");

  // Handle the change event
  const handleChange = (event) => {
    setSelectedCountry(event.target.value);
    console.log("Selected country code:", event.target.value);
  };

  return (
    <div>
      <select
        className="select-op"
        id="country"
        value={selectedCountry}
        onChange={handleChange}
      >
        <option value="" disabled>
          Select a country
        </option>
        {countries.map((country) => (
          <option key={country.code} value={country.code}>
            {country.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default CountrySelect;
