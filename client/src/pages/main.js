import React, { useEffect, useRef, useState, useCallback } from 'react';
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

/* ---------- Utils (Optimized) ---------- */

// Standard klemme-funksjon
const clamp = (n, a, b) => Math.min(Math.max(n, a), b);

// Standard easing-funksjon (Cubic EaseInOut)
const ease = t => t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;

// Sjekker hvor synlig et element er i viewporten (0 til 1)
const visibleProgress = (el) => {
  const r = el.getBoundingClientRect();
  const vh = window.innerHeight || 1;
  // Starter animasjon når elementet er 80% opp fra bunnen, ferdig når det er 20% over toppen
  const start = vh * 0.8; 
  const end = -r.height * 0.2; 
  return clamp((start - r.top) / (start - end), 0, 1);
};

// Throttle-funksjon for å begrense kallfrekvensen til en funksjon
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
  };
};

/* ---------- Global Styles (Forbedret) ---------- */
const GlobalStyle = createGlobalStyle`
  :root {
    --color-dark: #0e0c0d;
    --color-light-text: #fff;
    --color-accent: #4a86ff;
    --header-height: 60px;
    
    @media (max-width: 768px) {
      --header-height: 50px;
    }
  }

  * {
    box-sizing: border-box;
  }
  
  html {
    scroll-behavior: auto;
    font-size: 16px; 
  }
  
  body {
    cursor: default; 
    margin: 0;
    padding: 0;
    overflow-x: hidden;
    background: var(--color-dark);
    color: var(--color-light-text);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  }
`;

/* ---------- Animations ---------- */
const heroIn = keyframes`
  0% { 
    opacity: 0; 
    transform: translate3d(0, 40px, 0) scale(0.95); 
    filter: blur(8px); 
  }
  100% { 
    opacity: 1; 
    transform: translate3d(0, 0, 0) scale(1.0); 
    filter: blur(0); 
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
  background: rgba(14, 12, 13, 0.7); 
  backdrop-filter: blur(10px);
  transition: background 0.3s ease;
  height: var(--header-height);
`;

/* ---------- Fixed bakgrunnsvideo ---------- */
const FixedBackground = styled.div`
  position: fixed;
  inset: 0;
  z-index: -1;
  overflow: hidden;
  pointer-events: none;
  background: #000;
  
  @media (max-width: 500px) {
    background-image: url(${p => p.$fallbackImage}); 
    background-size: cover;
    background-position: center;
  }
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
  
  @media (max-width: 500px) {
    display: none;
  }
`;

/* ---------- Hero (Forbedret responsivitet) ---------- */
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
  padding-top: var(--header-height); 
  
  @media (max-width: 768px) {
    align-items: center;
    padding: var(--header-height) 5% 0;
    text-align: center;
  }
`;

const TitleContainer = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: flex-start;
  gap: clamp(0px, 0.5vw, 5px); 
  opacity: ${p => p.$opacity};
  transform: translateY(${p => p.$shift}px) scale(${p => p.$scale});
  transition: all 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  animation: ${heroIn} 1000ms cubic-bezier(0.2, 0.9, 0.25, 1) both;
  filter: drop-shadow(0 8px 30px rgba(0,0,0,0.55));
  position: relative;
  
  @media (max-width: 768px) {
    justify-content: center;
    left: 0;
    width: auto;
    padding: 0;
    margin-bottom: 25px;
  }

  @media (min-width: 769px) {
    left: -90px;
    padding-right: 50px;
    width: calc(100% + 90px);
    margin-bottom: 20px;
  }
`;

const TitleLetter = styled.img`
  /* Standard/Basis størrelse for T og andre bokstaver uten spesifikk override */
  --letter-size: clamp(75px, 10vw, 110px); 
  width: var(--letter-size);
  height: var(--letter-size);
  object-fit: contain;
  pointer-events: none;
  user-select: none;
  flex: 0 0 auto;
  margin: 0 clamp(1px, 0.5vw, 4px); /* Redusert margin */

  /* Spesifikke justeringer for V */
  ${props => props.$letter === 'V' && `
    --letter-size: clamp(85px, 12vw, 140px); /* Litt større V */
    margin-right: clamp(-3px, -1vw, -8px); /* Trekker O nærmere V */
  `}
  
  /* Spesifikke justeringer for E */
  ${props => props.$letter === 'E' && `
    --letter-size: clamp(87px, 12.5vw, 143px); /* Litt større E */
    margin-left: clamp(-2px, -0.5vw, -4px);
  `}
  
  /* Spesifikke justeringer for O (mindre enn standard for bedre balanse) */
  ${props => props.$letter === 'O' && `
    --letter-size: clamp(70px, 9vw, 120px); /* Mindre O */
    margin-bottom: clamp(-3px, -0.5vw, -5px);
  `}
`;

