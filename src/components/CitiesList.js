import React, { useState, useEffect } from "react";
import useFetchCities from "../utils/useFetchCities";

const CitiesList = ({ selectedCountry, selectedCity, setSelectedCity }) => {
  const [country, setCountry] = useState(selectedCountry);
  // const [selectedCity, setSelectedCity] = useState(""); // Track the selected city
  const { cities, loading, error } = useFetchCities(country);

  // Update the selectedCity when the cities list changes or when a new country is selected
  useEffect(() => {
    if (cities && cities.length > 0) {
      setSelectedCity(cities[0]); // Set default city to the first city in the list
    }
  }, [cities]); // Trigger when cities change

  const handleCityChange = (e) => {
    setSelectedCity(e.target.value); // Update selected city when user selects a different city
  };

  return (
    <div>
      {loading && <p>Loading cities...</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      {cities && cities.length > 0 ? (
        <select
          value={selectedCity} // Set the value of select to the selected city
          onChange={handleCityChange}
          className="select-op"
        >
          {cities.map((city, index) => (
            <option key={index} value={city}>
              {city}
            </option>
          ))}
        </select>
      ) : (
        <p>No cities available</p>
      )}
    </div>
  );
};

export default CitiesList;
