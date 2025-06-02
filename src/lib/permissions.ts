// Define role hierarchy
const roleHierarchy: Record<string, number> = {
  'viewer': 0,  // Anonymous website visitor
  'guest': 0,   // Alias for viewer (for backward compatibility)
  'user': 1,    // Registered user
  'editor': 2,
  'moderator': 3,
  'admin': 4,
  'superadmin': 5
};

// Define permissions for each role
const rolePermissions: Record<string, string[]> = {
  'viewer': [
    'view:public_content',
    'view:shop',
  ],
  'guest': [    // Same permissions as viewer
    'view:public_content',
    'view:shop',
  ],
  'user': [
    'view:public_content',
    'view:shop',
    'create:order',
    'view:own_orders',
    'edit:own_profile',
  ],
  'editor': [
    'view:public_content',
    'view:shop',
    'create:order',
    'view:own_orders',
    'edit:own_profile',
    'create:content',
    'edit:content',
  ],
  'moderator': [
    'view:public_content',
    'view:shop',
    'create:order',
    'view:own_orders',
    'edit:own_profile',
    'create:content',
    'edit:content',
    'delete:content',
    'view:all_orders',
    'edit:orders',
  ],
  'admin': [
    'view:public_content',
    'view:shop',
    'create:order',
    'view:own_orders',
    'edit:own_profile',
    'create:content',
    'edit:content',
    'delete:content',
    'view:all_orders',
    'edit:orders',
    'view:analytics',
    'view:users',
    'edit:users',
    'create:admin',
  ],
  'superadmin': [
    'view:public_content',
    'view:shop',
    'create:order',
    'view:own_orders',
    'edit:own_profile',
    'create:content',
    'edit:content',
    'delete:content',
    'view:all_orders',
    'edit:orders',
    'view:analytics',
    'view:users',
    'edit:users',
    'create:admin',
    'delete:users',
    'edit:system_settings',
  ],
};

// Check if a role has a specific permission
export const hasPermission = (role: string, permission: string): boolean => {
  // If role doesn't exist, default to guest
  if (!roleHierarchy.hasOwnProperty(role)) {
    role = 'guest';
  }

  // Check if the role has the specific permission
  return rolePermissions[role]?.includes(permission) || false;
};

// Check if a role has a higher or equal level than another role
export const hasRoleLevel = (userRole: string, requiredRole: string): boolean => {
  // If role doesn't exist, default to guest
  if (!roleHierarchy.hasOwnProperty(userRole)) {
    userRole = 'guest';
  }

  if (!roleHierarchy.hasOwnProperty(requiredRole)) {
    requiredRole = 'guest';
  }

  return roleHierarchy[userRole] >= roleHierarchy[requiredRole];
};

// Get all permissions for a role (including inherited permissions)
export const getAllPermissions = (role: string): string[] => {
  // If role doesn't exist, default to guest
  if (!roleHierarchy.hasOwnProperty(role)) {
    role = 'guest';
  }

  return rolePermissions[role] || [];
};

// Check if user can access admin area
export const canAccessAdmin = (role: string): boolean => {
  return hasRoleLevel(role, 'admin');
};

// Check if user can manage content
export const canManageContent = (role: string): boolean => {
  return hasRoleLevel(role, 'editor');
};

// Check if user can manage orders
export const canManageOrders = (role: string): boolean => {
  return hasRoleLevel(role, 'moderator');
};

// Check if user can manage users
export const canManageUsers = (role: string): boolean => {
  return hasRoleLevel(role, 'admin');
};

// Check if user can view analytics
export const canViewAnalytics = (role: string): boolean => {
  return hasPermission(role, 'view:analytics');
};

// Get role display name
export const getRoleDisplayName = (role: string): string => {
  const displayNames: Record<string, string> = {
    'viewer': 'Người xem',
    'guest': 'Khách',
    'user': 'Người dùng đã đăng ký',
    'editor': 'Biên tập viên',
    'moderator': 'Quản trị viên nội dung',
    'admin': 'Quản trị viên',
    'superadmin': 'Quản trị viên cấp cao',
  };

  return displayNames[role] || role;
};
