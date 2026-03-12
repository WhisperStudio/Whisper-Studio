import React, { useEffect, useMemo, useRef, useState, forwardRef } from "react";
import S_Header from "./S_Header";
import "./ShowRoom.css";

import placeholderImage2 from "../../../bilder/smart_gnome.png";
import placeholderImage4 from "../../../bilder/assets_task_01jqzwt0nqf4ttddc4ykksgj87_img_0.webp";
import placeholderImage5 from "../../../bilder/assets_task_01jqzyj308f1s8ph7d3pz8fy24_img_0.webp";
import placeholderImage6 from "../../../bilder/assets_task_01jqebmy91fw3r80bh65pceeam_img_1.webp";
import placeholderImage9 from "../../../bilder/Nøkken.png";
import placeholderImage10 from "../../../bilder/Troll.png";
import placeholderImage12 from "../../../bilder/Pesta.png";
import h73ts01 from "./zZqar01.svg";

const CREATURES = [
  { id: 1, img: placeholderImage2, title: "Nisse", sub: "Friendly", tags: ["gnome", "friendly", "folk"] },
  { id: 2, img: placeholderImage4, title: "Forest Dweller", sub: "Unfriendly", tags: ["forest", "dark"] },
  { id: 3, img: placeholderImage6, title: "Shadow", sub: "Unfriendly", tags: ["shadow", "mystic"] },
  { id: 4, img: placeholderImage5, title: "Huldra", sub: "Unfriendly", tags: ["folk", "myth"] },
  { id: 12, img: placeholderImage9, title: "Nøkken", sub: "Unfriendly", tags: ["water", "monster"] },
  { id: 13, img: placeholderImage10, title: "Troll", sub: "Unfriendly", tags: ["troll", "rock"] },
  { id: 14, img: placeholderImage12, title: "Pesta", sub: "Unfriendly", tags: ["plague", "dark"] },
];

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

function getSideMeta(rect, point) {
  const centerX = rect.left + rect.width / 2;
  const isLeft = point.x < centerX;

  return {
    isLeft,
    sideX: isLeft
      ? rect.left - rect.width * 0.10
      : rect.right + rect.width * 0.10,
  };
}

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

const RootTreeOverlay = forwardRef(function RootTreeOverlay({ opacity = 1 }, ref) {
  return (
    <div ref={ref} className="showroom-tree-wrap">
      <img
        src={h73ts01}
        alt="Root Tree Overlay"
        className="showroom-tree-image"
        style={{ opacity }}
      />
    </div>
  );
});

