import React from 'react';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import backgroundGif from '../Bilder/smoke.gif';
import sideImage from '../Bilder/Vote Boy.png';
import bottomImage from '../Bilder/tree-removebg-preview.png';

// Animation for smooth stop of the background gif
const fadeAndStop = keyframes`
  0% {
    background-position: center center;
  }
  100% {
    background-position: center center;
    background-size: cover;
    animation-timing-function: ease-out;
  }
`;

// Global styles to reset margin and padding
const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  body {
    font-family: Arial, Helvetica, sans-serif;
    overflow: hidden;
  }
`;

const PageContainer = styled.div`
  position: relative;
  width: 100vw;
  height: 100vh;

  display: flex;
  justify-content: center;
  align-items: center;

  background: url(${backgroundGif}) no-repeat center center / cover;
  animation: ${fadeAndStop} 5s ease forwards;
`;

const ContentWrapper = styled.div`
  position: relative;
  width: 100%;
  max-width: 1200px;

  display: flex;
  align-items: center;
  justify-content: center;
`;

// Bildet som dekker bunnen
const BottomImage = styled.img`
  position: absolute;
  bottom: -50px;
  left: 0;
  width: 100%;
  height: auto;
  object-fit: cover;
  z-index: 2;
`;

// Bildet på venstre side
const SideImage = styled.img`
  position: absolute;
  left: 550px;
  bottom: -450px;
  height: 100vh; 
  object-fit: cover;
  z-index: 1;
`;

const VoteText = styled.h1`
  font-size: 10rem;
  color: #ffffff;
  text-shadow: 0 0 20px rgba(0, 255, 255, 0.8), 0 0 30px rgba(0, 255, 255, 0.6);
  font-family: 'Cinzel', serif;
  position: relative;
  z-index: 2;
  text-align: center;
  line-height: 1.2;
  letter-spacing: 0.5rem;

  &::before {
    content: 'Whisper Studio';
    display: block;
    font-size: 3rem;
    color: rgba(255, 255, 255, 0.8);
    text-shadow: 0 0 15px rgba(0, 0, 0, 0.8);
    margin-bottom: 10px;
  }

  span {
    display: block;
    font-size: 2rem;
    color: rgba(200, 200, 200, 0.8);
    text-shadow: 0 0 10px rgba(0, 0, 0, 0.8);
  }
`;

// Knapp for nedlasting
const DownloadButton = styled.button`
  margin-top: 2rem;
  padding: 1rem 2rem;
  font-size: 1.5rem;
  font-family: 'Cinzel', serif;
  color: #ffffff;
  background-color: #008080; /* Teal */
  border: none;
  border-radius: 5px;
  cursor: pointer;
  z-index: 5;
  text-shadow: 0 0 15px rgba(0, 0, 0, 0.8);

  transition: background-color 0.3s ease, transform 0.3s ease;

  &:hover {
    background-color: #0a9396; 
    transform: scale(1.05);
  }
`;

const VotePage = () => {
  return (
    <>
      <GlobalStyle />
      <PageContainer>
        <BottomImage src={bottomImage} alt="Bottom Image" />
        <ContentWrapper>
          <SideImage src={sideImage} alt="Side Image" />
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <VoteText>
              VOTE
              <span>Veil of the Eldertrees</span>
            </VoteText>
            <DownloadButton>DOWNLOAD</DownloadButton>
          </div>
        </ContentWrapper>
      </PageContainer>
    </>
  );
};

export default VotePage;
