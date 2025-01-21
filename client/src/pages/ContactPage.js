import React, { useEffect, useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import Header from '../components/header'; // Juster path om nødvendig
import backgroundImage from '../images/94c13177-f23a-4250-b0af-53b850454da8.png';

/* Global styles for fonts, etc. */
const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css?family=Open+Sans:400,300,600');

  html, body {
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    font-family: 'Open Sans', sans-serif;
    font-weight: 300;
    background: #FDFDFD;
  }
`;

/* Container for the main panels (left image & right form) */
const Container = styled.div`
  width: 100%;
  height: 100vh;
  transition: all 0.3s ease;

  .inner {
    width: 100%;
    height: 100%;
    overflow: hidden;
    box-sizing: border-box;
    display: flex;
    flex-direction: row;
  }
`;

/* Panel styles */
const Panel = styled.div`
  position: relative;
  box-sizing: border-box;
  height: 100%;
  float: left;

  &.panel-left {
    /* Bilde-panel: ingen skew her. */
    width: 60%;
    margin-left: 0;
    background-image: url(${backgroundImage});
    background-position: center center;
    background-repeat: no-repeat;
    background-size: cover;
    z-index: 1; /* Ligger under det sorte panelet */
  }

  &.panel-right {
    /* Sort panel: behold skew. */
    width: 60%;
    left: 188px;
    margin-left: -20%; 
    background: rgb(17, 17, 17);
    transform: skew(-20deg);
    transform-origin: center;
    z-index: 2; /* Høyere enn venstre panel */
  }
`;

/* Posisjonering av innhold inni panelet */
const PanelContent = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%) skew(20deg);
`;

/* The form container */
const FormContainer = styled.div`
  display: block;
  position: absolute;
  margin: 0 auto;
  width: 350px;
  min-height: 400px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -25%);

  h1 {
    margin: 0 0 45px 0;
    color: #FFF;
    font-weight: 300;
    font-size: 28px;
    text-align: center;
  }
`;

/* Group for each input + label highlight effect */
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
    from {
      background: #FFF;
    }
    to {
      width: 0;
      background: transparent;
    }
  }
`;

/* Send button */
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

/* Styles for the mobile warning message */
const MobileWarningContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background: linear-gradient(135deg, #111, #333);
  color: #FFF;
  text-align: center;
  padding: 0 1rem;

  h1 {
    margin-bottom: 1rem;
    font-size: 2rem;
    font-weight: 300;
  }

  p {
    max-width: 600px;
    font-size: 1.1rem;
    line-height: 1.5;
  }
`;

const ContactPage = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Enkel sjekk på userAgent for å se om enheten er mobil
    const mobileRegex = /Mobi|Android|iPhone|iPod|iPad|BlackBerry|Windows Phone/i;
    setIsMobile(mobileRegex.test(navigator.userAgent));
  }, []);

  // Hvis mobil: returner kun melding
  if (isMobile) {
    return (
      <>
        <GlobalStyle />
        <Header />
        <MobileWarningContainer>
          <h1>This page is not available on mobile devices</h1>
          <p>Please use a desktop or laptop to access this page.</p>
        </MobileWarningContainer>
      </>
    );
  }

  // Ellers: returner selve kontaktsiden
  return (
    <>
      <GlobalStyle />
      <Header />
      <Container>
        <div className="inner">
          {/* Venstre panel - ingen skew */}
          <Panel className="panel-left" />

          {/* Høyre panel - med skew */}
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
    </>
  );
};

export default ContactPage;
