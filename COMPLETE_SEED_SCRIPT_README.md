# Complete Test Users Seeding Script

## 📋 Overview

This script automates the complete process of creating Phase 5 test users:
1. ✅ Creates 3 auth users via Supabase Admin API
2. ✅ Executes SQL seed to populate profiles, achievements, and analytics
3. ✅ Verifies all data was created successfully

## 🚀 Quick Start

### Prerequisites

The script will check these automatically, but make sure you have:

- **curl** - For API calls
- **jq** - For JSON parsing
  ```bash
  # Ubuntu/Debian
  sudo apt-get install jq
  
  # macOS
  brew install jq
  ```
- **Supabase CLI** - For database operations
  ```bash
  npm install -g supabase
  ```

### 1. Make the script executable

```bash
chmod +x scripts/seed-test-users-complete.sh
```

### 2. Run the script

```bash
./scripts/seed-test-users-complete.sh
```

The script will:
- Check all prerequisites
- Ask for your Supabase service role key (if not in environment)
- Create 3 auth users
- Execute the SQL seed
- Verify the data

## 🔑 Service Role Key

The script needs your **Supabase Service Role Key** to create auth users.

### Option 1: Provide it when prompted (Recommended)

The script will prompt you to enter the key securely. You can find it at:
**https://supabase.com/dashboard/project/dgfctwtivkqcfhwqgkya/settings/api**

### Option 2: Set as environment variable

```bash
export SUPABASE_SERVICE_ROLE_KEY="your_service_role_key_here"
./scripts/seed-test-users-complete.sh
```

⚠️ **Never commit the service role key to version control!**

## 👥 Created Test Users

| Level | Email | Password | Points | Achievements |
|-------|-------|----------|--------|--------------|
| Beginner | test-phase5-beginner@zawajconnect.me | TestPhase5!2024 | 100 | 1 |
| Intermediate | test-phase5-intermediate@zawajconnect.me | TestPhase5!2024 | 350 | 3 |
| Advanced | test-phase5-advanced@zawajconnect.me | TestPhase5!2024 | 950 | 6 |

## 📊 What Gets Created

For each test user:

### 1. Auth User
- Email and password
- Email automatically confirmed
- User metadata with full name

### 2. Profile Data
- `profiles` table: Full profile information
- `islamic_preferences` table: Religious preferences
- `user_settings` table: App settings

### 3. Analytics & Progression
- `insights_analytics` table: View/share/export counts
- `user_progression` table: Points, level, achievements count
- `achievement_unlocks` table: Unlocked achievements
- `insight_actions` table: Action history

## 🧹 Cleanup

To delete all test users and their data:

```bash
./scripts/seed-test-users-complete.sh --cleanup
```

⚠️ This will prompt for confirmation before deleting.

## 🔍 Verification

The script automatically verifies the data was created. You can also manually check:

### Via Supabase Dashboard
1. Go to: https://supabase.com/dashboard/project/dgfctwtivkqcfhwqgkya/editor
2. Check tables:
   - `auth.users` - Auth users
   - `profiles` - User profiles
   - `user_progression` - Points and levels
   - `achievement_unlocks` - Unlocked achievements

### Via SQL Query

```sql
SELECT 
  au.email,
  p.full_name,
  up.total_points,
  up.current_level,
  up.achievements_count,
  ia.view_count,
  ia.share_count,
  ia.export_count
FROM auth.users au
JOIN profiles p ON p.user_id = au.id
LEFT JOIN user_progression up ON up.user_id = au.id
LEFT JOIN insights_analytics ia ON ia.user_id = au.id
WHERE au.email LIKE 'test-phase5-%@zawajconnect.me'
ORDER BY up.total_points DESC;
```

## 🐛 Troubleshooting

### "jq is not installed"
```bash
# Ubuntu/Debian
sudo apt-get install jq

# macOS
brew install jq
```

### "Not linked to a Supabase project"
```bash
supabase link --project-ref dgfctwtivkqcfhwqgkya
```

### "Failed to create user (HTTP 422)"
- User might already exist (check if you ran the script before)
- Run with `--cleanup` flag first, then retry

### "Service role key is required"
Get it from: https://supabase.com/dashboard/project/dgfctwtivkqcfhwqgkya/settings/api

### "SQL seed failed"
- Check if auth users were created successfully
- Verify the seed file exists: `supabase/seeds/test_users_with_achievements.sql`
- Check Supabase logs for detailed errors

## 📝 Script Features

### ✅ Validation
- Checks all prerequisites before starting
- Validates service role key
- Verifies each user creation
- Confirms data was seeded successfully

### 🔒 Security
- Service role key never logged or displayed
- Secure password input (hidden)
- Rate limiting between API calls

### 🎨 User-Friendly
- Colored output for easy reading
- Clear progress indicators
- Detailed error messages
- Success confirmation

### 🛡️ Error Handling
- Graceful handling of existing users
- Detailed error messages from API
- Exit on critical errors
- Rollback support via cleanup

## 🔄 Re-running the Script

If you need to re-run the script:

1. **With existing users**: The script will detect existing users and skip creation
2. **Fresh start**: Run cleanup first, then seed again
   ```bash
   ./scripts/seed-test-users-complete.sh --cleanup
   ./scripts/seed-test-users-complete.sh
   ```

## 📚 Related Files

- **SQL Seed**: `supabase/seeds/test_users_with_achievements.sql`
- **Old Script**: `scripts/seed-test-users.sh` (manual auth user creation)
- **Testing Guide**: `PHASE_5_TEST_GUIDE.md`
- **Seed Documentation**: `SEED_TEST_USERS_README.md`

## 💡 Usage Examples

### Standard Run
```bash
./scripts/seed-test-users-complete.sh
```

### With Pre-set Environment Variable
```bash
export SUPABASE_SERVICE_ROLE_KEY="your_key_here"
./scripts/seed-test-users-complete.sh
```

### Cleanup Before Re-seeding
```bash
./scripts/seed-test-users-complete.sh --cleanup
./scripts/seed-test-users-complete.sh
```

## 🎯 Next Steps

After successfully running the script:

1. **Test Login**: Try logging in with each test user
2. **Verify Achievements**: Check `/compatibility-insights` page
3. **Inspect Data**: Use Supabase Dashboard to verify all tables
4. **Test Features**: Use the test users to test Phase 5 features

## ⚙️ Configuration

The script uses these configurations (edit if needed):

```bash
SUPABASE_PROJECT_ID="dgfctwtivkqcfhwqgkya"
SUPABASE_URL="https://dgfctwtivkqcfhwqgkya.supabase.co"
DOMAIN="zawajconnect.me"
PASSWORD="TestPhase5!2024"
```

## 🆘 Support

If you encounter issues:

1. Check the troubleshooting section above
2. Review script output for specific error messages
3. Check Supabase logs in the dashboard
4. Verify your service role key is correct
5. Ensure your Supabase project is active

## 📄 License

Part of ZawajConnect Phase 5 testing infrastructure.
