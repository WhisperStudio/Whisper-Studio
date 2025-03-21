import React, { useRef, useEffect, useState } from 'react';
import styled, { css, createGlobalStyle } from 'styled-components';
import Norse from '../Fonts/Norse-KaWl.otf'; // Adjust path if needed
import Chill from '../Fonts/SortsMillGoudy-Regular.ttf';

import video1 from '../images/Forest with lights.mp4';

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=MedievalSharp&display=swap');

  @font-face {
    font-family: 'Norse';
    src: url(${Norse}) format('opentype');
    font-weight: normal;
    font-style: normal;
  }
  @font-face {
    font-family: 'Chill';
    src: url(${Chill}) format('truetype'); /* Sørg for at formatet er riktig */
    font-weight: normal;
    font-style: normal;
  }

  body {
    margin: 0;
    padding: 0;
    font-family: 'Norse', sans-serif;
    background-color: #0d0d0d;
    color: white;
  }
`;

const Container = styled.div`
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  background: #0d0d0d;
`;

const BackgroundVideo = styled.video`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;
  pointer-events: none;
  transition: filter 1s ease-out, opacity 2s ease-out;
  filter: ${({ isFading }) => (isFading ? 'brightness(0.9) grayscale(30%)' : 'none')};
`;

const DarkOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  /* Updated gradient to fade in at top, fade out in the middle, and fade back in at the bottom. */
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 1) 0%,
    rgba(0, 0, 0, 0.8) 5%,
    rgba(0, 0, 0, 0.7) 10%,
    rgba(0, 0, 0, 0.5) 15%,
    rgba(0, 0, 0, 0) 25%,
    rgba(0, 0, 0, 0) 75%,
    rgba(0, 0, 0, 0.5) 85%,
    rgba(0, 0, 0, 0.7) 90%,
    rgba(0, 0, 0, 0.8) 95%,
    rgba(0, 0, 0, 1) 100%
  );
  z-index: 2;
`;


const TextBox = styled.div`
  position: relative;
  left: 30vh;
  top: -12vh;
  z-index: 3;
  width: 60%;
  max-width: 800px;
  margin: 40vh auto 0 auto;
  text-align: center;
  padding: 20px;
  opacity: 0;
  transform: translateY(30px);
  transition: transform 0.6s ease-out, opacity 0.6s ease-out;
  will-change: transform, opacity;

  &.active {
    opacity: 1;
    transform: translateY(0);
  }

  h2 {
    font-family: 'Norse', sans-serif;
    font-size: 54px;
    margin-bottom: 60px;
    color: #e0c097;
  }

  p {
    font-family: 'Chill', sans-serif;
    font-size: 25px;
    line-height: 1.4;
  }
`;

function ScrollAnimation() {
  const bgVideoRef = useRef(null);
  const textRef = useRef(null);

  const [isTextVisible, setIsTextVisible] = useState(false);
  const [isFading, setIsFading] = useState(false);
  const [hasEnded, setHasEnded] = useState(false);
  const [slowedDown, setSlowedDown] = useState(false);

  // IntersectionObserver for the text box
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsTextVisible(true);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (textRef.current) {
      observer.observe(textRef.current);
    }
    return () => observer.disconnect();
  }, []);

  // Listen for video end
  useEffect(() => {
    const videoElement = bgVideoRef.current;
    if (!videoElement) return;

    const handleEnded = () => {
      setHasEnded(true);
      videoElement.playbackRate = 1; // freeze on last frame
    };

    videoElement.addEventListener('ended', handleEnded);
    return () => videoElement.removeEventListener('ended', handleEnded);
  }, []);

  // Pause/play video on scroll intersection (as long as it hasn't ended)
  useEffect(() => {
    const videoElement = bgVideoRef.current;
    if (!videoElement) return;

    const videoObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !hasEnded) {
            videoElement.play();
          } else if (!entry.isIntersecting && !hasEnded) {
            videoElement.pause();
          }
        });
      },
      { threshold: 0.5 }
    );

    videoObserver.observe(videoElement);

    return () => {
      if (videoElement) {
        videoObserver.unobserve(videoElement);
      }
    };
  }, [hasEnded]);

  // Fade out & slow down near the end
  useEffect(() => {
    const video = bgVideoRef.current;

    const handleTimeUpdate = () => {
      if (video && video.duration > 0) {
        const timeLeft = video.duration - video.currentTime;
        if (timeLeft <= 2 && !hasEnded) {
          setIsFading(true);
          if (!slowedDown) {
            video.playbackRate = 0.5;
            setSlowedDown(true);
          }
        }
      }
    };

    if (video) {
      video.addEventListener('timeupdate', handleTimeUpdate);
    }
    return () => {
      if (video) {
        video.removeEventListener('timeupdate', handleTimeUpdate);
      }
    };
  }, [hasEnded, slowedDown]);

  return (
    <>
      <GlobalStyle />
      <Container>
        <BackgroundVideo
          ref={bgVideoRef}
          src={video1}
          muted
          playsInline
          preload="metadata"
          isFading={isFading}
        />
        <DarkOverlay />

        {/* Only the “About the game” text remains */}
        <TextBox
          ref={textRef}
          className={isTextVisible ? 'active' : ''}
        >
          <h2>About the game</h2>
          <p>
          Our game takes you on a mysterious journey into the unknown.
           You play as a young boy living deep in the woods with his father.
            One day, your father disappears without a trace, leaving behind an eerie silence and a strange VR headset. 
            Curious and desperate, you put it on, only to be pulled into a dark and haunting world unlike anything you’ve ever known.
            To uncover the truth and find your father, you must explore this chilling new reality, where danger lurks in every shadow, and nothing is as it seems.
          </p>
        </TextBox>
      </Container>
    </>
  );
}

export default ScrollAnimation;
