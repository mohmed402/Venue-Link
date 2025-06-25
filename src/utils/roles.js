// roles.js
export const rolePermissions = {
  admin: {
    canViewDashboard: true,
    canManageBookings: true,
    canModifyBookings: true,
    canManageEmployees: true,
    canEditVenue: true,
    canAccessReview: true,
    canViewIncome: true,
    canManageCustomers: true,
    canManageVenues: true,
    canManageStaff: true,
    canViewReports: true,
    canManagePayments: true,
    canDeleteBookings: true,
    canEditPricing: true
  },
  manager: {
    canViewDashboard: true,
    canManageBookings: true,
    canModifyBookings: false,
    canManageEmployees: false,
    canEditVenue: false,
    canAccessReview: true,
    canViewIncome: false,
    canManageCustomers: true,
    canManageVenues: false,
    canManageStaff: false,
    canViewReports: true,
    canManagePayments: true,
    canDeleteBookings: false,
    canEditPricing: false
  },
  employee: {
    canViewDashboard: true,
    canManageBookings: true,
    canModifyBookings: false,
    canManageEmployees: false,
    canEditVenue: false,
    canAccessReview: false,
    canViewIncome: false,
    canManageCustomers: true,
    canManageVenues: false,
    canManageStaff: false,
    canViewReports: false,
    canManagePayments: true,
    canDeleteBookings: false,
    canEditPricing: false
  },
  staff: {
    canViewDashboard: true,
    canManageBookings: true,
    canModifyBookings: false,
    canManageEmployees: false,
    canEditVenue: false,
    canAccessReview: false,
    canViewIncome: false,
    canManageCustomers: true,
    canManageVenues: false,
    canManageStaff: false,
    canViewReports: false,
    canManagePayments: true,
    canDeleteBookings: false,
    canEditPricing: false
  }
};

export const checkPermission = (userRole, permission) => {
  return rolePermissions[userRole]?.[permission] || false;
};

export const hasAnyPermission = (userRole, permissions) => {
  return permissions.some(permission => checkPermission(userRole, permission));
};

export const hasAllPermissions = (userRole, permissions) => {
  return permissions.every(permission => checkPermission(userRole, permission));
};

// Map database roles (capitalized) to permission roles (lowercase)
export const mapDatabaseRoleToPermissionRole = (databaseRole) => {
  const roleMap = {
    'Admin': 'admin',
    'Manager': 'manager',
    'Staff': 'staff',
    'Viewer': 'staff', // Viewer uses staff permissions
    'Employee': 'employee'
  };
  return roleMap[databaseRole] || 'staff';
};

// Get permissions for a database role
export const getDatabaseRolePermissions = (databaseRole) => {
  const permissionRole = mapDatabaseRoleToPermissionRole(databaseRole);
  return rolePermissions[permissionRole] || {};
};

