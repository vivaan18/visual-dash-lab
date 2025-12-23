import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';

interface Comment {
  id: string;
  dashboard_id: string;
  component_id: string | null;
  user_id: string | null;
  user_name: string;
  user_email: string | null;
  content: string;
  created_at: string;
  updated_at: string;
}

export const useComments = (dashboardId: string | null) => {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchComments = async () => {
    if (!dashboardId) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('dashboard_comments')
        .select('*')
        .eq('dashboard_id', dashboardId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setComments(data || []);
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [dashboardId]);

  const addComment = async (content: string, componentId?: string) => {
    if (!dashboardId || !content.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const userName = user?.email || 'Anonymous';
      const userEmail = user?.email || null;

      const { error } = await supabase
        .from('dashboard_comments')
        .insert({
          dashboard_id: dashboardId,
          component_id: componentId || null,
          user_id: user?.id || null,
          user_name: userName,
          user_email: userEmail,
          content: content.trim(),
        });

      if (error) throw error;

      toast({
        title: "Comment Added",
        description: "Your comment has been posted.",
      });

      await fetchComments();
    } catch (error) {
      console.error('Error adding comment:', error);
      toast({
        title: "Error",
        description: "Failed to add comment.",
        variant: "destructive"
      });
    }
  };

  const deleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('dashboard_comments')
        .delete()
        .eq('id', commentId);

      if (error) throw error;

      toast({
        title: "Comment Deleted",
        description: "Comment has been removed.",
      });

      await fetchComments();
    } catch (error) {
      console.error('Error deleting comment:', error);
      toast({
        title: "Error",
        description: "Failed to delete comment.",
        variant: "destructive"
      });
    }
  };

  return {
    comments,
    loading,
    addComment,
    deleteComment,
    refetch: fetchComments,
  };
};
