/**
 * Haptic Feedback Utilities
 * Provides vibration feedback on mobile devices
 */

// Check if vibration API is available
const isVibrationSupported = (): boolean => {
  return 'vibrate' in navigator;
};

/**
 * Light haptic feedback for subtle interactions
 * Duration: 10ms
 */
export const hapticLight = (): void => {
  if (isVibrationSupported()) {
    navigator.vibrate(10);
  }
};

/**
 * Medium haptic feedback for standard interactions
 * Duration: 20ms
 */
export const hapticMedium = (): void => {
  if (isVibrationSupported()) {
    navigator.vibrate(20);
  }
};

/**
 * Heavy haptic feedback for important actions
 * Duration: 30ms
 */
export const hapticHeavy = (): void => {
  if (isVibrationSupported()) {
    navigator.vibrate(30);
  }
};

/**
 * Success haptic pattern
 * Two short vibrations
 */
export const hapticSuccess = (): void => {
  if (isVibrationSupported()) {
    navigator.vibrate([15, 50, 15]);
  }
};

/**
 * Error haptic pattern
 * Three short vibrations
 */
export const hapticError = (): void => {
  if (isVibrationSupported()) {
    navigator.vibrate([20, 50, 20, 50, 20]);
  }
};

/**
 * Selection haptic feedback
 * Single very light vibration
 */
export const hapticSelection = (): void => {
  if (isVibrationSupported()) {
    navigator.vibrate(5);
  }
};

/**
 * Impact haptic feedback for swipe actions
 * Strong single vibration
 */
export const hapticImpact = (): void => {
  if (isVibrationSupported()) {
    navigator.vibrate(40);
  }
};

/**
 * Cancel any ongoing vibration
 */
export const hapticCancel = (): void => {
  if (isVibrationSupported()) {
    navigator.vibrate(0);
  }
};
