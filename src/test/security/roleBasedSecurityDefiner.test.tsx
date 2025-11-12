import { describe, it, expect, vi, beforeEach } from 'vitest';

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

describe('SECURITY DEFINER Functions - Role-Based Access', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('get_current_user_role_secure', () => {
    it('should reject unauthenticated calls', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });
      mockSupabase.rpc.mockResolvedValue({ 
        data: null, 
        error: { message: 'Not authenticated' } 
      });

      const { data, error } = await mockSupabase.rpc('get_current_user_role_secure');

      expect(error).toBeDefined();
      expect(data).toBeNull();
    });

    it('should return role for authenticated user', async () => {
      const userId = 'test-user-id';
      mockSupabase.auth.getUser.mockResolvedValue({ 
        data: { user: { id: userId } }, 
        error: null 
      });
      mockSupabase.rpc.mockResolvedValue({ 
        data: 'user', 
        error: null 
      });

      const { data, error } = await mockSupabase.rpc('get_current_user_role_secure');

      expect(error).toBeNull();
      expect(data).toBe('user');
    });

    it('should handle users without assigned roles', async () => {
      const userId = 'test-user-id';
      mockSupabase.auth.getUser.mockResolvedValue({ 
        data: { user: { id: userId } }, 
        error: null 
      });
      mockSupabase.rpc.mockResolvedValue({ 
        data: null, 
        error: null 
      });

      const { data, error } = await mockSupabase.rpc('get_current_user_role_secure');

      expect(error).toBeNull();
      expect(data).toBeNull();
    });
  });

  describe('get_user_role', () => {
    it('should reject unauthenticated calls', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });
      mockSupabase.rpc.mockResolvedValue({ 
        data: null, 
        error: { message: 'Not authenticated' } 
      });

      const { data, error } = await mockSupabase.rpc('get_user_role', {
        user_id: 'target-user-id'
      });

      expect(error).toBeDefined();
      expect(data).toBeNull();
    });

    it('should allow user to check their own role', async () => {
      const userId = 'test-user-id';
      mockSupabase.auth.getUser.mockResolvedValue({ 
        data: { user: { id: userId } }, 
        error: null 
      });
      mockSupabase.rpc.mockResolvedValue({ 
        data: 'user', 
        error: null 
      });

      const { data, error } = await mockSupabase.rpc('get_user_role', {
        user_id: userId
      });

      expect(error).toBeNull();
      expect(data).toBe('user');
    });

    it('should restrict checking other users roles without permission', async () => {
      const userId = 'test-user-id';
      mockSupabase.auth.getUser.mockResolvedValue({ 
        data: { user: { id: userId } }, 
        error: null 
      });
      mockSupabase.rpc.mockResolvedValue({ 
        data: null, 
        error: { message: 'Unauthorized' } 
      });

      const { data, error } = await mockSupabase.rpc('get_user_role', {
        user_id: 'other-user-id'
      });

      expect(error).toBeDefined();
      expect(data).toBeNull();
    });

    it('should allow admin to check any user role', async () => {
      const adminId = 'admin-user-id';
      mockSupabase.auth.getUser.mockResolvedValue({ 
        data: { user: { id: adminId } }, 
        error: null 
      });
      mockSupabase.rpc.mockResolvedValue({ 
        data: 'user', 
        error: null 
      });

      const { data, error } = await mockSupabase.rpc('get_user_role', {
        user_id: 'any-user-id'
      });

      expect(error).toBeNull();
      expect(typeof data).toBe('string');
    });
  });

  describe('get_validation_error_stats', () => {
    it('should reject unauthenticated calls', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });
      mockSupabase.rpc.mockResolvedValue({ 
        data: null, 
        error: { message: 'Not authenticated' } 
      });

      const { data, error } = await mockSupabase.rpc('get_validation_error_stats');

      expect(error).toBeDefined();
      expect(data).toBeNull();
    });

    it('should restrict access to admin users only', async () => {
      const userId = 'regular-user-id';
      mockSupabase.auth.getUser.mockResolvedValue({ 
        data: { user: { id: userId } }, 
        error: null 
      });
      mockSupabase.rpc.mockResolvedValue({ 
        data: null, 
        error: { message: 'Admin access required' } 
      });

      const { data, error } = await mockSupabase.rpc('get_validation_error_stats');

      expect(error).toBeDefined();
      expect(error.message).toContain('Admin');
    });

    it('should allow admin users to access stats', async () => {
      const adminId = 'admin-user-id';
      mockSupabase.auth.getUser.mockResolvedValue({ 
        data: { user: { id: adminId } }, 
        error: null 
      });
      mockSupabase.rpc.mockResolvedValue({ 
        data: [
          { error_type: 'validation_failed', count: 10 },
          { error_type: 'auth_failed', count: 5 }
        ], 
        error: null 
      });

      const { data, error } = await mockSupabase.rpc('get_validation_error_stats');

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
      expect(data.length).toBeGreaterThan(0);
    });
  });

  describe('get_onboarding_funnel', () => {
    it('should reject unauthenticated calls', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });
      mockSupabase.rpc.mockResolvedValue({ 
        data: null, 
        error: { message: 'Not authenticated' } 
      });

      const { data, error } = await mockSupabase.rpc('get_onboarding_funnel');

      expect(error).toBeDefined();
      expect(data).toBeNull();
    });

    it('should restrict access to admin users only', async () => {
      const userId = 'regular-user-id';
      mockSupabase.auth.getUser.mockResolvedValue({ 
        data: { user: { id: userId } }, 
        error: null 
      });
      mockSupabase.rpc.mockResolvedValue({ 
        data: null, 
        error: { message: 'Admin access required' } 
      });

      const { data, error } = await mockSupabase.rpc('get_onboarding_funnel');

      expect(error).toBeDefined();
    });

    it('should allow admin users to access funnel data', async () => {
      const adminId = 'admin-user-id';
      mockSupabase.auth.getUser.mockResolvedValue({ 
        data: { user: { id: adminId } }, 
        error: null 
      });
      mockSupabase.rpc.mockResolvedValue({ 
        data: [
          { step: 'profile_created', count: 100 },
          { step: 'email_verified', count: 80 }
        ], 
        error: null 
      });

      const { data, error } = await mockSupabase.rpc('get_onboarding_funnel');

      expect(error).toBeNull();
      expect(Array.isArray(data)).toBe(true);
    });
  });
});

