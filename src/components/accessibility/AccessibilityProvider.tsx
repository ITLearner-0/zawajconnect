
import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { toast } from "sonner";

type FontSize = "small" | "normal" | "large" | "x-large";
type Theme = "light" | "dark" | "high-contrast";
type MotionPreference = "no-preference" | "reduce";

interface AccessibilityContextType {
  // Visual
  fontSize: FontSize;
  setFontSize: (size: FontSize) => void;
  theme: Theme;
  setTheme: (theme: Theme) => void;
  highContrast: boolean;
  toggleHighContrast: () => void;
  
  // Motion
  reduceMotion: boolean;
  toggleReduceMotion: () => void;
  
  // Screen reader
  announceMessage: (message: string) => void;
  
  // Keyboard navigation
  focusRingVisible: boolean;
  setFocusRingVisible: (visible: boolean) => void;
  
  // Language
  language: "fr" | "en";
  setLanguage: (lang: "fr" | "en") => void;
}

const AccessibilityContext = createContext<AccessibilityContextType | undefined>(undefined);

export const AccessibilityProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [fontSize, setFontSizeState] = useState<FontSize>(() => {
    const saved = localStorage.getItem("accessibility-fontSize");
    return (saved as FontSize) || "normal";
  });

  const [theme, setThemeState] = useState<Theme>(() => {
    const saved = localStorage.getItem("accessibility-theme");
    return (saved as Theme) || "light";
  });

  const [highContrast, setHighContrast] = useState<boolean>(() => {
    const saved = localStorage.getItem("accessibility-highContrast");
    return saved ? JSON.parse(saved) : false;
  });

  const [reduceMotion, setReduceMotion] = useState<boolean>(() => {
    const saved = localStorage.getItem("accessibility-reduceMotion");
    if (saved) return JSON.parse(saved);
    
    // Check system preference
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  });

  const [focusRingVisible, setFocusRingVisible] = useState<boolean>(false);
  
  const [language, setLanguageState] = useState<"fr" | "en">(() => {
    const saved = localStorage.getItem("accessibility-language");
    return (saved as "fr" | "en") || "fr";
  });

  // Announcement region for screen readers
  const [announcements, setAnnouncements] = useState<string[]>([]);

  // Apply font size
  useEffect(() => {
    localStorage.setItem("accessibility-fontSize", fontSize);
    document.documentElement.setAttribute("data-font-size", fontSize);
    
    const fontSizeMap = {
      small: "14px",
      normal: "16px",
      large: "18px",
      "x-large": "20px"
    };
    
    document.documentElement.style.fontSize = fontSizeMap[fontSize];
  }, [fontSize]);

  // Apply theme
  useEffect(() => {
    localStorage.setItem("accessibility-theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
    
    if (theme === "high-contrast") {
      document.documentElement.classList.add("high-contrast");
    } else {
      document.documentElement.classList.remove("high-contrast");
    }
  }, [theme]);

  // Apply high contrast
  useEffect(() => {
    localStorage.setItem("accessibility-highContrast", JSON.stringify(highContrast));
    document.documentElement.classList.toggle("high-contrast", highContrast);
  }, [highContrast]);

  // Apply reduced motion
  useEffect(() => {
    localStorage.setItem("accessibility-reduceMotion", JSON.stringify(reduceMotion));
    document.documentElement.classList.toggle("reduce-motion", reduceMotion);
  }, [reduceMotion]);

  // Apply language
  useEffect(() => {
    localStorage.setItem("accessibility-language", language);
    document.documentElement.lang = language;
  }, [language]);

  // Focus ring visibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Tab") {
        setFocusRingVisible(true);
      }
    };

    const handleMouseDown = () => {
      setFocusRingVisible(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleMouseDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleMouseDown);
    };
  }, []);

  const setFontSize = useCallback((size: FontSize) => {
    setFontSizeState(size);
    toast.success(`Taille de police changée vers ${size}`, {
      duration: 2000
    });
  }, []);

  const setTheme = useCallback((newTheme: Theme) => {
    setThemeState(newTheme);
    toast.success(`Thème changé vers ${newTheme}`, {
      duration: 2000
    });
  }, []);

  const toggleHighContrast = useCallback(() => {
    const newValue = !highContrast;
    setHighContrast(newValue);
    toast.success(newValue ? "Contraste élevé activé" : "Contraste élevé désactivé", {
      duration: 2000
    });
  }, [highContrast]);

  const toggleReduceMotion = useCallback(() => {
    const newValue = !reduceMotion;
    setReduceMotion(newValue);
    toast.success(newValue ? "Animation réduite activée" : "Animation réduite désactivée", {
      duration: 2000
    });
  }, [reduceMotion]);

  const announceMessage = useCallback((message: string) => {
    setAnnouncements(prev => [...prev, message]);
    
    // Clear announcement after a delay
    setTimeout(() => {
      setAnnouncements(prev => prev.slice(1));
    }, 1000);
  }, []);

  const setLanguage = useCallback((lang: "fr" | "en") => {
    setLanguageState(lang);
    toast.success(`Langue changée vers ${lang === "fr" ? "Français" : "English"}`, {
      duration: 2000
    });
  }, []);

  return (
    <AccessibilityContext.Provider
      value={{
        fontSize,
        setFontSize,
        theme,
        setTheme,
        highContrast,
        toggleHighContrast,
        reduceMotion,
        toggleReduceMotion,
        announceMessage,
        focusRingVisible,
        setFocusRingVisible,
        language,
        setLanguage
      }}
    >
      {children}
      
      {/* Screen reader announcements */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="sr-only"
        role="status"
      >
        {announcements.map((announcement, index) => (
          <div key={index}>{announcement}</div>
        ))}
      </div>
      
      {/* Skip to main content link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50 focus:bg-rose-600 focus:text-white focus:px-4 focus:py-2 focus:rounded-md"
      >
        Aller au contenu principal
      </a>
    </AccessibilityContext.Provider>
  );
};

export const useAccessibility = (): AccessibilityContextType => {
  const context = useContext(AccessibilityContext);
  if (context === undefined) {
    throw new Error("useAccessibility must be used within an AccessibilityProvider");
  }
  return context;
};
