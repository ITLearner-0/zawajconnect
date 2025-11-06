#!/bin/bash

# =============================================================================
# Complete Test Users Seeding Script
# =============================================================================
# This script:
# 1. Creates auth users via Supabase Admin API
# 2. Executes the SQL seed to populate their data
# 3. Verifies everything was created successfully
#
# Usage: ./scripts/seed-test-users-complete.sh
# =============================================================================

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
SUPABASE_PROJECT_ID="dgfctwtivkqcfhwqgkya"
SUPABASE_URL="https://dgfctwtivkqcfhwqgkya.supabase.co"
DOMAIN="zawajconnect.me"
PASSWORD="TestPhase5!2024"

# Test users configuration
declare -A TEST_USERS=(
    ["beginner"]="test-phase5-beginner@${DOMAIN}"
    ["intermediate"]="test-phase5-intermediate@${DOMAIN}"
    ["advanced"]="test-phase5-advanced@${DOMAIN}"
)

# =============================================================================
# Helper Functions
# =============================================================================

print_header() {
    echo -e "\n${BLUE}================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}================================${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}⚠${NC} $1"
}

print_info() {
    echo -e "${BLUE}ℹ${NC} $1"
}

# =============================================================================
# Prerequisite Checks
# =============================================================================

check_prerequisites() {
    print_header "Checking Prerequisites"
    
    # Check if curl is installed
    if ! command -v curl &> /dev/null; then
        print_error "curl is not installed. Please install it first."
        exit 1
    fi
    print_success "curl is installed"
    
    # Check if jq is installed
    if ! command -v jq &> /dev/null; then
        print_error "jq is not installed. Please install it first."
        print_info "Install with: sudo apt-get install jq (Ubuntu) or brew install jq (macOS)"
        exit 1
    fi
    print_success "jq is installed"
    
    # Check if Supabase CLI is installed
    if ! command -v supabase &> /dev/null; then
        print_error "Supabase CLI is not installed"
        print_info "Install from: https://supabase.com/docs/guides/cli"
        exit 1
    fi
    print_success "Supabase CLI is installed"
    
    # Check if linked to project
    if ! supabase status &> /dev/null; then
        print_error "Not linked to a Supabase project"
        print_info "Run: supabase link --project-ref ${SUPABASE_PROJECT_ID}"
        exit 1
    fi
    print_success "Linked to Supabase project"
}

# =============================================================================
# Get Service Role Key
# =============================================================================

get_service_role_key() {
    print_header "Getting Service Role Key"
    
    # Try to get from environment variable first
    if [ -n "$SUPABASE_SERVICE_ROLE_KEY" ]; then
        print_success "Service role key found in environment"
        echo "$SUPABASE_SERVICE_ROLE_KEY"
        return 0
    fi
    
    # Try to get from Supabase CLI
    print_info "Attempting to get service role key from Supabase CLI..."
    
    # Get the service role key using supabase secrets list
    SERVICE_ROLE_KEY=$(supabase secrets list --output json 2>/dev/null | jq -r '.[] | select(.name == "SUPABASE_SERVICE_ROLE_KEY") | .value' 2>/dev/null)
    
    if [ -z "$SERVICE_ROLE_KEY" ] || [ "$SERVICE_ROLE_KEY" == "null" ]; then
        print_error "Could not retrieve service role key automatically"
        print_info "Please provide your Supabase service role key:"
        print_info "You can find it at: https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/settings/api"
        echo -n "Service Role Key: "
        read -s SERVICE_ROLE_KEY
        echo ""
        
        if [ -z "$SERVICE_ROLE_KEY" ]; then
            print_error "Service role key is required"
            exit 1
        fi
    fi
    
    print_success "Service role key obtained"
    echo "$SERVICE_ROLE_KEY"
}

# =============================================================================
# Create Auth Users
# =============================================================================

create_auth_user() {
    local email=$1
    local password=$2
    local label=$3
    
    print_info "Creating user: ${email}"
    
    # Create user via Admin API
    response=$(curl -s -w "\n%{http_code}" -X POST \
        "${SUPABASE_URL}/auth/v1/admin/users" \
        -H "apikey: ${ANON_KEY}" \
        -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
        -H "Content-Type: application/json" \
        -d "{
            \"email\": \"${email}\",
            \"password\": \"${password}\",
            \"email_confirm\": true,
            \"user_metadata\": {
                \"full_name\": \"${label} Test User\"
            }
        }")
    
    http_code=$(echo "$response" | tail -n1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" -eq 200 ] || [ "$http_code" -eq 201 ]; then
        user_id=$(echo "$body" | jq -r '.id')
        print_success "Created user: ${email} (ID: ${user_id})"
        return 0
    elif [ "$http_code" -eq 422 ]; then
        # User might already exist
        error_msg=$(echo "$body" | jq -r '.msg // .message // "Unknown error"')
        if [[ "$error_msg" == *"already registered"* ]] || [[ "$error_msg" == *"already exists"* ]]; then
            print_warning "User already exists: ${email}"
            return 0
        else
            print_error "Failed to create user: ${error_msg}"
            return 1
        fi
    else
        error_msg=$(echo "$body" | jq -r '.msg // .message // "Unknown error"')
        print_error "Failed to create user (HTTP ${http_code}): ${error_msg}"
        return 1
    fi
}

