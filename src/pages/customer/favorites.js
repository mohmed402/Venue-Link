import { UnifiedAuthProvider } from '../../contexts/UnifiedAuthContext';
import CustomerProtectedRoute from '../../components/customer/CustomerProtectedRoute';
import CustomerLayout from '../../components/customer/CustomerLayout';
import CustomerFavorites from '../../components/customer/CustomerFavorites';

export default function CustomerFavoritesPage() {
  return (
    <UnifiedAuthProvider>
      <CustomerProtectedRoute>
        <CustomerLayout currentPage="favorites">
          <CustomerFavorites />
        </CustomerLayout>
      </CustomerProtectedRoute>
    </UnifiedAuthProvider>
  );
}
