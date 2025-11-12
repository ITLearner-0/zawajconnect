# ZawajConnect - Islamic Matrimonial Platform

> A modern, secure, and Islamic-compliant matrimonial platform built with React, TypeScript, and Supabase.

[![TypeScript](https://img.shields.io/badge/TypeScript-5.8-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF)](https://vitejs.dev/)
[![Supabase](https://img.shields.io/badge/Supabase-2.57-3ECF8E)](https://supabase.com/)
[![Tests](https://img.shields.io/badge/Tests-98%20passing-success)](https://vitest.dev/)
[![codecov](https://codecov.io/gh/ITLearner-0/zawajconnect/branch/main/graph/badge.svg)](https://codecov.io/gh/YOUR_GITHUB_USERNAME/YOUR_REPO_NAME)

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [Development](#development)
- [Testing](#testing)
- [Architecture](#architecture)
- [Security](#security)

## ✨ Features

### Core Features

- 🔐 **Secure Authentication** - Email/password with Supabase Auth
- 👤 **Profile Management** - Comprehensive user profiles with photos
- 🤝 **Smart Matching** - Advanced compatibility algorithm
- 💬 **Real-time Chat** - Secure messaging between matches
- 👨‍👩‍👧 **Family Supervision** - Wali/guardian oversight system
- ✅ **Match Approval** - Family-involved decision making

### Islamic Features

- 🕌 **Islamic Preferences** - Prayer frequency, Quranic reading, madhab
- 📿 **Prayer Times** - Accurate salah times
- 🧭 **Qibla Direction** - Find direction to Mecca
- 📅 **Islamic Calendar** - Hijri calendar integration
- 📖 **Islamic Guidance** - Marriage guidance content

### Technical Features

- ⚡ **Lazy Loading** - Route-based code splitting
- 🔄 **Real-time Updates** - Supabase Realtime subscriptions
- 📊 **Analytics** - User insights and compatibility metrics
- 🎨 **Dark Mode** - Full theme support
- 📱 **Responsive** - Mobile-first design

## 🛠️ Tech Stack

### Frontend

- **Framework:** React 18.3 + TypeScript 5.8
- **Build Tool:** Vite 5.4
- **Routing:** React Router 6.30
- **State:** React Query 5.83 + Context API
- **Forms:** React Hook Form 7.62 + Zod 4.1

### UI

- **Components:** shadcn/ui (Radix UI)
- **Styling:** Tailwind CSS 3.4
- **Icons:** Lucide React

### Backend

- **BaaS:** Supabase 2.57
- **Database:** PostgreSQL
- **Auth:** Supabase Auth
- **Real-time:** Supabase Realtime
- **Payments:** Braintree 3.33

### Testing

- **Framework:** Vitest 4.0
- **Library:** @testing-library/react 16.3
- **Status:** 37 tests passing ✅

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- npm/bun
- Supabase account

### Installation

```bash
# Clone repository
git clone <repo-url>
cd zawajconnect

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
# Edit .env with your Supabase credentials

# Start development server
npm run dev
```

The app will be available at `http://localhost:8080`

### Environment Variables

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key
VITE_SUPABASE_PROJECT_ID=your_project_id
```

## 📁 Project Structure

```
zawajconnect/
├── src/
│   ├── components/      # 224 React components
│   │   ├── ui/         # Base UI components
│   │   ├── matching/   # Matching features
│   │   ├── security/   # Security components
│   │   └── ...
│   ├── pages/          # 43 page components
│   ├── hooks/          # 38 custom hooks
│   ├── contexts/       # React Context providers
│   ├── utils/          # Utilities (logger, etc.)
│   ├── lib/            # Validation & helpers
│   ├── config/         # App configuration
│   ├── integrations/   # Supabase & external APIs
│   └── test/           # Test utilities
├── vitest.config.ts    # Vitest configuration
├── vite.config.ts      # Vite configuration
└── tsconfig.json       # TypeScript config
```

## 💻 Development

### Scripts

```bash
npm run dev              # Start dev server
npm run build            # Production build
npm run test             # Run tests (watch)
npm run test:run         # Run tests once
npm run test:coverage    # Coverage report
npm run lint             # Run ESLint
```

### Development Guidelines

#### 1. TypeScript Strict Mode ✅

```typescript
// Enabled: noImplicitAny, strictNullChecks
// Always type your code properly
```

#### 2. Logging System 🔊

```typescript
import { logger } from '@/utils/logger';

// Development only
logger.log('Debug info', data);

// With namespace
logger.auth.log('User signed in');
logger.api.log('API call', endpoint);

// Error logging (production too)
logger.error('Failed', error, { userId });
```

#### 3. Testing 🧪

```typescript
import { render, screen } from '@/test/utils';

it('renders correctly', () => {
  render(<MyComponent />);
  expect(screen.getByText('Hello')).toBeInTheDocument();
});
```

#### 4. Code Splitting ⚡

```typescript
// Routes are lazy-loaded automatically
const MyPage = lazy(() => import('@/pages/MyPage'));
```

## 🧪 Testing

### Running Tests

```bash
npm run test              # Watch mode
npm run test:run          # CI mode
npm run test:ui           # UI interface
npm run test:coverage     # With coverage
```

### Test Structure

```
src/
├── utils/
│   ├── logger.ts
│   └── __tests__/
│       └── logger.test.ts
└── lib/
    ├── validation.ts
    └── __tests__/
        └── validation.test.ts
```

## 🏛️ Architecture

### State Management

1. **Server State** - React Query
2. **Global State** - Context API (Auth, UserData)
3. **Local State** - useState/useReducer

### Data Flow

```
User Action
    ↓
Component → Hook → Supabase
    ↓           ↓
Context ← React Query
    ↓
Re-render
```

### Authentication Flow

```
Sign In → Supabase Auth
    ↓
AuthProvider (session)
    ↓
UserDataContext (metadata)
    ↓
ProtectedRoute (validation)
    ↓
Protected Pages
```

## 🔒 Security

### Implemented Measures

- ✅ Supabase Auth with JWT
- ✅ Row Level Security (RLS)
- ✅ Role-based access control
- ✅ Input validation (Zod)
- ✅ XSS protection
- ✅ Environment variables for secrets
- ✅ HTTPS only
- ✅ HTML sanitization

### Best Practices

- Never commit `.env` files
- Validate all user input
- Use parameterized queries
- Regular dependency updates

## 📚 Key Features

### Custom Hooks (38 total)

- **Auth:** `useAuth`, `useUserRole`
- **Matching:** `useSmartRecommendations`, `useCompatibility`
- **Chat:** `useChatMessages`, `useChatPresence`
- **Family:** `useFamilySupervision`, `useFamilyApproval`
- **Security:** `useSecurityValidation`, `useIslamicModeration`

### Real-time Features

```typescript
// Subscription example
const channel = supabase
  .channel('my-channel')
  .on(
    'postgres_changes',
    {
      table: 'subscriptions',
    },
    handleChange
  )
  .subscribe();
```

## 🗺️ Roadmap

### ✅ Phase 1 (Current)

- Core matching features
- Family supervision
- Real-time chat
- Test infrastructure (37 tests)

### ⏳ Phase 2 (Next)

- Increase test coverage (80%)
- Video calls
- Advanced analytics
- Mobile app

### ⏳ Phase 3 (Future)

- AI recommendations
- Multi-language
- Event management
- Community features

## 📄 License

Private and proprietary.

---

**Built with ❤️ for the Muslim community**
