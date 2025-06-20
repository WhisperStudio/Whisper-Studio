// src/pages/Admin.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FiMessageSquare, FiUsers, FiSettings, FiActivity, FiFileText } from 'react-icons/fi';

const Container = styled.div`
  background: #0b1121;
  color: #E0E0E0;
  min-height: 100vh;
  padding: 2rem;
  font-family: 'Segoe UI', sans-serif;
`;

const Title = styled.h1`
  font-size: 2.2rem;
  margin-bottom: 0.5rem;
`;

const SubTitle = styled.p`
  font-size: 1.1rem;
  color: #bbb;
`;

const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 2rem;
  margin-top: 3rem;
`;

const Card = styled.div`
  background: #152238;
  padding: 1.5rem;
  border-radius: 12px;
  box-shadow: 0 10px 25px rgba(0,0,0,0.2);
  transition: transform 0.2s ease;
  cursor: pointer;

  &:hover {
    transform: scale(1.03);
  }
`;

const CardTitle = styled.h3`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.2rem;
  margin-bottom: 1rem;
`;

const CardText = styled.p`
  font-size: 0.95rem;
  color: #ccc;
`;

export default function Admin() {
  const navigate = useNavigate();
  const [authChecked, setAuthChecked] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    axios
      .get('https://api.vintrastudio.com/api/me', { withCredentials: true })
      .then(res => {
        if (res.data?.user?.role === 'admin') {
          setUser(res.data.user);
          setAuthChecked(true);
        } else {
          navigate('/login');
        }
      })
      .catch(() => navigate('/login'));
  }, [navigate]);

  if (!authChecked) return <Container>Laster adminpanel…</Container>;

  return (
    <Container>
      <Title>Welcome, Admin {user.username || user.email}</Title>
      <SubTitle>You are logged in as administrator. Explore your tools below:</SubTitle>

      <Grid>
        <Card onClick={() => navigate('../components/ChatDashboard')}>
          <CardTitle><FiMessageSquare /> Chat Dashboard</CardTitle>
          <CardText>Manage and respond to live chat conversations in real time.</CardText>
        </Card>

        <Card onClick={() => navigate('../components/tickets')}>
          <CardTitle><FiFileText /> Ticket Manager</CardTitle>
          <CardText>Review, update, and respond to support tickets.</CardText>
        </Card>

        <Card>
          <CardTitle><FiUsers /> User Management</CardTitle>
          <CardText>View or manage user access, roles, and permissions.</CardText>
        </Card>

        <Card>
          <CardTitle><FiSettings /> System Settings</CardTitle>
          <CardText>Configure system options, appearance, and backend integrations.</CardText>
        </Card>

        <Card>
          <CardTitle><FiActivity /> Logs & Activity</CardTitle>
          <CardText>View recent system actions, login activity, and error logs.</CardText>
        </Card>
      </Grid>
    </Container>
  );
}
