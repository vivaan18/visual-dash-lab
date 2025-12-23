-- Drop the problematic policies that cause infinite recursion
DROP POLICY IF EXISTS "Anyone can view dashboards with active shares" ON public.dashboards;
DROP POLICY IF EXISTS "Users with edit permission can update dashboards" ON public.dashboards;

-- Create a security definer function to check if dashboard has active shares
CREATE OR REPLACE FUNCTION public.dashboard_has_active_share(dashboard_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.dashboard_shares
    WHERE dashboard_shares.dashboard_id = $1
    AND dashboard_shares.is_active = true
    AND (dashboard_shares.expires_at IS NULL OR dashboard_shares.expires_at > now())
  );
$$;

-- Create a security definer function to check edit permission
CREATE OR REPLACE FUNCTION public.has_dashboard_edit_permission(dashboard_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.dashboard_shares
    WHERE dashboard_shares.dashboard_id = $1
    AND dashboard_shares.is_active = true
    AND dashboard_shares.permission = 'edit'
    AND (dashboard_shares.expires_at IS NULL OR dashboard_shares.expires_at > now())
  );
$$;

-- Update the existing SELECT policy to include shared dashboards
DROP POLICY IF EXISTS "Users can view their own dashboards" ON public.dashboards;
CREATE POLICY "Users can view their own dashboards or shared dashboards"
  ON public.dashboards FOR SELECT
  USING (
    auth.uid() = user_id 
    OR is_public = true 
    OR public.dashboard_has_active_share(id)
  );

-- Create UPDATE policy for users with edit permission
CREATE POLICY "Owners or users with edit permission can update dashboards"
  ON public.dashboards FOR UPDATE
  USING (
    auth.uid() = user_id 
    OR public.has_dashboard_edit_permission(id)
  );