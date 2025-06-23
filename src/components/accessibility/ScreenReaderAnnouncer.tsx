
import React, { useEffect, useRef } from 'react';

interface ScreenReaderAnnouncerProps {
  message: string;
  priority?: 'polite' | 'assertive' | 'off';
  clearOnUnmount?: boolean;
}

export const ScreenReaderAnnouncer: React.FC<ScreenReaderAnnouncerProps> = ({
  message,
  priority = 'polite',
  clearOnUnmount = true
}) => {
  const announcerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (announcerRef.current && message) {
      announcerRef.current.textContent = message;
    }
  }, [message]);

  useEffect(() => {
    return () => {
      if (clearOnUnmount && announcerRef.current) {
        announcerRef.current.textContent = '';
      }
    };
  }, [clearOnUnmount]);

  return (
    <div
      ref={announcerRef}
      aria-live={priority}
      aria-atomic="true"
      className="sr-only"
      role="status"
    />
  );
};

// Hook pour utiliser l'annonceur
export const useScreenReaderAnnouncer = () => {
  const [message, setMessage] = React.useState('');

  const announce = (text: string, priority: 'polite' | 'assertive' = 'polite') => {
    setMessage(''); // Clear first to ensure the message is read
    setTimeout(() => setMessage(text), 10);
  };

  return { message, announce };
};
