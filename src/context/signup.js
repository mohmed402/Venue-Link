import { supabase } from '../lib/supabaseClient';

async function signup(e, email, password) {
  e.preventDefault();
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/book`
      }
    });

    if (error) {
      throw new Error(error.message);
    }

    // No need to store tokens - Supabase automatically handles cookies
    return {
      success: true,
      message: "Signup successful! Verify your email to continue",
      data
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export default signup;
