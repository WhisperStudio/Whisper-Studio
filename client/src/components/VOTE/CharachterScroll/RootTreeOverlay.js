import React, { useEffect, useRef, forwardRef } from "react";
import h73ts01 from './zZqar01.svg';
import './ShowRoom.css';

const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
const lerp = (a, b, t) => a + (b - a) * t;
const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);
const easeInCubic = (t) => t * t * t;
const easeOutBack = (t) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

// Leaf anchor points on the tree (normalized 0-1 within tree bounding box)
const LEAF_POINTS = [
  { x: 0.18, y: 0.26 },
  { x: 0.26, y: 0.18 },
  { x: 0.36, y: 0.13 },
  { x: 0.49, y: 0.11 },
  { x: 0.62, y: 0.14 },
  { x: 0.74, y: 0.20 },
  { x: 0.82, y: 0.28 },
  { x: 0.84, y: 0.38 },
  { x: 0.75, y: 0.44 },
  { x: 0.63, y: 0.40 },
  { x: 0.54, y: 0.33 },
  { x: 0.45, y: 0.31 },
  { x: 0.35, y: 0.34 },
  { x: 0.26, y: 0.40 },
  { x: 0.20, y: 0.47 },
  { x: 0.30, y: 0.28 },
  { x: 0.41, y: 0.20 },
  { x: 0.56, y: 0.20 },
  { x: 0.68, y: 0.26 },
  { x: 0.72, y: 0.37 },
];

// Spiral orbit path around tree — particles travel these and then converge at trunk base
const ORBIT_PATH_POINTS = [
  { x: 0.50, y: 0.30 },
  { x: 0.70, y: 0.25 },
  { x: 0.85, y: 0.40 },
  { x: 0.80, y: 0.58 },
  { x: 0.65, y: 0.68 },
  { x: 0.50, y: 0.72 },
  { x: 0.35, y: 0.68 },
  { x: 0.20, y: 0.58 },
  { x: 0.15, y: 0.40 },
  { x: 0.28, y: 0.26 },
  { x: 0.50, y: 0.20 },
];

function pointInRect(rect, px, py) {
  return {
    x: rect.left + rect.width * px,
    y: rect.top + rect.height * py,
  };
}

// Sample a closed loop path — t goes 0..1 for full loop
function sampleOrbitPath(rect, t) {
  const pts = ORBIT_PATH_POINTS;
  const n = pts.length;
  const scaled = ((t % 1) + 1) % 1 * n;
  const i = Math.floor(scaled);
  const lt = scaled - i;
  const p1 = pointInRect(rect, pts[i % n].x, pts[i % n].y);
  const p2 = pointInRect(rect, pts[(i + 1) % n].x, pts[(i + 1) % n].y);
  return { x: lerp(p1.x, p2.x, lt), y: lerp(p1.y, p2.y, lt) };
}

// Cubic bezier for smooth interpolation
function cubicBezier(p0, p1, p2, p3, t) {
  const mt = 1 - t;
  return {
    x: mt * mt * mt * p0.x + 3 * mt * mt * t * p1.x + 3 * mt * t * t * p2.x + t * t * t * p3.x,
    y: mt * mt * mt * p0.y + 3 * mt * mt * t * p1.y + 3 * mt * t * t * p2.y + t * t * t * p3.y,
  };
}

