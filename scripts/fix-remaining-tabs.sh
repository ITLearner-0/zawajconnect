#!/bin/bash
# Automatically fix remaining TabsList with 3-4 fixed columns

set -e

echo "🔧 Fixing remaining TabsList responsive issues..."
echo ""

# Files to fix with their tab counts
declare -A files_to_fix=(
  ["src/pages/Settings.tsx"]=6
  ["src/components/FamilyAnalytics.tsx"]=4
  ["src/components/InsightsAnalytics.tsx"]=4
  ["src/components/AnalyticsDashboard.tsx"]=4
  ["src/components/MobileInsightsDashboard.tsx"]=4
  ["src/components/ParentalApprovalWorkflow.tsx"]=3
  ["src/components/MatchApprovalSystem.tsx"]=3
  ["src/components/IslamicGuidanceHub.tsx"]=3
)

fixed_count=0

for file in "${!files_to_fix[@]}"; do
  tab_count="${files_to_fix[$file]}"

  if [ ! -f "$file" ]; then
    echo "⚠️  File not found: $file"
    continue
  fi

  echo "📄 Processing: $file (${tab_count} tabs)"

  # Check if already has ResponsiveTabsList
  if grep -q "ResponsiveTabsList" "$file"; then
    echo "   ✓ Already using ResponsiveTabsList"
    continue
  fi

  # Add import if needed
  if grep -q "import.*TabsList.*from.*@/components/ui/tabs" "$file"; then
    # Remove TabsList from import
    sed -i 's/TabsList, TabsTrigger/TabsTrigger/g' "$file"
    sed -i 's/TabsList, //' "$file"
    sed -i 's/, TabsList//' "$file"

    # Add ResponsiveTabsList import after Tabs import
    sed -i '/import.*Tabs.*from.*@\/components\/ui\/tabs/a import { ResponsiveTabsList } from '"'"'@/components/ui/responsive-tabs-list'"'"';' "$file"

    echo "   ✓ Added ResponsiveTabsList import"
  fi

  # Replace TabsList with ResponsiveTabsList
  if grep -q "TabsList className=\"grid w-full grid-cols-${tab_count}\"" "$file"; then
    sed -i "s/<TabsList className=\"grid w-full grid-cols-${tab_count}\"/<ResponsiveTabsList tabCount={${tab_count}/g" "$file"
    sed -i 's/<\/TabsList>/<\/ResponsiveTabsList>/g' "$file"

    echo "   ✓ Replaced TabsList with ResponsiveTabsList"
    ((fixed_count++))
  else
    echo "   ℹ️  No grid-cols-${tab_count} TabsList found"
  fi

  echo ""
done

echo "✅ Fixed $fixed_count TabsList components"
echo "📊 Total files processed: ${#files_to_fix[@]}"
echo ""
echo "🔍 Next: Run 'git diff' to review changes"
