import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import styled from "styled-components";
import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { AnimatePresence, motion } from "framer-motion";

// ============================================================================
//  VINTRA – DARK / NEON EDITION
//  - ZERO global CSS, zero Header/Footer, safe drop-in
//  - Honors header height via CSS var --vs-header-height or prop headerHeight
//  - Ultra dark, neon accents, parallax hero, particles, sticky pro toolbar
//  - View modes (Grid / Masonry), Search, Multi-filter, Sort, Quick actions
//  - Fancy hover (parallax tilt + shine), skeletons, infinite loading
//  - Upgraded 3D viewer
// ============================================================================

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

const MODELS = ["Nokken","Troll","Shadow","Headset"];

// ---------- Theme (scoped) ----------
const C = {
  bg: "#050608",
  panel: "rgba(255,255,255,.04)",
  border: "rgba(255,255,255,.10)",
  text: "#E8EAED",
  subtle: "#9AA0A6",
  neonA: "#8B5CFF",
  neonB: "#00E7FF",
  neonC: "#00FFA3",
  radius: 18,
  shadow: "0 22px 60px rgba(0,0,0,.45)",
};

// ---------- Layout ----------
const Section = styled.section`
  --header: var(--vs-header-height, 96px);
  position: relative; background: ${C.bg};
  padding: calc(var(--header) + 56px) 0 120px; /* never collide with header */
  isolation: isolate;
  overflow: hidden; /* 🔥 sørger for at ingenting "lyser" utenfor seksjonen */
  
  @media (max-width: 768px) {
    padding: calc(var(--header) + 30px) 0 80px;
  }
`;

const Backdrop = styled.div`
  position: absolute; inset: 0; z-index: 0; pointer-events: none;
  &::before{ content:""; position:absolute; inset:-20% -10%;
    background:
      radial-gradient(80vmax 70vmax at 85% 0%, rgba(139,92,255,.12), transparent 60%),
      radial-gradient(70vmax 70vmax at 20% 100%, rgba(0,231,255,.10), transparent 60%),
      url(${backgroundImage}) center/cover no-repeat;
    opacity:.16; filter: saturate(.9) contrast(1.04);
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
  background: linear-gradient(90deg, #fff, #9fdcff 40%, #b7a2ff 70%);
  -webkit-background-clip:text; background-clip:text; color:transparent;
  
  @media (max-width: 768px) {
    font-size: clamp(24px, 6vw, 36px);
  }
`;
const Sub = styled.p`
  margin:.3rem 0 0; color:${C.subtle}; max-width: 70ch;
  
  @media (max-width: 768px) {
    font-size: 0.95rem;
    max-width: 100%;
  }
`;

const Toolbar = styled.div`
  position: sticky; top: calc(var(--header) + 10px); z-index: 5;
  display: grid; grid-template-columns: 1fr auto; gap: 14px; align-items:center; backdrop-filter: blur(6px);
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 10px;
  }
`;

/* 🔹 Glass-divider som matcher knappestilen (brukes mellom kategorier og underkategorier) */
const GlassDivider = styled.div`
  grid-column: 1 / -1; height: 1px; margin: 2px 0 4px;
  background: linear-gradient(90deg, rgba(255,255,255,.04), rgba(255,255,255,.18), rgba(255,255,255,.04));
  border: 1px solid rgba(255,255,255,.10);
  border-radius: 999px;
  box-shadow: inset 0 0 10px rgba(255,255,255,.08);
  backdrop-filter: blur(8px);
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
  border: 1px solid ${p => p.active ? "rgba(255,255,255,.22)" : C.border};
  color: ${p => p.active ? C.text : C.subtle};
  background: ${p => p.active ? "rgba(255,255,255,.08)" : "rgba(255,255,255,.03)"};
  border-radius: 999px;
  padding: 10px 16px;
  font-weight: 800;
  cursor: pointer;
  transition: .15s ease;
  backdrop-filter: blur(8px);
  box-shadow: ${p => p.active
    ? "inset 0 0 14px rgba(255,255,255,.10), 0 6px 18px rgba(0,0,0,.35)"
    : "none"};

  &:hover { transform: translateY(-1px); }
  &:focus-visible { outline: 2px solid ${C.neonB}; outline-offset: 2px; }
  
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

const ViewToggle = styled.div`
  display:flex; gap:8px;
