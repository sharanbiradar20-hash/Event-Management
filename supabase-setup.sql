-- ============================================================
-- AuraEvents: Supabase Database Setup
-- ============================================================
-- Run this SQL in your Supabase Dashboard → SQL Editor
-- Dashboard URL: https://supabase.com/dashboard
-- ============================================================

-- 1. CREATE THE EVENTS TABLE (if it doesn't exist already)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.events (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title       VARCHAR(255) NOT NULL,
  description VARCHAR(5000),
  date        TIMESTAMPTZ NOT NULL,
  location    VARCHAR(500) NOT NULL,
  price       NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (price >= 0),
  image_url   TEXT,
  organizer_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. CREATE THE TICKETS TABLE (to track purchases)
-- ============================================================
CREATE TABLE IF NOT EXISTS public.tickets (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  event_id        UUID NOT NULL REFERENCES public.events(id) ON DELETE CASCADE,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  stripe_session_id TEXT,
  amount_paid     NUMERIC(10, 2) NOT NULL DEFAULT 0,
  status          VARCHAR(50) NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'cancelled', 'refunded')),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(event_id, user_id, stripe_session_id)
);

-- 3. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tickets ENABLE ROW LEVEL SECURITY;

-- 4. RLS POLICIES — EVENTS
-- ============================================================

-- Policy: Anyone (including anonymous/unauthenticated) can READ all events
CREATE POLICY "Anyone can view events"
  ON public.events
  FOR SELECT
  USING (true);

-- Policy: Authenticated users can INSERT their own events
CREATE POLICY "Authenticated users can create events"
  ON public.events
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = organizer_id);

-- Policy: Users can UPDATE only their own events
CREATE POLICY "Users can update own events"
  ON public.events
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = organizer_id)
  WITH CHECK (auth.uid() = organizer_id);

-- Policy: Users can DELETE only their own events
CREATE POLICY "Users can delete own events"
  ON public.events
  FOR DELETE
  TO authenticated
  USING (auth.uid() = organizer_id);

-- 5. RLS POLICIES — TICKETS
-- ============================================================

-- Policy: Users can view their own tickets
CREATE POLICY "Users can view own tickets"
  ON public.tickets
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Event organizers can view tickets for their events
CREATE POLICY "Organizers can view event tickets"
  ON public.tickets
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.events
      WHERE events.id = tickets.event_id
      AND events.organizer_id = auth.uid()
    )
  );

-- Policy: Authenticated users can insert their own tickets (for free events / after payment)
CREATE POLICY "Users can create own tickets"
  ON public.tickets
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 6. CREATE INDEXES FOR PERFORMANCE
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_events_date ON public.events (date ASC);
CREATE INDEX IF NOT EXISTS idx_events_organizer ON public.events (organizer_id);
CREATE INDEX IF NOT EXISTS idx_events_price ON public.events (price);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON public.events (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_tickets_event ON public.tickets (event_id);
CREATE INDEX IF NOT EXISTS idx_tickets_user ON public.tickets (user_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON public.tickets (status);

-- 7. (OPTIONAL) SEED DATA - A sample event for testing
-- ============================================================
-- Uncomment the lines below if you want to insert sample data.
-- Replace the organizer_id with an actual user UUID from auth.users.
--
-- INSERT INTO public.events (title, description, date, location, price, image_url, organizer_id)
-- VALUES (
--   'Aura Launch Party',
--   'Celebrating the launch of the AuraEvents platform! Join us for an evening of music, networking, and free food.',
--   '2026-08-01T18:00:00+00:00',
--   'Downtown Convention Center, NY',
--   0,
--   'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&auto=format&fit=crop',
--   'YOUR_USER_UUID_HERE'
-- );

-- ============================================================
-- DONE! Your Supabase database is now configured for AuraEvents.
-- ============================================================
