import { useState } from 'react';
import { useUnifiedAuth } from '../../contexts/UnifiedAuthContext';
import CustomerSidebar from './CustomerSidebar';
import CustomerHeader from './CustomerHeader';
import MobileNavigation from './MobileNavigation';
import styles from '../../styles/customer/CustomerLayout.module.css';
import '../../styles/customer/CustomerGlobal.css';

export default function CustomerLayout({ children, currentPage = 'dashboard' }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { customer, loading } = useUnifiedAuth();

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.loadingSpinner}>
          <div className={styles.spinner}></div>
          <p>Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`${styles.layout} customer-area`}>
      {/* Sidebar */}
      <CustomerSidebar 
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        currentPage={currentPage}
      />

      {/* Main Content Area */}
      <div className={styles.mainContent}>
        {/* Header */}
        <CustomerHeader 
          onMenuClick={() => setSidebarOpen(true)}
          customer={customer}
        />

        {/* Page Content */}
        <main className={styles.pageContent}>
          {children}
        </main>
      </div>

      {/* Mobile Navigation */}
      <MobileNavigation />

      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div
          className={styles.overlay}
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
