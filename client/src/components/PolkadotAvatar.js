// src/components/PolkadotAvatar.js
import './PolkadotAvatar.css';

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const rand = (a, b) => Math.random() * (b - a) + a;
const choice = (a, b) => (Math.random() < 0.5 ? a : b);

let stylesInjected = false;
export function injectPolkadotStyles() {
  // Stiler er nå importert via CSS-fil, så denne funksjonen er ikke lenger nødvendig
  // for å injisere stiler, men beholdes for kompatibilitet.
  if (stylesInjected) return;
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
    size: 32, dots: 120, rings: 4, minRadius: 0, maxRadius: 56, dotSize: 5,
    variant: 'free', // 'free' | 'sphere'
    // color
    mode: 'spread', baseHue: 210, spread: 0, sat: 95, light: 55, alpha: 0.75,
    bgAlpha: 0.12, glowStrength: 18,
    // speed
    speedMin: 3.0, speedMax: 10.0, bobAmp: 3.0, bobSpeed: 1.8,
    // state/visibility
    state: 'idle', visible: true,
    // physics
    physics: false, gravity: 'none', // 'down'|'up'|'none'
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
    const size = opts.variant === 'sphere' ? 70 : opts.size;
    const x = size / 2 + Math.cos(angle) * d.r;
    const y = size / 2 + Math.sin(angle) * d.r;

    return { orb, dot, x, y, dir: d.dir, r: d.r, baseAngle: angle, currentAngle: angle };
  });

  startLoop(api);
}

function startLoop(api) {
  stopLoop(api);
  if (api.opts.variant !== 'sphere' || !api.opts.physics) return;

  // Juster for faktisk størrelse
  const size = api.opts.variant === 'sphere' ? 70 : api.opts.size;
  const center = { x: size / 2, y: size / 2 }; // Senter
  
  // Initialiser angles hvis ikke allerede satt
  api.list.forEach((item, i) => {
    if (!item.baseAngle) {
      item.baseAngle = (Math.PI * 2 * i) / api.list.length;
      item.currentAngle = item.baseAngle;
      item.radius = item.r || 15;
      item.rotationSpeed = 0.5 + Math.random() * 0.5; // Variabel hastighet
      item.explosionVx = 0;
      item.explosionVy = 0;
      item.explosionActive = false;
      item.originalHue = api.opts.baseHue;
    }
  });

  const step = (t) => {
    const sp = stateParams(api.opts.state, api.opts.baseHue);
    const { x: mx, y: my, inside } = api.mouse;
    
    const mouseDistFromCenter = Math.hypot(mx - center.x, my - center.y);
    const nearGlass = !inside && mouseDistFromCenter < size / 2 + 20;

    for (const item of api.list) {
      // Oppdater vinkel for sirkulær bevegelse
      item.currentAngle += 0.02 * item.rotationSpeed * item.dir * sp.spinMult;
      
      let targetX, targetY;
      
      // Håndter eksplosjon
      if (item.explosionActive) {
        item.explosionVx *= 0.92; // Damping
        item.explosionVy *= 0.92;
        item.x += item.explosionVx;
        item.y += item.explosionVy;
        
        // Sjekk om eksplosjonen er ferdig
        if (Math.abs(item.explosionVx) < 0.5 && Math.abs(item.explosionVy) < 0.5) {
          item.explosionActive = false;
          // Tilbakestill farge
          item.dot.style.setProperty('--dot-hue', item.originalHue);
        }
      } else {
        if (inside) {
          // Når musen er over, sentrer rundt musen med tettere orbit
          const orbitRadius = 8 + item.radius * 0.2;
          targetX = mx + Math.cos(item.currentAngle * 2) * orbitRadius; // Dobbel hastighet
          targetY = my + Math.sin(item.currentAngle * 2) * orbitRadius;
        } else {
          // Normal sirkulær bane rundt senter
          targetX = center.x + Math.cos(item.currentAngle) * item.radius;
          targetY = center.y + Math.sin(item.currentAngle) * item.radius;
          
          // Forbedret magnetisme når musen er nær men utenfor
          if (nearGlass) {
            const dx = mx - targetX;
            const dy = my - targetY;
            const dist = Math.hypot(dx, dy);
            
            // Sjekk om dotten er på samme side som musen
            const dotAngle = Math.atan2(targetY - center.y, targetX - center.x);
            const mouseAngle = Math.atan2(my - center.y, mx - center.x);
            let angleDiff = Math.abs(dotAngle - mouseAngle);
            if (angleDiff > Math.PI) angleDiff = 2 * Math.PI - angleDiff;
            
            // Påvirk kun dotter på samme side (innen 90 grader)
            if (angleDiff < Math.PI / 2 && dist < 40) {
              const pull = (1 - dist / 40) * 8 * (1 - angleDiff / (Math.PI / 2));
              targetX += dx * pull / dist;
              targetY += dy * pull / dist;
            }
          }
        }
        
        // Smooth interpolering til målposisjon
        const lerpFactor = inside ? 0.2 : 0.1;
        item.x = item.x + (targetX - item.x) * lerpFactor;
        item.y = item.y + (targetY - item.y) * lerpFactor;
      }

      // Posisjonering relativt til senter
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
    
    // Eksplosjon fra klikk-punktet med fargevariasjon
    api.list.forEach((d, i) => {
      const dx = d.x - px;
      const dy = d.y - py;
      const dist = Math.hypot(dx, dy) || 1;
      const force = 15 + Math.random() * 10;
      
      // Sett eksplosjonsvektor
      d.explosionVx = (dx / dist) * force;
      d.explosionVy = (dy / dist) * force;
      d.explosionActive = true;
      
      // Gi forskjellige farger under eksplosjon
      const hueShift = Math.random() * 120 - 60; // -60 til +60 grader
      const newHue = (d.originalHue + hueShift + 360) % 360;
      d.dot.style.setProperty('--dot-hue', newHue);
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
