'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { checkPermission } from '../utils/roles';

export default function ProtectedRoute({ children, requiredRole = null, requiredPermission = null }) {
  const { user, loading, isAuthenticated, userRole } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // Not authenticated - redirect to login
      if (!isAuthenticated) {
        router.push('/login');
        return;
      }

      // Check role requirement
      if (requiredRole && userRole !== requiredRole) {
        // If user doesn't have the required role, show access denied
        router.push('/admin?error=access_denied');
        return;
      }

      // Check permission requirement
      if (requiredPermission && !checkPermission(userRole, requiredPermission)) {
        router.push('/admin?error=access_denied');
        return;
      }
    }
  }, [loading, isAuthenticated, user, userRole, router, requiredRole, requiredPermission]);

  // Show loading while checking authentication
  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{
          width: '40px',
          height: '40px',
          border: '4px solid #f3f3f3',
          borderTop: '4px solid #007bff',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p>Checking authentication...</p>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  // Don't render children if not authenticated or insufficient permissions
  if (!isAuthenticated) {
    return null;
  }

  if (requiredRole && userRole !== requiredRole) {
    return null;
  }

  if (requiredPermission && !checkPermission(userRole, requiredPermission)) {
    return null;
  }

  // User is authenticated and has required permissions
  return children;
} 