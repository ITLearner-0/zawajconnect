// __tests__/AuthCheck.test.tsx
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { vi } from 'vitest';
import AuthCheck from '@/components/AuthCheck';
import { supabase } from '@/integrations/supabase/client';

// Mocks
vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
      onAuthStateChange: vi.fn(() => ({
        data: { subscription: { unsubscribe: vi.fn() } }
      }))
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn()
        }))
      }))
    }))
  }
}));

vi.mock('@/hooks/useRLSSetup', () => ({
  useRLSSetup: vi.fn(() => ({ isSetup: true, isLoading: false }))
}));

const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate
  };
});

const mockToast = vi.fn();
vi.mock('@/components/ui/use-toast', () => ({
  useToast: () => ({ toast: mockToast })
}));

describe('AuthCheck', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderAuthCheck = () => {
    return render(
      <BrowserRouter>
        <AuthCheck>
          <div>Protected Content</div>
        </AuthCheck>
      </BrowserRouter>
    );
  };

  it('should show loading spinner initially', () => {
    vi.mocked(supabase.auth.getSession).mockImplementation(() => 
      new Promise(() => {}) // Never resolves to keep loading state
    );

    renderAuthCheck();
    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument();
  });

  it('should redirect to auth page when not authenticated', async () => {
    vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
      data: { session: null },
      error: null
    });

    renderAuthCheck();

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/auth');
      expect(mockToast).toHaveBeenCalledWith({
        title: "Authentication required",
        description: "You need to sign in to view matches near you.",
        variant: "destructive",
      });
    });
  });

  it('should show compatibility test required when authenticated but no test', async () => {
    const mockSession = {
      user: { id: 'user-123' },
      access_token: 'token'
    };

    vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
      data: { session: mockSession },
      error: null
    });

    const fromMock = vi.mocked(supabase.from);
    fromMock.mockReturnValueOnce({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn().mockResolvedValueOnce({
            data: null,
            error: null
          })
        }))
      }))
    } as any);

    renderAuthCheck();

    await waitFor(() => {
      expect(screen.getByText('Compatibility Test Required')).toBeInTheDocument();
      expect(screen.getByText('Take Compatibility Test')).toBeInTheDocument();
    });
  });

  it('should show protected content when authenticated and has compatibility test', async () => {
    const mockSession = {
      user: { id: 'user-123' },
      access_token: 'token'
    };

    vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
      data: { session: mockSession },
      error: null
    });

    const fromMock = vi.mocked(supabase.from);
    fromMock.mockReturnValueOnce({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn().mockResolvedValueOnce({
            data: { id: 'test-123' },
            error: null
          })
        }))
      }))
    } as any);

    renderAuthCheck();

    await waitFor(() => {
      expect(screen.getByText('Protected Content')).toBeInTheDocument();
    });
  });

  it('should handle database errors gracefully', async () => {
    const mockSession = {
      user: { id: 'user-123' },
      access_token: 'token'
    };

    vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
      data: { session: mockSession },
      error: null
    });

    const fromMock = vi.mocked(supabase.from);
    fromMock.mockReturnValueOnce({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          maybeSingle: vi.fn().mockResolvedValueOnce({
            data: null,
            error: new Error('Database error')
          })
        }))
      }))
    } as any);

    renderAuthCheck();

    await waitFor(() => {
      expect(mockToast).toHaveBeenCalledWith({
        title: "Warning",
        description: "Could not verify compatibility test status. Please try again.",
        variant: "destructive",
      });
    });
  });

  it('should handle auth state changes', async () => {
    const mockSession = {
      user: { id: 'user-123' },
      access_token: 'token'
    };

    vi.mocked(supabase.auth.getSession).mockResolvedValueOnce({
      data: { session: mockSession },
      error: null
    });

    let authChangeCallback: any;
    vi.mocked(supabase.auth.onAuthStateChange).mockImplementation((callback) => {
      authChangeCallback = callback;
      return {
        data: { subscription: { unsubscribe: vi.fn() } }
      };
    });

    renderAuthCheck();

    // Simuler une déconnexion
    await waitFor(() => {
      authChangeCallback('SIGNED_OUT', null);
    });

    expect(mockNavigate).toHaveBeenCalledWith('/auth');
  });
});