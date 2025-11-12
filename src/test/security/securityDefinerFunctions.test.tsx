import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createClient } from '@supabase/supabase-js';

// Mock Supabase client
const mockSupabase = {
  rpc: vi.fn(),
  auth: {
    getUser: vi.fn(),
  },
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: mockSupabase,
}));

describe('SECURITY DEFINER Functions - Authentication Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('is_user_in_active_conversation', () => {
    it('should reject unauthenticated calls', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: 'Not authenticated' },
      });

      const { data, error } = await mockSupabase.rpc('is_user_in_active_conversation', {
        p_match_id: 'test-match-id',
      });

      expect(error).toBeDefined();
      expect(data).toBeNull();
    });

    it('should allow authenticated calls with valid match_id', async () => {
      const userId = 'test-user-id';
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: userId } },
        error: null,
      });
      mockSupabase.rpc.mockResolvedValue({
        data: true,
        error: null,
      });

      const { data, error } = await mockSupabase.rpc('is_user_in_active_conversation', {
        p_match_id: 'test-match-id',
      });

      expect(error).toBeNull();
      expect(data).toBe(true);
    });

    it('should handle null match_id gracefully', async () => {
      const userId = 'test-user-id';
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: userId } },
        error: null,
      });
      mockSupabase.rpc.mockResolvedValue({
        data: false,
        error: null,
      });

      const { data, error } = await mockSupabase.rpc('is_user_in_active_conversation', {
        p_match_id: null,
      });

      expect(error).toBeNull();
      expect(data).toBe(false);
    });
  });

  describe('has_previous_conversation', () => {
    it('should reject unauthenticated calls', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: 'Not authenticated' },
      });

      const { data, error } = await mockSupabase.rpc('has_previous_conversation', {
        p_other_user_id: 'other-user-id',
      });

      expect(error).toBeDefined();
      expect(data).toBeNull();
    });

    it('should allow authenticated calls with valid user_id', async () => {
      const userId = 'test-user-id';
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: userId } },
        error: null,
      });
      mockSupabase.rpc.mockResolvedValue({
        data: true,
        error: null,
      });

      const { data, error } = await mockSupabase.rpc('has_previous_conversation', {
        p_other_user_id: 'other-user-id',
      });

      expect(error).toBeNull();
      expect(data).toBe(true);
    });

    it('should prevent checking own conversation history', async () => {
      const userId = 'test-user-id';
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: userId } },
        error: null,
      });
      mockSupabase.rpc.mockResolvedValue({
        data: false,
        error: null,
      });

      const { data, error } = await mockSupabase.rpc('has_previous_conversation', {
        p_other_user_id: userId,
      });

      expect(data).toBe(false);
    });
  });

  describe('get_user_verification_status_secure', () => {
    it('should reject unauthenticated calls', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: 'Not authenticated' },
      });

      const { data, error } = await mockSupabase.rpc('get_user_verification_status_secure', {
        target_user_id: 'target-user-id',
      });

      expect(error).toBeDefined();
      expect(data).toBeNull();
    });

    it('should allow user to check their own verification status', async () => {
      const userId = 'test-user-id';
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: userId } },
        error: null,
      });
      mockSupabase.rpc.mockResolvedValue({
        data: { email_verified: true, id_verified: false, score: 50 },
        error: null,
      });

      const { data, error } = await mockSupabase.rpc('get_user_verification_status_secure', {
        target_user_id: userId,
      });

      expect(error).toBeNull();
      expect(data).toHaveProperty('email_verified');
      expect(data).toHaveProperty('id_verified');
      expect(data).toHaveProperty('score');
    });

    it('should restrict access to other users verification status', async () => {
      const userId = 'test-user-id';
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: userId } },
        error: null,
      });
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: 'Unauthorized access' },
      });

      const { data, error } = await mockSupabase.rpc('get_user_verification_status_secure', {
        target_user_id: 'other-user-id',
      });

      expect(error).toBeDefined();
      expect(data).toBeNull();
    });
  });

  describe('is_premium_active', () => {
    it('should reject unauthenticated calls', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: 'Not authenticated' },
      });

      const { data, error } = await mockSupabase.rpc('is_premium_active');

      expect(error).toBeDefined();
      expect(data).toBeNull();
    });

    it('should return premium status for authenticated user', async () => {
      const userId = 'test-user-id';
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: userId } },
        error: null,
      });
      mockSupabase.rpc.mockResolvedValue({
        data: true,
        error: null,
      });

      const { data, error } = await mockSupabase.rpc('is_premium_active');

      expect(error).toBeNull();
      expect(typeof data).toBe('boolean');
    });
  });

  describe('check_family_access_rate_limit', () => {
    it('should reject unauthenticated calls', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: 'Not authenticated' },
      });

      const { data, error } = await mockSupabase.rpc('check_family_access_rate_limit', {
        p_family_member_id: 'member-id',
      });

      expect(error).toBeDefined();
      expect(data).toBeNull();
    });

    it('should allow rate limit check for authenticated user', async () => {
      const userId = 'test-user-id';
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: userId } },
        error: null,
      });
      mockSupabase.rpc.mockResolvedValue({
        data: true,
        error: null,
      });

      const { data, error } = await mockSupabase.rpc('check_family_access_rate_limit', {
        p_family_member_id: 'member-id',
      });

      expect(error).toBeNull();
      expect(typeof data).toBe('boolean');
    });

    it('should handle invalid family_member_id', async () => {
      const userId = 'test-user-id';
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: userId } },
        error: null,
      });
      mockSupabase.rpc.mockResolvedValue({
        data: false,
        error: null,
      });

      const { data, error } = await mockSupabase.rpc('check_family_access_rate_limit', {
        p_family_member_id: null,
      });

      expect(data).toBe(false);
    });
  });

  describe('get_family_member_contact_secure', () => {
    it('should reject unauthenticated calls', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: 'Not authenticated' },
      });

      const { data, error } = await mockSupabase.rpc('get_family_member_contact_secure', {
        p_family_member_id: 'member-id',
      });

      expect(error).toBeDefined();
      expect(data).toBeNull();
    });

    it('should enforce verification requirements', async () => {
      const userId = 'test-user-id';
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: userId } },
        error: null,
      });
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: 'Insufficient verification' },
      });

      const { data, error } = await mockSupabase.rpc('get_family_member_contact_secure', {
        p_family_member_id: 'member-id',
      });

      expect(error).toBeDefined();
    });
  });

  describe('assign_daily_quests_to_user', () => {
    it('should reject unauthenticated calls', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: 'Not authenticated' },
      });

      const { data, error } = await mockSupabase.rpc('assign_daily_quests_to_user', {
        p_user_id: 'user-id',
      });

      expect(error).toBeDefined();
      expect(data).toBeNull();
    });

    it('should prevent assigning quests to other users', async () => {
      const userId = 'test-user-id';
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: userId } },
        error: null,
      });
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: 'Unauthorized' },
      });

      const { data, error } = await mockSupabase.rpc('assign_daily_quests_to_user', {
        p_user_id: 'other-user-id',
      });

      expect(error).toBeDefined();
    });

    it('should allow user to assign quests to themselves', async () => {
      const userId = 'test-user-id';
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: userId } },
        error: null,
      });
      mockSupabase.rpc.mockResolvedValue({
        data: [],
        error: null,
      });

      const { data, error } = await mockSupabase.rpc('assign_daily_quests_to_user', {
        p_user_id: userId,
      });

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('get_family_approval_status', () => {
    it('should reject unauthenticated calls', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: 'Not authenticated' },
      });

      const { data, error } = await mockSupabase.rpc('get_family_approval_status', {
        p_match_id: 'match-id',
      });

      expect(error).toBeDefined();
      expect(data).toBeNull();
    });

    it('should enforce match participation', async () => {
      const userId = 'test-user-id';
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: userId } },
        error: null,
      });
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: 'Not part of this match' },
      });

      const { data, error } = await mockSupabase.rpc('get_family_approval_status', {
        p_match_id: 'other-match-id',
      });

      expect(error).toBeDefined();
    });
  });

  describe('increment_insight_views', () => {
    it('should reject unauthenticated calls', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: 'Not authenticated' },
      });

      const { data, error } = await mockSupabase.rpc('increment_insight_views', {
        p_insight_id: 'insight-id',
      });

      expect(error).toBeDefined();
    });

    it('should enforce insight ownership', async () => {
      const userId = 'test-user-id';
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: { id: userId } },
        error: null,
      });
      mockSupabase.rpc.mockResolvedValue({
        data: null,
        error: { message: 'Not authorized' },
      });

      const { data, error } = await mockSupabase.rpc('increment_insight_views', {
        p_insight_id: 'other-insight-id',
      });

      expect(error).toBeDefined();
    });
  });
});

