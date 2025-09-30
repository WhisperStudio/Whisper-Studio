// src/components/PolkadotAvatar.js
const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const rand = (a, b) => Math.random() * (b - a) + a;
const choice = (a, b) => (Math.random() < 0.5 ? a : b);

const BASE_CSS = `
.polka{ position:relative; width:var(--size,64px); aspect-ratio:1; border-radius:999px; display:grid; place-items:center; }
.polka.is-hidden{ opacity:0; transform:scale(1.12); filter:blur(1px); transition: opacity .28s ease, transform .28s ease, filter .28s ease; pointer-events:none; }
.polka.is-visible{ opacity:1; transform:scale(1); transition: opacity .28s ease, transform .28s ease; }

/* Free avatar (uten ramme) */
.polka.free{ background: radial-gradient(circle at 50% 50%, hsla(var(--base-hue,220),90%,60%,.10) 0%, transparent 65%); }

/* Glasskule-variant */
.polka.sphere{ background:
  radial-gradient(circle at 35% 30%, #ffffff22 0%, #ffffff05 35%, #00000020 75%),
  radial-gradient(circle at 50% 50%, hsla(var(--base-hue,220),90%,60%,.10) 0%, transparent 70%);
  box-shadow: inset 0 0 10px #ffffff22, 0 8px 32px #00000055;
  backdrop-filter: blur(6px) saturate(140%);
}
.polka .orb{ position:absolute; inset:0; margin:auto; width:var(--size); height:var(--size); transform-origin:center; }
.polka .radius{ transform-origin:left center; }
.polka .bob{ will-change: transform; animation: bob 1.8s ease-in-out infinite alternate; }
@keyframes bob{ from{ transform: translateY(-2px) } to{ transform: translateY(2px) } }

/* Glass/gel dot */
.polka .dot{ width:var(--dot-size,6px); height:var(--dot-size,6px); border-radius:999px; display:block; pointer-events:none;
  background: radial-gradient(circle at 50% 50%,
    hsla(var(--dot-hue, var(--base-hue,220)), var(--dot-sat,90%), calc(var(--dot-light,60%) + 12%), calc(var(--dot-alpha,.8)*.95)) 0%,
    hsla(var(--dot-hue, var(--base-hue,220)), var(--dot-sat,90%), var(--dot-light,60%),       calc(var(--dot-alpha,.8)*.9)) 45%,
    hsla(var(--dot-hue, var(--base-hue,220)), var(--dot-sat,90%), calc(var(--dot-light,60%) - 8%),  calc(var(--dot-alpha,.8)*.85)) 70%,
    hsla(var(--dot-hue, var(--base-hue,220)), var(--dot-sat,90%), calc(var(--dot-light,60%) - 20%), calc(var(--dot-alpha,.8)*.78)) 100%);
  box-shadow: inset 0 0 8px hsla(var(--dot-hue, var(--base-hue,220)), 40%, 85%, .18),
              0 0 18px hsla(var(--dot-hue, var(--base-hue,220)), 90%, 60%, .45);
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
  const { dots, rings, minRadius, maxRadius, mode, baseHue, spread, sat, light, alpha } = opts;
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
    const speed = rand(3.0, 10.0); // s/rot
    const bobAmp = rand(0.8, 3.0);
    const tilt = rand(-8, 8);
    const hue = mode === 'spectrum' ? rand(0, 360) : (baseHue + rand(-spread, spread) + 360) % 360;
    const s = clamp(sat + rand(-5, 5), 0, 100);
    const l = clamp(light + rand(-6, 6), 20, 80);
    const a = clamp(alpha + rand(-0.06, 0.06), 0.35, 1);
    return { r, start, dir, speed, bobAmp, tilt, hue, s, l, a, phase: rand(0, 1.4) };
  });
  return { dots: arr, ringCount };
}

function stateParams(state, baseHue) {
  switch (state) {
    case 'typing':    return { spinMult: 1.6, hueShift: 50, base: 18  };   // rød/orange rask
    case 'listening': return { spinMult: 0.7, hueShift: -60, base: 130 };  // grønn tregere
    default:          return { spinMult: 1.0, hueShift: 0, base: baseHue };
  }
}

/** Oppretter avatar i container og returnerer et API */
export function createPolkadotAvatar(container, options = {}) {
  injectPolkadotStyles();

  const opts = {
    // visuals
    size: 64, dots: 42, rings: 3, minRadius: 0, maxRadius: 26, dotSize: 6,
    variant: 'free', // 'free' | 'sphere'
    // color
    mode: 'spread', baseHue: 220, spread: 36, sat: 88, light: 58, alpha: 0.78,
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
  container.innerHTML = '';
  container.appendChild(api.root);

  rebuild(api);
  attachInteractions(api);

  return api;
}

function rebuild(api) {
  const { root, opts } = api;
  const sp = stateParams(opts.state, opts.baseHue);
  api.data = buildConfig(opts);

  root.style.setProperty('--size', `${opts.size}px`);
  root.style.setProperty('--dot-size', `${opts.dotSize}px`);

  root.classList.remove('free', 'sphere');
  root.classList.add(opts.variant);

  root.innerHTML = '';
  api.list = api.data.dots.map((d) => {
    const orb = document.createElement('div');
    orb.className = 'orb';
    const speed = d.speed / (sp.spinMult || 1);

    orb.style.setProperty('--r', `${d.r}px`);
    orb.style.setProperty('--start', `${d.start}deg`);
    orb.style.setProperty('--dir', String(d.dir));
    orb.style.setProperty('--speed', `${speed}s`);
    orb.style.setProperty('--bob', `${d.bobAmp}px`);
    orb.style.setProperty('--bob-speed', `${(1.6 * rand(0.85, 1.25)).toFixed(2)}s`);
    orb.style.setProperty('--tilt', `${d.tilt}deg`);

    const radiusEl = document.createElement('div');
    radiusEl.className = 'radius';

    const bobEl = document.createElement('div');
    bobEl.className = 'bob';
    bobEl.style.animationDelay = `${d.phase.toFixed(2)}s`;

    const dot = document.createElement('span');
    dot.className = 'dot';
    dot.style.setProperty('--dot-hue', `${(d.hue + sp.hueShift + 360) % 360}`);
    dot.style.setProperty('--dot-sat', `${d.s}%`);
    dot.style.setProperty('--dot-light', `${d.l}%`);
    dot.style.setProperty('--dot-alpha', `${d.a}`);

    bobEl.appendChild(dot);
    radiusEl.appendChild(bobEl);
    orb.appendChild(radiusEl);
    root.appendChild(orb);

    return { orb, dot, r: d.r, dir: d.dir, speed, angle: d.start * (Math.PI / 180), vx: 0, vy: 0 };
  });

  startLoop(api);
}

function startLoop(api) {
  stopLoop(api);
  if (api.opts.variant !== 'sphere' || !api.opts.physics) return;

  const R = api.opts.size * 0.5 - api.opts.dotSize * 0.75;
  const center = { x: api.opts.size / 2, y: api.opts.size / 2 };
  let last = performance.now();

  const step = (t) => {
    const dt = Math.min(0.04, (t - last) / 1000);
    last = t;

    const sp = stateParams(api.opts.state, api.opts.baseHue);
    const { x: mx, y: my, inside } = api.mouse;

    for (const item of api.list) {
      // base orbital drift
      const spin = (item.dir * 0.8 * sp.spinMult) * dt;
      item.angle += spin * (1.0 / Math.max(0.5, item.speed));

      let x = center.x + Math.cos(item.angle) * item.r;
      let y = center.y + Math.sin(item.angle) * item.r;

      // physics
      let ax = 0, ay = 0;
      if (api.opts.gravity !== 'none') {
        const g = 12;
        ay += api.opts.gravity === 'down' ? g : -g;
      }
      if (inside) {
        const dx = mx - x, dy = my - y;
        const dist = Math.hypot(dx, dy) || 1;
        const influence = dist < R ? (1 - dist / R) : 0;
        const pull = 40 * influence;
        ax += (dx / dist) * pull;
        ay += (dy / dist) * pull;
      }

      item.vx = (item.vx + ax * dt) * 0.9;
      item.vy = (item.vy + ay * dt) * 0.9;
      x += item.vx * dt;
      y += item.vy * dt;

      // constrain to circle
      const dx = x - center.x, dy = y - center.y;
      const d = Math.hypot(dx, dy);
      if (d > R) {
        const nx = dx / d, ny = dy / d;
        x = center.x + nx * R;
        y = center.y + ny * R;
        const dotv = item.vx * nx + item.vy * ny;
        item.vx -= 1.8 * dotv * nx;
        item.vy -= 1.8 * dotv * ny;
      }

      item.r = Math.hypot(x - center.x, y - center.y);
      item.angle = Math.atan2(y - center.y, x - center.x);

      item.orb.style.transform = `translate(0,0) rotate(${item.angle}rad)`;
      item.orb.querySelector('.radius').style.transform = `translateX(${item.r}px)`;
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
    api.list.forEach((d) => {
      const cx = rect.width / 2, cy = rect.height / 2;
      const dx = (cx) - px;
      const dy = (cy) - py;
      const dist = Math.hypot(dx, dy) || 1;
      const force = 220 / dist;
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
  rebuild(this);
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
