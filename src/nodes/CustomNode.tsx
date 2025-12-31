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
  
  // Get URL attachments for display
  const urlAttachments = data.attachments?.filter(att => att.type === 'link') || [];
  
  const isTransparent = data.color === 'transparent';

  return (
    <>
      {/* Main node container */}
      <div
          className={`group relative px-4 py-3 rounded-lg min-w-[180px] transition-all ${
            isTransparent 
              ? 'hover:scale-105' 
              : 'border shadow-2xl hover:shadow-xl bg-card/75 backdrop-blur-md'
          }`}
          style={isTransparent ? {} : {
            borderColor: data.color,
            boxShadow: neonMode 
              ? `0 0 20px ${data.color}40, 0 0 40px ${data.color}20, inset 0 0 20px ${data.color}10`
              : undefined,
          }}
        >
          {/* Handles on all sides - visible on hover */}
          <Handle type="target" position={Position.Top} className="!w-3 !h-3 !bg-primary !border-2 !border-background opacity-0 group-hover:opacity-100 transition-opacity" id="top-target" />
          <Handle type="source" position={Position.Top} className="!w-3 !h-3 !bg-primary !border-2 !border-background opacity-0 group-hover:opacity-100 transition-opacity" id="top-source" />
          <Handle type="target" position={Position.Bottom} className="!w-3 !h-3 !bg-primary !border-2 !border-background opacity-0 group-hover:opacity-100 transition-opacity" id="bottom-target" />
          <Handle type="source" position={Position.Bottom} className="!w-3 !h-3 !bg-primary !border-2 !border-background opacity-0 group-hover:opacity-100 transition-opacity" id="bottom-source" />
          <Handle type="target" position={Position.Left} className="!w-3 !h-3 !bg-primary !border-2 !border-background opacity-0 group-hover:opacity-100 transition-opacity" id="left-target" />
          <Handle type="source" position={Position.Left} className="!w-3 !h-3 !bg-primary !border-2 !border-background opacity-0 group-hover:opacity-100 transition-opacity" id="left-source" />
          <Handle type="target" position={Position.Right} className="!w-3 !h-3 !bg-primary !border-2 !border-background opacity-0 group-hover:opacity-100 transition-opacity" id="right-target" />
          <Handle type="source" position={Position.Right} className="!w-3 !h-3 !bg-primary !border-2 !border-background opacity-0 group-hover:opacity-100 transition-opacity" id="right-source" />
          
          {/* Presentation order badge - only show when selected and NOT in presentation mode */}
          {data.presentationOrder && data.isSelected && !data.isPresentationMode && (
            <div 
              className="absolute -top-2 -left-2 w-6 h-6 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-xs font-bold shadow-lg z-10 border-2 border-background"
            >
              {data.presentationOrder}
            </div>
          )}
          
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

          {/* Node content - centered layout */}
          <div className="flex flex-col items-center gap-2 pointer-events-auto text-center">
            {IconComponent && (
              <div className="flex-shrink-0">
                <IconComponent 
                  className="w-5 h-5" 
                  style={{ 
                    color: isTransparent ? 'hsl(var(--foreground))' : data.color,
                    filter: isTransparent ? 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' : undefined
                  }} 
                />
              </div>
            )}
            <div className="w-full">
              <div 
                className="font-medium text-sm text-foreground"
                style={{ textShadow: isTransparent ? '0 1px 2px rgba(0,0,0,0.3)' : undefined }}
              >
                {data.label}
              </div>
              {data.description && (
                <div className="text-xs text-muted-foreground mt-0.5">
                  {data.description}
                </div>
              )}
              {urlAttachments.length > 0 && (
                <div className="mt-1 space-y-0.5">
                  {urlAttachments.map((att) => (
                    <a
                      key={att.id}
                      href={att.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-xs text-primary hover:underline truncate"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {att.url}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        
          
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
