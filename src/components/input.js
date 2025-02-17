export default function input({ value, id, type, width, height }) {
  return (
    <input
      type={type}
      placeholder={value}
      id={id}
      style={{
        width: width,
        height: height,
        backgroundColor: "#f8fbf8",
        borderRadius: "20px",
        border: "1.5px solid black",
        margin: "8px",
        padding: "10px",
        color: "black",
        fontSize: "15px",
      }}
    ></input>
  );
}
