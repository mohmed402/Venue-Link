import "../styles/components.css";

export default function Input({
  classN,
  value,
  id,
  type,
  name,
  width,
  height,
  isChecked,
}) {
  return (
    <input
      className={classN ? `custom-input ${classN}` : "custom-input"}
      type={type}
      placeholder={type !== "radio" ? value : undefined} // ✅ Only show placeholder for non-radio inputs
      id={id}
      name={name}
      value={type !== "radio" ? value : undefined} // ✅ Avoid setting value on radio inputs
      checked={isChecked}
      style={{
        width: width,
        height: height,
      }}
      {...(isChecked ? { readOnly: true } : {})} // ✅ Correct conditional readOnly
    />
  );
}
