import { useEffect, useRef, RefObject } from 'react';

export interface TouchGestureHandlers {
  onSwipeUp?: () => void;
  onSwipeDown?: () => void;
  onSwipeLeft?: () => void;
  onSwipeRight?: () => void;
  onDoubleTap?: () => void;
  onPinch?: (scale: number) => void;
  onLongPress?: () => void;
}

interface TouchPoint {
  x: number;
  y: number;
  timestamp: number;
}

/**
 * Hook to handle touch gestures on mobile devices
 * Supports: swipe (up/down/left/right), double-tap, pinch-to-zoom, long-press
 */
export function useTouchGestures(
  elementRef: RefObject<HTMLElement>,
  handlers: TouchGestureHandlers
) {
  const touchStartRef = useRef<TouchPoint | null>(null);
  const lastTapRef = useRef<number>(0);
  const longPressTimerRef = useRef<NodeJS.Timeout | null>(null);
  const initialDistanceRef = useRef<number>(0);

  useEffect(() => {
    const element = elementRef.current;
    if (!element) return;

    const handleTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 0) return;

      const firstTouch = e.touches[0];
      if (!firstTouch) return;

      const now = Date.now();

      touchStartRef.current = {
        x: firstTouch.clientX,
        y: firstTouch.clientY,
        timestamp: now,
      };

      // Handle double tap
      if (handlers.onDoubleTap) {
        const timeSinceLastTap = now - lastTapRef.current;
        if (timeSinceLastTap < 300 && timeSinceLastTap > 0) {
          handlers.onDoubleTap();
          lastTapRef.current = 0; // Reset to prevent triple tap
        } else {
          lastTapRef.current = now;
        }
      }

      // Handle long press
      if (handlers.onLongPress) {
        longPressTimerRef.current = setTimeout(() => {
          handlers.onLongPress!();
        }, 500);
      }

      // Handle pinch gesture initialization
      if (e.touches.length === 2 && handlers.onPinch) {
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        if (touch1 && touch2) {
          const distance = Math.hypot(
            touch2.clientX - touch1.clientX,
            touch2.clientY - touch1.clientY
          );
          initialDistanceRef.current = distance;
        }
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      // Clear long press timer on move
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }

      // Handle pinch gesture
      if (e.touches.length === 2 && handlers.onPinch && initialDistanceRef.current > 0) {
        e.preventDefault(); // Prevent default zoom
        const touch1 = e.touches[0];
        const touch2 = e.touches[1];
        if (touch1 && touch2) {
          const currentDistance = Math.hypot(
            touch2.clientX - touch1.clientX,
            touch2.clientY - touch1.clientY
          );
          const scale = currentDistance / initialDistanceRef.current;
          handlers.onPinch(scale);
        }
      }
    };

    const handleTouchEnd = (e: TouchEvent) => {
      // Clear long press timer
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
        longPressTimerRef.current = null;
      }

      if (!touchStartRef.current || e.changedTouches.length === 0) return;

      const endTouch = e.changedTouches[0];
      if (!endTouch) return;

      const deltaX = endTouch.clientX - touchStartRef.current.x;
      const deltaY = endTouch.clientY - touchStartRef.current.y;
      const deltaTime = Date.now() - touchStartRef.current.timestamp;

      // Minimum swipe distance and maximum time for a swipe
      const minSwipeDistance = 50;
      const maxSwipeTime = 300;

      if (deltaTime < maxSwipeTime) {
        const absX = Math.abs(deltaX);
        const absY = Math.abs(deltaY);

        // Horizontal swipe
        if (absX > absY && absX > minSwipeDistance) {
          if (deltaX > 0 && handlers.onSwipeRight) {
            handlers.onSwipeRight();
          } else if (deltaX < 0 && handlers.onSwipeLeft) {
            handlers.onSwipeLeft();
          }
        }
        // Vertical swipe
        else if (absY > absX && absY > minSwipeDistance) {
          if (deltaY > 0 && handlers.onSwipeDown) {
            handlers.onSwipeDown();
          } else if (deltaY < 0 && handlers.onSwipeUp) {
            handlers.onSwipeUp();
          }
        }
      }

      touchStartRef.current = null;
      initialDistanceRef.current = 0;
    };

    // Add event listeners with passive: false to allow preventDefault
    element.addEventListener('touchstart', handleTouchStart, { passive: false });
    element.addEventListener('touchmove', handleTouchMove, { passive: false });
    element.addEventListener('touchend', handleTouchEnd, { passive: false });

    return () => {
      element.removeEventListener('touchstart', handleTouchStart);
      element.removeEventListener('touchmove', handleTouchMove);
      element.removeEventListener('touchend', handleTouchEnd);
      if (longPressTimerRef.current) {
        clearTimeout(longPressTimerRef.current);
      }
    };
  }, [elementRef, handlers]);
}
