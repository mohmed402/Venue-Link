'use client';

import React, { useState, useEffect } from 'react';
import styles from './EmployeeModal.module.css';

export default function EmployeeModal({ employee, onClose, onSave, roles }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: 'Staff',
    permissions: {
      canBook: false,
      canEditVenue: false,
      canAddEmployees: false,
      canViewReports: false
    },
    welcomeMessage: ''
  });

  useEffect(() => {
    if (employee) {
      setFormData({
        ...employee,
        welcomeMessage: ''
      });
    }
  }, [employee]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleRoleChange = (e) => {
    const selectedRole = e.target.value;
    setFormData(prev => ({
      ...prev,
      role: selectedRole,
      permissions: roles[selectedRole]
    }));
  };

  const handlePermissionChange = (permission) => {
    setFormData(prev => ({
      ...prev,
      permissions: {
        ...prev.permissions,
        [permission]: !prev.permissions[permission]
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>{employee ? 'Edit Employee' : 'Add New Employee'}</h2>
          <button onClick={onClose} className={styles.closeButton}>×</button>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="firstName">First Name</label>
            <input
              type="text"
              id="firstName"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="lastName">Last Name</label>
            <input
              type="text"
              id="lastName"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email">Email Address</label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="role">Role</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleRoleChange}
            >
              {Object.keys(roles).map(role => (
                <option key={role} value={role}>{role}</option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Permissions</label>
            <div className={styles.permissions}>
              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={formData.permissions.canBook}
                  onChange={() => handlePermissionChange('canBook')}
                />
                Can Book Venues
              </label>
              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={formData.permissions.canEditVenue}
                  onChange={() => handlePermissionChange('canEditVenue')}
                />
                Can Edit Venue Details
              </label>
              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={formData.permissions.canAddEmployees}
                  onChange={() => handlePermissionChange('canAddEmployees')}
                />
                Can Add Employees
              </label>
              <label className={styles.checkbox}>
                <input
                  type="checkbox"
                  checked={formData.permissions.canViewReports}
                  onChange={() => handlePermissionChange('canViewReports')}
                />
                Can View Reports
              </label>
            </div>
          </div>

          {!employee && (
            <div className={styles.formGroup}>
              <label htmlFor="welcomeMessage">Welcome Message (Optional)</label>
              <textarea
                id="welcomeMessage"
                name="welcomeMessage"
                value={formData.welcomeMessage}
                onChange={handleInputChange}
                rows={3}
                placeholder="Add a personal welcome message to the invite email..."
              />
            </div>
          )}

          <div className={styles.formActions}>
            <button type="button" onClick={onClose} className={styles.cancelButton}>
              Cancel
            </button>
            <button type="submit" className={styles.saveButton}>
              {employee ? 'Update Employee' : 'Add Employee'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 