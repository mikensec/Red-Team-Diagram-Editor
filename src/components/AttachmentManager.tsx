import { useState, useRef } from 'react';
import { Attachment } from '@/types/Diagram';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Paperclip, X, Link as LinkIcon, Image as ImageIcon, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface AttachmentManagerProps {
  attachments: Attachment[];
  onChange: (attachments: Attachment[]) => void;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

export const AttachmentManager = ({ attachments, onChange }: AttachmentManagerProps) => {
  const [linkUrl, setLinkUrl] = useState('');
  const [linkName, setLinkName] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const processImageFile = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: 'Warning',
          description: 'File is large (>5MB). May affect performance.',
          variant: 'destructive',
        });
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string);
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setIsProcessing(true);

    try {
      const newAttachments: Attachment[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        if (!file.type.startsWith('image/')) {
          toast({
            title: 'Invalid file type',
            description: `${file.name} is not an image file`,
            variant: 'destructive',
          });
          continue;
        }

        const data = await processImageFile(file);
        
        newAttachments.push({
          id: `att-${Date.now()}-${i}`,
          type: 'image',
          name: file.name,
          data,
          createdAt: Date.now(),
        });
      }

      onChange([...attachments, ...newAttachments]);
      
      toast({
        title: 'Files uploaded',
        description: `Added ${newAttachments.length} image(s)`,
      });
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: error instanceof Error ? error.message : 'Failed to upload files',
        variant: 'destructive',
      });
    } finally {
      setIsProcessing(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAddLink = () => {
    if (!linkUrl.trim()) return;

    const newAttachment: Attachment = {
      id: `att-${Date.now()}`,
      type: 'link',
      name: linkName.trim() || linkUrl,
      url: linkUrl.trim(),
      createdAt: Date.now(),
    };

    onChange([...attachments, newAttachment]);
    setLinkUrl('');
    setLinkName('');

    toast({
      title: 'Link added',
      description: 'Link attachment added successfully',
    });
  };

  const handleDelete = (id: string) => {
    onChange(attachments.filter((att) => att.id !== id));
    toast({
      title: 'Attachment removed',
      description: 'Attachment deleted successfully',
    });
  };

  const formatFileSize = (base64: string): string => {
    const bytes = (base64.length * 3) / 4;
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <Paperclip className="w-4 h-4 text-muted-foreground" />
        <Label>Attachments ({attachments.length})</Label>
      </div>

      {/* Link Input Section */}
      <div className="space-y-2 p-3 border rounded-lg bg-muted/30">
        <Label className="text-sm font-medium flex items-center gap-2">
          <LinkIcon className="w-3.5 h-3.5" />
          Add Link
        </Label>
        <Input
          placeholder="Link URL"
          value={linkUrl}
          onChange={(e) => setLinkUrl(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddLink()}
        />
        <Input
          placeholder="Link name (optional)"
          value={linkName}
          onChange={(e) => setLinkName(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && handleAddLink()}
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={handleAddLink}
          disabled={!linkUrl.trim()}
          className="w-full"
        >
          <LinkIcon className="w-3.5 h-3.5 mr-2" />
          Add Link
        </Button>
      </div>

      {/* Image Upload Section */}
      <div className="space-y-2 p-3 border rounded-lg bg-muted/30">
        <Label className="text-sm font-medium flex items-center gap-2">
          <ImageIcon className="w-3.5 h-3.5" />
          Add Image/Screenshot
        </Label>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          multiple
          onChange={handleFileUpload}
          className="hidden"
        />
        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
          disabled={isProcessing}
          className="w-full"
        >
          <Upload className="w-3.5 h-3.5 mr-2" />
          {isProcessing ? 'Processing...' : 'Upload Images'}
        </Button>
        <p className="text-xs text-muted-foreground">
          Supports PNG, JPG, GIF (including animated). Max 5MB per file.
        </p>
      </div>

      {/* Attachments List */}
      {attachments.length > 0 && (
        <div className="space-y-2 max-h-[200px] overflow-y-auto">
          {attachments.map((attachment) => (
            <div
              key={attachment.id}
              className="flex items-center gap-2 p-2 border rounded-lg bg-card hover:bg-accent/50 transition-colors group"
            >
              {attachment.type === 'link' ? (
                <LinkIcon className="w-4 h-4 text-primary flex-shrink-0" />
              ) : (
                <div className="w-10 h-10 rounded border overflow-hidden flex-shrink-0">
                  <img
                    src={attachment.data}
                    alt={attachment.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{attachment.name}</p>
                {attachment.type === 'link' && attachment.url && (
                  <p className="text-xs text-muted-foreground truncate">{attachment.url}</p>
                )}
                {attachment.type === 'image' && attachment.data && (
                  <p className="text-xs text-muted-foreground">
                    {formatFileSize(attachment.data)}
                  </p>
                )}
              </div>

              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => handleDelete(attachment.id)}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
