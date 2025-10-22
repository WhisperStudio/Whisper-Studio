import React, { useEffect, useRef, useState } from 'react';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import { Link } from 'react-router-dom';
import Header from '../components/header';
import Footer from '../components/footer';
import backgroundImage from '../bilder/BoyDramatic.mp4';
import placeholderImage1 from '../bilder/1.webp';
import placeholderImage2 from '../bilder/smart_gnome.png';
import placeholderImage3 from '../bilder/3.webp';
import voteV from '../images/Vote_V.png';
import voteO from '../images/Vote_O.png';
import voteT from '../images/Vote_T.png';
import voteE from '../images/Vote_E.png';

/* ---------- Utils ---------- */
const clamp = (n, a, b) => Math.min(Math.max(n, a), b);
const lerp = (a, b, t) => a + (b - a) * t;
const ease = t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;

const visibleProgress = (el) => {
  const r = el.getBoundingClientRect();
  const vh = window.innerHeight || 1;
  const start = vh * 0.8;
  const end = -r.height * 0.2;
  return clamp((start - r.top) / (start - end), 0, 1);
};

// Throttle funksjon for bedre ytelse
const throttle = (func, limit) => {
  let inThrottle;
  return function() {
    const args = arguments;
    const context = this;
    if (!inThrottle) {
      func.apply(context, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  }
};

/* ---------- Global ---------- */
const GlobalStyle = createGlobalStyle`
  * {
    box-sizing: border-box;
  }
  
  body {
    cursor: none;
    margin: 0;
    padding: 0;
    overflow-x: hidden;
    background: #0e0c0d;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }

  html {
    scroll-behavior: auto; /* Disable smooth scrolling to avoid conflicts */
  }
`;

/* ---------- Animations ---------- */
const heroIn = keyframes`
  0% { 
    opacity: 0; 
    transform: translate3d(0, 40px, 0) scale(0.95); 
    filter: blur(8px); 
  }
  50% { 
    opacity: 0.8; 
    transform: translate3d(0, 10px, 0) scale(0.98); 
    filter: blur(2px); 
  }
  100% { 
    opacity: 1; 
    transform: translate3d(0, 0, 0) scale(1.0); 
    filter: blur(0); 
  }
`;

const slideInUp = keyframes`
  0% {
    opacity: 0;
    transform: translate3d(0, 60px, 0);
  }
  100% {
    opacity: 1;
    transform: translate3d(0, 0, 0);
  }
`;

/* ---------- Layout wrappers ---------- */
const AppContainer = styled.div`
  min-height: 100vh;
  width: 100vw;
  display: flex;
  flex-direction: column;
  overflow-x: hidden;
  position: relative;
`;

const StyledHeader = styled.header`
  position: fixed; 
  top: 0; 
  left: 0; 
  right: 0; 
  z-index: 1000;
  backdrop-filter: blur(10px);
`;

/* ---------- Fixed bakgrunnsvideo ---------- */
const FixedBackground = styled.div`
  position: fixed;
  inset: 0;
  z-index: -1;
  overflow: hidden;
  pointer-events: none;
  background: #000;
`;

const BackgroundVideo = styled.video`
  position: absolute;
  left: 50%; 
  top: 50%;
  transform: translate(-50%, -50%) translateY(${p => p.$parallax}px) scale(${p => p.$scale});
  min-width: 100%;
  min-height: 100%;
  width: auto; 
  height: auto;
  object-fit: cover;
  will-change: transform;
  backface-visibility: hidden;
  filter: brightness(0.9) contrast(1.1) saturate(1.2);
  transition: transform 0.1s cubic-bezier(0.25, 0.46, 0.45, 0.94);
`;

/* ---------- Hero ---------- */
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
  padding-top: 60px;
  
  @media (max-width: 768px) {
    align-items: center;
    padding-left: 5%;
    padding-right: 5%;
    padding-top: 80px;
    justify-content: center;
  }
`;

const TitleContainer = styled.div`
  display: flex;
  align-items: flex-end;
  gap: clamp(2px, 0.8vw, 8px);
  opacity: ${p => p.$opacity};
  transform: translateY(${p => p.$shift}px) scale(${p => p.$scale});
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  animation: ${heroIn} 1000ms cubic-bezier(0.2, 0.9, 0.25, 1) both;
  filter: drop-shadow(0 8px 30px rgba(0,0,0,0.55));

  @media (max-width: 768px) {
    align-self: center;
    justify-content: center;
    width: 100%;
    max-width: 95%;
    gap: clamp(2px, 1.5vw, 6px);
    flex-wrap: nowrap;
    overflow: visible;
  }
`;

const TitleLetter = styled.img`
  --letter-size: clamp(80px, 16vw, 160px);
  width: ${p => `calc(var(--letter-size) * ${p.$scale ?? 1})`};
  height: auto;
  object-fit: contain;
  pointer-events: none;
  user-select: none;
  margin-left: -35px;
  margin-right: -35px;
  
  @media (max-width: 768px) {
    --letter-size: clamp(45px, 13vw, 70px);
    margin-left: -5px;
    margin-right: -5px;
    flex-shrink: 1;
    max-width: 22vw;
  }
`;

const TitleDot = styled.span`
  width: clamp(6px, 0.8vw, 10px);
  height: clamp(6px, 0.8vw, 10px);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.65);
  box-shadow: 0 0 10px rgba(255, 255, 255, 0.55);
  display: inline-block;
  align-self: flex-end;
  transform: translateY(36%);
  flex-shrink: 0;
  
  @media (max-width: 768px) {
    width: clamp(4px, 1vw, 7px);
    height: clamp(4px, 1vw, 7px);
    transform: translateY(30%);
  }
`;

const ButtonContainer = styled.div`
  margin-top: 30px;
  display: flex; 
  gap: 20px; 
  align-items: center;
  opacity: ${p => p.$opacity};
  transform: translateY(${p => p.$shift}px) scale(${p => p.$scale});
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  animation: ${heroIn} 1200ms 150ms cubic-bezier(0.2, 0.9, 0.25, 1) both;
  
  @media (max-width: 768px) { 
    flex-direction: column; 
    gap: 15px;
    width: 100%;
    max-width: 320px;
    align-self: center;
  }
`;

const PlayButton = styled.button`
  padding: 16px 32px; 
  font-size: 1.3rem;
  font-weight: 700;
  background: white;
  color: #333;
  border: 2px solid white;
  border-radius: 50px;
  cursor: pointer; 
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  box-shadow: 0 8px 25px rgba(255, 255, 255, 0.3);
  
  &:hover { 
    background: #666;
    color: white;
    border-color: white;
    transform: translateY(-3px) scale(1.05);
    box-shadow: 0 15px 40px rgba(255, 255, 255, 0.4);
  }
  
  &:active {
    transform: translateY(-1px) scale(1.02);
  }
  
  @media (max-width: 768px) { 
    width: 100%;
    font-size: 1.2rem;
    padding: 14px 28px;
  }
`;

const WatchTrailerButton = styled.button`
  padding: 16px 32px; 
  font-size: 1.3rem;
  font-weight: 600;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.8);
  border-radius: 50px;
  cursor: pointer; 
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  backdrop-filter: blur(10px);
  
  &:hover { 
    background: white; 
    color: black;
    transform: translateY(-3px) scale(1.05);
    box-shadow: 0 15px 40px rgba(255, 255, 255, 0.3);
  }
  
  &:active {
    transform: translateY(-1px) scale(1.02);
  }
  
  @media (max-width: 768px) {
    width: 100%;
    font-size: 1.2rem;
    padding: 14px 28px;
  }
