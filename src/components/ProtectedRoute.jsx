import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import Loader from './ui/Loader';

const ProtectedRoute = ({ children, allowedRoles }) => {
  const { currentUser, userRole, loading } = useAuth();

  if (loading) {
    return <Loader message="Verifying Clearance..." />;
  }

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(userRole)) {
    // Redirect based on role or to a common unauthorized page
    if (userRole === 'admin') return <Navigate to="/admin" replace />;
    if (userRole === 'staff') return <Navigate to="/staff" replace />;
    return <Navigate to="/citizen" replace />;
  }

  return children;
};

export default ProtectedRoute;
