"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useUnifiedAuth } from "../../contexts/UnifiedAuthContext";
import Link from "next/link";
import "../../styles/login.css";

export default function UnifiedLoginPage() {
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useUnifiedAuth();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const result = await login(identifier, password);

    if (result.success) {
      // Route based on user type
      router.push(result.redirectTo);
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9,22 9,12 15,12 15,22"/>
            </svg>
          </div>
          <h1>Venue Link</h1>
          <p>Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          {error && <div className="error-message">{error}</div>}

          <div className="form-group">
            <label htmlFor="identifier">Email or Phone Number</label>
            <input
              type="text"
              id="identifier"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              required
              placeholder="Enter your email or phone number"
              className="form-input"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="Enter your password"
              className="form-input"
            />
          </div>

          <button type="submit" className="login-button" disabled={loading}>
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="login-divider">
          <span>or</span>
        </div>

        <div className="login-footer">
          <div className="customer-signup">
            <p>New customer?</p>
            <Link href="/customer/signup" className="signup-link">
              Create an account
            </Link>
          </div>
          
          <div className="guest-access">
            <Link href="/book" className="guest-link">
              Continue as guest
            </Link>
          </div>
        </div>

        <div className="login-info">
          <p><strong>Access Information:</strong></p>
          <div className="access-types">
            <div className="access-type">
              <strong>Staff/Admin:</strong> Management dashboard access
            </div>
            <div className="access-type">
              <strong>Customers:</strong> Booking management and profile
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
