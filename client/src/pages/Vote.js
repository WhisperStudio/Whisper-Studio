import React, { useRef, useState, useEffect } from 'react';
import styled, { createGlobalStyle } from 'styled-components';
import backgroundVideo from '../bilder/336667194693640196 (2).mp4'; // Your mp4 here

// 1) Global styles: reset margins, etc.
const GlobalStyle = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  body {
    font-family: Arial, Helvetica, sans-serif;
    overflow: hidden;
    background: #000; /* Fallback if needed */
  }
`;

// 2) Page Container
const PageContainer = styled.div`
  position: relative;
  width: 100vw;
  height: 100vh;
  overflow: hidden;
`;

// 3) A starry background that always stays behind everything.
//    This example uses a small "box-shadow" trick to scatter some stars.
//    Feel free to add more star coordinates for higher density.
const StarryBackground = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #000; 
  overflow: hidden;
  z-index: 0; /* Behind video & overlay */

  /* Pseudo-element with star "dots" via box-shadow. Expand as needed. */
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    /* A single tiny dot that will be copied by box-shadow across the screen: */
    width: 1px;
    height: 1px;
    background: transparent;
    
    /* Each pair (x y #color) represents one 'star'. Add as many as you like. */
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

// 4) The background video that we will fade out
const BackgroundVideo = styled.video`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 1; /* Above the starry background */

  /* Fade out transition when the 'fadeOut' prop becomes true */
  opacity: ${({ fadeOut }) => (fadeOut ? 0 : 1)};
  transition: opacity 2s ease;
`;

// 5) A dark semi-transparent overlay that is ALWAYS visible
//    (making the background appear more “black” from the start)
const DarkOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  /* Adjust opacity to taste—closer to 1 means darker */
  background-color: rgba(0, 0, 0, 0.3);
  z-index: 2; /* Over the video */
`;

// 6) Your text/content, placed above the overlay
const ContentWrapper = styled.div`
  position: relative;
  z-index: 3; /* Above the dark overlay */
  width: 100%;
  height: 100%;

  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

// The large "VOTE" text
const VoteText = styled.h1`
  font-size: 10rem;
  color: #ffffff;
  text-shadow: 0 0 20px rgba(0, 255, 255, 0.8), 
               0 0 30px rgba(0, 255, 255, 0.6);
  font-family: 'Cinzel', serif;
  line-height: 1.2;
  letter-spacing: 0.5rem;
  margin-bottom: 2rem;

  &::before {
    content: 'Whisper Studio';
    display: block;
    font-size: 3rem;
    color: rgba(255, 255, 255, 0.8);
    text-shadow: 0 0 15px rgba(0, 0, 0, 0.8);
    margin-bottom: 10px;
  }

  span {
    display: block;
    font-size: 2rem;
    color: rgba(200, 200, 200, 0.8);
    text-shadow: 0 0 10px rgba(0, 0, 0, 0.8);
  }
`;

// A Download button
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
  transition: background-color 0.3s ease, transform 0.3s ease;

  &:hover {
    background-color: #0a9396;
    transform: scale(1.05);
  }
`;

const VotePage = () => {
  const videoRef = useRef(null);
  // Whether the video has started fading out
  const [fadeOutVideo, setFadeOutVideo] = useState(false);

  useEffect(() => {
    const handleTimeUpdate = () => {
      if (!videoRef.current) return;

      const { currentTime, duration } = videoRef.current;
      const timeLeft = duration - currentTime;

      // Fade the video out 3s before it ends (adjust as desired)
      if (timeLeft <= 1 && !fadeOutVideo) {
        setFadeOutVideo(true);
      }
    };

    const videoElement = videoRef.current;
    if (videoElement) {
      videoElement.addEventListener('timeupdate', handleTimeUpdate);
    }

    return () => {
      if (videoElement) {
        videoElement.removeEventListener('timeupdate', handleTimeUpdate);
      }
    };
  }, [fadeOutVideo]);

  return (
    <>
      <GlobalStyle />
      <PageContainer>
        {/* 1) Starry background behind everything */}
        <StarryBackground />

        {/* 2) The video on top, which will fade out near the end */}
        <BackgroundVideo
          ref={videoRef}
          src={backgroundVideo}
          autoPlay
          muted
          playsInline
          fadeOut={fadeOutVideo}
        />

        {/* 3) A dark overlay ALWAYS visible over the video */}
        <DarkOverlay />

        {/* 4) Your text content at the top layer */}
        <ContentWrapper>
          <VoteText>
            VOTE
            <span>Veil of the Eldertrees</span>
          </VoteText>
          <DownloadButton>DOWNLOAD</DownloadButton>
        </ContentWrapper>
      </PageContainer>
    </>
  );
};

export default VotePage;
