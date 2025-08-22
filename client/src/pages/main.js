import React, { useEffect, useState } from 'react';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import { Link } from 'react-router-dom';
import Header from '../components/header';
import Footer from '../components/footer';
import backgroundImage from '../bilder/boy_2.mp4';
import placeholderImage1 from '../bilder/1.webp';
import placeholderImage2 from '../bilder/smart_gnome.png';
import placeholderImage3 from '../bilder/3.webp';

const fadeInBounce = keyframes`
  0% { opacity: 0; transform: translateY(-20px); }
  100%{ opacity: 1; transform: translateY(0); }
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

/* --- Video + L→R sweep med tåkekant --- */
/* --- Video + L→R sweep med tåkete, halvtransparent skygge --- */
const BackgroundContainer = styled.div`
  position: absolute;
  inset: 0;
  overflow: hidden;
`;

/* Litt overscan for å unngå “sømmer” i ytterkant */
const BackgroundVideo = styled.video`
  position: absolute;
  inset: -1vw;
  width: calc(100% + 2vw);
  height: calc(100% + 2vw);
  object-fit: cover;
  pointer-events: none;
`;
const SweepFog = styled.div`
  position: absolute;
  inset: -2vw;                  
  transform-origin: ${p => p.$origin}; 
  transform: scaleX(${p => p.$scale}); 
  transition: transform 900ms cubic-bezier(0.16, 1, 0.3, 1);
  pointer-events: none;

  --feather: 220px;  
  --dark: .35;      

  /* hovedbakgrunn – mørk halvtransparent skygge */
  background: rgba(0, 0, 0, var(--dark));
  mix-blend-mode: multiply;

  /* fade i kantene */
  -webkit-mask-image: ${p =>
    p.$origin === 'right'
      ? 'linear-gradient(to right, black 0%, black calc(100% - var(--feather)), transparent 100%)'
      : 'linear-gradient(to right, transparent 0%, black var(--feather), black 100%)'};
  mask-image: ${p =>
    p.$origin === 'right'
      ? 'linear-gradient(to right, black 0%, black calc(100% - var(--feather)), transparent 100%)'
      : 'linear-gradient(to right, transparent 0%, black var(--feather), black 100%)'};

  /* skygge/”dybde” effekt */
  box-shadow: ${p =>
    p.$origin === 'right'
      ? '-40px 0 60px rgba(0,0,0,0.55)'   /* shadow kastes mot venstre */
      : '40px 0 60px rgba(0,0,0,0.55)'};  /* shadow kastes mot høyre */

  /* gjør det mer hazy */
  filter: blur(6px);
  opacity: 0.95;

  /* ekstra tåke / tekstur */
  &::before {
    content: "";
    position: absolute;
    inset: 0;
    -webkit-mask-image: inherit;
    mask-image: inherit;
    background: radial-gradient(
      350px 250px at 20% 50%,
      rgba(255, 255, 255, 0.07) 0%,
      transparent 70%
    );
    opacity: 0.4;
    filter: blur(20px);
    mix-blend-mode: screen;
  }
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
  padding-top: 60px; /* juster etter header-høyde */
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

  @media (max-width: 768px) { display: none; }

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

  @media (max-width: 768px) { margin-left: 0; }

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

  @media (max-width: 1024px) { grid-template-columns: 1fr; }
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

  @media (max-width: 1024px) { grid-row: auto; }
`;

const SmallCardContainer = styled.div`
  display: grid;
  grid-template-rows: repeat(2, 1fr);
  gap: 30px;

  @media (max-width: 1024px) { grid-template-rows: auto; }
`;

const SmallCard = styled(Card)`
  display: flex;
  flex-direction: column;
`;

const CardImage = styled.div`
  width: 100%;
  padding-top: ${props => (props.large ? '70%' : '75%')};
  background-image: url(${props => props.image});
  background-size: cover;
  background-position: center;
  position: relative;
