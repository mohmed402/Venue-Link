export default async function insertAndGetId(tableName, dataObj) {
  try {
    const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
    const response = await fetch(
      `${BASE_URL}/api/upload/insertTable`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ tableName, dataObj }),
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Insert failed");
    }
    console.log("thos", result.id);
    return result.id;
  } catch (error) {
    return error.message;
  }
}
