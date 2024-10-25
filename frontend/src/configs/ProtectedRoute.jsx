import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');

  if (!token) {
    // Redirecciona a la página de inicio de sesión si no hay token
    return <Navigate to="/" replace />;
  }

  return children;
};


export default ProtectedRoute;
