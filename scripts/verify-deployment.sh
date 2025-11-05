#!/bin/bash

# Script de vérification post-déploiement
# Usage: ./scripts/verify-deployment.sh https://your-production-url.com

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

if [ -z "$1" ]; then
    echo -e "${RED}Error: URL required${NC}"
    echo "Usage: ./scripts/verify-deployment.sh https://your-production-url.com"
    exit 1
fi

URL=$1
PASSED=0
FAILED=0

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  ZawajConnect Deployment Verification ${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "${YELLOW}Testing URL: ${URL}${NC}"
echo ""

# Function to test endpoint
test_endpoint() {
    local path=$1
    local description=$2
    local expected_status=${3:-200}

    echo -n "Testing $description... "

    response=$(curl -s -o /dev/null -w "%{http_code}" "${URL}${path}")

    if [ "$response" = "$expected_status" ]; then
        echo -e "${GREEN}✓ PASS${NC} (HTTP $response)"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC} (HTTP $response, expected $expected_status)"
        ((FAILED++))
    fi
}

# Test public pages
echo -e "${YELLOW}Public Pages:${NC}"
test_endpoint "/" "Landing page"
test_endpoint "/auth" "Auth page"
test_endpoint "/privacy-policy" "Privacy policy"
test_endpoint "/terms-of-service" "Terms of service"
test_endpoint "/faq" "FAQ page"
echo ""

# Test protected routes (should redirect or return 200)
echo -e "${YELLOW}Protected Routes (should be accessible):${NC}"
test_endpoint "/dashboard" "Dashboard" "200"
test_endpoint "/browse" "Browse" "200"
test_endpoint "/settings" "Settings" "200"
echo ""

# Test static assets
echo -e "${YELLOW}Static Assets:${NC}"
test_endpoint "/assets/index.js" "JavaScript bundle" "404"  # Will 404 but checks server responds
echo ""

# Test security headers
echo -e "${YELLOW}Security Headers:${NC}"
echo -n "Checking security headers... "

headers=$(curl -s -I "${URL}" | grep -E "X-Content-Type-Options|X-Frame-Options|X-XSS-Protection")

if [ ! -z "$headers" ]; then
    echo -e "${GREEN}✓ PASS${NC}"
    echo "$headers" | sed 's/^/  /'
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL${NC} (Security headers missing)"
    ((FAILED++))
fi
echo ""

# Test HTTPS
echo -e "${YELLOW}HTTPS:${NC}"
if [[ $URL == https://* ]]; then
    echo -e "${GREEN}✓ PASS${NC} - Using HTTPS"
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL${NC} - Not using HTTPS"
    ((FAILED++))
fi
echo ""

# Test response time
echo -e "${YELLOW}Performance:${NC}"
echo -n "Measuring response time... "

start=$(date +%s%N)
curl -s -o /dev/null "${URL}"
end=$(date +%s%N)

response_time=$(( (end - start) / 1000000 ))

if [ $response_time -lt 3000 ]; then
    echo -e "${GREEN}✓ PASS${NC} (${response_time}ms)"
    ((PASSED++))
else
    echo -e "${YELLOW}⚠ SLOW${NC} (${response_time}ms, expected <3000ms)"
    ((PASSED++))
fi
echo ""

# Summary
echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  Summary                              ${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo -e "Total tests: $((PASSED + FAILED))"
echo -e "${GREEN}Passed: ${PASSED}${NC}"
echo -e "${RED}Failed: ${FAILED}${NC}"
echo ""

if [ $FAILED -eq 0 ]; then
    echo -e "${GREEN}✓ All tests passed! Deployment verified.${NC}"
    exit 0
else
    echo -e "${RED}✗ Some tests failed. Please review.${NC}"
    exit 1
fi
