import React, { useEffect, useRef, useState, useCallback } from "react";
import styled from "styled-components";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { AnimatePresence, motion } from "framer-motion";

// ---------- Assets ----------
import backgroundImage from "../bilder/bg.webp";
import placeholderImage1 from "../bilder/assets_task_01jr7m94hseeqad46rhaa8vhrq_img_0.webp";
import placeholderImage2 from "../bilder/smart_gnome.png";
import placeholderImage3 from "../images/siu.png";
import placeholderImage4 from "../bilder/assets_task_01jqzwt0nqf4ttddc4ykksgj87_img_0.webp";
import placeholderImage5 from "../bilder/assets_task_01jqzyj308f1s8ph7d3pz8fy24_img_0.webp";
import placeholderImage6 from "../bilder/assets_task_01jqebmy91fw3r80bh65pceeam_img_1.webp";
import placeholderImage7 from "../bilder/GnomeSitting.png";
import placeholderImage8 from "../bilder/Villiage.png";
import placeholderImage9 from "../bilder/Nøkken.png";
import placeholderImage10 from "../bilder/Troll.png";
import placeholderImage11 from "../bilder/HorseAndGirl.png";
import placeholderImage12 from "../bilder/Pesta.png";

const Icon = ({ name, size = 18 }) => {
  const common = {
    width: size,
    height: size,
    viewBox: "0 0 24 24",
    fill: "none",
    xmlns: "http://www.w3.org/2000/svg",
    "aria-hidden": "true",
    focusable: "false",
  };

  if (name === "close") {
    return (
      <svg {...common}>
        <path d="M6 6l12 12M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === "left") {
    return (
      <svg {...common}>
        <path d="M15 18l-6-6 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (name === "right") {
    return (
      <svg {...common}>
        <path d="M9 6l6 6-6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (name === "download") {
    return (
      <svg {...common}>
        <path d="M12 3v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M8 10l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 21h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    );
  }
  if (name === "link") {
    return (
      <svg {...common}>
        <path d="M10 13a5 5 0 0 1 0-7l1.4-1.4a5 5 0 0 1 7 7L17 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14 11a5 5 0 0 1 0 7l-1.4 1.4a5 5 0 0 1-7-7L7 11" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }
  if (name === "grid") {
    return (
      <svg {...common}>
        <path d="M4 4h7v7H4V4Zm9 0h7v7h-7V4ZM4 13h7v7H4v-7Zm9 0h7v7h-7v-7Z" fill="currentColor" opacity="0.9" />
      </svg>
    );
  }
  if (name === "masonry") {
    return (
      <svg {...common}>
        <path d="M4 4h7v10H4V4Zm9 0h7v6h-7V4ZM4 16h7v4H4v-4Zm9-4h7v8h-7v-8Z" fill="currentColor" opacity="0.9" />
      </svg>
    );
  }
  if (name === "stage") {
    return (
      <svg {...common}>
        <path d="M12 3l8 5v8l-8 5-8-5V8l8-5Z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round" />
        <path d="M12 8v8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <path d="M8.5 10.5L12 8l3.5 2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    );
  }

  return null;
};

// ============================================================================
//  VINTRA – DARK / NEON EDITION
//  - ZERO global CSS, zero Header/Footer, safe drop-in
//  - Honors header height via CSS var --vs-header-height or prop headerHeight
//  - Ultra dark, neon accents, parallax hero, particles, sticky pro toolbar
//  - View modes (Grid / Masonry), Search, Multi-filter, Sort, Quick actions
//  - Fancy hover (parallax tilt + shine), skeletons, infinite loading
//  - Upgraded 3D viewer
// ============================================================================

const RAW = [
  { id: 1, img: placeholderImage2, category: "Creatures", sub: "Friendly", title: "Nisse", tags:["gnome","friendly","folk"] },
  { id: 2, img: placeholderImage4, category: "Creatures", sub: "Unfriendly", title: "Forest Dweller", tags:["forest","dark"] },
  { id: 3, img: placeholderImage6, category: "Creatures", sub: "Unfriendly", title: "Shadow", tags:["shadow","mystic"] },
  { id: 4, img: placeholderImage5, category: "Creatures", sub: "Unfriendly", title: "Huldra", tags:["folk","myth"] },
  { id: 5, img: placeholderImage1, category: "Environments", sub: "Village", title: "VR-Headset?", tags:["tech","surreal"] },
  { id: 6, img: placeholderImage3, category: "Environments", sub: "Waterfront", title: "Foggy Shore", tags:["fog","shore"] },
  { id: 7, img: placeholderImage6, category: "Environments", sub: "Waterfront", title: "Misty Lake", tags:["lake","mist"] },
  { id: 8, img: placeholderImage11, category: "Environments", sub: "Waterfront", title: "Pretty Horse?", tags:["horse","vibes"] },
  { id: 9, img: placeholderImage6, category: "Environments", sub: "Village", title: "Lantern in the Mist", tags:["lantern","mist"] },
  { id: 10, img: placeholderImage8, category: "Environments", sub: "Village", title: "Nisse Village", tags:["village","gnome"] },
  { id: 11, img: placeholderImage7, category: "Creatures", sub: "Unfriendly", title: "Silent shivering", tags:["cold","gnome"] },
  { id: 12, img: placeholderImage9, category: "Creatures", sub: "Unfriendly", title: "Nøkken", tags:["water","monster"] },
  { id: 13, img: placeholderImage10, category: "Creatures", sub: "Unfriendly", title: "Troll", tags:["troll","rock"] },
  { id: 14, img: placeholderImage12, category: "Creatures", sub: "Unfriendly", title: "Pesta", tags:["plague","dark"] },
];

// ---------- Theme (scoped) ----------
const C = {
  bg: "#05070A",
  panel: "rgba(10,12,16,.86)",
  border: "rgba(199,164,76,.18)",
  text: "#E9E2D3",
  subtle: "rgba(233,226,211,.70)",
  gold: "#C7A44C",
  fire: "#FF5A1F",
  blood: "#8B1E1E",
  radius: 18,
  shadow: "0 28px 90px rgba(0,0,0,.62)",
};

// ---------- Layout ----------
const Section = styled.section`
  --header: var(--vs-header-height, 96px);
  position: relative; background: ${C.bg};
  padding: calc(var(--header) + 56px) 0 120px; /* never collide with header */
  isolation: isolate;
  overflow: hidden; /* 🔥 sørger for at ingenting "lyser" utenfor seksjonen */
  color: ${C.text};
  font-family: "Cinzel", ui-serif, Georgia, "Times New Roman", serif;
  letter-spacing: 0.01em;
  
  @media (max-width: 768px) {
    padding: calc(var(--header) + 30px) 0 80px;
  }
`;

const Backdrop = styled.div`
  position: absolute; inset: 0; z-index: 0; pointer-events: none;
  &::before{ content:""; position:absolute; inset:-20% -10%;
    background:
      radial-gradient(100vmax 80vmax at 85% 0%, rgba(139,30,30,.16), transparent 60%),
      radial-gradient(90vmax 75vmax at 15% 100%, rgba(199,164,76,.12), transparent 62%),
      radial-gradient(70vmax 60vmax at 50% 20%, rgba(255,90,31,.08), transparent 64%),
      url(${backgroundImage}) center/cover no-repeat;
    opacity:.16; filter: saturate(.75) contrast(1.06);
  }
  &::after{ content:""; position:absolute; inset:0;
    background:
      linear-gradient(180deg, rgba(0,0,0,.65) 0%, rgba(0,0,0,.38) 45%, rgba(0,0,0,.75) 100%),
      radial-gradient(1200px 700px at 50% 10%, rgba(255,255,255,.05), transparent 60%);
    opacity:.9;
  }
`;

const Particles = styled.canvas`
  position:absolute; inset:0; z-index:0; pointer-events:none; mix-blend-mode:screen; opacity:.35;
`;

const Wrap = styled.div`
  position: relative; z-index: 1; width: min(1280px, 92vw); margin: 0 auto;
  
  @media (max-width: 768px) {
    width: 95vw;
  }
`;

const Hero = styled.div`
  display:grid; grid-template-columns: 1.1fr .9fr; gap: 28px; align-items:end; margin-bottom: 18px;
  @media (max-width: 980px){ grid-template-columns: 1fr; gap: 18px; }
`;

const TitleBlock = styled.div``;
const H1 = styled.h1`
  margin:0; font-size: clamp(30px, 2.6vw + 18px, 56px); letter-spacing:-.02em;
  color: ${C.text};
  text-shadow: 0 0 28px rgba(255, 90, 31, 0.12), 0 18px 80px rgba(0,0,0,0.75);
  font-family: "Cinzel", ui-serif, Georgia, "Times New Roman", serif;
  
  @media (max-width: 768px) {
    font-size: clamp(24px, 6vw, 36px);
  }
`;
const Sub = styled.p`
  margin:.3rem 0 0;
  max-width: 70ch;
  font-family: ui-serif, Georgia, "Times New Roman", serif;
  color: rgba(233, 226, 211, 0.78);
  letter-spacing: 0.02em;
  
  @media (max-width: 768px) {
    font-size: 0.95rem;
    max-width: 100%;
  }
`;

const Toolbar = styled.div`
  position: sticky; top: calc(var(--header) + 10px); z-index: 5;
  display: grid; grid-template-columns: 1fr auto; gap: 14px; align-items:center;
  background: linear-gradient(180deg, rgba(5,7,10,.72), rgba(5,7,10,.40));
  border: 1px solid ${C.border};
  border-radius: 18px;
  padding: 12px;
  box-shadow: 0 22px 80px rgba(0,0,0,.45);
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 10px;
  }
`;

/* 🔹 Glass-divider som matcher knappestilen (brukes mellom kategorier og underkategorier) */
const GlassDivider = styled.div`
  grid-column: 1 / -1; height: 1px; margin: 2px 0 4px;
  background: linear-gradient(90deg, rgba(255,255,255,.04), rgba(255,255,255,.18), rgba(255,255,255,.04));
  border: 1px solid rgba(199,164,76,.14);
  border-radius: 999px;
  box-shadow: inset 0 0 10px rgba(199,164,76,.08);
`;

const Controls = styled.div`
  display:flex; flex-wrap:wrap; gap:10px; align-items:center;
  
  @media (max-width: 768px) {
    gap: 8px;
    font-size: 0.9rem;
  }
`;

const Pill = styled.button`
  appearance: none;
  border: 1px solid ${p => p.active ? "rgba(199,164,76,.34)" : C.border};
  color: ${p => p.active ? C.text : C.subtle};
  background: ${p => p.active
    ? "linear-gradient(180deg, rgba(199,164,76,.16), rgba(10,12,16,.65))"
    : "linear-gradient(180deg, rgba(255,255,255,.03), rgba(0,0,0,.12))"};
  border-radius: 999px;
  padding: 10px 16px;
  font-weight: 800;
  cursor: pointer;
  transition: .15s ease;
  box-shadow: ${p => p.active
    ? "inset 0 0 14px rgba(199,164,76,.10), 0 10px 22px rgba(0,0,0,.45)"
    : "none"};

  &:hover { transform: translateY(-1px); }
  &:focus-visible { outline: 2px solid ${C.gold}; outline-offset: 2px; }
  
  @media (max-width: 768px) {
    padding: 8px 12px;
    font-size: 0.85rem;
  }
`;

const Search = styled.input`
  appearance:none; background: rgba(255,255,255,.03); border:1px solid ${C.border};
  border-radius: 999px; padding: 10px 14px; color:${C.text}; min-width: 220px;
  
  @media (max-width: 768px) {
    min-width: 100%;
    padding: 8px 12px;
    font-size: 0.9rem;
  }
`;

const Select = styled.select`
  appearance:none; background: rgba(255,255,255,.03); border:1px solid ${C.border}; color:${C.text};
  border-radius: 12px; padding: 10px 14px; min-width: 160px;
  
  @media (max-width: 768px) {
    min-width: 120px;
    padding: 8px 12px;
    font-size: 0.9rem;
  }
`;


// ---------- Grid / Masonry ----------
const Grid = styled(motion.div)`
  display:grid; gap: 18px; margin-top: 22px; align-items:start;
  grid-template-columns: repeat(12, 1fr);
  @media (max-width: 1150px){ grid-template-columns: repeat(8, 1fr); }
  @media (max-width: 760px){ grid-template-columns: repeat(4, 1fr); }
`;

const Masonry = styled(Grid)`
  grid-auto-rows: 8px; /* masonry trick */
`;

const Card = styled(motion.div)`
  grid-column: span 4; /* 3-up */
  display:flex; flex-direction:column; gap:10px; color:inherit; text-decoration:none;
  background:
    radial-gradient(600px 280px at 18% 12%, rgba(199,164,76,.10), transparent 70%),
    radial-gradient(560px 260px at 88% 18%, rgba(255,90,31,.08), transparent 72%),
    linear-gradient(145deg, rgba(18,20,24,.90), rgba(6,8,12,.86));
  border:1px solid ${C.border};
  border-radius:${C.radius}px;
  padding:12px;
  box-shadow:${C.shadow};
  position:relative; overflow:hidden; cursor: zoom-in;
  &:hover .shine{ opacity:1; transform: translate3d(0,0,0) rotate(15deg); }
`;

const MasonryCard = styled(Card)``;

const Thumb = styled.div`
  position:relative; border-radius:14px; overflow:hidden; background:#0d0f14; border:1px solid ${C.border};
  aspect-ratio: 16/9; /* grid mode */
`;

const ThumbM = styled(Thumb)`
  aspect-ratio:auto; height:auto;
`;

const Img = styled.img`
  width:100%; height:100%; object-fit:cover; display:block; filter:saturate(1.03) contrast(1.03);
  opacity:${p=>p.loaded?1:0}; transition: opacity .3s ease;
`;

const Shine = styled.div`
  pointer-events:none; position:absolute; inset:-40%; transform: translate3d(-30%,0,0) rotate(15deg);
  background: linear-gradient(90deg, transparent, rgba(255,255,255,.06), transparent);
  opacity:0; transition:.35s ease; mix-blend-mode:screen;
`;

const Meta = styled.div` display:flex; justify-content:space-between; align-items:center; `;
const Title = styled.span`
  font-weight: 800;
  letter-spacing: .2px;
  color: ${C.text};
  font-family: "Cinzel", ui-serif, Georgia, "Times New Roman", serif;
`;
const Badge = styled.span`
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 999px;
  color: ${C.text};
  background: rgba(199,164,76,.10);
  border: 1px solid rgba(199,164,76,.18);
  box-shadow:
    inset 0 0 12px rgba(199,164,76,.06),
    0 6px 20px rgba(0,0,0,.35);
`;

const Actions = styled.div` position:absolute; top:12px; right:12px; display:flex; gap:8px; `;
const Ghost = styled.button`
  appearance:none;
  border:1px solid ${C.border};
  background: linear-gradient(180deg, rgba(199,164,76,.08), rgba(0,0,0,.18));
  color:${C.text};
  padding:8px 10px;
  border-radius:12px;
  cursor:pointer;
  display:inline-flex;
  align-items:center;
  gap:8px;
  transition: transform .15s ease, border-color .15s ease, background .15s ease;

  &:hover { transform: translateY(-1px); border-color: rgba(199,164,76,.34); }
`;

// ---------- Lightbox ----------
// 🔹 Navigasjons-knapper: matcher pilene i footer-link hover (⟩ + gull)
const NavArrow = styled.button`
  position: absolute !important;
  top: 50% !important;
  transform: translateY(-50%) !important;
  ${p => 
    p.$left 
      ? "left: calc(50vw - min(94vw, 1280px) / 2 - 100px) !important;" 
      : "right: calc(50vw - min(94vw, 1280px) / 2 - 100px) !important;"
  }
  background: rgba(10,12,16,.55);
  border: none;
  color: rgba(235,215,165,0.84);
  width: 56px;
  height: 56px;
  border-radius: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: color 0.25s, transform 0.25s, border-color 0.25s, background 0.25s;
  z-index: 999999 !important;
  pointer-events: auto !important;

  &::before {
    content: '⟩';
    display: block;
    font-size: 30px;
    line-height: 1;
    color: #c8922a;
    transition: color 0.25s, transform 0.25s;
    transform: ${p => (p.$left ? "rotate(180deg)" : "none")};
  }

  &:hover {
    background: rgba(0,0,0,0.68);
    border-color: none);
    transform: translateY(-50%) scale(1.02);

    &::before {
      color: #f0c040;
      transform: ${p => (p.$left ? "rotate(180deg) translateX(2px)" : "translateX(2px)")};
    }
  }

  &:focus-visible { outline: 2px solid ${C.gold}; outline-offset: 2px; }

  @media (max-width: 900px) {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    ${p => (p.$left ? "left: 16px;" : "right: 16px;")}

    &::before { font-size: 26px; }
  }
`;

const Dimmer = styled(motion.div)`
  position:fixed;
  inset:0;
  background: rgba(5,7,10,.88);
  z-index:999999;
  display:grid;
  place-items:center;
  overflow: hidden;
`;
const Panel = styled(motion.div)`
  width:min(94vw, 1280px); max-height:88dvh; display:grid; grid-template-rows: 1fr auto; gap: 10px;
  background: linear-gradient(145deg, rgba(18,20,24,.92), rgba(6,8,12,.90));
  border:1px solid ${C.border};
  border-radius:22px;
  box-shadow:${C.shadow};
  overflow:hidden;
  position: relative;
`;
const FullImg = styled.img` width:100%; height:100%; object-fit:contain; background:#06070b; `;
const Bar = styled.div` display:flex; justify-content:space-between; align-items:center; padding:12px 16px; `;

const ViewToggle = styled.button`
  appearance:none;
  border: 1px solid ${C.border};
  background: rgba(0,0,0,.18);
  color: ${C.text};
  padding: 8px 10px;
  border-radius: 12px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: transform .15s ease, border-color .15s ease, background .15s ease;

  &[data-active="true"]{
    border-color: rgba(199,164,76,.34);
    background: rgba(199,164,76,.10);
  }

  &:hover{ transform: translateY(-1px); }
`;

// ---------- 3D Viewer ----------
function Viewer3D(){
  const mountRef = useRef(null); 
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const mount = mountRef.current; if(!mount) return;
    const { clientWidth: w, clientHeight: h } = mount;

    const scene = new THREE.Scene(); 
    scene.background = new THREE.Color(0x06070b);

    const camera = new THREE.PerspectiveCamera(60, w/h, 0.1, 200); 
    camera.position.set(0,1.1,3.2);

    const renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true }); 
    renderer.setPixelRatio(Math.min(window.devicePixelRatio,2)); 
    renderer.setSize(w,h); 
    mount.appendChild(renderer.domElement);

    const hemi = new THREE.HemisphereLight(0xffffff, 0x202030, 1.3); 
    scene.add(hemi);

    const rim = new THREE.DirectionalLight(0x88bbff, 0.7); 
    rim.position.set(-3,4,-2); 
    scene.add(rim);

    const key = new THREE.DirectionalLight(0xffffff, 1.0); 
    key.position.set(3,6,4); 
    scene.add(key);

    const floor = new THREE.Mesh(
      new THREE.CircleGeometry(6,64), 
      new THREE.MeshStandardMaterial({ color:0x0b0d12, roughness:.92 })
    ); 
    floor.rotation.x=-Math.PI/2; 
    floor.position.y=-0.001; 
    scene.add(floor);

    const controls = new OrbitControls(camera, renderer.domElement); 
    controls.enableDamping=true; 
    controls.dampingFactor=.06; 
    controls.minDistance=1.6; 
    controls.maxDistance=5.4;

    const loader = new GLTFLoader(); 
    loader.load("/vr_headset.glb", 
      (gltf)=>{ scene.add(gltf.scene); setLoading(false); }, 
      undefined, 
      (e)=>{ console.error(e); setLoading(false); }
    );

    let raf; 
    const tick = ()=>{ controls.update(); renderer.render(scene,camera); raf = requestAnimationFrame(tick); }; 
    tick();

    const onResize = ()=>{ 
      const W=mount.clientWidth,H=mount.clientHeight; 
      camera.aspect=W/H; 
      camera.updateProjectionMatrix(); 
      renderer.setSize(W,H); 
    };

    const ro=new ResizeObserver(onResize); 
    ro.observe(mount);

    return ()=>{ 
      cancelAnimationFrame(raf); 
      ro.disconnect(); 
      mount.removeChild(renderer.domElement); 
      renderer.dispose(); 
    };
  }, []);

  return (
    <div style={{ position:"relative", width:"100%", height:"460px", borderRadius:18, overflow:"hidden", border:`1px solid ${C.border}` }}>
      {loading && <div style={{position:"absolute",inset:0,display:"grid",placeItems:"center",color:C.subtle}}>Loading 3D…</div>}
      <div ref={mountRef} style={{ width:"100%", height:"100%" }} />
    </div>
  );
}


// ---------- Helpers ----------
function useParallax(){
  const ref = useRef(null);
  const onMove = useCallback((e)=>{
    const el = ref.current; if(!el) return;
    const r = el.getBoundingClientRect();
    const x = (e.clientX - (r.left + r.width/2)) / r.width; // -0.5..0.5
    const y = (e.clientY - (r.top + r.height/2)) / r.height;
    el.style.setProperty('--rx', `${(-y*4).toFixed(2)}deg`);
    el.style.setProperty('--ry', `${(x*6).toFixed(2)}deg`);
  },[]);
  const reset = useCallback(()=>{
    const el = ref.current; if(el){ el.style.setProperty('--rx','0deg'); el.style.setProperty('--ry','0deg'); }
  },[]);
  return { ref, onMove, reset };
}

function LazyImg({ src, alt }){
  const [loaded, setLoaded] = useState(false);
  return <Img src={src} alt={alt} loaded={loaded} onLoad={()=>setLoaded(true)} loading="lazy" />;
}

// ---------- Main Component ----------
export default function GallerySection({ headerHeight }){
  // state
  const [category, setCategory] = useState("Creatures");
  const [subs, setSubs] = useState([]);
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState("title-asc");
  const [view, setView] = useState("grid"); // grid | masonry | 3d

  // particles canvas
  const particleCanvas = useRef(null);
  useEffect(()=>{
    const canvas = particleCanvas.current; if(!canvas) return;
    const ctx = canvas.getContext('2d'); let raf;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const resize = ()=>{ canvas.width = canvas.clientWidth * dpr; canvas.height = canvas.clientHeight * dpr; };
    resize();
    const stars = Array.from({length: 90}, ()=>({ x: Math.random()*canvas.width, y: Math.random()*canvas.height, s: Math.random()*1.3+0.2, v: Math.random()*0.15+0.05 }));
    const loop = ()=>{ ctx.clearRect(0,0,canvas.width,canvas.height); ctx.globalCompositeOperation='lighter';
      for(const st of stars){ ctx.fillStyle = `rgba(139,92,255,${0.12+Math.random()*0.12})`; ctx.beginPath(); ctx.arc(st.x, st.y, st.s, 0, Math.PI*2); ctx.fill(); st.x += st.v; if(st.x > canvas.width+4) st.x = -4; }
      raf = requestAnimationFrame(loop);
    }; loop();
    const ro = new ResizeObserver(resize); ro.observe(canvas);
    return ()=>{ cancelAnimationFrame(raf); ro.disconnect(); };
  },[]);

  // computed
  const availableSubs = category === "Creatures" ? ["Friendly","Unfriendly"] : ["Waterfront","Mountain Hills","Village"];
  const data = RAW
    .filter(i => i.category === category && (subs.length===0 || subs.includes(i.sub)))
    .filter(i => (query ? (i.title+" "+i.tags.join(" ")).toLowerCase().includes(query.toLowerCase()) : true));

  data.sort((a,b)=>{
    if(sort === 'title-asc') return a.title.localeCompare(b.title);
    if(sort === 'title-desc') return b.title.localeCompare(a.title);
    return 0;
  });

  // pagination / infinite
  const [visible, setVisible] = useState(9);
  const subsString = subs.join(',');
  useEffect(()=>{
   setVisible(v => Math.min(9, data.length || 0));
 }, [category, subsString, query, sort, view, data.length]);
  const loadMoreRef = useRef(null);
  useEffect(()=>{
    const el = loadMoreRef.current; if(!el) return;
    const io = new IntersectionObserver((ents)=>{
      if(ents[0].isIntersecting) setVisible(v=> Math.min(v+6, data.length));
    }, { rootMargin: '200px' });
    io.observe(el); return ()=> io.disconnect();
  }, [data.length]);

  // lightbox
  const [open, setOpen] = useState(false); const [idx, setIdx] = useState(0);
  useEffect(() => {
    if (!open) return;

    const body = document.body;
    const scrollY = window.scrollY || window.pageYOffset || 0;
    const prev = {
      overflow: body.style.overflow,
      position: body.style.position,
      top: body.style.top,
      width: body.style.width,
    };

    body.style.overflow = 'hidden';
    body.style.position = 'fixed';
    body.style.top = `-${scrollY}px`;
    body.style.width = '100%';

    // Force hide chat widget when modal opens
    body.setAttribute('data-artwork-modal-open', 'true');

    return () => {
      body.style.overflow = prev.overflow;
      body.style.position = prev.position;
      body.style.top = prev.top;
      body.style.width = prev.width;
      window.scrollTo(0, scrollY);
      
      // Show chat widget again when modal closes
      body.removeAttribute('data-artwork-modal-open');
    };
  }, [open]);
  useEffect(()=>{
    const onKey = (e)=>{ if(!open) return; if(e.key==='Escape') setOpen(false); if(e.key==='ArrowRight') setIdx(i=> (i+1) % Math.min(visible, data.length)); if(e.key==='ArrowLeft') setIdx(i=> (i-1+Math.min(visible,data.length)) % Math.min(visible,data.length)); };
    window.addEventListener('keydown', onKey); return ()=> window.removeEventListener('keydown', onKey);
  }, [open, visible, data.length]);

  // handlers
  const toggleSub = (s)=> setSubs(prev => prev.includes(s) ? prev.filter(x=>x!==s) : [...prev, s]);

  return (
    <Section style={headerHeight?{ "--vs-header-height": `${headerHeight}px` }:{}}>
      <Backdrop/>
      <Particles ref={particleCanvas} />
      <Wrap>
        <Hero>
          <TitleBlock>
            <H1>Archive of the North</H1>
            <Sub>A weathered gallery of creatures and realms — sketched in soot, ink, and old firelight.</Sub>
          </TitleBlock>
        </Hero>

        <Toolbar>
          <Controls>
            {/* Category */}
            {["Creatures","Environments"].map(c => (
              <Pill key={c} active={view!=="3d" && category===c} onClick={()=>{ setCategory(c); setSubs([]); setView('grid'); }}>
                {c}
              </Pill>
            ))}
            <Pill active={view==="3d"} onClick={()=> setView('3d')}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                <Icon name="stage" size={16} />
                3D Stage
              </span>
            </Pill>

            {/* Search + Sort på samme rad til høyre */}
            <div style={{ display:'flex', gap:10, alignItems:'center' }}>
              <Search placeholder="Search…" value={query} onChange={e=> setQuery(e.target.value)} />
              <Select value={sort} onChange={e=> setSort(e.target.value)}>
                <option value="title-asc">Title A–Z</option>
                <option value="title-desc">Title Z–A</option>
              </Select>
            </div>
          </Controls>

          {/* 🔹 Glass-divider mellom kategori og underkategori */}
          <GlassDivider />

          {/* Sub-filters (multi) */}
          {view!=="3d" && (
            <div style={{ display:'flex', gap:8, gridColumn:'1 / -1' }}>
              {availableSubs.map(s => (
                <Pill key={s} active={subs.includes(s)} onClick={()=> toggleSub(s)}>{s}</Pill>
              ))}
            </div>
          )}

          {/* View toggle */}
          {view!=="3d" && (
            <div style={{ display:'flex', gap:8, justifySelf:'end' }}>
              <ViewToggle data-active={view === 'grid'} onClick={()=> setView('grid')}>
                <Icon name="grid" size={16} />
                Grid
              </ViewToggle>
              <ViewToggle data-active={view === 'masonry'} onClick={()=> setView('masonry')}>
                <Icon name="masonry" size={16} />
                Masonry
              </ViewToggle>
            </div>
          )}
        </Toolbar>

        {view === '3d' ? (
          <div style={{ marginTop: 22 }}>
            <Viewer3D/>
          </div>
        ) : (
          <>
            {view === 'grid' ? (
              <Grid layout initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .28 }}>
                {data.slice(0, visible).map((it,i)=> <GridItem key={it.id} it={it} i={i} onOpen={()=>{ setIdx(i); setOpen(true); }} />)}
              </Grid>
            ) : (
              <Masonry layout>
                {data.slice(0, visible).map((it,i)=> <MasonryItem key={it.id} it={it} i={i} onOpen={()=>{ setIdx(i); setOpen(true); }} />)}
              </Masonry>
            )}
            {/* 🔥 Usynlig sentinel – ingen hvit boks */}
            <div ref={loadMoreRef} style={{ height: 0, opacity: 0, pointerEvents: 'none' }} />
          </>
        )}
      </Wrap>

      {/* Lightbox */}
      <AnimatePresence>
  {open && (
    <Dimmer data-artwork-modal="true" onClick={()=> setOpen(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      {/* 🔹 Venstre/Høyre piler - absolute posisjon i Dimmer */}
      <NavArrow $left onClick={(e) => { e.stopPropagation(); setIdx(i=> (i-1+Math.min(visible,data.length)) % Math.min(visible,data.length)); }} aria-label="Previous" />
      <NavArrow onClick={(e) => { e.stopPropagation(); setIdx(i=> (i+1) % Math.min(visible,data.length)); }} aria-label="Next" />
      
      <Panel onClick={e=> e.stopPropagation()} initial={{ opacity: 0, scale: .98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: .98 }}>
        <FullImg src={data[idx]?.img} alt={data[idx]?.title || 'Image'} />

        {/* 🔹 Close-knapp nederst */}
        <Bar>
          <Ghost onClick={()=> setOpen(false)} aria-label="Close">
            <Icon name="close" size={16} />
            Close
          </Ghost>
          <div style={{ display: "flex", gap: 10 }}>
            <Ghost
              onClick={() => {
                const current = data[idx];
                if (!current?.img) return;
                const a = document.createElement("a");
                a.href = current.img;
                a.download = `${current.title || "art"}.png`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
              }}
              aria-label="Download"
            >
              <Icon name="download" size={16} />
              Download
            </Ghost>
          </div>
        </Bar>
      </Panel>
    </Dimmer>
  )}
</AnimatePresence>
    </Section>
  );
}

// ---------- Item Components ----------
function GridItem({ it, i, onOpen }){
  const { onMove, reset } = useParallax();
  return (
    <Card
      as={motion.button}
      layout
      onClick={onOpen}
      onMouseMove={onMove}
      onMouseLeave={reset}
      style={{ transform: 'perspective(900px) rotateX(var(--rx,0)) rotateY(var(--ry,0))' }}
      whileHover={{ y: -3 }} whileTap={{ scale: .985 }} aria-label={`Open ${it.title}`}
    >
      <Actions className="actions">
        <Ghost
          onClick={(e)=>{
            e.stopPropagation();
            navigator.clipboard?.writeText(window.location.href + `#${it.id}`);
          }}
          aria-label="Copy link"
        >
          <Icon name="link" size={16} />
          Link
        </Ghost>
        <Ghost as="a" href={it.img} download onClick={e=> e.stopPropagation()} aria-label="Download">
          <Icon name="download" size={16} />
          Save
        </Ghost>
      </Actions>
      <Thumb>
        <LazyImg src={it.img} alt={it.title} />
        <Shine className="shine" />
      </Thumb>
      <Meta>
        <Title>{it.title}</Title>
        <Badge>{it.category}</Badge>
      </Meta>
    </Card>
  );
}

function MasonryItem({ it, i, onOpen }){
  const { onMove, reset } = useParallax();
  return (
    <MasonryCard
      as={motion.button}
      onClick={onOpen}
      onMouseMove={onMove}
      onMouseLeave={reset}
      style={{ transform: 'perspective(900px) rotateX(var(--rx,0)) rotateY(var(--ry,0))' }}
    >
      <ThumbM>
        <LazyImg src={it.img} alt={it.title} />
        <Shine className="shine" />
      </ThumbM>
      <Meta>
        <Title>{it.title}</Title>
        <Badge>{it.category}</Badge>
      </Meta>
    </MasonryCard>
  );
}
