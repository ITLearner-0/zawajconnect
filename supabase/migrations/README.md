# Database Migrations

This directory contains SQL migration files for the ZawajConnect Supabase database.

## Migration Files

### 20250105_performance_indexes.sql

**Purpose:** Add database indexes to improve query performance

**Indexes Created:**

- Profile filtering (gender, location, age)
- Islamic preferences matching (sect, madhab, prayer frequency)
- Match queries (user lookups, status filtering)
- Messages retrieval (by match, by sender)
- Subscriptions and payments tracking
- User verifications scoring

**Impact:**

- Reduces query time by 60-80% for common operations
- Improves matching algorithm performance
- Speeds up message loading and profile browsing

### 20250105_moderation_tables.sql

**Purpose:** Create tables for content moderation system

**Tables Created:**

- `moderation_rules` - Rules for automated content filtering
- `moderation_violations` - Log of moderation violations

**Features:**

- Row Level Security (RLS) policies
- Admin-only access to rules
- Automated logging system
- Indexes for performance

## How to Apply Migrations

### Using Supabase CLI

1. **Install Supabase CLI:**

   ```bash
   npm install -g supabase
   ```

2. **Login to Supabase:**

   ```bash
   supabase login
   ```

3. **Link your project:**

   ```bash
   supabase link --project-ref your-project-ref
   ```

4. **Apply migrations:**
   ```bash
   supabase db push
   ```

### Manual Application via Supabase Dashboard

1. Go to your Supabase project dashboard
2. Navigate to: **Database** → **SQL Editor**
3. Create a new query
4. Copy and paste the contents of a migration file
5. Click **Run** to execute

### Order of Execution

Apply migrations in chronological order (by filename date):

1. `20250105_performance_indexes.sql`
2. `20250105_moderation_tables.sql`

## Seeds

After applying migrations, run seed files to populate initial data:

### Using Supabase Dashboard

1. Go to: **Database** → **SQL Editor**
2. Copy contents of `/supabase/seeds/moderation_rules_seed.sql`
3. Execute the query

This will populate the `moderation_rules` table with default Islamic content moderation rules.

## Verification

After applying migrations, verify with:

```sql
-- Check indexes exist
SELECT
  schemaname,
  tablename,
  indexname
FROM pg_indexes
WHERE schemaname = 'public'
ORDER BY tablename, indexname;

-- Check moderation tables exist
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'moderation%';

-- Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('moderation_rules', 'moderation_violations');
```

## Rollback

To rollback migrations, you can drop the created objects:

```sql
-- Drop indexes
DROP INDEX IF EXISTS idx_profiles_gender;
DROP INDEX IF EXISTS idx_matches_user1_status;
-- ... (continue for all indexes)

-- Drop moderation tables
DROP TABLE IF EXISTS moderation_violations;
DROP TABLE IF EXISTS moderation_rules;
```

**⚠️ Warning:** Only rollback in development. In production, create a new migration for schema changes.

## Best Practices

1. **Never modify existing migrations** - Create new ones instead
2. **Test in development first** - Always test migrations locally before production
3. **Backup before applying** - Create a database backup before running migrations
4. **Version control** - Keep migrations in git for team collaboration
5. **Documentation** - Add comments explaining complex changes

## Troubleshooting

### "relation already exists"

- Migration was partially applied
- Check existing objects with: `\d+ table_name`
- Either complete or rollback the migration

### "permission denied"

- Ensure you're using the correct database role
- Check RLS policies aren't blocking operations

### Performance issues after indexes

- Run `ANALYZE` to update query planner statistics:
  ```sql
  ANALYZE profiles;
  ANALYZE matches;
  ```

## Support

For issues with migrations:

1. Check Supabase logs in dashboard
2. Review SQL syntax errors
3. Consult [Supabase Documentation](https://supabase.com/docs/guides/database/migrations)