create_all_auth_users() {
    print_header "Creating Auth Users"
    
    local failed=0
    
    for level in beginner intermediate advanced; do
        email="${TEST_USERS[$level]}"
        if ! create_auth_user "$email" "$PASSWORD" "$(echo $level | sed 's/.*/\u&/')"; then
            ((failed++))
        fi
        sleep 1  # Rate limiting
    done
    
    if [ $failed -gt 0 ]; then
        print_error "Failed to create $failed user(s)"
        return 1
    fi
    
    print_success "All auth users created successfully"
    return 0
}

# =============================================================================
# Execute SQL Seed
# =============================================================================

execute_sql_seed() {
    print_header "Executing SQL Seed"
    
    SEED_FILE="supabase/seeds/test_users_with_achievements.sql"
    
    if [ ! -f "$SEED_FILE" ]; then
        print_error "Seed file not found: $SEED_FILE"
        exit 1
    fi
    
    print_info "Running seed file: $SEED_FILE"
    
    # Execute the seed file
    if supabase db remote exec -f "$SEED_FILE"; then
        print_success "SQL seed executed successfully"
    else
        print_error "Failed to execute SQL seed"
        print_info "Check the error messages above for details"
        exit 1
    fi
}

# =============================================================================
# Verify Data
# =============================================================================

verify_seeded_data() {
    print_header "Verifying Seeded Data"
    
    print_info "Checking profiles and progression data..."
    
    # Query to verify the data
    VERIFY_QUERY="
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
    WHERE au.email LIKE 'test-phase5-%@${DOMAIN}'
    ORDER BY up.total_points DESC;
    "
    
    echo "$VERIFY_QUERY" | supabase db remote exec
    
    print_success "Verification complete"
}

# =============================================================================
# Cleanup Function (Optional)
# =============================================================================

cleanup_test_users() {
    print_header "Cleanup Test Users"
    print_warning "This will delete all test users and their data!"
    echo -n "Are you sure? (yes/no): "
    read confirm
    
    if [ "$confirm" != "yes" ]; then
        print_info "Cleanup cancelled"
        return 0
    fi
    
    print_info "Deleting test users..."
    
    for level in beginner intermediate advanced; do
        email="${TEST_USERS[$level]}"
        
        # Get user ID
        user_id=$(curl -s -X GET \
            "${SUPABASE_URL}/auth/v1/admin/users?email=${email}" \
            -H "apikey: ${ANON_KEY}" \
            -H "Authorization: Bearer ${SERVICE_ROLE_KEY}" \
            | jq -r '.users[0].id // empty')
        
        if [ -n "$user_id" ] && [ "$user_id" != "null" ]; then
            # Delete user
            curl -s -X DELETE \
                "${SUPABASE_URL}/auth/v1/admin/users/${user_id}" \
                -H "apikey: ${ANON_KEY}" \
                -H "Authorization: Bearer ${SERVICE_ROLE_KEY}"
            
            print_success "Deleted user: ${email}"
        else
            print_info "User not found: ${email}"
        fi
    done
    
    print_success "Cleanup complete"
}

# =============================================================================
# Main Execution
# =============================================================================

main() {
    echo -e "\n${BLUE}╔════════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║  Complete Test Users Seeding Script       ║${NC}"
    echo -e "${BLUE}╚════════════════════════════════════════════╝${NC}\n"
    
    # Check for cleanup flag
    if [ "$1" == "--cleanup" ]; then
        check_prerequisites
        ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnZmN0d3RpdmtxY2Zod3Fna3lhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMDU5OTYsImV4cCI6MjA3MjU4MTk5Nn0.3W530G6H6EO5bLXyd-NWgHQche1Y2Tf-WC00U8LQOdw"
        SERVICE_ROLE_KEY=$(get_service_role_key)
        cleanup_test_users
        exit 0
    fi
    
    # Run the complete seeding process
    check_prerequisites
    
    # Set keys
    ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRnZmN0d3RpdmtxY2Zod3Fna3lhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcwMDU5OTYsImV4cCI6MjA3MjU4MTk5Nn0.3W530G6H6EO5bLXyd-NWgHQche1Y2Tf-WC00U8LQOdw"
    SERVICE_ROLE_KEY=$(get_service_role_key)
    
    # Create auth users
    if ! create_all_auth_users; then
        print_error "Failed to create all auth users"
        exit 1
    fi
    
    # Wait a bit for users to be fully created
    print_info "Waiting for auth users to be fully initialized..."
    sleep 3
    
    # Execute SQL seed
    execute_sql_seed
    
    # Verify the data
    verify_seeded_data
    
    # Success message
    print_header "✅ SUCCESS!"
    echo -e "${GREEN}Test users seeded successfully!${NC}\n"
    echo -e "📊 ${BLUE}Created 3 test users:${NC}"
    echo -e "   • ${GREEN}Beginner:${NC}     test-phase5-beginner@${DOMAIN}"
    echo -e "   • ${GREEN}Intermediate:${NC} test-phase5-intermediate@${DOMAIN}"
    echo -e "   • ${GREEN}Advanced:${NC}     test-phase5-advanced@${DOMAIN}"
    echo -e "\n🔐 ${BLUE}Password:${NC} ${PASSWORD}"
    echo -e "\n🎯 ${BLUE}Next Steps:${NC}"
    echo -e "   1. Log in with any test user to verify"
    echo -e "   2. Check their achievements in /compatibility-insights"
    echo -e "   3. View data in Supabase Dashboard:"
    echo -e "      ${YELLOW}https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/editor${NC}"
    echo -e "\n💡 ${BLUE}Tips:${NC}"
    echo -e "   • Run with ${YELLOW}--cleanup${NC} flag to delete test users"
    echo -e "   • Check logs if you encounter issues"
    echo ""
}

# Run main function
main "$@"
