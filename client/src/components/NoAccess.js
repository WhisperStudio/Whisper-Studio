import React from 'react';
import styled, { keyframes } from 'styled-components';
import { FiLock, FiAlertCircle, FiMail, FiUser, FiLogOut } from 'react-icons/fi';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';

// Animations
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
`;

// Styled Components
const Container = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #334155 100%);
  padding: 20px;
  animation: ${fadeIn} 0.6s ease;
`;

const Card = styled.div`
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 48px;
  max-width: 500px;
  width: 100%;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  text-align: center;
`;

const IconWrapper = styled.div`
  width: 120px;
  height: 120px;
  margin: 0 auto 32px;
  background: linear-gradient(135deg, rgba(251, 191, 36, 0.2), rgba(251, 191, 36, 0.1));
  border: 2px solid rgba(251, 191, 36, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${pulse} 2s infinite;
  
  svg {
    font-size: 48px;
    color: #fbbf24;
  }
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 16px;
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 32px;
  line-height: 1.6;
`;

const InfoBox = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
`;

const InfoItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
  
  &:last-child {
    margin-bottom: 0;
  }
  
  svg {
    color: #60a5fa;
    font-size: 18px;
  }
`;

const Button = styled.button`
  padding: 12px 24px;
  border-radius: 12px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0 auto;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
  }
`;

const HelpText = styled.div`
  margin-top: 32px;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 13px;
  color: rgba(255, 255, 255, 0.5);
`;

// Main Component
const NoAccess = ({ user, role }) => {
  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.href = '/login';
    } catch (error) {
      console.error('Error signing out:', error);
    }
  };

  return (
    <Container>
      <Card>
        <IconWrapper>
          <FiLock />
        </IconWrapper>
        
        <Title>Ingen tilgang</Title>
        
        <Subtitle>
          Du har ingen tilgang til noen seksjoner i admin-panelet ennå. 
          Kontakt en administrator for å få tilgang til de nødvendige seksjonene.
        </Subtitle>
        
        <InfoBox>
          <InfoItem>
            <FiUser />
            <span>{user?.displayName || 'Ingen navn'}</span>
          </InfoItem>
          <InfoItem>
            <FiMail />
            <span>{user?.email}</span>
          </InfoItem>
          <InfoItem>
            <FiAlertCircle />
            <span>Rolle: {role === 'support' ? 'Support' : 'Bruker'}</span>
          </InfoItem>
        </InfoBox>
        
        <Button onClick={handleLogout}>
          <FiLogOut />
          Logg ut
        </Button>
        
        <HelpText>
          En administrator må gi deg tilgang til de relevante seksjonene 
          basert på dine arbeidsoppgaver.
        </HelpText>
      </Card>
    </Container>
  );
};

export default NoAccess;
