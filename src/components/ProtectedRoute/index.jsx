import { Navigate } from 'react-router-dom';
import { useStore } from '../../stores/index';

export function ProtectedRoute({ children }) {
  const { user } = useStore();
  const isAuthenticated = localStorage.getItem('token');

  if (!isAuthenticated || !user) {
    return <Navigate to='/' replace />;
  }

  return children;
}
