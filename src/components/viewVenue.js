import getToReview from "@/context/getToReview";
import Button from "@/components/button";
import "@/styles/viewVenue.css";
import Image from "next/image";
import React, { useEffect, useState } from "react";
import Loader from "./loader";

export default function ViewVenue({
  inquirId,
  isReview,
  setIsReview,
  dataHolder,
}) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [imgData, setImgData] = useState([]);
  const [slide, setSlide] = useState(0);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const getImgRes = await getToReview("imageById", inquirId);

        if (getImgRes?.data) {
          setImgData(getImgRes.data);
          setData(dataHolder);
          setLoading(false);
        } else {
          console.error("No data received from getToReview");
        }
      } catch (err) {
        console.error("Error fetching data:", err.message);
      }
    }

    if (inquirId) {
      fetchData();
    }
  }, [inquirId, dataHolder]);

  return (
    <section className="viewVenue-container">
      <h1>Review Venue</h1>
      {loading && <Loader />}
      {!loading && (
        <>
          <section className="images-container">
            {imgData.length === 0 ? (
              <p>No images uploaded yet for this venue.</p>
            ) : (
              imgData.map((img) => (
                <div key={img.images_id} className="image-wrapper">
                  <p
                    className={`${
                      img.is_main ? "main" : "gallary"
                    }-text-review`}
                  >
                    {img.is_main ? "Main" : "Gallary"}
                  </p>
                  <Image
                    src={img.image_url}
                    alt="Venue image"
                    width={200}
                    height={200}
                    className={`image ${img.is_main ? "main" : "gallary"}`}
                    click={() => setSlide(slide + 1)}
                  />
                </div>
              ))
            )}
          </section>
          {slide == 0 && (
            <section className="main-content-review">
              <h1>{data[0]?.venue_name}</h1>
              <h2>{data[0]?.venue_title}</h2>
              <h2>{data[0]?.about}</h2>
              <div className="sec-arrow">
                <table>
                  <thead>
                    <tr>
                      <th>Type</th>
                      <th>Size</th>
                      <th>Price</th>
                      <th>Capacity</th>
                      <th>Country</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((dataInfo) => (
                      <Row
                        key={dataInfo.venue_id}
                        type={dataInfo.venue_place_type}
                        size={dataInfo.venue_place_size}
                        price={dataInfo.venue_price}
                        capacity={dataInfo.venue_capacity}
                        location={`${dataInfo.country} ${dataInfo.city}`}
                      />
                    ))}
                  </tbody>
                </table>
                <Image
                  src={"/assets/next.png"}
                  alt="Venue image"
                  width={100}
                  height={100}
                  className="arrow"
                  onClick={() => setSlide(slide + 1)}
                />
              </div>
            </section>
          )}
          {slide == 1 && (
            <section className="main-content-review">
              <h1>{data[0]?.venue_name}</h1>
              <h2>{data[0]?.venue_title}</h2>
              <h2>{data[0]?.about}</h2>
              <div className="sec-arrow">
                <table>
                  <thead>
                    <tr>
                      <th>Country</th>
                      <th>Size</th>
                      <th>Type</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((dataInfo) => (
                      <Row
                        key={dataInfo.venue_id}
                        type={dataInfo.venue_place_type}
                        size={dataInfo.venue_place_size}
                        location={`${dataInfo.country} ${dataInfo.city}`}
                      />
                    ))}
                  </tbody>
                </table>
                <Image
                  src={"/assets/next.png"}
                  alt="Venue image"
                  width={100}
                  height={100}
                  className="arrow"
                  onClick={() => setSlide(slide - 1)}
                />
              </div>
            </section>
          )}
          <section>
            <Button
              classN={"btn-mobile"}
              title={"close"}
              width={100}
              height={40}
              colour={"main"}
              action={setIsReview}
              actionState={isReview}
            />
          </section>
        </>
      )}
    </section>
  );
}
function Row({ type, size, price, capacity, location }) {
  return (
    <tr>
      <td>{type}</td>
      <td>{size}</td>
      <td>{price}</td>
      <td>{capacity}</td>
      <td>{location}</td>
    </tr>
  );
}
