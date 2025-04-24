import { useEffect, useState } from "react";
import authenticateUser from "@/context/authenticateUser";
import signOutUser from "@/context/signOutUser";
import verifyUser from "@/context/verifyUser";
import Input from "@/components/input";
import Button from "@/components/button";

export default function EmailInput({ setIsToken, setIsLoading }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [messageReceived, setMessageReceived] = useState("");

  const [formSent, setFormSent] = useState(false);
  const [userEmail, setUserEmail] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [serverResText, setServerResText] = useState("");

  // ✅ Check if user is already logged in
  useEffect(() => {
    setIsLoading(true);
    const storedEmail = localStorage.getItem("user_email");
    if (storedEmail) {
      setUserEmail(storedEmail);
      setIsToken(true);
    }
    setIsLoading(false);
  }, [setIsLoading, setIsToken]);

  useEffect(() => {
    console.log("Updated message:", messageReceived); // Logs the correct value
  }, [messageReceived]);

  useEffect(() => {
    console.log("Updated test:", serverResText); // Logs the correct value
  }, [serverResText]);

  async function handleAuth(e) {
    e.preventDefault();

    try {
      let result = await authenticateUser(email, password, setServerResText);
      // setIsLoading(true);
      console.log("Auth result:", result);
      console.log("Auth 3 result:", serverResText);

      if (!result || Object.keys(result).length === 0) {
        throw new Error("Empty response from authenticateUser");
      }

      setMessageReceived(result.message);
      setFormSent(true);

      if (result.success) {
        setUserEmail(email);
        setIsToken(true);
        setIsVerified(true);
      }
    } catch (error) {
      console.error("Authentication error:", error);
      setServerResText("An error occurred. Please try again.");
    } finally {
      // setIsLoading(false);
    }
  }

  async function signOut() {
    setIsLoading(true);
    const result = await signOutUser();
    // setMessageReceived(result);
    setUserEmail(null);
    setIsToken(false);
    setIsVerified(false);
    setIsLoading(false);
  }

  const handleVerify = async () => {
    setIsLoading(true);
    const response = await verifyUser();

    setIsVerified(response.success);
    // setMessageReceived(response);

    setIsLoading(false);
  };

  return (
    <>
      {formSent || userEmail ? (
        <>
          <h3>Welcome, {userEmail}</h3>
          <p className="logout-text" onClick={signOut}>
            Not you? Logout
          </p>
          <p>{messageReceived}</p>
        </>
      ) : (
        <form onSubmit={handleAuth}>
          <div className="input-container em">
            <Input
              type="text"
              value={email}
              id="Email"
              classN="email-input input-field"
              onChange={(value) => setEmail(value)}
              required={true}
            />
            <label htmlFor="Email" className="input-label">
              Email
            </label>
          </div>
          <div className="input-container em">
            <Input
              type="password"
              value={password}
              id="Password"
              classN="email-input input-field"
              onChange={(value) => setPassword(value)}
              required={true}
            />
            <label htmlFor="Password" className="input-label">
              Password
            </label>
          </div>
          <Button
            title={"Continue"}
            width={"100%"}
            height={40}
            colour={"main"}
            classN={"btn-book"}
            hide={false}
          />
        </form>
      )}

      {isVerified ? (
        <Button
          title={"Email Verified"}
          width={"100%"}
          height={40}
          colour={"main"}
          classN={"btn-book"}
          click={handleVerify}
        />
      ) : null}
    </>
  );
}
