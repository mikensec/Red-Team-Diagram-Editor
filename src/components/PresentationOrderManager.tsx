import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AttackNode } from '@/types/Diagram';
import { ArrowUp, ArrowDown, X, ListOrdered } from 'lucide-react';
import * as Icons from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

interface PresentationOrderManagerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  nodes: AttackNode[];
  onUpdateOrder: (nodeId: string, order: number | undefined) => void;
  onAutoOrder: () => void;
}

export const PresentationOrderManager = ({
  open,
  onOpenChange,
  nodes,
  onUpdateOrder,
  onAutoOrder,
}: PresentationOrderManagerProps) => {
  // Separate nodes into ordered and unordered
  const orderedNodes = nodes
    .filter(n => n.data.presentationOrder !== undefined)
    .sort((a, b) => (a.data.presentationOrder || 0) - (b.data.presentationOrder || 0));
  
  const unorderedNodes = nodes.filter(n => n.data.presentationOrder === undefined);

  const getNextAvailableOrder = () => {
    if (orderedNodes.length === 0) return 1;
    return Math.max(...orderedNodes.map(n => n.data.presentationOrder || 0)) + 1;
  };

  const handleSetFirst = (nodeId: string) => {
    // Shift all other nodes up by 1
    orderedNodes.forEach(node => {
      if (node.data.presentationOrder) {
        onUpdateOrder(node.id, node.data.presentationOrder + 1);
      }
    });
    onUpdateOrder(nodeId, 1);
  };

  const handleSetNext = (nodeId: string) => {
    onUpdateOrder(nodeId, getNextAvailableOrder());
  };

  const handleRemove = (nodeId: string) => {
    onUpdateOrder(nodeId, undefined);
  };

  const handleMoveUp = (nodeId: string, currentOrder: number) => {
    if (currentOrder <= 1) return;
    
    // Find node with order - 1
    const swapNode = orderedNodes.find(n => n.data.presentationOrder === currentOrder - 1);
    if (swapNode) {
      onUpdateOrder(swapNode.id, currentOrder);
    }
    onUpdateOrder(nodeId, currentOrder - 1);
  };

  const handleMoveDown = (nodeId: string, currentOrder: number) => {
    const maxOrder = Math.max(...orderedNodes.map(n => n.data.presentationOrder || 0));
    if (currentOrder >= maxOrder) return;
    
    // Find node with order + 1
    const swapNode = orderedNodes.find(n => n.data.presentationOrder === currentOrder + 1);
    if (swapNode) {
      onUpdateOrder(swapNode.id, currentOrder);
    }
    onUpdateOrder(nodeId, currentOrder + 1);
  };

  const getIconComponent = (iconName: string) => {
    const Icon = (Icons as any)[iconName];
    return Icon || Icons.Circle;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ListOrdered className="w-5 h-5" />
            Manage Presentation Order
          </DialogTitle>
          <DialogDescription>
            Define the order nodes appear during presentation mode. Nodes without an order will be skipped.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Button onClick={onAutoOrder} variant="outline" className="flex-1">
              <ListOrdered className="w-4 h-4 mr-2" />
              Auto-Order by Position
            </Button>
          </div>

          {orderedNodes.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">Presentation Order</h3>
              <ScrollArea className="h-[300px] border rounded-md p-2">
                <div className="space-y-2">
                  {orderedNodes.map((node) => {
                    const IconComponent = getIconComponent(node.data.icon);
                    return (
                      <div
                        key={node.id}
                        className="flex items-center gap-2 p-2 rounded-md border bg-card"
                      >
                        <div 
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
                          style={{ backgroundColor: node.data.color + '20', color: node.data.color }}
                        >
                          {node.data.presentationOrder}
                        </div>
                        <IconComponent className="w-4 h-4" style={{ color: node.data.color }} />
                        <span className="flex-1 text-sm truncate">{node.data.label}</span>
                        <div className="flex gap-1">
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => handleMoveUp(node.id, node.data.presentationOrder!)}
                            disabled={node.data.presentationOrder === 1}
                          >
                            <ArrowUp className="w-3 h-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7"
                            onClick={() => handleMoveDown(node.id, node.data.presentationOrder!)}
                            disabled={node.data.presentationOrder === orderedNodes.length}
                          >
                            <ArrowDown className="w-3 h-3" />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-destructive"
                            onClick={() => handleRemove(node.id)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          )}

          {unorderedNodes.length > 0 && (
            <div>
              <h3 className="text-sm font-medium mb-2">Nodes Not in Presentation</h3>
              <ScrollArea className="h-[200px] border rounded-md p-2">
                <div className="space-y-2">
                  {unorderedNodes.map((node) => {
                    const IconComponent = getIconComponent(node.data.icon);
                    return (
                      <div
                        key={node.id}
                        className="flex items-center gap-2 p-2 rounded-md border bg-muted/50"
                      >
                        <IconComponent className="w-4 h-4" style={{ color: node.data.color }} />
                        <span className="flex-1 text-sm truncate">{node.data.label}</span>
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSetFirst(node.id)}
                          >
                            Set as First
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleSetNext(node.id)}
                          >
                            Set as Next
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </ScrollArea>
            </div>
          )}

          {orderedNodes.length === 0 && unorderedNodes.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              No nodes available. Create some nodes first.
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
