import React, { createContext, useContext, useState, useEffect } from 'react';

type AccessibilityContextType = {
  highContrast: boolean;
  toggleHighContrast: () => void;
  textSize: 'normal' | 'large' | 'x-large';
  setTextSize: (size: 'normal' | 'large' | 'x-large') => void;
};

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [highContrast, setHighContrast] = useState<boolean>(() => {
    const saved = localStorage.getItem('highContrast');
    return saved ? JSON.parse(saved) : false;
  });

  const [textSize, setTextSize] = useState<'normal' | 'large' | 'x-large'>(() => {
    const saved = localStorage.getItem('textSize');
    return saved ? JSON.parse(saved) : 'normal';
  });

  useEffect(() => {
    localStorage.setItem('highContrast', JSON.stringify(highContrast));
    document.documentElement.classList.toggle('high-contrast', highContrast);
  }, [highContrast]);

  useEffect(() => {
    localStorage.setItem('textSize', JSON.stringify(textSize));
    document.documentElement.classList.remove('text-normal', 'text-large', 'text-x-large');
    document.documentElement.classList.add(`text-${textSize}`);
  }, [textSize]);

  const toggleHighContrast = () => setHighContrast((prev) => !prev);

  return (
    <AccessibilityContext.Provider
      value={{
        highContrast,
        toggleHighContrast,
        textSize,
        setTextSize,
      }}
    >
      {children}
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = (): AccessibilityContextType => {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error('useAccessibility must be used within an AccessibilityProvider');
  }
  return context;
};
