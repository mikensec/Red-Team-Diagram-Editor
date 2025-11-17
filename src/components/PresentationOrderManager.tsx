import { useState, useMemo } from 'react';
import { AttackNode } from '@/types/Diagram';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ArrowUp, ArrowDown, Hash, X, Grid3x3 } from 'lucide-react';
import * as Icons from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface PresentationOrderManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nodes: AttackNode[];
  onUpdateNodeOrder: (nodeId: string, order: number | undefined) => void;
  onAutoOrder: () => void;
}

export const PresentationOrderManager = ({
  open,
  onOpenChange,
  nodes,
  onUpdateNodeOrder,
  onAutoOrder,
}: PresentationOrderManagerProps) => {
  const { toast } = useToast();

  // Sort nodes by presentation order, then by creation order
  const sortedNodes = useMemo(() => {
    return [...nodes].sort((a, b) => {
      const orderA = a.data.presentationOrder ?? Infinity;
      const orderB = b.data.presentationOrder ?? Infinity;
      if (orderA === orderB) return 0;
      return orderA - orderB;
    });
  }, [nodes]);

  const orderedNodes = sortedNodes.filter(n => n.data.presentationOrder !== undefined);
  const unorderedNodes = sortedNodes.filter(n => n.data.presentationOrder === undefined);

  const handleMoveUp = (nodeId: string, currentOrder: number) => {
    const affectedNodes = orderedNodes.filter(n => n.data.presentationOrder !== undefined);
    const currentIndex = affectedNodes.findIndex(n => n.id === nodeId);
    
    if (currentIndex > 0) {
      const previousNode = affectedNodes[currentIndex - 1];
      onUpdateNodeOrder(nodeId, currentOrder - 1);
      onUpdateNodeOrder(previousNode.id, currentOrder);
      toast({
        title: 'Order updated',
        description: 'Nodes swapped successfully',
      });
    }
  };

  const handleMoveDown = (nodeId: string, currentOrder: number) => {
    const affectedNodes = orderedNodes.filter(n => n.data.presentationOrder !== undefined);
    const currentIndex = affectedNodes.findIndex(n => n.id === nodeId);
    
    if (currentIndex < affectedNodes.length - 1) {
      const nextNode = affectedNodes[currentIndex + 1];
      onUpdateNodeOrder(nodeId, currentOrder + 1);
      onUpdateNodeOrder(nextNode.id, currentOrder);
      toast({
        title: 'Order updated',
        description: 'Nodes swapped successfully',
      });
    }
  };

  const handleRemoveFromPresentation = (nodeId: string) => {
    onUpdateNodeOrder(nodeId, undefined);
    toast({
      title: 'Removed from presentation',
      description: 'Node will not appear in presentation mode',
    });
  };

  const handleAddToPresentation = (nodeId: string) => {
    const maxOrder = Math.max(0, ...orderedNodes.map(n => n.data.presentationOrder || 0));
    onUpdateNodeOrder(nodeId, maxOrder + 1);
    toast({
      title: 'Added to presentation',
      description: `Set as step ${maxOrder + 1}`,
    });
  };

  const handleAutoOrder = () => {
    onAutoOrder();
    toast({
      title: 'Auto-ordered',
      description: 'Nodes ordered by position (top-to-bottom, left-to-right)',
    });
  };

  const getNodeIcon = (iconName: string) => {
    const IconComponent = (Icons as any)[iconName];
    return IconComponent || Icons.Circle;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle>Manage Presentation Order</DialogTitle>
          <DialogDescription>
            Define the order nodes appear in presentation mode. Only ordered nodes will be shown.
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-2 mb-4">
          <Button onClick={handleAutoOrder} variant="outline" size="sm" className="w-full">
            <Grid3x3 className="w-4 h-4 mr-2" />
            Auto-order by Position
          </Button>
        </div>

        <ScrollArea className="h-[50vh] pr-4">
          {/* Ordered Nodes Section */}
          {orderedNodes.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground">In Presentation ({orderedNodes.length})</h3>
              <div className="space-y-2">
                {orderedNodes.map((node, index) => {
                  const IconComponent = getNodeIcon(node.data.icon);
                  const order = node.data.presentationOrder!;
                  
                  return (
                    <div
                      key={node.id}
                      className="flex items-center gap-3 p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors"
                    >
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold text-sm">
                        {order}
                      </div>
                      
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <IconComponent className="w-4 h-4 flex-shrink-0" style={{ color: node.data.color }} />
                        <span className="text-sm font-medium truncate">{node.data.label}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMoveUp(node.id, order)}
                          disabled={index === 0}
                        >
                          <ArrowUp className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMoveDown(node.id, order)}
                          disabled={index === orderedNodes.length - 1}
                        >
                          <ArrowDown className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveFromPresentation(node.id)}
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Unordered Nodes Section */}
          {unorderedNodes.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-3 text-muted-foreground">Not in Presentation ({unorderedNodes.length})</h3>
              <div className="space-y-2">
                {unorderedNodes.map((node) => {
                  const IconComponent = getNodeIcon(node.data.icon);
                  
                  return (
                    <div
                      key={node.id}
                      className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        <IconComponent className="w-4 h-4 flex-shrink-0" style={{ color: node.data.color }} />
                        <span className="text-sm font-medium truncate">{node.data.label}</span>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleAddToPresentation(node.id)}
                      >
                        <Hash className="w-4 h-4 mr-1" />
                        Add
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {orderedNodes.length === 0 && unorderedNodes.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No nodes available
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
