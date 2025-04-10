export default async function getToReview(type, venueId = null, status = null) {
  try {
    const url = new URL(`http://localhost:5001/api/data/${type}`);

    if (venueId) {
      url.searchParams.append("venueId", venueId);
    }

    if (status !== null) {
      url.searchParams.append("status", status);
    }

    const response = await fetch(url.toString(), {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Insert failed");
    }

    return result;
  } catch (error) {
    return error.message;
  }
}
