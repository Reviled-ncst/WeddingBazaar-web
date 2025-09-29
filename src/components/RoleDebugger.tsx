import React from 'react';
import { useAuth } from '../shared/contexts/AuthContext';

export const RoleDebugger: React.FC = () => {
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) {
    return (
      <div className="fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded z-50">
        <strong>Debug:</strong> Not authenticated
      </div>
    );
  }

  return (
    <div className="fixed top-4 right-4 bg-blue-100 border border-blue-400 text-blue-700 px-4 py-3 rounded z-50">
      <div><strong>Debug Info:</strong></div>
      <div>ID: {user.id}</div>
      <div>Email: {user.email}</div>
      <div>Role: "{user.role}" (type: {typeof user.role})</div>
      <div>Name: {user.firstName} {user.lastName}</div>
    </div>
  );
};
