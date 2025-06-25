import validate from "../utils/validate";
import { supabase } from '../lib/supabaseClient';

export default async function authenticateUser(email, password) {
  try {
    const validation = validate(email, password);
    if (!validation.success) return validation;

    // Step 1: Check if user is already signed in
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      console.log("User already signed in.");
      return { success: true, message: "Already signed in." };
    }

    // Step 2: Attempt Sign-in
    console.log("Attempting sign-in...");
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (!signInError && signInData?.session) {
      console.log("✅ Sign-in successful!");
      return {
        success: true,
        message: "Sign-in successful!",
        data: signInData,
      };
    }

    // Step 3: Handle Login Failure & Attempt Signup
    if (signInError) {
      console.log("❌ Sign-in failed:", signInError.message);

      if (signInError.message === "Invalid login credentials") {
        console.log("🔍 User not found, attempting sign-up...");

        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/book`
          }
        });

        if (!signUpError) {
          console.log("✅ Signup successful! Verification email sent.");
          return {
            success: true,
            message: "Signup successful! Verify your email to continue.",
            data: signUpData,
          };
        } else {
          console.error("❌ Signup failed:", signUpError.message);
          return {
            success: false,
            message: signUpError.message || "Signup failed.",
          };
        }
      }
    }

    return { success: false, message: signInError?.message || "Sign-in failed." };
  } catch (error) {
    console.error("🚨 Authentication Error:", error.message);
    return {
      success: false,
      message: error.message || "An unexpected error occurred.",
    };
  }
}
