
import React, { createContext, useContext, useEffect, useState } from 'react';
import { ScreenReaderAnnouncer, useScreenReaderAnnouncer } from '@/components/accessibility/ScreenReaderAnnouncer';
import { SkipNavigation } from '@/components/accessibility/SkipNavigation';

interface AccessibilityContextType {
  announce: (message: string, priority?: 'polite' | 'assertive') => void;
  isReducedMotion: boolean;
  isHighContrast: boolean;
  fontSize: 'normal' | 'large' | 'larger';
  setFontSize: (size: 'normal' | 'large' | 'larger') => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const useAccessibilityContext = () => {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error('useAccessibilityContext must be used within AccessibilityProvider');
  }
  return context;
};

interface AccessibilityProviderProps {
  children: React.ReactNode;
}

export const AccessibilityProvider: React.FC<AccessibilityProviderProps> = ({ children }) => {
  const { message, announce } = useScreenReaderAnnouncer();
  const [isReducedMotion, setIsReducedMotion] = useState(false);
  const [isHighContrast, setIsHighContrast] = useState(false);
  const [fontSize, setFontSize] = useState<'normal' | 'large' | 'larger'>('normal');

  useEffect(() => {
    // Check for reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    setIsReducedMotion(mediaQuery.matches);
    
    const handleChange = () => setIsReducedMotion(mediaQuery.matches);
    mediaQuery.addEventListener('change', handleChange);

    // Check for high contrast preference
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');
    setIsHighContrast(contrastQuery.matches);
    
    const handleContrastChange = () => setIsHighContrast(contrastQuery.matches);
    contrastQuery.addEventListener('change', handleContrastChange);

    // Load saved preferences
    const savedFontSize = localStorage.getItem('accessibility-font-size') as 'normal' | 'large' | 'larger';
    if (savedFontSize) {
      setFontSize(savedFontSize);
    }

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
      contrastQuery.removeEventListener('change', handleContrastChange);
    };
  }, []);

  useEffect(() => {
    // Apply font size to document
    document.documentElement.setAttribute('data-font-size', fontSize);
    localStorage.setItem('accessibility-font-size', fontSize);
  }, [fontSize]);

  useEffect(() => {
    // Add page announcer for route changes
    if (!document.getElementById('page-announcer')) {
      const announcer = document.createElement('div');
      announcer.id = 'page-announcer';
      announcer.setAttribute('aria-live', 'assertive');
      announcer.setAttribute('aria-atomic', 'true');
      announcer.className = 'sr-only';
      document.body.appendChild(announcer);
    }
  }, []);

  const value: AccessibilityContextType = {
    announce,
    isReducedMotion,
    isHighContrast,
    fontSize,
    setFontSize
  };

  return (
    <AccessibilityContext.Provider value={value}>
      <SkipNavigation />
      <ScreenReaderAnnouncer message={message} />
      {children}
    </AccessibilityContext.Provider>
  );
};
