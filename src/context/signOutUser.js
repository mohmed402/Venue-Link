import { supabase } from '../lib/supabaseClient';

export default async function signOutUser() {
  try {
    const { error } = await supabase.auth.signOut();
    
    if (error) throw new Error(error.message || "Failed to sign out");

    // No need to clear localStorage - Supabase handles cookies automatically
    console.log("Signout successful");
    return {
      success: true,
      message: "Signout successful",
    };
  } catch (error) {
    console.error("Error signing out:", error.message);
    return {
      success: false,
      message: "Error signing out",
    };
  }
}
