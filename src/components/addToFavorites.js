"use client";
import { useState } from "react";
import "../styles/addToFavorites.css";

export default function AddToFavorites() {
  const [isFavorite, setIsFavorite] = useState(false);

  return (
    <label htmlFor="favorite" className="container">
      <input
        type="checkbox"
        id="favorite"
        name="favorite-checkbox"
        value="favorite-button"
        checked={isFavorite}
        onChange={() => setIsFavorite((prev) => !prev)}
      />
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="feather feather-heart"
      >
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
      </svg>
      <div className="action">
        <span className="option-1">
          {isFavorite ? "Added to Favorites" : "Add to Favorites"}
        </span>
      </div>
    </label>
  );
}
