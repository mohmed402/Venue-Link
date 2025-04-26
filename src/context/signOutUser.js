export default async function signOutUser() {
  try {
    const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";
    const response = await fetch(`${BASE_URL}/auth/signout`, {
      method: "POST",
      credentials: "include", // Ensure cookies (session) are sent if using Supabase auth with sessions
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();
    console.log(data);
    if (!response.ok) throw new Error(data.error || "Failed to sign out");

    // Clear local storage and update state
    localStorage.clear();

    return {
      success: true,
      message: "Signout successful",
    };
    console.log("Signout successful");
  } catch (error) {
    return {
      success: false,
      message: "Error signing out",
    };
    console.error("Error signing out:", error.message);
  }
}