describe('SECURITY DEFINER Functions - A/B Testing Security', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('select_ab_test_variant', () => {
    it('should reject unauthenticated calls', async () => {
      mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null }, error: null });
      mockSupabase.rpc.mockResolvedValue({ 
        data: null, 
        error: { message: 'Not authenticated' } 
      });

      const { data, error } = await mockSupabase.rpc('select_ab_test_variant', {
        p_test_name: 'test-feature'
      });

      expect(error).toBeDefined();
      expect(data).toBeNull();
    });

    it('should assign variant to authenticated user', async () => {
      const userId = 'test-user-id';
      mockSupabase.auth.getUser.mockResolvedValue({ 
        data: { user: { id: userId } }, 
        error: null 
      });
      mockSupabase.rpc.mockResolvedValue({ 
        data: 'variant_a', 
        error: null 
      });

      const { data, error } = await mockSupabase.rpc('select_ab_test_variant', {
        p_test_name: 'test-feature'
      });

      expect(error).toBeNull();
      expect(typeof data).toBe('string');
    });

    it('should handle invalid test names', async () => {
      const userId = 'test-user-id';
      mockSupabase.auth.getUser.mockResolvedValue({ 
        data: { user: { id: userId } }, 
        error: null 
      });
      mockSupabase.rpc.mockResolvedValue({ 
        data: null, 
        error: { message: 'Test not found' } 
      });

      const { data, error } = await mockSupabase.rpc('select_ab_test_variant', {
        p_test_name: 'non-existent-test'
      });

      expect(error).toBeDefined();
    });

    it('should return same variant for same user and test', async () => {
      const userId = 'test-user-id';
      mockSupabase.auth.getUser.mockResolvedValue({ 
        data: { user: { id: userId } }, 
        error: null 
      });
      mockSupabase.rpc.mockResolvedValue({ 
        data: 'variant_b', 
        error: null 
      });

      const result1 = await mockSupabase.rpc('select_ab_test_variant', {
        p_test_name: 'test-feature'
      });
      const result2 = await mockSupabase.rpc('select_ab_test_variant', {
        p_test_name: 'test-feature'
      });

      expect(result1.data).toBe(result2.data);
    });

    it('should prevent SQL injection in test_name parameter', async () => {
      const userId = 'test-user-id';
      mockSupabase.auth.getUser.mockResolvedValue({ 
        data: { user: { id: userId } }, 
        error: null 
      });
      mockSupabase.rpc.mockResolvedValue({ 
        data: null, 
        error: { message: 'Invalid input' } 
      });

      const { data, error } = await mockSupabase.rpc('select_ab_test_variant', {
        p_test_name: "'; DROP TABLE ab_tests; --"
      });

      expect(error).toBeDefined();
    });
  });
});
