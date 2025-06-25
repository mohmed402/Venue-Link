'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useUnifiedAuth } from '../contexts/UnifiedAuthContext';

export default function ProtectedRoute({ children, requiredRole = 'staff' }) {
  const { user, loading, userType, userRole } = useUnifiedAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user || userType !== 'staff') {
        router.push('/login');
      } else if (requiredRole && userRole && !hasRequiredRole(userRole, requiredRole)) {
        router.push('/unauthorized');
      }
    }
  }, [user, loading, userType, userRole, requiredRole, router]);

  const hasRequiredRole = (currentRole, required) => {
    const roleHierarchy = {
      'admin': 3,
      'manager': 2, 
      'staff': 1
    };
    
    return roleHierarchy[currentRole] >= roleHierarchy[required];
  };

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

  if (!user || userType !== 'staff') {
    return null; // Will redirect in useEffect
  }

  if (requiredRole && userRole && !hasRequiredRole(userRole, requiredRole)) {
    return null; // Will redirect in useEffect
  }

  return children;
} 