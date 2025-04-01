import Image from "next/image";

export default function PaymentTypes({ paymentTypeSetter, paymentTypeValue }) {
  function openPaymentOption(type) {
    if (type == paymentTypeValue) {
      paymentTypeSetter("");
    } else {
      paymentTypeSetter(type);
    }
  }

  return (
    <section className="payment-types">
      <div
        onClick={() => openPaymentOption("visa")}
        className={paymentTypeValue == "visa" ? "visa" : ""}
      >
        <Image
          className="company-logo"
          aria-hidden
          src="/assets/visaMasterard.svg"
          alt="visa logo"
          width={170}
          height={50}
          priority
        />
      </div>
      <div
        onClick={() => openPaymentOption("paypal")}
        className={paymentTypeValue == "paypal" ? "paypal" : ""}
      >
        <Image
          className="company-logo"
          aria-hidden
          src="/assets/PayPal.Logowebp.webp"
          alt="PayPal logo"
          width={170}
          height={50}
          priority
        />
      </div>
    </section>
  );
}
