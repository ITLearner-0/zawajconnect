import { useEffect, useCallback, useState } from 'react';

interface KeyboardNavigationOptions {
  onNextStep: () => void;
  onPrevStep: () => void;
  canGoNext: boolean;
  canGoPrev: boolean;
  currentStep: number;
  totalSteps: number;
}

export const useOnboardingKeyboardNavigation = ({
  onNextStep,
  onPrevStep,
  canGoNext,
  canGoPrev,
  currentStep,
  totalSteps,
}: KeyboardNavigationOptions) => {
  const [showHelp, setShowHelp] = useState(false);

  const toggleHelp = useCallback(() => {
    setShowHelp((prev) => !prev);
  }, []);

  const closeHelp = useCallback(() => {
    setShowHelp(false);
  }, []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ignore if user is typing in an input/textarea
      const target = event.target as HTMLElement;
      const isInputField =
        target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      // Show help panel with '?' or Shift+/ (which produces '?')
      if (event.key === '?' && !isInputField) {
        event.preventDefault();
        toggleHelp();
        return;
      }

      // Close help with Escape
      if (event.key === 'Escape' && showHelp) {
        event.preventDefault();
        closeHelp();
        return;
      }

      // Don't handle other shortcuts when typing
      if (isInputField) return;

      // Ctrl/Cmd + Arrow Right: Next step
      if ((event.ctrlKey || event.metaKey) && event.key === 'ArrowRight') {
        event.preventDefault();
        if (canGoNext) {
          onNextStep();
        }
        return;
      }

      // Ctrl/Cmd + Arrow Left: Previous step
      if ((event.ctrlKey || event.metaKey) && event.key === 'ArrowLeft') {
        event.preventDefault();
        if (canGoPrev) {
          onPrevStep();
        }
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onNextStep, onPrevStep, canGoNext, canGoPrev, showHelp, toggleHelp, closeHelp]);

  return {
    showHelp,
    toggleHelp,
    closeHelp,
  };
};
