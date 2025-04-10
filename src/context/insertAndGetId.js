export default async function insertAndGetId(tableName, dataObj) {
  try {
    const response = await fetch(
      "http://localhost:5001/api/upload/insertTable",
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
