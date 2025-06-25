import { useState, useEffect } from 'react';
import { useUnifiedAuth } from '../../contexts/UnifiedAuthContext';
import ProfileSettings from './ProfileSettings';
import SecuritySettings from './SecuritySettings';
import styles from '../../styles/customer/CustomerProfile.module.css';

export default function CustomerProfile() {
  const { user, customer } = useUnifiedAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [loading, setLoading] = useState(false);

  return (
    <div className={styles.profileContainer}>
      <div className={styles.header}>
        <h1>Profile Settings</h1>
        <p>Manage your account information and preferences</p>
      </div>

      {/* Profile Overview */}
      <div className={styles.profileOverview}>
        <div className={styles.avatar}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
        </div>
        <div className={styles.profileInfo}>
          <h2>{customer?.full_name || 'Customer'}</h2>
          <p>{user?.email}</p>
          <span className={styles.memberSince}>
            Member since {new Date(customer?.created_at || user?.created_at).toLocaleDateString('en-GB', {
              year: 'numeric',
              month: 'long'
            })}
          </span>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className={styles.tabNavigation}>
        <button
          className={`${styles.tab} ${activeTab === 'profile' ? styles.active : ''}`}
          onClick={() => setActiveTab('profile')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
            <circle cx="12" cy="7" r="4"/>
          </svg>
          Personal Information
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'security' ? styles.active : ''}`}
          onClick={() => setActiveTab('security')}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
            <circle cx="12" cy="16" r="1"/>
            <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
          </svg>
          Security
        </button>
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {activeTab === 'profile' && (
          <ProfileSettings 
            user={user}
            customer={customer}
            loading={loading}
            setLoading={setLoading}
          />
        )}
        
        {activeTab === 'security' && (
          <SecuritySettings 
            user={user}
            loading={loading}
            setLoading={setLoading}
          />
        )}
      </div>
    </div>
  );
}
