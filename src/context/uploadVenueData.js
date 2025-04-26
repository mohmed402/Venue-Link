import insertAndGetId from "./insertAndGetId";

export default async function uploadVenueData(data, userId) {
  try {
    const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
    const cateringId = await insertAndGetId(
      "catering",
      data["Catering&Drinks"] || {}
    );

    const menuId = await insertAndGetId("menu", data["MenuOffer"] || {});

    const venueTypeId = await insertAndGetId(
      "venueType",
      data["VenueType"] || {}
    );

    const facilitiesId = await insertAndGetId(
      "facilities",
      data["Facilities"] || {}
    );

    const allowedEventId = await insertAndGetId(
      "allowedEvents",
      data["AllowedEvents"] || {}
    );

    const parkingId = await insertAndGetId("parking", data["Parking"] || {});

    const locationId = await insertAndGetId("location", {
      address: data.location[0].address,
      lat: data.location[0].lat,
      lng: data.location[0].lng,
    });

    const response = await fetch(`${BASE_URL}/api/upload/venueInfo`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        data,
        userId,
        ids: {
          cateringId,
          menuId,
          venueTypeId,
          facilitiesId,
          allowedEventId,
          parkingId,
          locationId,
        },
      }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Signup failed");
    }

    if (result) {
      console.log(true, "working");
    }
    return {
      id: result.venueData,
      message: result.message,
      success: true,
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
}
