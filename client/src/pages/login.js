
import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import {
  auth,
  provider,
  signInWithPopup,
  db,
  collection,
  getDocs
} from '../firebase';
import { signOut } from "firebase/auth";

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

  useEffect(() => {
    // More secure: Check session with the server instead of localStorage
    const checkUserSession = async () => {
      try {
        const response = await fetch('/api/me', {
          headers: {
            'Content-Type': 'application/json',
          },
        });
        if (response.ok) {
          const { user } = await response.json();
          if (user.role === 'admin') {
            navigate('/admin');
          } else {
            navigate('/');
          }
        }
        // If not response.ok, do nothing, let the user log in.
      } catch (error) {
        // It's okay if this fails, it just means the user is not logged in.
        console.log('No active session found.');
      }
    };

    checkUserSession();
  }, [navigate]);

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      const email = user?.email;

      if (!email) {
        alert("E-postadresse ikke funnet.");
        return;
      }

      const idToken = await user.getIdToken();

      // Send the ID token to your backend
      const response = await fetch('/api/auth/google', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ idToken }),
      });

      if (!response.ok) {
        throw new Error('Google authentication with backend failed.');
      }

      const { user: loggedInUser } = await response.json();

      // Navigate based on the role confirmed by the server
      if (loggedInUser.role === 'admin') {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error("Login feilet:", error);
      localStorage.removeItem("user");
      alert("Innlogging feilet: " + error.message);
    }
  };

  return (
    <Container>
      <Logo>VINTRA</Logo>
      <Button onClick={handleGoogleLogin}>Logg inn med Google</Button>
    </Container>
  );
}
