'use client';

import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/unauthorized.css';

export default function UnauthorizedPage() {
  const router = useRouter();
  const { logout, user } = useAuth();

  const handleGoBack = () => {
    if (user?.role === 'employee') {
      router.push('/admin'); // Redirect employees to dashboard
    } else {
      router.push('/');
    }
  };

  return (
    <div className="unauthorized-container">
      <div className="unauthorized-card">
        <div className="unauthorized-icon">
          <svg width="64" height="64" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.42 0-8-3.58-8-8 0-1.85.63-3.55 1.69-4.9L16.9 18.31C15.55 19.37 13.85 20 12 20zm6.31-3.1L7.1 5.69C8.45 4.63 10.15 4 12 4c4.42 0 8 3.58 8 8 0 1.85-.63 3.55-1.69 4.9z" fill="currentColor"/>
          </svg>
        </div>
        <h1>Access Denied</h1>
        <p>
          You don&apos;t have permission to access this resource. 
          Please contact your administrator if you believe this is an error.
        </p>
        <div className="unauthorized-details">
          <p><strong>Current Role:</strong> {user?.role || 'Unknown'}</p>
          <p><strong>User:</strong> {user?.email || 'Unknown'}</p>
        </div>
        <div className="unauthorized-actions">
          <button onClick={handleGoBack} className="back-button">
            Go Back
          </button>
          <button onClick={logout} className="logout-button">
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
} 