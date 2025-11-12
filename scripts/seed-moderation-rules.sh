#!/bin/bash

# Script pour charger les règles de modération en production
# Usage: ./scripts/seed-moderation-rules.sh

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Load Moderation Rules to Production  ${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""

# Check if supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo -e "${RED}Error: Supabase CLI not installed${NC}"
    exit 1
fi

echo -e "${YELLOW}Loading moderation rules from seed file...${NC}"
echo ""

# Read the seed file
SEED_FILE="supabase/seeds/moderation_rules_seed.sql"

if [ ! -f "$SEED_FILE" ]; then
    echo -e "${RED}Error: Seed file not found: $SEED_FILE${NC}"
    exit 1
fi

# Execute the seed file
echo "Executing seed file..."
supabase db remote exec < "$SEED_FILE"

# Verify
echo ""
echo -e "${YELLOW}Verifying rules...${NC}"
supabase db remote exec "
SELECT
  COUNT(*) as total_rules,
  COUNT(CASE WHEN is_active THEN 1 END) as active_rules,
  COUNT(CASE WHEN severity = 'critical' THEN 1 END) as critical_rules,
  COUNT(CASE WHEN severity = 'high' THEN 1 END) as high_rules,
  COUNT(CASE WHEN severity = 'medium' THEN 1 END) as medium_rules,
  COUNT(CASE WHEN severity = 'low' THEN 1 END) as low_rules
FROM moderation_rules;
"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Moderation Rules Loaded Successfully!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo -e "${YELLOW}Expected: 17 total rules, 17 active${NC}"
echo "You can view rules in Supabase Dashboard → Database → moderation_rules"
