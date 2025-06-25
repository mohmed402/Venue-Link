import { useState, useEffect } from 'react';
import { useUnifiedAuth } from '../../contexts/UnifiedAuthContext';
import styles from '../../styles/customer/ProfileSettings.module.css';

export default function ProfileSettings({ user, customer, loading, setLoading }) {
  const { updateCustomerProfile } = useUnifiedAuth();
  const [formData, setFormData] = useState({
    full_name: '',
    phone_number: '',
    preferences: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [hasChanges, setHasChanges] = useState(false);

  useEffect(() => {
    if (customer) {
      setFormData({
        full_name: customer.full_name || '',
        phone_number: customer.phone_number || '',
        preferences: customer.preferences || ''
      });
    }
  }, [customer]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setHasChanges(true);
    setError('');
    setSuccess('');
  };

  const validateForm = () => {
    if (!formData.full_name.trim()) {
      setError('Full name is required');
      return false;
    }
    if (!formData.phone_number.trim()) {
      setError('Phone number is required');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const result = await updateCustomerProfile({
        full_name: formData.full_name.trim(),
        phone_number: formData.phone_number.trim(),
        preferences: formData.preferences.trim()
      });

      if (result.success) {
        setSuccess('Profile updated successfully!');
        setHasChanges(false);
      } else {
        setError(result.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    if (customer) {
      setFormData({
        full_name: customer.full_name || '',
        phone_number: customer.phone_number || '',
        preferences: customer.preferences || ''
      });
      setHasChanges(false);
      setError('');
      setSuccess('');
    }
  };

  return (
    <div className={styles.profileSettings}>
      <div className={styles.sectionHeader}>
        <h2>Personal Information</h2>
        <p>Update your personal details and contact information</p>
      </div>

      {error && <div className={styles.errorMessage}>{error}</div>}
      {success && <div className={styles.successMessage}>{success}</div>}

      <form onSubmit={handleSubmit} className={styles.form}>
        {/* Email (Read-only) */}
        <div className={styles.formGroup}>
          <label htmlFor="email">Email Address</label>
          <input
            type="email"
            id="email"
            value={user?.email || ''}
            disabled
            className={`${styles.formInput} ${styles.disabled}`}
          />
          <div className={styles.fieldHelp}>
            Email cannot be changed. Contact support if you need to update your email address.
          </div>
        </div>

        {/* Full Name */}
        <div className={styles.formGroup}>
          <label htmlFor="full_name">Full Name *</label>
          <input
            type="text"
            id="full_name"
            name="full_name"
            value={formData.full_name}
            onChange={handleInputChange}
            className={styles.formInput}
            placeholder="Enter your full name"
            required
          />
        </div>

        {/* Phone Number */}
        <div className={styles.formGroup}>
          <label htmlFor="phone_number">Phone Number *</label>
          <input
            type="tel"
            id="phone_number"
            name="phone_number"
            value={formData.phone_number}
            onChange={handleInputChange}
            className={styles.formInput}
            placeholder="Enter your phone number"
            required
          />
        </div>

        {/* Preferences */}
        <div className={styles.formGroup}>
          <label htmlFor="preferences">Preferences & Notes</label>
          <textarea
            id="preferences"
            name="preferences"
            value={formData.preferences}
            onChange={handleInputChange}
            className={styles.formTextarea}
            rows={4}
            placeholder="Any special preferences, dietary requirements, or notes for venues..."
          />
          <div className={styles.fieldHelp}>
            This information helps venues provide better service for your events.
          </div>
        </div>

        {/* Form Actions */}
        <div className={styles.formActions}>
          <button
            type="button"
            onClick={handleReset}
            disabled={!hasChanges || loading}
            className={styles.resetButton}
          >
            Reset Changes
          </button>
          <button
            type="submit"
            disabled={!hasChanges || loading}
            className={styles.saveButton}
          >
            {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </form>

      {/* Account Information */}
      <div className={styles.accountInfo}>
        <h3>Account Information</h3>
        <div className={styles.infoGrid}>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Customer ID:</span>
            <span className={styles.infoValue}>{user?.id?.slice(0, 8)}...</span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Account Created:</span>
            <span className={styles.infoValue}>
              {new Date(customer?.created_at || user?.created_at).toLocaleDateString('en-GB')}
            </span>
          </div>
          <div className={styles.infoItem}>
            <span className={styles.infoLabel}>Last Updated:</span>
            <span className={styles.infoValue}>
              {customer?.updated_at 
                ? new Date(customer.updated_at).toLocaleDateString('en-GB')
                : 'Never'
              }
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
