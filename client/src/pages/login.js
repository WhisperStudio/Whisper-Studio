
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import {
  auth,
  provider,
  signInWithPopup,
  onAuthStateChanged
} from '../firebase';
import { signOut } from "firebase/auth";
import { checkAdminStatus, getOrCreateUser } from '../utils/firebaseAdmin';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  justify-content: center;
  align-items: center;
  background-color: #0a0a0a;
  padding: 40px;
`;

const Logo = styled.h1`
  font-size: 32px;
  font-weight: 800;
  letter-spacing: 2px;
  color: #ffffff;
  font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
  text-transform: uppercase;
  margin-bottom: 40px;
`;

const Button = styled.button`
  padding: 16px 32px;
  background-color: #4285F4;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Inter', 'Segoe UI', Arial, sans-serif;

  &:hover {
    background-color: #3367d6;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(66, 133, 244, 0.3);
  }

  &:active {
    transform: translateY(0);
  }
`;

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is already logged in
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const hasAdminAccess = await checkAdminStatus(user);
          if (hasAdminAccess) {
            navigate('/admin');
          } else {
            navigate('/');
          }
        } catch (error) {
          console.error('Error checking user status:', error);
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (!user?.email) {
        alert("E-postadresse ikke funnet.");
        setLoading(false);
        return;
      }

      // Create or get user document
      const userData = await getOrCreateUser(user);
      
      if (!userData) {
        throw new Error('Failed to create user profile');
      }

      // Check if user has access to admin panel (owner, admin, or support)
      const hasAdminAccess = await checkAdminStatus(user);
      
      if (hasAdminAccess) {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error("Login feilet:", error);
      alert("Innlogging feilet: " + error.message);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <Logo>VINTRA</Logo>
        <div style={{ color: '#fff', fontSize: '18px' }}>Laster...</div>
      </Container>
    );
  }

  return (
    <Container>
      <Logo>VINTRA</Logo>
      <Button onClick={handleGoogleLogin} disabled={loading}>
        {loading ? 'Logger inn...' : 'Logg inn med Google'}
      </Button>
    </Container>
  );
}
