# Gamification Badge System

## Overview

The badge system automatically awards achievements to users when they complete specific actions. Badges come with XP rewards and are categorized by rarity.

## Badge Rarities

- **Common** 🌱 - Basic achievements, easy to obtain
- **Rare** 💎 - Requires meaningful engagement
- **Epic** ⚡ - Significant milestones
- **Legendary** 👑 - Rare, prestigious achievements

## Available Badges

### Profile Completion
- `profile_complete_25` - Getting Started (50 XP)
- `profile_complete_50` - Half Way There (100 XP)
- `profile_complete_75` - Almost Complete (200 XP)
- `profile_complete_100` - Profile Master (500 XP)

### Verification
- `email_verified` - Email Verified (100 XP)
- `phone_verified` - Phone Verified (150 XP)
- `id_verified` - Identity Verified (300 XP)

### Matching
- `first_match` - First Connection (250 XP)
- `match_streak_7` - Social Butterfly (500 XP)
- `match_streak_25` - Popular Connection (1000 XP)

### Messaging
- `first_message` - Conversation Starter (100 XP)
- `messages_100` - Chatty (300 XP)
- `messages_500` - Master Communicator (750 XP)

### Activity
- `daily_login_7` - Week Warrior (300 XP)
- `daily_login_30` - Monthly Champion (1000 XP)

### Family
- `family_added` - Family Involvement (200 XP)
- `wali_verified` - Wali Verified (400 XP)

### Compatibility
- `test_completed` - Self Aware (150 XP)
- `high_compatibility` - Perfect Match (1500 XP)

### Special
- `early_adopter` - Early Adopter (500 XP)
- `community_helper` - Community Helper (300 XP)

## Implementation

### Using the Hook (with Toast Notification)

```typescript
import { useAwardBadge } from '@/hooks/gamification/useAwardBadge';

const MyComponent = () => {
  const { awardBadge, awardProfileCompletionBadge } = useAwardBadge();

  const handleProfileUpdate = async (completionPercentage: number) => {
    // Award badge with success toast
    await awardProfileCompletionBadge(completionPercentage);
  };

  const handleEmailVerified = async () => {
    await awardBadge({ 
      badge_id: 'email_verified',
      showToast: true 
    });
  };

  return <div>...</div>;
};
```

### Silent Awarding (Background)

```typescript
import { checkAndAwardProfileCompletion } from '@/utils/badgeAwards';

// Award badge silently without toast notification
await checkAndAwardProfileCompletion(75);
```

### Edge Function Direct Call

```typescript
import { supabase } from '@/integrations/supabase/client';

const { data, error } = await supabase.functions.invoke('award-badge', {
  body: {
    badge_id: 'first_match',
    progress_value: 1,
  },
});
```

## Integration Points

### 1. Profile Updates
**Where**: Profile update/save handlers
**When**: After successfully updating profile
**How**: Calculate completion percentage and award appropriate badge

```typescript
// Example in profile update handler
const calculateCompletion = (profile) => {
  const fields = [
    profile.avatar_url,
    profile.bio,
    profile.education,
    profile.profession,
    profile.interests?.length > 0,
    profile.location,
  ];
  const completed = fields.filter(Boolean).length;
  return Math.round((completed / fields.length) * 100);
};

const completionPercentage = calculateCompletion(updatedProfile);
await checkAndAwardProfileCompletion(completionPercentage);
```

### 2. Verification Success
**Where**: Email/Phone/ID verification handlers
**When**: After successful verification
**How**: Call awardVerificationBadge with type

```typescript
// In verification success handler
const { awardVerificationBadge } = useAwardBadge();

const handleVerificationSuccess = async (type: 'email' | 'phone' | 'id') => {
  await awardVerificationBadge(type);
};
```

### 3. Match Creation
**Where**: Match acceptance/creation handler
**When**: After successful match creation
**How**: Get total match count and award milestone badges

```typescript
// In match creation handler
import { checkAndAwardMatchBadges } from '@/utils/badgeAwards';

const handleMatchCreated = async (userId: string) => {
  // Get total matches for user
  const { count } = await supabase
    .from('matches')
    .select('*', { count: 'exact', head: true })
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
    .eq('is_mutual', true);
  
  await checkAndAwardMatchBadges(count || 0);
};
```

