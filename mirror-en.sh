#!/bin/bash
set -e

FOLDERS=(
  "about"
  "blog"
  "cart"
  "contact"
  "customer"
  "faq"
  "login"
  "media"
  "order"
  "privacy-policy"
  "register"
  "reset-password"
  "return-policy"
  "shop"
  "terms"
)

mkdir -p app/en

cp app/page.tsx app/en/page.tsx
sed -i '1i// TODO: translate to English' app/en/page.tsx

for dir in "${FOLDERS[@]}"; do
  if [ -d "app/$dir" ]; then
    mkdir -p "app/en/$dir"
    cp -r "app/$dir/." "app/en/$dir/"
    find "app/en/$dir" -name "*.tsx" -exec sed -i '1i// TODO: translate to English' {} \;
    echo "✅ কপি হলো: app/$dir → app/en/$dir"
  else
    echo "⚠️ পাওয়া যায়নি, বাদ: app/$dir"
  fi
done

echo ""
echo "🎉 app/en/ ফোল্ডার তৈরি সম্পন্ন!"
