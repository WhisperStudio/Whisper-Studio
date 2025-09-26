import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { 
  FiX, FiSave, FiToggleLeft, FiToggleRight, FiCheck,
  FiShield, FiLock, FiUnlock, FiSettings
} from 'react-icons/fi';

// Styled Components
const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  backdrop-filter: blur(8px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 9999;
  animation: fadeIn 0.3s ease-out;
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const ModalContainer = styled.div`
  background: rgba(15, 23, 42, 0.95);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 24px;
  padding: 32px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
  animation: slideUp 0.3s ease-out;
  
  @keyframes slideUp {
    from { 
      opacity: 0; 
      transform: translateY(30px) scale(0.95); 
    }
    to { 
      opacity: 1; 
      transform: translateY(0) scale(1); 
    }
  }
  
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 3px;
  }
  
  &::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, #60a5fa, #a78bfa);
    border-radius: 3px;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  padding-bottom: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
`;

const ModalTitle = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: #fff;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  
  svg {
    color: #60a5fa;
  }
`;

const CloseButton = styled.button`
  width: 40px;
  height: 40px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  font-size: 18px;

  &:hover {
    background: rgba(239, 68, 68, 0.2);
    color: #ef4444;
    transform: scale(1.1);
  }
`;

const UserInfo = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 16px;
  padding: 20px;
  margin-bottom: 24px;
`;

const UserName = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #fff;
  margin: 0 0 8px 0;
`;

const UserEmail = styled.p`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
`;

const PermissionsGrid = styled.div`
  display: grid;
  gap: 12px;
  margin-bottom: 24px;
`;

const PermissionItem = styled.div`
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 12px;
  padding: 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: all 0.3s;
  
  &:hover {
    background: rgba(255, 255, 255, 0.05);
    border-color: rgba(255, 255, 255, 0.12);
  }
`;

const PermissionInfo = styled.div`
  flex: 1;
`;

const PermissionName = styled.div`
  font-size: 15px;
  font-weight: 600;
  color: #fff;
  margin-bottom: 4px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const PermissionDescription = styled.div`
  font-size: 13px;
  color: rgba(255, 255, 255, 0.6);
`;

const ToggleSwitch = styled.button`
  width: 56px;
  height: 32px;
  border-radius: 16px;
  background: ${props => props.active ? 
    'linear-gradient(135deg, #60a5fa, #3b82f6)' : 
    'rgba(255, 255, 255, 0.1)'
  };
  border: 1px solid ${props => props.active ? 
    'transparent' : 
    'rgba(255, 255, 255, 0.2)'
  };
  position: relative;
  cursor: pointer;
  transition: all 0.3s;
  
  &::after {
    content: '';
    position: absolute;
    top: 3px;
    left: ${props => props.active ? '27px' : '3px'};
    width: 24px;
    height: 24px;
    background: #fff;
    border-radius: 50%;
    transition: all 0.3s;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }
  
  &:hover {
    transform: scale(1.05);
  }
`;

const QuickActions = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 24px;
  padding: 16px;
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.08);
`;

const QuickButton = styled.button`
  flex: 1;
  padding: 10px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
    transform: translateY(-2px);
  }
`;

const ModalActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  padding-top: 24px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
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

// Permission descriptions
const PERMISSION_DESCRIPTIONS = {
  dashboard: 'Tilgang til hovedoversikten og statistikk',
  chat: 'Kan se og administrere chat-samtaler',
  analytics: 'Tilgang til analyser og rapporter',
  users: 'Kan administrere vanlige brukere',
  admins: 'Kan administrere administratorer',
  settings: 'Tilgang til systeminnstillinger',
  tasks: 'Kan opprette og administrere oppgaver',
  tickets: 'Tilgang til support-billetter',
  bugs: 'Kan se og håndtere feilrapporter',
  database: 'Direkte databasetilgang',
  security: 'Tilgang til sikkerhetssenter',
  aiBot: 'Kan konfigurere AI-bot'
};

// Main Component
const PermissionModal = ({ user, onClose, onSave, availablePermissions }) => {
  const [permissions, setPermissions] = useState({});

  useEffect(() => {
    // Initialize permissions from user data
    const initialPermissions = {};
    Object.keys(availablePermissions).forEach(key => {
      initialPermissions[key] = user.permissions?.includes(key) || false;
    });
    setPermissions(initialPermissions);
  }, [user, availablePermissions]);

  const togglePermission = (key) => {
    setPermissions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const selectAll = () => {
    const newPermissions = {};
    Object.keys(availablePermissions).forEach(key => {
      newPermissions[key] = true;
    });
    setPermissions(newPermissions);
  };

  const deselectAll = () => {
    const newPermissions = {};
    Object.keys(availablePermissions).forEach(key => {
      newPermissions[key] = false;
    });
    setPermissions(newPermissions);
  };

  const handleSave = () => {
    const activePermissions = Object.keys(permissions)
      .filter(key => permissions[key]);
    onSave(activePermissions);
  };

  return (
    <ModalOverlay onClick={(e) => e.target === e.currentTarget && onClose()}>
      <ModalContainer>
        <ModalHeader>
          <ModalTitle>
            <FiShield />
            Administrer Tillatelser
          </ModalTitle>
          <CloseButton onClick={onClose}>
            <FiX />
          </CloseButton>
        </ModalHeader>

        <UserInfo>
          <UserName>{user.displayName || 'Ingen navn'}</UserName>
          <UserEmail>{user.email}</UserEmail>
        </UserInfo>

        <QuickActions>
          <QuickButton onClick={selectAll}>
            <FiCheck /> Velg alle
          </QuickButton>
          <QuickButton onClick={deselectAll}>
            <FiX /> Fjern alle
          </QuickButton>
          <QuickButton onClick={() => {
            // Set default support permissions
            const supportPerms = {
              dashboard: true,
              chat: true,
              tickets: true,
              bugs: true,
              tasks: false,
              analytics: false,
              users: false,
              admins: false,
              settings: false,
              database: false,
              security: false,
              aiBot: false
            };
            setPermissions(supportPerms);
          }}>
            <FiSettings /> Support-standard
          </QuickButton>
        </QuickActions>

        <PermissionsGrid>
          {Object.entries(availablePermissions).map(([key, label]) => (
            <PermissionItem key={key}>
              <PermissionInfo>
                <PermissionName>
                  {permissions[key] ? <FiUnlock /> : <FiLock />}
                  {label}
                </PermissionName>
                <PermissionDescription>
                  {PERMISSION_DESCRIPTIONS[key]}
                </PermissionDescription>
              </PermissionInfo>
              <ToggleSwitch
                active={permissions[key]}
                onClick={() => togglePermission(key)}
              />
            </PermissionItem>
          ))}
        </PermissionsGrid>

        <ModalActions>
          <Button className="secondary" onClick={onClose}>
            Avbryt
          </Button>
          <Button className="primary" onClick={handleSave}>
            <FiSave />
            Lagre Tillatelser
          </Button>
        </ModalActions>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default PermissionModal;
