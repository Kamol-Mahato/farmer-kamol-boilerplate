#!/bin/bash
set -e

COMPONENTS=(
  "MobileMenuContext" "Footer" "BlogSection" "Navbar" "OrganizationSchema"
  "ProductCard" "Breadcrumb" "HeroSlider" "PolicyPage" "NoticeModal"
  "FloatingWhatsAppButton" "FloatingCartButton" "VideoSection"
  "AnnouncementBar" "MobileBottomNav" "ConditionalLayout" "PanelNavbar"
)

count=0
for comp in "${COMPONENTS[@]}"; do
  files=$(grep -rl "from [\"'].*components/$comp[\"']" app/en --include="*.tsx" 2>/dev/null || true)
  for f in $files; do
    sed -i -E "s|from [\"'](\.\./)*\.?/?components/$comp[\"']|from \"@/app/components/$comp\"|g" "$f"
    echo "✅ ঠিক হলো: $f ($comp)"
    count=$((count+1))
  done
done

echo ""
echo "🎉 মোট $count টা import ঠিক করা হলো।"