const TitleDot = styled.span`
  width: clamp(4px, 0.8vw, 10px);
  height: clamp(4px, 0.8vw, 10px);
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.65);
  box-shadow: 0 0 8px rgba(255, 255, 255, 0.5);
  display: inline-block;
  align-self: flex-end;
  transform: translateY(30%); 
  flex-shrink: 0;
`;

const BaseButton = styled.button`
  padding: 16px 32px; 
  font-size: 1.3rem;
  font-weight: 700;
  border: 2px solid;
  border-radius: 50px;
  cursor: pointer; 
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  
  &:active {
    transform: translateY(-1px) scale(1.02);
  }

  @media (max-width: 768px) { 
    width: 100%;
    font-size: 1.1rem;
    padding: 14px 28px;
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
    width: 90%;
    max-width: 380px; 
    align-self: center;
  }
`;

const PlayButton = styled(BaseButton)`
  background: white;
  color: #333;
  border-color: white;
  box-shadow: 0 8px 25px rgba(255, 255, 255, 0.3);
  
  &:hover { 
    background: #555;
    color: white;
    border-color: white;
    transform: translateY(-3px) scale(1.05);
    box-shadow: 0 15px 40px rgba(255, 255, 255, 0.4);
  }
`;

const WatchTrailerButton = styled(BaseButton)`
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border-color: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  font-weight: 600;
  
  &:hover { 
    background: white; 
    color: black;
    transform: translateY(-3px) scale(1.05);
    box-shadow: 0 15px 40px rgba(255, 255, 255, 0.3);
  }
`;

/* ---------- News + Cards (Ekstremt forbedret responsivitet) ---------- */
const NewsSection = styled.section`
  position: relative;
  width: 100%;
  padding: clamp(60px, 10vw, 120px) 5% clamp(40px, 8vw, 100px); 
  box-sizing: border-box;
  background: var(--color-dark); 
  z-index: 10;
`;

const NewsSectionTitle = styled.h2`
  font-size: clamp(2.5rem, 6vw, 5rem); 
  margin-bottom: clamp(40px, 8vw, 80px); 
  color: white;
  text-align: center; 
  font-weight: 900; 
  letter-spacing: 3px;
  text-transform: uppercase;
  text-shadow: 0 4px 20px rgba(0,0,0,0.5);
  
  will-change: transform, opacity;
`;

const CardContainer = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  grid-template-rows: repeat(2, auto);
  gap: clamp(20px, 4vw, 40px); 
  max-width: 1600px; 
  margin: 0 auto;
  
  @media (max-width: 1024px) { 
    grid-template-columns: 1fr; 
  }
`;

const Card = styled(Link)`
  text-decoration: none; 
  background: linear-gradient(145deg, rgba(26, 26, 26, 0.95), rgba(40, 40, 40, 0.95));
  color: white;
  border-radius: 25px; 
  overflow: hidden;
  box-shadow: 0 10px 40px rgba(0,0,0,0.4);
  transition: all 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  will-change: transform, box-shadow, border-color; 
  will-change: transform, opacity;
  
  &:hover { 
    transform: translateY(-10px) scale(1.01); 
    box-shadow: 0 20px 60px rgba(0,0,0,0.6);
    border-color: rgba(255, 255, 255, 0.2);
  }

  &:active {
    transform: translateY(-5px) scale(1.0);
  }
`;

const LargeCard = styled(Card)`
  grid-row: span 2; 
  display: flex; 
  flex-direction: column; 
  height: auto; 
  
  @media (max-width: 1024px) { 
    grid-row: auto; 
  }
`;

const SmallCardContainer = styled.div`
  display: grid; 
  grid-template-rows: repeat(2, 1fr); 
  gap: clamp(20px, 4vw, 40px);
  
  @media (max-width: 1024px) { 
    grid-template-rows: auto; 
  }
  @media (max-width: 500px) {
    grid-template-rows: auto;
  }
`;

const SmallCard = styled(Card)``;

const CardImage = styled.div`
  width: 100%;
  padding-top: ${p => (p.$large ? 'clamp(40%, 30vw, 60%)' : 'clamp(50%, 40vw, 65%)')}; 
  background-image: url(${p => p.image});
  background-size: cover; 
  background-position: center;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.5) 100%);
  }
