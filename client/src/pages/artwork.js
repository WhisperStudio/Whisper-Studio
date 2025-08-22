import React, { useEffect, useState, Suspense, useRef } from 'react';
import styled, { createGlobalStyle, keyframes } from 'styled-components';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

import Header from '../components/header';
import Footer from '../components/footer';
import backgroundImage from '../bilder/bg.webp';
import placeholderImage1 from '../bilder/assets_task_01jr7m94hseeqad46rhaa8vhrq_img_0.webp';
import placeholderImage2 from '../bilder/smart_gnome.png';
import placeholderImage3 from '../images/siu.png';
import placeholderImage4 from '../bilder/assets_task_01jqzwt0nqf4ttddc4ykksgj87_img_0.webp';
import placeholderImage5 from '../bilder/assets_task_01jqzyj308f1s8ph7d3pz8fy24_img_0.webp';
import placeholderImage6 from '../bilder/assets_task_01jqebmy91fw3r80bh65pceeam_img_1.webp';
import placeholderImage7 from '../bilder/GnomeSitting.png';
import placeholderImage8 from '../bilder/Villiage.png';
import placeholderImage9 from '../bilder/Nøkken.png';
import placeholderImage10 from '../bilder/Troll.png';
import placeholderImage11 from '../bilder/HorseAndGirl.png';
import placeholderImage12 from '../bilder/Pesta.png';

// ----------------------------------------------------
// Gallery content
const galleryItems = [
  { id: 1, img: placeholderImage2, category: 'Creatures',    sub: 'Friendly',    title: 'Nisse' },
  { id: 2, img: placeholderImage4, category: 'Creatures',    sub: 'Unfriendly',  title: 'Forest Dweller' },
  { id: 3, img: placeholderImage6, category: 'Creatures',    sub: 'Unfriendly',  title: 'Shadow' },
  { id: 4, img: placeholderImage5, category: 'Creatures',    sub: 'Unfriendly',  title: 'Huldra' },
  { id: 5, img: placeholderImage1, category: 'Environments', sub: 'Village',     title: 'VR-Headset?' },
  { id: 6, img: placeholderImage3, category: 'Environments', sub: 'Waterfront',  title: 'Foggy Shore' },
  { id: 7, img: placeholderImage6, category: 'Environments', sub: 'Waterfront',  title: 'Misty Lake' },
  { id: 8, img: placeholderImage11, category: 'Environments', sub: 'Waterfront', title: 'Pretty Horse?' },
  { id: 9, img: placeholderImage6, category: 'Environments', sub: 'Village',     title: 'Lantern in the Mist' },
  { id: 10, img: placeholderImage8, category: 'Environments', sub: 'Village',     title: 'Nisse Village' },
  { id: 11, img: placeholderImage7, category: 'Creatures', sub: 'Unfriendly',     title: 'Silent shivering' },
  { id: 12, img: placeholderImage9, category: 'Creatures', sub: 'Unfriendly',     title: 'Nøkken' },
  { id: 13, img: placeholderImage10, category: 'Creatures', sub: 'Unfriendly',     title: 'Troll' },
  { id: 14, img: placeholderImage12, category: 'Creatures', sub: 'Unfriendly',     title: 'Pesta' },
];

// ----------------------------------------------------
// 3D subcategories
const models = ['Nokken','Troll','Shadow','Headset'];

// ----------------------------------------------------
// Lightbox styled-components
const LightboxOverlay     = styled.div`
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0,0,0,0.8); z-index: 10000;
  display: flex; align-items: center; justify-content: center;
`;
const LightboxContent     = styled.div`
  position: relative; max-width: 80%; max-height: 80%;
`;
const LightboxImage       = styled.img`
  width: 100%; max-height: 80vh; object-fit: contain; display: block;
`;
const LightboxCloseButton = styled.button`
  position: absolute; top: -40px; right: -40px;
  background: transparent; border: none; color: #fff; font-size: 2rem;
  cursor: pointer;
`;
const ArrowButton         = styled.button`
  position: absolute; top: 50%; transform: translateY(-50%);
  background: transparent; border: none; color: #fff; font-size: 3rem;
  cursor: pointer;
  ${p=>p.left?'left:-60px;':'right:-60px;'}
  &:hover{ color: #aaa; }
`;

