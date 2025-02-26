import Input from "@/components/input";
import CountriesPhoneCodes from "@/components/countriesPhoneCodes";
import { useState } from "react";
export default function PhoneNumberInput() {
  const [countryCode, setCountryCode] = useState(44);
  return (
    <div>
      <CountriesPhoneCodes countryCodeSeter={setCountryCode} />

      <div className="input-container">
        <div className="country-code">+{countryCode}</div>
        <Input
          type={"number"}
          value={"Phone Number"}
          id={"phone-number"}
          classN={"phone-input input-field"}
        />
        <label for="input-field" className="input-label">
          Phone Number
        </label>
      </div>
    </div>
  );
}
