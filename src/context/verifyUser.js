import { supabase } from '../lib/supabaseClient';

export default async function verifyUser() {
  try {
    const { data: { user }, error } = await supabase.auth.getUser();
    
    if (error) {
      return { success: false, message: error.message || "Authentication failed" };
    }

    if (!user) {
      return { success: false, message: "No user session found. Please log in again." };
    }

    return { success: true, message: "User Verified!", user };
  } catch (error) {
    return { success: false, message: error.message };
  }
}
