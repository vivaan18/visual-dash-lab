import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardComponent } from '@/pages/Index';
import { toast } from '@/hooks/use-toast';

interface Dashboard {
  id: string;
  title: string;
  description: string | null;
  components: DashboardComponent[];
  is_public: boolean;
  created_at: string;
  updated_at: string;
}

export const useDashboards = () => {
  const { user } = useAuth();
  const [dashboards, setDashboards] = useState<Dashboard[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDashboards = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('dashboards')
        .select('*')
        .eq('user_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;
      setDashboards((data || []).map(d => ({
        ...d,
        components: Array.isArray(d.components) ? (d.components as unknown as DashboardComponent[]) : []
      })));
    } catch (error) {
      console.error('Error fetching dashboards:', error);
      toast({
        title: "Error",
        description: "Failed to fetch your dashboards.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboards();
  }, [user]);

  const saveDashboard = async (
    title: string, 
    components: DashboardComponent[], 
    description?: string,
    isPublic = false
  ) => {
    if (!user) {
      toast({
        title: "Authentication Required",
        description: "Please sign in to save dashboards.",
        variant: "destructive"
      });
      return null;
    }

    try {
      const { data, error } = await supabase
        .from('dashboards')
        .insert({
          user_id: user.id,
          title,
          description,
          components: components as any,
          is_public: isPublic
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Dashboard Saved",
        description: `"${title}" has been saved successfully.`,
      });

      fetchDashboards(); // Refresh the list
      return data;
    } catch (error) {
      console.error('Error saving dashboard:', error);
      toast({
        title: "Error",
        description: "Failed to save dashboard.",
        variant: "destructive"
      });
      return null;
    }
  };

  const updateDashboard = async (
    id: string,
    updates: Partial<Omit<Dashboard, 'id' | 'user_id' | 'created_at' | 'updated_at'>>
  ) => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('dashboards')
        .update(updates as any)
        .eq('id', id)
        .eq('user_id', user.id)
        .select()
        .single();

      if (error) throw error;

      toast({
        title: "Dashboard Updated",
        description: "Your dashboard has been updated successfully.",
      });

      fetchDashboards();
      return data;
    } catch (error) {
      console.error('Error updating dashboard:', error);
      toast({
        title: "Error",
        description: "Failed to update dashboard.",
        variant: "destructive"
      });
      return null;
    }
  };

  const deleteDashboard = async (id: string) => {
    if (!user) return false;

    try {
      const { error } = await supabase
        .from('dashboards')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) throw error;

      toast({
        title: "Dashboard Deleted",
        description: "Dashboard has been deleted successfully.",
      });

      fetchDashboards();
      return true;
    } catch (error) {
      console.error('Error deleting dashboard:', error);
      toast({
        title: "Error",
        description: "Failed to delete dashboard.",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    dashboards,
    loading,
    saveDashboard,
    updateDashboard,
    deleteDashboard,
    refetch: fetchDashboards
  };
};