import React, { useEffect, useState } from 'react';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import Header from '../components/header'; // Adjust path if needed
import backgroundImage from '../bilder/bg.webp'; // Adjust the path as needed
import placeholderImage1 from '../bilder/placeholder.svg'; // Placeholder image for cards
import placeholderImage2 from '../bilder/placeholder.svg'; // Placeholder image for cards

const fadeInBounce = keyframes`
  0% {
    opacity: 0;
    transform: translateY(-20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`;

const AppContainer = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  background-color: #0e0c0d;
  opacity: 0;
  animation: ${fadeInBounce} ease 1s;
  animation-fill-mode: forwards;
`;

const BackgroundContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
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
  top: 45%;
  left: 5%;
  transform: translateY(-50%);
  color: white;
  font-size: 6rem;
  font-weight: bold;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
  @media (max-width: 768px) {
    top: 50%;
    left: 50%;
    transform: translate(-50%, +130%);
  }
`;

const ButtonContainer = styled.div`
  position: absolute;
  top: 60%;
  left: 5%;
  transform: translateY(-50%);
  display: flex;
  flex-direction: row;
  align-items: center;
  @media (max-width: 768px) {
    top: 90%;
    left: 50%;
    transform: translate(-50%, -50%);
    flex-direction: column;
    align-items: center;
  }
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
  @media (max-width: 768px) {
    display: none;
  }

  &:hover {
    background-color: black;
    color: white;
    border: 2px solid white;
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
  margin-left: 20px;
  @media (max-width: 768px) {
    margin-left: 0;
  }

  &:hover {
    background-color: white;
    color: black;
    border: 2px solid white;
  }
`;

const GlobalStyle = createGlobalStyle`
  body {
    cursor: none;
    margin: 0;
    padding: 0;
    overflow-x: hidden;
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
  @media (max-width: 768px) {
    display: none;
  }
`;

const NewsSection = styled.div`
  min-height: 100vh;
  width: 100%;
  background-color: #1a1a1a;
  display: flex;
  flex-direction: column;
  padding: 50px 20px;
  box-sizing: border-box;
  opacity: 0;
  animation: ${fadeInBounce} ease 1s;
  animation-fill-mode: forwards;
`;

const NewsSectionTitle = styled.h2`
  font-size: 3rem;
  margin-bottom: 40px;
  margin-left: 50px;
  color: white;
`;

const CardContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  padding: 0 50px;
  box-sizing: border-box;
  gap: 40px;
  
  @media (max-width: 1200px) {
    flex-direction: column;
    align-items: center;
  }
`;

const Card = styled.div`
  width: calc(50% - 20px);
  max-width: 700px;
  background-color: #1e1e1e;
  color: white;
  border-radius: 16px;
  overflow: hidden;
  transition: transform 0.3s ease;
  position: relative;
  height: 500px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  margin-bottom: 40px; // Added spacing between cards
  
  @media (max-width: 1200px) {
    width: 100%;
    margin-bottom: 40px; // Added spacing between cards
  }
  
  &:hover {
    transform: translateY(-5px);
  }
`;

const CardImage = styled.div`
  width: 100%;
  height: 60%;
  background-image: url(${props => props.image});
  background-size: cover;
  background-position: center;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(to bottom, rgba(0,0,0,0.2), rgba(0,0,0,0.6));
  }
`;

const CardContent = styled.div`
  padding: 24px;
  height: 40%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  background-color: #1e1e1e;
`;

const CardTitle = styled.h3`
  font-size: 2.5rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 8px;
`;

const CardDescription = styled.p`
  font-size: 1.2rem;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.5;
  margin-bottom: 16px;
`;

const CardButton = styled.button`
  padding: 10px 20px;
  background-color: #3a86ff;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1.2rem;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: #2a75e8;
  }
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

  const handlePlayNowClick = () => {
    window.location.href = '/vote';
  };

  return (
    <>
      <GlobalStyle />
      <CustomCursor style={{ left: mousePosition.x, top: mousePosition.y }} />
      <AppContainer>
        <BackgroundContainer image={backgroundImage} />
        <ContentContainer>
          <Header />
          <TitleContainer>V.O.T.E</TitleContainer>
          <ButtonContainer>
            <PlayButton onClick={handlePlayNowClick}>Play Now</PlayButton>
            <WatchTrailerButton>Watch Trailer</WatchTrailerButton>
          </ButtonContainer>
        </ContentContainer>
      </AppContainer>
      
      <NewsSection>
        <NewsSectionTitle>News and Updates</NewsSectionTitle>
        <CardContainer>
          <Card>
            <CardImage image={placeholderImage1} />
            <CardContent>
              <div>
                <CardTitle>V.O.T.E 2.0 Update</CardTitle>
                <CardDescription>Get ready for the biggest update yet. V.O.T.E 2.0 launches next month with groundbreaking features and a complete visual overhaul.</CardDescription>
              </div>
              <CardButton>Learn More</CardButton>
            </CardContent>
          </Card>
          <Card>
            <CardImage image={placeholderImage2} />
            <CardContent>
              <div>
                <CardTitle>New Game Mode</CardTitle>
                <CardDescription>Experience V.O.T.E in a whole new way with our latest game mode. Challenge yourself and climb the ranks!</CardDescription>
              </div>
              <CardButton>Explore</CardButton>
            </CardContent>
          </Card>
        </CardContainer>
      </NewsSection>
    </>
  );
}

export default App;
