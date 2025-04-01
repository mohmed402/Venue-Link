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
  action,
  actionState,
  submit,
  click,
  disable,
}) {
  const router = useRouter();

  const navigateToPage = (page) => {
    if (page === "home") {
      router.push(`/`);
    } else if (page) {
      router.push(`/${page}`);
    }
  };

  const reaction = () => {
    action(!actionState);
  };

  return (
    <button
      className={
        classN
          ? `custom-button ${classN}`
          : `custom-button ${hide ? "hide" : ""}`
      }
      onClick={() =>
        page ? navigateToPage(page) : action ? reaction() : click ? click() : ""
      }
      onSubmit={() => (submit ? submit() : "")}
      disabled={!disable ? false : true}
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
