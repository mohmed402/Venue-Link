'use client';

import React, { useState } from 'react';
import AdminNav from '@/components/adminNav';
import EmployeeModal from '@/components/EmployeeModal';
import styles from '@/styles/adminEmployees.module.css';

// Mock data for demonstration
const MOCK_EMPLOYEES = [
  {
    id: 1,
    firstName: "John",
    lastName: "Smith",
    email: "john.smith@example.com",
    role: "Admin",
    status: "Active",
    lastLogin: "2024-03-20T10:30:00",
    permissions: {
      canBook: true,
      canEditVenue: true,
      canAddEmployees: true,
      canViewReports: true
    }
  },
  {
    id: 2,
    firstName: "Sarah",
    lastName: "Wilson",
    email: "sarah.w@example.com",
    role: "Manager",
    status: "Active",
    lastLogin: "2024-03-19T16:45:00",
    permissions: {
      canBook: true,
      canEditVenue: true,
      canAddEmployees: false,
      canViewReports: true
    }
  },
  {
    id: 3,
    firstName: "Mike",
    lastName: "Johnson",
    email: "mike.j@example.com",
    role: "Staff",
    status: "Active",
    lastLogin: "2024-03-20T09:15:00",
    permissions: {
      canBook: true,
      canEditVenue: false,
      canAddEmployees: false,
      canViewReports: false
    }
  },
  {
    id: 4,
    firstName: "Emily",
    lastName: "Brown",
    email: "emily.b@example.com",
    role: "Viewer",
    status: "Pending Invite",
    lastLogin: null,
    permissions: {
      canBook: false,
      canEditVenue: false,
      canAddEmployees: false,
      canViewReports: true
    }
  }
];

const MOCK_ACTIVITY = [
  {
    id: 1,
    employeeId: 1,
    action: "Created Booking",
    details: "Wedding Reception for Smith family",
    timestamp: "2024-03-20T10:35:00"
  },
  {
    id: 2,
    employeeId: 2,
    action: "Updated Venue Details",
    details: "Modified main hall capacity",
    timestamp: "2024-03-19T16:50:00"
  },
  {
    id: 3,
    employeeId: 3,
    action: "Cancelled Booking",
    details: "Corporate event #1234",
    timestamp: "2024-03-20T09:20:00"
  }
];

const ROLES = {
  Admin: {
    canBook: true,
    canEditVenue: true,
    canAddEmployees: true,
    canViewReports: true
  },
  Manager: {
    canBook: true,
    canEditVenue: true,
    canAddEmployees: false,
    canViewReports: true
  },
  Staff: {
    canBook: true,
    canEditVenue: false,
    canAddEmployees: false,
    canViewReports: false
  },
  Viewer: {
    canBook: false,
    canEditVenue: false,
    canAddEmployees: false,
    canViewReports: true
  }
};

export default function EmployeeManagement() {
  const [employees, setEmployees] = useState(MOCK_EMPLOYEES);
  const [showAddModal, setShowAddModal] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    role: 'all',
    status: 'all',
    sort: 'lastLogin'
  });
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const filteredEmployees = employees.filter(employee => {
    const searchMatch = 
      employee.firstName.toLowerCase().includes(filters.search.toLowerCase()) ||
      employee.lastName.toLowerCase().includes(filters.search.toLowerCase()) ||
      employee.email.toLowerCase().includes(filters.search.toLowerCase());
    
    const roleMatch = filters.role === 'all' || employee.role === filters.role;
    const statusMatch = filters.status === 'all' || employee.status === filters.status;

    return searchMatch && roleMatch && statusMatch;
  }).sort((a, b) => {
    if (filters.sort === 'lastLogin') {
      return new Date(b.lastLogin || 0) - new Date(a.lastLogin || 0);
    }
    return b.id - a.id; // Sort by recently added
  });

  const handleAddEmployee = (newEmployee) => {
    setEmployees(prev => [...prev, { id: prev.length + 1, ...newEmployee }]);
    setShowAddModal(false);
  };

  const handleEditEmployee = (employeeId) => {
    const employee = employees.find(emp => emp.id === employeeId);
    setSelectedEmployee(employee);
    setShowAddModal(true);
  };

  const handleUpdateEmployee = (updatedEmployee) => {
    setEmployees(prev => 
      prev.map(emp => emp.id === updatedEmployee.id ? updatedEmployee : emp)
    );
    setShowAddModal(false);
    setSelectedEmployee(null);
  };

  const handleRemoveEmployee = (employeeId) => {
    if (confirm('Are you sure you want to remove this employee?')) {
      setEmployees(prev => prev.filter(emp => emp.id !== employeeId));
    }
  };

  const handleResetPassword = (email) => {
    // TODO: Implement password reset functionality
    alert(`Password reset link sent to ${email}`);
  };

  return (
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
          >
            + Add Employee
          </button>
        </header>

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
            {Object.keys(ROLES).map(role => (
              <option key={role} value={role}>{role}</option>
            ))}
          </select>

          <select
            value={filters.status}
            onChange={(e) => handleFilterChange('status', e.target.value)}
            className={styles.select}
          >
            <option value="all">All Statuses</option>
            <option value="Active">Active</option>
            <option value="Suspended">Suspended</option>
            <option value="Pending Invite">Pending Invite</option>
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
              {filteredEmployees.map(employee => (
                <tr key={employee.id}>
                  <td>
                    {employee.firstName} {employee.lastName}
                  </td>
                  <td>{employee.email}</td>
                  <td>
                    <span className={`${styles.role} ${styles[employee.role.toLowerCase()]}`}>
                      {employee.role}
                    </span>
                  </td>
                  <td>
                    <span className={`${styles.status} ${styles[employee.status.toLowerCase().replace(' ', '-')]}`}>
                      {employee.status}
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
                      ✏️
                    </button>
                    <button
                      onClick={() => handleResetPassword(employee.email)}
                      className={styles.actionButton}
                      title="Reset Password"
                    >
                      🔐
                    </button>
                    <button
                      onClick={() => handleRemoveEmployee(employee.id)}
                      className={styles.actionButton}
                      title="Remove"
                    >
                      ❌
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <section className={styles.activityLog}>
          <h2>Recent Activity</h2>
          <div className={styles.activityList}>
            {MOCK_ACTIVITY.map(activity => {
              const employee = employees.find(emp => emp.id === activity.employeeId);
              return (
                <div key={activity.id} className={styles.activityItem}>
                  <div className={styles.activityHeader}>
                    <strong>{employee?.firstName} {employee?.lastName}</strong>
                    <span>{new Date(activity.timestamp).toLocaleString()}</span>
                  </div>
                  <div className={styles.activityDetails}>
                    <span className={styles.activityAction}>{activity.action}</span>
                    <p>{activity.details}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {showAddModal && (
          <EmployeeModal
            employee={selectedEmployee}
            onClose={() => {
              setShowAddModal(false);
              setSelectedEmployee(null);
            }}
            onSave={selectedEmployee ? handleUpdateEmployee : handleAddEmployee}
            roles={ROLES}
          />
        )}
      </main>
    </div>
  );
} 