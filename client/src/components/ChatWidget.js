import { useEffect } from 'react';

// Lightweight embed for Vintra chat widget
export function ChatWidget() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://chat.vintrastudio.com/api/widget.js';
    script.setAttribute('data-chatbot-id', 'ff8c9f06-7ec9-4824-9003-484477677f5f');
    script.async = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return null;
}
