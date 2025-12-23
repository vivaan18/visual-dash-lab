import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useShareDashboard, SharePermission } from '@/hooks/useShareDashboard';
import { Copy, Trash2, ExternalLink, Clock } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface ShareDialogProps {
  isOpen: boolean;
  onClose: () => void;
  dashboardId: string | null;
  dashboardTitle: string;
}

const ShareDialog: React.FC<ShareDialogProps> = ({ isOpen, onClose, dashboardId, dashboardTitle }) => {
  const { shareLinks, loading, fetchShareLinks, createShareLink, revokeShareLink, getShareUrl } = useShareDashboard(dashboardId);
  const [permission, setPermission] = useState<SharePermission>('view');
  const [expiresInDays, setExpiresInDays] = useState<string>('');

  useEffect(() => {
    if (isOpen && dashboardId) {
      fetchShareLinks();
    }
  }, [isOpen, dashboardId]);

  const handleCreateLink = async () => {
    const expires = expiresInDays ? parseInt(expiresInDays) : undefined;
    await createShareLink(permission, expires);
  };

  const handleCopyLink = (token: string) => {
    const url = getShareUrl(token);
    navigator.clipboard.writeText(url);
    toast({
      title: "Link Copied",
      description: "Share link has been copied to clipboard.",
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getPermissionColor = (perm: SharePermission) => {
    switch (perm) {
      case 'view': return 'secondary';
      case 'comment': return 'default';
      case 'edit': return 'destructive';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Share "{dashboardTitle}"</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Create New Link */}
          <Card>
            <CardContent className="pt-6">
              <h3 className="text-sm font-semibold mb-4">Create New Share Link</h3>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="permission">Permission</Label>
                    <Select value={permission} onValueChange={(v) => setPermission(v as SharePermission)}>
                      <SelectTrigger id="permission">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="view">View Only</SelectItem>
                        <SelectItem value="comment">Comment Only</SelectItem>
                        <SelectItem value="edit">Edit</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="expires">Expires In (days)</Label>
                    <Input
                      id="expires"
                      type="number"
                      placeholder="Never"
                      value={expiresInDays}
                      onChange={(e) => setExpiresInDays(e.target.value)}
                      min="1"
                    />
                  </div>
                </div>
                <Button onClick={handleCreateLink} className="w-full">
                  Generate Share Link
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Existing Links */}
          <div>
            <h3 className="text-sm font-semibold mb-3">Active Share Links</h3>
            {loading ? (
              <p className="text-sm text-muted-foreground">Loading...</p>
            ) : shareLinks.length === 0 ? (
              <p className="text-sm text-muted-foreground">No active share links yet.</p>
            ) : (
              <div className="space-y-3">
                {shareLinks.map((link) => (
                  <Card key={link.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant={getPermissionColor(link.permission)}>
                              {link.permission}
                            </Badge>
                            {link.expires_at && (
                              <Badge variant="outline" className="text-xs">
                                <Clock className="h-3 w-3 mr-1" />
                                Expires {formatDate(link.expires_at)}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Input
                              value={getShareUrl(link.share_token)}
                              readOnly
                              className="text-xs"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => handleCopyLink(link.share_token)}
                          >
                            <Copy className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="outline"
                            onClick={() => window.open(getShareUrl(link.share_token), '_blank')}
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                          <Button
                            size="icon"
                            variant="destructive"
                            onClick={() => revokeShareLink(link.id)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ShareDialog;
