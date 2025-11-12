#!/bin/bash

# Script to seed test users with pre-unlocked achievements
# Usage: ./scripts/seed-test-users.sh

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Seed Test Users with Achievements    ${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}Error: Supabase CLI not installed${NC}"
    echo "Install with: npm install -g supabase"
    exit 1
fi

echo -e "${GREEN}✓ Supabase CLI found${NC}"
echo ""

# Check if we're linked to a project
echo -e "${YELLOW}Checking Supabase project connection...${NC}"
if ! supabase status &> /dev/null; then
    echo -e "${RED}Error: Not linked to a Supabase project${NC}"
    echo "Run: supabase link --project-ref YOUR_PROJECT_REF"
    exit 1
fi

echo -e "${GREEN}✓ Connected to Supabase project${NC}"
echo ""

# Read the seed file
SEED_FILE="supabase/seeds/test_users_with_achievements.sql"

if [ ! -f "$SEED_FILE" ]; then
    echo -e "${RED}Error: Seed file not found: $SEED_FILE${NC}"
    exit 1
fi

echo -e "${YELLOW}📦 Loading test users seed file...${NC}"
echo ""

# Execute the seed file
echo -e "${YELLOW}🚀 Executing seed script...${NC}"
supabase db remote exec < "$SEED_FILE"

echo ""
echo -e "${YELLOW}🔍 Verifying seeded data...${NC}"
echo ""

# Verify the data
supabase db remote exec "
SELECT 
  p.email,
  p.full_name,
  COALESCE(up.total_points, 0) as points,
  COALESCE(up.current_level, 0) as level,
  COALESCE(up.achievements_count, 0) as achievements,
  COALESCE(ia.view_count, 0) as views,
  COALESCE(ia.share_count, 0) as shares,
  COALESCE(ia.export_count, 0) as exports
FROM profiles p
LEFT JOIN user_progression up ON up.user_id = p.id
LEFT JOIN insights_analytics ia ON ia.user_id = p.id
WHERE p.email LIKE 'test-phase5-%@zawajconnect.com'
ORDER BY up.total_points DESC;
"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  ✅ Test Users Seeded Successfully!   ${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${BLUE}📋 Test Users Created:${NC}"
echo ""
echo -e "${YELLOW}1. Beginner User${NC}"
echo "   Email: test-phase5-beginner@zawajconnect.com"
echo "   Level: 1 | Points: 100 | Achievements: 1"
echo "   Use for: Testing first-time user experience"
echo ""
echo -e "${YELLOW}2. Intermediate User${NC}"
echo "   Email: test-phase5-intermediate@zawajconnect.com"
echo "   Level: 2 | Points: 350 | Achievements: 3"
echo "   Use for: Testing active user with multiple achievements"
echo ""
echo -e "${YELLOW}3. Advanced User${NC}"
echo "   Email: test-phase5-advanced@zawajconnect.com"
echo "   Level: 3 | Points: 950 | Achievements: 6"
echo "   Use for: Testing power user with all achievements"
echo ""
echo -e "${BLUE}🎯 Next Steps:${NC}"
echo "1. View data in Supabase Dashboard → Database"
echo "2. Query profiles: SELECT * FROM profiles WHERE email LIKE 'test-phase5-%'"
echo "3. Check achievements: SELECT * FROM achievement_unlocks WHERE user_id IN (...)"
echo "4. Test the UI with these test user IDs"
echo ""
echo -e "${YELLOW}💡 Tip: These are profile-only test users (no auth.users entries)${NC}"
echo "   Use their UUIDs directly in your tests or create full auth users if needed"
echo ""
