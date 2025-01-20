import React, { useRef, useState, useEffect } from 'react';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import backgroundVideo from '../images/Forest witout lights.mp4';
import AnimationSection from '../components/info';
import Header from '../components/header'; // Juster banen om nødvendig

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

// Bakgrunnskomponenter
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
`;

const DarkOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to bottom, 
    rgba(0, 0, 0, 0) 70%, 
    rgba(0, 0, 0, 0.6) 80%,
    rgba(0, 0, 0, 0.7) 90%,
    rgba(0, 0, 0, 0.8) 100%
  );
  z-index: 2;
`;

// Innholdslag – holder alt over videoen
const ContentWrapper = styled.div`
  position: relative;
  z-index: 3;
  width: 100%;
  height: 100%;
`;

// Container for VOTE-teksten – alltid midt på skjermen
const VoteContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

// Animasjonskeyframes for VOTE-bokstavene
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

// VOTE-teksten – animeres bokstav for bokstav
const VoteText = styled.h1`
  font-size: 10rem;
  color: #ffffff;
  font-family: 'Cinzel', serif;
  letter-spacing: 0.5rem;
  display: flex;
  gap: 0.5rem;
  
  span {
    opacity: 0;
    animation: ${fadeInUp} 0.5s ease forwards;
  }
`;

// TopOverlay – for "Whisper Studio", plassert 12rem over VOTE
const TopOverlay = styled.div`
  position: absolute;
  top: calc(50% - 12rem);
  left: 50%;
  transform: translateX(-50%);
  z-index: 4;
  opacity: ${({ show }) => (show ? 1 : 0)};
  transition: opacity 1s ease;
`;

const TopText = styled.h2`
  font-size: 3rem;
  font-family: 'Cinzel', serif;
  color: rgba(200, 200, 200, 0.8);
  text-shadow: 0 0 15px rgba(0, 0, 0, 0.8);
`;

// UnderOverlay – for "Veil of the Eldertrees", plassert 12rem under VOTE
const UnderOverlay = styled.div`
  position: absolute;
  top: calc(50% + 10rem);
  left: 50%;
  transform: translateX(-50%);
  z-index: 4;
  opacity: ${({ show }) => (show ? 1 : 0)};
  transition: opacity 1s ease;
`;

const UnderText = styled.span`
  font-size: 2rem;
  font-family: 'Cinzel', serif;
  color: rgba(200, 200, 200, 0.8);
  text-shadow: 0 0 10px rgba(0, 0, 0, 0.8);
  display: block;
`;

// DownloadOverlay – for DOWNLOAD-knappen, plassert 12rem under UnderOverlay
const DownloadOverlay = styled.div`
  position: absolute;
  top: calc(50% + 24rem);
  left: 50%;
  transform: translateX(-50%);
  z-index: 4;
  opacity: ${({ show }) => (show ? 1 : 0)};
  transition: opacity 1s ease;
`;

const DownloadButton = styled.button`
  padding: 1rem 2rem;
  font-size: 1.5rem;
  font-family: 'Cinzel', serif;
  color: #ffffff;
  background-color: #008080;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  text-shadow: 0 0 15px rgba(0, 0, 0, 0.8);
  transition: background-color 0.3s ease, transform 0.3s ease;
  
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
  const [showWhisper, setShowWhisper] = useState(false);
  const [showUnder, setShowUnder] = useState(false);
  const [showDownload, setShowDownload] = useState(false);
  const [videoDuration, setVideoDuration] = useState(null);

  // Bokstavene for VOTE
  const voteLetters = 'VOTE'.split('');

  // Kalkuler dynamiske delays slik at bokstavene animeres med litt mellomrom
  const getDelay = (index) => {
    if (!videoDuration) {
      return `${index * 0.5}s`;
    }
    const totalAnimationTime = videoDuration - 1; // siste bokstav animeres 1 sekund før videoen stopper
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

  /* 
    For en mykere stopp: Når videoen nærmer seg slutten reduserer vi playbackRate (slow-motion).
    Når det er mindre enn 0.5 sekunder igjen, stopper vi videoen og triggere sekvensiell visning:
      1. Først vises Whisper Studio.
      2. Etter 500 ms vises Veil of the Eldertrees.
      3. Etter ytterligere 500 ms vises DOWNLOAD-knappen.
  */
  useEffect(() => {
    const handleTimeUpdate = () => {
      if (!videoRef.current || !videoDuration) return;
      const { currentTime, playbackRate } = videoRef.current;
      const timeLeft = videoDuration - currentTime;

      if (timeLeft <= 2 && playbackRate !== 0.3) {
        videoRef.current.playbackRate = 0.3;
      }

      if (timeLeft <= 0.5) {
        videoRef.current.pause();
        // Start sekvensiell visning med en liten forsinkelse mellom hvert steg
        setShowWhisper(true);
        setTimeout(() => {
          setShowUnder(true);
          setTimeout(() => {
            setShowDownload(true);
          }, 500);
        }, 500);
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
  }, [videoDuration]);

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
            autoPlay
            muted
            playsInline
          />
          <DarkOverlay />
          <ContentWrapper>
            {/* VOTE-teksten vises alltid midt på skjermen */}
            <VoteContainer>
              <VoteText>
                {voteLetters.map((letter, index) => (
                  <span key={index} style={{ animationDelay: getDelay(index) }}>
                    {letter}
                  </span>
                ))}
              </VoteText>
            </VoteContainer>
            {/* Overlays som dukker opp sekvensielt */}
            <TopOverlay show={showWhisper}>
              <TopText>Whisper Studio</TopText>
            </TopOverlay>
            <UnderOverlay show={showUnder}>
              <UnderText>Veil of the Eldertrees</UnderText>
            </UnderOverlay>
            <DownloadOverlay show={showDownload}>
              <DownloadButton>DOWNLOAD</DownloadButton>
            </DownloadOverlay>
          </ContentWrapper>
        </PageContainer>
        <AnimationSection />
      </PageWrapper>
    </>
  );
};

export default VotePage;