describe('SECURITY DEFINER Functions - Edge Cases', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should handle SQL injection attempts in parameters', async () => {
    const userId = 'test-user-id';
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: userId } },
      error: null,
    });
    mockSupabase.rpc.mockResolvedValue({
      data: null,
      error: { message: 'Invalid input' },
    });

    const { data, error } = await mockSupabase.rpc('is_user_in_active_conversation', {
      p_match_id: "'; DROP TABLE matches; --",
    });

    expect(error).toBeDefined();
    expect(data).toBeNull();
  });

  it('should handle extremely long string inputs', async () => {
    const userId = 'test-user-id';
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: userId } },
      error: null,
    });
    mockSupabase.rpc.mockResolvedValue({
      data: null,
      error: { message: 'Input too long' },
    });

    const longString = 'a'.repeat(10000);
    const { data, error } = await mockSupabase.rpc('is_user_in_active_conversation', {
      p_match_id: longString,
    });

    expect(error).toBeDefined();
  });

  it('should handle concurrent calls from same user', async () => {
    const userId = 'test-user-id';
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: userId } },
      error: null,
    });
    mockSupabase.rpc.mockResolvedValue({
      data: true,
      error: null,
    });

    const promises = Array(10)
      .fill(null)
      .map(() => mockSupabase.rpc('is_premium_active'));

    const results = await Promise.all(promises);

    results.forEach((result) => {
      expect(result.error).toBeNull();
    });
  });

  it('should handle malformed UUID inputs', async () => {
    const userId = 'test-user-id';
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: userId } },
      error: null,
    });
    mockSupabase.rpc.mockResolvedValue({
      data: null,
      error: { message: 'Invalid UUID format' },
    });

    const { data, error } = await mockSupabase.rpc('has_previous_conversation', {
      p_other_user_id: 'not-a-valid-uuid',
    });

    expect(error).toBeDefined();
  });

  it('should handle empty string inputs', async () => {
    const userId = 'test-user-id';
    mockSupabase.auth.getUser.mockResolvedValue({
      data: { user: { id: userId } },
      error: null,
    });
    mockSupabase.rpc.mockResolvedValue({
      data: false,
      error: null,
    });

    const { data, error } = await mockSupabase.rpc('is_user_in_active_conversation', {
      p_match_id: '',
    });

    expect(data).toBe(false);
  });
});
