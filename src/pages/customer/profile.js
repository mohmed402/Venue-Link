import { UnifiedAuthProvider } from '../../contexts/UnifiedAuthContext';
import CustomerProtectedRoute from '../../components/customer/CustomerProtectedRoute';
import CustomerLayout from '../../components/customer/CustomerLayout';
import CustomerProfile from '../../components/customer/CustomerProfile';

export default function CustomerProfilePage() {
  return (
    <UnifiedAuthProvider>
      <CustomerProtectedRoute>
        <CustomerLayout currentPage="profile">
          <CustomerProfile />
        </CustomerLayout>
      </CustomerProtectedRoute>
    </UnifiedAuthProvider>
  );
}
