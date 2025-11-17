import { Handle, Position, NodeProps } from 'reactflow';
import { AVAILABLE_ICONS } from '@/components/IconPicker';
import { NodeData } from '@/types/Diagram';

export const CustomNode = ({ data }: NodeProps<NodeData>) => {
  const IconComponent = AVAILABLE_ICONS.find((icon) => icon.name === data.icon)?.component;

  return (
    <div
      className="px-4 py-3 rounded-lg border-2 min-w-[150px] text-center shadow-lg transition-all hover:shadow-xl bg-card"
      style={{
        borderColor: data.color,
      }}
    >
      <Handle type="target" position={Position.Top} className="!bg-primary" />
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
