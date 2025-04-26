const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
export default async function uploadVenueImages(venueId, collected) {
  const formData = new FormData();

  // Add venueId
  formData.append("venueId", venueId);

  // Add main image if exists
  if (collected.mainImage?.file) {
    formData.append("mainImage", collected.mainImage.file);
  }

  // Add gallery images
  if (Array.isArray(collected.galleryImages)) {
    collected.galleryImages.forEach((img, i) => {
      if (img?.file) {
        formData.append(`galleryImage_${i}`, img.file);
      }
    });
  }

  // Upload to server
  const response = await fetch(`${BASE_URL}/api/upload/venueImages`, {
    method: "POST",
    body: formData,
  });

  const result = await response.json();

  console.log(result);
  if (!response.ok) {
    throw new Error(result.error || "Image upload failed");
  }

  return {
    message: result.message,
    success: true,
  };
}
