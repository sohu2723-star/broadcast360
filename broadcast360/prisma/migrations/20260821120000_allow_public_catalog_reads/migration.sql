-- Public browsing data is intentionally readable without a user session.
-- Account, premium, support, payment, and admin tables remain protected.

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'Channel' AND policyname = 'public_read_channel') THEN
    CREATE POLICY public_read_channel ON public."Channel" FOR SELECT TO anon, authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'Movie' AND policyname = 'public_read_movie') THEN
    CREATE POLICY public_read_movie ON public."Movie" FOR SELECT TO anon, authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'Series' AND policyname = 'public_read_series') THEN
    CREATE POLICY public_read_series ON public."Series" FOR SELECT TO anon, authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'Episode' AND policyname = 'public_read_episode') THEN
    CREATE POLICY public_read_episode ON public."Episode" FOR SELECT TO anon, authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'News' AND policyname = 'public_read_news') THEN
    CREATE POLICY public_read_news ON public."News" FOR SELECT TO anon, authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'Entertainment' AND policyname = 'public_read_entertainment') THEN
    CREATE POLICY public_read_entertainment ON public."Entertainment" FOR SELECT TO anon, authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'Stream' AND policyname = 'public_read_stream') THEN
    CREATE POLICY public_read_stream ON public."Stream" FOR SELECT TO anon, authenticated USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'Recording' AND policyname = 'public_read_recording') THEN
    CREATE POLICY public_read_recording ON public."Recording" FOR SELECT TO anon, authenticated USING (true);
  END IF;
END $$;