`;

/* ---------- News + Cards ---------- */
const NewsSection = styled.section`
  position: relative;
  width: 100%;
  padding: 120px 5% 100px;
  box-sizing: border-box;
  background: linear-gradient(180deg, rgba(14, 12, 13, 0.9) 0%, rgba(14, 12, 13, 0.95) 100%);
  backdrop-filter: blur(20px);
  
  @media (max-width: 768px) {
    padding: 80px 5% 60px;
  }
`;

const NewsSectionTitle = styled.h2`
  font-size: clamp(2.5rem, 6vw, 5rem); 
  margin-bottom: 80px; 
  color: white;
  text-align: center; 
  font-weight: 900; 
  letter-spacing: 3px;
  text-transform: uppercase;
  opacity: 0; 
  transform: translateY(40px);
  will-change: transform, opacity;
  transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  text-shadow: 0 4px 20px rgba(0,0,0,0.5);
  
  @media (max-width: 768px) {
    margin-bottom: 50px;
    font-size: clamp(2rem, 8vw, 3rem);
    letter-spacing: 2px;
  }
`;

const CardContainer = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  grid-template-rows: repeat(2, auto);
  gap: 40px; 
  max-width: 1600px; 
  margin: 0 auto;
  
  @media (max-width: 1024px) { 
    grid-template-columns: 1fr; 
    gap: 30px;
  }
`;

const Card = styled.div`
  background: linear-gradient(145deg, rgba(26, 26, 26, 0.9), rgba(40, 40, 40, 0.9));
  color: white;
  border-radius: 25px; 
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0,0,0,0.4);
  opacity: 0; 
  transform: translateY(40px);
  will-change: transform, opacity;
  transition: all 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  
  &:hover { 
    transform: translateY(-15px) scale(1.02);
    box-shadow: 0 30px 80px rgba(0,0,0,0.6);
    border-color: rgba(255, 255, 255, 0.2);
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
  gap: 40px;
  
  @media (max-width: 1024px) { 
    grid-template-rows: auto; 
    gap: 30px;
  }
`;

