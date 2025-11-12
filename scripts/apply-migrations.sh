#!/bin/bash

# Script d'application des migrations Supabase en production
# Usage: ./scripts/apply-migrations.sh [project-ref]

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}==================================${NC}"
echo -e "${GREEN}  ZawajConnect - Apply Migrations${NC}"
echo -e "${GREEN}==================================${NC}"
echo ""

# Check if project ref is provided
if [ -z "$1" ]; then
    echo -e "${RED}Error: Project reference required${NC}"
    echo "Usage: ./scripts/apply-migrations.sh YOUR_PROJECT_REF"
    echo ""
    echo "Find your project ref in Supabase Dashboard:"
    echo "Settings → General → Reference ID"
    exit 1
fi

PROJECT_REF=$1

echo -e "${YELLOW}Project Ref: ${PROJECT_REF}${NC}"
echo ""

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}Error: Supabase CLI not installed${NC}"
    echo "Install with: npm install -g supabase"
    exit 1
fi

echo -e "${GREEN}✓ Supabase CLI found${NC}"

# Login to Supabase
echo ""
echo -e "${YELLOW}Step 1: Logging in to Supabase...${NC}"
supabase login

# Link to project
echo ""
echo -e "${YELLOW}Step 2: Linking to project...${NC}"
supabase link --project-ref $PROJECT_REF

# Show pending migrations
echo ""
echo -e "${YELLOW}Step 3: Checking pending migrations...${NC}"
supabase db diff

# Confirm before applying
echo ""
read -p "Apply these migrations? (y/n) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${RED}Migration cancelled${NC}"
    exit 1
fi

# Apply migrations
echo ""
echo -e "${YELLOW}Step 4: Applying migrations...${NC}"
supabase db push

# Verify migrations
echo ""
echo -e "${YELLOW}Step 5: Verifying migrations...${NC}"

# Check if indexes were created
echo "Checking indexes..."
supabase db remote exec "
SELECT COUNT(*) as index_count
FROM pg_indexes
WHERE schemaname = 'public'
AND indexname LIKE 'idx_%';
" | tail -n 1

# Check if moderation tables exist
echo "Checking moderation tables..."
supabase db remote exec "
SELECT table_name
FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name LIKE 'moderation%';
"

echo ""
echo -e "${GREEN}==================================${NC}"
echo -e "${GREEN}  Migrations Applied Successfully!${NC}"
echo -e "${GREEN}==================================${NC}"
echo ""
echo -e "${YELLOW}Next steps:${NC}"
echo "1. Run seed script: ./scripts/seed-moderation-rules.sh"
echo "2. Verify in Supabase Dashboard → Database"
echo "3. Test on staging environment"
