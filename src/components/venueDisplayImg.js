import Image from "next/image";
import Button from "../components/button";
import GetImage from "./GetImage";

export default function VenueDisplayImg({ venueId }) {
  return (
    <>
      <section className="images-container">
        <div className="images-sec-one">
          <GetImage
            width={800}
            height={580}
            venueId={venueId}
            isMain={true}
            classN={"img-1"}
          />
          {/* <Image
            className="img-1"
            aria-hidden
            src="/assets/image(1).png"
            alt="venue background"
            width={800}
            height={580}
          /> */}
        </div>
        <div className="images-sec-two">
          <GetImage
            width={520}
            height={380}
            venueId={venueId}
            isMain={false}
            index={1}
            classN={"img-2"}
          />

          <div className="images-sec-three">
            <GetImage
              width={300}
              height={300}
              venueId={venueId}
              isMain={false}
              index={2}
              classN={"img-3"}
            />
            <GetImage
              width={300}
              height={300}
              venueId={venueId}
              isMain={false}
              index={3}
              classN={"img-4"}
            />
            {/* <Image
              className="img-3"
              aria-hidden
              src="/assets/image(3).png"
              alt="venue background"
              width={300}
              height={300}
            /> */}
            {/* <Image
              className="img-4"
              aria-hidden
              src="/assets/image(4).png"
              alt="venue background"
              width={300}
              height={300}
            /> */}
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
