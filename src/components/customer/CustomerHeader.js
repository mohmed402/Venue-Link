import { useState } from 'react';
import { useRouter } from 'next/router';
import { useUnifiedAuth } from '../../contexts/UnifiedAuthContext';
import styles from '../../styles/customer/CustomerHeader.module.css';

export default function CustomerHeader({ onMenuClick, customer }) {
  const [showUserMenu, setShowUserMenu] = useState(false);
  const { logout } = useUnifiedAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.push('/customer/login');
  };

  return (
    <header className={styles.header}>
      {/* Mobile Menu Button */}
      <button 
        className={styles.menuButton}
        onClick={onMenuClick}
        aria-label="Open menu"
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <line x1="3" y1="6" x2="21" y2="6"/>
          <line x1="3" y1="12" x2="21" y2="12"/>
          <line x1="3" y1="18" x2="21" y2="18"/>
        </svg>
      </button>

      {/* Page Title */}
      <div className={styles.pageTitle}>
        <h1>Customer Dashboard</h1>
      </div>

      {/* Header Actions */}
      <div className={styles.headerActions}>
        {/* Notifications */}
        <button className={styles.notificationButton}>
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"/>
          </svg>
          <span className={styles.notificationBadge}>3</span>
        </button>

        {/* User Menu */}
        <div className={styles.userMenu}>
          <button 
            className={styles.userButton}
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className={styles.userAvatar}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                <circle cx="12" cy="7" r="4"/>
              </svg>
            </div>
            <span className={styles.userName}>{customer?.full_name || 'Customer'}</span>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="6,9 12,15 18,9"/>
            </svg>
          </button>

          {showUserMenu && (
            <div className={styles.userDropdown}>
              <div className={styles.userInfo}>
                <p className={styles.userNameFull}>{customer?.full_name || 'Customer'}</p>
                <p className={styles.userEmail}>{customer?.email || 'customer@example.com'}</p>
              </div>
              <div className={styles.dropdownDivider}></div>
              <button 
                className={styles.dropdownItem}
                onClick={() => {
                  setShowUserMenu(false);
                  router.push('/customer/profile');
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                Profile Settings
              </button>
              <button 
                className={styles.dropdownItem}
                onClick={() => {
                  setShowUserMenu(false);
                  router.push('/customer/bookings');
                }}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                  <line x1="16" y1="2" x2="16" y2="6"/>
                  <line x1="8" y1="2" x2="8" y2="6"/>
                  <line x1="3" y1="10" x2="21" y2="10"/>
                </svg>
                My Bookings
              </button>
              <div className={styles.dropdownDivider}></div>
              <button 
                className={`${styles.dropdownItem} ${styles.logoutItem}`}
                onClick={handleLogout}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/>
                  <polyline points="16,17 21,12 16,7"/>
                  <line x1="21" y1="12" x2="9" y2="12"/>
                </svg>
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Overlay to close user menu */}
      {showUserMenu && (
        <div 
          className={styles.menuOverlay}
          onClick={() => setShowUserMenu(false)}
        />
      )}
    </header>
  );
}
