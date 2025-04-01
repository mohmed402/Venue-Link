async function signup(e, email, password) {
  e.preventDefault();

  try {
    const response = await fetch("http://localhost:5001/auth/signup", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Signup failed");
    }

    if (data.session) {
      localStorage.setItem("supabase_token", data.session.access_token);
    }
    return {
      success: true,
      message: "Signup successful! Verify your email to continue",
    };
  } catch (error) {
    return { success: false, message: error.message };
  }
}

export default signup;
