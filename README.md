# Farmer Kamol

Sirajganj, Bangladesh-এর organic farm products (মধু, ঘি, সরিষার তেল, হাঁসের বাচ্চা) বিক্রির জন্য agro-commerce প্ল্যাটফর্ম।

## Tech Stack

- **Framework:** Next.js (App Router)
- **Database:** Neon PostgreSQL + Prisma ORM
- **Storage:** Supabase Storage
- **Auth:** JWT (jose) + bcrypt
- **Hosting:** Railway

## Local Development

```bash
npm install
npm run dev
```

http://localhost:3000 এ ব্রাউজারে দেখা যাবে।

## Environment Variables

Deploy বা local development-এর জন্য `.env` ফাইলে এই variable গুলো লাগবে:

| Variable | বিবরণ |
|---|---|
| `DATABASE_URL` | Neon PostgreSQL connection string |
| `SESSION_SECRET` | JWT session সাইন করার জন্য secret key |
| `SUPABASE_URL` | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key (image upload) |
| `SUPABASE_BUCKET` | Image storage bucket name |
| `TELEGRAM_BOT_TOKEN` | Order notification bot token |
| `TELEGRAM_CHAT_ID` | Order notification পাঠানোর chat ID |

## Build

```bash
npm run build
```

(`prisma generate` build script-এর মধ্যেই অন্তর্ভুক্ত আছে।)

## Deploy

Railway-তে deploy করা হয়। GitHub repo connect করে উপরের env variable গুলো Railway dashboard-এ set করতে হবে।