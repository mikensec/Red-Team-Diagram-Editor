import { Handle, Position, NodeProps } from 'reactflow';
import { NodeType, NODE_TYPES } from '@/types/Diagram';
import { cn } from '@/lib/utils';

export const CustomNode = ({ data, type }: NodeProps) => {
  const nodeConfig = NODE_TYPES.find(n => n.value === type);
  const colorClass = nodeConfig?.color || 'node-c2';

  return (
    <div className={cn(
      "px-4 py-3 rounded-lg border-2 min-w-[150px] text-center shadow-lg transition-all hover:shadow-xl",
      "bg-card text-foreground"
    )}
    style={{
      borderColor: `hsl(var(--${colorClass}))`,
    }}>
      <Handle type="target" position={Position.Top} className="!bg-primary" />
      <div className="font-medium text-sm">{data.label}</div>
      <Handle type="source" position={Position.Bottom} className="!bg-primary" />
    </div>
  );
};
