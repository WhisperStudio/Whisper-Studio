// src/components/PolkadotAvatar.js
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const rand = (a, b) => Math.random() * (b - a) + a;
const choice = (a, b) => (Math.random() < 0.5 ? a : b);

const BASE_CSS = `
.polka{ position:relative; width:var(--size,64px); aspect-ratio:1; border-radius:999px; display:grid; place-items:center; overflow:visible; }
.polka.is-hidden{ opacity:0; transform:scale(1.12); filter:blur(1px); transition: opacity .28s ease, transform .28s ease, filter .28s ease; pointer-events:none; }
.polka.is-visible{ opacity:1; transform:scale(1); transition: opacity .28s ease, transform .28s ease; }

/* Free avatar (uten ramme) */
.polka.free{ 
  background: radial-gradient(circle at 50% 50%,
    hsla(var(--base-hue,220), var(--sat,95%), 70%, var(--bg-alpha,0.12)) 0%,
    hsla(var(--base-hue,220), var(--sat,95%), 50%, calc(var(--bg-alpha,0.12)*0.6)) 40%,
    transparent 70%);
  backdrop-filter: blur(4px) saturate(120%);
  -webkit-backdrop-filter: blur(4px) saturate(120%);
  filter: drop-shadow(0 0 12px hsla(var(--base-hue,220), var(--sat,95%), 60%, 0.45));
}

/* Glasskule-variant - mer gjennomsiktig */
.polka.sphere{ 
  background:
    radial-gradient(circle at 35% 30%, #ffffff25 0%, #ffffff08 35%, #00000015 75%),
    radial-gradient(circle at 50% 50%,
      hsla(var(--base-hue,220), var(--sat,95%), 70%, 0.06) 0%,
      hsla(var(--base-hue,220), var(--sat,95%), 50%, 0.04) 40%,
      transparent 70%);
  box-shadow: 
    inset 0 0 10px #ffffff22, 
    inset 0 -2px 6px #ffffff15,
    0 6px 24px #00000033;
  backdrop-filter: blur(4px) saturate(120%);
  -webkit-backdrop-filter: blur(4px) saturate(120%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  overflow: hidden;
}

.polka .orb{ 
  position:absolute; inset:0; margin:auto; width:var(--size); height:var(--size); 
  transform-origin:center center; will-change: transform;
  animation: orb-rot linear infinite; 
  animation-duration: calc(var(--speed) / var(--speed-mult, 1));
  transform: rotate(var(--start));
}
@keyframes orb-rot { to { transform: rotate(calc(var(--start) + var(--dir) * 360deg)); } }

.polka .radius{ transform-origin:left center; transform: translateX(var(--r)) rotate(var(--tilt)); will-change: transform; }
.polka .bob{ will-change: transform; animation: bob ease-in-out infinite alternate; animation-duration: var(--bob-speed); }
@keyframes bob{ from{ transform: translateY(calc(var(--bob) * -1)); } to{ transform: translateY(var(--bob)); } }

/* Glass/gel dot med glow */
.polka .dot{ 
  width:var(--dot-size,8px); height:var(--dot-size,8px); border-radius:999px; 
  display:block; pointer-events:none;
  background: radial-gradient(circle at 50% 50%,
    hsla(var(--dot-hue, var(--base-hue,220)), var(--dot-sat, var(--sat,95%)), calc(var(--dot-light, var(--light,55%)) + 12%), calc(var(--dot-alpha, var(--alpha,0.75)) * 0.95)) 0%,
    hsla(var(--dot-hue, var(--base-hue,220)), var(--dot-sat, var(--sat,95%)), var(--dot-light, var(--light,55%)), calc(var(--dot-alpha, var(--alpha,0.75)) * 0.9)) 45%,
    hsla(var(--dot-hue, var(--base-hue,220)), var(--dot-sat, var(--sat,95%)), calc(var(--dot-light, var(--light,55%)) - 8%), calc(var(--dot-alpha, var(--alpha,0.75)) * 0.85)) 70%,
    hsla(var(--dot-hue, var(--base-hue,220)), var(--dot-sat, var(--sat,95%)), calc(var(--dot-light, var(--light,55%)) - 20%), calc(var(--dot-alpha, var(--alpha,0.75)) * 0.78)) 100%);
  box-shadow: 
    inset 0 0 8px hsla(var(--dot-hue, var(--base-hue,220)), 40%, 85%, 0.18),
    0 0 var(--glow-strength, 18px) hsla(var(--dot-hue, var(--base-hue,220)), var(--dot-sat, var(--sat,95%)), 60%, 0.5);
  transition: background 0.6s ease, box-shadow 0.6s ease;
}
`;

