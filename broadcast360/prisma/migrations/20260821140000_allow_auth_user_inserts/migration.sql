-- Allow the custom authentication API (which uses the Supabase publishable/anon key)
-- to create normal users, plus only the explicitly configured admin Gmail accounts.
-- This is intentionally limited to active Gmail identities and does not grant broad
-- UPDATE/DELETE access to the public role.

ALTER TABLE public."User" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS public_auth_user_insert ON public."User";

CREATE POLICY public_auth_user_insert
  ON public."User"
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (
    (
      "role" = 'USER'::public."Role"
      AND "status" = 'ACTIVE'::public."UserStatus"
      AND position('@' in lower("email")) > 1
      AND right(lower("email"), 10) = '@gmail.com'
    )
    OR (
      "role" = 'ADMIN'::public."Role"
      AND lower("email") IN ('copy2723@gmail.com', 'minbanyarchan639@gmail.com')
      AND "status" = 'ACTIVE'::public."UserStatus"
    )
  );
