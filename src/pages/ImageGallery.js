import { useState, useEffect, useRef } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import Button from "@/components/button";
import getToReview from "@/context/getToReview";

import "../styles/ImageGallery.css";

// const images = [
//   "/assets/image(1).png",
//   "/assets/image(2).png",
//   "/assets/image(3).png",
//   "/assets/image(4).png",
// ];

export default function ImageGallery() {
  const [images, setImages] = useState();
  const [selectedIndex, setSelectedIndex] = useState(null);
  const [imageSize, setImageSize] = useState({ width: 1000, height: 600 });

  const touchStartX = useRef(0);
  const touchEndX = useRef(0);
  const direction = useRef(0); // 1 = next, -1 = prev
  const lastScrollY = useRef(0);

  useEffect(() => {
    async function fetchData() {
      try {
        const storedId = localStorage.getItem("venid");
        if (storedId) {
          const getImgRes = await getToReview("imageById", storedId);

          if (getImgRes?.data) {
            setImages(getImgRes.data);
          } else {
            console.error("No data received from getToReview");
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err.message);
      }
    }

    fetchData();
  }, []);

  // Close lightbox when scrolling down
  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      if (selectedIndex !== null && currentScrollY > lastScrollY.current + 30) {
        setSelectedIndex(null);
      }
      lastScrollY.current = currentScrollY;
    };

    if (selectedIndex !== null) {
      window.addEventListener("scroll", handleScroll);
    }

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [selectedIndex]);

  const handleImageLoad = (event) => {
    setImageSize({
      width: event.target.naturalWidth,
      height: event.target.naturalHeight,
    });
  };

  const handleNext = () => {
    direction.current = 1;
    setSelectedIndex((prevIndex) => (prevIndex + 1) % images.length);
  };

  const handlePrev = () => {
    direction.current = -1;
    setSelectedIndex((prevIndex) =>
      prevIndex === 0 ? images.length - 1 : prevIndex - 1
    );
  };

  // Handle touch events for mobile swipe navigation inside lightbox
  const handleTouchStart = (e) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchMove = (e) => {
    touchEndX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = () => {
    const diff = touchStartX.current - touchEndX.current;

    if (diff > 50) {
      handleNext(); // Swipe left → Next image
    } else if (diff < -50) {
      handlePrev(); // Swipe right → Previous image
    }
  };

  return (
    <div className="gallery">
      <Button
        title={`Close`}
        width={150}
        height={47}
        colour={"main"}
        hide={false}
        page={"venue"}
      />
      {/* Image Grid */}
      <div className="grid">
        {images?.map((src, index) => (
          <motion.div
            key={index}
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.3 }}
          >
            <Image
              src={src.image_url}
              alt={`Gallery Image ${index + 1}`}
              width={600}
              height={300}
              className="image"
              onClick={() => setSelectedIndex(index)}
            />
          </motion.div>
        ))}
      </div>

      {/* Lightbox View */}
      <AnimatePresence>
        {selectedIndex !== null && (
          <motion.div
            className="lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
          >
            <button className="close" onClick={() => setSelectedIndex(null)}>
              ✖
            </button>
            <button className="prev" onClick={handlePrev}>
              ◀
            </button>

            <motion.div
              key={selectedIndex}
              initial={{ x: direction.current * 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -direction.current * 300, opacity: 0 }}
              transition={{ type: "spring", stiffness: 100, damping: 20 }}
            >
              <Image
                src={images[selectedIndex].image_url}
                alt="Selected"
                width={imageSize.width}
                height={imageSize.height}
                className="fullImage"
                onLoad={handleImageLoad}
                style={{ width: "100%", minHeight: "500px" }} // Ensures aspect ratio is maintained
              />
            </motion.div>

            <button className="next" onClick={handleNext}>
              ▶
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
