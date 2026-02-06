// src/components/Cursor.js
import React, { useEffect, useRef, useState } from "react";
import styled, { createGlobalStyle } from "styled-components";
import "./CursorFix.css";

/* Skjul OS-cursoren overalt, men vis normal over chat widget */
const HideNativeCursor = createGlobalStyle`
  * { cursor: none !important; }
  
  [data-chatbot-id], [data-chatbot-id] *,
  .chat-widget, .chat-widget *,
  .chat-bubble, .chat-bubble *,
  .chat-button, .chat-button *,
  iframe[src*="chat"] {
    cursor: auto !important;
  }
`;

const RING_RED = "#b40f3a";
const RING_RED_GLOW = "rgba(180,15,58,.55)";
const RING_BLUE = "#3bb4ff";
const RING_BLUE_GLOW = "rgba(59,180,255,.55)";

const Ring = styled.div`
  position: fixed;
  z-index: 2147483647; /* Maximum possible z-index - above everything */
  width: ${(p) => (p.$active ? 18 : p.$hover ? 22 : 20)}px;
  height: ${(p) => (p.$active ? 18 : p.$hover ? 22 : 20)}px;
  border-radius: 50%;
  pointer-events: none !important;
  user-select: none;
  touch-action: none;
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
    ${(p) => (p.$active ? "#3bb4ff" : p.$hover ? "#b40f3a" : "#ffffff")};

  background: ${(p) =>
    p.$active
      ? "radial-gradient(transparent 60%, rgba(59,180,255,.10))"
      : p.$hover
      ? "radial-gradient(transparent 60%, rgba(180,15,58,.12))"
      : "rgba(255,255,255,0.1)"};

  box-shadow:
    0 0 0 1px rgba(0,0,0,0.3) inset,
    ${(p) =>
      p.$active
        ? `0 0 16px rgba(59,180,255,.55)`
        : p.$hover
        ? `0 0 14px rgba(180,15,58,.55)`
        : `0 0 8px rgba(0,0,0,.5)`};

  filter: ${(p) =>
    p.$hover ? "drop-shadow(0 0 6px rgba(180,15,58,.4))" : "drop-shadow(0 0 2px rgba(0,0,0,.5))"};

  @media (max-width: 768px) {
    display: none;
  }
`;

const INTERACTIVE_SELECTOR =
  'a, button, [role="button"], input, select, textarea, label, [data-clickable="true"], .clickable, .btn, [onclick], [data-action], .chat-bubble, .chat-button, .widget-button';

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
      el.style.transform = `translate3d(${e.clientX - size / 2}px, ${e.clientY - size / 2}px, 0)`;
      
      const target = e.target;
      const isOverChat = target.closest('[data-chatbot-id]') || 
                        target.closest('.chat-widget') || 
                        target.closest('.chat-bubble') ||
                        target.closest('.chat-button') ||
                        target.closest('iframe[src*="chat"]');
      
      setHover(target.closest(INTERACTIVE_SELECTOR) || false);
      setHidden(isOverChat);
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
