import React, { useRef, useState, useEffect } from 'react';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import { Link } from 'react-router-dom';
import backgroundVideo from '../images/Forest witout lights.mp4';
import rune from '../images/Rune.png';
import AnimationSection from '../components/info';
import AnimationSection2 from '../components/info2';
import Header from '../components/header';
import Countdown from '../components/Countdown';
import Norse from '../Fonts/Norse-KaWl.otf';
import backgroundMusic from '../bilder/VOTE THEME 1.mp3';
import placeholderImage1 from '../bilder/1.webp';
import placeholderImage2 from '../bilder/smart_gnome.png';
import placeholderImage3 from '../bilder/3.webp';
import  CharacterScrollytelling  from "../components/CharacterScrollytelling"; // <-- bruk riktig relativ sti hvis du la den nederst i samme fil, dropp import


const GlobalStyle = createGlobalStyle`
  * { margin: 0; padding: 0; box-sizing: border-box; }
  @font-face {
    font-family: 'Norse';
    src: url(${Norse}) format('opentype');
  }
  body {
    font-family: Arial, Helvetica, sans-serif;
    background: #000;
    overflow-x: hidden;
  }
`;

const PageWrapper = styled.div`
  display: block;
`;

const PageContainer = styled.div`
  position: relative;
  width: 100vw;
  height: 100vh;
`;

const StarryBackground = styled.div`
  position: absolute; inset: 0;
  background: #01161c;
  z-index: 0;
  &::after {
    content: '';
    position: absolute; inset: 0;
    width: 1px; height: 1px;
    background: transparent;
    box-shadow:
      30px 90px #fff,
      80px 150px #fff,
      120px 300px #fff,
      200px 75px #fff,
      400px 400px #fff,
      650px 250px #fff,
      900px 580px #fff,
      1100px 200px #fff,
      1300px 700px #fff,
      1600px 350px #fff;
  }
`;

const BackgroundVideo = styled.video`
  position: absolute; inset: 0;
  width: 100%; height: 100%;
  object-fit: cover;
  z-index: 1;
`;

const DarkOverlay = styled.div`
  position: absolute; inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(0,0,0,0) 0%,
    rgba(0,0,0,0.2) 70%,
    rgba(0,0,0,0.4) 75%,
    rgba(0,0,0,0.6) 80%,
    rgba(0,0,0,0.8) 85%,
    rgba(0,0,0,1) 100%
  );
  z-index: 2;
`;

const ContentWrapper = styled.div`
  position: relative;
  z-index: 3;
  width: 100%; height: 100%;
`;

const VoteContainer = styled.div`
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const fadeInUp = keyframes`
  from { opacity: 0; transform: translateY(20px) }
  to   { opacity: 1; transform: translateY(0) }
`;

const VoteText = styled.h1`
  font-size: 10rem;
  color: #fff;
  font-family: 'Cinzel', serif;
  letter-spacing: .5rem;
  display: flex;
  gap: .5rem;

  span {
    opacity: 0;
    animation: ${fadeInUp} 0.5s ease forwards;
  }
`;

const TopOverlay = styled.div`
  position: absolute;
  top: calc(50% - 12rem);
  left: 50%;
  transform: translateX(-50%);
  opacity: ${({ show }) => (show ? 1 : 0)};
  transition: opacity 1s ease;
  z-index: 4;
`;

const TopText = styled.h2`
  font-size: 3rem;
  font-family: 'Cinzel', serif;
  color: rgba(200,200,200,0.8);
  text-shadow: 0 0 15px rgba(0,0,0,0.8);
`;

const UnderOverlay = styled.div`
  position: absolute;
  top: calc(50% + 10rem);
  left: 50%;
  transform: translateX(-50%);
  opacity: ${({ show }) => (show ? 1 : 0)};
  transition: opacity 1s ease;
  text-align: center;
  z-index: 4;
`;

const UnderText = styled.span`
  font-size: 2rem;
  font-family: 'Cinzel', serif;
  color: rgba(200,200,200,0.8);
  text-shadow: 0 0 10px rgba(0,0,0,0.8);
  display: block;
