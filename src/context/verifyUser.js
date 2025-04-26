export default async function verifyUser() {
  const token = localStorage.getItem("supabase_token"); // ✅ Get stored token
  const BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
  if (!token) {
    return { success: false, message: "No token found. Please log in again." };
  }

  try {
    const response = await fetch(`${BASE_URL}/auth/user`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // ✅ Add token to headers
      },
    });

    const result = await response.json();

    if (!response.ok) {
      return { success: false, message: result.error || "Email not verified" };
    }

    return { success: true, message: "User Verified!", user: result.user };
  } catch (error) {
    return { success: false, message: error.message };
  }
}
