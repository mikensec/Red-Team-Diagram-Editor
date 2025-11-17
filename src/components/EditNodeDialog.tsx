import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { IconPicker } from './IconPicker';
import { ColorPicker } from './ColorPicker';
import { AttachmentManager } from './AttachmentManager';
import { NodeData, Attachment } from '@/types/Diagram';
import { Separator } from '@/components/ui/separator';
import { INPUT_LIMITS, validateLength } from '@/utils/validation';
import { useToast } from '@/hooks/use-toast';

interface EditNodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (data: NodeData) => void;
  initialData: NodeData | null;
}

export const EditNodeDialog = ({ open, onOpenChange, onSave, initialData }: EditNodeDialogProps) => {
  const [label, setLabel] = useState('');
  const [icon, setIcon] = useState('Shield');
  const [color, setColor] = useState('#3b82f6');
  const [description, setDescription] = useState('');
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    if (initialData) {
      setLabel(initialData.label);
      setIcon(initialData.icon);
      setColor(initialData.color);
      setDescription(initialData.description || '');
      setAttachments(initialData.attachments || []);
    }
  }, [initialData]);

  const handleSubmit = () => {
    const trimmedLabel = label.trim();
    const trimmedDescription = description.trim();
    
    if (!trimmedLabel) return;
    
    // Validate label length
    if (!validateLength(trimmedLabel, INPUT_LIMITS.NODE_LABEL)) {
      toast({
        title: 'Label too long',
        description: `Label must be less than ${INPUT_LIMITS.NODE_LABEL} characters`,
        variant: 'destructive',
      });
      return;
    }

    // Validate description length
    if (trimmedDescription && !validateLength(trimmedDescription, INPUT_LIMITS.NODE_DESCRIPTION)) {
      toast({
        title: 'Description too long',
        description: `Description must be less than ${INPUT_LIMITS.NODE_DESCRIPTION} characters`,
        variant: 'destructive',
      });
      return;
    }
    
    onSave({
      label: trimmedLabel,
      icon,
      color,
      description: trimmedDescription || undefined,
      attachments: attachments.length > 0 ? attachments : undefined,
    });

    onOpenChange(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && label.trim()) {
      handleSubmit();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Edit Node</DialogTitle>
          <DialogDescription>
            Update the node's icon, color, and label.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4 max-h-[60vh] overflow-y-auto">
          <div className="space-y-2">
            <Label htmlFor="label">Label</Label>
            <Input
              id="label"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="e.g., Initial Access, Lateral Movement"
              maxLength={INPUT_LIMITS.NODE_LABEL}
              autoFocus
            />
            <p className="text-xs text-muted-foreground">
              {label.length}/{INPUT_LIMITS.NODE_LABEL} characters
            </p>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="description">Description (Optional)</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a brief description..."
              maxLength={INPUT_LIMITS.NODE_DESCRIPTION}
              rows={2}
            />
            <p className="text-xs text-muted-foreground">
              {description.length}/{INPUT_LIMITS.NODE_DESCRIPTION} characters
            </p>
          </div>

          <IconPicker value={icon} onChange={setIcon} />
          <ColorPicker value={color} onChange={setColor} />
          
          <Separator />
          
          <AttachmentManager
            attachments={attachments}
            onChange={setAttachments}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!label.trim()}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
