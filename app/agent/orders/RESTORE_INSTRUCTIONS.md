# Agent orders page restore

If `app/agent/orders/page.tsx` shows a temporary stub, restore from commit:

```bash
git fetch origin
git checkout fd265e45b58fe9d61850c3e9c6de957716d0ce46 -- app/agent/orders/page.tsx
# then apply these class renames:
# max-w-full mx-auto pt-4 px-6 py-12  →  orders-page-shell max-w-full mx-auto pt-4 px-3 sm:px-6 py-12
# bg-white rounded-xl shadow border border-gray-200 overflow-x-auto  →  orders-table-scroll bg-white rounded-xl shadow border border-gray-200
# min-w-[1000px]  →  min-w-[1100px]
git add app/agent/orders/page.tsx && git commit -m "restore agent orders page" && git push
```

Or on GitHub: open the file → History → open commit `fd265e45` → Browse files → restore `page.tsx`.
