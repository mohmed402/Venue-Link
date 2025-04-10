import getToReview from "@/context/getToReview";
import Image from "next/image";
import React, { useEffect, useState } from "react";

export default function GetImage({
  width,
  height,
  venueId,
  isMain,
  classN,
  index = 0,
}) {
  const [imgData, setImgData] = useState([]);
  const [mainImg, setMainImg] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        const getImgRes = await getToReview("imageById", venueId);

        if (getImgRes?.data) {
          setImgData(getImgRes.data);

          setMainImg(getImgRes.data[0]);
          console.log(getImgRes.data[0]?.image_url);
          console.log("Sorted images:", mainImg);
        } else {
          console.error("No data received from getToReview");
        }
      } catch (err) {
        console.error("Error fetching data:", err.message);
      }
    }

    if (venueId) {
      fetchData();
    }
  }, [venueId]);
  return (
    <Image
      src={isMain ? mainImg.image_url : imgData[index]?.image_url}
      alt="venue background"
      width={width}
      height={height}
      className={classN}
    />
  );
}
