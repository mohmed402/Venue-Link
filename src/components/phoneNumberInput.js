import Input from "@/components/input";
import CountriesPhoneCodes from "@/components/countriesPhoneCodes";
import { useState } from "react";
import Button from "@/components/button";

export default function PhoneNumberInput() {
  const [countryCode, setCountryCode] = useState(44);
  return (
    <div>
      <CountriesPhoneCodes countryCodeSeter={setCountryCode} />

      <div className="input-container">
        <div className="country-code">+{countryCode}</div>
        <Input
          type={"number"}
          // value={"Phone Number"}
          id={"phone-number"}
          classN={"phone-input input-field"}
        />
        <label htmlFor="input-field" className="input-label">
          Phone Number
        </label>
      </div>
      <Button
        title={"Continue"}
        width={"100%"}
        height={40}
        colour={"main"}
        classN={"btn-book"}
        hide={false}
      />
    </div>
  );
}