let stylesInjected = false;
export function injectPolkadotStyles() {
  if (stylesInjected) return;
  const tag = document.createElement('style');
  tag.id = 'polkadot-avatar-css';
  tag.textContent = BASE_CSS;
  document.head.appendChild(tag);
  stylesInjected = true;
}

function buildConfig(opts) {
  const { dots, rings, minRadius, maxRadius, mode, baseHue, spread, sat, light, alpha, speedMin, speedMax, bobAmp, bobSpeed } = opts;
  const ringCount = Math.max(1, rings | 0);
  const arr = Array.from({ length: dots }, (_, i) => {
    const ringIdx = i % ringCount;
    const t0 = ringCount === 1 ? 0 : ringIdx / ringCount;
    const t1 = ringCount === 1 ? 1 : (ringIdx + 1) / ringCount;
    const rMin = minRadius + (maxRadius - minRadius) * t0;
    const rMax = minRadius + (maxRadius - minRadius) * t1;

    const r = rand(rMin, rMax);
    const start = rand(0, 360);
    const dir = choice(1, -1);
    const speed = rand(speedMin, speedMax); // s/rot
    const bobAmpVal = rand(bobAmp * 0.5, Math.max(bobAmp, 0.1));
    const bobSpeedVal = bobSpeed * rand(0.85, 1.25);
    const tilt = rand(-8, 8);
    // Kun én farge - bruk baseHue direkte uten spread
    const hue = baseHue;
    const s = sat;
    const l = light;
    const a = alpha;
    return { r, start, dir, speed, bobAmp: bobAmpVal, bobSpeed: bobSpeedVal, tilt, hue, s, l, a, phase: rand(0, 1.5) };
  });
  return { dots: arr, ringCount };
}

function stateParams(state, baseHue) {
  switch (state) {
    case 'typing':    return { spinMult: 2.2, hueShift: 0, base: 25  };   // rød/gul rask
    case 'listening': return { spinMult: 0.5, hueShift: 0, base: 140 };  // grønn treig
    default:          return { spinMult: 1.0, hueShift: 0, base: baseHue };
  }
}

/** Oppretter avatar i container og returnerer et API */
export function createPolkadotAvatar(container, options = {}) {
  injectPolkadotStyles();

  const opts = {
    // visuals
    size: 140, dots: 60, rings: 4, minRadius: 0, maxRadius: 56, dotSize: 5,
    variant: 'free', // 'free' | 'sphere'
    // color
    mode: 'spread', baseHue: 210, spread: 0, sat: 95, light: 55, alpha: 0.75,
    bgAlpha: 0.12, glowStrength: 18,
    // speed
    speedMin: 3.0, speedMax: 10.0, bobAmp: 3.0, bobSpeed: 1.8,
    // state/visibility
    state: 'idle', visible: true,
    // physics
    physics: false, gravity: 'down', // 'down'|'up'|'none'
    ...options
  };

  const api = {
    container,
    root: document.createElement('div'),
    data: null,
    list: [],
    raf: 0,
    mouse: { x: 0, y: 0, inside: false },
    opts,
    update,
    setState,
    setVisible,
    destroy
  };

  api.root.className = `polka ${opts.variant} ${opts.state} ${opts.visible ? 'is-visible' : 'is-hidden'}`;
  api.root.style.setProperty('--size', `${opts.size}px`);
  api.root.style.setProperty('--dot-size', `${opts.dotSize}px`);
  api.root.style.setProperty('--base-hue', `${opts.baseHue}`);
  api.root.style.setProperty('--sat', `${opts.sat}%`);
  api.root.style.setProperty('--light', `${opts.light}%`);
  api.root.style.setProperty('--alpha', `${opts.alpha}`);
  api.root.style.setProperty('--bg-alpha', `${opts.bgAlpha}`);
  api.root.style.setProperty('--glow-strength', `${opts.glowStrength}px`);
  container.innerHTML = '';
  container.appendChild(api.root);

  rebuild(api);
  attachInteractions(api);

  return api;
}

