'use client';

import React, { useState, useEffect } from 'react';
import AdminNav from '@/components/adminNav';
import EmployeeModal from '@/components/EmployeeModal';
import ProtectedRoute from '@/components/ProtectedRoute';
import SuccessNotification from '@/components/SuccessNotification';
import RecentActivity from '@/components/RecentActivity';
import ConfirmationNotification from '@/components/ConfirmationNotification';
import { useUnifiedAuth } from '@/contexts/UnifiedAuthContext';
import { getStaff, updateStaff, deleteStaff } from '@/utils/api';
import { rolePermissions } from '@/utils/roles';
import styles from '@/styles/adminEmployees.module.css';
import { useRouter } from "next/router";
import { initializeDarkMode } from '../../../utils/darkMode';

// Available roles based on the database constraint (must match exactly)
const AVAILABLE_ROLES = ['Admin', 'Manager', 'Staff', 'Viewer', 'Employee'];

export default function EmployeeManagement() {
  const { user } = useUnifiedAuth();
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    role: 'all',
    status: 'all',
    sort: 'lastLogin'
  });
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [notification, setNotification] = useState(null);
  const [error, setError] = useState(null);
  const router = useRouter();

  // Confirmation notification state
  const [confirmationNotification, setConfirmationNotification] = useState({
    isVisible: false,
    title: '',
    message: '',
    type: 'warning',
    onConfirm: null
  });

  // Initialize dark mode on component mount
  useEffect(() => {
    initializeDarkMode();
  }, []);

  // Load staff data on component mount
  useEffect(() => {
    loadStaff();
  }, []);

  const loadStaff = async () => {
    try {
      setLoading(true);
      setError(null);
      const staffData = await getStaff(86); // Default venue_id

      // Transform staff data to match the expected format
      const transformedStaff = staffData.map(staff => ({
        id: staff.id,
        firstName: staff.full_name?.split(' ')[0] || '',
        lastName: staff.full_name?.split(' ').slice(1).join(' ') || '',
        full_name: staff.full_name,
        email: staff.email,
        role: staff.role,
        status: staff.status,
        lastLogin: staff.last_login,
        created_at: staff.created_at,
        venue_id: staff.venue_id
      }));

      setEmployees(transformedStaff);
    } catch (error) {
      console.error('Error loading staff:', error);
      setError('Failed to load staff members. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const filteredEmployees = employees.filter(employee => {
    const searchMatch =
      (employee.firstName?.toLowerCase() || '').includes(filters.search.toLowerCase()) ||
      (employee.lastName?.toLowerCase() || '').includes(filters.search.toLowerCase()) ||
      (employee.full_name?.toLowerCase() || '').includes(filters.search.toLowerCase()) ||
      (employee.email?.toLowerCase() || '').includes(filters.search.toLowerCase());

    const roleMatch = filters.role === 'all' || employee.role === filters.role;
    const statusMatch = filters.status === 'all' || employee.status === filters.status;

    return searchMatch && roleMatch && statusMatch;
  }).sort((a, b) => {
    if (filters.sort === 'lastLogin') {
      return new Date(b.lastLogin || 0) - new Date(a.lastLogin || 0);
    }
    return new Date(b.created_at || 0) - new Date(a.created_at || 0); // Sort by recently added
  });

  const handleAddEmployee = async (newEmployee) => {
    try {
      setLoading(true);
      // This will be handled by the EmployeeModal with createStaffWithAuth
      await loadStaff(); // Reload the staff list
      setShowAddModal(false);
      setNotification('Staff member added successfully!');
    } catch (error) {
      console.error('Error adding employee:', error);
      setError('Failed to add staff member. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleEditEmployee = (employeeId) => {
    const employee = employees.find(emp => emp.id === employeeId);
    setSelectedEmployee(employee);
    setShowAddModal(true);
  };

  const handleUpdateEmployee = async (updatedEmployee) => {
    try {
      setLoading(true);
      await updateStaff(updatedEmployee.id, {
        full_name: updatedEmployee.full_name || `${updatedEmployee.firstName} ${updatedEmployee.lastName}`,
        email: updatedEmployee.email,
        role: updatedEmployee.role,
        status: updatedEmployee.status
      });

      await loadStaff(); // Reload the staff list
      setShowAddModal(false);
      setSelectedEmployee(null);
      setNotification('Staff member updated successfully!');
    } catch (error) {
      console.error('Error updating employee:', error);
      setError('Failed to update staff member. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Helper function to show confirmation notifications
  const showConfirmation = (title, message, onConfirm, type = 'warning') => {
    setConfirmationNotification({
      isVisible: true,
      title,
      message,
      type,
      onConfirm
    });
  };

  // Helper function to close confirmation notifications
  const closeConfirmation = () => {
    setConfirmationNotification({
      isVisible: false,
      title: '',
      message: '',
      type: 'warning',
      onConfirm: null
    });
  };

  const handleRemoveEmployee = (employeeId) => {
    const employee = employees.find(emp => emp.id === employeeId);
    showConfirmation(
      'Remove Employee',
      `Are you sure you want to remove ${employee?.full_name || employee?.email || 'this employee'}? This action cannot be undone.`,
      () => removeEmployee(employeeId),
      'danger'
    );
  };

  const removeEmployee = async (employeeId) => {
    closeConfirmation();
    
    try {
      setLoading(true);
      await deleteStaff(employeeId);
      await loadStaff(); // Reload the staff list
      setNotification('Staff member removed successfully!');
    } catch (error) {
      console.error('Error removing employee:', error);
      setError('Failed to remove staff member. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = (email) => {
    // TODO: Implement password reset functionality
    showConfirmation(
      'Reset Password',
      `Send password reset link to ${email}?`,
      () => {
        closeConfirmation();
        setNotification(`Password reset link sent to ${email}`);
      },
      'info'
    );
  };

  return (
    <ProtectedRoute requiredPermission="canManageEmployees">
      <div className={styles.pageContainer}>
        <AdminNav />
      <main className={styles.main}>
        <header className={styles.header}>
          <div>
            <h1>Employee Management</h1>
            <p>Manage staff access and permissions</p>
          </div>
          <button
            className={styles.addButton}
            onClick={() => {
              setSelectedEmployee(null);
              setShowAddModal(true);
            }}
            disabled={loading}
          >
            + Add Employee
          </button>
        </header>

        {error && (
          <div style={{
            background: '#fee2e2',
            color: '#991b1b',
            padding: '12px',
            borderRadius: '6px',
            marginBottom: '24px'
          }}>
            {error}
          </div>
        )}

        {loading && (
          <div style={{
            textAlign: 'center',
            padding: '40px',
            color: '#6b7280'
          }}>
            Loading staff members...
          </div>
        )}

        <div className={styles.filters}>
          <input
            type="text"
            placeholder="Search by name or email..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className={styles.searchInput}
          />

          <select
            value={filters.role}
            onChange={(e) => handleFilterChange('role', e.target.value)}
            className={styles.select}
          >
            <option value="all">All Roles</option>
            {AVAILABLE_ROLES.map(role => (
              <option key={role} value={role}>{role.charAt(0).toUpperCase() + role.slice(1)}</option>
            ))}
          </select>

          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className={styles.select}
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="suspended">Suspended</option>
            <option value="pending">Pending Invite</option>
          </select>

          <select
            value={filters.sort}
            onChange={(e) => handleFilterChange('sort', e.target.value)}
            className={styles.select}
          >
            <option value="lastLogin">Sort by Last Login</option>
            <option value="recent">Sort by Recently Added</option>
          </select>
        </div>

        <div className={styles.employeeList}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Full Name</th>
                <th>Email Address</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last Login</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredEmployees.length === 0 && !loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '40px', color: '#6b7280' }}>
                    No staff members found
                  </td>
                </tr>
              ) : (
                filteredEmployees.map(employee => (
                  <tr key={employee.id}>
                    <td>
                      {employee.full_name || `${employee.firstName || ''} ${employee.lastName || ''}`.trim()}
                    </td>
                    <td>{employee.email}</td>
                    <td>
                      <span className={`${styles.role} ${styles[employee.role?.toLowerCase()]}`}>
                        {employee.role}
                      </span>
                    </td>
                    <td>
                      <span className={`${styles.status} ${styles[employee.status?.toLowerCase().replace(' ', '-')]}`}>
                        {employee.status?.charAt(0).toUpperCase() + employee.status?.slice(1)}
                      </span>
                    </td>
                    <td>
                      {employee.lastLogin
                        ? new Date(employee.lastLogin).toLocaleString()
                        : 'Never'}
                    </td>
                  <td className={styles.actions}>
                    <button
                      onClick={() => handleEditEmployee(employee.id)}
                      className={styles.actionButton}
                      title="Edit"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z" fill="currentColor"/>
                      </svg>
                    </button>
                    <button
                      onClick={() => handleResetPassword(employee.email)}
                      className={styles.actionButton}
                      title="Reset Password"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" fill="currentColor"/>
                      </svg>
                    </button>
                    <button
                      onClick={() => handleRemoveEmployee(employee.id)}
                      className={styles.actionButton}
                      title="Remove"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z" fill="currentColor"/>
                      </svg>
                    </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <section className={styles.activitySection}>
          <RecentActivity venueId={86} limit={15} />
        </section>

        {showAddModal && (
          <EmployeeModal
            employee={selectedEmployee}
            onClose={() => {
              setShowAddModal(false);
              setSelectedEmployee(null);
            }}
            onSave={selectedEmployee ? handleUpdateEmployee : handleAddEmployee}
            roles={AVAILABLE_ROLES}
            onStaffCreated={loadStaff}
          />
        )}

        <SuccessNotification
          isVisible={!!notification}
          onClose={() => setNotification(null)}
          title="Success!"
          message={notification || "Operation completed successfully!"}
        />

        {/* Confirmation Notification */}
        <ConfirmationNotification
          isVisible={confirmationNotification.isVisible}
          onConfirm={confirmationNotification.onConfirm}
          onCancel={closeConfirmation}
          title={confirmationNotification.title}
          message={confirmationNotification.message}
          type={confirmationNotification.type}
          confirmText="Remove"
          cancelText="Cancel"
        />
      </main>
    </div>
    </ProtectedRoute>
  );
}