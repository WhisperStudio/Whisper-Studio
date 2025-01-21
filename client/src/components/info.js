import React, { useRef, useEffect, useState } from 'react';
import styled, { css, createGlobalStyle } from 'styled-components';
import Norse from '../Fonts/Norse-KaWl.otf'; // Sti til fontfilen

// Mediefiler
import video1 from '../images/Forest with lights.mp4';
import bilde3 from '../images/placeholder.com-1280x720.webp';

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=MedievalSharp&display=swap');

  @font-face {
    font-family: 'Norse';
    src: url(${Norse}) format('opentype');
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
  /* Lang side for scrolling */
  min-height: 200vh;
  position: relative;
  overflow: hidden;
  background: #0d0d0d;
`;

const BackgroundVideo = styled.video`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 40%;
  object-fit: cover;
  z-index: 0;
  pointer-events: none;
  transition: filter 1s ease-out, opacity 2s ease-out;
  filter: ${({ isFading }) => (isFading ? 'brightness(0.8) grayscale(20%)' : 'none')};
`;

const DarkOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 1) 0%,
    rgba(0, 0, 0, 0.8) 5%,
    rgba(0, 0, 0, 0.5) 10%,
    rgba(0, 0, 0, 0.4) 15%,
    rgba(0, 0, 0, 0.0) 25%
  );
  z-index: 2;
`;

const Box = styled.div`
  padding: 20px;
  width: 40%;
  color: white;
  opacity: 0;
  transition: transform 0.6s ease-out, opacity 0.6s ease-out;
  will-change: transform, opacity;
  position: relative;
  margin: 120px 0;
  z-index: 3;

  ${({ align }) =>
    align === 'left' &&
    css`
      margin-left: 10%;
      margin-right: auto;
    `}

  ${({ align }) =>
    align === 'right' &&
    css`
      margin-left: auto;
      margin-right: 10%;
    `}

  &.active {
    opacity: 1;
    transform: translateX(0);
  }

  ${({ extraMargin }) =>
    extraMargin &&
    css`
      margin-top: ${extraMargin}px;
    `}
`;

const TextBox = styled(Box)`
  top: 60px;
  font-size: 20px;
  line-height: 1.4;
  text-align: center;

  h2 {
    font-family: 'Norse', sans-serif;
    font-size: 36px;
    margin-bottom: 30px;
    color: #e0c097;
  }

  p {
    font-family: 'MedievalSharp', sans-serif;
  }
`;

const ImageBox = styled(Box)`
  img {
    width: 100%;
    height: auto;
    display: block;
  }
`;

function ScrollAnimation() {
  const elementRefs = useRef([]);
  elementRefs.current = [];

  const [visibleItems, setVisibleItems] = useState(new Array(5).fill(false));
  const [isFading, setIsFading] = useState(false);

  // For å spore når videoen er ferdig, slik at den ikke starter på nytt:
  const [hasEnded, setHasEnded] = useState(false);

  const bgVideoRef = useRef(null);

  const addToRefs = (el) => {
    if (el && !elementRefs.current.includes(el)) {
      elementRefs.current.push(el);
    }
  };

  // IntersectionObserver for boksene
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const index = elementRefs.current.indexOf(entry.target);
            if (index !== -1) {
              setVisibleItems((prev) => {
                const updated = [...prev];
                updated[index] = true;
                return updated;
              });
              observer.unobserve(entry.target);
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    elementRefs.current.forEach((ref) => observer.observe(ref));
    return () => observer.disconnect();
  }, []);

  // Legg til en "ended"-event for å vite når videoen er ferdig.
  useEffect(() => {
    const videoElement = bgVideoRef.current;
    if (!videoElement) return;

    const handleEnded = () => {
      // Når videoen er ferdig, setter vi hasEnded = true
      // da fryser videoen (blir stående på siste frame).
      setHasEnded(true);
    };

    videoElement.addEventListener('ended', handleEnded);

    return () => {
      videoElement.removeEventListener('ended', handleEnded);
    };
  }, []);

  // IntersectionObserver for selve videoen.
  // Starter og pauser videoen ved scroll, men kun så lenge den IKKE er ferdigspilt.
  useEffect(() => {
    const videoElement = bgVideoRef.current;
    if (!videoElement) return;

    const videoObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            // Hvis videoen IKKE er ferdig, spill av
            if (!hasEnded) {
              videoElement.play();
            }
          } else {
            // Hvis videoen IKKE er ferdig, pause
            if (!hasEnded) {
              videoElement.pause();
            }
          }
        });
      },
      { threshold: 0.5 } // Juster om du vil at halvparten av videoen må være synlig
    );

    videoObserver.observe(videoElement);

    return () => {
      if (videoElement) {
        videoObserver.unobserve(videoElement);
      }
    };
  }, [hasEnded]);

  // Håndter fading de siste 2 sekundene av videoen
  useEffect(() => {
    const video = bgVideoRef.current;

    const handleTimeUpdate = () => {
      if (video && video.duration > 0) {
        if (video.currentTime >= video.duration - 2) {
          setIsFading(true);
        }
      }
    };

    if (video) {
      video.addEventListener('timeupdate', handleTimeUpdate);
      return () => video.removeEventListener('timeupdate', handleTimeUpdate);
    }
  }, []);

  // Eksempeldata for bokser/tekst
  const elementsData = [
    {
      type: 'text',
      text: (
        <>
          <h2>About the game</h2>
          <p>
            Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit
            amet risus. Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia odio vitae
            vestibulum vestibulum.
          </p>
        </>
      ),
      align: 'right',
    },
    {
      type: 'text',
      text: `Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore. Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
      align: 'left',
      extraMargin: 700,
    },
    {
      type: 'image',
      image: bilde3,
      alt: 'Bilde 3',
      align: 'right',
      extraMargin: 200,
    },
    {
      type: 'text',
      text: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Vivamus lacinia odio vitae vestibulum vestibulum.`,
      align: 'left',
      extraMargin: 200,
    },
  ];

  return (
    <>
      <GlobalStyle />
      <Container>
        {/* 
          - Ingen autoPlay (for å unngå at den starter ved lasting).
          - muted og playsInline gir typisk tillatelse for avspilling uten brukerinteraksjon.
          - Ingen loop (så videoen stopper på siste frame).
        */}
        <BackgroundVideo
          ref={bgVideoRef}
          src={video1}
          muted
          playsInline
          preload="metadata"
          isFading={isFading}
        />
        <DarkOverlay />

        {/* Render boksene (tekst/bilder) med intersection-animasjon */}
        {elementsData.map((el, index) => {
          if (el.type === 'text') {
            return (
              <TextBox
                key={index}
                ref={addToRefs}
                align={el.align}
                className={visibleItems[index] ? 'active' : ''}
                extraMargin={el.extraMargin}
              >
                {el.text}
              </TextBox>
            );
          } else if (el.type === 'image') {
            return (
              <ImageBox
                key={index}
                ref={addToRefs}
                align={el.align}
                className={visibleItems[index] ? 'active' : ''}
                extraMargin={el.extraMargin}
              >
                <img src={el.image} alt={el.alt} />
              </ImageBox>
            );
          }
          return null;
        })}
      </Container>
    </>
  );
}

export default ScrollAnimation;