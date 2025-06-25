'use client';

import React, { useState, useEffect } from 'react';
import { createStaffWithAuth, updateStaff } from '@/utils/api';
import { getDatabaseRolePermissions } from '@/utils/roles';
import styles from './EmployeeModal.module.css';

export default function EmployeeModal({ employee, onClose, onSave, roles, onStaffCreated }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'Staff',
    status: 'active',
    welcomeMessage: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (employee) {
      setFormData({
        firstName: employee.firstName || employee.full_name?.split(' ')[0] || '',
        lastName: employee.lastName || employee.full_name?.split(' ').slice(1).join(' ') || '',
        email: employee.email || '',
        password: '', // Never pre-fill password
        role: employee.role || 'Staff',
        status: employee.status || 'active',
        welcomeMessage: ''
      });
    } else {
      // Reset form for new employee
      setFormData({
        firstName: '',
        lastName: '',
        email: '',
        password: '',
        role: 'Staff',
        status: 'active',
        welcomeMessage: ''
      });
    }
    setError(null);
  }, [employee]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    setError(null); // Clear error when user types
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Validate required fields
      if (!formData.firstName.trim() || !formData.lastName.trim() || !formData.email.trim()) {
        throw new Error('Please fill in all required fields');
      }

      if (!employee && !formData.password.trim()) {
        throw new Error('Password is required for new staff members');
      }

      if (!employee) {
        // Creating new staff member with auth
        const staffData = {
          full_name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
          email: formData.email.trim(),
          password: formData.password,
          role: formData.role,
          status: formData.status,
          venue_id: 86 // Default venue ID
        };

        await createStaffWithAuth(staffData);

        // Notify parent component to reload staff list
        if (onStaffCreated) {
          await onStaffCreated();
        }

        onClose();
      } else {
        // Updating existing staff member
        const updateData = {
          full_name: `${formData.firstName.trim()} ${formData.lastName.trim()}`,
          email: formData.email.trim(),
          role: formData.role,
          status: formData.status
        };

        // Call the parent's onSave function which handles the update
        onSave({
          ...employee,
          ...updateData,
          firstName: formData.firstName.trim(),
          lastName: formData.lastName.trim()
        });
      }
    } catch (error) {
      console.error('Error saving staff member:', error);
      setError(error.message || 'Failed to save staff member. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <div className={styles.modalHeader}>
          <h2>{employee ? 'Edit Staff Member' : 'Add New Staff Member'}</h2>
          <button onClick={onClose} className={styles.closeButton} disabled={loading}>×</button>
        </div>

        {error && (
          <div style={{
            background: '#fee2e2',
            color: '#991b1b',
            padding: '12px 24px',
            borderBottom: '1px solid #e5e7eb'
          }}>
            {error}
          </div>
        )}

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
              disabled={loading}
            />
          </div>

          {!employee && (
            <div className={styles.formGroup}>
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                required
                disabled={loading}
                minLength={6}
                placeholder="Minimum 6 characters"
              />
            </div>
          )}

          <div className={styles.formGroup}>
            <label htmlFor="role">Role</label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleInputChange}
              required
              disabled={loading}
            >
              {roles.map(role => (
                <option key={role} value={role}>
                  {role.charAt(0).toUpperCase() + role.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="status">Status</label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              required
              disabled={loading}
            >
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div className={styles.formGroup}>
            <label>Role Permissions</label>
            <div className={styles.permissions}>
              <div style={{
                padding: '12px',
                background: '#f9fafb',
                borderRadius: '6px',
                fontSize: '14px',
                color: '#6b7280'
              }}>
                Permissions are automatically assigned based on the selected role:
                <ul style={{ margin: '8px 0 0 20px', padding: 0 }}>
                  {formData.role &&
                    Object.entries(getDatabaseRolePermissions(formData.role))
                      .filter(([key, value]) => value === true)
                      .map(([key]) => (
                        <li key={key} style={{ marginBottom: '4px' }}>
                          {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                        </li>
                      ))
                  }
                </ul>
              </div>
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
            <button
              type="button"
              onClick={onClose}
              className={styles.cancelButton}
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className={styles.saveButton}
              disabled={loading}
            >
              {loading ? 'Saving...' : (employee ? 'Update Staff Member' : 'Add Staff Member')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 