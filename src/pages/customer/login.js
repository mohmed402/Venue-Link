import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { UnifiedAuthProvider, useUnifiedAuth } from '../../contexts/UnifiedAuthContext';
import styles from '../../styles/customer/CustomerAuth.module.css';
import '../../styles/customer/CustomerGlobal.css';

function CustomerLoginForm() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useUnifiedAuth();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push('/customer/dashboard');
    }
  }, [user, router]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const result = await login(identifier, password);

    if (result.success) {
      // Ensure customer users go to customer dashboard
      if (result.userType === 'customer') {
        router.push('/customer/dashboard');
      } else {
        router.push(result.redirectTo);
      }
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className={`${styles.authContainer} customer-area`}>
      <div className={styles.authCard}>
        <div className={styles.authHeader}>
          <div className={styles.logo}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9,22 9,12 15,12 15,22"/>
            </svg>
          </div>
          <h1>Welcome Back</h1>
          <p>Sign in to your customer account</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.authForm}>
          {error && (
            <div className={styles.errorMessage}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="15" y1="9" x2="9" y2="15"/>
                <line x1="9" y1="9" x2="15" y2="15"/>
              </svg>
              {error}
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="identifier">Email or Phone Number</label>
            <input
              type="text"
              id="identifier"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Enter your email or phone number"
              required
              disabled={loading}
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="password">Password</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              required
              disabled={loading}
            />
          </div>

          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? (
              <>
                <div className={styles.spinner}></div>
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className={styles.authDivider}>
          <span>or</span>
        </div>

        <div className={styles.authFooter}>
          <p>
            Don't have an account?{' '}
            <Link href="/customer/signup" className={styles.authLink}>
              Create one here
            </Link>
          </p>
          <p>
            <Link href="/book" className={styles.authLink}>
              Continue as guest
            </Link>
          </p>
          <p>
            <Link href="/login" className={styles.authLink}>
              Staff/Admin Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function CustomerLoginPage() {
  return (
    <UnifiedAuthProvider>
      <CustomerLoginForm />
    </UnifiedAuthProvider>
  );
}