function rebuild(api) {
  const { root, opts } = api;
  const sp = stateParams(opts.state, opts.baseHue);
  
  // Update baseHue based on state
  const effectiveBaseHue = sp.base;
  const configOpts = { ...opts, baseHue: effectiveBaseHue };
  api.data = buildConfig(configOpts);

  root.style.setProperty('--size', `${opts.size}px`);
  root.style.setProperty('--dot-size', `${opts.dotSize}px`);
  root.style.setProperty('--base-hue', `${effectiveBaseHue}`);
  root.style.setProperty('--sat', `${opts.sat}%`);
  root.style.setProperty('--light', `${opts.light}%`);
  root.style.setProperty('--alpha', `${opts.alpha}`);
  root.style.setProperty('--bg-alpha', `${opts.bgAlpha}`);
  root.style.setProperty('--glow-strength', `${opts.glowStrength}px`);
  root.style.setProperty('--speed-mult', `${sp.spinMult}`);

  root.classList.remove('free', 'sphere');
  root.classList.add(opts.variant);

  root.innerHTML = '';
  api.list = api.data.dots.map((d) => {
    const orb = document.createElement('div');
    orb.className = 'orb';

    orb.style.setProperty('--r', `${d.r}px`);
    orb.style.setProperty('--start', `${d.start}deg`);
    orb.style.setProperty('--dir', String(d.dir));
    orb.style.setProperty('--speed', `${d.speed}s`);
    orb.style.setProperty('--bob', `${d.bobAmp}px`);
    orb.style.setProperty('--bob-speed', `${d.bobSpeed.toFixed(2)}s`);
    orb.style.setProperty('--tilt', `${d.tilt}deg`);
    orb.style.setProperty('--speed-mult', `${sp.spinMult}`);

    const radiusEl = document.createElement('div');
    radiusEl.className = 'radius';

    const bobEl = document.createElement('div');
    bobEl.className = 'bob';
    bobEl.style.animationDelay = `${d.phase.toFixed(2)}s`;

    const dot = document.createElement('span');
    dot.className = 'dot';
    dot.style.setProperty('--dot-hue', `${d.hue}`);
    dot.style.setProperty('--dot-sat', `${d.s}%`);
    dot.style.setProperty('--dot-light', `${d.l}%`);
    dot.style.setProperty('--dot-alpha', `${d.a}`);

    bobEl.appendChild(dot);
    radiusEl.appendChild(bobEl);
    orb.appendChild(radiusEl);
    root.appendChild(orb);

    const angle = d.start * (Math.PI / 180);
    const x = opts.size / 2 + Math.cos(angle) * d.r;
    const y = opts.size / 2 + Math.sin(angle) * d.r;
    return { orb, dot, x, y, vx: 0, vy: 0 };
  });

  startLoop(api);
}

function startLoop(api) {
  stopLoop(api);
  if (api.opts.variant !== 'sphere' || !api.opts.physics) return;

  // Større område - gi dottene mer plass
  const R = api.opts.size * 0.45;  // Enklere beregning, mer plass
  const center = { x: api.opts.size / 2, y: api.opts.size / 2 };
  let last = performance.now();

  const step = (t) => {
    const dt = Math.min(0.04, (t - last) / 1000);
    last = t;

    const sp = stateParams(api.opts.state, api.opts.baseHue);
    const { x: mx, y: my, inside } = api.mouse;
    
    // Sjekk om musen er nær (innen 20px fra glasskulen)
    const mouseDistFromCenter = Math.hypot(mx - center.x, my - center.y);
    const nearGlass = !inside && mouseDistFromCenter < R + 20;

    for (const item of api.list) {
      // Start med null kraft
      let ax = 0, ay = 0;
      
      // Svak sentripetalkraft for å holde dottene i en løs klynge
      const centripetalForce = -0.2 * sp.spinMult;
      const dxToCenter = center.x - item.x;
      const dyToCenter = center.y - item.y;
      const distToCenter = Math.hypot(dxToCenter, dyToCenter) || 1;
      ax += (dxToCenter / distToCenter) * centripetalForce;
      ay += (dyToCenter / distToCenter) * centripetalForce;
      
      // Hvis musen er NÆR glasskulen (men ikke inni)
      if (nearGlass) {
        const dx = mx - item.x, dy = my - item.y;
        const dist = Math.hypot(dx, dy) || 1;
        
        // Bølgeeffekt - trekk dotter mot kanten nærmest musen
        if (dist < R * 1.5) {
          const influence = Math.max(0, 1 - (dist / (R * 1.5)));
          const pullStrength = 40 * influence;
          
          // Trekk mot kanten, ikke direkte mot musen
          const angleToMouse = Math.atan2(my - center.y, mx - center.x);
          const edgeX = center.x + Math.cos(angleToMouse) * R * 0.9;
          const edgeY = center.y + Math.sin(angleToMouse) * R * 0.9;
          
          const edx = edgeX - item.x, edy = edgeY - item.y;
          const edist = Math.hypot(edx, edy) || 1;
          ax += (edx / edist) * pullStrength;
          ay += (edy / edist) * pullStrength;
        }
      } else if (inside) {
        // Musen er INNI glasskulen - samle dotter rundt musen
        const dx = mx - item.x, dy = my - item.y;
        const dist = Math.hypot(dx, dy) || 1;
        
        // Sterk attraksjon mot musen
        const magnetPull = 180;
        ax += (dx / dist) * magnetPull;
        ay += (dy / dist) * magnetPull;
        
        // Orbital kraft rundt musen når nær
        if (dist < 15) {
          const orbitalForce = 100;
          ax += dy * orbitalForce / dist;  // Reversert for korrekt retning
          ay += -dx * orbitalForce / dist; // Reversert for korrekt retning
        }
      }
      
      // Mild gravitasjon
      if (api.opts.gravity !== 'none' && !inside) {
        const g = 4;
        ay += api.opts.gravity === 'down' ? g : -g;
      }

      // Oppdater hastighet med høyere damping når musen er inni
      const damping = inside ? 0.88 : 0.95;
      item.vx = (item.vx + ax * dt) * damping;
      item.vy = (item.vy + ay * dt) * damping;
      item.x += item.vx * dt;
      item.y += item.vy * dt;

      // Soft border constraint
      const dx = item.x - center.x, dy = item.y - center.y;
      const d = Math.hypot(dx, dy);
      if (d > R) {
        const nx = dx / d, ny = dy / d;
        item.x = center.x + nx * R;
        item.y = center.y + ny * R;
        // Veldig myk bounce
        const dotv = item.vx * nx + item.vy * ny;
        item.vx -= 1.1 * dotv * nx;
        item.vy -= 1.1 * dotv * ny;
      }

      // Oppdater DOM
      item.orb.style.transform = `translate(${item.x - center.x}px, ${item.y - center.y}px)`;
    }

    api.raf = requestAnimationFrame(step);
  };

  api.raf = requestAnimationFrame(step);
}

