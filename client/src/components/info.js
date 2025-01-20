import React, { useRef, useEffect, useState } from 'react';
import styled, { css, createGlobalStyle } from 'styled-components';

// Importer mediefiler
import video1 from '../images/Forest with lights.mp4';
import bilde2 from '../images/placeholder.com-1280x720.webp';
import bilde3 from '../images/placeholder.com-1280x720.webp';

// GlobalStyle for å importere skrifttypen (Great Vibes som ligner Basston Script)
const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Great+Vibes&display=swap');
`;

const Container = styled.div`
  /* Sørger for at vi har en lang side for scrolling */
  min-height: 200vh;
  background: #0b1b20; /* Bakgrunnen er svart */
  padding: 50px;
  position: relative;
`;

/* Felles stil for alle elementer */
const Box = styled.div`
  padding: 20px;
  width: 400000000000000000000000000%;
  color: white;
  opacity: 0;
  transition: transform 0.6s ease-out, opacity 0.6s ease-out;
  will-change: transform, opacity;
  position: relative;
  margin: 120px 0; /* Mer plass over og under hver boks */

  /* Juster plassering basert på tekst, bilde eller video */
  ${props =>
    props.align === 'left' &&
    css`
      margin-left: 10%;
      margin-right: auto;
    `}
  
  ${props =>
    props.align === 'right' &&
    css`
      margin-left: auto;
      margin-right: 10%;
    `}
  
  &.active {
    opacity: 1;
    transform: translateX(0);
  }
`;

/* Stil for tekstbokser */
const TextBox = styled(Box)`
  font-family: 'Great Vibes', cursive; /* Bruk script-fonten */
  font-size: 36px; /* Gjør teksten større */
  line-height: 1.5; /* Øk linjeavstand for bedre lesbarhet */
  text-align: center; /* Sentraliser teksten */
`;

/* Stil for bildeboksene */
const ImageBox = styled(Box)`
  img {
    width: 100%;
    height: auto;
    display: block;
  }
`;

/* Stil for videoboksen */
const VideoBox = styled(Box)`
  video {
    width: 120%;
    height: auto;
    display: block;
  }
`;

/* Startposisjon basert på om boksen skal animeres fra høyre eller venstre */
const AnimatedBox = styled(Box)`
  transform: ${props =>
    props.align === 'left' ? 'translateX(-50px)' : 'translateX(50px)'};
`;

function ScrollAnimation() {
  // Referanser for hvert element
  const elementRefs = useRef([]);
  elementRefs.current = [];

  // State for synligheten til hvert element (seks elementer)
  const [visibleItems, setVisibleItems] = useState(new Array(6).fill(false));

  const addToRefs = (el) => {
    if (el && !elementRefs.current.includes(el)) {
      elementRefs.current.push(el);
    }
  };

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
              // Unobserve for å forhindre at elementet trigges flere ganger
              observer.unobserve(entry.target);
            }
          }
        });
      },
      { threshold: 0.1 }
    );

    elementRefs.current.forEach((ref) => observer.observe(ref));
    return () => {
      observer.disconnect();
    };
  }, []);

  /*
    Data for elementene:
    - type: "text" for tekstbokser, "image" for bildebokser og "video" for videobokser
    - align: bestemmer hvilken side elementet skal vises fra (left/right)
  */
  const elementsData = [
    {
      type: 'text',
      text: `Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. 
             Maecenas sed diam eget risus varius blandit sit amet non magna.`,
      align: 'right',
    },
    {
      type: 'video', // Endret type til 'video'
      video: video1, // mp4-videoen
      alt: 'Forest with lights video',
      align: 'left',
    },
    {
      type: 'image',
      image: bilde2,
      alt: 'Bilde 2',
      align: 'right',
    },
    {
      type: 'text',
      text: `Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore 
             eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, 
             sunt in culpa qui officia deserunt mollit anim id est laborum.`,
      align: 'left',
    },
    {
      type: 'image',
      image: bilde3,
      alt: 'Bilde 3',
      align: 'right',
    },
    {
      type: 'text',
      text: `Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed posuere consectetur est at lobortis.`,
      align: 'left',
    },
  ];

  return (
    <>
      <GlobalStyle />
      <Container>
        {elementsData.map((el, index) => {
          if (el.type === 'text') {
            return (
              <TextBox
                key={index}
                ref={addToRefs}
                align={el.align}
                className={visibleItems[index] ? 'active' : ''}
              >
                <p>{el.text}</p>
              </TextBox>
            );
          } else if (el.type === 'image') {
            return (
              <ImageBox
                key={index}
                ref={addToRefs}
                align={el.align}
                className={visibleItems[index] ? 'active' : ''}
              >
                <img src={el.image} alt={el.alt} />
              </ImageBox>
            );
          } else if (el.type === 'video') {
            return (
              <VideoBox
                key={index}
                ref={addToRefs}
                align={el.align}
                className={visibleItems[index] ? 'active' : ''}
              >
                <video
                  src={el.video}
                  alt={el.alt}
                  controls
                  autoPlay
                  muted
                  loop
                />
              </VideoBox>
            );
          }
          return null;
        })}
      </Container>
    </>
  );
}

export default ScrollAnimation;
