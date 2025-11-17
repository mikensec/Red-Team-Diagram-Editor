import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Attachment } from '@/types/Diagram';
import { ChevronLeft, ChevronRight, ExternalLink, Link as LinkIcon, Image as ImageIcon, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { isValidUrl } from '@/utils/validation';
import { useToast } from '@/hooks/use-toast';
import { getAttachment } from '@/utils/indexedDB';

interface AttachmentViewerProps {
  attachments: Attachment[];
  initialIndex?: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const AttachmentViewer = ({
  attachments,
  initialIndex = 0,
  open,
  onOpenChange,
}: AttachmentViewerProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [loadedAttachments, setLoadedAttachments] = useState<Attachment[]>(attachments);
  const [loadingImageId, setLoadingImageId] = useState<string | null>(null);
  const { toast } = useToast();
  
  const currentAttachment = loadedAttachments[currentIndex];
  const hasMultiple = attachments.length > 1;

  // Lazy load image data when viewer opens or index changes
  useEffect(() => {
    const loadImageData = async () => {
      if (!currentAttachment || currentAttachment.type !== 'image' || currentAttachment.data) {
        return; // Already loaded or not an image
      }

      setLoadingImageId(currentAttachment.id);
      try {
        const data = await getAttachment(currentAttachment.id);
        if (data) {
          // Update the loaded attachments array with the image data
          setLoadedAttachments(prev => 
            prev.map(att => 
              att.id === currentAttachment.id 
                ? { ...att, data } 
                : att
            )
          );
        } else {
          toast({
            title: 'Image not found',
            description: 'The image data could not be loaded.',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Failed to load image:', error);
        toast({
          title: 'Error loading image',
          description: 'Failed to load image data from storage.',
          variant: 'destructive',
        });
      } finally {
        setLoadingImageId(null);
      }
    };

    if (open) {
      loadImageData();
    }
  }, [open, currentAttachment, toast]);

  // Reset loaded attachments when attachments prop changes
  useEffect(() => {
    setLoadedAttachments(attachments);
  }, [attachments]);

  const handlePrevious = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : attachments.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < attachments.length - 1 ? prev + 1 : 0));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowLeft') handlePrevious();
    if (e.key === 'ArrowRight') handleNext();
    if (e.key === 'Escape') onOpenChange(false);
  };

  const handleOpenLink = () => {
    if (!currentAttachment.url) return;
    
    // Validate URL before opening for security
    if (!isValidUrl(currentAttachment.url)) {
      toast({
        title: 'Invalid URL',
        description: 'This URL cannot be opened for security reasons. Only http://, https://, and mailto: links are supported.',
        variant: 'destructive',
      });
      return;
    }

    window.open(currentAttachment.url, '_blank', 'noopener,noreferrer');
  };

  if (!currentAttachment) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent 
        className="sm:max-w-[800px] max-h-[90vh]"
        onKeyDown={handleKeyDown}
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {currentAttachment.type === 'link' ? (
              <LinkIcon className="w-4 h-4" />
            ) : (
              <ImageIcon className="w-4 h-4" />
            )}
            {currentAttachment.name}
            {hasMultiple && (
              <span className="text-sm text-muted-foreground ml-auto">
                {currentIndex + 1} / {attachments.length}
              </span>
            )}
          </DialogTitle>
        </DialogHeader>

        <div className="relative">
          {currentAttachment.type === 'link' ? (
            <div className="space-y-4 py-6">
              <div className="p-4 bg-muted rounded-lg">
                <p className="text-sm text-muted-foreground mb-1">URL:</p>
                <p className="font-mono text-sm break-all">{currentAttachment.url}</p>
              </div>
              <Button
                onClick={handleOpenLink}
                className="w-full"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Open Link in New Tab
              </Button>
            </div>
          ) : (
            <div className="flex items-center justify-center bg-muted/30 rounded-lg overflow-hidden min-h-[300px] max-h-[60vh]">
              {loadingImageId === currentAttachment.id ? (
                <div className="flex flex-col items-center gap-2">
                  <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Loading image...</p>
                </div>
              ) : currentAttachment.data ? (
                <img
                  src={currentAttachment.data}
                  alt={currentAttachment.name}
                  className="max-w-full max-h-[60vh] object-contain"
                />
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <ImageIcon className="w-8 h-8 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Image not available</p>
                </div>
              )}
            </div>
          )}

          {hasMultiple && (
            <div className="flex items-center justify-between mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
              >
                <ChevronLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              
              <div className="flex gap-1">
                {attachments.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentIndex(idx)}
                    className={cn(
                      "w-2 h-2 rounded-full transition-all",
                      idx === currentIndex
                        ? "bg-primary w-6"
                        : "bg-muted-foreground/30 hover:bg-muted-foreground/50"
                    )}
                    aria-label={`Go to attachment ${idx + 1}`}
                  />
                ))}
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={handleNext}
              >
                Next
                <ChevronRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
