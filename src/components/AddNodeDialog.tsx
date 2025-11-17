import { useState } from 'react';
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
import { IconPicker } from './IconPicker';
import { ColorPicker } from './ColorPicker';
import { NodeData } from '@/types/Diagram';
import { INPUT_LIMITS, validateLength } from '@/utils/validation';
import { useToast } from '@/hooks/use-toast';

interface AddNodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddNode: (data: NodeData) => void;
}

export const AddNodeDialog = ({ open, onOpenChange, onAddNode }: AddNodeDialogProps) => {
  const [label, setLabel] = useState('');
  const [icon, setIcon] = useState('Shield');
  const [color, setColor] = useState('#3b82f6');
  const { toast } = useToast();

  const handleSubmit = () => {
    const trimmedLabel = label.trim();
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
    
    onAddNode({
      label: trimmedLabel,
      icon,
      color,
    });

    // Reset form
    setLabel('');
    setIcon('Shield');
    setColor('#3b82f6');
    onOpenChange(false);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && label.trim()) {
      handleSubmit();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Node</DialogTitle>
          <DialogDescription>
            Create a custom node with your chosen icon, color, and label.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
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
          <IconPicker value={icon} onChange={setIcon} />
          <ColorPicker value={color} onChange={setColor} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={!label.trim()}>
            Add Node
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