const RootTreeOverlay = forwardRef(function RootTreeOverlay({ opacity = 1 }, ref) {
  const canvasRef = useRef(null);
  const orbRef = useRef(null);
  const sectionProgressRef = useRef(0);

  // 28 particles, each tied to a leaf point
  const particles = React.useMemo(() => {
    return Array.from({ length: 28 }, (_, i) => ({
      id: i,
      leaf: i % LEAF_POINTS.length,
      // stagger so they don't all move at once
      stagger: (i / 28) * 0.18,
      // orbit offset so they spread around the tree
      orbitOffset: (i / 28),
      // speed multiplier for orbit loop (slight variation)
      orbitSpeed: 0.8 + (i % 5) * 0.08,
      size: 2.2 + (i % 4) * 0.6,
      // which direction they wobble
      wobble: (i % 7) * 0.9,
    }));
  }, []);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const treeEl = ref?.current;
    const orb = orbRef.current;
    if (!canvas || !treeEl || !orb) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rafId = null;
    let time = 0;

    const setCanvasSize = () => {
      const dpr = window.devicePixelRatio || 1;
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = `${window.innerWidth}px`;
      canvas.style.height = `${window.innerHeight}px`;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    // Liquid metaball-style glow dot
    const drawGlowDot = (x, y, r, alpha, colorShift = 0) => {
      const outerR = r * 6;
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, outerR);
      const h = 38 + colorShift * 8;
      gradient.addColorStop(0, `hsla(${h + 5}, 100%, 88%, ${0.98 * alpha})`);
      gradient.addColorStop(0.15, `hsla(${h}, 90%, 70%, ${0.9 * alpha})`);
      gradient.addColorStop(0.4, `hsla(${h - 10}, 80%, 50%, ${0.45 * alpha})`);
      gradient.addColorStop(1, `hsla(${h - 20}, 70%, 30%, 0)`);

      ctx.beginPath();
      ctx.fillStyle = gradient;
      ctx.arc(x, y, outerR, 0, Math.PI * 2);
      ctx.fill();

      // Bright core
      ctx.beginPath();
      ctx.fillStyle = `hsla(50, 100%, 92%, ${alpha})`;
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    };

    // Draw liquid merge blob at center — metaball illusion using layered glows
    const drawMergeBlob = (cx, cy, radius, alpha, liquidT) => {
      // Outer glow ring
      const ringG = ctx.createRadialGradient(cx, cy, radius * 0.3, cx, cy, radius * 2.5);
      ringG.addColorStop(0, `rgba(255, 220, 100, ${0.6 * alpha})`);
      ringG.addColorStop(0.5, `rgba(220, 130, 20, ${0.3 * alpha})`);
      ringG.addColorStop(1, `rgba(180, 80, 10, 0)`);
      ctx.beginPath();
      ctx.fillStyle = ringG;
      ctx.arc(cx, cy, radius * 2.5, 0, Math.PI * 2);
      ctx.fill();

      // Liquid blob shape using bezier curves — organic squish
      const squish = Math.sin(liquidT * Math.PI * 2) * 0.18 + 1;
      const stretch = 1 / squish;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.scale(squish, stretch);
      
      const blobG = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
      blobG.addColorStop(0, `rgba(255, 238, 160, ${alpha})`);
      blobG.addColorStop(0.4, `rgba(255, 200, 60, ${0.95 * alpha})`);
      blobG.addColorStop(0.75, `rgba(220, 120, 20, ${0.8 * alpha})`);
      blobG.addColorStop(1, `rgba(160, 60, 10, 0)`);

      ctx.beginPath();
      // Organic blob path — perturbed circle
      const pts = 8;
      for (let i = 0; i <= pts; i++) {
        const angle = (i / pts) * Math.PI * 2;
        const wobbleAmt = 1 + 0.12 * Math.sin(liquidT * 6 + angle * 3);
        const r = radius * wobbleAmt;
        const px = Math.cos(angle) * r;
        const py = Math.sin(angle) * r;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fillStyle = blobG;
      ctx.fill();
      ctx.restore();

      // Surface highlight
      const hlX = cx - radius * 0.25;
      const hlY = cy - radius * 0.3;
      const hlG = ctx.createRadialGradient(hlX, hlY, 0, hlX, hlY, radius * 0.45);
      hlG.addColorStop(0, `rgba(255, 248, 200, ${0.55 * alpha})`);
      hlG.addColorStop(1, `rgba(255, 220, 120, 0)`);
      ctx.beginPath();
      ctx.fillStyle = hlG;
      ctx.arc(hlX, hlY, radius * 0.45, 0, Math.PI * 2);
      ctx.fill();
    };

    // Draw a droplet "stretching" toward target — liquid drip effect
    const drawLiquidStretch = (fromX, fromY, toX, toY, t, r, alpha) => {
      if (t < 0.05) return;
      const dx = toX - fromX;
      const dy = toY - fromY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 2) return;

      const nx = dx / dist;
      const ny = dy / dist;

      // Stretched ellipse from "from" toward "to" — liquid tendril
      const stretchLen = dist * t * 0.5;
      const midX = lerp(fromX, toX, t * 0.5);
      const midY = lerp(fromY, toY, t * 0.5);

      ctx.save();
      ctx.translate(midX, midY);
      ctx.rotate(Math.atan2(dy, dx));
      
      const necking = 1 - t * 0.7; // gets thinner as it stretches
      const tendrG = ctx.createRadialGradient(0, 0, 0, 0, 0, Math.max(stretchLen, 1));
      tendrG.addColorStop(0, `rgba(255, 210, 80, ${0.35 * alpha * (1 - t)})`);
      tendrG.addColorStop(1, `rgba(255, 160, 30, 0)`);

      ctx.scale(1, necking * r / Math.max(stretchLen * 0.15, 1));
      ctx.beginPath();
      ctx.ellipse(0, 0, stretchLen, r * necking * 2, 0, 0, Math.PI * 2);
      ctx.fillStyle = tendrG;
      ctx.fill();
      ctx.restore();
    };

    const getTreeRect = () => treeEl.getBoundingClientRect();

    const draw = () => {
      time += 0.016;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      const p = sectionProgressRef.current;
      const rect = getTreeRect();
      const trunkBase = pointInRect(rect, 0.50, 0.79); // where particles merge

      // The final merged orb follows the viewport center after full merge
      const viewCenterX = window.innerWidth / 2;
      const viewCenterY = window.innerHeight * 0.55;

      // Hide CSS orb (we draw everything on canvas)
      orb.style.opacity = "0";

      // ---- Phase breakdown (p = 0..1) ----
      // 0.00 - 0.20: particles appear at leaf points (fade in)
      // 0.20 - 0.65: particles travel orbit paths around tree
      // 0.65 - 0.85: particles converge to trunk base — liquid droplet merge
      // 0.85 - 1.00: final merged orb scales up and floats to viewport center

      particles.forEach((particle) => {
        const leaf = pointInRect(rect, LEAF_POINTS[particle.leaf].x, LEAF_POINTS[particle.leaf].y);
        
        // Each particle has a small stagger
        const ps = clamp(p - particle.stagger * 0.3, 0, 1);

        let x = leaf.x;
        let y = leaf.y;
        let alpha = 0;
        let r = particle.size;

        if (ps <= 0) return;

        if (ps < 0.20) {
          // Phase 1: Appear at leaf — pulse gently
          const t = ps / 0.20;
          alpha = easeOutCubic(t) * 0.8;
          r = particle.size * lerp(0.3, 1.0, easeOutBack(t));
          x = leaf.x;
          y = leaf.y;
          // Gentle pulse glow at leaf
          drawGlowDot(x, y, r, alpha, particle.leaf * 0.5);
          return;

        } else if (ps < 0.65) {
          // Phase 2: Orbit around tree
          const orbitT = (ps - 0.20) / 0.45;
          
          // How far into orbit (0 = at leaf, 1 = full orbit)
          const enterT = clamp(orbitT / 0.2, 0, 1);
          
          // Orbit position: goes around the tree
          const loop = orbitT * particle.orbitSpeed + particle.orbitOffset;
          const orbitPos = sampleOrbitPath(rect, loop);
          
          // Blend from leaf to orbit path
          x = lerp(leaf.x, orbitPos.x, easeInOutCubic(enterT));
          y = lerp(leaf.y, orbitPos.y, easeInOutCubic(enterT));
          
          alpha = 0.75 + Math.sin(time * 2 + particle.wobble) * 0.15;
          r = particle.size * (1 + Math.sin(time * 3 + particle.id) * 0.2);

          // Draw connecting thread back to leaf while close
          if (enterT < 0.5) {
            ctx.beginPath();
            ctx.strokeStyle = `rgba(255, 160, 40, ${0.12 * (1 - enterT * 2)})`;
            ctx.lineWidth = 0.8;
            ctx.moveTo(leaf.x, leaf.y);
            ctx.lineTo(x, y);
            ctx.stroke();
          }

          drawGlowDot(x, y, r, alpha, particle.id % 5);
          return;

        } else if (ps < 0.85) {
          // Phase 3: Converge to trunk base — liquid stretching
          const convergeT = (ps - 0.65) / 0.20;
          
          // Last orbit position
          const loop = 0.45 * particle.orbitSpeed + particle.orbitOffset;
          const lastOrbitPos = sampleOrbitPath(rect, loop);

          const pull = easeInCubic(convergeT);
          x = lerp(lastOrbitPos.x, trunkBase.x, pull);
          y = lerp(lastOrbitPos.y, trunkBase.y, pull);

          alpha = lerp(0.85, 0.0, convergeT * convergeT);
          r = lerp(particle.size, particle.size * 1.8, convergeT);

          // Liquid stretch visual
          if (convergeT > 0.1 && convergeT < 0.85) {
            drawLiquidStretch(lastOrbitPos.x, lastOrbitPos.y, trunkBase.x, trunkBase.y, pull, r, 0.5);
          }

          drawGlowDot(x, y, r, alpha, 2);

          // Draw merged blob at trunk growing as particles arrive
          const blobAlpha = easeInOutCubic(convergeT) * 0.6;
          const blobR = lerp(4, 18, easeOutCubic(convergeT));
          if (blobAlpha > 0.05) {
            drawMergeBlob(trunkBase.x, trunkBase.y, blobR, blobAlpha, time * 1.2);
          }
          return;

        } else {
          // Phase 4: merged — don't draw individual particles
          return;
        }
      });

      // Phase 4: Draw the final merged orb
      if (p >= 0.75) {
        const mergeT = clamp((p - 0.75) / 0.25, 0, 1);
        
        // Orb position: from trunk base to viewport center
        const orbX = lerp(trunkBase.x, viewCenterX, easeInOutCubic(mergeT));
        const orbY = lerp(trunkBase.y, viewCenterY, easeInOutCubic(mergeT));
        
        // Orb size: liquid swell as it forms
        const baseR = lerp(6, 22, easeOutBack(Math.min(mergeT * 1.5, 1)));
        
        // Liquid pulse as it forms
        const liquidTime = time + mergeT * Math.PI;
        
        drawMergeBlob(orbX, orbY, baseR, easeOutCubic(mergeT), liquidTime);

        // Splash ring when merging
        if (mergeT < 0.35) {
          const splashT = mergeT / 0.35;
          const splashR = lerp(20, 65, splashT);
          ctx.beginPath();
          ctx.strokeStyle = `rgba(255, 190, 80, ${0.3 * (1 - splashT)})`;
          ctx.lineWidth = lerp(8, 1, splashT);
          ctx.arc(trunkBase.x, trunkBase.y, splashR, 0, Math.PI * 2);
          ctx.stroke();
        }

        // Secondary ambient glow following orb
        if (mergeT > 0.4) {
          const ambientAlpha = (mergeT - 0.4) / 0.6;
          const ambientG = ctx.createRadialGradient(orbX, orbY, 0, orbX, orbY, 80);
          ambientG.addColorStop(0, `rgba(255, 200, 80, ${0.08 * ambientAlpha})`);
          ambientG.addColorStop(1, `rgba(200, 100, 20, 0)`);
          ctx.beginPath();
          ctx.fillStyle = ambientG;
          ctx.arc(orbX, orbY, 80, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      rafId = requestAnimationFrame(draw);
    };

    const updateProgress = () => {
      const treeLayer = treeEl.parentElement;
      if (!treeLayer) return;

      const rect = treeEl.getBoundingClientRect();
      // Animation starts when top of tree is 200px from top of viewport
      // Animation ends (fully merged) when tree top is at -50% of tree height
      const triggerStart = window.innerHeight - 200; // tree top is 200px above bottom? No:
      // Actually: triggerStart = when rect.top == viewport - 200 (tree is scrolled up to 200px from top)
      // triggerEnd = when rect.top == -rect.height * 0.5 (tree is half scrolled away)
      
      const start = window.innerHeight - 200; // tree top is at this Y in viewport → progress=0
      const end = -rect.height * 0.4;         // tree top is at this Y → progress=1

      const progress = clamp((start - rect.top) / (start - end), 0, 1);
      sectionProgressRef.current = progress;
    };

    updateProgress();
    window.addEventListener('scroll', updateProgress, { passive: true });
    window.addEventListener('resize', updateProgress);
    
    setCanvasSize();
    draw();

    window.addEventListener('resize', setCanvasSize);
    return () => {
      window.removeEventListener('scroll', updateProgress);
      window.removeEventListener('resize', updateProgress);
      window.removeEventListener('resize', setCanvasSize);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [particles]);

  return (
    <div ref={ref} className="showroom-tree-wrap">
      <img
        src={h73ts01}
        alt="Root Tree Overlay"
        className="showroom-tree-image"
        style={{ opacity }}
      />
      
      {/* Canvas overlay for magic effects */}
      <div className="showroom-magic-overlay" aria-hidden="true">
        <canvas ref={canvasRef} className="showroom-magic-canvas" />
        <div ref={orbRef} className="showroom-core-orb is-hidden" />
      </div>
    </div>
  );
});

export default RootTreeOverlay;