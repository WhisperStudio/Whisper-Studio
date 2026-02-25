import { useEffect, useRef, useState, useMemo } from 'react';

const GlassOrbAvatar = ({
  sender,
  isTyping,
  maintenance = false,
  style,
  className,
  size = 40,
  skin = 'default', // 'default' | 'juleskin'
}) => {
  const [isHovered, setIsHovered] = useState(false); // only for React if you need it elsewhere
  const mouseRef = useRef({ x: null, y: null });
  const hoveredRef = useRef(false);
  const colorStateRef = useRef('idle');
  const skinRef = useRef(skin);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const animationRef = useRef(null);

  const [colorState, setColorState] = useState('idle'); // 'idle' | 'typing' | 'listening' | 'maintenance'

  const colorPalettes = useMemo(
    () => ({
      idle: [
  { r: 0, g: 255, b: 255 },
  { r: 0, g: 240, b: 190 },
  { r: 50, g: 255, b: 255 },
  { r: 0, g: 200, b: 255 },
  { r: 0, g: 255, b: 180 },
  { r: 100, g: 255, b: 255 },
],
      maintenance: [
        { r: 255, g: 193, b: 7 },
        { r: 245, g: 158, b: 11 },
        { r: 255, g: 140, b: 0 },
        { r: 96, g: 165, b: 250 },
        { r: 59, g: 130, b: 246 },
        { r: 129, g: 140, b: 248 },
      ],
      typing: [
        { r: 50, g: 220, b: 50 },
        { r: 70, g: 240, b: 70 },
        { r: 100, g: 255, b: 100 },
      ],
      listening: [
        { r: 255, g: 50, b: 50 },
        { r: 255, g: 80, b: 80 },
        { r: 255, g: 120, b: 120 },
      ],
    }),
    []
  );

  useEffect(() => {
    if (maintenance) {
      setColorState('maintenance');
      return;
    }
    if (isTyping) setColorState(sender === 'user' ? 'typing' : 'listening');
    else setColorState('idle');
  }, [isTyping, sender, maintenance]);

  useEffect(() => {
    colorStateRef.current = colorState;
  }, [colorState]);

  useEffect(() => {
    skinRef.current = skin;
  }, [skin]);

  useEffect(() => {
    if (!containerRef.current || !canvasRef.current) return;

    const container = containerRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: true });

    let sizePx = 0;
    let dpr = 1;

    let centerX = 0;
    let centerY = 0;

    let orbRadius = 0;

    // outer casing
    let casingOuter = 0;
    let casingInner = 0;

    // particle ring (donut)
    let ringOuter = 0;
    let ringInner = 0;

    // center disk
    let centerRadius = 0;

    const portal = {
      rimStroke: 'rgba(175, 185, 200, 0.70)',
      rimGlow: 'rgba(110, 130, 155, 0.35)',
      casing1: 'rgba(10, 12, 18, 1)',
      casing2: 'rgba(18, 22, 32, 1)',
      deep1: 'rgba(6, 8, 14, 1)',
      deep2: 'rgba(10, 13, 22, 1)',
      deep3: 'rgba(14, 20, 40, 1)',
    };

    const clampDpr = () => Math.min(window.devicePixelRatio || 1, 1.35);

    const updateDimensions = () => {
      sizePx = Math.min(container.offsetWidth, container.offsetHeight);
      dpr = clampDpr();

      canvas.width = Math.floor(sizePx * dpr);
      canvas.height = Math.floor(sizePx * dpr);
      canvas.style.width = `${sizePx}px`;
      canvas.style.height = `${sizePx}px`;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      centerX = sizePx / 2;
      centerY = sizePx / 2;

      orbRadius = sizePx / 2;

      casingOuter = orbRadius * 0.995;
      casingInner = orbRadius * 0.90;

      ringOuter = orbRadius * 0.95;
      ringInner = orbRadius * 0.50;

      centerRadius = ringInner * 0.985;
    };

    updateDimensions();

    // -----------------------------
    // Color blending (green ring)
    // -----------------------------
    let colorIndex = 0;
    let colorProgress = 0;

    let currentPalette = colorPalettes[colorStateRef.current].map((c) => ({ ...c }));
    let targetPalette = colorPalettes[colorStateRef.current].map((c) => ({ ...c }));
    let paletteT = 1;

    const getRingColorRGB = (offset = 0) => {
      const cols = currentPalette.map((cur, i) => {
        const tgt = targetPalette[i] || targetPalette[targetPalette.length - 1];
        return {
          r: Math.floor(cur.r + (tgt.r - cur.r) * paletteT),
          g: Math.floor(cur.g + (tgt.g - cur.g) * paletteT),
          b: Math.floor(cur.b + (tgt.b - cur.b) * paletteT),
        };
      });

      const base = (colorIndex + offset) % cols.length;
      const a = cols[base];
      const b = cols[(base + 1) % cols.length];

      return {
        r: Math.floor(a.r + (b.r - a.r) * colorProgress),
        g: Math.floor(a.g + (b.g - a.g) * colorProgress),
        b: Math.floor(a.b + (b.b - a.b) * colorProgress),
      };
    };

    const rgba = (c, a) => `rgba(${c.r}, ${c.g}, ${c.b}, ${a})`;
    const mix = (a, b, t) => a + (b - a) * t;
    const mixRGB = (a, b, t) => ({
      r: Math.round(mix(a.r, b.r, t)),
      g: Math.round(mix(a.g, b.g, t)),
      b: Math.round(mix(a.b, b.b, t)),
    });

    // -----------------------------
    // Rune shape (Thurisaz)
    // -----------------------------
    const sampleLine = (ax, ay, bx, by, steps) => {
      const pts = [];
      for (let i = 0; i <= steps; i++) {
        const t = i / steps;
        pts.push({ x: ax + (bx - ax) * t, y: ay + (by - ay) * t });
      }
      return pts;
    };

    // -----------------------------
// -----------------------------
// Rune shape (ᚨ / Ansuz) - SOLID (no gaps)
// stem + two right-leaning arms, with stroke-fill thickness
// -----------------------------
const buildAnsuzPoints = () => {
  const pts = [];

  // helper: add thickness by stamping offsets around each sampled point
  const addStroke = (linePts, dxs, dys) => {
    const out = [];
    for (const p of linePts) {
      for (const dx of dxs) for (const dy of dys) out.push({ x: p.x + dx, y: p.y + dy });
    }
    return out;
  };

  // left stem
  const xStem = -0.35;
  const stem = sampleLine(xStem, -0.85, xStem, 0.85, 140);

  // arms (two diagonals to the right)
  const topArm = sampleLine(xStem, -0.35, 0.55, -0.60, 110);
  const midArm = sampleLine(xStem, 0.05, 0.45, -0.12, 95);

  // stroke thickness (tune these for fill vs perf)
  // (more offsets = more filled = fewer gaps)
  const stemDX = [-0.08, -0.05, -0.025, 0, 0.025, 0.05, 0.08];
  const stemDY = [-0.03, 0, 0.03];

  const armDX = [-0.05, -0.025, 0, 0.025, 0.05];
  const armDY = [-0.03, 0, 0.03];

  pts.push(
    ...addStroke(stem, stemDX, stemDY),
    ...addStroke(topArm, armDX, armDY),
    ...addStroke(midArm, armDX, armDY)
  );

  return pts;
};

// swap rune points source:
const runeNorm = buildAnsuzPoints();

    const runeTargets = () => {
      const radius = centerRadius * 0.78;
      return runeNorm.map((p) => ({
        tx: centerX + p.x * radius,
        ty: centerY + p.y * radius,
      }));
    };

    // -----------------------------
    // Ring particles (green)
    // -----------------------------
    let ringParticles = [];

    const initRingParticles = () => {
      const base = 520;
      const count = Math.max(240, Math.min(820, Math.floor(base * (sizePx / 420))));
      ringParticles = new Array(count).fill(0).map(() => new RingParticle());
    };

    class RingParticle {
      constructor() {
        this.radius = ringInner + Math.random() * (ringOuter - ringInner);
        this.angle = Math.random() * Math.PI * 2;
        this.speed = (Math.random() * 0.010 + 0.004) * (Math.random() < 0.5 ? 1 : -1);
        this.size = (Math.random() * 2.6 + 2.0) * (sizePx / 500);
        this.colorOffset = (Math.random() * 9999) | 0;
      }
      update(speedMul) {
        this.angle += this.speed * speedMul;
      }
      draw(speedMul, hovered) {
        const x = centerX + Math.cos(this.angle) * this.radius;
        const y = centerY + Math.sin(this.angle) * this.radius;

        let baseA = 0.26;
        let glowA = 0.12;

        if (hovered) {
          baseA *= 1.06;
          glowA *= 1.25;
        }

        const rgb = getRingColorRGB(this.colorOffset);
        const fill = rgba(rgb, baseA);
        const glow = rgba(rgb, glowA);

        ctx.shadowBlur = (14 + 6 * speedMul) * (sizePx / 500);
        ctx.shadowColor = glow;

        ctx.fillStyle = fill;
        ctx.beginPath();
        ctx.arc(x, y, this.size, 0, Math.PI * 2);
        ctx.fill();

        ctx.globalAlpha = 0.12;
        ctx.shadowBlur = 24 * (sizePx / 500);
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, this.size + 2.0 * (sizePx / 500), 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    }

    // -----------------------------
    // Gold dots (no respawn)
    // -----------------------------
    let goldDots = [];
    let goldBlend = 0;
    let goldTargets = runeTargets();
    const shuffleInPlace = (arr) => {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = (Math.random() * (i + 1)) | 0;
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
};
    const initGoldDots = () => {
  const base = 400;
  const count = Math.max(260, Math.min(900, Math.floor(base * (sizePx / 420))));

  goldTargets = runeTargets();

  // spread indices across the WHOLE rune, then shuffle so it doesn't look striped
  const idx = Array.from({ length: count }, (_, i) =>
    Math.floor((i / (count - 1)) * (goldTargets.length - 1))
  );
  shuffleInPlace(idx);

  goldDots = new Array(count).fill(0).map((_, i) => {
    const a = Math.random() * Math.PI * 2;
    const rr = ringInner + Math.random() * (ringOuter - ringInner);

    return {
      x: centerX + Math.cos(a) * rr,
      y: centerY + Math.sin(a) * rr,
      vx: 0,
      vy: 0,

      ringAngle: a,
      ringRadius: rr,
      ringSpeed: (Math.random() * 0.010 + 0.004) * (Math.random() < 0.5 ? 1 : -1),

      // IMPORTANT: now covers full rune (including arms)
      runeIndex: idx[i],
    };
  });
};

    const updateGoldTargetsOnResize = () => {
      goldTargets = runeTargets();
      for (const d of goldDots) {
    d.runeIndex = Math.min(d.runeIndex, goldTargets.length - 1);
  }
    };

    const updateGoldDots = (speedMul, hovered) => {
      if (!goldDots.length) return;

      const mx = mouseRef.current.x;
      const my = mouseRef.current.y;

      const targetBlend = hovered ? 1 : 0;
      goldBlend += (targetBlend - goldBlend) * 0.12;

      const spring = mix(0.12, 0.18, goldBlend);
      const damp = 0.82;

      for (const d of goldDots) {
        d.ringAngle += d.ringSpeed * speedMul;

        const ringTx = centerX + Math.cos(d.ringAngle) * d.ringRadius;
        const ringTy = centerY + Math.sin(d.ringAngle) * d.ringRadius;

        const t = goldTargets[d.runeIndex] || goldTargets[0];
        const runeTx = t.tx;
        const runeTy = t.ty;

        const tx = mix(ringTx, runeTx, goldBlend);
        const ty = mix(ringTy, runeTy, goldBlend);

        if (hovered && mx !== null && my !== null && goldBlend > 0.15) {
          const dx = d.x - mx;
          const dy = d.y - my;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const repelR = centerRadius * 0.26;

          if (dist < repelR && dist > 0.0001) {
            const push = (1 - dist / repelR) * (1.9 * goldBlend);
            d.vx += (dx / dist) * push;
            d.vy += (dy / dist) * push;
          }
        }

        d.vx += (tx - d.x) * spring;
        d.vy += (ty - d.y) * spring;

        d.vx *= damp;
        d.vy *= damp;

        d.x += d.vx;
        d.y += d.vy;
      }
    };

    const drawGoldDots = () => {
      if (!goldDots.length) return;

      ctx.shadowBlur = 0;
      ctx.shadowColor = 'transparent';

      const goldRGB = { r: 255, g: 196, b: 70 };
      const dotR = mix(3.0, 5.2, goldBlend) * (sizePx / 500);

      for (const d of goldDots) {
        const ringRGB = getRingColorRGB(d.runeIndex * 13);
        const rgb = mixRGB(ringRGB, goldRGB, goldBlend);

        const alpha = mix(0.0, 1.0, goldBlend);
        ctx.fillStyle = rgba(rgb, alpha);

        ctx.beginPath();
        ctx.arc(d.x, d.y, dotR, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    // -----------------------------
    // Portal background
    // -----------------------------
    const drawPortalBase = () => {
      const g = ctx.createRadialGradient(centerX, centerY, orbRadius * 0.08, centerX, centerY, orbRadius);
      g.addColorStop(0, portal.deep2);
      g.addColorStop(0.55, portal.deep3);
      g.addColorStop(1, portal.deep1);

      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.arc(centerX, centerY, casingOuter, 0, Math.PI * 2);
      ctx.fill();

      ctx.save();
      const cg = ctx.createRadialGradient(centerX, centerY, casingInner, centerX, centerY, casingOuter);
      cg.addColorStop(0, portal.casing2);
      cg.addColorStop(1, portal.casing1);

      ctx.fillStyle = cg;
      ctx.beginPath();
      ctx.arc(centerX, centerY, casingOuter, 0, Math.PI * 2);
      ctx.arc(centerX, centerY, casingInner, 0, Math.PI * 2, true);
      ctx.fill('evenodd');
      ctx.restore();

      ctx.save();
      const dg = ctx.createRadialGradient(centerX, centerY, centerRadius * 0.05, centerX, centerY, centerRadius);
      dg.addColorStop(0, portal.deep3);
      dg.addColorStop(0.65, portal.deep2);
      dg.addColorStop(1, portal.deep1);

      ctx.fillStyle = dg;
      ctx.beginPath();
      ctx.arc(centerX, centerY, centerRadius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      ctx.save();
      ctx.shadowBlur = 18 * (sizePx / 500);
      ctx.shadowColor = portal.rimGlow;
      ctx.strokeStyle = portal.rimStroke;
      ctx.lineWidth = Math.max(2, sizePx / 140);
      ctx.beginPath();
      ctx.arc(centerX, centerY, casingOuter - ctx.lineWidth * 0.5, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    };

    // clip helpers
    const clipRing = () => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, ringOuter, 0, Math.PI * 2);
      ctx.arc(centerX, centerY, ringInner, 0, Math.PI * 2, true);
      ctx.clip('evenodd');
    };
    const clipOrb = () => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(centerX, centerY, casingOuter, 0, Math.PI * 2);
      ctx.clip();
    };
    const unclip = () => ctx.restore();

    // -----------------------------
    // Optional snow (juleskin)
    // -----------------------------
    let snowflakes = [];
    const initSnowflakes = () => {
      const count = Math.max(34, Math.min(110, Math.floor(64 * (sizePx / 260))));
      snowflakes = new Array(count).fill(0).map(() => ({
        x: Math.random() * sizePx,
        y: Math.random() * sizePx,
        r: (Math.random() * 1.2 + 0.4) * (sizePx / 220),
        s: (Math.random() * 0.33 + 0.16) * (sizePx / 240),
      }));
    };
    const drawSnow = () => {
      ctx.save();
      ctx.fillStyle = 'rgba(255,255,255,0.72)';
      for (const f of snowflakes) {
        f.y += f.s;
        if (f.y > sizePx + 6) {
          f.y = -10;
          f.x = Math.random() * sizePx;
        }
        ctx.beginPath();
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    };

    
    // -----------------------------
    // Init once
    // -----------------------------
    initRingParticles();
    initGoldDots();
    if (skinRef.current === 'juleskin') initSnowflakes();

    const ro = new ResizeObserver(() => {
      updateDimensions();
      updateGoldTargetsOnResize();
    });
    ro.observe(container);

    // -----------------------------
    // Animation loop (NO React state inside)
    // -----------------------------
    const animate = () => {
      // palette timing
      colorProgress += 0.0032;
      if (colorProgress >= 1) {
        colorProgress = 0;
        colorIndex = (colorIndex + 1) % Math.max(1, targetPalette.length);
      }

      // palette transition (using ref)
      const nextPalette = colorPalettes[colorStateRef.current];
      if (currentPalette[0]?.r !== nextPalette[0]?.r) {
        targetPalette = nextPalette.map((c) => ({ ...c }));
        paletteT = 0;
      }
      if (paletteT < 1) paletteT = Math.min(1, paletteT + 0.03);

      currentPalette = currentPalette.map((cur, i) => {
        const tgt = targetPalette[i] || targetPalette[targetPalette.length - 1];
        return {
          r: Math.floor(cur.r + (tgt.r - cur.r) * 0.10),
          g: Math.floor(cur.g + (tgt.g - cur.g) * 0.10),
          b: Math.floor(cur.b + (tgt.b - cur.b) * 0.10),
        };
      });

      const hovered = hoveredRef.current;
      const speedMul = hovered ? 3.0 : 1.0;

      ctx.clearRect(0, 0, sizePx, sizePx);

      drawPortalBase();

      clipRing();
      if (skinRef.current === 'juleskin') drawSnow();
      for (const p of ringParticles) {
        p.update(speedMul);
        p.draw(speedMul, hovered);
      }
      unclip();

      clipOrb();
      updateGoldDots(speedMul, hovered);
      drawGoldDots();
      unclip();

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      ro.disconnect();
    };
  }, [colorPalettes]);

  const portalBackground =
    'radial-gradient(circle at 50% 50%, ' +
    'rgba(0,0,0,0) 0%, ' +
    'rgba(30,255,190,0.10) 35%, ' +
    'rgba(30,255,190,0.05) 60%, ' +
    'rgba(0,0,0,0) 100%)';

  const portalBoxShadow =
    skin === 'juleskin'
      ? '0 0 70px rgba(255,80,80,0.22), 0 0 140px rgba(255,40,40,0.14)'
      : '0 0 70px rgba(30,255,190,0.18), 0 0 140px rgba(30,255,190,0.12)';

  return (
    <div
      ref={containerRef}
      className={className}
      onPointerEnter={() => {
        setIsHovered(true);
        hoveredRef.current = true;
      }}
      onPointerLeave={() => {
        setIsHovered(false);
        hoveredRef.current = false;
        mouseRef.current.x = null;
        mouseRef.current.y = null;
      }}
      onPointerMove={(e) => {
        if (!containerRef.current) return;
        const rect = containerRef.current.getBoundingClientRect();
        mouseRef.current.x = e.clientX - rect.left;
        mouseRef.current.y = e.clientY - rect.top;
      }}
      style={{
        position: 'absolute',
        background: 'none',
        width: style?.width || `${size}px`,
        height: style?.height || `${size}px`,
        cursor: 'pointer',
        ...style,
      }}
    >
      <div
        style={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          background: portalBackground,
          boxShadow: portalBoxShadow,
          pointerEvents: 'none',
        }}
      />
      <canvas
        ref={canvasRef}
        style={{
          position: 'absolute',
          background: 'none',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
        }}
      />
    </div>
  );
};

export default GlassOrbAvatar;