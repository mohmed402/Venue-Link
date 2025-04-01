export default async function signOutUser() {
  try {
    const response = await fetch("http://localhost:5001/auth/signout", {
      method: "POST",
      credentials: "include", // Ensure cookies (session) are sent if using Supabase auth with sessions
      headers: {
        "Content-Type": "application/json",
      },
    });

    const data = await response.json();

    if (!response.ok) throw new Error(data.error || "Failed to sign out");

    // Clear local storage and update state
    localStorage.clear();

    console.log("Signout successful");
  } catch (error) {
    console.error("Error signing out:", error.message);
  }
}