`;

const CardContent = styled.div`
  padding: ${p => (p.$large ? 'clamp(25px, 5vw, 50px)' : 'clamp(20px, 4vw, 35px)')}; 
  display: flex; 
  flex-direction: column; 
  justify-content: space-between; 
  flex-grow: 1;
`;

const CardTitle = styled.h3`
  font-size: ${p => (p.$large ? 'clamp(2rem, 4vw, 3.2rem)' : 'clamp(1.5rem, 3vw, 2.4rem)')}; 
  font-weight: 900; 
  color: #fff; 
  margin-bottom: clamp(15px, 2vw, 25px); 
  line-height: 1.1;
  letter-spacing: -0.02em;
`;

const CardDescription = styled.p`
  font-size: ${p => (p.$large ? 'clamp(1rem, 1.5vw, 1.5rem)' : 'clamp(0.9rem, 1.2vw, 1.2rem)')}; 
  color: rgba(255,255,255,0.85); 
  line-height: 1.6; 
  margin-bottom: clamp(20px, 3vw, 35px);
  font-weight: 400;
`;

const CardButton = styled(BaseButton)`
  padding: 16px 32px; 
  background: linear-gradient(135deg, #4a86ff, #6c5ce7);
  color: white;
  border: none; 
  font-size: 1.1rem; 
  font-weight: 700;
  text-transform: uppercase; 
  letter-spacing: 1px;
  align-self: flex-start;
  box-shadow: 0 8px 25px rgba(74, 134, 255, 0.4);
  
  &:hover { 
    background: linear-gradient(135deg, #3a76e8, #5b4cdb);
  }
  
  @media (max-width: 768px) {
    padding: 12px 24px;
    font-size: 0.9rem;
    align-self: stretch;
  }
`;

const CardDate = styled.span`
  font-size: 0.9rem;
  color: rgba(255,255,255,0.7); 
  margin-bottom: 20px; 
  display: block; 
  font-weight: 600;
`;

/* ---------- Component ---------- */
function App() {
  const vidRef = useRef(null);
  const [heroState, setHeroState] = useState({
    opacity: 1,
    shift: 0,
    scale: 1,
    parallax: 0,
    videoScale: 1.05,
  });
  const titleRef = useRef(null);
  const largeRef = useRef(null);
  const smallRefs = useRef([]);
  // Liste over alle elementer som skal scroll-animeres
  const animatedRefs = useRef([]);

  const getMaxScroll = useCallback(() =>
    Math.max(0, (document.documentElement?.scrollHeight || 0) - window.innerHeight),
    []
  );

  /* Video setup */
  useEffect(() => {
    const v = vidRef.current;
    if (!v) return;

    const attemptPlay = () => {
      v.loop = true;
      v.muted = true;
      v.playsInline = true;
      v.preload = 'auto';
      v.play().catch(e => {
        v.pause();
      });
    };

    v.addEventListener('loadedmetadata', attemptPlay);
    v.addEventListener('loadeddata', attemptPlay);
    v.addEventListener('canplaythrough', attemptPlay);

    attemptPlay();

    return () => {
      v.removeEventListener('loadedmetadata', attemptPlay);
      v.removeEventListener('loadeddata', attemptPlay);
      v.removeEventListener('canplaythrough', attemptPlay);
    };
  }, []);

  /* Scroll handler med throttling og requestAnimationFrame */
  useEffect(() => {
    // 1. Scroll State Update (Throttled)
    const handleScrollThrottled = throttle(() => {
      const scrollY = window.scrollY || 0;
      const maxScroll = getMaxScroll();
      const progress = maxScroll > 0 ? clamp(scrollY / maxScroll, 0, 1) : 0;
      
      const easedProgress = ease(progress);

      setHeroState({
        opacity: Math.max(0, 1 - progress * 1.8), 
        shift: progress * 80, 
        scale: Math.max(0.9, 1 - progress * 0.15),
        parallax: easedProgress * 50, 
        videoScale: 1.05 + easedProgress * 0.1,
      });

    }, 16); 

    // 2. Element Animation (RequestAnimationFrame)
    const animateElements = () => {
      if (animatedRefs.current.length === 0) {
        animatedRefs.current = [
          titleRef.current,
          largeRef.current,
          ...smallRefs.current.filter(Boolean)
        ].filter(Boolean);
      }

      animatedRefs.current.forEach(el => {
        const progress = visibleProgress(el);
        const easedProgress = ease(progress);
        
        el.style.opacity = String(easedProgress);
        el.style.transform = `translateY(${(1 - easedProgress) * 40}px)`;
      });
      
      requestAnimationFrame(animateElements);
    };

    handleScrollThrottled(); 
    window.addEventListener('scroll', handleScrollThrottled, { passive: true });
    window.addEventListener('resize', handleScrollThrottled, { passive: true });
    
    const animFrame = requestAnimationFrame(animateElements);
    
    return () => {
      window.removeEventListener('scroll', handleScrollThrottled);
      window.removeEventListener('resize', handleScrollThrottled);
      cancelAnimationFrame(animFrame);
    };
  }, [getMaxScroll]);

  const handlePlayNowClick = () => {
    window.location.href = '/vote';
  };

  return (
    <>
      <GlobalStyle />

      <FixedBackground $fallbackImage={placeholderImage1}>
        <BackgroundVideo
          ref={vidRef}
          src={backgroundImage}
          muted
          playsInline
          preload="auto"
          $parallax={heroState.parallax}
          $scale={heroState.videoScale}
        />
      </FixedBackground>

      <StyledHeader>
        <Header />
      </StyledHeader>

      <AppContainer>
        {/* --- Hero Section --- */}
        <ContentContainer>
          <TitleContainer
            $opacity={heroState.opacity}
            $shift={heroState.shift}
            $scale={heroState.scale}
          >
            {/* Justerte margin-bottom for visuell balanse */}
            <TitleLetter src={voteV} alt="V" $letter="V" style={{ marginBottom: '-10px' }}/>
            <TitleDot />
            <TitleLetter src={voteO} alt="O" $letter="O" style={{ marginBottom: '-5px' }}/>
            <TitleDot />
            <TitleLetter src={voteT} alt="T" /> {/* T bruker nå den mindre standardstørrelsen */}
            <TitleDot />
            <TitleLetter src={voteE} alt="E" $letter="E" style={{ marginBottom: '-10px' }}/>
          </TitleContainer>

          <ButtonContainer
            $opacity={heroState.opacity}
            $shift={heroState.shift}
            $scale={heroState.scale}
          >
            <PlayButton onClick={handlePlayNowClick}>Play Now</PlayButton>
            <WatchTrailerButton>Watch Trailer</WatchTrailerButton>
          </ButtonContainer>
        </ContentContainer>

        {/* --- News Section --- */}
        <NewsSection>
          <NewsSectionTitle ref={titleRef}>Latest Updates</NewsSectionTitle>

          <CardContainer>
            {/* Large Card (Første kort i kolonnen) */}
            <LargeCard ref={largeRef} to="/update-vintra-vote">
              <CardImage $large image={placeholderImage1} />
              <CardContent $large>
                <div>
                  <CardDate>August 22, 2025</CardDate>
                  <CardTitle $large>V.O.T.E Update</CardTitle>
                  <CardDescription $large>
                    The Vintra/Vote website is under construction.
                    <br /><br />
                    The game Vote is well underway, two of the maps are under construction,
                    characters are being created, and the story of the game is being created bit by bit.
                  </CardDescription>
                </div>
              </CardContent>
            </LargeCard>

            <SmallCardContainer>
              {/* Small Card 1 (Art Gallery) */}
              <SmallCard 
                ref={el => (smallRefs.current[0] = el)} 
                to="/artwork" 
                >
                <CardImage image={placeholderImage2} />
                <CardContent>
                  <div>
                    <CardDate>V.O.T.E</CardDate>
                    <CardTitle>Art Gallery</CardTitle>
                    <CardDescription>
                      Check out our art gallery of the landscape and creatures you might see in the game.
                    </CardDescription>
                  </div>
                  <CardButton as="div">Explore</CardButton>
                </CardContent>
              </SmallCard>

              {/* Small Card 2 (Community Event) */}
              <SmallCard >
                <CardImage image={placeholderImage3} />
                <CardContent>
                  <div>
                    <span className="card-date">Jan, 2026</span>
                  <h3 className="card-title">Imposter Game</h3>
                  <p className="card-description" style={{ fontFamily: 'none' }}>
                    Try out our new imposter game! It's a fun way to test out who is the best lier among your friends.
                  </p>
                </div>
                <button className="card-button">
                  <a href="https://games.vintrastudio.com/" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none', color: 'inherit' }}>
                    Play Now
                  </a>
                </button>
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