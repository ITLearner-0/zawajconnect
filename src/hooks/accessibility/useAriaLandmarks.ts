
import { useEffect } from 'react';

interface AriaLandmark {
  role: string;
  label: string;
  element: HTMLElement;
}

export const useAriaLandmarks = () => {
  useEffect(() => {
    // Automatically add navigation landmarks
    const nav = document.querySelector('nav');
    if (nav && !nav.getAttribute('aria-label')) {
      nav.setAttribute('aria-label', 'Navigation principale');
    }

    const main = document.querySelector('main');
    if (main && !main.getAttribute('aria-label')) {
      main.setAttribute('aria-label', 'Contenu principal');
    }

    const header = document.querySelector('header');
    if (header && !header.getAttribute('aria-label')) {
      header.setAttribute('aria-label', 'En-tête de page');
    }

    const footer = document.querySelector('footer');
    if (footer && !footer.getAttribute('aria-label')) {
      footer.setAttribute('aria-label', 'Pied de page');
    }
  }, []);

  const announcePageChange = (pageTitle: string) => {
    const announcement = `Navigation vers ${pageTitle}`;
    const announcer = document.getElementById('page-announcer');
    if (announcer) {
      announcer.textContent = announcement;
    }
  };

  return { announcePageChange };
};
