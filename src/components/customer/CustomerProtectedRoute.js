import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useUnifiedAuth } from '../../contexts/UnifiedAuthContext';

export default function CustomerProtectedRoute({ children }) {
  const { user, loading, userType } = useUnifiedAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || userType !== 'customer')) {
      router.push('/login');
    }
  }, [user, loading, userType, router]);

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || userType !== 'customer') {
    return null; // Will redirect in useEffect
  }

  return children;
}
