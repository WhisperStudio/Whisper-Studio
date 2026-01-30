import React, { useEffect, useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import Header from '../components/header';
import Footer from '../components/footer';
import backgroundImage from '../images/94c13177-f23a-4250-b0af-53b850454da8.png';

// Import Google Fonts directly
const link = document.createElement('link');
link.href = 'https://fonts.googleapis.com/css?family=Open+Sans:400,300,600';
link.rel = 'stylesheet';
if (!document.querySelector('link[href="https://fonts.googleapis.com/css?family=Open+Sans:400,300,600"]')) {
  document.head.appendChild(link);
}

const GlobalStyle = createGlobalStyle`
  html, body {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    font-family: 'Open Sans', sans-serif;
    font-weight: 300;
    background: #FDFDFD;
    overflow-x: hidden;
  }
`;

const Container = styled.div`
  width: 100%;
  min-height: 100vh;
  transition: all 0.3s ease;

  @media (min-width: 769px) {
    height: 100vh;
    .inner {
      width: 100%;
      height: 100%;
      overflow: hidden;
      box-sizing: border-box;
      display: flex;
      flex-direction: row;
    }
  }
`;

const Panel = styled.div`
  @media (min-width: 769px) {
    position: relative;
    box-sizing: border-box;
    height: 100%;
    float: left;

    &.panel-left {
      width: 60%;
      margin-left: 0;
      background-image: url(${backgroundImage});
      background-position: center center;
      background-repeat: no-repeat;
      background-size: cover;
      z-index: 1;
    }

    &.panel-right {
      width: 60%;
      left: 188px;
      margin-left: -20%; 
      background: rgb(17, 17, 17);
      transform: skew(-20deg);
      transform-origin: center;
      z-index: 2;
    }
  }
`;

const PanelContent = styled.div`
  @media (min-width: 769px) {
    position: absolute;
    width: 100%;
    height: 100%;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%) skew(20deg);
  }
`;

const FormContainer = styled.div`
  @media (min-width: 769px) {
    display: block;
    position: absolute;
    margin: 0 auto;
    width: 350px;
    min-height: 400px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -25%);
  }

  h1 {
    margin: 0 0 30px 0;
    color: #FFF;
    font-weight: 300;
    font-size: 28px;
    text-align: center;
  }
`;

const Group = styled.div`
  position: relative;
  margin-bottom: 35px;

  input,
  textarea {
    font-size: 16px;
    padding: 10px 10px 10px 5px;
    display: block;
    width: 100%;
    border: none;
    border-bottom: 1px solid #FFF;
    background: transparent;
    color: #FFF;
    opacity: 0.8;
    transition: 0.2s ease;
    resize: vertical;

    &:focus {
      outline: none;
      opacity: 1;
    }
    &:valid ~ label,
    &:focus ~ label {
      top: -14px;
      font-size: 14px;
      color: #FFF;
      opacity: 1;
    }
    &:focus ~ .highlight {
      animation: inputHighlighter 0.3s ease;
    }
  }

  label {
    color: #FFF;
    font-size: 16px;
    font-weight: normal;
    position: absolute;
    pointer-events: none;
    left: 5px;
    top: 14px;
    opacity: 0.5;
    transition: 0.2s ease all;
  }

  .highlight {
    position: absolute;
    height: 60%;
    width: 100px;
    top: 25%;
    left: 0;
    pointer-events: none;
    opacity: 0.5;
  }

  @keyframes inputHighlighter {
    from { background: #FFF; }
    to { width: 0; background: transparent; }
  }
`;

const SendButton = styled.a`
  display: inline-block;
  color: #FFF;
  font-size: 16px;
  text-decoration: none;
  cursor: pointer;
  margin-top: 10px;
  border: 1px solid #FFF;
  padding: 10px 20px;
  border-radius: 4px;
  transition: 0.2s ease;

  &:hover {
    color: #1B1B1B;
    background: #FFF;
  }
`;

const MobileContainer = styled.div`
  @media (max-width: 768px) {
    min-height: calc(100vh - 60px); // Subtract header height
    background-image: url(${backgroundImage});
    background-position: center;
    background-repeat: no-repeat;
    background-size: cover;
    position: relative;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    padding: 80px 0;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.75);
      z-index: 1;
    }
  }
`;

const MobileFormContainer = styled.div`
  @media (max-width: 768px) {
    width: 90%;
    max-width: 400px;
    background: rgba(17, 17, 17, 0.85);
    border-radius: 12px;
    padding: 40px 25px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    position: relative;
    z-index: 2;
    backdrop-filter: blur(5px);
    border: 1px solid rgba(255,255,255,0.1);
  }
`;

const MobileTitle = styled.h1`
  @media (max-width: 768px) {
    color: #FFF;
    text-align: center;
    font-size: 24px;
    margin-bottom: 30px;
    font-weight: 300;
    letter-spacing: 1px;
  }
`;

const MobileGroup = styled.div`
  @media (max-width: 768px) {
    position: relative;
    margin-bottom: 25px;

    input, 
    textarea {
      width: 100%;
      background: transparent;
      border: none;
      border-bottom: 1px solid rgba(255,255,255,0.3);
      color: #FFF;
      font-size: 16px;
      padding: 10px 0;
      transition: border-color 0.3s ease;

      &:focus {
        outline: none;
        border-bottom-color: #FFF;
      }
    }

    label {
      position: absolute;
      top: 10px;
      left: 0;
      color: rgba(255,255,255,0.6);
      transition: all 0.3s ease;
      pointer-events: none;
    }

    input:focus + label,
    textarea:focus + label,
    input:not(:placeholder-shown) + label,
    textarea:not(:placeholder-shown) + label {
      top: -20px;
      font-size: 12px;
      color: #FFF;
    }

    input::placeholder,
    textarea::placeholder {
      color: transparent;
    }
  }
`;

const MobileSendButton = styled.button`
  @media (max-width: 768px) {
    width: 100%;
    padding: 12px;
    background: transparent;
    border: 2px solid #FFF;
    color: #FFF;
    font-size: 16px;
    border-radius: 6px;
    transition: all 0.3s ease;
    margin-top: 20px;

    &:hover {
      background: #FFF;
      color: #111;
    }
  }
`;

const ContactPage = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const MobileContactForm = () => (
    <MobileContainer>
      <MobileFormContainer>
        <MobileTitle>Contact Whisper Studio</MobileTitle>
        
        <MobileGroup>
          <input 
            type="text" 
            placeholder=" " 
            required 
          />
          <label>Your Name</label>
        </MobileGroup>
        
        <MobileGroup>
          <input 
            type="email" 
            placeholder=" " 
            required 
          />
          <label>Your Email</label>
        </MobileGroup>
        
        <MobileGroup>
          <textarea 
            rows="4" 
            placeholder=" " 
            required 
          />
          <label>Your Message</label>
        </MobileGroup>
        
        <MobileSendButton>Send Message</MobileSendButton>
      </MobileFormContainer>
    </MobileContainer>
  );

  return (
    <>
      <GlobalStyle />
      <Header />
      {isMobile ? (
        <MobileContactForm />
      ) : (
        <Container>
          <div className="inner">
            <Panel className="panel-left" />
            <Panel className="panel-right">
              <PanelContent>
                <FormContainer>
                  <h1>Contact Whisper Studio</h1>
                  <Group>
                    <input type="text" required />
                    <span className="highlight" />
                    <label>Your Name</label>
                  </Group>
                  <Group>
                    <input type="email" required />
                    <span className="highlight" />
                    <label>Your Email</label>
                  </Group>
                  <Group>
                    <textarea rows="5" required />
                    <span className="highlight" />
                    <label>Your Message</label>
                  </Group>
                  <SendButton>Send</SendButton>
                </FormContainer>
              </PanelContent>
            </Panel>
          </div>
        </Container>
      )}
      <Footer />
    </>
  );
};

export default ContactPage;
