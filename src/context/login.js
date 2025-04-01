async function login(e, email, password) {
  e.preventDefault();

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    return { success: false, message: error.message };
  }

  // ✅ Store session token in localStorage
  if (data.session) {
    localStorage.setItem("supabase_token", data.session.access_token);
  }

  return { success: true, message: "Login successful!" };
}

export default login;