`;

const PlayMusicButton = styled.button`
  margin-top: 1rem;
  padding: .8rem 1.5rem;
  font-size: 1.2rem;
  font-family: 'Cinzel', serif;
  background: #444; color: #fff;
  border: 2px solid #aaa;
  border-radius: 5px;
  cursor: pointer;
  transition: background .3s;
  &:hover { background: #666; }
`;

const FancyDivider = styled.div`
  position: absolute;
  background-image: linear-gradient(transparent,black,black,transparent);
  margin-top: -200px;
  left: 50%;
  transform: translateX(-50%);
  width: 100%; height: 25%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 5;
`;

const FancyDivider2 = styled.div`
 position: absolute;
  background-image: linear-gradient(transparent,black,black,transparent);
  margin-top: -100px;
  left: 50%;
  transform: translateX(-50%);
  width: 100%; height: 25%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 5;
`;
const FancyDivider3 = styled.div`
  position: absolute;
  background-image: linear-gradient(transparent,black,black,transparent);
  margin-top: -240px;
  left: 50%;
  transform: translateX(-50%);
  width: 100%; height: 25%;
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 5;
`;

const CenterRune = styled.img`
  width: 100%; height: 25%;
  object-fit: contain;
  opacity: .7;
  border-radius: 3px;
`;



const NewsSection = styled.section`
  background: #0a0a0a;
  padding: 100px 5% 80px;
  box-sizing: border-box;
  min-height: 100vh;
`;

const NewsSectionTitle = styled.h2`
  color: #fff;
  font-size: 4rem;
  text-align: center;
  font-weight: 800;
  letter-spacing: 2px;
  text-transform: uppercase;
  margin-top: 40px;
  margin-bottom: 80px;
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: 2fr 1fr;
  grid-template-rows: repeat(2, auto);
  gap: 30px;
  max-width: 1600px;
  margin: 0 auto;

  @media(max-width:1024px) {
    grid-template-columns: 1fr;
  }
`;

const BaseCard = styled.div`
  background: #1a1a1a;
  color: #fff;
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 15px 40px rgba(0,0,0,0.2);
  display: flex;
  flex-direction: column;
  transition: transform .3s, box-shadow .3s;
  &:hover {
    transform: translateY(-10px);
  }
`;

const LargeCard = styled(BaseCard)`
  grid-row: span 2;
  @media(max-width:1024px) {
    grid-row: auto;
  }
`;

const SmallGroup = styled.div`
  display: grid;
  grid-template-rows: repeat(2,1fr);
  gap: 30px;
  @media(max-width:1024px) {
    grid-template-rows: auto;
  }
`;

const SmallCard = styled(BaseCard)``;

const CardImage = styled.div`
  width: 100%;
  padding-top: ${({ large }) => (large ? '70%' : '75%')};
  background: url(${({ image }) => image}) center/cover no-repeat;
`;

const CardContent = styled.div`
  padding: ${({ large }) => (large ? '40px' : '25px')};
  flex: 1;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
`;

const CardDate = styled.span`
  color: rgba(255,255,255,0.6);
  font-size: 1rem;
  font-weight: 600;
  margin-bottom: 15px;
`;

const CardTitle = styled.h3`
  color: #fff;
  font-size: ${({ large }) => (large ? '2.8rem' : '2rem')};
  font-weight: 800;
  line-height: 1.2;
  margin-bottom: 20px;
`;

const CardDescription = styled.p`
  color: rgba(255,255,255,0.8);
  font-size: ${({ large }) => (large ? '1.4rem' : '1rem')};
  line-height: 1.8;
  margin-bottom: 30px;
`;

const CardButton = styled.button`
  padding: 14px 28px;
  margin-top: auto;
  margin-bottom: auto;
  background: #1a1a1a;
  color: #fff;
  border: 2px rgba(158, 158, 158, 0.78) solid;
  border-radius: 50px;
  font-size: 1.1rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 1px;
  cursor: pointer;
  align-self: flex-start;
  transition: border ease-in-out;
  &:hover {
    border: 2px rgba(158, 158, 158, 0.78) solid;
    box-shadow: 0 10px 20px rgba(100, 100, 100, 0.4);
  }
`;

const MuteButton = styled.button`
  position: fixed;
  bottom: 2rem; left: 2rem;
  padding: .8rem 1.2rem;
  font-family: 'Norse', serif;
  background: #333; color: #fff;
  border: 2px solid #e0c097;
  border-radius: 5px;
  cursor: pointer;
  z-index: 9999;
  transition: background .3s, transform .3s;
  &:hover { background: #444; transform: scale(1.05); }
`;

export default function VotePage() {
  const videoRef = useRef();
  const audioRef = useRef();
  const [videoDuration, setVideoDuration] = useState(null);
  const [showWhisper, setShowWhisper] = useState(false);
  const [showUnder, setShowUnder] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [hasStarted, setHasStarted] = useState(false);

  const voteLetters = 'VOTE'.split('');
  const getDelay = i => !videoDuration ? `${i * .5}s`
    : `${((videoDuration - 1) / (voteLetters.length - 1)) * i}s`;

  useEffect(() => {
    const vid = videoRef.current;
    const onMeta = () => setVideoDuration(vid.duration);
    vid?.addEventListener('loadedmetadata', onMeta);
    return () => vid?.removeEventListener('loadedmetadata', onMeta);
  }, []);

  useEffect(() => {
    const vid = videoRef.current;
    const onTime = () => {
      if (!vid || !videoDuration) return;
      const timeLeft = videoDuration - vid.currentTime;
      if (timeLeft <= 2 && vid.playbackRate !== .3) vid.playbackRate = .3;
      if (timeLeft <= .5) {
        vid.pause();
        setShowWhisper(true);
        setTimeout(() => setShowUnder(true), 500);
      }
    };
    vid?.addEventListener('timeupdate', onTime);
    return () => vid?.removeEventListener('timeupdate', onTime);
  }, [videoDuration]);

  const handlePlayMusic = () => {
    const aud = audioRef.current;
    aud.muted = false;
    aud.play().then(() => {
      setIsMuted(false);
      setHasStarted(true);
    }).catch(() => {});
  };

  const handleToggleMute = () => {
    const aud = audioRef.current;
    if (!aud) return;
    if (isMuted) {
      aud.muted = false;
      aud.play().catch(() => {});
    } else aud.muted = true;
    setIsMuted(x => !x);
  };

  return (
    <>
      <GlobalStyle />
      <Header />
      <PageWrapper>
        <PageContainer>
          <StarryBackground />
          <BackgroundVideo
            ref={videoRef}
            src={backgroundVideo}
            autoPlay muted playsInline
          />
          <DarkOverlay />
          <ContentWrapper>
            <VoteContainer>
              <VoteText>
                {voteLetters.map((l,i) => (
                  <span key={i} style={{ animationDelay: getDelay(i) }}>
                    {l}
                  </span>
                ))}
              </VoteText>
            </VoteContainer>
            <TopOverlay show={showWhisper}>
              <TopText>Whisper Studio</TopText>
            </TopOverlay>
            <UnderOverlay show={showUnder}>
              <UnderText>Veil of the Eldertrees</UnderText>
              <Countdown />
              {!hasStarted && (
                <PlayMusicButton onClick={handlePlayMusic}>
                  Play music
                </PlayMusicButton>
              )}
            </UnderOverlay>
          </ContentWrapper>
          <FancyDivider>
            <CenterRune src={rune} alt="Rune" />
          </FancyDivider>
          <audio ref={audioRef} src={backgroundMusic} loop muted />
        </PageContainer>

        {hasStarted && (
          <MuteButton onClick={handleToggleMute}>
            {isMuted ? 'Unmute' : 'Mute'}
          </MuteButton>
        )}

        <AnimationSection />
        <FancyDivider2>
          <CenterRune src={rune} alt="Rune" />
        </FancyDivider2>
        <AnimationSection2 />
        <CharacterScrollytelling />
      </PageWrapper>

      

      <NewsSection>
      <FancyDivider3>
      <CenterRune src={rune} alt="Rune" />
      </FancyDivider3>
        <NewsSectionTitle>Latest Updates</NewsSectionTitle>
        <CardGrid>
          <LargeCard>
            <CardImage large image={placeholderImage1} />
            <CardContent large>
              <div>
                <CardDate>June 20, 2025</CardDate>
                <CardTitle large>V.O.T.E Update</CardTitle>
                <CardDescription large style={{ fontFamily: 'none' }}>
                  We are currently working on the games map, animations, characters and story. Check out our Art gallery where you can explore some of the characters and destinations we are currently making.  
                </CardDescription>
              </div>
              <CardButton>Learn More</CardButton>
            </CardContent>
          </LargeCard>

          <SmallGroup>
            <SmallCard>
              <CardImage image={placeholderImage2} />
              <CardContent>
                <div>
                  <CardDate>V.O.T.E</CardDate>
                  <CardTitle>Art Gallery</CardTitle>
                  <CardDescription style={{ fontFamily: 'none' }}>
                    Check out our art gallery of the landscape and creatures you might see in the game.
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
                  <CardDescription style={{ fontFamily: 'none' }}>
                    Join our upcoming community event and compete for exclusive rewards. Don’t miss out!
                  </CardDescription>
                </div>
                <CardButton>Join Now</CardButton>
              </CardContent>
            </SmallCard>
          </SmallGroup>
        </CardGrid>
      </NewsSection>
    </>
  );
}
