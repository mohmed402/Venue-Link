import { UnifiedAuthProvider } from '../../contexts/UnifiedAuthContext';
import CustomerProtectedRoute from '../../components/customer/CustomerProtectedRoute';
import CustomerLayout from '../../components/customer/CustomerLayout';
import CustomerBookings from '../../components/customer/CustomerBookings';

export default function CustomerBookingsPage() {
  return (
    <UnifiedAuthProvider>
      <CustomerProtectedRoute>
        <CustomerLayout currentPage="bookings">
          <CustomerBookings />
        </CustomerLayout>
      </CustomerProtectedRoute>
    </UnifiedAuthProvider>
  );
}