const SmallCard = styled(Card)` 
  display: flex; 
  flex-direction: column; 
`;

const CardImage = styled.div`
  width: 100%;
  padding-top: ${p => (p.large ? '60%' : '65%')};
  background-image: url(${p => p.image});
  background-size: cover; 
  background-position: center;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.3) 100%);
  }
  
  @media (max-width: 768px) {
    padding-top: ${p => (p.large ? '55%' : '60%')};
  }
`;

const CardContent = styled.div`
  padding: ${p => (p.large ? '50px' : '35px')};
  display: flex; 
  flex-direction: column; 
  justify-content: space-between; 
  flex-grow: 1;
  
  @media (max-width: 768px) {
    padding: ${p => (p.large ? '30px' : '25px')};
  }
`;

const CardTitle = styled.h3`
  font-size: ${p => (p.large ? '3.2rem' : '2.4rem')};
  font-weight: 900; 
  color: #fff; 
  margin-bottom: 25px; 
  line-height: 1.1;
  letter-spacing: -0.02em;
  
  @media (max-width: 768px) {
    font-size: ${p => (p.large ? '2.2rem' : '1.8rem')};
    margin-bottom: 18px;
  }
`;

const CardDescription = styled.p`
  font-size: ${p => (p.large ? '1.5rem' : '1.2rem')};
  color: rgba(255,255,255,0.85); 
  line-height: 1.6; 
  margin-bottom: 35px;
  font-weight: 400;
  
  @media (max-width: 768px) {
    font-size: ${p => (p.large ? '1.1rem' : '1rem')};
    margin-bottom: 25px;
    line-height: 1.5;
  }
`;

const CardButton = styled.button`
  padding: 18px 36px; 
  background: linear-gradient(135deg, #4a86ff, #6c5ce7);
  color: white;
  border: none; 
  border-radius: 50px; 
  font-size: 1.2rem; 
  font-weight: 700;
  cursor: pointer; 
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  text-transform: uppercase; 
  letter-spacing: 1px;
  align-self: flex-start;
  box-shadow: 0 8px 25px rgba(74, 134, 255, 0.4);
  
  &:hover { 
    background: linear-gradient(135deg, #3a76e8, #5b4cdb);
    transform: translateY(-3px) scale(1.05);
    box-shadow: 0 15px 40px rgba(74, 134, 255, 0.6);
  }
  
  &:active {
    transform: translateY(-1px) scale(1.02);
  }
  
  @media (max-width: 768px) {
    padding: 14px 28px;
    font-size: 1rem;
    width: 100%;
    align-self: stretch;
  }
`;

const CardDate = styled.span`
  font-size: 1.1rem; 
  color: rgba(255,255,255,0.7); 
  margin-bottom: 20px; 
  display: block; 
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 1px;
  
  @media (max-width: 768px) {
    font-size: 0.95rem;
    margin-bottom: 15px;
  }
`;

