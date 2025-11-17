import { useState } from 'react';
import { Handle, Position, NodeProps } from 'reactflow';
import { Paperclip } from 'lucide-react';
import { AVAILABLE_ICONS } from '@/components/IconPicker';
import { NodeData } from '@/types/Diagram';
import { AttachmentViewer } from '@/components/AttachmentViewer';
import { useNeonMode } from '@/hooks/useNeonMode';

export const CustomNode = ({ data, id }: NodeProps<NodeData>) => {
  const [viewerOpen, setViewerOpen] = useState(false);
  const { neonMode } = useNeonMode();
  const IconComponent = AVAILABLE_ICONS.find((icon) => icon.name === data.icon)?.component;
  
  const hasAttachments = data.attachments && data.attachments.length > 0;
  
  // Add outline for black/dark colors and white for visibility
  const isVeryDark = data.color.toLowerCase() === '#000000' || data.color.toLowerCase() === '#000';
  const isWhite = data.color.toLowerCase() === '#ffffff' || data.color.toLowerCase() === '#fff';

  const handleNodeClick = () => {
    if (hasAttachments) {
      setViewerOpen(true);
    }
  };

  return (
    <>
      {/* Main node container */}
      <div
          className="relative px-4 py-3 rounded-lg border min-w-[180px] shadow-2xl transition-all hover:shadow-xl bg-card/75 backdrop-blur-md"
          style={{
            borderColor: data.color,
            boxShadow: neonMode 
              ? `0 0 20px ${data.color}40, 0 0 40px ${data.color}20, inset 0 0 20px ${data.color}10`
              : undefined,
          }}
        >
          <Handle type="target" position={Position.Top} className="!bg-primary" />
          
          {/* Attachment badge */}
          {hasAttachments && (
            <div 
              className={`absolute -top-2 -right-2 bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold shadow-md cursor-pointer hover:scale-110 transition-transform z-10 pointer-events-auto ${neonMode ? 'neon-glow-cyan' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                setViewerOpen(true);
              }}
              title="Click to view attachments"
            >
              {data.attachments!.length}
            </div>
          )}

          {/* Node content - horizontal layout */}
        <div 
          className={`flex items-center gap-3 pointer-events-auto ${hasAttachments ? 'cursor-pointer' : ''}`}
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
            <Paperclip className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0 animate-pulse" />
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
