'use client'

import { useState } from 'react'
import styles from '@/styles/EmployeeBooking/AdminControls.module.css'

const BOOKING_STATUSES = [
  { value: 'draft', label: 'Draft' },
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'cancelled', label: 'Cancelled' }
];

export default function AdminControls() {
  const [status, setStatus] = useState('draft');
  const [notes, setNotes] = useState('');
  const [overrides, setOverrides] = useState({
    availability: false,
    deposit: false
  });

  const handleFileUpload = (e) => {
    // Handle file upload logic here
    console.log('Files:', e.target.files);
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.titleContainer}>
          <span className={styles.icon}>🔧</span>
          <h2 className={styles.title}>Administrative Controls</h2>
          <span className={styles.badge}>Manager</span>
        </div>
      </div>

      <div className={styles.managedBy}>
        <span className={styles.userIcon}>👤</span>
        Managed by <span className={styles.managerName}>John Smith</span>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>
          <span>📋</span> Booking Status
        </h3>
        <select 
          className={styles.statusButton}
          value={status}
          onChange={(e) => setStatus(e.target.value)}
        >
          {BOOKING_STATUSES.map(status => (
            <option key={status.value} value={status.value}>
              {status.label}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>
          <span>🔄</span> Overrides
        </h3>
        <div className={styles.overrideItem}>
          <div className={styles.overrideRow}>
            <span>Override Availability Check</span>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                className={styles.toggleInput}
                checked={overrides.availability}
                onChange={(e) => setOverrides({...overrides, availability: e.target.checked})}
              />
              <span className={styles.toggleSlider}></span>
            </label>
          </div>
          <p className={styles.overrideDescription}>
            Allow booking even if the venue is already reserved
          </p>
        </div>

        <div className={styles.overrideItem}>
          <div className={styles.overrideRow}>
            <span>Bypass Deposit Requirement</span>
            <label className={styles.toggle}>
              <input
                type="checkbox"
                className={styles.toggleInput}
                checked={overrides.deposit}
                onChange={(e) => setOverrides({...overrides, deposit: e.target.checked})}
              />
              <span className={styles.toggleSlider}></span>
            </label>
          </div>
          <p className={styles.overrideDescription}>
            Allow booking confirmation without initial deposit
          </p>
        </div>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>
          <span>📝</span> Internal Notes
        </h3>
        <textarea
          className={styles.textarea}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Add internal notes about this booking..."
        />
        <p className={styles.helperText}>
          These notes are only visible to staff members
        </p>
      </div>

      <div className={styles.section}>
        <h3 className={styles.sectionTitle}>
          <span>📎</span> Documents
        </h3>
        <input
          type="file"
          multiple
          className={styles.hiddenInput}
          id="document-upload"
        />
        <label htmlFor="document-upload" className={styles.uploadButton}>
          <span className={styles.uploadIcon}>📤</span>
          Upload Documents
        </label>
      </div>
    </div>
  )
} 