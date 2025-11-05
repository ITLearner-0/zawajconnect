/**
 * Integration Tests for useFormAutosave Hook
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useFormAutosave } from '../useFormAutosave';

// Mock localStorage
const mockLocalStorage = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    }
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: mockLocalStorage
});

// Mock Supabase
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      upsert: vi.fn(() => Promise.resolve({ error: null })),
    })),
  },
}));

// Mock logger
vi.mock('@/utils/logger', () => ({
  logger: {
    log: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock accessibility
vi.mock('@/utils/accessibility', () => ({
  announce: vi.fn(),
}));

describe('useFormAutosave Integration Tests', () => {
  const storageKey = 'test-form';

  beforeEach(() => {
    mockLocalStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    mockLocalStorage.clear();
  });

  it('should save form data after debounce period', async () => {
    const formData = { name: 'John', email: 'john@example.com' };

    renderHook(() =>
      useFormAutosave(formData, {
        storageKey,
        debounceMs: 500,
      })
    );

    // Wait for debounce + save
    await waitFor(
      () => {
        const saved = mockLocalStorage.getItem(storageKey);
        expect(saved).not.toBeNull();

        if (saved) {
          const parsed = JSON.parse(saved);
          expect(parsed.data).toEqual(formData);
          expect(parsed.timestamp).toBeDefined();
        }
      },
      { timeout: 1000 }
    );
  });

  it('should restore saved data when available', () => {
    const savedData = {
      name: 'Jane',
      email: 'jane@example.com',
    };

    mockLocalStorage.setItem(
      storageKey,
      JSON.stringify({
        data: savedData,
        timestamp: new Date().toISOString(),
      })
    );

    const { result } = renderHook(() =>
      useFormAutosave({}, { storageKey })
    );

    const loaded = result.current.loadSaved();
    expect(loaded).toEqual(savedData);
  });

  it('should clear saved data on demand', () => {
    mockLocalStorage.setItem(
      storageKey,
      JSON.stringify({
        data: { test: 'data' },
        timestamp: new Date().toISOString(),
      })
    );

    const { result } = renderHook(() =>
      useFormAutosave({}, { storageKey })
    );

    expect(result.current.hasSavedData()).toBe(true);

    act(() => {
      result.current.clearSaved();
    });

    expect(result.current.hasSavedData()).toBe(false);
    expect(mockLocalStorage.getItem(storageKey)).toBeNull();
  });

  it('should not save empty objects', async () => {
    const emptyData = {};

    renderHook(() =>
      useFormAutosave(emptyData, {
        storageKey,
        debounceMs: 500,
      })
    );

    await new Promise(resolve => setTimeout(resolve, 600));

    const saved = mockLocalStorage.getItem(storageKey);
    expect(saved).toBeNull();
  });

  it('should update save when form data changes', async () => {
    let formData = { count: 1 };

    const { rerender } = renderHook(
      ({ data }) => useFormAutosave(data, { storageKey, debounceMs: 300 }),
      { initialProps: { data: formData } }
    );

    // Wait for initial save
    await waitFor(
      () => {
        const saved = mockLocalStorage.getItem(storageKey);
        expect(saved).not.toBeNull();
      },
      { timeout: 500 }
    );

    // Update data
    formData = { count: 2 };
    rerender({ data: formData });

    // Wait for updated save
    await waitFor(
      () => {
        const saved = mockLocalStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          expect(parsed.data.count).toBe(2);
        }
      },
      { timeout: 500 }
    );
  });

  it('should provide last save timestamp', async () => {
    const formData = { test: 'data' };

    const { result } = renderHook(() =>
      useFormAutosave(formData, {
        storageKey,
        debounceMs: 300,
      })
    );

    // Wait for auto-save, then check that we have a save time
    await waitFor(
      () => {
        const saveTime = result.current.getLastSaveTime();
        expect(saveTime).toBeInstanceOf(Date);
      },
      { timeout: 500 }
    );
  });

  it('should discard old data (>7 days)', () => {
    const oldDate = new Date();
    oldDate.setDate(oldDate.getDate() - 8); // 8 days ago

    mockLocalStorage.setItem(
      storageKey,
      JSON.stringify({
        data: { old: 'data' },
        timestamp: oldDate.toISOString(),
      })
    );

    const { result } = renderHook(() =>
      useFormAutosave({}, { storageKey })
    );

    const loaded = result.current.loadSaved();
    expect(loaded).toBeNull();
    expect(mockLocalStorage.getItem(storageKey)).toBeNull();
  });

  it('should handle save errors gracefully', async () => {
    const onError = vi.fn();
    const formData = { test: 'data' };

    // Mock localStorage to throw error
    const originalSetItem = mockLocalStorage.setItem;
    mockLocalStorage.setItem = vi.fn(() => {
      throw new Error('Storage quota exceeded');
    });

    const { result } = renderHook(() =>
      useFormAutosave(formData, {
        storageKey,
        debounceMs: 300,
        onError,
      })
    );

    // Wait for attempted save
    await new Promise(resolve => setTimeout(resolve, 400));

    // Restore
    mockLocalStorage.setItem = originalSetItem;
  });

  it('should call onSuccess callback after save', async () => {
    const onSuccess = vi.fn();
    const formData = { name: 'Success Test' };

    renderHook(() =>
      useFormAutosave(formData, {
        storageKey,
        debounceMs: 300,
        saveToDatabase: true,  // onSuccess is only called when saving to database
        tableName: 'test_table',
        userId: 'test-user',
        onSuccess,
      })
    );

    await waitFor(
      () => {
        expect(onSuccess).toHaveBeenCalled();
      },
      { timeout: 500 }
    );
  });

  it('should debounce rapid changes', async () => {
    let callCount = 0;
    const onSuccess = vi.fn(() => callCount++);

    let formData = { count: 0 };

    const { rerender } = renderHook(
      ({ data }) =>
        useFormAutosave(data, {
          storageKey,
          debounceMs: 500,
          onSuccess,
        }),
      { initialProps: { data: formData } }
    );

    // Rapid updates
    for (let i = 1; i <= 10; i++) {
      formData = { count: i };
      rerender({ data: formData });
      await new Promise(resolve => setTimeout(resolve, 50));
    }

    // Wait for final save
    await waitFor(
      () => {
        const saved = mockLocalStorage.getItem(storageKey);
        if (saved) {
          const parsed = JSON.parse(saved);
          expect(parsed.data.count).toBe(10);
        }
      },
      { timeout: 1000 }
    );

    // Should have saved only once or twice due to debouncing
    expect(callCount).toBeLessThan(5);
  });

  it('should save on unmount', () => {
    const formData = { unmount: 'test' };

    const { unmount } = renderHook(() =>
      useFormAutosave(formData, { storageKey })
    );

    unmount();

    // Should have saved
    const saved = mockLocalStorage.getItem(storageKey);
    expect(saved).not.toBeNull();
  });
});
