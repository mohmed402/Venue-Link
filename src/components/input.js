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
  min,
  max,
  placeholder,
}) {
  const [inputValue, setInputValue] = useState(value);
  const [isFocused, setIsFocused] = useState(false);

  const handleChange = (e) => {
    let newValue = e.target.value;
    
    // For number inputs, clamp the value between min and max
    if (type === 'number' && newValue !== '') {
      const numValue = parseInt(newValue);
      if (!isNaN(numValue)) {
        if (max !== undefined && numValue > max) {
          newValue = max.toString();
        }
        if (min !== undefined && numValue < min) {
          newValue = min.toString();
        }
      }
    }
    
    setInputValue(newValue);
    onChange?.(newValue);
  };

  return (
    <input
      className={classN ? `custom-input ${classN}` : "custom-input"}
      type={type}
      placeholder={!isFocused ? (placeholder || value) : ""}
      id={id}
      name={name}
      value={inputValue}
      min={min}
      max={max}
      onFocus={() => {
        setIsFocused(true);
        setInputValue("");
      }}
      onBlur={() => {
        setIsFocused(false);
        if (!inputValue) setInputValue(value);
      }}
      onChange={handleChange}
      checked={type === "radio" || type === "checkbox" ? isChecked : undefined}
      style={{ width, height }}
      readOnly={isChecked}
      required={required}
    />
  );
}
