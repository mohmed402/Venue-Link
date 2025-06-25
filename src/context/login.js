import { supabase } from '../lib/supabaseClient';

async function login(e, email, password) {
  e.preventDefault();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, message: error.message };
  }

  // No need to store tokens - Supabase automatically handles cookies
  return { success: true, message: "Login successful!" };
}

export default login;
