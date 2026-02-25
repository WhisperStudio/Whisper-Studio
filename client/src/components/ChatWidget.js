// Install the widget in your React/Next.js app
import { useEffect } from 'react';

export function ChatWidget() {
  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://chat.vintrastudio.com/api/widget.js';
    script.setAttribute('data-chatbot-id', 'c8ff5b94-0dab-410b-8ace-4dca493be798');
    script.async = true;
    document.body.appendChild(script);

    const forceZIndexLow = () => {
      const nodes = document.querySelectorAll('[data-chatbot-id], [data-chatbot-id] *');
      nodes.forEach((n) => {
        if (n instanceof HTMLElement) {
          n.style.zIndex = '900';
        }
      });
    };

    const isModalOpen = () => {
      return Boolean(document.querySelector('[data-artwork-modal="true"], [data-vintra-modal="true"]'));
    };

    let lastModalState = false;
    let timeoutId = null;

    const checkAndApply = () => {
      const modalOpen = isModalOpen();
      if (modalOpen !== lastModalState) {
        lastModalState = modalOpen;
        if (modalOpen) {
          forceZIndexLow();
          document.body.setAttribute('data-artwork-modal-open', 'true');
        } else {
          document.body.removeAttribute('data-artwork-modal-open');
        }
      }
    };

    const throttledCheck = () => {
      if (timeoutId) clearTimeout(timeoutId);
      timeoutId = setTimeout(checkAndApply, 32);
    };

    const observer = new MutationObserver((mutations) => {
      const relevant = mutations.some(m => 
        m.type === 'childList' && 
        (Array.from(m.addedNodes).some(n => n.nodeType === 1 && (
          n.hasAttribute?.('data-artwork-modal') || 
          n.hasAttribute?.('data-vintra-modal') ||
          n.querySelector?.('[data-artwork-modal="true"], [data-vintra-modal="true"]')
        )))
      );
      if (relevant) throttledCheck();
    });

    observer.observe(document.body, { childList: true, subtree: false, attributes: false });

    return () => {
      observer.disconnect();
      document.body.removeChild(script);
    };
  }, []);

  return null;
}