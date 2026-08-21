-- Authentication currently uses the Supabase publishable key from the Worker.
-- These narrowly scoped policies match the application API's custom JWT checks.

ALTER TABLE public."User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."User" ALTER COLUMN "updatedAt" SET DEFAULT CURRENT_TIMESTAMP;

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

DROP POLICY IF EXISTS public_auth_user_select ON public."User";
CREATE POLICY public_auth_user_select
  ON public."User"
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS public_auth_user_update ON public."User";
CREATE POLICY public_auth_user_update
  ON public."User"
  FOR UPDATE
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);

ALTER TABLE public."EmailVerificationCode" ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS public_auth_verification_code_all ON public."EmailVerificationCode";
CREATE POLICY public_auth_verification_code_all
  ON public."EmailVerificationCode"
  FOR ALL
  TO anon, authenticated
  USING (true)
  WITH CHECK (true);