/* ---------- Component ---------- */
function App() {
  const vidRef = useRef(null);
  const [vidDur, setVidDur] = useState(0);
  const [scrollProgress, setScrollProgress] = useState(0);
  
  // Animation state
  const [heroOpacity, setHeroOpacity] = useState(1);
  const [heroShift, setHeroShift] = useState(0);
  const [heroScale, setHeroScale] = useState(1);
  const [parallax, setParallax] = useState(0);
  const [videoScale, setVideoScale] = useState(1.05);

  // Element refs
  const newsRef = useRef(null);
  const titleRef = useRef(null);
  const largeRef = useRef(null);
  const smallRefs = useRef([]);

  const getMaxScroll = () =>
    Math.max(0, (document.documentElement?.scrollHeight || 0) - window.innerHeight);

  /* Video setup - Modified for continuous loop playback */
  useEffect(() => {
    const v = vidRef.current;
    if (!v) return;

    const onLoaded = () => {
      v.loop = true; // Enable looping
      v.play().catch(e => console.log('Autoplay was prevented:', e));
      v.preload = 'auto';
    };

    v.addEventListener('loadedmetadata', onLoaded);
    v.addEventListener('loadeddata', onLoaded);

    return () => {
      v.removeEventListener('loadedmetadata', onLoaded);
      v.removeEventListener('loadeddata', onLoaded);
    };
  }, []);

  /* Scroll handler with throttling */
  useEffect(() => {
    const handleScroll = throttle(() => {
      const maxScroll = getMaxScroll();
      const scrollY = window.scrollY || 0;
      const progress = maxScroll > 0 ? clamp(scrollY / maxScroll, 0, 1) : 0;

      setScrollProgress(progress);

      // Smooth easing for better visual effect
      const easedProgress = ease(progress);

      // Hero animations
      setHeroOpacity(Math.max(0, 1 - progress * 1.5));
      setHeroShift(progress * 60);
      setHeroScale(Math.max(0.9, 1 - progress * 0.1));

      // Video effects (parallax and scale only, no time control)
      setParallax(easedProgress * 40);
      setVideoScale(1.05 + easedProgress * 0.08);

      // Removed video time control - video now loops continuously
    }, 16); // ~60fps throttling

    // Animate scroll-linked elements
    const animateElements = () => {
      const elements = [
        titleRef.current,
        largeRef.current,
        ...smallRefs.current.filter(Boolean)
      ].filter(Boolean);

      elements.forEach(el => {
        const progress = visibleProgress(el);
        const easedProgress = ease(progress);
        
        el.style.opacity = String(easedProgress);
        el.style.transform = `translateY(${(1 - easedProgress) * 40}px)`;
      });
      
      requestAnimationFrame(animateElements);
    };

    handleScroll(); // Initial call
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    
    animateElements(); // Start element animation loop
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, [vidDur]);

  const handlePlayNowClick = () => {
    window.location.href = '/vote';
  };

  return (
    <>
      <GlobalStyle />

      <FixedBackground>
        <BackgroundVideo
          ref={vidRef}
          src={backgroundImage}
          muted
          playsInline
          preload="auto"
          $parallax={parallax}
          $scale={videoScale}
        />
      </FixedBackground>

      <StyledHeader>
        <Header />
      </StyledHeader>

      <AppContainer>
        <ContentContainer>
          <TitleContainer
            $opacity={heroOpacity}
            $shift={heroShift}
            $scale={heroScale}
          >
            <TitleLetter src={voteV} alt="V" style={{ marginBottom: '-20px', marginRight: '-60px' }}/>
            <TitleDot />
            <TitleLetter src={voteO} alt="O" style={{ marginBottom: '-10px' }}/>
            <TitleDot />
            <TitleLetter src={voteT} alt="T" />
            <TitleDot />
            <TitleLetter src={voteE} alt="E" style={{ marginBottom: '-18px' }}/>
          </TitleContainer>

          <ButtonContainer
            $opacity={heroOpacity}
            $shift={heroShift}
            $scale={heroScale}
          >
            <PlayButton onClick={handlePlayNowClick}>Play Now</PlayButton>
            <WatchTrailerButton>Watch Trailer</WatchTrailerButton>
          </ButtonContainer>
        </ContentContainer>

        <NewsSection ref={newsRef}>
          <NewsSectionTitle ref={titleRef}>Latest Updates</NewsSectionTitle>

          <CardContainer>
            <LargeCard ref={largeRef}>
              <CardImage large image={placeholderImage1} />
              <CardContent large>
                <div>
                  <CardDate>August 22, 2025</CardDate>
                  <CardTitle large>V.O.T.E Update</CardTitle>
                  <CardDescription large>
                    The Vintra/Vote website is under construction.
                    <br /><br />
                    The game Vote is well underway, two of the maps are under construction,
                    characters are being created, and the story of the game is being created bit by bit.
                    Check out our Art Gallery where you can see some of the creatures we are planning to add.
                  </CardDescription>
                </div>
              </CardContent>
            </LargeCard>

            <SmallCardContainer>
              <SmallCard ref={el => (smallRefs.current[0] = el)}>
                <CardImage image={placeholderImage2} />
                <CardContent>
                  <div>
                    <CardDate>V.O.T.E</CardDate>
                    <CardTitle>Art Gallery</CardTitle>
                    <CardDescription>
                      Check out our art gallery of the landscape and creatures you might see in the game.
                    </CardDescription>
                  </div>
                  <Link to="/artwork" style={{ textDecoration: 'none' }}>
                    <CardButton>Explore</CardButton>
                  </Link>
                </CardContent>
              </SmallCard>

              <SmallCard ref={el => (smallRefs.current[1] = el)}>
                <CardImage image={placeholderImage3} />
                <CardContent>
                  <div>
                    <CardDate>January 15, 2025</CardDate>
                    <CardTitle>Community Event</CardTitle>
                    <CardDescription>
                      Join our upcoming community event and compete for exclusive rewards.
                      Don't miss this chance to showcase your skills!
                    </CardDescription>
                  </div>
                  <CardButton>Join Now</CardButton>
                </CardContent>
                </SmallCard>
            </SmallCardContainer>
          </CardContainer>
        </NewsSection>

        <Footer />
      </AppContainer>
    </>
  );
}

export default App;
