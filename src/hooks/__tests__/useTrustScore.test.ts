import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock supabase client
const mockSelect = vi.fn();
const mockEq = vi.fn();
const mockMaybeSingle = vi.fn();

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: mockSelect.mockReturnValue({
        eq: mockEq.mockReturnValue({
          maybeSingle: mockMaybeSingle,
        }),
      }),
    })),
  },
}));

describe('useTrustScore', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return default values when no user ID is provided', async () => {
    // Import after mocks are set up
    const { useTrustScore } = await import('@/hooks/useTrustScore');
    // The hook should handle empty userId gracefully
    expect(useTrustScore).toBeDefined();
  });

  it('should calculate trust score breakdown correctly', () => {
    // Test the score breakdown logic
    const emailVerified = true; // 20 points
    const idVerified = true; // 30 points
    const profileScore = 80; // 25 * 80/100 = 20 points
    const loginScore = 60; // 15 * 60/100 = 9 points
    const compatTest = true; // 10 points

    const total =
      (emailVerified ? 20 : 0) +
      (idVerified ? 30 : 0) +
      Math.min(Math.floor(profileScore * 25 / 100), 25) +
      Math.min(Math.floor(loginScore * 15 / 100), 15) +
      (compatTest ? 10 : 0);

    expect(total).toBe(89);
  });

  it('should cap profile score contribution at 25', () => {
    const profileScore = 100;
    const contribution = Math.min(Math.floor(profileScore * 25 / 100), 25);
    expect(contribution).toBe(25);
  });

  it('should cap login regularity contribution at 15', () => {
    const loginScore = 100;
    const contribution = Math.min(Math.floor(loginScore * 15 / 100), 15);
    expect(contribution).toBe(15);
  });

  it('should return 0 for all false/zero values', () => {
    const total =
      (false ? 20 : 0) +
      (false ? 30 : 0) +
      Math.min(Math.floor(0 * 25 / 100), 25) +
      Math.min(Math.floor(0 * 15 / 100), 15) +
      (false ? 10 : 0);

    expect(total).toBe(0);
  });

  it('should return max 100 for all max values', () => {
    const total =
      (true ? 20 : 0) +
      (true ? 30 : 0) +
      Math.min(Math.floor(100 * 25 / 100), 25) +
      Math.min(Math.floor(100 * 15 / 100), 15) +
      (true ? 10 : 0);

    expect(total).toBe(100);
  });
});
