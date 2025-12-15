import { useState } from 'react';
import { Users, Copy, Check, Share2, Link } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from 'sonner';

interface ShareEstimateDialogProps {
  estimateId?: string;
  projectName: string;
}

export function ShareEstimateDialog({ estimateId, projectName }: ShareEstimateDialogProps) {
  const [copied, setCopied] = useState(false);
  const [open, setOpen] = useState(false);

  // Generate a shareable link (in a real app, this would create a unique share token)
  const shareLink = estimateId 
    ? `${window.location.origin}?share=${estimateId}`
    : window.location.href;

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareLink);
      setCopied(true);
      toast.success('Link copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error('Failed to copy link');
    }
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Project Estimate: ${projectName}`,
          text: `Check out this project estimate for ${projectName}`,
          url: shareLink,
        });
      } catch (err) {
        // User cancelled or share failed
      }
    } else {
      copyLink();
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Users className="w-4 h-4 mr-2" />
          Share
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="w-5 h-5" />
            Share Estimate
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div>
            <p className="text-sm text-muted-foreground mb-3">
              Share this link with your team members to collaborate on this estimate.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <Link className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input 
                value={shareLink} 
                readOnly 
                className="pl-10 text-sm"
              />
            </div>
            <Button onClick={copyLink} variant="outline" size="icon">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            </Button>
          </div>

          <div className="flex flex-col gap-2">
            <Button onClick={shareNative} className="w-full">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
            
            <p className="text-xs text-center text-muted-foreground">
              Anyone with this link can view and edit this estimate
            </p>
          </div>

          <div className="pt-4 border-t">
            <h4 className="text-sm font-medium mb-3">Team Features</h4>
            <ul className="text-sm text-muted-foreground space-y-2">
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                Real-time collaborative editing
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                See who's viewing the estimate
              </li>
              <li className="flex items-center gap-2">
                <Check className="w-4 h-4 text-primary" />
                Comments and discussions
              </li>
            </ul>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}