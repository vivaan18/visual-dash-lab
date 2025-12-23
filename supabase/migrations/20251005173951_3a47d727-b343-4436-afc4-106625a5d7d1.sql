-- Allow anyone to read dashboard_shares by share_token (needed for shared links)
CREATE POLICY "Anyone can view shares by token"
  ON public.dashboard_shares FOR SELECT
  USING (is_active = true AND (expires_at IS NULL OR expires_at > now()));

-- Allow anyone to view dashboards that have active share links
CREATE POLICY "Anyone can view dashboards with active shares"
  ON public.dashboards FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.dashboard_shares
      WHERE dashboard_shares.dashboard_id = dashboards.id
      AND dashboard_shares.is_active = true
      AND (dashboard_shares.expires_at IS NULL OR dashboard_shares.expires_at > now())
    )
  );

-- Allow users with edit permission to update shared dashboards
CREATE POLICY "Users with edit permission can update dashboards"
  ON public.dashboards FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.dashboard_shares
      WHERE dashboard_shares.dashboard_id = dashboards.id
      AND dashboard_shares.is_active = true
      AND dashboard_shares.permission = 'edit'
      AND (dashboard_shares.expires_at IS NULL OR dashboard_shares.expires_at > now())
    )
  );