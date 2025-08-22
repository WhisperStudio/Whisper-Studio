// src/components/Cursor.js
import React, { useEffect, useRef, useState } from "react";
import styled, { createGlobalStyle } from "styled-components";

/* Skjul OS-cursoren overalt i appen (trumfer "cursor: pointer" etc.) */
const HideNativeCursor = createGlobalStyle`
  html, body, * { cursor: none !important; }
`;

/* Majestetisk rød (rubin) ved hover, blå ved click */
const RING_RED = "#b40f3a";         // dyp rubinrød
const RING_RED_GLOW = "rgba(180,15,58,.55)";
const RING_BLUE = "#3bb4ff";
const RING_BLUE_GLOW = "rgba(59,180,255,.55)";

const Ring = styled.div`
  position: fixed;
  z-index: 10000;
  width: ${p => (p.$active ? 18 : p.$hover ? 22 : 20)}px;
  height: ${p => (p.$active ? 18 : p.$hover ? 22 : 20)}px;
  border-radius: 50%;
  pointer-events: none;
  transform: translate3d(-100px, -100px, 0);
  transition:
    transform 16ms linear,
    width 80ms ease, height 80ms ease,
    border-color 80ms ease,
    box-shadow 120ms ease,
    background-color 120ms ease,
    filter 120ms ease;
  will-change: transform;

  /* Kjerneringen */
  border: 2px solid
    ${p => (p.$active ? RING_BLUE : p.$hover ? RING_RED : "#ffffff")};

  /* Lett fyll for dybde */
  background:
    ${p => (p.$active
            ? "radial-gradient(transparent 60%, rgba(59,180,255,.10))"
            : p.$hover
            ? "radial-gradient(transparent 60%, rgba(180,15,58,.12))"
            : "transparent")};

  /* Glød */
  box-shadow:
    0 0 0 1px rgba(255,255,255,.03) inset,
    ${p => (p.$active
            ? `0 0 16px ${RING_BLUE_GLOW}`
            : p.$hover
            ? `0 0 14px ${RING_RED_GLOW}`
            : "0 0 8px rgba(255,255,255,.25)")};
  filter: ${p => (p.$hover ? "drop-shadow(0 0 6px rgba(180,15,58,.4))" : "none")};

  @media (max-width: 768px) {
    display: none;
  }
`;

const INTERACTIVE_SELECTOR =
  'a, button, [role="button"], input, select, textarea, label, [data-clickable="true"], .clickable';

export default function Cursor() {
  const ref = useRef(null);
  const [hover, setHover] = useState(false);
  const [active, setActive] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onMove = (e) => {
      // sentrer ringen: bruk halv aktuell størrelse (den kan skalere ved hover/active)
      const size = el.offsetWidth;
      el.style.transform = `translate3d(${e.clientX - size / 2}px, ${e.clientY - size / 2}px, 0)`;

      const t = e.target instanceof Element ? e.target : null;
      setHover(!!t?.closest(INTERACTIVE_SELECTOR));
    };
    const onDown = () => setActive(true);
    const onUp   = () => setActive(false);

    window.addEventListener("mousemove", onMove, { passive: true });
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);

    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  return (
    <>
      <HideNativeCursor />{/* <- sørger for at OS-cursoren aldri vises */}
      <Ring id="app-cursor" ref={ref} $hover={hover} $active={active} />
    </>
  );
}
