import React from "react"

export function StoneArrow({ size = 200, color = "white", className = "" }) {
  return (
    <span className={`sa-wrap ${className}`} aria-hidden="true">
      <svg
        className="sa-svg"
        width={size}
        height={size}
        viewBox="0 0 120 400"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid meet"
      >
        {/* Whole arrow group (used for lift + micro wobble) */}
        <g className="sa-arrow">
          {/* ── SHAFT (vertical) ── */}
          <path
            d="M60 78 L60 330"
            stroke={color}
            strokeWidth="4"
            strokeLinecap="round"
          />

          {/* Optional shaft wraps (top cluster) */}
          <g opacity="0.75">
            <line x1="54" y1="130" x2="66" y2="130" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <line x1="52" y1="138" x2="68" y2="138" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.65" />
            <line x1="54" y1="146" x2="66" y2="146" stroke={color} strokeWidth="2" strokeLinecap="round" />
          </g>

          {/* Optional shaft wraps (lower cluster) */}
          <g opacity="0.75">
            <line x1="54" y1="220" x2="66" y2="220" stroke={color} strokeWidth="2" strokeLinecap="round" />
            <line x1="52" y1="228" x2="68" y2="228" stroke={color} strokeWidth="2" strokeLinecap="round" opacity="0.65" />
            <line x1="54" y1="236" x2="66" y2="236" stroke={color} strokeWidth="2" strokeLinecap="round" />
          </g>

          {/* ── ARROWHEAD (outline only, no fill/box) ── */}
          <path
            d="M60 58 L42 92 L60 84 L78 92 Z"
            fill="none"
            stroke={color}
            strokeWidth="2.2"
            strokeLinejoin="round"
          />
          {/* Ridge line */}
          <line x1="60" y1="58" x2="60" y2="88" stroke={color} strokeWidth="1.2" opacity="0.6" strokeLinecap="round" />
          {/* Small notch */}
          <path
            d="M56 92 L60 100 L64 92"
            fill="none"
            stroke={color}
            strokeWidth="1.6"
            strokeLinejoin="round"
            opacity="0.6"
          />

          {/* ── FLETCHING (feather-like, at bottom) ── */}
          {/* Quill */}
          <line x1="60" y1="330" x2="60" y2="356" stroke={color} strokeWidth="3" strokeLinecap="round" />

          {/* Left feather (goes LEFT on hover) */}
          <g className="sa-feather sa-feather-left">
            {/* outer contour */}
            <path
              d="M60 330
                 C54 336 44 344 34 356
                 C44 350 52 346 60 342"
              fill="none"
              stroke={color}
              strokeWidth="2"
              strokeLinejoin="round"
              opacity="0.95"
            />
            {/* barbs */}
            <line x1="57" y1="338" x2="44" y2="346" stroke={color} strokeWidth="1.2" opacity="0.65" strokeLinecap="round" />
            <line x1="56" y1="346" x2="40" y2="356" stroke={color} strokeWidth="1.2" opacity="0.55" strokeLinecap="round" />
            <line x1="56" y1="354" x2="46" y2="366" stroke={color} strokeWidth="1.1" opacity="0.5" strokeLinecap="round" />
          </g>

          {/* Right feather (goes RIGHT on hover) */}
          <g className="sa-feather sa-feather-right">
            {/* outer contour */}
            <path
              d="M60 330
                 C66 336 76 344 86 356
                 C76 350 68 346 60 342"
              fill="none"
              stroke={color}
              strokeWidth="2"
              strokeLinejoin="round"
              opacity="0.95"
            />
            {/* barbs */}
            <line x1="63" y1="338" x2="76" y2="346" stroke={color} strokeWidth="1.2" opacity="0.65" strokeLinecap="round" />
            <line x1="64" y1="346" x2="80" y2="356" stroke={color} strokeWidth="1.2" opacity="0.55" strokeLinecap="round" />
            <line x1="64" y1="354" x2="74" y2="366" stroke={color} strokeWidth="1.1" opacity="0.5" strokeLinecap="round" />
          </g>

          {/* Tail nock */}
          <path
            d="M56 356 L60 372 L64 356"
            fill="none"
            stroke={color}
            strokeWidth="2"
            strokeLinejoin="round"
            opacity="0.95"
          />
        </g>
      </svg>

      <style>{`
        .sa-wrap{
          display:inline-flex;
          align-items:center;
          justify-content:center;
          line-height:0;
          transform: translateZ(0);
        }
        .sa-svg{
          display:block;
          overflow:visible;
          will-change: transform;
        }

        /* Lift whole arrow on hover */
        .sa-wrap:hover .sa-arrow{
          transform: translateY(-10px);
        }

        /* Smooth transitions */
        .sa-arrow{
          transform-origin: 50% 50%;
          transition: transform 220ms cubic-bezier(.2,.8,.2,1);
          will-change: transform;
        }

        /* Feather separation (sideways) */
        .sa-feather{
          transform-box: fill-box;
          transform-origin: 60px 340px; /* near feather root */
          transition: transform 240ms cubic-bezier(.2,.8,.2,1);
          will-change: transform;
        }

        .sa-wrap:hover .sa-feather-left{
          transform: translateX(-10px) rotate(-6deg);
        }
        .sa-wrap:hover .sa-feather-right{
          transform: translateX(10px) rotate(6deg);
        }

        /* Slight follow delay so feathers feel like they “lag” */
        .sa-feather-left{ transition-delay: 20ms; }
        .sa-feather-right{ transition-delay: 35ms; }
      `}</style>
    </span>
  )
}