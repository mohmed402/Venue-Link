import Checkbox from "@/components/checkBox";
import { useState } from "react";

function FilterObj() {
  const [openSections, setOpenSections] = useState({
    venueType: false,
    catering: false,
  });

  function toggleSection(section) {
    setOpenSections((prev) => ({
      ...prev,
      [section]: !prev[section],
    }));
  }

  return (
    <section className="filter-container">
      <div className="filter-section">
        <h5 onClick={() => toggleSection("venueType")}>
          Venue Type
          <span
            className={`arrow ${openSections.venueType ? "arrow-open" : ""}`}
          >
            ❮
          </span>
        </h5>
        {["Hotel", "Cafe", "Hall"].map((venue) => (
          <div
            className={`filter-option ${
              openSections.venueType ? "" : "hide-filter"
            }`}
            key={venue}
          >
            <label htmlFor={`venue-${venue.toLowerCase()}`}>{venue}</label>
            <Checkbox id={`venue-${venue.toLowerCase()}`} />
          </div>
        ))}
      </div>

      {/* Catering and Drinks */}
      <div className="filter-section">
        <h5 onClick={() => toggleSection("catering")}>
          Catering and Drinks{" "}
          <span
            className={`arrow ${openSections.catering ? "arrow-open" : ""}`}
          >
            ❮
          </span>
        </h5>
        {["Hotel", "Cafe", "Hall"].map((venue) => (
          <div
            className={`filter-option ${
              openSections.catering ? "" : "hide-filter"
            }`}
            key={venue}
          >
            <label htmlFor={`catering-${venue.toLowerCase()}`}>{venue}</label>
            <Checkbox id={`catering-${venue.toLowerCase()}`} />
          </div>
        ))}
      </div>
    </section>
  );
}

export default FilterObj;
