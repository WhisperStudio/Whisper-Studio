import React, { useEffect, useState, useRef } from 'react';
import styled, { keyframes, createGlobalStyle } from 'styled-components';
import Header from '../components/header'; // Adjust path if needed
import backgroundImage from '../images/siu.png'; // Adjust the path as needed

const zoomAnimation = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.2); }
  100% { transform: scale(1); }
`;

const AppContainer = styled.div`
  height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  position: relative;
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
  animation: ${zoomAnimation} 60s ease-in-out infinite;
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

const TitleText = styled.h1`
  font-size: 4rem;
  color: white;
  margin-bottom: 0.5rem;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
`;

const SubtitleText = styled.h2`
  font-size: 1.5rem;
  color: white;
  margin-bottom: 1rem;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
`;

const ChapterText = styled.h3`
  font-size: 1.2rem;
  color: white;
  margin-bottom: 1rem;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
`;

const PlayButton = styled.button`
  padding: 12px 24px;
  font-size: 1.2rem;
  background-color: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid white;
  border-radius: 30px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.5);

  &:hover {
    background-color: rgba(255, 255, 255, 0.3);
    transform: scale(1.05);
  }
`;

const Star = styled.div`
  position: absolute;
  width: 2px;
  height: 2px;
  background-color: white;
  opacity: ${props => props.opacity};
  transition: all 0.3s ease;
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

function Stars({ count, mousePosition }) {
  const [stars, setStars] = useState([]);
  const requestRef = useRef();
  const previousTimeRef = useRef();

  useEffect(() => {
    const newStars = [...Array(count)].map((_, i) => ({
      key: i,
      opacity: Math.random() * 0.5 + 0.5,
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 2,
      vy: (Math.random() - 0.5) * 2,
    }));
    setStars(newStars);
  }, [count]);

  const animateStars = (time) => {
    if (previousTimeRef.current !== undefined) {
      const deltaTime = time - previousTimeRef.current;

      setStars(prevStars => prevStars.map(star => {
        let { x, y, vx, vy } = star;

        // Update position
        x += vx;
        y += vy;

        // Bounce off edges
        if (x < 0 || x > window.innerWidth) vx *= -1;
        if (y < 0 || y > window.innerHeight) vy *= -1;

        // Cursor interaction
        const dx = x - mousePosition.x;
        const dy = y - mousePosition.y;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance < 100) {
          const angle = Math.atan2(dy, dx);
          const force = (100 - distance) / 10;
          vx += Math.cos(angle) * force * 0.1;
          vy += Math.sin(angle) * force * 0.1;
        }

        // Apply some drag
        vx *= 0.99;
        vy *= 0.99;

        return { ...star, x, y, vx, vy };
      }));
    }

    previousTimeRef.current = time;
    requestRef.current = requestAnimationFrame(animateStars);
  };

  useEffect(() => {
    requestRef.current = requestAnimationFrame(animateStars);
    return () => cancelAnimationFrame(requestRef.current);
  }, [mousePosition]);

  return stars.map(star => (
    <Star 
      key={star.key}
      opacity={star.opacity}
      style={{
        transform: `translate(${star.x}px, ${star.y}px)`,
      }}
    />
  ));
}

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
        <TitleText>V.O.T.E</TitleText>
        <SubtitleText>An Immersive Adventure Series</SubtitleText>
        <ChapterText>Chapter One</ChapterText>
        <PlayButton>Play Now</PlayButton>
      </ContentContainer>
      <Stars count={150} mousePosition={mousePosition} />
    </AppContainer>
  );
}

export default App;
