/**
 * Accessibility utilities for WCAG 2.1 compliance
 * These helpers make it easier to build accessible interfaces
 */

/**
 * Generate a unique ID for ARIA relationships
 * @param prefix - Optional prefix for the ID
 */
export const generateAriaId = (prefix: string = 'aria'): string => {
  return `${prefix}-${Math.random().toString(36).substr(2, 9)}`;
};

/**
 * ARIA live region announcer for screen readers
 * Announces dynamic content changes without moving focus
 */
export class LiveRegionAnnouncer {
  private static instance: LiveRegionAnnouncer | undefined;
  private liveRegion: HTMLDivElement | undefined;

  private constructor() {
    this.createLiveRegion();
  }

  static getInstance(): LiveRegionAnnouncer {
    if (!LiveRegionAnnouncer.instance) {
      LiveRegionAnnouncer.instance = new LiveRegionAnnouncer();
    }
    return LiveRegionAnnouncer.instance;
  }

  private createLiveRegion(): void {
    if (typeof window === 'undefined') return;

    this.liveRegion = document.createElement('div');
    this.liveRegion.setAttribute('role', 'status');
    this.liveRegion.setAttribute('aria-live', 'polite');
    this.liveRegion.setAttribute('aria-atomic', 'true');
    this.liveRegion.className = 'sr-only'; // Screen reader only
    this.liveRegion.style.cssText = `
      position: absolute;
      left: -10000px;
      width: 1px;
      height: 1px;
      overflow: hidden;
    `;
    document.body.appendChild(this.liveRegion);
  }

  /**
   * Announce a message to screen readers
   * @param message - The message to announce
   * @param priority - 'polite' (default) or 'assertive'
   */
  announce(message: string, priority: 'polite' | 'assertive' = 'polite'): void {
    if (!this.liveRegion) return;

    this.liveRegion.setAttribute('aria-live', priority);
    this.liveRegion.textContent = message;

    // Clear after announcement
    setTimeout(() => {
      if (this.liveRegion) {
        this.liveRegion.textContent = '';
      }
    }, 1000);
  }
}

/**
 * Helper to announce messages to screen readers
 */
export const announce = (message: string, priority?: 'polite' | 'assertive'): void => {
  LiveRegionAnnouncer.getInstance().announce(message, priority);
};

/**
 * Focus trap utility for modals and dialogs
 */
export class FocusTrap {
  private element: HTMLElement;
  private firstFocusableElement: HTMLElement | undefined;
  private lastFocusableElement: HTMLElement | undefined;
  private previousActiveElement: Element | undefined;

  constructor(element: HTMLElement) {
    this.element = element;
    this.updateFocusableElements();
  }

  private updateFocusableElements(): void {
    const focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
    ].join(',');

    const focusableElements = this.element.querySelectorAll<HTMLElement>(focusableSelectors);
    this.firstFocusableElement = focusableElements[0] ?? undefined;
    this.lastFocusableElement = focusableElements[focusableElements.length - 1] ?? undefined;
  }

  activate(): void {
    this.previousActiveElement = document.activeElement ?? undefined;
    this.element.addEventListener('keydown', this.handleKeydown);

    // Focus first element
    if (this.firstFocusableElement) {
      this.firstFocusableElement.focus();
    }
  }

  deactivate(): void {
    this.element.removeEventListener('keydown', this.handleKeydown);

    // Restore previous focus
    if (this.previousActiveElement instanceof HTMLElement) {
      this.previousActiveElement.focus();
    }
  }

  private handleKeydown = (event: KeyboardEvent): void => {
    if (event.key !== 'Tab') return;

    if (event.shiftKey) {
      // Shift + Tab
      if (document.activeElement === this.firstFocusableElement) {
        event.preventDefault();
        this.lastFocusableElement?.focus();
      }
    } else {
      // Tab
      if (document.activeElement === this.lastFocusableElement) {
        event.preventDefault();
        this.firstFocusableElement?.focus();
      }
    }
  };
}

/**
 * Check if an element is visible to screen readers
 */
export const isAriaHidden = (element: HTMLElement): boolean => {
  return element.getAttribute('aria-hidden') === 'true';
};

/**
 * Get accessible label for an element
 */
