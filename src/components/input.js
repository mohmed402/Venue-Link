import "../styles/components.css";

export default function input({
  classN,
  value,
  id,
  type,
  name,
  width,
  height,
}) {
  return (
    <input
      className={classN ? `custom-input ${classN}` : `custom-input`}
      type={type}
      placeholder={value}
      id={id}
      name={name}
      style={{
        width: width,
        height: height,
      }}
    ></input>
  );
}
