import React, { useEffect, useState } from 'react';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import Header from '../components/header';
import Footer from '../components/footer';
import backgroundImage from '../bilder/bg.webp';
import placeholderImage1 from '../bilder/assets_task_01jr7m94hseeqad46rhaa8vhrq_img_0.webp';
import placeholderImage6 from '../bilder/assets_task_01jqebmy91fw3r80bh65pceeam_img_1.webp';
import placeholderImage4 from '../bilder/assets_task_01jqzwt0nqf4ttddc4ykksgj87_img_0.webp';
import placeholderImage2 from '../bilder/smart_gnome.png';
import placeholderImage3 from '../images/siu.png';
import placeholderImage5 from '../bilder/assets_task_01jqzyj308f1s8ph7d3pz8fy24_img_0.webp';

// ----------------------------------------------------
// Eksempel galleri-innhold med nye kategorier og titler
const galleryItems = [
  {
    id: 1,
    img: placeholderImage1,
    category: 'Creatures',
    title: 'Gnome Reading',
  },
  {
    id: 2,
    img: placeholderImage2,
    category: 'Creatures',
    title: 'Mysterious Gnome',
  },
  {
    id: 3,
    img: placeholderImage3,
    category: 'Environments',
    title: 'Foggy Forest',
  },
  {
    id: 4,
    img: placeholderImage1,
    category: 'Environments',
    title: 'Deep Woods',
  },
  {
    id: 5,
    img: placeholderImage2,
    category: 'Creatures',
    title: 'Forest Dweller',
  },
  {
    id: 6,
    img: placeholderImage3,
    category: 'Environments',
    title: 'Lantern in the Mist',
  },
  {
    id: 7,
    img: placeholderImage4,
    category: 'Creatures',
    title: 'Forest Dweller',
  },
  {
    id: 8,
    img: placeholderImage6,
    category: 'Environments',
    title: 'Lantern in the Mist',
  },
  {
    id: 9,
    img: placeholderImage5,
    category: 'Environments',
    title: 'Lantern in the Mist',
  },
];

// ----------------------------------------------------
// Fade-in-bounce-animasjon
const fadeInBounce = keyframes`
  0% {
    opacity: 0;
    transform: translateY(-20px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
`;

// ----------------------------------------------------
// Global stil
const GlobalStyle = createGlobalStyle`
  body {
    cursor: none;
    margin: 0;
    padding: 0;
    overflow-x: hidden;
    background-color: #0e0c0d;
  }
`;

// ----------------------------------------------------
// Hovedoppsettet for siden
const AppContainer = styled.div`
  width: 100vw;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
  animation: ${fadeInBounce} 1s ease forwards;
  opacity: 0;
`;

// Bakgrunnsbilde
const BackgroundContainer = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-image: url(${(props) => props.image});
  background-size: cover;
  background-position: center;
  z-index: -1;
  opacity: 0.4;
`;

// Egendefinert musepeker
const CustomCursor = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid white;
  border-radius: 50%;
  position: fixed;
  pointer-events: none;
  z-index: 9999;
  @media (max-width: 768px) {
    display: none;
  }
`;

// Her gir vi ekstra luft under headeren
const MainWrapper = styled.div`
  display: flex;
  flex: 1;
  margin-top: 120px;
`;

// Sidebar (venstre meny)
const SideBar = styled.nav`
  width: 270px;
  background-color: #0a0a0a;
  padding: 40px 20px;
  box-sizing: border-box;
  color: #fff;
  @media (max-width: 768px) {
    width: 200px;
    padding: 20px;
  }
`;

const SideBarTitle = styled.h2`
  font-size: 1.4rem;
  margin-bottom: 1rem;
  text-transform: uppercase;
  color: #fff;
`;

const SideBarList = styled.ul`
  list-style: none;
  padding-left: 0;
  margin: 0;
`;

const SideBarItem = styled.li`
  margin: 0.5rem 0;
  cursor: pointer;
  font-size: 1rem;
  &:hover {
    color: #aaa;
  }
`;

// Galleri-området (høyre side)
const GalleryContainer = styled.main`
  flex: 1;
  padding: 40px;
  box-sizing: border-box;
  background-color: rgba(0,0,0,0.3);
`;

const GalleryTitle = styled.h1`
  color: #fff;
  font-size: 2.4rem;
  margin-bottom: 2rem;
  text-transform: uppercase;
  text-align: left;
`;

const GalleryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(270px, 1fr));
  gap: 30px;
`;

const GalleryItem = styled.div`
  background-color: #1a1a1a;
  border-radius: 6px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.5);
  text-align: center;
  transition: transform 0.3s ease;
  cursor: pointer;
  &:hover {
    transform: translateY(-5px);
  }
