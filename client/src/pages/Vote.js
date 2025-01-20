import React, { useRef, useState, useEffect } from 'react';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import backgroundVideo from '../bilder/Forest witout lights.mp4';
import AnimationSection from '../components/info';

// Global styles
const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  body {
    font-family: Arial, Helvetica, sans-serif;
    background: #000;
    overflow-y: auto;
    overflow-x: hidden;
  }
`;

// Side- og bakgrunnskomponenter
const PageContainer = styled.div`
  position: relative;
  width: 100vw;
  height: 100vh;
`;

const StarryBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #01161c;
  z-index: 0;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 1px;
    height: 1px;
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
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1;
  opacity: ${({ fadeOut }) => (fadeOut ? 0 : 1)};
  transition: opacity 2s ease;
`;

const DarkOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(66, 64, 64, 0.1);
  z-index: 2;
`;

// Innhold- og layoutkomponenter
const ContentWrapper = styled.div`
  position: relative;
  z-index: 3;
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

// Keyframes for bokstav-animasjon (oppover bevegelse)
const fadeInUp = keyframes`
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

// Container for "VOTE" – animerer hver bokstav for seg
const VoteTextContainer = styled.h1`
  font-size: 10rem;
  color: #ffffff;
  text-shadow: 0 0 20px rgba(121, 121, 121, 0.8),
               0 0 30px rgba(121, 121, 121, 0.8);
  font-family: 'Cinzel', serif;
  line-height: 1.2;
  letter-spacing: 0.5rem;
  margin-bottom: 2rem;
  display: flex;
  
  span {
    opacity: 0;
    animation: ${fadeInUp} 0.5s ease forwards;
  }
`;

// Ekstra tekst og knapp – vises etter at videoen er ferdig
const ExtraContent = styled.div`
  text-align: center;
  color: #ffffff;
  opacity: ${({ show }) => (show ? 1 : 0)};
  transition: opacity 1s ease;
`;

const WhisperStudioHeader = styled.h2`
  font-size: 3rem;
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 0 15px rgba(0, 0, 0, 0.8);
  font-family: 'Cinzel', serif;
  margin-bottom: 1rem;
`;

const UnderText = styled.span`
  font-size: 2rem;
  color: rgba(200, 200, 200, 0.8);
  text-shadow: 0 0 10px rgba(0, 0, 0, 0.8);
  display: block;
`;

const DownloadButton = styled.button`
  margin-top: 2rem;
  padding: 1rem 2rem;
  font-size: 1.5rem;
  font-family: 'Cinzel', serif;
  color: #ffffff;
  background-color: #008080;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  text-shadow: 0 0 15px rgba(0, 0, 0, 0.8);
  transition: background-color 0.3s ease, transform 0.3s ease, opacity 1s ease;
  opacity: ${({ show }) => (show ? 1 : 0)};

  &:hover {
    background-color: #0a9396;
    transform: scale(1.05);
  }
`;

const PageWrapper = styled.div`
  display: block;
`;

const VotePage = () => {
  const videoRef = useRef(null);
  const [fadeOutVideo, setFadeOutVideo] = useState(false);
  const [showExtra, setShowExtra] = useState(false);
  const [videoDuration, setVideoDuration] = useState(null);

  // Bokstavene for "VOTE"
  const voteLetters = 'VOTE'.split('');

  // Kalkuler dynamiske delays slik at siste bokstav (E) vises rett før videoen fader ut.
  const getDelay = (index) => {
    if (!videoDuration) {
      // Fallback: 0s, 0.5s, 1s, 1.5s
      return `${index * 0.5}s`;
    }
    const totalAnimationTime = videoDuration - 1; // siste bokstav vises 1 sekund før slutten
    const delay = (totalAnimationTime / (voteLetters.length - 1)) * index;
    return `${delay}s`;
  };

  // Sett videoDuration når metadata er lastet inn
  useEffect(() => {
    const handleLoadedMetadata = () => {
      if (videoRef.current) {
        setVideoDuration(videoRef.current.duration);
      }
    };

    const videoElem = videoRef.current;
    if (videoElem) {
      videoElem.addEventListener('loadedmetadata', handleLoadedMetadata);
    }

    return () => {
      if (videoElem) {
        videoElem.removeEventListener('loadedmetadata', handleLoadedMetadata);
      }
    };
  }, []);

  // Overvåk videoens tid for å trigge fade-out rett før den avsluttes
  useEffect(() => {
    const handleTimeUpdate = () => {
      if (!videoRef.current) return;
      const { currentTime, duration } = videoRef.current;
      const timeLeft = duration - currentTime;
      if (timeLeft <= 1 && !fadeOutVideo) {
        setFadeOutVideo(true);
      }
    };

    const videoElem = videoRef.current;
    if (videoElem) {
      videoElem.addEventListener('timeupdate', handleTimeUpdate);
    }

    return () => {
      if (videoElem) {
        videoElem.removeEventListener('timeupdate', handleTimeUpdate);
      }
    };
  }, [fadeOutVideo]);

  // Når videoen har faded ut, vis den ekstra teksten (Whisper Studio, undertekst og knapp)
  useEffect(() => {
    if (fadeOutVideo) {
      const timer = setTimeout(() => {
        setShowExtra(true);
      }, 2000); // 2 sekund tilsvarer videoens fade-out transition
      return () => clearTimeout(timer);
    }
  }, [fadeOutVideo]);

  return (
    <>
      <GlobalStyle />
      <PageWrapper>
        <PageContainer>
          <StarryBackground />
          <BackgroundVideo
            ref={videoRef}
            src={backgroundVideo}
            autoPlay
            muted
            playsInline
            fadeOut={fadeOutVideo}
          />
          <DarkOverlay />
          <ContentWrapper>
            {/* "VOTE" animeres bokstav for bokstav */}
            <VoteTextContainer>
              {voteLetters.map((letter, index) => (
                <span key={index} style={{ animationDelay: getDelay(index) }}>
                  {letter}
                </span>
              ))}
            </VoteTextContainer>
            {/* Ekstra tekst og knapp vises først etter at videoen er ferdig */}
            <ExtraContent show={showExtra}>
              <WhisperStudioHeader>Whisper Studio</WhisperStudioHeader>
              <UnderText>Veil of the Eldertrees</UnderText>
            </ExtraContent>
            <DownloadButton show={showExtra}>DOWNLOAD</DownloadButton>
          </ContentWrapper>
        </PageContainer>

        <AnimationSection />
      </PageWrapper>
    </>
  );
};

export default VotePage;
