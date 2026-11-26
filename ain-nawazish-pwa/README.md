# Ain-Nawazish Hotel — Live Sales PWA (Vercel Deployment)

Yeh standalone PWA (Progressive Web App) hai jo Ain-Nawazish Hotel ki daily sales aur orders live mobile par show karta hai.

---

## Step 1: Supabase Mein Table Banayein

1. Apne [Supabase Dashboard](https://supabase.com/dashboard) mein jayein.
2. Left menu se **SQL Editor** open karein aur `daily_sales` table create karein:

```sql
CREATE TABLE IF NOT EXISTS daily_sales (
  business_date DATE PRIMARY KEY,
  total_sales NUMERIC(14, 2) NOT NULL DEFAULT 0.00,
  total_orders INTEGER NOT NULL DEFAULT 0,
  last_sync_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_daily_sales_date ON daily_sales (business_date DESC);
ALTER TABLE daily_sales ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read on daily_sales" ON daily_sales FOR SELECT USING (true);
CREATE POLICY "Allow service role upsert on daily_sales" ON daily_sales FOR ALL USING (true);
```

---

## Step 2: Vercel Par Deploy Karein

```bash
cd ain-nawazish-pwa
vercel
```

---

## Step 3: Vercel Environment Variables
Vercel dashboard mein **Project Settings -> Environment Variables** mein yeh values add karein:

* `SUPABASE_URL` = `<your-supabase-project-url>`
* `SUPABASE_SERVICE_ROLE_KEY` = `<your-supabase-service-role-key>`
* `SYNC_SECRET` = `<your-new-sync-secret>`
* `APP_PIN` = `<your-4-digit-pin>`

---

## Step 4: Mobile Par App Install Karein (PWA)

1. Apne Vercel deployment URL ko mobile **Chrome** (Android) ya **Safari** (iPhone) mein open karein.
2. Browser menu mein **"Add to Home screen"** ya **"Install App"** par click karein.
