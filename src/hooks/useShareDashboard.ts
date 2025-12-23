import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

export type SharePermission = 'view' | 'comment' | 'edit';

interface ShareLink {
  id: string;
  share_token: string;
  permission: SharePermission;
  created_at: string;
  expires_at?: string;
  is_active: boolean;
}

export const useShareDashboard = (dashboardId: string | null) => {
  const [shareLinks, setShareLinks] = useState<ShareLink[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchShareLinks = async () => {
    if (!dashboardId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('dashboard_shares')
        .select('*')
        .eq('dashboard_id', dashboardId)
        .eq('is_active', true);

      if (error) throw error;
      setShareLinks(data || []);
    } catch (error) {
      console.error('Error fetching share links:', error);
      toast({
        title: "Error",
        description: "Failed to fetch share links.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const createShareLink = async (permission: SharePermission, expiresInDays?: number) => {
    if (!dashboardId) return null;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const expiresAt = expiresInDays 
        ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000).toISOString()
        : null;

      const { data, error } = await supabase
        .from('dashboard_shares')
        .insert({
          dashboard_id: dashboardId,
          permission,
          created_by: user.id,
          expires_at: expiresAt,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Share Link Created",
        description: `Created ${permission} link successfully.`,
      });

      await fetchShareLinks();
      return data;
    } catch (error) {
      console.error('Error creating share link:', error);
      toast({
        title: "Error",
        description: "Failed to create share link.",
        variant: "destructive"
      });
      return null;
    }
  };

  const revokeShareLink = async (shareId: string) => {
    try {
      const { error } = await supabase
        .from('dashboard_shares')
        .update({ is_active: false })
        .eq('id', shareId);

      if (error) throw error;

      toast({
        title: "Link Revoked",
        description: "Share link has been revoked.",
      });

      await fetchShareLinks();
    } catch (error) {
      console.error('Error revoking share link:', error);
      toast({
        title: "Error",
        description: "Failed to revoke share link.",
        variant: "destructive"
      });
    }
  };

  const getShareUrl = (token: string) => {
    return `${window.location.origin}/shared/${token}`;
  };

  return {
    shareLinks,
    loading,
    fetchShareLinks,
    createShareLink,
    revokeShareLink,
    getShareUrl,
  };
};
