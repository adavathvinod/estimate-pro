import { useState } from 'react';
import { MessageSquare, Send, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';

interface Comment {
  id: string;
  author: string;
  content: string;
  section: string;
  createdAt: Date;
}

interface CommentsSectionProps {
  section: string;
  sectionLabel: string;
}

export function CommentsSection({ section, sectionLabel }: CommentsSectionProps) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isExpanded, setIsExpanded] = useState(false);

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    
    const comment: Comment = {
      id: crypto.randomUUID(),
      author: 'Team Member',
      content: newComment.trim(),
      section,
      createdAt: new Date(),
    };
    
    setComments(prev => [...prev, comment]);
    setNewComment('');
  };

  const sectionComments = comments.filter(c => c.section === section);

  return (
    <div className="mt-4 border-t pt-4">
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <MessageSquare className="w-4 h-4" />
        <span>Comments ({sectionComments.length})</span>
      </button>

      {isExpanded && (
        <div className="mt-3 space-y-3 animate-fade-in">
          {sectionComments.length > 0 && (
            <div className="space-y-2 max-h-48 overflow-auto">
              {sectionComments.map(comment => (
                <div key={comment.id} className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <User className="w-3 h-3" />
                    <span className="text-xs font-medium">{comment.author}</span>
                    <span className="text-xs text-muted-foreground">
                      {comment.createdAt.toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-sm">{comment.content}</p>
                </div>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder={`Add comment about ${sectionLabel}...`}
              className="min-h-[60px] text-sm"
            />
            <Button 
              size="sm" 
              onClick={handleAddComment}
              disabled={!newComment.trim()}
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
