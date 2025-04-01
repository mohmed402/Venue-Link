import { useState } from "react";
import Input from "@/components/input";

export default function PaymentOptions() {
  const [selectedOption, setSelectedOption] = useState("option1");

  const handleOptionClick = (value) => {
    setSelectedOption(value);
    // console.log(value);
  };

  return (
    <section className="payway-sec">
      <h2>Choose how to pay</h2>
      <section>
        <div
          className={selectedOption === "option1" ? "selected-radio" : ""}
          onClick={() => handleOptionClick("option1")}
        >
          <label htmlFor="option1">Pay £{1200.0} Now</label>
          <Input
            classN={"payway-op"}
            type={"radio"}
            value={"option1"}
            name={"payment-type"}
            isChecked={selectedOption === "option1"}
            width={20}
            height={20}
          />
        </div>
        <div
          className={selectedOption === "option2" ? "selected-radio" : ""}
          onClick={() => handleOptionClick("option2")}
        >
          <label htmlFor="option2">
            Pay part now, part later £125.00 due today, £135.00 on 1 Mar 2025.
            No extra fees.
          </label>
          <Input
            classN={"payway-op"}
            type={"radio"}
            value={"option2"}
            name={"payment-type"}
            isChecked={selectedOption === "option2"}
            width={20}
            height={20}
          />
        </div>
        <div
          className={
            selectedOption === "option3" ? "selected-radio cbc" : "cbc"
          }
          onClick={() => handleOptionClick("option3")}
        >
          <label htmlFor="option3">
            Pay £10 now to secure your booking for 24 hours while you make your
            choice
          </label>
          <Input
            classN={"payway-op"}
            type={"radio"}
            value={"option3"}
            name={"payment-type"}
            isChecked={selectedOption === "option3"}
            width={20}
            height={20}
          />
        </div>
      </section>
      <hr />
    </section>
  );
}
