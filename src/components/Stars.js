import React from "react";
import "../styles/components.css";

const Stars = ({ rating }) => {
  const percent = (rating / 5) * 100;

  return (
    <div
      className="Stars"
      style={{ "--rating": rating, "--percent": `${percent}%` }}
      aria-label={`Rating of this product is ${rating} out of 5.`}
    ></div>
  );
};

export default Stars;
