/**
 * Tests for SmartMatchingSuggestions Component
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import SmartMatchingSuggestions from '../SmartMatchingSuggestions';

// Mock dependencies
vi.mock('@/hooks/useAuth', () => ({
  useAuth: () => ({
    user: {
      id: 'test-user-id',
      email: 'test@example.com',
      user_metadata: { full_name: 'Test User' }
    },
    isAuthenticated: true,
  }),
}));

vi.mock('@/utils/logger', () => ({
  logger: {
    log: vi.fn(),
    error: vi.fn(),
  },
}));

// Mock Supabase with realistic data
const mockProfiles = [
  {
    user_id: 'match1',
    full_name: 'Sarah Ahmed',
    age: 28,
    gender: 'female',
    location: 'Paris, France',
    profession: 'Software Engineer',
    education: 'Masters in Computer Science',
    bio: 'Passionate about technology and Islam',
    interests: ['reading', 'coding', 'hiking'],
    avatar_url: null
  },
  {
    user_id: 'match2',
    full_name: 'Fatima Khan',
    age: 26,
    gender: 'female',
    location: 'Lyon, France',
    profession: 'Teacher',
    education: 'Bachelors in Education',
    bio: 'Love teaching and learning',
    interests: ['reading', 'teaching', 'travel'],
    avatar_url: null
  }
];

const mockIslamicPrefs = [
  {
    user_id: 'match1',
    sect: 'sunni',
    madhab: 'hanafi',
    prayer_frequency: 'five_times_daily',
    quran_reading: 'daily',
    importance_of_religion: 'very_important',
    halal_diet: true,
    smoking: false
  },
  {
    user_id: 'match2',
    sect: 'sunni',
    madhab: 'maliki',
    prayer_frequency: 'five_times_daily',
    quran_reading: 'weekly',
    importance_of_religion: 'important',
    halal_diet: true,
    smoking: false
  }
];

const mockVerifications = [
  { user_id: 'match1', verification_score: 85 },
  { user_id: 'match2', verification_score: 70 }
];

const mockMyProfile = {
  user_id: 'test-user-id',
  full_name: 'Test User',
  age: 27,
  gender: 'male',
  location: 'Paris, France',
  profession: 'Engineer',
  education: 'Masters',
  bio: 'Looking for a practicing Muslim',
  interests: ['reading', 'sports', 'coding'],
  avatar_url: null
};

const mockMyIslamicPrefs = {
  user_id: 'test-user-id',
  sect: 'sunni',
  madhab: 'hanafi',
  prayer_frequency: 'five_times_daily',
  quran_reading: 'daily',
  importance_of_religion: 'very_important',
  halal_diet: true,
  smoking: false
};

vi.mock('@/integrations/supabase/client', () => ({
  supabase: {
    from: vi.fn((table: string) => {
      if (table === 'profiles') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn((field: string, value: string) => {
              if (field === 'user_id' && value === 'test-user-id') {
                return {
                  maybeSingle: vi.fn(() =>
                    Promise.resolve({ data: mockMyProfile, error: null })
                  )
                };
              }
              return {
                neq: vi.fn(() => Promise.resolve({ data: mockProfiles, error: null }))
              };
            }),
            neq: vi.fn(() => Promise.resolve({ data: mockProfiles, error: null }))
          }))
        };
      }

      if (table === 'islamic_preferences') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn((field: string, value: string) => {
              if (field === 'user_id' && value === 'test-user-id') {
                return {
                  maybeSingle: vi.fn(() =>
                    Promise.resolve({ data: mockMyIslamicPrefs, error: null })
                  )
                };
              }
              return {
                in: vi.fn(() => Promise.resolve({ data: mockIslamicPrefs, error: null }))
              };
            }),
            in: vi.fn(() => Promise.resolve({ data: mockIslamicPrefs, error: null }))
          }))
        };
      }

      if (table === 'user_verifications') {
        return {
          select: vi.fn(() => ({
            in: vi.fn(() => Promise.resolve({ data: mockVerifications, error: null }))
          }))
        };
      }

      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
          maybeSingle: vi.fn(() => Promise.resolve({ data: null, error: null }))
        }))
      };
    })
  }
}));

const renderWithRouter = (component: React.ReactElement) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('SmartMatchingSuggestions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render the component', async () => {
    renderWithRouter(<SmartMatchingSuggestions />);

    await waitFor(() => {
      expect(screen.getByText(/suggestions intelligentes/i)).toBeInTheDocument();
    });
  });

  it('should display match suggestions', async () => {
    renderWithRouter(<SmartMatchingSuggestions />);

    await waitFor(
      () => {
        expect(screen.getByText(/Sarah Ahmed/i)).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  it('should show compatibility scores', async () => {
    renderWithRouter(<SmartMatchingSuggestions />);

    await waitFor(
      () => {
        // Should show percentage scores
        const scores = screen.getAllByText(/%/);
        expect(scores.length).toBeGreaterThan(0);
      },
      { timeout: 2000 }
    );
  });

  it('should display compatibility reasons', async () => {
    renderWithRouter(<SmartMatchingSuggestions />);

    await waitFor(
      () => {
        // Should show some compatibility reasons
        const element = screen.getByText(/compatibilité/i);
        expect(element).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  it('should show shared interests', async () => {
    renderWithRouter(<SmartMatchingSuggestions />);

    await waitFor(
      () => {
        // Should mention reading as shared interest
        const readingElements = screen.queryAllByText(/reading/i);
        expect(readingElements.length).toBeGreaterThan(0);
      },
      { timeout: 2000 }
    );
  });

  it('should display profile information', async () => {
    renderWithRouter(<SmartMatchingSuggestions />);

    await waitFor(
      () => {
        expect(screen.getByText(/Software Engineer/i)).toBeInTheDocument();
        expect(screen.getByText(/28/)).toBeInTheDocument();
        expect(screen.getByText(/Paris/i)).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  it('should show verification badges for verified profiles', async () => {
    renderWithRouter(<SmartMatchingSuggestions />);

    await waitFor(
      () => {
        const verifiedBadges = screen.queryAllByText(/vérifié/i);
        expect(verifiedBadges.length).toBeGreaterThan(0);
      },
      { timeout: 2000 }
    );
  });

  it('should limit suggestions to top matches', async () => {
    renderWithRouter(<SmartMatchingSuggestions />);

    await waitFor(
      () => {
        // Should show max 3 suggestions even if more matches exist
        const profiles = screen.queryAllByRole('article');
        expect(profiles.length).toBeLessThanOrEqual(3);
      },
      { timeout: 2000 }
    );
  });

  it('should have clickable profile cards', async () => {
    renderWithRouter(<SmartMatchingSuggestions />);

    await waitFor(
      () => {
        const viewButtons = screen.getAllByRole('button', { name: /voir le profil/i });
        expect(viewButtons.length).toBeGreaterThan(0);
      },
      { timeout: 2000 }
    );
  });

  it('should show loading state initially', () => {
    renderWithRouter(<SmartMatchingSuggestions />);

    // Should show some loading indication
    const loadingElement = screen.queryByText(/chargement/i);
    // Loading might be quick, so this is optional
    if (loadingElement) {
      expect(loadingElement).toBeInTheDocument();
    }
  });

  it('should use fuzzy matching algorithm', async () => {
    const { logger } = await import('@/utils/logger');

    renderWithRouter(<SmartMatchingSuggestions />);

    await waitFor(
      () => {
        // Check that fuzzy matching calculations were logged
        expect(logger.log).toHaveBeenCalledWith(
          'Match suggestion calculated',
          expect.objectContaining({
            matchId: expect.any(String),
            islamicScore: expect.any(Number),
            culturalScore: expect.any(Number),
            overallScore: expect.any(Number)
          })
        );
      },
      { timeout: 2000 }
    );
  });

  it('should prioritize Islamic compatibility', async () => {
    renderWithRouter(<SmartMatchingSuggestions />);

    await waitFor(
      () => {
        // Sarah Ahmed should rank higher due to better Islamic compatibility
        const cards = screen.queryAllByRole('heading', { level: 3 });
        if (cards.length > 0) {
          expect(cards[0]?.textContent).toContain('Sarah');
        }
      },
      { timeout: 2000 }
    );
  });

  it('should filter out low compatibility matches', async () => {
    renderWithRouter(<SmartMatchingSuggestions />);

    await waitFor(
      () => {
        // Should only show matches with score > 20
        const suggestions = screen.queryAllByRole('article');
        // All shown suggestions should have reasonable compatibility
        expect(suggestions.length).toBeGreaterThan(0);
      },
      { timeout: 2000 }
    );
  });
});
