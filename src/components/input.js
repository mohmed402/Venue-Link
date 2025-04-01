import { useState } from "react";
import "../styles/components.css";

export default function Input({
  classN,
  value = "",
  id,
  type,
  name,
  width,
  height,
  isChecked,
  onChange,
  required,
}) {
  const [inputValue, setInputValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);

  return (
    <input
      className={classN ? `custom-input ${classN}` : "custom-input"}
      type={type}
      placeholder={!isFocused ? value : ""}
      id={id}
      name={name}
      value={inputValue}
      onFocus={() => {
        setIsFocused(true);
        setInputValue("");
      }}
      onBlur={() => {
        setIsFocused(false);
        if (!inputValue) setInputValue(value);
      }}
      onChange={(e) => {
        setInputValue(e.target.value);
        onChange?.(e.target.value); // ✅ Call parent function if provided
      }}
      checked={type === "radio" || type === "checkbox" ? isChecked : undefined}
      style={{ width, height }}
      readOnly={isChecked}
      required={required}
    />
  );
}
