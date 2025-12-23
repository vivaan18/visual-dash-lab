import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { supabase } from '@/integrations/supabase/client';
import { useComments } from '@/hooks/useComments';
import { MessageSquare, AlertCircle, Loader2 } from 'lucide-react';
import Canvas from '@/components/dashboard-builder/Canvas';
import CommentsPanel from '@/components/dashboard-builder/CommentsPanel';
import type { DashboardComponent } from '@/types/dashboard';

interface DashboardData {
  id: string;
  title: string;
  description: string | null;
  components: DashboardComponent[];
  is_public: boolean;
}

interface ShareData {
  permission: 'view' | 'comment' | 'edit';
  dashboard_id: string;
}

const SharedDashboard = () => {
  const { token } = useParams<{ token: string }>();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [shareData, setShareData] = useState<ShareData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showComments, setShowComments] = useState(false);
  const [components, setComponents] = useState<DashboardComponent[]>([]);
  const [selectedComponent, setSelectedComponent] = useState<string | null>(null);
  const canvasRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadSharedDashboard();
  }, [token]);

  const loadSharedDashboard = async () => {
    if (!token) {
      setError('Invalid share link');
      setLoading(false);
      return;
    }

    console.log('Loading shared dashboard with token:', token);
    setLoading(true);
    try {
      // Get share data
      const { data: shareInfo, error: shareError } = await supabase
        .from('dashboard_shares')
        .select('permission, dashboard_id, expires_at, is_active')
        .eq('share_token', token)
        .eq('is_active', true)
        .maybeSingle();

      console.log('Share info result:', { shareInfo, shareError });

      if (shareError) {
        console.error('Share error:', shareError);
        setError('Error loading share link: ' + shareError.message);
        setLoading(false);
        return;
      }

      if (!shareInfo) {
        setError('Share link not found or expired');
        setLoading(false);
        return;
      }

      // Check if expired
      if (shareInfo.expires_at && new Date(shareInfo.expires_at) < new Date()) {
        setError('This share link has expired');
        setLoading(false);
        return;
      }

      setShareData({
        permission: shareInfo.permission,
        dashboard_id: shareInfo.dashboard_id,
      });

      // Get dashboard data
      const { data: dashboardData, error: dashboardError } = await supabase
        .from('dashboards')
        .select('*')
        .eq('id', shareInfo.dashboard_id)
        .maybeSingle();

      console.log('Dashboard data result:', { dashboardData, dashboardError });

      if (dashboardError) {
        console.error('Dashboard error:', dashboardError);
        setError('Error loading dashboard: ' + dashboardError.message);
        setLoading(false);
        return;
      }

      if (!dashboardData) {
        setError('Dashboard not found');
        setLoading(false);
        return;
      }

      const comps = Array.isArray(dashboardData.components) 
        ? (dashboardData.components as unknown as DashboardComponent[])
        : [];

      setDashboard({
        id: dashboardData.id,
        title: dashboardData.title,
        description: dashboardData.description,
        components: comps,
        is_public: dashboardData.is_public,
      });

      setComponents(comps);
    } catch (err) {
      console.error('Error loading shared dashboard:', err);
      setError('Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  const updateComponent = (id: string, updates: Partial<DashboardComponent>) => {
    if (shareData?.permission !== 'edit') return;
    
    const newComponents = components.map(comp => 
      comp.id === id ? { ...comp, ...updates } : comp
    );
    setComponents(newComponents);
  };

  const handleSaveChanges = async () => {
    if (!dashboard || shareData?.permission !== 'edit') return;

    try {
      const { error } = await supabase
        .from('dashboards')
        .update({ components: components as any })
        .eq('id', dashboard.id);

      if (error) throw error;

      toast({
        title: "Changes Saved",
        description: "Dashboard has been updated successfully.",
      });
    } catch (err) {
      console.error('Error saving changes:', err);
      toast({
        title: "Error",
        description: "Failed to save changes.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-background">
        <div className="text-center">
          <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error || !dashboard || !shareData) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-background">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
            <h2 className="text-xl font-bold mb-2">Unable to Load Dashboard</h2>
            <p className="text-muted-foreground mb-4">
              {error || 'This dashboard is not available'}
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-background">
      {/* Header */}
      <header className="bg-card/80 backdrop-blur-sm border-b border-border px-6 py-4 shadow-card-enhanced">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
              {dashboard.title}
            </h1>
            {dashboard.description && (
              <p className="text-sm text-muted-foreground mt-1">{dashboard.description}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Badge variant={
              shareData.permission === 'view' ? 'secondary' :
              shareData.permission === 'comment' ? 'default' : 'destructive'
            }>
              {shareData.permission === 'view' ? 'View Only' :
               shareData.permission === 'comment' ? 'Can Comment' : 'Can Edit'}
            </Badge>
            
            {(shareData.permission === 'comment' || shareData.permission === 'edit') && (
              <>
                <Separator orientation="vertical" className="h-6" />
                <Button
                  variant={showComments ? "default" : "outline"}
                  size="sm"
                  onClick={() => setShowComments(!showComments)}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Comments
                </Button>
              </>
            )}

            {shareData.permission === 'edit' && (
              <Button size="sm" onClick={handleSaveChanges}>
                Save Changes
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex h-[calc(100vh-80px)]">
        {/* Canvas */}
        <div className="flex-1 relative">
          <Canvas
            ref={canvasRef}
            components={components}
            selectedComponent={selectedComponent}
            onSelectComponent={setSelectedComponent}
            onUpdateComponent={updateComponent}
            onDeleteComponent={() => {}}
            onBringToFront={() => {}}
            onSendToBack={() => {}}
            isPreviewMode={shareData.permission === 'view'}
            isDarkMode={false}
            gridSnap={false}
          />
        </div>

        {/* Comments Panel */}
        {showComments && (shareData.permission === 'comment' || shareData.permission === 'edit') && (
          <div className="w-80 bg-card/60 backdrop-blur-sm border-l border-border shadow-card-enhanced">
            <CommentsPanel
              dashboardId={dashboard.id}
              selectedComponentId={selectedComponent}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default SharedDashboard;
