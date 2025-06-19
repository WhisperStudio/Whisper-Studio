import React, { useEffect } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { API_URL } from '../config';
import axios from 'axios';

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

  // Sjekk om bruker allerede er logget inn
  useEffect(() => {
    axios.get(`${API_URL}/api/me`, { withCredentials: true })
      .then((res) => {
        const user = res.data.user;
        if (user.role === 'admin') {
          navigate('/admin');
        } else {
          navigate('/main');
        }
      })
      .catch(() => {
        // Ikke logget inn, vis login-knapp
      });
  }, [navigate]);

  const handleGoogleLogin = () => {
    window.location.href = `${API_URL}/auth/google`;
  };

  return (
    <Container>
      <Logo>VINTRA</Logo>
      <Button onClick={handleGoogleLogin}>Logg inn med Google</Button>
    </Container>
  );
}
