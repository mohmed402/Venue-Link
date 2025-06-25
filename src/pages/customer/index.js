import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { UnifiedAuthProvider, useUnifiedAuth } from '../../contexts/UnifiedAuthContext';

function CustomerIndexRedirect() {
  const { user, loading } = useUnifiedAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (user) {
        router.replace('/customer/dashboard');
      } else {
        router.replace('/customer/login');
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center', 
        minHeight: '100vh',
        fontFamily: 'Montserrat, serif'
      }}>
        <div style={{ textAlign: 'center', color: '#800200' }}>
          <div style={{
            width: '40px',
            height: '40px',
            border: '4px solid #f3f3f3',
            borderTop: '4px solid #800200',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite',
            margin: '0 auto 16px'
          }}></div>
          <p>Loading...</p>
        </div>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return null;
}

export default function CustomerIndexPage() {
  return (
    <UnifiedAuthProvider>
      <CustomerIndexRedirect />
    </UnifiedAuthProvider>
  );
}