function stopLoop(api) {
  if (api.raf) cancelAnimationFrame(api.raf);
  api.raf = 0;
}

function attachInteractions(api) {
  const root = api.root;
  if (!root) return;

  const onMove = (e) => {
    const rect = root.getBoundingClientRect();
    api.mouse.x = e.clientX - rect.left;
    api.mouse.y = e.clientY - rect.top;
    api.mouse.inside = true;
  };
  const onLeave = () => { api.mouse.inside = false; };
  const onClick = (e) => {
    if (api.opts.variant !== 'sphere') return;
    const rect = root.getBoundingClientRect();
    const px = e.clientX - rect.left, py = e.clientY - rect.top;
    const cx = rect.width / 2, cy = rect.height / 2;
    
    // Eksplosjon fra klikk-punktet
    api.list.forEach((d) => {
      const orbRect = d.orb.getBoundingClientRect();
      const dotX = orbRect.left + orbRect.width / 2 - rect.left;
      const dotY = orbRect.top + orbRect.height / 2 - rect.top;
      const dx = dotX - px;
      const dy = dotY - py;
      const dist = Math.hypot(dx, dy) || 1;
      const force = 300 / Math.max(dist, 20);
      d.vx += (dx / dist) * force;
      d.vy += (dy / dist) * force;
    });
  };

  root.addEventListener('mousemove', onMove);
  root.addEventListener('mouseleave', onLeave);
  root.addEventListener('click', onClick);

  api._cleanup = () => {
    root.removeEventListener('mousemove', onMove);
    root.removeEventListener('mouseleave', onLeave);
    root.removeEventListener('click', onClick);
  };
}

function setState(state) {
  this.opts.state = state;
  this.root.className = `polka ${this.opts.variant} ${this.opts.state} ${this.opts.visible ? 'is-visible' : 'is-hidden'}`;
  // Smooth transition ved å oppdatere CSS-variabler
  const sp = stateParams(state, this.opts.baseHue);
  const effectiveBaseHue = sp.base;
  
  // Smooth overgang for base-hue og speed
  this.root.style.transition = 'filter 0.8s ease';
  this.root.style.setProperty('--base-hue', `${effectiveBaseHue}`);
  this.root.style.setProperty('--speed-mult', `${sp.spinMult}`);
  
  // Oppdater dot-farger dynamisk med smooth transition
  const dots = this.root.querySelectorAll('.dot');
  dots.forEach((dot, i) => {
    // Stagger transition for bølgeeffekt
    setTimeout(() => {
      dot.style.transition = 'background 0.8s ease, box-shadow 0.8s ease';
      dot.style.setProperty('--dot-hue', `${effectiveBaseHue}`);
    }, i * 10);
  });
}
function setVisible(visible) {
  this.opts.visible = !!visible;
  this.root.classList.toggle('is-visible', !!visible);
  this.root.classList.toggle('is-hidden', !visible);
}
function update(newOptions) {
  Object.assign(this.opts, newOptions || {});
  rebuild(this);
}
function destroy() {
  if (this._cleanup) this._cleanup();
  if (this.raf) cancelAnimationFrame(this.raf);
  this.container && (this.container.innerHTML = '');
}
