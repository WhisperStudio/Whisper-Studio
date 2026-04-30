// Install the widget in your React/Next.js app
import { useEffect } from 'react';

export function ChatWidget() {
  useEffect(() => {
    let idleHandle;
    const script = document.createElement('script');
    script.src = 'https://chat.vintrastudio.com/api/widget.js';
    script.setAttribute('data-chatbot-id', '0ec5b8f2-42fd-4029-90e8-0c5d6d98bc98');
    script.async = true;

    const loadScript = () => {
      document.body.appendChild(script);
    };

    if ('requestIdleCallback' in window) {
      idleHandle = window.requestIdleCallback(loadScript, { timeout: 2500 });
    } else {
      idleHandle = window.setTimeout(loadScript, 2500);
    }

    return () => {
      if ('cancelIdleCallback' in window && typeof idleHandle === 'number') {
        window.cancelIdleCallback(idleHandle);
      } else {
        window.clearTimeout(idleHandle);
      }
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  return null;
}