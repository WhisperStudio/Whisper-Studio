import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebase';
import { checkAdminStatus } from '../utils/firebaseAdmin';
import styled from 'styled-components';

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: #152238;
  color: #E0E0E0;
  font-size: 18px;
  font-family: 'Segoe UI', sans-serif;
`;

const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        
        if (requireAdmin) {
          try {
            const adminStatus = await checkAdminStatus(currentUser);
            setIsAdmin(adminStatus);
          } catch (error) {
            console.error('Error checking admin status:', error);
            setIsAdmin(false);
          }
        }
      } else {
        setUser(null);
        setIsAdmin(false);
      }
      
      setLoading(false);
    });

    return () => unsubscribe();
  }, [requireAdmin]);

  if (loading) {
    return (
      <LoadingContainer>
        Laster...
      </LoadingContainer>
    );
  }

  // If no user is logged in, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If admin is required but user is not admin, redirect to login
  if (requireAdmin && !isAdmin) {
    return <Navigate to="/login" replace />;
  }

  // User is authenticated and has proper permissions
  return children;
};

export default ProtectedRoute;
