import React, { useEffect, useState, useRef } from 'react';
import styled, { keyframes, createGlobalStyle } from 'styled-components';
import Header from '../components/header'; // Adjust path if needed
import backgroundImage from '../bilder/bg.webp'; // Adjust the path as needed

const AppContainer = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  background-color: #0e0c0d; /* Changed background color */
`;

const BackgroundContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0; /* Adjusted to cover 100% of the page */
  background-image: url(${props => props.image});
  background-size: cover;
  background-position: center;
`;

const ContentContainer = styled.div`
  position: relative;
  z-index: 1;
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;
  padding-left: 5%;
`;

const TitleContainer = styled.div`
  position: absolute;
  top: 45%; /* Moved up 5% */
  left: 5%; /* Moved left 5% */
  transform: translateY(-50%);
  color: white;
  font-size: 6rem;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
`;

const ButtonContainer = styled.div`
  position: absolute;
  top: 60%;
  left: 5%; /* Adjusted to align with the title */
  transform: translateY(-50%);
  display: flex;
  flex-direction: row; /* Changed to row for side by side alignment */
  align-items: center; /* Added to align items vertically */
`;

const PlayButton = styled.button`
  padding: 12px 24px;
  font-size: 1.2rem;
  background-color: white;
  color: black;
  border: none;
  border-radius: 30px;
  border: 2px solid white;
  cursor: pointer;
  transition: all 0.3s ease;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.5);

  &:hover {
    background-color: black;
    color: white;
    border: 2px solid white;
    /* Removed size change on hover */
  }
`;

const WatchTrailerButton = styled.button`
  padding: 12px 24px;
  font-size: 1.2rem;
  background-color: transparent;
  color: white;
  border: 2px solid white;
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
  margin-left: 20px; /* Added margin to separate buttons */

  &:hover {
    background-color: white;
    color: black;
    border: 2px solid white;

    /* Removed size change on hover */
  }
`;

const GlobalStyle = createGlobalStyle`
  body {
    cursor: none;
  }
`;

const CustomCursor = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid white;
  border-radius: 50%;
  position: fixed;
  pointer-events: none;
  z-index: 9999;
`;

function App() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updateMousePosition = (ev) => {
      setMousePosition({ x: ev.clientX, y: ev.clientY });
    };

    window.addEventListener('mousemove', updateMousePosition);

    return () => {
      window.removeEventListener('mousemove', updateMousePosition);
    };
  }, []);

  return (
    <AppContainer>
      <GlobalStyle />
      <CustomCursor style={{ left: mousePosition.x, top: mousePosition.y }} />
      <BackgroundContainer image={backgroundImage} />
      <ContentContainer>
        <Header />
        <TitleContainer>V.O.T:E</TitleContainer>
        <ButtonContainer>
          <PlayButton>Play Now</PlayButton>
          <WatchTrailerButton>Watch Trailer</WatchTrailerButton>
        </ButtonContainer>
      </ContentContainer>
    </AppContainer>
  );
}

export default App;
