import "../styles/components.css";

export default function Button({
  classN,
  title,
  width,
  height,
  colour,
  hide,
  margin,
}) {
  return (
    <button
      className={
        classN
          ? `custom-button ${classN}`
          : `custom-button ${hide ? "hide" : ""}`
      }
      style={{
        width: width,
        height: height,
        backgroundColor: colour === "main" ? "#800020" : colour,
        margin: margin ? margin : "10px",
      }}
    >
      {title}
    </button>
  );
}
