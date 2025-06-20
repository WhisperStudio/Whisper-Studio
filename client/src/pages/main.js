import React, { useEffect, useState } from 'react';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import { Analytics } from "@vercel/analytics/react"
import { Link } from 'react-router-dom';
import Header from '../components/header'; // Adjust path if needed
import Footer from '../components/footer'; // Adjust path if needed
import backgroundImage from '../bilder/bg.webp'; // Adjust the path as needed
import placeholderImage1 from '../bilder/1.webp'; // Placeholder image for cards
import placeholderImage2 from '../bilder/smart_gnome.png'; // Placeholder image for cards
import placeholderImage3 from '../bilder/3.webp'; // New placeholder image for cards

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
  min-height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
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
  padding-top: 60px; /* Adjust this value based on your header height */
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
  background-color: #0a0a0a;
  display: flex;
  flex-direction: column;
  padding: 100px 5% 80px;
  box-sizing: border-box;
`;

const NewsSectionTitle = styled.h2`
  font-size: 4rem;
  margin-bottom: 80px;
  color: white;
  text-align: center;
  font-weight: 800;
  letter-spacing: 2px;
  text-transform: uppercase;
`;

const CardContainer = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  grid-template-rows: repeat(2, auto);
  gap: 30px;
  max-width: 1600px;
  margin: 0 auto;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const Card = styled.div`
  background-color: #1a1a1a;
  color: white;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 15px 40px rgba(0, 0, 0, 0.2);
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translate3d(0, -10px, 0);
    will-change: transform;
    transition: transform 0.2s ease-out;
  }
`;

const LargeCard = styled(Card)`
  grid-row: span 2;
  display: flex;
  flex-direction: column;
  height: 100%;

  @media (max-width: 1024px) {
    grid-row: auto;
  }
`;

const SmallCardContainer = styled.div`
  display: grid;
  grid-template-rows: repeat(2, 1fr);
  gap: 30px;

  @media (max-width: 1024px) {
    grid-template-rows: auto;
  }
`;

const SmallCard = styled(Card)`
  display: flex;
  flex-direction: column;
`;

const CardImage = styled.div`
  width: 100%;
  padding-top: ${props => props.large ? '70%' : '75%'};
  background-image: url(${props => props.image});
  background-size: cover;
  background-position: center;
  position: relative;
`;

const CardContent = styled.div`
  padding: ${props => props.large ? '40px' : '25px'};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex-grow: 1;
`;

const CardTitle = styled.h3`
  font-size: ${props => props.large ? '2.8rem' : '2rem'};
  font-weight: 800;
  color: #ffffff;
  margin-bottom: 20px;
  line-height: 1.2;
`;

const CardDescription = styled.p`
  font-size: ${props => props.large ? '1.4rem' : '1rem'};
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.8;
  margin-bottom: 30px;
`;

const CardButton = styled.button`
  padding: 14px 28px;
  background-color: #4a86ff;
  color: white;
  border: none;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
  align-self: flex-start;

  &:hover {
    background-color: #3a76e8;
    transform: translateY(-2px);
    box-shadow: 0 10px 20px rgba(74, 134, 255, 0.4);
  }
`;

const CardDate = styled.span`
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 15px;
  display: block;
  font-weight: 600;
`;

const StyledHeader = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
`;

function App() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const updateMousePosition = (ev) => {
      setMousePosition({ x: ev.clientX, y: ev.clientY });
    };

    window.addEventListener('mousemove', updateMousePosition);
    return () => window.removeEventListener('mousemove', updateMousePosition);
  }, []);

  const handlePlayNowClick = () => {
    window.location.href = '/vote';
  };

  return (
    <>
      <GlobalStyle />
      <CustomCursor style={{ left: mousePosition.x, top: mousePosition.y }} />
      <StyledHeader>
        <Header />
      </StyledHeader>
      <AppContainer>
        <BackgroundContainer image={backgroundImage} />
        <ContentContainer>
          <TitleContainer>V.O.T.E</TitleContainer>
          <ButtonContainer>
            <PlayButton onClick={handlePlayNowClick}>Play Now</PlayButton>
            <WatchTrailerButton>Watch Trailer</WatchTrailerButton>
          </ButtonContainer>
        </ContentContainer>
      </AppContainer>
      
      <NewsSection>
        <NewsSectionTitle>Latest Updates</NewsSectionTitle>
        <CardContainer>
          <LargeCard>
            <CardImage large image={placeholderImage1} />
            <CardContent large>
              <div>
                <CardDate>January 20, 2025</CardDate>
                <CardTitle large>V.O.T.E 2.0 Update</CardTitle>
                <CardDescription large>
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                  <br /><br />
                  Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                </CardDescription>
              </div>
              <CardButton>Learn More</CardButton>
            </CardContent>
          </LargeCard>
          
          <SmallCardContainer>
            <SmallCard>
              <CardImage image={placeholderImage2} />
              <CardContent>
                <div>
                  <CardDate>V.O.T.E</CardDate>
                  <CardTitle>Art Gallary</CardTitle>
                  <CardDescription>
                    Check out our art gallary of the landscape and creatures you might see in the game.
                  </CardDescription>
                </div>
                {/* Explore-knappen er nå en Link som navigerer til /artwork */}
                <Link to="/artwork" style={{ textDecoration: 'none' }}>
                  <CardButton>Explore</CardButton>
                </Link>
              </CardContent>
            </SmallCard>
            
            <SmallCard>
              <CardImage image={placeholderImage3} />
              <CardContent>
                <div>
                  <CardDate>January 15, 2025</CardDate>
                  <CardTitle>Community Event</CardTitle>
                  <CardDescription>
                    Join our upcoming community event and compete for exclusive rewards. Don't miss this chance to showcase your skills!
                  </CardDescription>
                </div>
                <CardButton>Join Now</CardButton>
              </CardContent>
            </SmallCard>
          </SmallCardContainer>
        </CardContainer>
      </NewsSection>
      <Footer />
      
    </>
  );
}

export default App;
