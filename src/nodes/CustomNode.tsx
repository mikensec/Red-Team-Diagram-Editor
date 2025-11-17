import { useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Edit, Copy, Trash2 } from 'lucide-react';
import { AVAILABLE_ICONS } from '@/components/IconPicker';
import { NodeData } from '@/types/Diagram';

export const CustomNode = ({ data, id }: NodeProps<NodeData>) => {
  const [isHovered, setIsHovered] = useState(false);
  const IconComponent = AVAILABLE_ICONS.find((icon) => icon.name === data.icon)?.component;

  return (
    <div
      className="relative px-4 py-3 rounded-lg border-2 min-w-[150px] text-center shadow-lg transition-all hover:shadow-xl bg-card"
      style={{
        borderColor: data.color,
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <Handle type="target" position={Position.Top} className="!bg-primary" />
      
      {isHovered && (
        <div className="absolute -top-10 left-1/2 -translate-x-1/2 flex gap-1 bg-card border border-border rounded-md p-1 shadow-lg z-50">
          <button
            onClick={(e) => {
              e.stopPropagation();
              data.onEdit?.(id);
            }}
            className="p-1.5 hover:bg-accent rounded transition-colors"
            title="Edit"
          >
            <Edit className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              data.onClone?.(id);
            }}
            className="p-1.5 hover:bg-accent rounded transition-colors"
            title="Clone"
          >
            <Copy className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              data.onDelete?.(id);
            }}
            className="p-1.5 hover:bg-destructive/10 text-destructive rounded transition-colors"
            title="Delete"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      <div className="flex flex-col items-center gap-2">
        {IconComponent && (
          <IconComponent className="w-5 h-5" style={{ color: data.color }} />
        )}
        <div className="font-medium text-sm text-foreground">{data.label}</div>
      </div>
      <Handle type="source" position={Position.Bottom} className="!bg-primary" />
    </div>
  );
};
