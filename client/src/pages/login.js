// src/pages/login.js
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
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.role === "admin") {
      navigate("/admin");
    } else if (user) {
      navigate("/");
    }
  }, [navigate]);

  const handleGoogleLogin = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const email = result.user.email;

      // 🧠 Hent admin-liste fra Firestore
      const adminsSnapshot = await getDocs(collection(db, "admins"));
      const adminEmails = adminsSnapshot.docs.map(doc => doc.data().email);
      const isAdmin = adminEmails.includes(email);

      const user = {
        name: result.user.displayName,
        email,
        role: isAdmin ? "admin" : "user",
      };

      localStorage.setItem("user", JSON.stringify(user));
      navigate(isAdmin ? "/admin" : "/");
    } catch (error) {
      console.error("Login failed:", error);
      alert("Innlogging feilet. Prøv igjen.");
    }
  };

  return (
    <Container>
      <Logo>VINTRA</Logo>
      <Button onClick={handleGoogleLogin}>Logg inn med Google</Button>
    </Container>
  );
}
