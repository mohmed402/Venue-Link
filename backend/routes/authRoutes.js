const express = require("express");
const router = express.Router();
const supabase = require("../supabaseClient");

// 📌 **Sign Up User**
router.post("/signup", async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: { emailRedirectTo: "http://localhost:3000/book" }, // Update with your frontend URL
  });

  if (error) return res.status(400).json({ error: error.message });
  res.json({
    message: "Signup successful. Check your email for verification.",
    data,
  });
});

// 📌 **Sign In User**
router.post("/signin", async (req, res) => {
  const { email, password } = req.body;

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: "Signin successful", data });
});

// 📌 **Get Current User**
router.get("/user", async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1]; // Extract Bearer token

  if (!token) {
    return res.status(401).json({ error: "Unauthorized: No token provided" });
  }

  const { data, error } = await supabase.auth.getUser(token);

  if (error) return res.status(400).json({ error: error.message });

  res.json({ user: data.user });
});

module.exports = router;

// 📌 **Sign Out User**
router.post("/signout", async (req, res) => {
  const { error } = await supabase.auth.signOut();
  if (error) return res.status(400).json({ error: error.message });
  res.json({ message: "Signout successful" });
});

// return { redirect: { destination: "/signin", permanent: false } };
