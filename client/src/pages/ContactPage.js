import React from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import Header from '../components/header'; // Juster path om nødvendig
import bigImage from '../bilder/shadow-removebg-preview.png'; // Import av lokal bilde

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

/* Panel (left or right) with the skew effect */
const Panel = styled.div`
  position: relative;
  box-sizing: border-box;
  height: 100%;
  width: 60%;
  float: left;
  transform: skew(-20deg);

  &.panel-left {
    margin-left: -10%;

    .panel-content {
      position: absolute;
      width: 100%;
      height: 100%;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%) skew(20deg);

      .image-background {
        position: absolute;
        width: 100%;
        height: 100%;
        left: 50%;
        top: 50%;
        opacity: 0.95;
        background-image: url('http://uplusion23.net/images/RickGenestSm.png');
        background-position: center bottom;
        background-repeat: no-repeat;
        background-size: 50%;
        transform: translate(-50%, -50%);
      }

      .bottom-left-image {
        position: absolute;
        bottom: 0px;
        left: 300px;
        width: 800px;
        height: 600px;
        background-image: url(${bigImage});
        background-repeat: no-repeat;
        background-position: left bottom;
        background-size: contain;
        z-index: 2; 
      }
    }
  }

  &.panel-right {
    margin-right: -10%;
    background: #1B1B1B;

    .panel-content {
      position: absolute;
      width: 100%;
      height: 100%;
      left: 50%;
      top: 50%;
      transform: translate(-50%, -50%) skew(20deg);
    }
  }
`;

/* The form container */
const FormContainer = styled.div`
  /* Fjernet all bakgrunnsfarge (var rgba(255,255,255,0.05)) */
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
    color: #FFF;      /* Gjør teksten helt hvit */
    font-weight: 300;
    font-size: 28px;  /* Gjør overskriften større */
    text-align: center;
  }
`;

/* Group for each input + label highlight effect */
const Group = styled.div`
  position: relative;
  margin-bottom: 35px;

  input,
  textarea {
    font-size: 16px;                /* Større tekst i feltene */
    padding: 10px 10px 10px 5px;
    display: block;
    width: 100%;
    border: none;
    border-bottom: 1px solid #FFF;   /* Gjør kantlinjen hvit */
    background: transparent;
    color: #FFF;                     /* Gjør tekst i feltene hvit */
    opacity: 0.8; 
    transition: 0.2s ease;
    resize: vertical;               /* Muliggjør at textarea kan endres i høyden */

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
    color: #FFF;    /* Hvit label */
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
  color: #FFF;               /* Gjør skriftfargen hvit */
  font-size: 16px;           /* Litt større knappetekst */
  text-decoration: none;
  cursor: pointer;
  margin-top: 10px;
  border: 1px solid #FFF;    /* Gjør knapperammen hvit */
  padding: 10px 20px;        /* Litt større knapp */
  border-radius: 4px;
  transition: 0.2s ease;

  &:hover {
    color: #1B1B1B;
    background: #FFF;        /* Bytter til hvit bakgrunn ved hover */
  }
`;

const ContactPage = () => {
  return (
    <>
      <GlobalStyle />
      <Header />
      <Container>
        <div className="inner">
          <Panel className="panel-left">
            <div className="panel-content">
              {/* The original RickGenest background */}
              <div className="image-background" />
              {/* The new large image at the bottom-left */}
              <div className="bottom-left-image" />
            </div>
          </Panel>

          <Panel className="panel-right">
            <div className="panel-content">
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
            </div>
          </Panel>
        </div>
      </Container>
    </>
  );
};

export default ContactPage;
