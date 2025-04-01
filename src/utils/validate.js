// utils/validation.js
export default function validate(email, password) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

  if (!email || !password) {
    return { success: false, message: "Email and password are required." };
  }

  if (!emailRegex.test(email)) {
    return { success: false, message: "Invalid email format." };
  }

  if (!passwordRegex.test(password)) {
    return {
      success: false,
      message:
        "Password must be at least 8 characters long and include at least one letter and one number.",
    };
  }

  return { success: true };
}
