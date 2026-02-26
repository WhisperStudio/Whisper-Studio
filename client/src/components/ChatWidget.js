// Install the widget in your React/Next.js app

import { useEffect } from 'react';
 
export function ChatWidget() {

  useEffect(() => {

    const script = document.createElement('script');

    script.src = 'https://chat.vintrastudio.com/api/widget.js';

    script.setAttribute('data-chatbot-id', '716f8b0b-7008-403f-876b-ecab719aee02');

    script.async = true;

    document.body.appendChild(script);

    return () => {

      document.body.removeChild(script);

    };

  }, []);

  return null;

}
 