import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNavigationAnalytics } from '@/hooks/useNavigationAnalytics';

interface KeyboardShortcut {
  key: string;
  ctrlKey?: boolean;
  altKey?: boolean;
  metaKey?: boolean;
  action: (event?: KeyboardEvent) => void;
  description: string;
  category: string;
}

export const useKeyboardShortcuts = () => {
  const navigate = useNavigate();
  const { trackAction } = useNavigationAnalytics();

  const shortcuts: KeyboardShortcut[] = [
    // Navigation shortcuts
    {
      key: 'h',
      altKey: true,
      action: () => {
        navigate('/dashboard');
        trackAction('keyboard_navigation', { shortcut: 'alt+h', destination: '/dashboard' });
      },
      description: 'Aller au tableau de bord',
      category: 'Navigation',
    },
    {
      key: 'p',
      altKey: true,
      action: () => {
        navigate('/enhanced-profile');
        trackAction('keyboard_navigation', { shortcut: 'alt+p', destination: '/enhanced-profile' });
      },
      description: 'Aller au profil',
      category: 'Navigation',
    },
    {
      key: 'b',
      altKey: true,
      action: () => {
        navigate('/browse');
        trackAction('keyboard_navigation', { shortcut: 'alt+b', destination: '/browse' });
      },
      description: 'Découvrir des profils',
      category: 'Navigation',
    },
    {
      key: 'm',
      altKey: true,
      action: () => {
        navigate('/matches');
        trackAction('keyboard_navigation', { shortcut: 'alt+m', destination: '/matches' });
      },
      description: 'Voir mes matches',
      category: 'Navigation',
    },
    {
      key: 'c',
      altKey: true,
      action: () => {
        navigate('/chat');
        trackAction('keyboard_navigation', { shortcut: 'alt+c', destination: '/chat' });
      },
      description: 'Ouvrir les messages',
      category: 'Navigation',
    },
    {
      key: 't',
      altKey: true,
      action: () => {
        navigate('/compatibility-test');
        trackAction('keyboard_navigation', {
          shortcut: 'alt+t',
          destination: '/compatibility-test',
        });
      },
      description: 'Test de compatibilité',
      category: 'Navigation',
    },
    {
      key: 's',
      altKey: true,
      action: () => {
        navigate('/settings');
        trackAction('keyboard_navigation', { shortcut: 'alt+s', destination: '/settings' });
      },
      description: 'Ouvrir les paramètres',
      category: 'Navigation',
    },
    // Browser-like shortcuts
    {
      key: 'r',
      ctrlKey: true,
      action: () => {
        window.location.reload();
        trackAction('keyboard_action', { shortcut: 'ctrl+r', action: 'page_refresh' });
      },
      description: 'Actualiser la page',
      category: 'Actions',
    },
    // Quick actions
    {
      key: '/',
      action: (e?: KeyboardEvent) => {
        e?.preventDefault();
        // Trigger the existing quick navigation instead of custom search
        const quickNavButton = document.querySelector('[data-quick-nav-trigger]') as HTMLElement;
        if (quickNavButton) {
          quickNavButton.click();
          trackAction('keyboard_action', { shortcut: '/', action: 'open_quick_nav' });
        }
      },
      description: 'Navigation rapide',
      category: 'Actions',
    },
    {
      key: 'Escape',
      action: () => {
        // Close any open modals or dialogs
        const closeButtons = document.querySelectorAll(
          '[data-dialog-close], [data-modal-close], button[aria-label*="close"]'
        );
        if (closeButtons.length > 0) {
          (closeButtons[0] as HTMLElement).click();
          trackAction('keyboard_action', { shortcut: 'escape', action: 'close_modal' });
        }
      },
      description: 'Fermer les modales',
      category: 'Actions',
    },
  ];

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Don't trigger shortcuts when typing in inputs
      if (
        event.target instanceof HTMLInputElement ||
        event.target instanceof HTMLTextAreaElement ||
        (event.target as HTMLElement)?.contentEditable === 'true'
      ) {
        // Allow escape to work even in inputs
        if (event.key !== 'Escape') return;
      }

      const matchingShortcut = shortcuts.find((shortcut) => {
        return (
          shortcut.key === event.key &&
          !!shortcut.ctrlKey === event.ctrlKey &&
          !!shortcut.altKey === event.altKey &&
          !!shortcut.metaKey === event.metaKey
        );
      });

      if (matchingShortcut) {
        event.preventDefault();
        matchingShortcut.action(event);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [navigate, trackAction]);

  return {
    shortcuts,
    getShortcutsByCategory: (category: string) => shortcuts.filter((s) => s.category === category),
  };
};
