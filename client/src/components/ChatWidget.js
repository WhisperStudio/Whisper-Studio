// Install the widget in your React/Next.js app

import { useEffect } from 'react';
 
export function ChatWidget() {

  useEffect(() => {

    const script = document.createElement('script');

    script.src = 'https://chat.vintrastudio.com/api/widget.js';

    script.setAttribute('data-chatbot-id', '0ec5b8f2-42fd-4029-90e8-0c5d6d98bc98');

    script.async = true;

    document.body.appendChild(script);

    return () => {

      document.body.removeChild(script);

    };

  }, []);

  return null;

}
 