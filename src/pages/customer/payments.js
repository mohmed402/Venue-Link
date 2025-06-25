import { UnifiedAuthProvider } from '../../contexts/UnifiedAuthContext';
import CustomerProtectedRoute from '../../components/customer/CustomerProtectedRoute';
import CustomerLayout from '../../components/customer/CustomerLayout';
import CustomerPayments from '../../components/customer/CustomerPayments';

export default function CustomerPaymentsPage() {
  return (
    <UnifiedAuthProvider>
      <CustomerProtectedRoute>
        <CustomerLayout currentPage="payments">
          <CustomerPayments />
        </CustomerLayout>
      </CustomerProtectedRoute>
    </UnifiedAuthProvider>
  );
}