`;

const GalleryImage = styled.img`
  width: 100%;
  display: block;
`;

const GalleryCaption = styled.div`
  padding: 10px;
  color: #ccc;
  font-size: 0.9rem;
`;

// ----------------------------------------------------
// Lightbox (modal) for forstørret bilde med navigasjon
const LightboxOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0,0,0,0.8);
  z-index: 999;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const LightboxContent = styled.div`
  position: relative;
  max-width: 80%;
  max-height: 80%;
`;

const LightboxImage = styled.img`
  width: 100%;
  max-height: 80vh;
  object-fit: contain;
  display: block;
`;

const LightboxCloseButton = styled.button`
  position: absolute;
  top: -50px;
  right: -50px;
  background: transparent;
  color: #fff;
  border: none;
  font-size: 2rem;
  cursor: pointer;
`;

const ArrowButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  color: #fff;
  border: none;
  font-size: 3rem;
  cursor: pointer;
  &:hover {
    color: #aaa;
  }
  ${(props) => (props.left ? 'left: -60px;' : 'right: -60px;')}
`;

// ----------------------------------------------------
// Selve App-komponenten
function App() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const updateMousePosition = (ev) => {
      setMousePosition({ x: ev.clientX, y: ev.clientY });
    };
    window.addEventListener('mousemove', updateMousePosition);
    return () => window.removeEventListener('mousemove', updateMousePosition);
  }, []);

  // Åpne lightbox med valgt bilde
  const openLightbox = (index) => {
    setCurrentIndex(index);
    setIsLightboxOpen(true);
  };

  const closeLightbox = () => {
    setIsLightboxOpen(false);
  };

  const showNext = () => {
    setCurrentIndex((prev) => (prev + 1) % galleryItems.length);
  };
  const showPrev = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? galleryItems.length - 1 : prev - 1
    );
  };

  // Tastaturnavigasjon for lightbox
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isLightboxOpen) return;
      if (e.key === 'ArrowRight') {
        showNext();
      } else if (e.key === 'ArrowLeft') {
        showPrev();
      } else if (e.key === 'Escape') {
        closeLightbox();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isLightboxOpen]);

  return (
    <>
      <GlobalStyle />
      {/* Skjuler header når lightboxen er åpen */}
      {!isLightboxOpen && <Header />}
      <CustomCursor style={{ left: mousePosition.x, top: mousePosition.y }} />
      <AppContainer>
        <BackgroundContainer image={backgroundImage} />
        <MainWrapper>
          <SideBar>
            <SideBarTitle>CREATURES</SideBarTitle>
            <SideBarList>
              <SideBarItem>SubCat One</SideBarItem>
              <SideBarItem>SubCat Two</SideBarItem>
              <SideBarItem>SubCat Three</SideBarItem>
            </SideBarList>
            <br />
            <SideBarTitle>ENVIRONMENTS</SideBarTitle>
            <SideBarList>
              <SideBarItem>SubCat One</SideBarItem>
              <SideBarItem>SubCat Two</SideBarItem>
              <SideBarItem>SubCat Three</SideBarItem>
            </SideBarList>
            <br />
            <SideBarTitle>ABOUT</SideBarTitle>
            <SideBarList>
              <SideBarItem>Our Story</SideBarItem>
            </SideBarList>
            <br />
            <SideBarTitle>CONTACT</SideBarTitle>
            <SideBarList>
              <SideBarItem>Get in Touch</SideBarItem>
            </SideBarList>
          </SideBar>

          <GalleryContainer>
            <GalleryTitle>GALLERY</GalleryTitle>
            <GalleryGrid>
              {galleryItems.map((item, index) => (
                <GalleryItem key={item.id} onClick={() => openLightbox(index)}>
                  <GalleryImage src={item.img} alt={`Item ${item.id}`} />
                  <GalleryCaption>{item.category}</GalleryCaption>
                </GalleryItem>
              ))}
            </GalleryGrid>
          </GalleryContainer>
        </MainWrapper>
      </AppContainer>
      <Footer />

      {isLightboxOpen && (
        <LightboxOverlay onClick={closeLightbox}>
          {/* Stop propagasjon slik at klikk på bildet ikke lukker modalen */}
          <LightboxContent onClick={(e) => e.stopPropagation()}>
            <LightboxImage
              src={galleryItems[currentIndex].img}
              alt={`Image ${currentIndex}`}
            />
            <LightboxCloseButton onClick={closeLightbox}>
              &times;
            </LightboxCloseButton>
            <ArrowButton left onClick={showPrev}>
              &#8592;
            </ArrowButton>
            <ArrowButton onClick={showNext}>
              &#8594;
            </ArrowButton>
          </LightboxContent>
        </LightboxOverlay>
      )}
    </>
  );
}

export default App;
