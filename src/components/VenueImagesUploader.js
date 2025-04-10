import { useState, useEffect } from "react";
import Image from "next/image";
import "@/styles/venueImagesUploader.css";

export default function VenueImagesUploader({ handleStepData }) {
  const [mainImage, setMainImage] = useState(null);
  const [galleryImages, setGalleryImages] = useState([]);

  useEffect(() => {
    if (!mainImage && galleryImages.length === 0) return;

    handleStepData({
      mainImage: mainImage?.file || null,
      galleryImages: galleryImages.map((img) => img.file),
    });
  }, [mainImage, galleryImages]);

  const handleMainImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const preview = URL.createObjectURL(file);
      setMainImage({ file, preview });
    }
  };

  const handleGalleryChange = (e) => {
    const files = Array.from(e.target.files);
    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setGalleryImages((prev) => [...prev, ...newImages]);
  };

  const removeMainImage = () => {
    setMainImage(null);
  };

  const removeGalleryImage = (index) => {
    const updated = [...galleryImages];
    updated.splice(index, 1);
    setGalleryImages(updated);
  };

  // 🔥 Call handleStepData whenever images change
  useEffect(() => {
    handleStepData("images", {
      mainImage,
      galleryImages,
    });
  }, [mainImage, galleryImages]);

  return (
    <section className="venue-image-container">
      <section className="sec-main">
        {mainImage ? (
          <>
            <div className="main-image-preview">
              <Image
                src={mainImage.preview}
                alt="Main venue"
                width={500}
                height={300}
                className="main-image-upload"
              />
            </div>
            <button
              className="delete-img-btn"
              onClick={() => removeMainImage()}
            >
              <Image
                src="/assets/bin.png"
                alt="main upload"
                width={25}
                height={25}
              />
            </button>
          </>
        ) : (
          <div className="venue-image-uploader">
            <Image
              src="/assets/uploadImgIcon.png"
              alt="main upload"
              width={150}
              height={150}
            />
            <input
              type="file"
              accept="image/*"
              className="input-image"
              onChange={handleMainImageChange}
            />
            <h2>Upload Main Image</h2>
          </div>
        )}
      </section>

      <section>
        {galleryImages.length > 0 ? (
          <div className="gallery-preview">
            {galleryImages.map((img, index) => (
              <div className="gallery-item" key={index}>
                <Image
                  src={img.preview}
                  alt={`Gallery ${index}`}
                  className="gallery-image"
                  width={400}
                  height={300}
                />
                <button
                  className="delete-img-btn"
                  onClick={() => removeGalleryImage(index)}
                >
                  <Image
                    src="/assets/bin.png"
                    alt="delete"
                    width={25}
                    height={25}
                  />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="venue-image-uploader gallery">
            <Image
              src="/assets/uploadImgIcon.png"
              alt="main upload"
              width={70}
              height={70}
            />
            <input
              type="file"
              accept="image/*"
              multiple
              className="input-image"
              onChange={handleGalleryChange}
            />
            <h2>Upload at least 6 images</h2>
          </div>
        )}
      </section>

      <div className="image-traker">{galleryImages.length}/18</div>

      {galleryImages.length > 0 && (
        <div className="addMore-images">
          <Image
            src="/assets/uploadImgIcon.png"
            alt="main upload"
            width={40}
            height={40}
          />
          <input
            type="file"
            accept="image/*"
            multiple
            className="input-image input-image-gal"
            onChange={handleGalleryChange}
          />
          <p>Upload more images</p>
        </div>
      )}
    </section>
  );
}
