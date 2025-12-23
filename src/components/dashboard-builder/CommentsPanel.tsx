import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useComments } from '@/hooks/useComments';
import { MessageSquare, Trash2, Send } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface CommentsPanelProps {
  dashboardId: string | null;
  selectedComponentId?: string | null;
}

const CommentsPanel: React.FC<CommentsPanelProps> = ({ dashboardId, selectedComponentId }) => {
  const { comments, loading, addComment, deleteComment } = useComments(dashboardId);
  const [newComment, setNewComment] = useState('');
  const [commentingOnComponent, setCommentingOnComponent] = useState(false);

  const filteredComments = selectedComponentId
    ? comments.filter(c => c.component_id === selectedComponentId)
    : comments;

  const handleSubmit = async () => {
    if (!newComment.trim()) return;
    
    await addComment(
      newComment,
      commentingOnComponent ? selectedComponentId || undefined : undefined
    );
    setNewComment('');
    setCommentingOnComponent(false);
  };

  return (
    <Card className="h-full flex flex-col">
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Comments
          {selectedComponentId && (
            <Badge variant="secondary" className="ml-auto text-xs">
              On Selected Component
            </Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col gap-3 overflow-hidden">
        {/* Comment Input */}
        <div className="space-y-2">
          <Textarea
            placeholder={
              commentingOnComponent && selectedComponentId
                ? "Comment on selected component..."
                : "Add a comment on this dashboard..."
            }
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            rows={3}
            className="resize-none"
          />
          <div className="flex items-center justify-between gap-2">
            {selectedComponentId && (
              <Button
                size="sm"
                variant={commentingOnComponent ? "default" : "outline"}
                onClick={() => setCommentingOnComponent(!commentingOnComponent)}
              >
                {commentingOnComponent ? "Commenting on component" : "Comment on component"}
              </Button>
            )}
            <Button size="sm" onClick={handleSubmit} className="ml-auto">
              <Send className="h-3 w-3 mr-1" />
              Post
            </Button>
          </div>
        </div>

        <Separator />

        {/* Comments List */}
        <ScrollArea className="flex-1">
          <div className="space-y-3 pr-4">
            {loading ? (
              <p className="text-sm text-muted-foreground text-center py-4">Loading comments...</p>
            ) : filteredComments.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No comments yet. Be the first to comment!
              </p>
            ) : (
              filteredComments.map((comment) => (
                <Card key={comment.id} className="bg-muted/50">
                  <CardContent className="p-3">
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-semibold truncate">
                            {comment.user_name}
                          </span>
                          {comment.component_id && (
                            <Badge variant="outline" className="text-xs">
                              On Component
                            </Badge>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="h-6 w-6"
                        onClick={() => deleteComment(comment.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                    <p className="text-sm whitespace-pre-wrap">{comment.content}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  );
};

export default CommentsPanel;
