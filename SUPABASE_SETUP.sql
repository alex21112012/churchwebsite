-- =============================================================================
-- St. Archangel Michael Serbian Orthodox Church - Supabase Database Setup
-- Run this in Supabase > SQL Editor > New Query
-- =============================================================================

-- EVENTS
CREATE TABLE IF NOT EXISTS church_events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL DEFAULT '',
  title_sr TEXT DEFAULT '',
  date TEXT DEFAULT '',
  description TEXT DEFAULT '',
  description_sr TEXT DEFAULT '',
  image TEXT DEFAULT '',
  created_at TEXT DEFAULT ''
);

-- ORGANIZATIONS
CREATE TABLE IF NOT EXISTS church_organizations (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL DEFAULT '',
  name_sr TEXT DEFAULT '',
  description TEXT DEFAULT '',
  description_sr TEXT DEFAULT '',
  image TEXT DEFAULT '',
  contact TEXT DEFAULT '',
  created_at TEXT DEFAULT ''
);

-- NEWS
CREATE TABLE IF NOT EXISTS church_news (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL DEFAULT '',
  title_sr TEXT DEFAULT '',
  body TEXT DEFAULT '',
  body_sr TEXT DEFAULT '',
  date TEXT DEFAULT '',
  image TEXT DEFAULT '',
  pinned BOOLEAN DEFAULT false,
  created_at TEXT DEFAULT ''
);

-- MISSION NEWS
CREATE TABLE IF NOT EXISTS mission_news (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL DEFAULT '',
  title_sr TEXT DEFAULT '',
  body TEXT DEFAULT '',
  body_sr TEXT DEFAULT '',
  date TEXT DEFAULT '',
  image TEXT DEFAULT '',
  pinned BOOLEAN DEFAULT false,
  created_at TEXT DEFAULT ''
);

-- SCHEDULE (singleton row, id always = 1)
CREATE TABLE IF NOT EXISTS church_schedule (
  id INTEGER PRIMARY KEY DEFAULT 1,
  month_en TEXT DEFAULT 'Every Sunday',
  month_sr TEXT DEFAULT 'Сваке Недеље',
  services JSONB DEFAULT '[]'::jsonb
);

-- HISTORY (singleton row, id always = 1)
CREATE TABLE IF NOT EXISTS church_history (
  id INTEGER PRIMARY KEY DEFAULT 1,
  intro_en TEXT DEFAULT '',
  intro_sr TEXT DEFAULT '',
  images JSONB DEFAULT '[]'::jsonb,
  timeline JSONB DEFAULT '[]'::jsonb
);

-- =============================================================================
-- SEED DATA
-- =============================================================================

-- Default schedule (Divine Liturgy every Sunday)
INSERT INTO church_schedule (id, month_en, month_sr, services)
VALUES (
  1,
  'Every Sunday',
  'Сваке Недеље',
  '[{"day":"Every Sunday","dowEn":"Sunday","dowSr":"Недеља","time":"10:00 AM","titleEn":"Divine Liturgy","titleSr":"Света Литургија"}]'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- Default history (empty, editable via admin)
INSERT INTO church_history (id, intro_en, intro_sr, images, timeline)
VALUES (1, '', '', '[]'::jsonb, '[]'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- Default organizations
INSERT INTO church_organizations (id, name, name_sr, description, description_sr, image, contact, created_at)
VALUES
  (
    'folklore',
    'Serbian Folklore Group',
    'Српска Фолклорна Група',
    'Our folklore ensemble keeps the rich tradition of Serbian folk dance and music alive in Utah. Members of all ages are welcome to join and perform at parish events, cultural festivals, and community gatherings throughout the year.',
    'Наш фолклорни ансамбл чува богату традицију српске народне игре и музике у Јути. Чланови свих узраста су добродошли да се придруже и наступају на парохијским приредбама, културним фестивалима и окупљањима током целе године.',
    '',
    '',
    NOW()::text
  ),
  (
    'choir',
    'Parish Choir',
    'Парохијски Хор',
    'The parish choir sings the Divine Liturgy and other services in the Serbian Orthodox musical tradition. Our singers are the voice of the congregation in worship, lifting hearts and minds toward God with sacred song. New voices are always welcome.',
    'Парохијски хор пева Свету Литургију и друге службе у српској православној музичкој традицији. Наши певачи су глас парохије у богослужењу, подижући срца и умове ка Богу светом песмом. Нови гласови су увек добродошли.',
    '',
    '',
    NOW()::text
  )
ON CONFLICT (id) DO NOTHING;

-- =============================================================================
-- STORAGE BUCKET
-- Run this separately in SQL editor if the Storage UI doesn't work:
-- =============================================================================

-- Create public bucket for uploads (you can also do this in Supabase Storage UI)
INSERT INTO storage.buckets (id, name, public)
VALUES ('church-uploads', 'church-uploads', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public reads on the bucket
CREATE POLICY IF NOT EXISTS "Public read access" ON storage.objects
  FOR SELECT USING (bucket_id = 'church-uploads');

-- Allow service role to insert/delete objects
CREATE POLICY IF NOT EXISTS "Service role upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'church-uploads');

CREATE POLICY IF NOT EXISTS "Service role delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'church-uploads');
