import Button from "../components/button";
import Input from "@/components/input";
import Image from "next/image";

export default function BookingForm() {
  return (
    <section className="booking-form">
      <div className="venue-profile">
        <Image
          className="profile-image"
          aria-hidden
          src="/assets/cateringAd.png"
          alt="profile picture"
          width={70}
          height={70}
        />
        <div className="profile-info">
          <h3>Oddfellows E.</h3>
          <p>Your Personal Event Manager from Oddfellows On The Park</p>
        </div>
      </div>
      <section className="form-inputs">
        <div>
          <label>
            Date
            <Input
              type={"Date"}
              value={"Date"}
              id={"date"}
              width={120}
              height={20}
            />
          </label>
          <label>
            People
            <Input
              type={"number"}
              value={"People"}
              id={"date"}
              width={120}
              height={20}
            />
          </label>
        </div>
        <div>
          <label>
            Time from
            <Input
              type={"time"}
              value={"Time"}
              id={"time-from"}
              width={120}
              height={20}
            />
          </label>
          <label>
            To
            <Input
              type={"time"}
              value={"time"}
              id={"time-to"}
              width={120}
              height={20}
            />
          </label>
        </div>
        <Button
          title={"Check availability"}
          width={"75%"}
          height={40}
          colour={"main"}
          hide={false}
        />
      </section>
    </section>
  );
}
