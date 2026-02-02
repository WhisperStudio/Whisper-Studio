
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import {
  auth,
  provider,
  signInWithPopup,
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  sendPasswordResetEmail
} from '../firebase';
import { checkAdminStatus, getOrCreateUser } from '../utils/firebaseAdmin';
import { FiMail, FiLock, FiUser, FiEye, FiEyeOff } from 'react-icons/fi';
import { FcGoogle } from 'react-icons/fc';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #0a0a0a 0%, #1a1a2e 100%);
  padding: 20px;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -50%;
    right: -50%;
    width: 200%;
    height: 200%;
    background: radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%);
    animation: rotate 30s linear infinite;
  }
  
  @keyframes rotate {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
  
  @media (max-width: 768px) {
    padding: 16px;
    
    &::before {
      animation: rotate 20s linear infinite;
    }
  }
`;

const Logo = styled.h1`
  font-size: 48px;
  font-weight: 900;
  background: linear-gradient(135deg, #60a5fa 0%, #a78bfa 50%, #f472b6 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
  text-transform: uppercase;
  margin-bottom: 8px;
  letter-spacing: 4px;
  z-index: 1;
  text-align: center;
  
  @media (max-width: 768px) {
    font-size: 36px;
    letter-spacing: 2px;
  }
`;

const Subtitle = styled.p`
  color: rgba(255, 255, 255, 0.7);
  font-size: 16px;
  margin-bottom: 48px;
  z-index: 1;
  text-align: center;
  font-weight: 500;
  
  @media (max-width: 768px) {
    font-size: 14px;
    margin-bottom: 32px;
  }
`;

const LoginCard = styled.div`
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  padding: 48px 40px;
  width: 100%;
  max-width: 480px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
  z-index: 1;
  position: relative;
  
  @media (max-width: 768px) {
    padding: 32px 24px;
    max-width: 100%;
    margin: 0 16px;
  }
`;

const TabContainer = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 36px;
  padding: 6px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.06);
`;

const Tab = styled.button`
  flex: 1;
  padding: 14px 20px;
  background: ${props => props.active ? 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)' : 'transparent'};
  border: none;
  border-radius: 12px;
  color: ${props => props.active ? '#fff' : 'rgba(255, 255, 255, 0.7)'};
  font-weight: 600;
  font-size: 15px;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  
  &:hover {
    color: #fff;
    transform: translateY(-1px);
  }
  
  @media (max-width: 768px) {
    padding: 12px 16px;
    font-size: 14px;
  }
`;

const Form = styled.form`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const InputGroup = styled.div`
  position: relative;
  margin-bottom: 8px;
`;

const Input = styled.input`
  width: 100%;
  padding: 18px 20px 18px 56px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  color: #fff;
  font-size: 16px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-sizing: border-box;
  
  &:focus {
    outline: none;
    border-color: #60a5fa;
    background: rgba(255, 255, 255, 0.08);
    box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.15);
    transform: translateY(-1px);
  }
  
  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
    font-weight: 400;
  }
  
  @media (max-width: 768px) {
    padding: 16px 18px 16px 48px;
    font-size: 16px;
  }
`;

const InputIcon = styled.div`
  position: absolute;
  left: 20px;
  top: 50%;
  transform: translateY(-50%);
  color: rgba(255, 255, 255, 0.5);
  display: flex;
  align-items: center;
  font-size: 18px;
  z-index: 2;
  
  @media (max-width: 768px) {
    left: 16px;
    font-size: 16px;
  }
`;

const PasswordToggle = styled.button`
  position: absolute;
  right: 20px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  cursor: pointer;
  padding: 6px;
  display: flex;
  align-items: center;
  font-size: 16px;
  z-index: 2;
  
  &:hover {
    color: rgba(255, 255, 255, 0.7);
  }
  
  @media (max-width: 768px) {
    right: 16px;
    font-size: 14px;
  }
`;

const Button = styled.button`
  padding: 18px 24px;
  background: ${props => props.variant === 'google' ? 
    'rgba(255, 255, 255, 0.1)' : 
    'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)'};
  color: white;
  border: 1px solid ${props => props.variant === 'google' ? 
    'rgba(255, 255, 255, 0.2)' : 'transparent'};
  border-radius: 14px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin: 4px 0;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px ${props => props.variant === 'google' ? 
      'rgba(255, 255, 255, 0.15)' : 'rgba(96, 165, 250, 0.4)'};
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
  
  @media (max-width: 768px) {
    padding: 16px 20px;
    font-size: 15px;
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  gap: 20px;
  margin: 32px 0;
  
  &::before,
  &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.15), transparent);
  }
  
  span {
    color: rgba(255, 255, 255, 0.5);
    font-size: 14px;
    font-weight: 500;
    padding: 0 12px;
    background: rgba(255, 255, 255, 0.03);
    border-radius: 8px;
  }
`;

const ForgotPassword = styled.button`
  background: none;
  border: none;
  color: #60a5fa;
  font-size: 14px;
  cursor: pointer;
  text-align: right;
  margin-top: -8px;
  margin-bottom: 8px;
  font-weight: 500;
  padding: 4px 0;
  
  &:hover {
    text-decoration: underline;
    color: #93c5fd;
  }
`;

const ErrorMessage = styled.div`
  background: rgba(239, 68, 68, 0.15);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 12px;
  padding: 16px;
  color: #f87171;
  font-size: 14px;
  margin-bottom: 20px;
  text-align: center;
  font-weight: 500;
