// Debug component to check authentication state
import { useAuth } from '../shared/contexts/HybridAuthContext';

export const AuthDebugger: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  
  console.log('🔍 [AuthDebugger] Current auth state:', {
    isAuthenticated,
    user,
    userId: user?.id,
    userRole: user?.role,
    vendorId: user?.vendorId,
    businessName: user?.businessName
  });
  
  return (
    <div className="fixed bottom-4 right-4 bg-black/80 text-white p-4 rounded-lg text-sm max-w-md">
      <h3 className="font-bold mb-2">Auth Debug Info</h3>
      <div className="space-y-1">
        <div>Authenticated: {isAuthenticated ? '✅' : '❌'}</div>
        <div>User ID: {user?.id || 'Not set'}</div>
        <div>Role: {user?.role || 'Not set'}</div>
        <div>Email: {user?.email || 'Not set'}</div>
        <div>Vendor ID: {user?.vendorId || 'Not set'}</div>
        <div>Business Name: {user?.businessName || 'Not set'}</div>
      </div>
    </div>
  );
};
