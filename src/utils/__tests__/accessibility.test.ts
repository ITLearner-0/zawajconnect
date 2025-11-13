import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  generateAriaId,
  KeyboardKeys,
  isKeyMatch,
  getAccessibleLabel,
  ariaAttributes,
} from '../accessibility';

describe('Accessibility Utilities', () => {
  describe('generateAriaId', () => {
    it('should generate a unique ID with default prefix', () => {
      const id1 = generateAriaId();
      const id2 = generateAriaId();

      expect(id1).toMatch(/^aria-/);
      expect(id2).toMatch(/^aria-/);
      expect(id1).not.toBe(id2);
    });

    it('should generate a unique ID with custom prefix', () => {
      const id = generateAriaId('custom');
      expect(id).toMatch(/^custom-/);
    });

    it('should generate different IDs on each call', () => {
      const ids = new Set();
      for (let i = 0; i < 100; i++) {
        ids.add(generateAriaId());
      }
      expect(ids.size).toBe(100);
    });
  });

  describe('KeyboardKeys', () => {
    it('should have correct key constants', () => {
      expect(KeyboardKeys.ENTER).toBe('Enter');
      expect(KeyboardKeys.SPACE).toBe(' ');
      expect(KeyboardKeys.ESCAPE).toBe('Escape');
      expect(KeyboardKeys.ARROW_UP).toBe('ArrowUp');
      expect(KeyboardKeys.ARROW_DOWN).toBe('ArrowDown');
      expect(KeyboardKeys.TAB).toBe('Tab');
    });
  });

  describe('isKeyMatch', () => {
    it('should return true when key matches', () => {
      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      expect(isKeyMatch(event, 'Enter')).toBe(true);
    });

    it('should return false when key does not match', () => {
      const event = new KeyboardEvent('keydown', { key: 'Enter' });
      expect(isKeyMatch(event, 'Escape')).toBe(false);
    });

    it('should match multiple keys', () => {
      const enterEvent = new KeyboardEvent('keydown', { key: 'Enter' });
      const spaceEvent = new KeyboardEvent('keydown', { key: ' ' });

      expect(isKeyMatch(enterEvent, 'Enter', ' ')).toBe(true);
      expect(isKeyMatch(spaceEvent, 'Enter', ' ')).toBe(true);
    });
  });

  describe('getAccessibleLabel', () => {
    let container: HTMLDivElement;

    beforeEach(() => {
      container = document.createElement('div');
      document.body.appendChild(container);
    });

    afterEach(() => {
      document.body.removeChild(container);
    });

    it('should get label from aria-label', () => {
      const button = document.createElement('button');
      button.setAttribute('aria-label', 'Close dialog');
      container.appendChild(button);

      expect(getAccessibleLabel(button)).toBe('Close dialog');
    });

    it('should get label from aria-labelledby', () => {
      const label = document.createElement('span');
      label.id = 'label-1';
      label.textContent = 'Username';

      const input = document.createElement('input');
      input.setAttribute('aria-labelledby', 'label-1');

      container.appendChild(label);
      container.appendChild(input);

      expect(getAccessibleLabel(input)).toBe('Username');
    });

    it('should get label from associated label element', () => {
      const label = document.createElement('label');
      label.setAttribute('for', 'input-1');
      label.textContent = 'Email';

      const input = document.createElement('input');
      input.id = 'input-1';

      container.appendChild(label);
      container.appendChild(input);

      expect(getAccessibleLabel(input)).toBe('Email');
    });

    it('should return undefined when no label is found', () => {
      const div = document.createElement('div');
      container.appendChild(div);

      expect(getAccessibleLabel(div)).toBeUndefined();
    });
  });

  describe('ariaAttributes', () => {
    describe('button', () => {
      it('should generate button attributes', () => {
        const attrs = ariaAttributes.button('Close');
        expect(attrs).toEqual({
          role: 'button',
          'aria-label': 'Close',
        });
      });

      it('should include pressed state when provided', () => {
        const attrs = ariaAttributes.button('Toggle', true);
        expect(attrs).toEqual({
          role: 'button',
          'aria-label': 'Toggle',
          'aria-pressed': 'true',
        });
      });
    });

    describe('link', () => {
      it('should generate link attributes', () => {
        const attrs = ariaAttributes.link('Home');
        expect(attrs).toEqual({
          role: 'link',
          'aria-label': 'Home',
        });
      });

      it('should indicate external links', () => {
        const attrs = ariaAttributes.link('External Site', true);
        expect(attrs['aria-label']).toContain('opens in new tab');
      });
    });

    describe('dialog', () => {
      it('should generate dialog attributes', () => {
        const attrs = ariaAttributes.dialog('dialog-title');
        expect(attrs).toEqual({
          role: 'dialog',
          'aria-modal': 'true',
          'aria-labelledby': 'dialog-title',
        });
      });

      it('should include describedby when provided', () => {
        const attrs = ariaAttributes.dialog('dialog-title', 'dialog-desc');
        expect(attrs['aria-describedby']).toBe('dialog-desc');
      });
    });

    describe('tab', () => {
      it('should generate tab attributes for selected tab', () => {
        const attrs = ariaAttributes.tab('tab-1', 'panel-1', true);
        expect(attrs).toEqual({
          role: 'tab',
          id: 'tab-1',
          'aria-controls': 'panel-1',
          'aria-selected': 'true',
          tabIndex: 0,
        });
      });

      it('should generate tab attributes for unselected tab', () => {
        const attrs = ariaAttributes.tab('tab-2', 'panel-2', false);
        expect(attrs).toEqual({
          role: 'tab',
          id: 'tab-2',
          'aria-controls': 'panel-2',
          'aria-selected': 'false',
          tabIndex: -1,
        });
      });
    });

    describe('tabPanel', () => {
      it('should generate tab panel attributes', () => {
        const attrs = ariaAttributes.tabPanel('panel-1', 'tab-1', false);
        expect(attrs).toEqual({
          role: 'tabpanel',
          id: 'panel-1',
          'aria-labelledby': 'tab-1',
          hidden: false,
          tabIndex: 0,
        });
      });
    });
  });
});
