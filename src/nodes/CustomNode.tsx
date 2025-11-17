import { useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Edit, Copy, Trash2, Paperclip } from 'lucide-react';
import { AVAILABLE_ICONS } from '@/components/IconPicker';
import { NodeData } from '@/types/Diagram';
import { AttachmentViewer } from '@/components/AttachmentViewer';

export const CustomNode = ({ data, id }: NodeProps<NodeData>) => {
  const [isHovered, setIsHovered] = useState(false);
  const [viewerOpen, setViewerOpen] = useState(false);
  const IconComponent = AVAILABLE_ICONS.find((icon) => icon.name === data.icon)?.component;
  
  const hasAttachments = data.attachments && data.attachments.length > 0;
  
  // Add white outline for black/dark colors for visibility
  const isVeryDark = data.color.toLowerCase() === '#000000' || data.color.toLowerCase() === '#000';

  const handleNodeClick = () => {
    if (hasAttachments) {
      setViewerOpen(true);
    }
  };

  return (
    <>
      <div
        className="relative px-4 py-3 rounded-lg border-2 min-w-[180px] shadow-lg transition-all hover:shadow-xl bg-card"
        style={{
          borderColor: data.color,
          boxShadow: isVeryDark ? `0 0 0 1px hsl(var(--border)), 0 10px 15px -3px rgb(0 0 0 / 0.1)` : undefined,
        }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <Handle type="target" position={Position.Top} className="!bg-primary" />
        
        {/* Attachment badge */}
        {hasAttachments && (
          <div 
            className="absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-md cursor-pointer hover:scale-110 transition-transform z-10"
            onClick={(e) => {
              e.stopPropagation();
              setViewerOpen(true);
            }}
            title="Click to view attachments"
          >
            {data.attachments!.length}
          </div>
        )}

        {/* Hover action buttons */}
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

        {/* Node content - horizontal layout */}
        <div 
          className="flex items-center gap-3 cursor-pointer"
          onClick={handleNodeClick}
        >
          {IconComponent && (
            <div className="flex-shrink-0">
              <IconComponent className="w-5 h-5" style={{ color: data.color }} />
            </div>
          )}
          <div className="flex-1 min-w-0">
            <div className="font-medium text-sm text-foreground">{data.label}</div>
            {data.description && (
              <div className="text-xs text-muted-foreground truncate mt-0.5">
                {data.description}
              </div>
            )}
          </div>
          {hasAttachments && (
            <Paperclip className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
          )}
        </div>
        
        <Handle type="source" position={Position.Bottom} className="!bg-primary" />
      </div>

      {/* Attachment Viewer */}
      {hasAttachments && (
        <AttachmentViewer
          attachments={data.attachments!}
          open={viewerOpen}
          onOpenChange={setViewerOpen}
        />
      )}
    </>
  );
};
