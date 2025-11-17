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

interface AddNodeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddNode: (data: NodeData) => void;
}

export const AddNodeDialog = ({ open, onOpenChange, onAddNode }: AddNodeDialogProps) => {
  const [label, setLabel] = useState('');
  const [icon, setIcon] = useState('Shield');
  const [color, setColor] = useState('#3b82f6');

  const handleSubmit = () => {
    if (!label.trim()) return;
    
    onAddNode({
      label: label.trim(),
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
      <DialogContent className="sm:max-w-[500px]">
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
              autoFocus
            />
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