`;

const CardContent = styled.div`
  padding: ${props => (props.large ? '40px' : '25px')};
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  flex-grow: 1;
`;

const CardTitle = styled.h3`
  font-size: ${props => (props.large ? '2.8rem' : '2rem')};
  font-weight: 800;
  color: #ffffff;
  margin-bottom: 20px;
  line-height: 1.2;
`;

const CardDescription = styled.p`
  font-size: ${props => (props.large ? '1.4rem' : '1rem')};
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
  // (cursor state beholdes om du trenger den)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  useEffect(() => {
    const updateMousePosition = ev => setMousePosition({ x: ev.clientX, y: ev.clientY });
    window.addEventListener('mousemove', updateMousePosition);
    return () => window.removeEventListener('mousemove', updateMousePosition);
  }, []);

  // 🎥 Video + sweep-fade state
  const vidRef = React.useRef(null);
  const prevTimeRef = React.useRef(0);

  // scale: 1 => helt svart (dekker), 0 => åpen (ingen svart)
  const [sweepScale, setSweepScale] = useState(1);
  // origin: 'right' for åpning (avslør fra venstre), 'left' for lukking (dekk fra venstre)
  const [sweepOrigin, setSweepOrigin] = useState('right');
  const closingRef = React.useRef(false);

  useEffect(() => {
    const v = vidRef.current;
    if (!v) return;

    // Når video kan spille: åpne fra venstre (L→R)
    const onCanPlay = () => {
      setSweepOrigin('right');   // høyre side «står stille», svart trekker seg mot høyre
      setSweepScale(0);          // 1 -> 0 = åpning
    };

    const onTimeUpdate = () => {
      const t = v.currentTime || 0;
      const d = v.duration || 0;

      // Start lukking siste ~1s av loopen (L→R dekke)
      if (d && t > d - 1.0 && !closingRef.current) {
        closingRef.current = true;
        setSweepOrigin('left');  // venstre side står stille, sort vokser mot høyre
        setSweepScale(1);        // 0 -> 1 = dekke
      }

      // Loop oppdaget: tidsstempel hoppet tilbake => åpne igjen
      if (t < (prevTimeRef.current || 0)) {
        closingRef.current = false;
        // Sett panel klart til ny åpning: start «helt dekket fra høyre»
        setSweepOrigin('right');
        setSweepScale(1);
        // og på neste frame: trekk det bort mot høyre (avslør fra venstre)
        requestAnimationFrame(() => setSweepScale(0));
      }

      prevTimeRef.current = t;
    };

    v.addEventListener('canplay', onCanPlay);
    v.addEventListener('timeupdate', onTimeUpdate);
    return () => {
      v.removeEventListener('canplay', onCanPlay);
      v.removeEventListener('timeupdate', onTimeUpdate);
    };
  }, []);

  const handlePlayNowClick = () => {
    window.location.href = '/vote';
  };

  return (
    <>
      <GlobalStyle />
      <StyledHeader>
        <Header />
      </StyledHeader>

      <AppContainer>
        {/* 🎥 Bakgrunnsvideo + fades */}
       <BackgroundContainer>
  <BackgroundVideo
    ref={vidRef}
    src={backgroundImage}
    autoPlay
    muted
    loop
    playsInline
  />
  <SweepFog $origin={sweepOrigin} $scale={sweepScale} />
</BackgroundContainer>


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
                <CardDate>August 22, 2025</CardDate>
                <CardTitle large>V.O.T.E Update</CardTitle>
                <CardDescription large>
                  - The Vintra/Vote website is under construction.
                  <br /><br />
                  - The game Vote is well underway, two of the maps are under construction,
                  characters are being created, and the story of the game is being created bit by bit.
                  Check out our Art Gallary where you can see some of the creatures we are planning to add.
                </CardDescription>
              </div>
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
    </>
  );
}

export default App;