### 4. Message Sending
**Where**: Message send handler
**When**: After successfully sending a message
**How**: Get total message count and award milestone badges

```typescript
// In message send handler
import { checkAndAwardMessageBadges } from '@/utils/badgeAwards';

const handleMessageSent = async (userId: string) => {
  const { count } = await supabase
    .from('messages')
    .select('*', { count: 'exact', head: true })
    .eq('sender_id', userId);
  
  await checkAndAwardMessageBadges(count || 0);
};
```

### 5. Compatibility Test
**Where**: Test submission handler
**When**: After completing compatibility test
**How**: Award test_completed badge

```typescript
// In compatibility test completion
const { awardBadge } = useAwardBadge();

const handleTestComplete = async (score: number) => {
  await awardBadge({ badge_id: 'test_completed' });
  
  // Also check for high compatibility
  if (score >= 90) {
    await awardBadge({ 
      badge_id: 'high_compatibility',
      progress_value: score 
    });
  }
};
```

### 6. Family Features
**Where**: Family member addition handler
**When**: After adding family member
**How**: Award family_added badge

```typescript
// After adding family member
await awardBadge({ badge_id: 'family_added' });

// After wali verification
await awardBadge({ badge_id: 'wali_verified' });
```

## Best Practices

1. **Use Silent Awards for Background Operations**
   - Use utility functions from `badgeAwards.ts` for auto-save, scheduled tasks
   - Reserve toast notifications for user-initiated actions

2. **Check for Duplicates**
   - The edge function automatically prevents duplicate badges
   - No need to check before calling

3. **Milestone-Based Awards**
   - Award badges at exact milestones (1, 7, 25, etc.)
   - Don't award multiple times for same milestone

4. **Error Handling**
   - Badge awarding failures shouldn't break core functionality
   - All utility functions handle errors gracefully

5. **XP Updates**
   - XP is automatically added to user_progression.total_xp
   - Rewards are created with 30-day expiration

## Database Schema

### user_badges
```sql
- id: UUID
- user_id: UUID (references auth.users)
- badge_id: TEXT (unique per user)
- badge_name: TEXT
- badge_description: TEXT
- badge_icon: TEXT
- rarity: TEXT (common, rare, epic, legendary)
- earned_at: TIMESTAMPTZ
- progress_value: INTEGER
- display_order: INTEGER
```

### gamification_rewards
```sql
- id: UUID
- user_id: UUID
- reward_type: TEXT (xp, badge, unlock, boost, premium_trial)
- reward_amount: INTEGER
- reward_description: TEXT
- source_action: TEXT
- claimed: BOOLEAN
- claimed_at: TIMESTAMPTZ
- expires_at: TIMESTAMPTZ
```

## Monitoring & Analytics

Track badge effectiveness:
```sql
-- Most earned badges
SELECT badge_id, COUNT(*) as earned_count
FROM user_badges
GROUP BY badge_id
ORDER BY earned_count DESC;

-- Badge distribution by rarity
SELECT rarity, COUNT(*) as count
FROM user_badges
GROUP BY rarity;

-- Users with most badges
SELECT user_id, COUNT(*) as badge_count
FROM user_badges
GROUP BY user_id
ORDER BY badge_count DESC
LIMIT 10;
```

## Testing

Test badge awarding in development:
```typescript
// Test all badge types
const testBadges = async () => {
  const { awardBadge } = useAwardBadge();
  
  await awardBadge({ badge_id: 'test_completed', showToast: true });
  await awardBadge({ badge_id: 'first_match', showToast: true });
  await awardBadge({ badge_id: 'email_verified', showToast: true });
};
```

## Future Enhancements

- [ ] Badge progress tracking (partial completion)
- [ ] Badge showcasing on profiles
- [ ] Badge leaderboards
- [ ] Seasonal/limited-time badges
- [ ] Badge collections/sets with bonus rewards
- [ ] Social badge sharing
- [ ] Badge trading/gifting