// ----------------------------------------------------
// Animation & global style
const fadeIn = keyframes` 
  from { opacity: 0; transform: translateY(-20px) } 
  to   { opacity: 1; transform: translateY(0) } 
`;
const GlobalStyle = createGlobalStyle`
  body {
    cursor: none; margin:0; padding:0;
    overflow-x:hidden; background:#0e0c0d; color:#fff;
  }
`;

// ----------------------------------------------------
// Layout styled-components
const AppContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: stretch;       /* <-- let children span full width */
  min-height: 100vh;
  animation: ${fadeIn} .6s ease-out forwards;
  opacity: 0;
`;
const Background   = styled.div`
  position: absolute; top:0; left:0; right:0; bottom:0;
  background: url(${p=>p.src}) center/cover no-repeat;
  opacity: .4; z-index: -1;
`;
const Cursor       = styled.div`
  width: 20px; height: 20px;
  border: 2px solid black; border-radius: 50%;
  position: absolute; pointer-events: none; z-index: 9999;
  @media(max-width:768px){ display:none; }
`;
const Main         = styled.div`
  display: flex;
  flex: 1;
  /* flytt innhold forbi Sidebar */
  margin: 120px 0 0 270px;
  @media(max-width:768px){
    margin-left: 200px;
  }
  /* valgfritt max-bredde på selve innholdet: */
  max-width: calc(100% - 270px);
`;
const Sidebar      = styled.nav`
   position: fixed;
  top: 0;
  bottom: 0;
  left: 0;
  width: 270px;
  background: #0a0a0a;
  padding: 40px 20px;
  overflow-y: auto;
  @media(max-width:768px){
    width: 200px;
    padding: 20px;
  }
 `;
const Title        = styled.h2`
  font-size:1.4rem; margin-bottom:1rem; text-transform:uppercase;
`;
const List         = styled.ul` list-style:none; padding:0; margin:0; `;
const Item         = styled.li`
  margin:.5rem 0; cursor:pointer; font-size:1rem;
  color:${p=>p.active?'#fff':'#777'};
  &:hover{ color:#aaa; }
`;
const Content      = styled.main`
  flex:1; padding:40px; background: rgba(0,0,0,0.3);
`;
const GalleryGrid = styled.div`
  display: grid;
  /* 3 kolonner med lik bredde */
  grid-template-columns: repeat(3, 1fr);
  /* luft mellom både rader og kolonner */
  gap: 40px;
  /* sentrer eventuelle færre elementer i siste rad */
  justify-items: center;

  /* responsivt: én kolonne på very smale skjermer */
  @media (max-width: 600px) {
    grid-template-columns: 1fr;
  }
  /* to kolonner på medium skjermer */
  @media (min-width: 601px) and (max-width: 900px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;
const Box = styled.div`
   background: #1a1a1a;
   border-radius: 6px;
   overflow: hidden;
   box-shadow: 0 4px 12px rgba(0,0,0,0.5);
   text-align: center;
   transition: transform .3s ease;
   cursor: pointer;
   &:hover { transform: translateY(-5px); }
 `;
const Img = styled.img`
   display: block;
   width: 100%;
   height: auto;
   object-fit: cover;
 `;
const Cap          = styled.div` padding:10px; color:#ccc; font-size:.9rem; `;
const ChartArea    = styled.div` width:100%; height:400px; `;

// ----------------------------------------------------
// Imperative Three.js showroom
function CarShowroom() {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    const width  = mount.clientWidth;
    const height = mount.clientHeight;

    // scene
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x111111);

    // camera
    const camera = new THREE.PerspectiveCamera(75, width/height, 0.1, 1000);
    camera.position.set(0,1.5,5);

    // renderer
    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    mount.appendChild(renderer.domElement);

    // controls
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    // lights + floor
    scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 1.8));
    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(1000, 1000),
      new THREE.MeshStandardMaterial({ color: 0x222222 })
    );
    floor.rotation.x = -Math.PI/2;
    scene.add(floor);

    // load model
    new GLTFLoader().load(
      '/vr_headset.glb',
      gltf => scene.add(gltf.scene),
      undefined,
      err => console.error(err)
    );

    // animate loop
    const animate = () => {
      requestAnimationFrame(animate);
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    // handle resize
    const onResize = () => {
      const w = mount.clientWidth;
      const h = mount.clientHeight;
      camera.aspect = w/h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);
    };
    window.addEventListener('resize', onResize);

    return () => {
      mount.removeChild(renderer.domElement);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  return <div ref={mountRef} style={{ width:'100%', height:'100%' }} />;
}

