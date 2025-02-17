import "../styles/components.css";

export default function Button({ title, width, height, colour, hide, margin }) {
  return (
    <button
      className={`custom-button ${hide ? "hide" : ""}`}
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
