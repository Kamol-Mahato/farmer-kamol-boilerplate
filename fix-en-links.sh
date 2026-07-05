#!/bin/bash
set -e

PATHS=(
  "login" "register" "shop" "blog" "cart" "order" "about" "faq"
  "contact" "reset-password" "privacy-policy" "terms" "return-policy"
  "customer" "media"
)

count=0
for p in "${PATHS[@]}"; do
  files=$(grep -rlE "(href=\"|router\.(push|replace)\(\")/$p" app/en --include="*.tsx" 2>/dev/null || true)
  for f in $files; do
    sed -i -E "s#(href=\"|router\.push\(\"|router\.replace\(\")/$p#\1/en/$p#g" "$f"
    count=$((count+1))
  done
done

echo "🎉 প্রসেস শেষ, মোট $count টা ম্যাচ ফাইলে touch হয়েছে (একই ফাইলে একাধিকবার হতে পারে)।"
echo ""
echo "যাচাই করতে নিচের কমান্ড চালান, কিছু না দেখালে ঠিক আছে:"
echo 'grep -rEn '"'"'href="/(login|register|shop|blog|cart|order|about|faq|contact|reset-password|privacy-policy|terms|return-policy|customer|media)|router\.(push|replace)\("/(login|register|shop|blog|cart|order|about|faq|contact|reset-password|customer)'"'"' app/en --include="*.tsx" | grep -v "/en/"'