// ----------------------------------------------------
// Main App
export default function App() {
  // custom cursor
  const [mouse, setMouse] = useState({ x:0, y:0 });
  useEffect(()=>{
    const mv = e=> setMouse({ x:e.clientX, y:e.clientY });
    window.addEventListener('mousemove', mv);
    return ()=> window.removeEventListener('mousemove', mv);
  },[]);

  // filtering
  const [cat, setCat] = useState('Creatures');
  const [sub, setSub] = useState('Friendly');
  const handleFilter = (c,s)=>{ setCat(c); setSub(s); closeZoom(); };

  const filtered = galleryItems.filter(it=>
    it.category===cat && it.sub===sub
  );

  // lightbox
  const [zoom, setZoom]   = useState(false);
  const [zIdx, setZIdx]   = useState(0);
  const openZoom  = i=>{ setZIdx(i); setZoom(true); };
  const closeZoom = ()=> setZoom(false);
  const nextImg   = ()=> setZIdx(i=> (i+1)%filtered.length);
  const prevImg   = ()=> setZIdx(i=> i===0? filtered.length-1 : i-1);

  useEffect(()=>{
    const kd = e=>{
      if(!zoom) return;
      if(e.key==='Escape') closeZoom();
      if(e.key==='ArrowRight') nextImg();
      if(e.key==='ArrowLeft') prevImg();
    };
    window.addEventListener('keydown', kd);
    return ()=> window.removeEventListener('keydown', kd);
  },[zoom, filtered.length]);

  return (
    <>
      <GlobalStyle/>
      {!zoom && <Header/>}
      <Cursor style={{ left:mouse.x, top:mouse.y }}/>
      <AppContainer>
        <Background src={backgroundImage}/>
        <Main>
          <Sidebar>
            <Title>CREATURES</Title>
            <List>
              {['Friendly','Unfriendly'].map(s=>
                <Item key={s}
                      active={cat==='Creatures'&&sub===s}
                      onClick={()=>handleFilter('Creatures',s)}>
                  {s}
                </Item>
              )}
            </List>
            <br/>
            <Title>ENVIRONMENTS</Title>
            <List>
              {['Waterfront','Mountain Hills','Village'].map(s=>
                <Item key={s}
                      active={cat==='Environments'&&sub===s}
                      onClick={()=>handleFilter('Environments',s)}>
                  {s}
                </Item>
              )}
            </List>
            <br/>
            <Title>3D</Title>
            <List>
              {models.map(m=>
                <Item key={m}
                      active={cat==='3D'&&sub===m}
                      onClick={()=>handleFilter('3D',m)}>
                  {m}
                </Item>
              )}
            </List>
          </Sidebar>

          <Content>
            {cat==='3D' ? (
              <ChartArea>
                <CarShowroom/>
              </ChartArea>
            ) : (
              <>
                <h1>{cat} — {sub}</h1>
                <GalleryGrid>
                  {filtered.map((it,i)=>(
                    <Box key={it.id} onClick={()=>openZoom(i)}>
                      <Img src={it.img} alt={it.title}/>
                      <Cap>{it.title}</Cap>
                    </Box>
                  ))}
                </GalleryGrid>
              </>
            )}
          </Content>
        </Main>
      </AppContainer>
      <Footer/>

      {zoom && (
        <LightboxOverlay onClick={closeZoom}>
          <LightboxContent onClick={e=>e.stopPropagation()}>
            <LightboxImage src={filtered[zIdx].img} alt={filtered[zIdx].title}/>
            <LightboxCloseButton onClick={closeZoom}>&times;</LightboxCloseButton>
            <ArrowButton left onClick={prevImg}>&larr;</ArrowButton>
            <ArrowButton    onClick={nextImg}>&rarr;</ArrowButton>
          </LightboxContent>
        </LightboxOverlay>
      )}
    </>
  );
}
