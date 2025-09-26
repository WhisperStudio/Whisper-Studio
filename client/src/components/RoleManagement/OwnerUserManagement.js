import React from 'react';
import RoleManagement from './RoleManagement';

// User Management - Only for Owners
// Full control over all users including admins
const OwnerUserManagement = () => {
  return <RoleManagement isOwnerView={true} />;
};

export default OwnerUserManagement;
