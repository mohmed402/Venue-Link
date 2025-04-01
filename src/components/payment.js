import { useState } from "react";
import { validateCardDetails } from "../utils/authCardDetails";
import { useRouter } from "next/router";
import Input from "@/components/input";
import Button from "@/components/button";
import "../styles/payment.css";

export default function Payment({ setIsLoading }) {
  const router = useRouter();
  const [fName, setFname] = useState("");
  const [lName, setLname] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvv, setCvv] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    const isValid = validateCardDetails({
      fName,
      lName,
      phoneNumber,
      cardNumber,
      expiryDate,
      cvv,
    });

    if (isValid) {
      console.log("Payment details are valid! ✅");
      setTimeout(() => {
        router.push("/success");
      }, 4000);
    } else {
      setError("Invalid payment details. Please check your inputs.");
    }
    setTimeout(() => {
      setIsLoading(false);
    }, 4000);
  };

  // const invalidPhone = {
  //   fName: "John",
  //   lName: "Doe",
  //   phoneNumber: "123343232", // Too short
  //   cardNumber: "4111111111111111",
  //   expiryDate: "12/26",
  //   cvv: "123",
  // };

  // console.log(validateCardDetails(invalidPhone)); // Expected output: false

  return (
    <form onSubmit={handleSubmit}>
      <section className="payment-input-field">
        {error && <p className="error">{error}</p>}
        <div>
          <label htmlFor="firstName-field">
            First Name
            <Input
              type="text"
              value={"First Name"}
              classN="firstName-field"
              required={true}
              onChange={(value) => setFname(value)}
              width={"80%"}
            />
          </label>
          <label htmlFor="lastName-field">
            Last Name
            <Input
              type="text"
              value={"Last Name"}
              classN="lastName-field"
              required={true}
              onChange={(value) => setLname(value)}
              width={"90%"}
            />
          </label>
        </div>
        <div>
          <label htmlFor="phoneNumber-field">
            phone Number
            <Input
              type="number"
              value={"Phone Number"}
              classN="phoneNumber-field"
              required={true}
              onChange={(value) => setPhoneNumber(value)}
              width={"100%"}
            />
          </label>
        </div>

        <div>
          <label htmlFor="cardNumber-field">
            Card Number
            <Input
              type="number"
              value={"Card Number"}
              classN="cardNumber-field"
              required={true}
              onChange={(value) => setCardNumber(value)}
              width={"100%"}
            />
          </label>
        </div>
        <div>
          <label htmlFor="expiryDate-field">
            Expiry Date
            <Input
              type="text"
              value={"MM/YY"}
              classN="expiryDate-field"
              required={true}
              onChange={(value) => setExpiryDate(value)}
              width={"80%"}
            />
          </label>
          <label htmlFor="cvv-field">
            CVV
            <Input
              type="number"
              value={"CVV"}
              classN="cvv-field"
              required={true}
              onChange={(value) => setCvv(value)}
              width={"90%"}
            />
          </label>
        </div>
        <Button
          title={"Continue"}
          width={"62%"}
          height={45}
          colour={"main"}
          hide={false}
        />
      </section>
    </form>
  );
}
