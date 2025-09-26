import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  FiX, FiSave, FiUser, FiMail, FiLock, FiShield,
  FiUserPlus, FiKey, FiAlertCircle
} from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';
import { 
  auth, provider, signInWithPopup
} from '../../firebase';
import { 
  db, doc, setDoc, getDoc, getDocs, collection, serverTimestamp 
} from '../../firebase';

// Styled Components (reuse from PermissionModal)
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
  max-width: 500px;
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

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.8);
  margin-bottom: 8px;
  
  svg {
    font-size: 16px;
    color: #60a5fa;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: #fff;
  font-size: 14px;
  transition: all 0.3s;
  
  &:focus {
    outline: none;
    border-color: #60a5fa;
    background: rgba(255, 255, 255, 0.08);
    box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1);
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }
`;

const Select = styled.select`
  width: 100%;
  padding: 12px 16px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  color: #fff;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s;
  
  &:focus {
    outline: none;
    border-color: #60a5fa;
    background: rgba(255, 255, 255, 0.08);
  }
  
  option {
    background: #1e293b;
    color: #fff;
  }
`;

const ErrorMessage = styled.div`
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 20px;
  color: #ef4444;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const SuccessMessage = styled.div`
  background: rgba(34, 197, 94, 0.1);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 20px;
  color: #22c55e;
  font-size: 13px;
  display: flex;
  align-items: center;
  gap: 8px;
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
    
    &:hover:not(:disabled) {
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
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Main Component
const AddUserModal = ({ onClose, onAdd, currentUserRole }) => {
  const [formData, setFormData] = useState({
    email: '',
    displayName: '',
    role: 'user',
    photoURL: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [addMethod, setAddMethod] = useState('email'); // 'email' or 'google'

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    setError('');
  };

  const handleEmailSubmit = async () => {
    if (!formData.email) {
      setError('E-postadresse er påkrevd');
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Ugyldig e-postformat');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Generate a unique ID for the user (they will get proper UID when they sign in)
      const tempId = 'pending_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
      
      // Check if email already exists
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const existingUser = usersSnapshot.docs.find(doc => doc.data().email === formData.email);
      
      if (existingUser) {
        setError('En bruker med denne e-postadressen eksisterer allerede');
        setLoading(false);
        return;
      }

      // Create pre-authorized user entry
      await setDoc(doc(db, 'preauthorized_users', tempId), {
        email: formData.email.toLowerCase(),
        displayName: formData.displayName || formData.email,
        role: formData.role,
        permissions: getDefaultPermissions(formData.role),
        createdAt: serverTimestamp(),
        createdBy: auth.currentUser?.uid,
        status: 'preauthorized'
      });

      setSuccess('Bruker forhåndsgodkjent! De kan nå logge inn med Google.');
      setTimeout(() => {
        onAdd();
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Error adding user:', error);
      setError('Kunne ikke legge til bruker: ' + error.message);
    } finally {
      setLoading(false);
    }
  };


  const getDefaultPermissions = (role) => {
    switch (role) {
      case 'owner':
        return ['dashboard', 'realtime', 'analytics', 'chat', 'aiBot', 'tickets', 'server', 'database', 'security', 'tasks', 'bugs', 'admins', 'users', 'settings'];
      case 'admin':
        return ['dashboard', 'realtime', 'analytics', 'chat', 'aiBot', 'tickets', 'server', 'database', 'security', 'tasks', 'bugs', 'admins', 'settings'];
      case 'support':
        return []; // Support får ingen tilgang som standard - admin må gi tilgang
      case 'user':
        return []; // Vanlige brukere får ingen tilgang som standard
      default:
        return [];
    }
  };

  const PERMISSIONS = {
    dashboard: true,
    chat: true,
    analytics: true,
    users: true,
    admins: true,
    settings: true,
    tasks: true,
    tickets: true,
    bugs: true,
    database: true,
    security: true,
    aiBot: true
  };

  return (
    <ModalOverlay onClick={(e) => e.target === e.currentTarget && onClose()}>
      <ModalContainer>
        <ModalHeader>
          <ModalTitle>
            <FiUserPlus />
            Legg til ny bruker
          </ModalTitle>
          <CloseButton onClick={onClose}>
            <FiX />
          </CloseButton>
        </ModalHeader>

        <form onSubmit={(e) => {
          e.preventDefault();
          if (addMethod === 'email') {
            handleEmailSubmit();
          }
        }}>
          {error && (
            <ErrorMessage>
              <FiAlertCircle />
              {error}
            </ErrorMessage>
          )}

          {success && (
            <SuccessMessage>
              <FiAlertCircle />
              {success}
            </SuccessMessage>
          )}

          <FormGroup>
            <Label>
              <FiMail />
              E-postadresse *
            </Label>
            <Input
              type="email"
              placeholder="bruker@gmail.com"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              required
            />
          </FormGroup>

          <FormGroup>
            <Label>
              <FiUser />
              Visningsnavn (valgfritt)
            </Label>
            <Input
              type="text"
              placeholder="Fullt navn"
              value={formData.displayName}
              onChange={(e) => handleInputChange('displayName', e.target.value)}
            />
          </FormGroup>

          <FormGroup>
            <Label>
              <FiShield />
              Rolle
            </Label>
            <Select
              value={formData.role}
              onChange={(e) => handleInputChange('role', e.target.value)}
            >
              <option value="user">Bruker</option>
              <option value="support">Support</option>
              <option value="admin">Administrator</option>
              {currentUserRole === 'owner' && (
                <option value="owner">Eier</option>
              )}
            </Select>
          </FormGroup>

          <ModalActions>
            <Button type="button" className="secondary" onClick={onClose}>
              Avbryt
            </Button>
            <Button 
              type="submit" 
              className="primary" 
              disabled={loading}
            >
              <FiSave />
              {loading ? 'Legger til...' : 'Legg til bruker'}
            </Button>
          </ModalActions>
        </form>
      </ModalContainer>
    </ModalOverlay>
  );
};

export default AddUserModal;
