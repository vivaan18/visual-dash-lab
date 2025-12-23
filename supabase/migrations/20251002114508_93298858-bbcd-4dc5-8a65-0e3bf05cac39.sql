-- Create enum for share permissions
CREATE TYPE share_permission AS ENUM ('view', 'comment', 'edit');

-- Create dashboard_shares table for managing shared dashboard links
CREATE TABLE public.dashboard_shares (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dashboard_id uuid NOT NULL REFERENCES public.dashboards(id) ON DELETE CASCADE,
  share_token text UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(16), 'hex'),
  permission share_permission NOT NULL DEFAULT 'view',
  created_by uuid NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  is_active boolean NOT NULL DEFAULT true
);

-- Create dashboard_comments table for storing comments
CREATE TABLE public.dashboard_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  dashboard_id uuid NOT NULL REFERENCES public.dashboards(id) ON DELETE CASCADE,
  component_id text,
  user_id uuid,
  user_name text NOT NULL,
  user_email text,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS on both tables
ALTER TABLE public.dashboard_shares ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.dashboard_comments ENABLE ROW LEVEL SECURITY;

-- RLS Policies for dashboard_shares
CREATE POLICY "Dashboard owners can create shares"
  ON public.dashboard_shares FOR INSERT
  WITH CHECK (
    created_by = auth.uid() AND
    EXISTS (
      SELECT 1 FROM public.dashboards 
      WHERE id = dashboard_shares.dashboard_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Dashboard owners can view their shares"
  ON public.dashboard_shares FOR SELECT
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.dashboards 
      WHERE id = dashboard_shares.dashboard_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Dashboard owners can update their shares"
  ON public.dashboard_shares FOR UPDATE
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.dashboards 
      WHERE id = dashboard_shares.dashboard_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Dashboard owners can delete their shares"
  ON public.dashboard_shares FOR DELETE
  USING (
    created_by = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.dashboards 
      WHERE id = dashboard_shares.dashboard_id 
      AND user_id = auth.uid()
    )
  );

-- RLS Policies for dashboard_comments
CREATE POLICY "Anyone can view comments on shared dashboards"
  ON public.dashboard_comments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.dashboards 
      WHERE id = dashboard_comments.dashboard_id 
      AND (user_id = auth.uid() OR is_public = true)
    ) OR
    EXISTS (
      SELECT 1 FROM public.dashboard_shares
      WHERE dashboard_id = dashboard_comments.dashboard_id
      AND is_active = true
      AND (expires_at IS NULL OR expires_at > now())
    )
  );

CREATE POLICY "Users with comment permission can create comments"
  ON public.dashboard_comments FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.dashboards 
      WHERE id = dashboard_comments.dashboard_id 
      AND user_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.dashboard_shares
      WHERE dashboard_id = dashboard_comments.dashboard_id
      AND is_active = true
      AND (expires_at IS NULL OR expires_at > now())
      AND permission IN ('comment', 'edit')
    )
  );

CREATE POLICY "Users can update their own comments"
  ON public.dashboard_comments FOR UPDATE
  USING (user_id = auth.uid() OR user_email = auth.jwt()->>'email');

CREATE POLICY "Users can delete their own comments"
  ON public.dashboard_comments FOR DELETE
  USING (user_id = auth.uid() OR user_email = auth.jwt()->>'email');

-- Create indexes for performance
CREATE INDEX idx_dashboard_shares_dashboard_id ON public.dashboard_shares(dashboard_id);
CREATE INDEX idx_dashboard_shares_token ON public.dashboard_shares(share_token);
CREATE INDEX idx_dashboard_comments_dashboard_id ON public.dashboard_comments(dashboard_id);
CREATE INDEX idx_dashboard_comments_component_id ON public.dashboard_comments(component_id);

-- Create trigger to update updated_at on comments
CREATE TRIGGER update_dashboard_comments_updated_at
  BEFORE UPDATE ON public.dashboard_comments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();