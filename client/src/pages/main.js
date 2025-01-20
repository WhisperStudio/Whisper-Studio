import React, { useEffect, useState } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import Header from '../components/header'; // Adjust path if needed
import backgroundImage from '../bilder/bg.webp'; // Adjust the path as needed
import placeholderImage from '../bilder/placeholder.svg'; // Placeholder image for cards

const AppContainer = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
  background-color: #0e0c0d;
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

const ScrollSection = styled.div`
  min-height: 100vh;
  width: 100%;
  background-color: #1a1a1a;
  display: flex;
  flex-direction: column;
  padding: 50px 20px;
  box-sizing: border-box;
`;

const ScrollSectionTitle = styled.h2`
  font-size: 3rem;
  margin-bottom: 40px;
  margin-left: 50px;
  color: white;
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-auto-rows: minmax(200px, auto);
  gap: 20px;
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
`;

const Card = styled.div`
  background-color: #2a2a2a;
  color: white;
  border-radius: 15px;
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  background-image: url(${placeholderImage});
  background-size: cover;
  background-position: center;
  position: relative;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0,0,0,0.2);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(to bottom, rgba(0,0,0,0.1), rgba(0,0,0,0.7));
  }
`;

const NewsCard = styled(Card)`
  grid-column: span 4;
  aspect-ratio: 1 / 1;

  @media (max-width: 1200px) {
    grid-column: span 6;
  }

  @media (max-width: 768px) {
    grid-column: span 12;
  }
`;

const GameCard = styled(Card)`
  grid-column: span 8;
  aspect-ratio: 16 / 9;

  @media (max-width: 1200px) {
    grid-column: span 12;
  }
`;

const BigCard = styled(Card)`
  grid-column: span 12;
  aspect-ratio: 21 / 9;
`;

const CardContent = styled.div`
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  position: relative;
  z-index: 1;
`;

const CardTitle = styled.h3`
  font-size: 1.5rem;
  margin-bottom: 10px;
`;

const CardDescription = styled.p`
  font-size: 1rem;
  color: #ccc;
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
      
      <ScrollSection>
        <ScrollSectionTitle>News and Updates</ScrollSectionTitle>
        <CardGrid>
          <BigCard>
            <CardContent>
              <CardTitle>V.O.T.E 2.0 Coming Soon</CardTitle>
              <CardDescription>Get ready for the biggest update yet. V.O.T.E 2.0 launches next month with groundbreaking features and a complete visual overhaul.</CardDescription>
            </CardContent>
          </BigCard>
          <GameCard>
            <CardContent>
              <CardTitle>New Game Mode</CardTitle>
              <CardDescription>Experience V.O.T.E in a whole new way with our latest game mode.</CardDescription>
            </CardContent>
          </GameCard>
          <NewsCard>
            <CardContent>
              <CardTitle>Latest Update</CardTitle>
              <CardDescription>Check out our newest features and improvements.</CardDescription>
            </CardContent>
          </NewsCard>
        </CardGrid>
      </ScrollSection>
    </>
  );
}

export default App;
