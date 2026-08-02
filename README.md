# Agro e-commerce boilerplate (template)

Next.js অ্যাগ্রো/ফার্ম ই-কমার্স টেমপ্লেট — অর্ডার, অ্যাডমিন, এজেন্ট, লাইভ চ্যাট (WebSocket), কুরিয়ার হুক।

এই রিপো **লাইভ প্রোডাকশন নয়** (Railway কানেক্ট নেই)। নতুন ক্লায়েন্ট সাইট বা লোকাল এক্সপেরিমেন্টের বেস হিসেবে ব্যবহার করুন।

## Tech

- Next.js (App Router) + custom `server.ts` (HTTP + WebSocket)
- Neon PostgreSQL + Prisma
- Supabase Storage
- JWT (jose) + bcrypt

## নতুন সাইট চালু (চেকলিস্ট)

1. এই রিপো কপি / নতুন GitHub রিপো
2. `.env.example` → `.env` ভরুন (নতুন `DATABASE_URL`, `SESSION_SECRET`)
3. **`lib/siteConfig.ts`** সম্পাদনা:
   - `brand`, `contact`, `address`, `domain`, `social`, `seo`
   - `business.orderIdPrefix` (যেমন `FK` → আপনার কোড)
   - `chat.*`, `theme.*`, `payment.*`
4. `npm install`
5. `npx prisma migrate deploy` (বা dev-এ migrate)
6. Seed / অ্যাডমিন ইউজার তৈরি
7. লোগো ও OG: `public/uploads/` বা Supabase
8. হোস্টিং (Railway ইত্যাদি) + ডোমেইন + env
9. টেস্ট: অর্ডার + চ্যাট + অ্যাডমিন লগইন

## Local

```bash
npm install
cp .env.example .env   # তারপর ভরুন
npm run dev
```

http://localhost:3000

## Environment

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | Yes | Neon |
| `SESSION_SECRET` | Yes | নতুন র‍্যান্ডম |
| `SUPABASE_URL` | Images | |
| `SUPABASE_SERVICE_ROLE_KEY` | Images | |
| `SUPABASE_BUCKET` | Images | |
| `TELEGRAM_*` | Optional | অর্ডার নোটিফ |
| `NEXT_PUBLIC_GA_ID` | Optional | খালি = GA বন্ধ |

বিস্তারিত: `.env.example`

## Config vs content

| স্তর | কোথায় | ক্লায়েন্টে |
|---|---|---|
| ব্র্যান্ড / ফোন / SEO | `lib/siteConfig.ts` | বদলান |
| সিক্রেট | `.env` | নতুন |
| প্রোডাক্ট / অর্ডার | Database | আলাদা DB |
| ছবি | uploads / Supabase | তাদের অ্যাসেট |

## Build

```bash
npm run build
npm start
```

## নোট

- প্রোডাকশন লাইভ সাইট আলাদা রিপোতে রাখুন; এই রিপোতে এক্সপেরিমেন্ট/টেমপ্লেট সেফ।
- ক্লায়েন্টকে সোর্স না দিয়ে শুধু চালু সাইট দিলেও এই চেকলিস্টই যথেষ্ট।
