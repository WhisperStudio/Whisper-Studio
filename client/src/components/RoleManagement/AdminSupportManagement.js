import React from 'react';
import RoleManagement from './RoleManagement';

// Admin Management - For Admins
// Can only manage support users and regular users, not other admins
const AdminSupportManagement = () => {
  return <RoleManagement isAdminView={true} />;
};

export default AdminSupportManagement;
