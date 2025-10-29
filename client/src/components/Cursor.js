// src/components/Cursor.js
import React, { useEffect, useRef, useState } from "react";
import styled, { createGlobalStyle } from "styled-components";

/* Skjul OS-cursoren overalt i appen */
const HideNativeCursor = createGlobalStyle`
  html, body, * { cursor: none !important; }
`;

const RING_RED = "#b40f3a";
const RING_RED_GLOW = "rgba(180,15,58,.55)";
const RING_BLUE = "#3bb4ff";
const RING_BLUE_GLOW = "rgba(59,180,255,.55)";

const Ring = styled.div`
  position: fixed;
  z-index: 100000; /* Ensure custom cursor is above chat container (9999) */
  width: ${(p) => (p.$active ? 18 : p.$hover ? 22 : 20)}px;
  height: ${(p) => (p.$active ? 18 : p.$hover ? 22 : 20)}px;
  border-radius: 50%;
  pointer-events: none;
  transform: translate3d(-100px, -100px, 0);
  opacity: ${(p) => (p.$hidden ? 0 : 1)};
  transition:
    transform 16ms linear,
    width 80ms ease, height 80ms ease,
    border-color 80ms ease,
    box-shadow 120ms ease,
    background-color 120ms ease,
    filter 120ms ease;
  will-change: transform;

  border: 2px solid
    ${(p) => (p.$active ? RING_BLUE : p.$hover ? RING_RED : "#ffffff")};

  background: ${(p) =>
    p.$active
      ? "radial-gradient(transparent 60%, rgba(59,180,255,.10))"
      : p.$hover
      ? "radial-gradient(transparent 60%, rgba(180,15,58,.12))"
      : "transparent"};

  box-shadow:
    0 0 0 1px rgba(255,255,255,.03) inset,
    ${(p) =>
      p.$active
        ? `0 0 16px ${RING_BLUE_GLOW}`
        : p.$hover
        ? `0 0 14px ${RING_RED_GLOW}`
        : "0 0 8px rgba(255,255,255,.25)"};

  filter: ${(p) =>
    p.$hover ? "drop-shadow(0 0 6px rgba(180,15,58,.4))" : "none"};

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
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const onMove = (e) => {
      const size = el.offsetWidth;
      el.style.transform = `translate3d(${e.clientX - size / 2}px, ${
        e.clientY - size / 2
      }px, 0)`;

      const target = e.target;
      setHover(target?.closest?.(INTERACTIVE_SELECTOR) || false);

      // 👇 Skjul cursoren hvis vi er over en <iframe>
      if (target instanceof HTMLIFrameElement) {
        setHidden(true);
      } else {
        setHidden(false);
      }
    };

    const onDown = () => setActive(true);
    const onUp = () => setActive(false);

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
      <HideNativeCursor />
      <Ring ref={ref} $hover={hover} $active={active} $hidden={hidden} />
    </>
  );
}
