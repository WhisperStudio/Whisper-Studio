import React, { useEffect, useState } from 'react';
import styled, { keyframes } from 'styled-components';
import { FiLock, FiClock, FiMail, FiUser, FiRefreshCw, FiLogOut } from 'react-icons/fi';
import { auth } from '../firebase';
import { signOut } from 'firebase/auth';
import { db, doc, onSnapshot } from '../firebase';

// Animations
const pulse = keyframes`
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.8; transform: scale(1.05); }
`;

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
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
  background: linear-gradient(135deg, rgba(239, 68, 68, 0.2), rgba(239, 68, 68, 0.1));
  border: 2px solid rgba(239, 68, 68, 0.3);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${pulse} 2s infinite;
  
  svg {
    font-size: 48px;
    color: #ef4444;
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

const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: rgba(251, 191, 36, 0.1);
  border: 1px solid rgba(251, 191, 36, 0.3);
  color: #fbbf24;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 32px;
  
  svg {
    animation: ${rotate} 2s linear infinite;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  justify-content: center;
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
  
  &.primary {
    background: linear-gradient(135deg, #60a5fa, #a78bfa);
    border: none;
    color: #fff;
    
    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(96, 165, 250, 0.3);
    }
  }
  
  &.secondary {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.8);
    
    &:hover {
      background: rgba(255, 255, 255, 0.1);
      color: #fff;
    }
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
const PendingAccess = ({ user }) => {
  const [checkingStatus, setCheckingStatus] = useState(false);
  const [userRole, setUserRole] = useState('pending');

  useEffect(() => {
    if (!user?.uid) return;

    // Listen for role changes in real-time
    const unsubscribe = onSnapshot(doc(db, 'users', user.uid), (doc) => {
      if (doc.exists()) {
        const data = doc.data();
        if (data.role && data.role !== 'pending') {
          // Role has been assigned, reload the page
          window.location.reload();
        }
      }
    });

    return () => unsubscribe();
  }, [user]);

  const handleRefresh = () => {
    setCheckingStatus(true);
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

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
        
        <Title>Venter på godkjenning</Title>
        
        <Subtitle>
          Din konto er opprettet, men venter på at en administrator skal gi deg tilgang til systemet.
        </Subtitle>
        
        <StatusBadge>
          <FiClock />
          Venter på godkjenning
        </StatusBadge>
        
        <InfoBox>
          <InfoItem>
            <FiUser />
            <span>{user?.displayName || 'Ingen navn'}</span>
          </InfoItem>
          <InfoItem>
            <FiMail />
            <span>{user?.email}</span>
          </InfoItem>
        </InfoBox>
        
        <ButtonGroup>
          <Button 
            className="primary" 
            onClick={handleRefresh}
            disabled={checkingStatus}
          >
            <FiRefreshCw />
            {checkingStatus ? 'Sjekker...' : 'Sjekk status'}
          </Button>
          
          <Button 
            className="secondary" 
            onClick={handleLogout}
          >
            <FiLogOut />
            Logg ut
          </Button>
        </ButtonGroup>
        
        <HelpText>
          Kontakt en administrator hvis du trenger rask tilgang. 
          Siden vil automatisk oppdateres når du får tilgang.
        </HelpText>
      </Card>
    </Container>
  );
};

export default PendingAccess;
