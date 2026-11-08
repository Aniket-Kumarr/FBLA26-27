-- Run this in Supabase SQL Editor (Dashboard > SQL Editor) so sign-in/signup work with the anon key (no service role needed).
-- These functions bypass RLS so the app can look up and upsert users for NextAuth.

-- Get user by email for credentials sign-in (returns one row or null)
CREATE OR REPLACE FUNCTION get_user_for_auth(email_input text)
RETURNS TABLE (id uuid, email text, name text, password_hash text, provider text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT u.id, u.email, u.name, u.password_hash, u.provider
  FROM users u
  WHERE u.email = lower(email_input);
$$;

GRANT EXECUTE ON FUNCTION get_user_for_auth(text) TO anon;
GRANT EXECUTE ON FUNCTION get_user_for_auth(text) TO authenticated;
GRANT EXECUTE ON FUNCTION get_user_for_auth(text) TO service_role;

-- Upsert Google user (insert or update) for Google OAuth sign-in
CREATE OR REPLACE FUNCTION upsert_google_user(
  p_email text,
  p_name text,
  p_provider_id text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO users (email, name, provider, provider_id, password_hash)
  VALUES (lower(p_email), p_name, 'google', p_provider_id, null)
  ON CONFLICT (email) DO UPDATE SET
    provider = 'google',
    provider_id = p_provider_id,
    name = COALESCE(EXCLUDED.name, users.name),
    updated_at = timezone('utc', now());
END;
$$;

GRANT EXECUTE ON FUNCTION upsert_google_user(text, text, text) TO anon;
GRANT EXECUTE ON FUNCTION upsert_google_user(text, text, text) TO authenticated;
GRANT EXECUTE ON FUNCTION upsert_google_user(text, text, text) TO service_role;
