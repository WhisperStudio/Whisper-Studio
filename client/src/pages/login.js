import React, { useState } from 'react';
import styled from 'styled-components';
import axios from 'axios'; // For API-kall

// Styled Components (samme som før)
const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100vh;
  
  @media (min-width: 768px) {
    flex-direction: row;
  }
`;

const LeftSection = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #0a0a0a;
  padding: 40px;
  min-height: 100vh;
  position: relative;
  
  @media (min-width: 768px) {
    min-height: 100vh;
  }
`;

const LogoContainer = styled.div`
  position: absolute;
  top: 40px;
  left: 40px;
`;

const Logo = styled.h1`
  font-size: 24px;
  font-weight: 800;
  letter-spacing: 2px;
  color: #ffffff;
  font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
  text-transform: uppercase;
`;

const RightSection = styled.div`
  flex: 1;
  position: relative;
  background-image: url('https://images.pexels.com/photos/14433396/pexels-photo-14433396.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1');
  background-size: cover;
  background-position: center;
  min-height: 100vh;
  
  @media (min-width: 768px) {
    min-height: 100vh;
  }
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.5) 100%);
    z-index: 1;
  }
`;

const LoginForm = styled.form`
  background-color: #141414;
  padding: 48px;
  border-radius: 20px;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.4);
  width: 100%;
  max-width: 420px;
  z-index: 2;
  border: 1px solid rgba(255, 255, 255, 0.03);
`;

const FormTitle = styled.h2`
  font-size: 28px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 10px;
  font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
`;

const FormSubtitle = styled.p`
  margin-bottom: 36px;
  color: #9e9e9e;
  font-size: 16px;
  font-weight: 400;
  font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
`;

const InputGroup = styled.div`
  position: relative;
  margin-bottom: 28px;
`;

const InputLabel = styled.label`
  display: block;
  margin-bottom: 10px;
  color: #9e9e9e;
  font-size: 14px;
  font-weight: 500;
  font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
`;

const Input = styled.input`
  width: 100%;
  padding: 16px;
  border: 1px solid #333;
  border-radius: 12px;
  background-color: #1c1c1c;
  color: #ffffff;
  font-size: 15px;
  font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
  transition: all 0.3s ease;
  
  &::placeholder {
    color: #666;
  }
  
  &:focus {
    outline: none;
    border-color: #1a5bb6;
    box-shadow: 0 0 0 2px rgba(26, 91, 182, 0.2);
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 16px;
  background-color: #1a5bb6;
  color: #ffffff;
  border: none;
  border-radius: 12px;
  cursor: pointer;
  font-size: 16px;
  font-weight: 600;
  transition: all 0.3s ease;
  font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
  margin-top: 16px;
  
  &:hover {
    background-color: #174a94;
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(23, 74, 148, 0.25);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const AdminPortalText = styled.div`
  position: absolute;
  top: 40px;
  right: 40px;
  font-size: 20px;
  font-weight: 700;
  color: #ffffff;
  font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
  z-index: 2;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const RememberMeContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 20px;
`;

const Checkbox = styled.input`
  margin-right: 10px;
  cursor: pointer;
`;

const RememberMeLabel = styled.label`
  color: #9e9e9e;
  font-size: 14px;
  font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
  cursor: pointer;
`;

const ForgotPassword = styled.a`
  display: block;
  text-align: right;
  color: #4e89e8;
  font-size: 14px;
  margin-top: 20px;
  cursor: pointer;
  font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
  
  &:hover {
    text-decoration: underline;
    color: #5e99f8;
  }
`;

const Footer = styled.div`
  margin-top: 30px;
  text-align: center;
  color: #666;
  font-size: 13px;
  font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
`;

const ErrorMessage = styled.div`
  color: #ff6b6b;
  font-size: 14px;
  margin-bottom: 16px;
  text-align: center;
`;

// Login-komponent
const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState(''); // For registrering
  const [rememberMe, setRememberMe] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false); // For å veksle mellom login og registrering
  const [error, setError] = useState(''); // For feilmeldinger

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Fjern tidligere feilmeldinger

    try {
      const url = isRegistering
        ? 'https://api.vintrastudio.com/api/register'
        : 'https://api.vintrastudio.com/api/login';
      const payload = isRegistering
        ? { username, email, password }
        : { email, password };

      const response = await axios.post(url, payload, {
        withCredentials: true, // For å håndtere cookies
      });

      console.log('API Response:', response.data);

      if (isRegistering) {
        alert('Registrering vellykket! Vennligst logg inn.');
        setIsRegistering(false); // Bytt tilbake til login-skjema
      } else {
        alert('Innlogging vellykket!');
        // Omdiriger eller oppdater tilstand etter behov
      }
    } catch (err) {
      console.error('API Error:', err.response?.data || err.message);
      setError(err.response?.data?.message || 'Noe gikk galt. Vennligst prøv igjen.');
    }
  };

  return (
    <Container>
      <LeftSection>
        <LogoContainer>
          <Logo>VINTRA</Logo>
        </LogoContainer>

        <LoginForm onSubmit={handleSubmit}>
          <FormTitle>{isRegistering ? 'Opprett konto' : 'Velkommen tilbake'}</FormTitle>
          <FormSubtitle>
            {isRegistering ? 'Registrer deg for å komme i gang' : 'Logg inn for å få tilgang til kontoen din'}
          </FormSubtitle>

          {isRegistering && (
            <InputGroup>
              <InputLabel htmlFor="username">Brukernavn</InputLabel>
              <Input
                id="username"
                type="text"
                placeholder="Skriv inn brukernavn"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </InputGroup>
          )}

          <InputGroup>
            <InputLabel htmlFor="email">E-postadresse</InputLabel>
            <Input
              id="email"
              type="email"
              placeholder="navn@bedrift.no"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </InputGroup>

          <InputGroup>
            <InputLabel htmlFor="password">Passord</InputLabel>
            <Input
              id="password"
              type="password"
              placeholder="Skriv inn passord"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </InputGroup>

          {!isRegistering && (
            <RememberMeContainer>
              <Checkbox
                id="rememberMe"
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
              />
              <RememberMeLabel htmlFor="rememberMe">Husk meg i 30 dager</RememberMeLabel>
            </RememberMeContainer>
          )}

          {error && <ErrorMessage>{error}</ErrorMessage>}

          <Button type="submit">
            {isRegistering ? 'Registrer deg' : 'Logg inn'}
          </Button>

          {!isRegistering && (
            <ForgotPassword>Glemt passordet ditt?</ForgotPassword>
          )}

          <Footer>
            {isRegistering ? (
              <span>
                Har du allerede en konto?{' '}
                <a
                  href="#login"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsRegistering(false);
                  }}
                  style={{ color: '#4e89e8', cursor: 'pointer' }}
                >
                  Logg inn
                </a>
              </span>
            ) : (
              <span>
                Har du ikke en konto?{' '}
                <a
                  href="#register"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsRegistering(true);
                  }}
                  style={{ color: '#4e89e8', cursor: 'pointer' }}
                >
                  Registrer deg
                </a>
              </span>
            )}
          </Footer>
        </LoginForm>
      </LeftSection>

      <RightSection>
        <AdminPortalText>Admin Portal</AdminPortalText>
      </RightSection>
    </Container>
  );
};

export default Login;