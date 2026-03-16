import React, { useEffect, useMemo, useRef } from "react";
import zZqar01 from "./zZqar01.svg";
import "./ShowRoom.css";

const BREAKPOINT_TOP = 200;

const clamp = (v, min, max) => Math.min(Math.max(v, min), max);
const lerp = (a, b, t) => a + (b - a) * t;

const easeInOutCubic = (t) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

const easeOutBack = (t) => {
  const c1 = 1.70158;
  const c3 = c1 + 1;
  return 1 + c3 * Math.pow(t - 1, 3) + c1 * Math.pow(t - 1, 2);
};

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

function pointInRect(rect, px, py) {
  return {
    x: rect.left + rect.width * px,
    y: rect.top + rect.height * py,
  };
}

function cubicBezierPoint(p0, p1, p2, p3, t) {
  const mt = 1 - t;
  return {
    x:
      mt * mt * mt * p0.x +
      3 * mt * mt * t * p1.x +
      3 * mt * t * t * p2.x +
      t * t * t * p3.x,
    y:
      mt * mt * mt * p0.y +
      3 * mt * mt * t * p1.y +
      3 * mt * t * t * p2.y +
      t * t * t * p3.y,
  };
}

function catmullRomPoint(points, t) {
  if (points.length < 2) return points[0] ?? { x: 0, y: 0 };

  if (points.length === 2) {
    return {
      x: lerp(points[0].x, points[1].x, t),
      y: lerp(points[0].y, points[1].y, t),
    };
  }

  const segCount = points.length - 1;
  const scaled = clamp(t, 0, 1) * segCount;
  const seg = Math.min(Math.floor(scaled), segCount - 1);
  const localT = scaled - seg;

  const p0 = points[Math.max(0, seg - 1)];
  const p1 = points[seg];
  const p2 = points[Math.min(points.length - 1, seg + 1)];
  const p3 = points[Math.min(points.length - 1, seg + 2)];

  const tt = localT * localT;
  const ttt = tt * localT;

  return {
    x:
      0.5 *
      ((2 * p1.x) +
        (-p0.x + p2.x) * localT +
        (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * tt +
        (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * ttt),
    y:
      0.5 *
      ((2 * p1.y) +
        (-p0.y + p2.y) * localT +
        (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * tt +
        (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * ttt),
  };
}

function makeEvenPathSampler(points, samples = 180) {
  const table = [];
  let prev = catmullRomPoint(points, 0);
  let totalLength = 0;

  table.push({ t: 0, len: 0 });

  for (let i = 1; i <= samples; i++) {
    const t = i / samples;
    const p = catmullRomPoint(points, t);
    totalLength += Math.hypot(p.x - prev.x, p.y - prev.y);
    table.push({ t, len: totalLength });
    prev = p;
  }

  return function sample(u) {
    const target = clamp(u, 0, 1) * totalLength;

    let low = 0;
    let high = table.length - 1;

    while (low < high) {
      const mid = (low + high) >> 1;
      if (table[mid].len < target) low = mid + 1;
      else high = mid;
    }

    const curr = table[low];
    const prevEntry = table[Math.max(0, low - 1)];
    const segLen = Math.max(curr.len - prevEntry.len, 0.0001);
    const local = (target - prevEntry.len) / segLen;
    const t = lerp(prevEntry.t, curr.t, local);

    return catmullRomPoint(points, t);
  };
}

function drawGlowDot(ctx, x, y, r, alpha = 1) {
  const gradient = ctx.createRadialGradient(x, y, 0, x, y, r * 6.2);
  gradient.addColorStop(0, `rgba(255, 241, 188, ${0.95 * alpha})`);
  gradient.addColorStop(0.16, `rgba(255, 217, 120, ${0.9 * alpha})`);
  gradient.addColorStop(0.38, `rgba(233, 174, 63, ${0.55 * alpha})`);
  gradient.addColorStop(0.68, `rgba(201, 126, 24, ${0.22 * alpha})`);
  gradient.addColorStop(1, "rgba(201, 126, 24, 0)");

  ctx.beginPath();
  ctx.fillStyle = gradient;
  ctx.arc(x, y, r * 6.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.beginPath();
  ctx.fillStyle = `rgba(255, 241, 188, ${alpha})`;
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
}

function drawMergeBlob(ctx, cx, cy, radius, alpha, liquidT) {
  const ringG = ctx.createRadialGradient(
    cx,
    cy,
    radius * 0.2,
    cx,
    cy,
    radius * 2.8
  );
  ringG.addColorStop(0, `rgba(255, 223, 136, ${0.45 * alpha})`);
  ringG.addColorStop(0.45, `rgba(232, 164, 51, ${0.22 * alpha})`);
  ringG.addColorStop(1, `rgba(180, 88, 10, 0)`);

  ctx.beginPath();
  ctx.fillStyle = ringG;
  ctx.arc(cx, cy, radius * 2.8, 0, Math.PI * 2);
  ctx.fill();

  const squishX = 1 + Math.sin(liquidT * 4.5) * 0.08;
  const squishY = 1 - Math.sin(liquidT * 4.5) * 0.06;

  ctx.save();
  ctx.translate(cx, cy);
  ctx.scale(squishX, squishY);

  const blobG = ctx.createRadialGradient(0, 0, 0, 0, 0, radius);
  blobG.addColorStop(0, `rgba(255, 245, 196, ${alpha})`);
  blobG.addColorStop(0.3, `rgba(255, 214, 112, ${0.96 * alpha})`);
  blobG.addColorStop(0.75, `rgba(219, 139, 29, ${0.82 * alpha})`);
  blobG.addColorStop(1, `rgba(160, 72, 10, 0)`);

  ctx.beginPath();
  for (let i = 0; i <= 10; i++) {
    const a = (i / 10) * Math.PI * 2;
    const wobble = 1 + Math.sin(liquidT * 6 + a * 3) * 0.08;
    const rr = radius * wobble;
    const px = Math.cos(a) * rr;
    const py = Math.sin(a) * rr;
    if (i === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.closePath();
  ctx.fillStyle = blobG;
  ctx.fill();
  ctx.restore();
}

function getScrollState(el, mergeOffsetPx) {
  const rect = el.getBoundingClientRect();
  const viewportH = window.innerHeight;
  const scrollY = window.scrollY;

  const absTop = rect.top + scrollY;
  const absBottom = rect.bottom + scrollY;

  const startScrollY = absTop - BREAKPOINT_TOP;

  // Merge-punktet ligger et visst antall px under SVG-en
  const mergeAbsY = absBottom + mergeOffsetPx;

  // Dette er punktet der merge-punktet treffer midten av viewporten
  const mergeScrollY = mergeAbsY - viewportH / 2;

  const span = Math.max(mergeScrollY - startScrollY, 1);

  // Progress for små orbsa: 0 når toppen når 200px, 1 når merge-punktet er i viewport-midten
  const orbProgress = clamp((scrollY - startScrollY) / span, 0, 1);

  // Etter at merge-punktet har nådd midten av skjermen, kan stor orb følge videre
  const followProgress = Math.max(scrollY - mergeScrollY, 0);

  return {
    rect,
    absBottom,
    mergeAbsY,
    startScrollY,
    mergeScrollY,
    orbProgress,
    followProgress,
  };
}

function buildHalfArcPath(rect, home, targetPoint) {
  const centerX = rect.left + rect.width / 2;
  const isLeft = home.x < centerX;
  const dir = isLeft ? -1 : 1;

  // Tydeligere sidebue så de ikke faller rett ned
  return [
    home,
    {
      x: home.x + dir * rect.width * 0.06,
      y: home.y + rect.height * 0.08,
    },
    {
      x: centerX + dir * rect.width * 0.34,
      y: rect.top + rect.height * 0.40,
    },
    {
      x: centerX + dir * rect.width * 0.38,
      y: rect.top + rect.height * 0.68,
    },
    {
      x: centerX + dir * rect.width * 0.24,
      y: rect.bottom + rect.height * 0.03,
    },
    targetPoint,
  ];
}

export default function RootTreeOverlay({ opacity = 1 }) {
  const treeRef = useRef(null);
  const canvasRef = useRef(null);

  const orbProgressRef = useRef(0);
  const followProgressRef = useRef(0);
  const mergePointRef = useRef({ x: 0, y: 0 });

  const particles = useMemo(() => {
    return Array.from({ length: 26 }, (_, i) => ({
      id: i,
      leafIndex: i % LEAF_POINTS.length,
      size: 2.4 + (i % 4) * 0.55,
      delay: (i % 8) * 0.016,
      wobble: Math.random() * Math.PI * 2,
    }));
  }, []);

  useEffect(() => {
    const MERGE_OFFSET_PX = 140;
    let ticking = false;

    const updateState = () => {
      const treeEl = treeRef.current;
      if (!treeEl) {
        ticking = false;
        return;
      }

      const state = getScrollState(treeEl, MERGE_OFFSET_PX);

      orbProgressRef.current = state.orbProgress;
      followProgressRef.current = state.followProgress;

      mergePointRef.current = {
        x: state.rect.left + state.rect.width / 2,
        y: state.rect.bottom + MERGE_OFFSET_PX,
      };

      ticking = false;
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(updateState);
      }
    };

    updateState();

    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", updateState);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", updateState);
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    const treeEl = treeRef.current;
    if (!canvas || !treeEl) return;

    const ctx = canvas.getContext("2d");
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

    const draw = () => {
      time += 0.016;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      const rect = treeEl.getBoundingClientRect();
      const orbProgress = orbProgressRef.current;
      const followProgress = followProgressRef.current;
      const mergePoint = mergePointRef.current;

      const travelPhaseEnd = 0.82;
      const mergePhaseEnd = 1.0;

      particles.forEach((particle) => {
        const leafDef = LEAF_POINTS[particle.leafIndex];
        const home = pointInRect(rect, leafDef.x, leafDef.y);

        const pathPoints = buildHalfArcPath(rect, home, mergePoint);
        const samplePath = makeEvenPathSampler(pathPoints);

        const local = clamp(
          (orbProgress - particle.delay) / Math.max(1 - particle.delay, 0.0001),
          0,
          1
        );

        if (local <= 0) {
          const pulse = 0.95 + Math.sin(time * 2 + particle.id * 0.7) * 0.04;
          drawGlowDot(ctx, home.x, home.y, particle.size * pulse, 0.92);
          return;
        }

        let x;
        let y;
        let r;
        let alpha;

        if (local < travelPhaseEnd) {
          const travelT = local / travelPhaseEnd;
          const pos = samplePath(travelT * 0.88);

          x = pos.x;
          y = pos.y + Math.sin(time * 1.2 + particle.wobble) * (1 - travelT) * 1.0;
          r = lerp(particle.size, particle.size * 1.14, travelT);
          alpha = 0.95;

          drawGlowDot(ctx, x, y, r, alpha);
          return;
        }

        const mergeT = (local - travelPhaseEnd) / (mergePhaseEnd - travelPhaseEnd);
        const easedMergeT = easeInOutCubic(mergeT);

        const startPos = samplePath(0.88);
        const isLeft = home.x < rect.left + rect.width / 2;
        const sidePull = isLeft ? -1 : 1;

        const cp1 = {
          x: startPos.x + sidePull * rect.width * 0.08,
          y: startPos.y + rect.height * 0.02,
        };

        const cp2 = {
          x: mergePoint.x + sidePull * rect.width * 0.045,
          y: mergePoint.y - rect.height * 0.05,
        };

        const pos = cubicBezierPoint(startPos, cp1, cp2, mergePoint, easedMergeT);

        x = pos.x;
        y = pos.y;
        r = lerp(particle.size * 1.08, particle.size * 1.48, easedMergeT);
        alpha = lerp(0.95, 0, easedMergeT);

        if (alpha > 0.01) {
          drawGlowDot(ctx, x, y, r, alpha);
        }
      });

      // Stor orb vises først når små orbsa er ferdige
      if (orbProgress >= 0.999) {
        const appearT = clamp((orbProgress - 0.999) / 0.001, 0, 1);

        // Følger ikke med skjermen før etter overtakelsen
        const followT = clamp(followProgress / 220, 0, 1);

        const mergedOrbX = lerp(
          mergePoint.x,
          window.innerWidth / 2,
          easeInOutCubic(followT)
        );

        const mergedOrbY = lerp(
          mergePoint.y,
          window.innerHeight * 0.62,
          easeInOutCubic(followT)
        );

        const mergedOrbRadius =
          followT <= 0
            ? lerp(8, 24, easeOutBack(appearT))
            : lerp(24, 20, easeOutCubic(followT));

        const mergedOrbAlpha = 1;

        drawMergeBlob(
          ctx,
          mergedOrbX,
          mergedOrbY,
          mergedOrbRadius,
          mergedOrbAlpha,
          time + followT * 0.8
        );
      }

      rafId = requestAnimationFrame(draw);
    };

    setCanvasSize();
    draw();

    window.addEventListener("resize", setCanvasSize);

    return () => {
      window.removeEventListener("resize", setCanvasSize);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [particles]);

  return (
    <>
      <div className="showroom-tree-wrap" ref={treeRef}>
        <img
          src={zZqar01}
          alt="Root Tree Overlay"
          className="showroom-tree-image"
          style={{ opacity }}
        />
      </div>

      <div
        className="showroom-magic-overlay"
        aria-hidden="true"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          pointerEvents: "none",
          zIndex: 9999,
        }}
      >
        <canvas ref={canvasRef} className="showroom-magic-canvas" />
      </div>
    </>
  );
}