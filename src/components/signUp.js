import { useEffect, useState } from "react";
import authenticateUser from "@/context/authenticateUser";
import signOutUser from "@/context/signOutUser";
import verifyUser from "@/context/verifyUser";
import Input from "@/components/input";
import Button from "@/components/button";

import "@/styles/signUp.css";

export default function SignUp({ handleClick, setUserId }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [messageReceived, setMessageReceived] = useState("");
  const [formSent, setFormSent] = useState(false);
  const [userEmail, setUserEmail] = useState(null);
  const [isVerified, setIsVerified] = useState(false);
  const [verfiyTest, setVerfiyTest] = useState(0);

  // ✅ Check if user is already logged in
  useEffect(() => {
    // setIsLoading(true);
    const storedEmail = localStorage.getItem("user_email");
    if (storedEmail) {
      setUserEmail(storedEmail);
      handleClick(storedEmail);
    }
  }, []);

  async function handleAuth(e) {
    if (e) e.preventDefault();

    // setIsLoading(true);

    try {
      let result = await authenticateUser(email, password);
      console.log("Auth result:", result);

      if (!result || Object.keys(result).length === 0) {
        throw new Error("Empty response from authenticateUser");
      }
      setMessageReceived(result.message);
      setUserId(result?.data?.data?.user?.id);
      setFormSent(true);
      setUserEmail(email);
      handleClick(email);

      handleVerify();
    } catch (error) {
      console.error("Authentication error:", error);
    } finally {
      // setIsLoading(false);
    }
  }

  async function signOut() {
    // setIsLoading(true);
    const result = await signOutUser();
    console.log(result);
    setVerfiyTest(0);
    setFormSent(!result.success);
    setUserEmail("");
    setIsVerified(!result.success);
    // setIsLoading(false);
  }

  const handleVerify = async () => {
    // setIsLoading(true);
    if (verfiyTest > 5) signOut();
    setVerfiyTest(verfiyTest + 1);
    const response = await verifyUser();
    console.log("verify response", response);
    setIsVerified(response.success);

    // setTimeout(() => {
    //   setMessageReceived("");
    // }, 1000);

    // setIsLoading(false);
  };

  return (
    <>
      {formSent || userEmail ? (
        <>
          <h3>Welcome, {userEmail}</h3>
          <p>
            Not you?
            <span className="logout-text" onClick={signOut}>
              {" "}
              Logout
            </span>
          </p>
          <p>{messageReceived}</p>
          {!isVerified && (
            <Button
              title={"Email Verified"}
              width={191}
              height={40}
              colour={"main"}
              classN={"btn-book"}
              click={handleAuth}
            />
          )}
        </>
      ) : (
        <form className="sign-up-form" onSubmit={handleAuth}>
          <div className="input-container em">
            <label htmlFor="Email" className="input-label">
              Email
            </label>
            <Input
              type="text"
              value={email}
              id="Email"
              classN="email-input input-field"
              onChange={(value) => setEmail(value)}
              required={true}
            />
          </div>
          <div className="input-container em">
            <label htmlFor="Password" className="input-label">
              Password
            </label>
            <Input
              type="password"
              id="Password"
              classN="email-input input-field"
              onChange={(value) => setPassword(value)}
              required={true}
            />
          </div>
          <Button
            title={"Sign-in"}
            width={"100%"}
            height={40}
            colour={"main"}
            classN={"btn-book"}
            hide={false}
          />
        </form>
      )}
    </>
  );
}
