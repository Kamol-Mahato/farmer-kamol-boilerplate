# Agro e-commerce boilerplate (template)

Next.js অ্যাগ্রো/ফার্ম ই-কমার্স টেমপ্লেট — অর্ডার, অ্যাডমিন, এজেন্ট, লাইভ চ্যাট (WebSocket), কুরিয়ার হুক।

এই রিপো **লাইভ প্রোডাকশন নয়** (Railway কানেক্ট নেই)। নতুন ক্লায়েন্ট সাইট বা লোকাল এক্সপেরিমেন্টের বেস।

## Tech

- Next.js (App Router) + custom `server.ts` (HTTP + WebSocket)
- Neon PostgreSQL + Prisma
- Supabase Storage
- JWT (jose) + bcrypt

---

## CLIENT SETUP — ৩–৪ ঘণ্টায় ডেলিভারি

ক্লায়েন্টকে **সোর্স কোড না দিয়ে** হোস্টেড সাইট দিতে চাইলে এই ধাপ:

### ঘণ্টা ০–০.৫ — রিপো + ইনফ্রা
1. এই রিপো থেকে নতুন GitHub রিপো
2. নতুন **Neon** database → `DATABASE_URL`
3. নতুন **Railway** প্রুজেক্ট → রিপো কানেক্ট
4. `.env.example` থেকে env: `DATABASE_URL`, `SESSION_SECRET`, Supabase, optional Telegram/GA/Pathao/SSLCommerz

### ঘণ্টা ০.৫–১ — শুধু config
**শুধু** `lib/siteConfig.ts`:
- `brand`, `contact`, `address`, `domain`, `social`, `seo`
- `business.orderIdPrefix`, `payment`, `chat`, `theme`
- `storage.cartKey` (আলাদা কী)
- `about` (গল্প/মিশন/ভিশন)

### ঘণ্টা ১–২ — কন্টেন্ট
1. `npx prisma migrate deploy`
2. অ্যাডমিন ইুজার
3. ক্যাটাগরি + প্রোডাক্ট (অ্যাডমিন UI)
4. লোগো / OG / প্রোডাক্ট ছবি

### ঘণ্টা ২–৩ — ইন্টিগ্রেশন
1. ডোমেইন + SSL
2. Telegram বট
3. WhatsApp নম্বর যাচাই
4. (ঐচ্ছিক) Pathao / SSLCommerz

### ঘণ্টা ৩–৪ — QA + হ্যান্ডওভার
1. টেস্ট অর্ডার (COD)
2. চ্যাট (ভিজিটর → অ্যাডমিন)
3. ইনভয়েস প্রিন্ট
4. মোবাইল + ডেস্কটপ
5. ক্লায়েন্ট: অ্যাডমিন URL, লগইন, প্রোডাক্ট যোগার গাইড

**ডেলিভারেবল:** চালু URL + অ্যাডমিন অ্যাক্সেস + সংক্ষিপ্ত গাইড — সোর্স রিপো আলাদা রাখুন।

---

## Local dev

```bash
npm install
cp .env.example .env
npx prisma migrate dev
npm run dev
```

## Config vs content

| স্তর | কোথায় | ক্লায়েন্টে |
|---|---|---|
| ব্র্যান্ড / ফোন / SEO / chat | `lib/siteConfig.ts` | বদলান |
| সিক্রেট | `.env` | নতুন |
| প্রোডাক্ট / অর্ডার | Database | আলাদা DB |
| ছবি | uploads / Supabase | তাদের অ্যাসেট |

## নোট

- লাইভ নিজের সাইট আলাদা রিপোতে রাখুন; এই রিপো টেমপ্লেট।
- এক ক্লায়েন্ট = এক DB + এক deploy + এক `siteConfig`।
