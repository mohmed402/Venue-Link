import "../styles/components.css";

export default function input({ value, id, type, width, height }) {
  return (
    <input
      type={type}
      placeholder={value}
      id={id}
      className="custom-input"
      style={{
        width: width,
        height: height,
      }}
    ></input>
  );
}
