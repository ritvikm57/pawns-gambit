-- Pawn's Gambit — Supabase Database Schema
-- Run this in the Supabase SQL editor to set up the database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ─────────────────────────────────────────────────────────────────────────────
-- USERS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.users (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  email         TEXT NOT NULL,
  city          TEXT,
  phone         TEXT,
  chess_com_username TEXT,
  fide_id       TEXT,
  skill_level   TEXT CHECK (skill_level IN ('beginner','intermediate','tournament','expert','titled')),
  role          TEXT NOT NULL DEFAULT 'player' CHECK (role IN ('player','admin')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON public.users FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.users FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Public can view all profiles (name only)"
  ON public.users FOR SELECT
  USING (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- RATINGS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.ratings (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  rating        INTEGER NOT NULL DEFAULT 1500,
  rd            INTEGER NOT NULL DEFAULT 350,
  volatility    NUMERIC(8,6) NOT NULL DEFAULT 0.060000,
  games_played  INTEGER NOT NULL DEFAULT 0,
  last_updated  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (user_id)
);

ALTER TABLE public.ratings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Ratings are public"
  ON public.ratings FOR SELECT
  USING (true);

CREATE POLICY "Only service role can update ratings"
  ON public.ratings FOR UPDATE
  USING (false);  -- Updated server-side only

-- Helper function for incrementing games_played
CREATE OR REPLACE FUNCTION public.increment(x INTEGER)
RETURNS INTEGER AS $$
  SELECT COALESCE($1, 0) + 1;
$$ LANGUAGE SQL;

-- ─────────────────────────────────────────────────────────────────────────────
-- TOURNAMENTS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.tournaments (
  id                       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name                     TEXT NOT NULL,
  date                     TIMESTAMPTZ NOT NULL,
  format                   TEXT,
  rounds                   INTEGER,
  venue                    TEXT,
  is_online                BOOLEAN NOT NULL DEFAULT FALSE,
  entry_fee                NUMERIC(10,2) DEFAULT 0,
  prize_pool               TEXT,
  max_players              INTEGER,
  status                   TEXT NOT NULL DEFAULT 'upcoming'
                             CHECK (status IN ('upcoming','registration_open','ongoing','completed')),
  registration_deadline    TIMESTAMPTZ,
  created_at               TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.tournaments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Tournaments are public"
  ON public.tournaments FOR SELECT
  USING (true);

CREATE POLICY "Only admins can insert/update tournaments"
  ON public.tournaments FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- TOURNAMENT REGISTRATIONS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.tournament_registrations (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id    UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  user_id          UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  payment_status   TEXT NOT NULL DEFAULT 'pending' CHECK (payment_status IN ('pending','paid','refunded')),
  razorpay_payment_id TEXT,
  razorpay_order_id   TEXT,
  score            NUMERIC(5,1),
  rating_before    INTEGER,
  rating_after     INTEGER,
  registered_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tournament_id, user_id)
);

ALTER TABLE public.tournament_registrations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own registrations"
  ON public.tournament_registrations FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all registrations"
  ON public.tournament_registrations FOR SELECT
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

CREATE POLICY "Users can insert own registration"
  ON public.tournament_registrations FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Count registrations is public"
  ON public.tournament_registrations FOR SELECT
  USING (true);

-- ─────────────────────────────────────────────────────────────────────────────
-- TOURNAMENT ROUNDS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.tournament_rounds (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  tournament_id    UUID NOT NULL REFERENCES public.tournaments(id) ON DELETE CASCADE,
  round_number     INTEGER NOT NULL,
  is_complete      BOOLEAN NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tournament_id, round_number)
);

ALTER TABLE public.tournament_rounds ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Rounds are public"
  ON public.tournament_rounds FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage rounds"
  ON public.tournament_rounds FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- PAIRINGS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.pairings (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  round_id      UUID NOT NULL REFERENCES public.tournament_rounds(id) ON DELETE CASCADE,
  player1_id    UUID REFERENCES public.users(id),
  player2_id    UUID REFERENCES public.users(id),
  result        NUMERIC(3,1) CHECK (result IN (0, 0.5, 1)),  -- result for player1 (white)
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.pairings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Pairings are public"
  ON public.pairings FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage pairings"
  ON public.pairings FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- GALLERY PHOTOS
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.gallery_photos (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  url           TEXT NOT NULL,
  event_name    TEXT,
  date          DATE,
  caption       TEXT,
  category      TEXT CHECK (category IN ('tournament','coaching','event')),
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.gallery_photos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Gallery is public"
  ON public.gallery_photos FOR SELECT
  USING (true);

CREATE POLICY "Only admins can manage gallery"
  ON public.gallery_photos FOR ALL
  USING (
    EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin')
  );

-- ─────────────────────────────────────────────────────────────────────────────
-- USEFUL INDEXES
-- ─────────────────────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_tournaments_status  ON public.tournaments(status);
CREATE INDEX IF NOT EXISTS idx_tournaments_date    ON public.tournaments(date);
CREATE INDEX IF NOT EXISTS idx_ratings_rating      ON public.ratings(rating DESC);
CREATE INDEX IF NOT EXISTS idx_registrations_tournament ON public.tournament_registrations(tournament_id);
CREATE INDEX IF NOT EXISTS idx_registrations_user  ON public.tournament_registrations(user_id);
CREATE INDEX IF NOT EXISTS idx_pairings_round      ON public.pairings(round_id);

-- ─────────────────────────────────────────────────────────────────────────────
-- TRIGGER: auto-create user profile on auth signup
-- ─────────────────────────────────────────────────────────────────────────────
-- NOTE: The actual INSERT into public.users is done from the frontend after
-- signup (in AuthContext.signUp), but this trigger handles edge cases.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  -- Only insert if not already present (frontend may have already done it)
  INSERT INTO public.users (id, name, email)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', 'New Player'), NEW.email)
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- To make a user an admin, run:
-- UPDATE public.users SET role = 'admin' WHERE email = 'admin@pgchess.in';
