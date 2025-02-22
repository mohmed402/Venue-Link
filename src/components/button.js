"use client";

import { useRouter } from "next/navigation";

import "../styles/components.css";

export default function Button({
  classN,
  title,
  width,
  height,
  colour,
  hide,
  margin,
  page,
}) {
  const router = useRouter();

  const navigateToPage = (page) => {
    if (page) {
      router.push(`/${page}`);
    }
  };

  const test = (page) => {
    console.log(`/${page}`);
  };

  return (
    <button
      className={
        classN
          ? `custom-button ${classN}`
          : `custom-button ${hide ? "hide" : ""}`
      }
      onClick={() => (page ? navigateToPage(page) : test(page))}
      style={{
        width: width,
        height: height,
        backgroundColor: colour === "main" ? "#800020" : colour,
        margin: margin || "10px",
      }}
    >
      {title}
    </button>
  );
}
