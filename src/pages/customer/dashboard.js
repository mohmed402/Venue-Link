import { UnifiedAuthProvider } from '../../contexts/UnifiedAuthContext';
import CustomerProtectedRoute from '../../components/customer/CustomerProtectedRoute';
import CustomerLayout from '../../components/customer/CustomerLayout';
import CustomerDashboard from '../../components/customer/CustomerDashboard';

export default function CustomerDashboardPage() {
  return (
    <UnifiedAuthProvider>
      <CustomerProtectedRoute>
        <CustomerLayout currentPage="dashboard">
          <CustomerDashboard />
        </CustomerLayout>
      </CustomerProtectedRoute>
    </UnifiedAuthProvider>
  );
}