export default function ShowRoom() {
  const [selectedCreature, setSelectedCreature] = useState(null);

  const showroomRef = useRef(null);
  const treeLayerRef = useRef(null);
  const treeRef = useRef(null);
  const canvasRef = useRef(null);

  const topProgressRef = useRef(0);
  const mergeProgressRef = useRef(0);

  const runes = "ᚠᚢᚦᚨᚱᚲᚷᚹᚺᚾᛁᛃᛇᛈᛉᛊᛏᛒᛖᛗᛚᛜᛞᛟ".split("");

  const stars = useMemo(() => {
    return Array.from({ length: 80 }, (_, i) => ({
      id: i,
      left: `${Math.random() * 95}%`,
      top: `${Math.random() * 95}%`,
      size: `${0.8 + Math.random() * 2}px`,
      duration: `${2 + Math.random() * 4}s`,
      delay: `${Math.random() * 5}s`,
    }));
  }, []);

  const floatingRunes = useMemo(() => {
    return Array.from({ length: 20 }, (_, i) => ({
      id: i,
      char: runes[Math.floor(Math.random() * runes.length)],
      left: `${Math.random() * 90 + 5}%`,
      top: `${Math.random() * 70 + 15}%`,
      fontSize: `${0.85 + Math.random() * 1.4}rem`,
      duration: `${7 + Math.random() * 9}s`,
      delay: `${Math.random() * 9}s`,
    }));
  }, [runes]);

  const particles = useMemo(() => {
    return Array.from({ length: 26 }, (_, i) => ({
      id: i,
      leaf: i % LEAF_POINTS.length,
      size: 2.5 + (i % 4) * 0.55,
      delay: (i % 8) * 0.018,
      wobble: Math.random() * Math.PI * 2,
      sideDrift: 0.85 + Math.random() * 0.55,
      depthDrift: 0.8 + Math.random() * 0.6,
    }));
  }, []);

  useEffect(() => {
    const updateProgress = () => {
      const treeEl = treeRef.current;
      if (!treeEl) return;

      const rect = treeEl.getBoundingClientRect();

      // 1) START-breakpoint:
      // Når toppen av SVG er 200px fra toppen av viewport.
      const topStart = 200;

      // 2) END-breakpoint:
      // Når bunnen av SVG er 200px fra bunnen av viewport.
      const bottomTrigger = window.innerHeight - 200;

      // Partiklene løser seg opp fra bladene når rect.top passerer 200px.
      // Denne går fra 0 til 1 mens treet beveger seg gjennom viewport.
      const topTravelDistance = Math.max(rect.height * 0.45, 1);
      const topProgress = clamp((topStart - rect.top) / topTravelDistance, 0, 1);

      // Merge starter IKKE før rect.bottom <= bottomTrigger.
      // Deretter går merge 0 -> 1 over en kort scroll-sone.
      const mergeDistance = Math.max(rect.height * 0.18, 1);
      const mergeProgress = clamp((bottomTrigger - rect.bottom) / mergeDistance, 0, 1);

      topProgressRef.current = topProgress;
      mergeProgressRef.current = mergeProgress;
    };

    updateProgress();
    window.addEventListener("scroll", updateProgress, { passive: true });
    window.addEventListener("resize", updateProgress);

    return () => {
      window.removeEventListener("scroll", updateProgress);
      window.removeEventListener("resize", updateProgress);
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

    const drawGlowDot = (x, y, r, alpha = 1) => {
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
    };

    const drawMergeBlob = (cx, cy, radius, alpha, liquidT) => {
      const ringG = ctx.createRadialGradient(cx, cy, radius * 0.2, cx, cy, radius * 2.8);
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
    };

    const draw = () => {
      time += 0.016;
      ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);

      const topP = topProgressRef.current;
      const mergeP = mergeProgressRef.current;
      const rect = treeEl.getBoundingClientRect();

      const gatherPoint = pointInRect(rect, 0.5, 0.83);
      const lowerLeft = pointInRect(rect, 0.28, 0.77);
      const lowerRight = pointInRect(rect, 0.72, 0.77);

      particles.forEach((particle) => {
        const leaf = pointInRect(
          rect,
          LEAF_POINTS[particle.leaf].x,
          LEAF_POINTS[particle.leaf].y
        );

        const side = getSideMeta(rect, leaf);
        const sideTarget = side.isLeft ? lowerLeft : lowerRight;

        // Før start-breakpoint: bare lys på bladene
        if (topP <= 0) {
          const pulse = 0.88 + (Math.sin(time * 2 + particle.id * 0.7) + 1) * 0.08;
          drawGlowDot(leaf.x, leaf.y, particle.size * pulse, 0.92);
          return;
        }

        // Så lenge merge ikke har startet, holder vi dem som små partikler
        // som går fra bladene og ned mot undersiden.
        const local = clamp((topP - particle.delay) / (1 - particle.delay), 0, 1);

        let x = leaf.x;
        let y = leaf.y;
        let r = particle.size;
        let alpha = 1;

        if (mergeP <= 0) {
          if (local < 0.18) {
            const t = local / 0.18;
            const pulse = 1 + Math.sin(time * 3 + particle.id) * 0.08;

            x = leaf.x;
            y = leaf.y;
            r = particle.size * lerp(1, 1.14 * pulse, easeOutCubic(t));
            alpha = 0.85 + t * 0.12;

            drawGlowDot(x, y, r, alpha);
            return;
          }

          const t = clamp((local - 0.18) / 0.82, 0, 1);

          const p0 = { x: leaf.x, y: leaf.y };
          const p1 = {
            x: lerp(leaf.x, side.sideX, 0.72),
            y: leaf.y - rect.height * 0.05,
          };
          const p2 = {
            x: side.isLeft
              ? rect.left - rect.width * (0.14 + (particle.sideDrift - 0.85) * 0.08)
              : rect.right + rect.width * (0.14 + (particle.sideDrift - 0.85) * 0.08),
            y: gatherPoint.y - rect.height * (0.08 + 0.08 * particle.depthDrift),
          };
          const p3 = {
            x: sideTarget.x,
            y: sideTarget.y,
          };

          const curve = cubicBezierPoint(p0, p1, p2, p3, easeInOutCubic(t));

          x = curve.x;
          y = curve.y + Math.sin(time * 2 + particle.wobble) * (1 - t * 0.7) * 4;
          r = lerp(particle.size, particle.size * 1.22, t);
          alpha = 0.96;

          drawGlowDot(x, y, r, alpha);
          return;
        }

        // Merge starter først ved bottom-breakpoint
        const settleT = clamp((local - 0.18) / 0.82, 0, 1);
        const settleP0 = { x: leaf.x, y: leaf.y };
        const settleP1 = {
          x: lerp(leaf.x, side.sideX, 0.72),
          y: leaf.y - rect.height * 0.05,
        };
        const settleP2 = {
          x: side.isLeft
            ? rect.left - rect.width * (0.14 + (particle.sideDrift - 0.85) * 0.08)
            : rect.right + rect.width * (0.14 + (particle.sideDrift - 0.85) * 0.08),
          y: gatherPoint.y - rect.height * (0.08 + 0.08 * particle.depthDrift),
        };
        const settleP3 = {
          x: sideTarget.x,
          y: sideTarget.y,
        };

        const settledPoint = cubicBezierPoint(
          settleP0,
          settleP1,
          settleP2,
          settleP3,
          easeInOutCubic(settleT)
        );

        const mergeStart = settledPoint;

        const mp0 = mergeStart;
        const mp1 = {
          x: side.isLeft
            ? gatherPoint.x - rect.width * 0.20
            : gatherPoint.x + rect.width * 0.20,
          y: gatherPoint.y + rect.height * 0.01,
        };
        const mp2 = {
          x: side.isLeft
            ? gatherPoint.x - rect.width * 0.10
            : gatherPoint.x + rect.width * 0.10,
          y: gatherPoint.y + rect.height * 0.015,
        };
        const mp3 = { x: gatherPoint.x, y: gatherPoint.y };

        const mergeCurve = cubicBezierPoint(mp0, mp1, mp2, mp3, easeInCubic(mergeP));

        x = mergeCurve.x;
        y = mergeCurve.y;
        r = lerp(particle.size * 1.2, particle.size * 1.7, mergeP);
        alpha = lerp(0.95, 0.05, mergeP);

        drawGlowDot(x, y, r, alpha);
      });

      if (mergeP > 0) {
        drawMergeBlob(
          gatherPoint.x,
          gatherPoint.y,
          lerp(8, 24, easeOutBack(mergeP)),
          lerp(0.2, 1, mergeP),
          time
        );

        if (mergeP > 0.9) {
          const followT = clamp((mergeP - 0.9) / 0.1, 0, 1);
          const orbX = lerp(gatherPoint.x, window.innerWidth / 2, easeInOutCubic(followT));
          const orbY = lerp(gatherPoint.y, window.innerHeight * 0.62, easeInOutCubic(followT));

          drawMergeBlob(
            orbX,
            orbY,
            lerp(24, 20, followT),
            1,
            time + 0.8
          );
        }
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
    <div className="showroom showroom--with-tree" ref={showroomRef}>
      <div className="showroom-stars" aria-hidden="true">
        {stars.map((star) => (
          <span
            key={star.id}
            className="star"
            style={{
              left: star.left,
              top: star.top,
              width: star.size,
              height: star.size,
              animationDuration: star.duration,
              animationDelay: star.delay,
            }}
          />
        ))}
      </div>

      <div className="showroom-runes" aria-hidden="true">
        {floatingRunes.map((rune) => (
          <span
            key={rune.id}
            className="rune-float"
            style={{
              left: rune.left,
              top: rune.top,
              fontSize: rune.fontSize,
              animationDuration: rune.duration,
              animationDelay: rune.delay,
            }}
          >
            {rune.char}
          </span>
        ))}
      </div>

      <div className="showroom-magic-overlay" aria-hidden="true">
        <canvas ref={canvasRef} className="showroom-magic-canvas" />
      </div>

      <S_Header />

      <div className="showroom-tree-layer" ref={treeLayerRef}>
        <RootTreeOverlay ref={treeRef} opacity={0.42} />
      </div>

      <div className="creature-grid">
        {CREATURES.map((creature) => (
          <div
            key={creature.id}
            className="creature-card"
            onClick={() => setSelectedCreature(creature)}
          >
            <img src={creature.img} alt={creature.title} />
            <h3>{creature.title}</h3>
            <span className={`sub-tag ${creature.sub.toLowerCase()}`}>
              {creature.sub}
            </span>
          </div>
        ))}
      </div>

      {selectedCreature && (
        <div className="creature-modal" onClick={() => setSelectedCreature(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setSelectedCreature(null)}>
              ×
            </button>
            <img src={selectedCreature.img} alt={selectedCreature.title} />
            <h2>{selectedCreature.title}</h2>
            <span className={`sub-tag ${selectedCreature.sub.toLowerCase()}`}>
              {selectedCreature.sub}
            </span>
            <div className="tags">
              {selectedCreature.tags.map((tag, idx) => (
                <span key={idx} className="tag">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}