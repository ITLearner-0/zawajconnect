# Profile Redesign Components

This directory contains the redesigned profile components implementing the new "Hero Profile" layout with unified Islamic matrimony design system.

## Phase 1: Foundations ✅

Phase 1 includes the design system, base components, and Hero layout implementation.

### Components

#### 1. **HeroProfileSection**
Modern profile header with cover photo and avatar overlay.

```tsx
import { HeroProfileSection } from '@/components/profile/redesign';

<HeroProfileSection
  profile={profile}
  isOwnProfile={true}
  completionPercentage={85}
  verificationScore={90}
  onEdit={() => navigate('/profile/edit')}
/>
```

**Features:**
- Cover photo with Islamic pattern overlay
- Avatar with verification badge
- Quick stats (Completion, Verified, Active)
- Edit button for own profile
- Responsive design
- Smooth animations

#### 2. **ProfileSidebar**
Sidebar with actions, progress tracking, and stats.

```tsx
import { ProfileSidebar } from '@/components/profile/redesign';

<ProfileSidebar
  profile={profile}
  isOwnProfile={false}
  completionStats={{
    overall: 85,
    basicInfo: 90,
    photos: 100,
    islamicPrefs: 75,
    compatibility: 80,
  }}
  profileStats={{
    views: 1250,
    likes: 87,
    messages: 32,
  }}
  onMessage={() => handleMessage()}
  onVideoCall={() => handleVideoCall()}
  onContactWali={() => handleWaliContact()}
/>
```

**Features:**
- Action buttons (Message, Video Call, Contact Wali)
- Progress tracking for own profile
- Stats display (views, likes, messages)
- Badge showcase
- Responsive layout

#### 3. **ProfileSection**
Reusable collapsible section container.

```tsx
import { ProfileSection, SectionContent, InfoGrid } from '@/components/profile/redesign';

<ProfileSection
  icon={Heart}
  title="Préférences Islamiques"
  accentColor="emerald"
  defaultOpen={true}
>
  <SectionContent>
    <InfoGrid
      columns={2}
      items={[
        { label: 'Prière', value: profile.prayer_frequency },
        { label: 'Lecture du Coran', value: profile.quran_reading },
      ]}
    />
  </SectionContent>
</ProfileSection>
```

**Features:**
- Collapsible with smooth animations
- Customizable icon and accent color
- Optional badge and actions
- Sub-components for content organization
- Empty state support

#### 4. **Stat Components**
Collection of reusable stat display components.

```tsx
import {
  StatCard,
  StatItem,
  ProgressItem,
  CircularProgress,
  MetricRow,
} from '@/components/profile/redesign';

// Large stat card
<StatCard
  icon={Eye}
  label="Profile Views"
  value="1.2K"
  color="emerald"
  trend={{ value: 12, label: 'vs last week' }}
/>

// Compact stat
<StatItem
  icon={Heart}
  label="Likes"
  value="87"
  color="rose"
  size="md"
/>

// Progress bar
<ProgressItem
  label="Photos"
  percentage={85}
  color="gold"
  icon={Camera}
/>

// Circular progress
<CircularProgress
  percentage={85}
  size={120}
  color="emerald"
  label="Complete"
/>

// Metric row
<MetricRow
  icon={MessageCircle}
  label="Messages"
  value="32"
  color="sage"
/>
```

## Design System

### Colors

The design uses a unified "Islamic Matrimony" color palette:

- **Emerald** (#10b981): Primary actions, success
- **Gold** (#f59e0b): Premium features, badges, verification
- **Rose** (#f43f5e): Engagement actions (like, message)
- **Sage** (#84a98c): Neutral backgrounds
- **Cream** (#f2edd9): Warm backgrounds

### Typography

Consistent typographic hierarchy using the typography system from `@/styles/typography.ts`.

### Animations

All components use Framer Motion with predefined animation variants from `@/styles/animations.ts`.

## Layout Structure

```
┌─────────────────────────────────────────────────┐
│  HeroProfileSection                             │
│  (Cover + Avatar + Quick Stats)                 │
└─────────────────────────────────────────────────┘

┌────────────┬────────────────────────────────────┐
│  Sidebar   │  Main Content Area                 │
│            │                                     │
│  Actions   │  ┌──────────────────────────────┐ │
│  Progress  │  │  ProfileSection (About)      │ │
│  Stats     │  └──────────────────────────────┘ │
│  Badges    │                                     │
│            │  ┌──────────────────────────────┐ │
│            │  │  ProfileSection (Islamic)    │ │
│            │  └──────────────────────────────┘ │
│            │                                     │
│            │  ┌──────────────────────────────┐ │
│            │  │  ProfileSection (Education)  │ │
│            │  └──────────────────────────────┘ │
└────────────┴────────────────────────────────────┘
```

## Responsive Behavior

- **Desktop (lg+)**: Sidebar + Main Content layout
- **Tablet/Mobile**: Stacked layout with sticky action bar

## Best Practices

1. **Always use the design system colors** via the color prop instead of custom Tailwind classes
2. **Leverage the animation variants** from `@/styles/animations.ts`
3. **Use ProfileSection** for consistent section styling
4. **Keep components focused** - each component should have a single responsibility
5. **Test on mobile** - ensure touch targets are appropriate (min 44px)

## Next Steps

### Phase 2: Content Sections (Planned)
- AboutMeSection
- IslamicPreferencesSection
- EducationCareerSection
- WaliInfoSection
- StatsSection

### Phase 3: Full Page Integration (Planned)
- ProfileView page
- ProfileEdit page
- Route configuration
- Migration from old components

### Phase 4: Mobile Optimizations (Planned)
- MobileActionBar
- QuickActionsScroll
- Touch gestures

### Phase 5: Polish & Testing (Planned)
- Unit tests
- E2E tests
- Accessibility audit
- Performance optimization

## Migration Guide

When migrating from old profile components:

1. Import from `@/components/profile/redesign`
2. Replace old ProfileCard → HeroProfileSection
3. Replace old sidebar → ProfileSidebar
4. Use ProfileSection for content areas
5. Update color classes to use design system

## Resources

- [Design System Documentation](../../../../PROFILE_DESIGN_SUGGESTIONS.md)
- [Framer Motion Docs](https://www.framer.com/motion/)
- [Tailwind CSS](https://tailwindcss.com/)
