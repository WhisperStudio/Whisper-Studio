import React, { useMemo } from "react";

function mulberry32(a) {
  return function () {
    let t = (a += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function clamp(v, min, max) {
  return Math.min(Math.max(v, min), max);
}

function buildRootPath({
  startX,
  startY,
  endY,
  drift = 0,
  segments = 8,
  seedRand,
}) {
  let d = `M ${startX} ${startY}`;
  let x = startX;
  let y = startY;

  const totalH = endY - startY;

  for (let i = 1; i <= segments; i++) {
    const t = i / segments;
    const nextY = startY + totalH * t;

    const sway =
      Math.sin(t * Math.PI * 1.4 + drift) * (18 + t * 36) +
      (seedRand() - 0.5) * (18 + t * 30);

    const nextX = startX + sway + drift * 8;

    const cp1x = x + (nextX - x) * 0.35 + (seedRand() - 0.5) * 24;
    const cp1y = y + (nextY - y) * 0.3;

    const cp2x = x + (nextX - x) * 0.7 + (seedRand() - 0.5) * 24;
    const cp2y = y + (nextY - y) * 0.72;

    d += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${nextX} ${nextY}`;

    x = nextX;
    y = nextY;
  }

  return d;
}

function buildBranchPath({
  rootX,
  rootY,
  direction = 1,
  length = 160,
  bend = 70,
  seedRand,
}) {
  const x2 = rootX + direction * length * 0.35;
  const y2 = rootY + length * 0.35;

  const x3 = rootX + direction * length * 0.75 + (seedRand() - 0.5) * 20;
  const y3 = rootY + length * 0.78;

  const x4 = rootX + direction * length + (seedRand() - 0.5) * 20;
  const y4 = rootY + length;

  const c1x = rootX + direction * bend * 0.4;
  const c1y = rootY + length * 0.12;

  const c2x = x2 + direction * bend * 0.5;
  const c2y = y2;

  const c3x = x2 + direction * bend * 0.45;
  const c3y = y2 + length * 0.15;

  const c4x = x3 + direction * bend * 0.2;
  const c4y = y3 - length * 0.08;

  return `M ${rootX} ${rootY}
    C ${c1x} ${c1y}, ${c2x} ${c2y}, ${x2} ${y2}
    C ${c3x} ${c3y}, ${c4x} ${c4y}, ${x4} ${y4}`;
}

export default function RootTreeOverlay({
  height = 2200,
  width = 420,
  className = "",
  style = {},
  trunkX = 210,
  topY = 60,
  glow = true,
  opacity = 1,
}) {
  const {
    mainRoots,
    sideRoots,
    canopyBranches,
    leaves,
  } = useMemo(() => {
    const rand = mulberry32(42);

    const trunkBaseY = 270;
    const bottomY = height - 40;

    const mainRoots = [
      {
        d: buildRootPath({
          startX: trunkX,
          startY: trunkBaseY,
          endY: bottomY,
          drift: 0,
          segments: 9,
          seedRand: rand,
        }),
        strokeWidth: 13,
      },
      {
        d: buildRootPath({
          startX: trunkX - 20,
          startY: trunkBaseY + 10,
          endY: height - 180,
          drift: -1.6,
          segments: 8,
          seedRand: rand,
        }),
        strokeWidth: 8,
      },
      {
        d: buildRootPath({
          startX: trunkX + 18,
          startY: trunkBaseY + 8,
          endY: height - 210,
          drift: 1.45,
          segments: 8,
          seedRand: rand,
        }),
        strokeWidth: 8,
      },
      {
        d: buildRootPath({
          startX: trunkX - 8,
          startY: trunkBaseY + 18,
          endY: height - 320,
          drift: -2.3,
          segments: 7,
          seedRand: rand,
        }),
        strokeWidth: 6,
      },
      {
        d: buildRootPath({
          startX: trunkX + 8,
          startY: trunkBaseY + 18,
          endY: height - 300,
          drift: 2.15,
          segments: 7,
          seedRand: rand,
        }),
        strokeWidth: 6,
      },
    ];

    const sideRoots = [];
    const attachPoints = [
      420, 520, 640, 760, 900, 1040, 1180, 1340, 1500, 1660, 1820,
    ];

    attachPoints.forEach((y, i) => {
      const side = i % 2 === 0 ? -1 : 1;
      const offsetX =
        trunkX + Math.sin(i * 0.9) * 34 + (rand() - 0.5) * 20;

      const branchCount = i < 4 ? 2 : 3;

      for (let j = 0; j < branchCount; j++) {
        const direction = j % 2 === 0 ? side : -side * 0.55;
        const length = 90 + rand() * 110 + i * 4;
        const bend = 35 + rand() * 60;

        sideRoots.push({
          d: buildBranchPath({
            rootX: offsetX + (rand() - 0.5) * 16,
            rootY: y + j * 6,
            direction,
            length,
            bend,
            seedRand: rand,
          }),
          strokeWidth: clamp(4.4 - i * 0.18, 1.4, 4.4),
        });
      }
    });

    const canopyBranches = [
      `M ${trunkX} 245 C ${trunkX - 14} 170, ${trunkX - 34} 120, ${trunkX - 70} 70`,
      `M ${trunkX} 245 C ${trunkX + 16} 178, ${trunkX + 32} 124, ${trunkX + 76} 72`,
      `M ${trunkX - 8} 208 C ${trunkX - 66} 180, ${trunkX - 110} 150, ${trunkX - 128} 104`,
      `M ${trunkX + 8} 208 C ${trunkX + 66} 180, ${trunkX + 110} 150, ${trunkX + 128} 104`,
      `M ${trunkX} 198 C ${trunkX - 34} 146, ${trunkX - 48} 102, ${trunkX - 44} 40`,
      `M ${trunkX} 198 C ${trunkX + 28} 146, ${trunkX + 44} 98, ${trunkX + 38} 34`,
      `M ${trunkX - 34} 155 C ${trunkX - 88} 132, ${trunkX - 142} 112, ${trunkX - 162} 70`,
      `M ${trunkX + 34} 155 C ${trunkX + 92} 132, ${trunkX + 148} 110, ${trunkX + 166} 68`,
    ];

    const leaves = Array.from({ length: 78 }, (_, i) => {
      const angle = (i / 78) * Math.PI * 2;
      const radius = 70 + rand() * 70;
      const x = trunkX + Math.cos(angle) * radius * (0.95 + rand() * 0.45);
      const y = 115 + Math.sin(angle) * radius * (0.62 + rand() * 0.35);
      const rotate = rand() * 360;
      const scale = 0.8 + rand() * 0.9;
      return { x, y, rotate, scale, id: i };
    });

    return { mainRoots, sideRoots, canopyBranches, leaves };
  }, [height, trunkX]);

  return (
    <svg
      className={className}
      width={width}
      height={height}
      viewBox={`0 0 ${width} ${height}`}
      style={{
        display: "block",
        overflow: "visible",
        pointerEvents: "none",
        opacity,
        ...style,
      }}
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="treeGoldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#b96d12" />
          <stop offset="22%" stopColor="#f0b73c" />
          <stop offset="48%" stopColor="#ffe483" />
          <stop offset="72%" stopColor="#e6ad2d" />
          <stop offset="100%" stopColor="#9c5a08" />
        </linearGradient>

        <linearGradient id="rootGoldGradient" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="#f2c24c" />
          <stop offset="40%" stopColor="#ffd973" />
          <stop offset="100%" stopColor="#b86d11" />
        </linearGradient>

        <filter id="treeGlow" x="-50%" y="-20%" width="200%" height="140%">
          <feGaussianBlur stdDeviation="4.5" result="blur" />
          <feColorMatrix
            in="blur"
            type="matrix"
            values="
              1 0 0 0 0
              0 0.82 0 0 0
              0 0.38 0 0 0
              0 0 0 0.95 0"
          />
        </filter>

        <filter id="softGlow" x="-80%" y="-20%" width="260%" height="160%">
          <feGaussianBlur stdDeviation="8" />
        </filter>

        <symbol id="leafShape" viewBox="0 0 20 28">
          <path
            d="M10 1
               C 15 4, 18 10, 16.2 16
               C 14.5 22, 10.8 25.5, 10 27
               C 9.2 25.4, 5.5 22, 3.8 16
               C 2 10, 5 4, 10 1 Z"
            fill="url(#treeGoldGradient)"
          />
        </symbol>
      </defs>

      {glow && (
        <g opacity="0.45" filter="url(#softGlow)">
          <path
            d={`M ${trunkX} 34 C ${trunkX - 40} 72, ${trunkX - 36} 166, ${trunkX} 260`}
            fill="none"
            stroke="#f4b63f"
            strokeWidth="18"
            strokeLinecap="round"
          />
          {mainRoots.map((r, i) => (
            <path
              key={`glow-main-${i}`}
              d={r.d}
              fill="none"
              stroke="#ecb13c"
              strokeWidth={r.strokeWidth + 4}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
        </g>
      )}

      <g>
        {canopyBranches.map((d, i) => (
          <path
            key={`branch-${i}`}
            d={d}
            fill="none"
            stroke="url(#treeGoldGradient)"
            strokeWidth={i < 2 ? 7 : 4.5}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}

        {leaves.map((leaf) => (
          <use
            key={leaf.id}
            href="#leafShape"
            x={leaf.x}
            y={leaf.y}
            width={12 * leaf.scale}
            height={16 * leaf.scale}
            transform={`rotate(${leaf.rotate} ${leaf.x + 6} ${leaf.y + 8})`}
            opacity="0.95"
          />
        ))}

        <path
          d={`
            M ${trunkX} 262
            C ${trunkX - 14} 210, ${trunkX - 22} 152, ${trunkX - 10} 102
            C ${trunkX - 6} 74, ${trunkX - 12} 52, ${trunkX - 4} 28
            C ${trunkX + 4} 50, ${trunkX + 10} 74, ${trunkX + 8} 102
            C ${trunkX + 2} 156, ${trunkX + 6} 212, ${trunkX} 262
          `}
          fill="url(#treeGoldGradient)"
        />

        <path
          d={`
            M ${trunkX - 26} 262
            C ${trunkX - 12} 236, ${trunkX + 12} 236, ${trunkX + 26} 262
            C ${trunkX + 18} 286, ${trunkX - 18} 286, ${trunkX - 26} 262
          `}
          fill="url(#treeGoldGradient)"
        />

        {mainRoots.map((r, i) => (
          <path
            key={`main-root-${i}`}
            d={r.d}
            fill="none"
            stroke="url(#rootGoldGradient)"
            strokeWidth={r.strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        ))}

        {sideRoots.map((r, i) => (
          <path
            key={`side-root-${i}`}
            d={r.d}
            fill="none"
            stroke="url(#rootGoldGradient)"
            strokeWidth={r.strokeWidth}
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.96"
          />
        ))}
      </g>
    </svg>
  );
}