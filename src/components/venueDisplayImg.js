import Image from "next/image";
import Button from "../components/button";

export default function VenueDisplayImg() {
  return (
    <>
      <section className="images-container">
        <div className="images-sec-one">
          <Image
            className="img-1"
            aria-hidden
            src="/assets/image(1).png"
            alt="venue background"
            width={800}
            height={580}
          />
        </div>
        <div className="images-sec-two">
          <Image
            className="img-2"
            aria-hidden
            src="/assets/image(2).png"
            alt="venue background"
            width={520}
            height={380}
          />
          <div className="images-sec-three">
            <Image
              className="img-3"
              aria-hidden
              src="/assets/image(3).png"
              alt="venue background"
              width={300}
              height={300}
            />
            <Image
              className="img-4"
              aria-hidden
              src="/assets/image(4).png"
              alt="venue background"
              width={300}
              height={300}
            />
          </div>
        </div>
      </section>
      <Button
        classN={"view-pic-btn"}
        title={`See All ${15} photos`}
        width={150}
        height={47}
        colour={"main"}
        hide={false}
        page={"ImageGallery"}
      />
    </>
  );
}