`;

const SuccessMessage = styled.div`
  background: rgba(34, 197, 94, 0.15);
  border: 1px solid rgba(34, 197, 94, 0.3);
  border-radius: 12px;
  padding: 16px;
  color: #4ade80;
  font-size: 14px;
  margin-bottom: 20px;
  text-align: center;
  font-weight: 500;
`;

export default function Login() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [mode, setMode] = useState('login'); // 'login' or 'register'
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleEmailSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setIsSubmitting(true);

    try {
      let user;
      
      if (mode === 'register') {
        // Create new user
        if (!displayName.trim()) {
          throw new Error('Navn er påkrevd');
        }
        
        const result = await createUserWithEmailAndPassword(auth, email, password);
        user = result.user;
        
        // Update display name
        await updateProfile(user, {
          displayName: displayName.trim()
        });
        
        // Create user document in Firestore
        const userData = await getOrCreateUser({
          ...user,
          displayName: displayName.trim()
        });
        
        if (!userData) {
          throw new Error('Kunne ikke opprette brukerprofil');
        }
        
        setSuccess('Konto opprettet! Logger inn...');
      } else {
        // Sign in existing user
        const result = await signInWithEmailAndPassword(auth, email, password);
        user = result.user;
        
        // Ensure user document exists
        const userData = await getOrCreateUser(user);
        
        if (!userData) {
          throw new Error('Kunne ikke laste brukerprofil');
        }
      }
      
      // Check if user has access to admin panel
      const hasAdminAccess = await checkAdminStatus(user);
      
      // Navigate based on access
      setTimeout(() => {
        if (hasAdminAccess) {
          navigate('/admin');
        } else {
          navigate('/');
        }
      }, 1000);
      
    } catch (error) {
      console.error('Auth error:', error);
      
      // Handle specific Firebase auth errors
      switch (error.code) {
        case 'auth/email-already-in-use':
          setError('E-postadressen er allerede i bruk');
          break;
        case 'auth/invalid-email':
          setError('Ugyldig e-postadresse');
          break;
        case 'auth/weak-password':
          setError('Passordet må være minst 6 tegn');
          break;
        case 'auth/user-not-found':
          setError('Ingen bruker funnet med denne e-postadressen');
          break;
        case 'auth/wrong-password':
          setError('Feil passord');
          break;
        case 'auth/invalid-credential':
          setError('Ugyldig e-post eller passord');
          break;
        default:
          setError(error.message || 'En feil oppstod');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setError('');
      setIsSubmitting(true);
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      if (!user?.email) {
        throw new Error('E-postadresse ikke funnet');
      }

      // Create or get user document
      const userData = await getOrCreateUser(user);
      
      if (!userData) {
        throw new Error('Kunne ikke opprette brukerprofil');
      }

      // Check if user has access to admin panel
      const hasAdminAccess = await checkAdminStatus(user);
      
      if (hasAdminAccess) {
        navigate('/admin');
      } else {
        navigate('/');
      }
    } catch (error) {
      console.error('Google login error:', error);
      setError(error.message || 'Google innlogging feilet');
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Vennligst skriv inn e-postadressen din først');
      return;
    }
    
    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess('E-post for tilbakestilling av passord er sendt!');
      setError('');
    } catch (error) {
      console.error('Password reset error:', error);
      setError('Kunne ikke sende e-post for tilbakestilling');
    }
  };

  if (loading) {
    return (
      <Container>
        <Logo>VINTRA STUDIO</Logo>
        <Subtitle>Admin Panel</Subtitle>
        <div style={{ 
          color: '#fff', 
          fontSize: '18px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          zIndex: 1
        }}>
          <div style={{
            width: '20px',
            height: '20px',
            border: '2px solid rgba(255, 255, 255, 0.3)',
            borderTop: '2px solid #60a5fa',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }}></div>
          Laster...
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </Container>
    );
  }

  return (
    <Container>
      <Logo>VINTRA STUDIO</Logo>
      <Subtitle>Admin Panel</Subtitle>
      
      <LoginCard>
        <TabContainer>
          <Tab 
            active={mode === 'login'} 
            onClick={() => {
              setMode('login');
              setError('');
              setSuccess('');
            }}
          >
            Logg Inn
          </Tab>
          <Tab 
            active={mode === 'register'} 
            onClick={() => {
              setMode('register');
              setError('');
              setSuccess('');
            }}
          >
            Registrer
          </Tab>
        </TabContainer>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        {success && <SuccessMessage>{success}</SuccessMessage>}
        
        <Form onSubmit={handleEmailSubmit}>
          {mode === 'register' && (
            <InputGroup>
              <InputIcon><FiUser /></InputIcon>
              <Input
                type="text"
                placeholder="Fullt navn"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                required
              />
            </InputGroup>
          )}
          
          <InputGroup>
            <InputIcon><FiMail /></InputIcon>
            <Input
              type="email"
              placeholder="E-postadresse"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </InputGroup>
          
          <InputGroup>
            <InputIcon><FiLock /></InputIcon>
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Passord"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
            <PasswordToggle
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </PasswordToggle>
          </InputGroup>
          
          {mode === 'login' && (
            <ForgotPassword type="button" onClick={handleForgotPassword}>
              Glemt passord?
            </ForgotPassword>
          )}
          
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Vennligst vent...' : 
             mode === 'login' ? 'Logg Inn' : 'Opprett Konto'}
          </Button>
        </Form>
        
        <Divider>
          <span>eller</span>
        </Divider>
        
        <Button 
          variant="google" 
          onClick={handleGoogleLogin} 
          disabled={isSubmitting}
          type="button"
        >
          <FcGoogle size={20} />
          Fortsett med Google
        </Button>
      </LoginCard>
    </Container>
  );
}
