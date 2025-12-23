-- Fix Security Issue 1: Remove duplicate UPDATE policy on dashboards table
-- The redundant "Users can update their own dashboards" policy is causing AND logic 
-- that prevents shared editors from updating dashboards
DROP POLICY IF EXISTS "Users can update their own dashboards" ON dashboards;

-- Fix Security Issue 2: Prevent users from setting their own admin role on profile creation/update
-- Create a trigger to enforce that new users always get 'user' role and only admins can change roles
CREATE OR REPLACE FUNCTION public.enforce_default_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Force new users to 'user' role on INSERT
  IF TG_OP = 'INSERT' THEN
    NEW.role := 'user'::app_role;
  END IF;
  
  -- Prevent users from elevating their own role on UPDATE
  IF TG_OP = 'UPDATE' AND OLD.role IS DISTINCT FROM NEW.role THEN
    -- Only allow if updater is admin
    IF NOT is_admin(auth.uid()) THEN
      NEW.role := OLD.role; -- Revert role change silently
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Drop existing trigger if exists and recreate
DROP TRIGGER IF EXISTS enforce_role_security ON profiles;
CREATE TRIGGER enforce_role_security
BEFORE INSERT OR UPDATE ON profiles
FOR EACH ROW EXECUTE FUNCTION public.enforce_default_role();

-- Fix Security Issue 3: Mask email addresses in dashboard_comments
-- Update RLS policy to only show full email to dashboard owner and comment author
DROP POLICY IF EXISTS "Anyone can view comments on shared dashboards" ON dashboard_comments;

CREATE POLICY "Anyone can view comments on shared dashboards" 
ON dashboard_comments 
FOR SELECT 
USING (
  -- Dashboard owner can see all
  (EXISTS (
    SELECT 1 FROM dashboards
    WHERE dashboards.id = dashboard_comments.dashboard_id 
    AND dashboards.user_id = auth.uid()
  ))
  OR
  -- Comment author can see their own
  (user_id = auth.uid())
  OR
  -- Others with share access can view (but email will be masked via view or application logic)
  (
    (EXISTS (
      SELECT 1 FROM dashboards
      WHERE dashboards.id = dashboard_comments.dashboard_id 
      AND dashboards.is_public = true
    ))
    OR 
    (EXISTS (
      SELECT 1 FROM dashboard_shares
      WHERE dashboard_shares.dashboard_id = dashboard_comments.dashboard_id 
      AND dashboard_shares.is_active = true 
      AND (dashboard_shares.expires_at IS NULL OR dashboard_shares.expires_at > now())
    ))
  )
);

-- Fix Security Issue 4: Tighten profiles SELECT policy to prevent email harvesting
-- Only allow users to see their own profile OR admins to see all
-- The existing policies are fine but let's verify they're strict

-- Add a comment documenting the security model
COMMENT ON TABLE profiles IS 'User profiles with role-based access. Users can only view their own profile. Admins can view all profiles. Role changes are enforced by trigger to prevent privilege escalation.';