export const getAccessibleLabel = (element: HTMLElement): string | undefined => {
  // Check aria-label
  const ariaLabel = element.getAttribute('aria-label');
  if (ariaLabel) return ariaLabel;

  // Check aria-labelledby
  const labelledBy = element.getAttribute('aria-labelledby');
  if (labelledBy) {
    const labelElement = document.getElementById(labelledBy);
    if (labelElement) return labelElement.textContent?.trim() ?? undefined;
  }

  // Check associated label
  if (element.id) {
    const label = document.querySelector(`label[for="${element.id}"]`);
    if (label) return label.textContent?.trim() ?? undefined;
  }

  // Check parent label
  const parentLabel = element.closest('label');
  if (parentLabel) return parentLabel.textContent?.trim() ?? undefined;

  return undefined;
};

/**
 * Keyboard navigation helpers
 */
export const KeyboardKeys = {
  ENTER: 'Enter',
  SPACE: ' ',
  ESCAPE: 'Escape',
  ARROW_UP: 'ArrowUp',
  ARROW_DOWN: 'ArrowDown',
  ARROW_LEFT: 'ArrowLeft',
  ARROW_RIGHT: 'ArrowRight',
  TAB: 'Tab',
  HOME: 'Home',
  END: 'End',
} as const;

/**
 * Check if event key matches any of the provided keys
 */
export const isKeyMatch = (event: KeyboardEvent, ...keys: string[]): boolean => {
  return keys.includes(event.key);
};

/**
 * Roving tabindex manager for composite widgets
 */
export class RovingTabIndex {
  private items: HTMLElement[] = [];
  private currentIndex: number = 0;

  constructor(items: HTMLElement[]) {
    this.items = items;
    this.initialize();
  }

  private initialize(): void {
    this.items.forEach((item, index) => {
      item.setAttribute('tabindex', index === 0 ? '0' : '-1');
      item.addEventListener('keydown', (e) => this.handleKeyDown(e, index));
      item.addEventListener('focus', () => this.setCurrentIndex(index));
    });
  }

  private handleKeyDown(event: KeyboardEvent, index: number): void {
    let newIndex = index;

    switch (event.key) {
      case KeyboardKeys.ARROW_DOWN:
      case KeyboardKeys.ARROW_RIGHT:
        event.preventDefault();
        newIndex = (index + 1) % this.items.length;
        break;
      case KeyboardKeys.ARROW_UP:
      case KeyboardKeys.ARROW_LEFT:
        event.preventDefault();
        newIndex = (index - 1 + this.items.length) % this.items.length;
        break;
      case KeyboardKeys.HOME:
        event.preventDefault();
        newIndex = 0;
        break;
      case KeyboardKeys.END:
        event.preventDefault();
        newIndex = this.items.length - 1;
        break;
      default:
        return;
    }

    this.setCurrentIndex(newIndex);
    this.items[newIndex]?.focus();
  }

  private setCurrentIndex(index: number): void {
    this.items[this.currentIndex]?.setAttribute('tabindex', '-1');
    this.currentIndex = index;
    this.items[this.currentIndex]?.setAttribute('tabindex', '0');
  }

  updateItems(items: HTMLElement[]): void {
    this.items = items;
    this.currentIndex = 0;
    this.initialize();
  }
}

/**
 * Visually hidden but accessible to screen readers
 */
export const visuallyHiddenStyles = {
  position: 'absolute' as const,
  width: '1px',
  height: '1px',
  padding: '0',
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap' as const,
  borderWidth: '0',
};

/**
 * Generate ARIA attributes for common patterns
 */
export const ariaAttributes = {
  button: (label: string, pressed?: boolean) => ({
    role: 'button',
    'aria-label': label,
    ...(pressed !== undefined && { 'aria-pressed': pressed.toString() }),
  }),

  link: (label: string, external?: boolean) => ({
    role: 'link',
    'aria-label': label,
    ...(external && { 'aria-label': `${label} (opens in new tab)` }),
  }),

  dialog: (labelId: string, describedById?: string) => ({
    role: 'dialog',
    'aria-modal': 'true',
    'aria-labelledby': labelId,
    ...(describedById && { 'aria-describedby': describedById }),
  }),

  menu: (labelId: string) => ({
    role: 'menu',
    'aria-labelledby': labelId,
  }),

  menuItem: () => ({
    role: 'menuitem',
  }),

  tab: (id: string, panelId: string, selected: boolean) => ({
    role: 'tab',
    id,
    'aria-controls': panelId,
    'aria-selected': selected.toString(),
    tabIndex: selected ? 0 : -1,
  }),

  tabPanel: (id: string, tabId: string, hidden: boolean) => ({
    role: 'tabpanel',
    id,
    'aria-labelledby': tabId,
    hidden,
    tabIndex: 0,
  }),
};