`;
const ViewBtn = styled(Pill)` padding: 8px 12px; `;

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
  background:${C.panel}; border:1px solid ${C.border}; border-radius:${C.radius}px; padding:12px; box-shadow:${C.shadow};
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
  color: #fff;                 /* 🔥 hvit tekst */
`;
const Badge = styled.span`
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 999px;
  color: ${C.text};
  background: rgba(255,255,255,.06);                 /* 🔥 mørk glass */
  border: 1px solid rgba(255,255,255,.12);
  backdrop-filter: blur(6px);
  box-shadow:
    inset 0 0 12px rgba(255,255,255,.06),
    0 6px 20px rgba(0,0,0,.35);
`;
const Tags = styled.div` display:flex; gap:8px; flex-wrap:wrap; `;
const Tag = styled.span` font-size:11px; padding:4px 8px; border-radius:999px; color:${C.subtle}; background:rgba(255,255,255,.05); border:1px solid ${C.border}; `;

const Actions = styled.div` position:absolute; top:12px; right:12px; display:flex; gap:8px; `;
const Ghost = styled.button`
  appearance:none; border:1px solid ${C.border}; background:rgba(10,12,16,.6); color:${C.text};
  padding:8px 10px; border-radius:12px; cursor:pointer; backdrop-filter: blur(6px);
`;

// ---------- Lightbox ----------
// 🔹 Nye navigasjons-knapper til Lightbox
const NavArrow = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%) scale(2);
  ${p => p.left ? "left: 200px;" : "right: 200px;"}
  background: rgba(0,0,0,0.45);
  border: none;
  color: #fff;
  font-size: 26px;
  font-weight: bold;
  width: 50px;
  height: 50px;
  cursor: pointer;
  backdrop-filter: blur(6px);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background .2s, transform .2s;
  

  &:hover {
    background: rgba(0,0,0,0.65);
   
  }
`;

const Dimmer = styled(motion.div)`
  position:fixed; inset:0; background:rgba(5,6,8,.78); backdrop-filter: blur(10px); z-index:1000; display:grid; place-items:center;
`;
const Panel = styled(motion.div)`
  width:min(94vw, 1280px); max-height:88dvh; display:grid; grid-template-rows: 1fr auto; gap: 10px;
  background:${C.panel}; border:1px solid ${C.border}; border-radius:22px; box-shadow:${C.shadow}; overflow:hidden;
`;
const FullImg = styled.img` width:100%; height:100%; object-fit:contain; background:#06070b; `;
const Bar = styled.div` display:flex; justify-content:space-between; align-items:center; padding:12px 16px; `;

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
  useEffect(()=>{
   setVisible(v => Math.min(9, data.length || 0));
 }, [category, subs.join(','), query, sort, view, data.length]);
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
            <H1>Vintra Gallery</H1>
            <Sub>Dark, cinematic showcase of creatures and worlds. Refine with filters or switch to the neon 3D stage.</Sub>
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
            <Pill active={view==="3d"} onClick={()=> setView('3d')}>3D Stage</Pill>

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
              <ViewBtn active={view==='grid'} onClick={()=> setView('grid')}>Grid</ViewBtn>
              <ViewBtn active={view==='masonry'} onClick={()=> setView('masonry')}>Masonry</ViewBtn>
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
    <Dimmer onClick={()=> setOpen(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
      <Panel onClick={e=> e.stopPropagation()} initial={{ opacity: 0, scale: .98 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: .98 }}>
        <FullImg src={data[idx]?.img} alt={data[idx]?.title || 'Image'} />

        {/* 🔹 Venstre/Høyre piler */}
        <NavArrow left onClick={()=> setIdx(i=> (i-1+Math.min(visible,data.length)) % Math.min(visible,data.length))}>
          ←
        </NavArrow>
        <NavArrow onClick={()=> setIdx(i=> (i+1) % Math.min(visible,data.length))}>
          →
        </NavArrow>

        {/* 🔹 Close-knapp nederst */}
        <Bar>
          <Ghost onClick={()=> setOpen(false)}>Close ✕</Ghost>
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
  const { ref, onMove, reset } = useParallax();
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
        <Ghost onClick={(e)=>{ e.stopPropagation(); navigator.clipboard?.writeText(window.location.href + `#${it.id}`); }}>Copy Link</Ghost>
        <Ghost as="a" href={it.img} download onClick={e=> e.stopPropagation()}>Download</Ghost>
      </Actions>
      <Thumb>
        <LazyImg src={it.img} alt={it.title} />
        <Shine className="shine" />
      </Thumb>
      <Meta>
        <Title>{it.title}</Title>
        <Badge>{it.category}</Badge>
      </Meta>
      <Tags>
        {it.tags?.map(t=> <Tag key={t}>#{t}</Tag>)}
      </Tags>
    </Card>
  );
}

function MasonryItem({ it, i, onOpen }){
  const { ref, onMove, reset } = useParallax();
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
      <Tags>
        {it.tags?.map(t=> <Tag key={t}>#{t}</Tag>)}
      </Tags>
    </MasonryCard>
  );
}
