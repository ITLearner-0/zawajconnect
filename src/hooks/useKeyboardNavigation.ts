
import { useEffect, useCallback, useRef } from 'react';

interface KeyboardNavigationOptions {
  onEscape?: () => void;
  onEnter?: () => void;
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  onTab?: (shift: boolean) => void;
  trapFocus?: boolean;
  restoreFocus?: boolean;
}

export const useKeyboardNavigation = (
  containerRef: React.RefObject<HTMLElement>,
  options: KeyboardNavigationOptions = {}
) => {
  const previousFocusRef = useRef<HTMLElement | null>(null);

  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) return [];
    
    const selector = [
      'button:not([disabled])',
      '[href]',
      'input:not([disabled])',
      'select:not([disabled])',
      'textarea:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable]'
    ].join(',');
    
    return Array.from(containerRef.current.querySelectorAll(selector)) as HTMLElement[];
  }, [containerRef]);

  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    const { key, shiftKey } = event;
    
    switch (key) {
      case 'Escape':
        if (options.onEscape) {
          event.preventDefault();
          options.onEscape();
        }
        break;
        
      case 'Enter':
        if (options.onEnter) {
          event.preventDefault();
          options.onEnter();
        }
        break;
        
      case 'ArrowUp':
        if (options.onArrowUp) {
          event.preventDefault();
          options.onArrowUp();
        }
        break;
        
      case 'ArrowDown':
        if (options.onArrowDown) {
          event.preventDefault();
          options.onArrowDown();
        }
        break;
        
      case 'ArrowLeft':
        if (options.onArrowLeft) {
          event.preventDefault();
          options.onArrowLeft();
        }
        break;
        
      case 'ArrowRight':
        if (options.onArrowRight) {
          event.preventDefault();
          options.onArrowRight();
        }
        break;
        
      case 'Tab':
        if (options.trapFocus) {
          const focusableElements = getFocusableElements();
          if (focusableElements.length === 0) return;
          
          const firstFocusable = focusableElements[0];
          const lastFocusable = focusableElements[focusableElements.length - 1];
          
          if (shiftKey && document.activeElement === firstFocusable) {
            event.preventDefault();
            lastFocusable.focus();
          } else if (!shiftKey && document.activeElement === lastFocusable) {
            event.preventDefault();
            firstFocusable.focus();
          }
        }
        
        if (options.onTab) {
          options.onTab(shiftKey);
        }
        break;
    }
  }, [options, getFocusableElements]);

  // Store previous focus when component mounts
  useEffect(() => {
    if (options.restoreFocus) {
      previousFocusRef.current = document.activeElement as HTMLElement;
    }
  }, [options.restoreFocus]);

  // Restore focus when component unmounts
  useEffect(() => {
    return () => {
      if (options.restoreFocus && previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
    };
  }, [options.restoreFocus]);

  // Add event listener
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('keydown', handleKeyDown);
    
    return () => {
      container.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown, containerRef]);

  const focusFirst = useCallback(() => {
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  }, [getFocusableElements]);

  const focusLast = useCallback(() => {
    const focusableElements = getFocusableElements();
    if (focusableElements.length > 0) {
      focusableElements[focusableElements.length - 1].focus();
    }
  }, [getFocusableElements]);

  return {
    focusFirst,
    focusLast,
    getFocusableElements
  };
};
