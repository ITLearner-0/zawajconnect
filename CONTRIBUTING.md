# Contributing to ZawajConnect

Thank you for your interest in contributing to ZawajConnect! This document provides guidelines and instructions for contributing to this project.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing Guidelines](#testing-guidelines)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Project Structure](#project-structure)

## 📜 Code of Conduct

This project follows Islamic principles and values. All contributors are expected to:

- Be respectful and professional
- Maintain the Islamic nature of the platform
- Avoid inappropriate content
- Support the community positively
- Follow Shariah-compliant practices

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ or Bun
- Git
- Code editor (VS Code recommended)
- Supabase account (for backend)

### Initial Setup

1. **Fork the repository**
   ```bash
   # Click "Fork" on GitHub
   # Then clone your fork
   git clone https://github.com/YOUR_USERNAME/zawajconnect.git
   cd zawajconnect
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your Supabase credentials
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

5. **Run tests**
   ```bash
   npm run test
   ```

## 💻 Development Workflow

### Branch Strategy

- `main` - Production-ready code
- `develop` - Development branch
- `feature/*` - New features
- `fix/*` - Bug fixes
- `docs/*` - Documentation updates
- `test/*` - Test additions

### Creating a Feature Branch

```bash
# Update your local repository
git checkout main
git pull origin main

# Create feature branch
git checkout -b feature/your-feature-name

# Make your changes...

# Commit your changes
git add .
git commit -m "feat: add new feature"

# Push to your fork
git push origin feature/your-feature-name
```

## 📝 Coding Standards

### TypeScript

- ✅ Use TypeScript for all new code
- ✅ Enable strict mode compliance
- ✅ Avoid `any` types (use `unknown` or proper types)
- ✅ Type all function parameters and return values

```typescript
// ❌ Bad
function processUser(user: any) {
  return user.name;
}

// ✅ Good
interface User {
  id: string;
  name: string;
  email: string;
}

function processUser(user: User): string {
  return user.name;
}
```

### React Components

- ✅ Use functional components with hooks
- ✅ Use TypeScript interfaces for props
- ✅ Keep components small and focused
- ✅ Use lazy loading for routes

```typescript
// ✅ Good component structure
interface UserCardProps {
  user: User;
  onSelect: (userId: string) => void;
}

export const UserCard: React.FC<UserCardProps> = ({ user, onSelect }) => {
  return (
    <Card onClick={() => onSelect(user.id)}>
      <h3>{user.name}</h3>
    </Card>
  );
};
```

### Logging

- ✅ Use the logger utility, not console.log
- ✅ Log errors with context
- ✅ Use appropriate log levels

```typescript
import { logger } from '@/utils/logger';

// ✅ Good
logger.auth.log('User signed in', userId);
logger.error('Failed to fetch', error, { userId, endpoint });

// ❌ Bad
console.log('User signed in', userId);
```

### File Organization

```
src/
├── components/
│   ├── feature-name/
│   │   ├── ComponentName.tsx
│   │   ├── ComponentName.test.tsx
│   │   └── index.ts
```

### Naming Conventions

- **Components**: PascalCase (`UserProfile.tsx`)
- **Hooks**: camelCase with 'use' prefix (`useAuth.tsx`)
- **Utils**: camelCase (`validation.ts`)
- **Constants**: UPPER_SNAKE_CASE (`MAX_RETRIES`)
- **Interfaces**: PascalCase with 'I' prefix or Props suffix (`IUser`, `UserCardProps`)

## 🧪 Testing Guidelines

### Writing Tests

- ✅ Write tests for all new features
- ✅ Maintain test coverage above 60%
- ✅ Test edge cases and error scenarios
- ✅ Use descriptive test names

```typescript
import { render, screen } from '@/test/utils';
import { UserCard } from './UserCard';

describe('UserCard', () => {
  it('should render user information correctly', () => {
    const user = { id: '1', name: 'John Doe', email: 'john@example.com' };
    render(<UserCard user={user} onSelect={vi.fn()} />);

    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('should call onSelect when clicked', () => {
    const onSelect = vi.fn();
    const user = { id: '1', name: 'John', email: 'john@example.com' };
    render(<UserCard user={user} onSelect={onSelect} />);

    screen.getByText('John').click();
    expect(onSelect).toHaveBeenCalledWith('1');
  });
});
```

### Running Tests

```bash
# Watch mode (development)
npm run test

# Single run (CI)
npm run test:run

# With coverage
npm run test:coverage

# With UI
npm run test:ui
```

## 📦 Commit Guidelines

We follow [Conventional Commits](https://www.conventionalcommits.org/) specification.

### Commit Format

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks

### Examples

```bash
# Feature
git commit -m "feat(auth): add password reset functionality"

# Bug fix
git commit -m "fix(chat): resolve message ordering issue"

# Documentation
git commit -m "docs(readme): update installation instructions"

# Multiple changes
git commit -m "feat(matching): add advanced filters

- Add age range filter
- Add location-based filtering
- Add Islamic preferences filter

Closes #123"
```

### Commit Best Practices

- ✅ Keep commits focused and atomic
- ✅ Write clear, descriptive messages
- ✅ Reference issue numbers when applicable
- ✅ Use imperative mood ("add" not "added")

## 🔄 Pull Request Process

### Before Submitting

1. ✅ Update your branch with latest main
2. ✅ Run all tests (`npm run test:run`)
3. ✅ Run linter (`npm run lint`)
4. ✅ Build successfully (`npm run build`)
5. ✅ Update documentation if needed

### PR Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Breaking change
- [ ] Documentation update

## Testing
- [ ] All tests pass
- [ ] New tests added
- [ ] Manual testing completed

## Checklist
- [ ] Code follows style guidelines
- [ ] Self-review completed
- [ ] Documentation updated
- [ ] No console.log statements
- [ ] TypeScript strict mode compliant
```

### PR Review Process

1. **Automated Checks** - CI/CD runs tests and linting
2. **Code Review** - Maintainers review your code
3. **Requested Changes** - Address any feedback
4. **Approval** - PR approved by maintainer
5. **Merge** - Merged into main branch

## 📚 Project Structure

```
zawajconnect/
├── src/
│   ├── components/      # Reusable components
│   ├── pages/          # Page components
│   ├── hooks/          # Custom hooks
│   ├── contexts/       # React contexts
│   ├── utils/          # Utility functions
│   ├── lib/            # Shared libraries
│   ├── config/         # Configuration
│   ├── integrations/   # External APIs
│   ├── test/           # Test utilities
│   └── types/          # TypeScript types
├── public/             # Static assets
├── supabase/          # Supabase functions
└── tests/             # E2E tests
```

## 🎯 Areas for Contribution

### High Priority

- 🧪 **Testing** - Increase coverage to 80%
- ♿ **Accessibility** - WCAG 2.1 AA compliance
- 📱 **Mobile** - Improve responsive design
- 🌍 **i18n** - Multi-language support

### Medium Priority

- 📊 **Analytics** - Enhanced user insights
- 🎨 **UI/UX** - Design improvements
- 📖 **Documentation** - API documentation
- ⚡ **Performance** - Optimization opportunities

### Feature Requests

Check the [Issues](https://github.com/ITLearner-0/zawajconnect/issues) page for feature requests and discussions.

## 🐛 Reporting Bugs

### Bug Report Template

```markdown
**Describe the bug**
A clear description of what the bug is.

**To Reproduce**
Steps to reproduce:
1. Go to '...'
2. Click on '....'
3. See error

**Expected behavior**
What you expected to happen.

**Screenshots**
If applicable, add screenshots.

**Environment**
- Browser: [e.g., Chrome 120]
- OS: [e.g., Windows 11]
- Device: [e.g., Desktop]

**Additional context**
Any other context about the problem.
```

## 💡 Feature Requests

### Feature Request Template

```markdown
**Is your feature request related to a problem?**
A clear description of the problem.

**Describe the solution**
A clear description of what you want to happen.

**Describe alternatives**
Alternative solutions you've considered.

**Islamic Compliance**
How does this feature maintain Islamic values?

**Additional context**
Any other context or screenshots.
```

## 🔒 Security

- 🚨 **Never commit sensitive data** (.env, keys, passwords)
- 🔐 **Report security vulnerabilities** privately
- ✅ **Follow security best practices**
- 🛡️ **Validate all user input**

## 📞 Getting Help

- 💬 **Discussions** - GitHub Discussions
- 📧 **Email** - dev@zawajconnect.com
- 📚 **Documentation** - Check README.md
- 🐛 **Issues** - Create an issue

## 🙏 Thank You

Your contributions help build a better platform for the Muslim community. JazakAllah Khair!

---

**May Allah reward your efforts** 🤲
