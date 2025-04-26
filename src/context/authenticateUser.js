import validate from "../utils/validate";
const BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5001";

export default async function authenticateUser(email, password) {
  try {
    const validation = validate(email, password);
    if (!validation.success) return validation;

    // Step 1: Ensure session validity before assuming user is signed in
    const storedToken = localStorage.getItem("supabase_token");
    if (storedToken) {
      // Optionally verify the token with an API call before assuming it's valid
      console.log("User already signed in.");
      return { success: true, message: "Already signed in." };
    }

    // Step 2: Attempt Sign-in
    console.log("Attempting sign-in...");
    const signInResponse = await fetch(`${BASE_URL}/auth/signin`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const signInData = await signInResponse.json();

    if (signInResponse.ok && signInData?.data?.session?.access_token) {
      console.log("✅ Sign-in successful!");
      localStorage.setItem(
        "supabase_token",
        signInData.data.session.access_token
      );
      localStorage.setItem("user_email", email);
      return {
        success: true,
        message: "Sign-in successful!",
        data: signInData,
      };
    }

    //  Step 3: Handle Login Failure & Attempt Signup
    if (signInData?.error) {
      console.log("❌ Sign-in failed:", signInData.error);

      if (signInData.error === "Invalid login credentials") {
        console.log("🔍 User not found, attempting sign-up...");

        const signUpResponse = await fetch(
          `${BASE_URL}/auth/signup`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email, password }),
          }
        );

        const signUpData = await signUpResponse.json();
        console.log("this: ", signUpData);
        if (signUpResponse.ok && !signUpData?.error) {
          console.log("✅ Signup successful! Verification email sent.");

          return {
            success: true,
            message: "Signup successful! Verify your email to continue.",
            data: signUpData,
          };
        } else {
          console.error("❌ Signup failed:", signUpData.error);
          return {
            success: false,
            message: signUpData.error || "Signup failed.",
          };
        }
      }
    }

    return { success: false, message: signInData.error || "Sign-in failed." };
  } catch (error) {
    console.error("🚨 Authentication Error:", error.message);
    return {
      success: false,
      message: error.message || "An unexpected error occurred.",
    };
  }
}
