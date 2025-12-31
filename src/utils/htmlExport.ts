import { Diagram, Attachment } from '@/types/Diagram';
import { getAttachment } from './indexedDB';

// Embed all image data for export
const embedImageData = async (diagram: Diagram): Promise<Diagram> => {
  const exportDiagram = JSON.parse(JSON.stringify(diagram));
  
  for (const node of exportDiagram.nodes) {
    if (node.data.attachments) {
      for (const attachment of node.data.attachments) {
        if (attachment.type === 'image' && !attachment.data) {
          const data = await getAttachment(attachment.id);
          if (data) {
            attachment.data = data;
          }
        }
      }
    }
  }
  
  return exportDiagram;
};

export const exportAsHtml = async (diagram: Diagram): Promise<void> => {
  // Embed all image data
  const exportDiagram = await embedImageData(diagram);
  
  const htmlContent = generateHtmlContent(exportDiagram);
  
  const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `attack-diagram-${new Date().toISOString().split('T')[0]}.html`;
  link.click();
  URL.revokeObjectURL(url);
};

const generateHtmlContent = (diagram: Diagram): string => {
  const diagramJson = JSON.stringify(diagram);
  
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Attack Diagram - Interactive Viewer</title>
  <script src="https://unpkg.com/react@18/umd/react.production.min.js" crossorigin></script>
  <script src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js" crossorigin></script>
  <script src="https://unpkg.com/reactflow@11/dist/umd/index.js" crossorigin></script>
  <script src="https://unpkg.com/lucide@0.462.0/dist/umd/lucide.min.js" crossorigin></script>
  <link href="https://unpkg.com/reactflow@11/dist/style.css" rel="stylesheet" />
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --background: 220 20% 12%;
      --foreground: 210 40% 98%;
      --card: 220 18% 15%;
      --card-foreground: 210 40% 98%;
      --primary: 217 91% 60%;
      --primary-foreground: 210 40% 98%;
      --muted-foreground: 215 20% 65%;
      --border: 220 16% 25%;
    }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background: hsl(var(--background));
      color: hsl(var(--foreground));
    }
    #root { width: 100vw; height: 100vh; }
    .react-flow { background: hsl(var(--background)); }
    .react-flow__background { background: hsl(var(--background)); }
    
    /* Node styles */
    .node-container {
      position: relative;
      padding: 12px 16px;
      border-radius: 8px;
      min-width: 180px;
      transition: all 0.2s;
      background: hsla(220, 18%, 15%, 0.75);
      backdrop-filter: blur(12px);
      border: 1px solid;
    }
    .node-container.transparent {
      background: transparent;
      border: none;
      box-shadow: none;
    }
    .node-container:hover { transform: scale(1.02); }
    .node-content {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      text-align: center;
    }
    .node-icon { flex-shrink: 0; }
    .node-icon svg { width: 20px; height: 20px; }
    .node-label { font-weight: 500; font-size: 14px; }
    .node-description { font-size: 12px; color: hsl(var(--muted-foreground)); margin-top: 2px; }
    .node-links { margin-top: 4px; }
    .node-link {
      display: block;
      font-size: 11px;
      color: hsl(var(--primary));
      text-decoration: none;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 160px;
    }
    .node-link:hover { text-decoration: underline; }
    
    /* Attachment badge */
    .attachment-badge {
      position: absolute;
      top: -8px;
      right: -8px;
      background: hsl(var(--primary));
      color: hsl(var(--primary-foreground));
      border-radius: 50%;
      width: 24px;
      height: 24px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 11px;
      font-weight: bold;
      cursor: pointer;
      transition: transform 0.2s;
      z-index: 10;
    }
    .attachment-badge:hover { transform: scale(1.1); }
    
    /* Modal */
    .modal-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      padding: 20px;
    }
    .modal-content {
      background: hsl(var(--card));
      border-radius: 12px;
      max-width: 90vw;
      max-height: 90vh;
      overflow: auto;
      border: 1px solid hsl(var(--border));
    }
    .modal-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 20px;
      border-bottom: 1px solid hsl(var(--border));
    }
    .modal-title { font-weight: 600; font-size: 18px; }
    .modal-close {
      background: transparent;
      border: none;
      color: hsl(var(--foreground));
      cursor: pointer;
      padding: 8px;
      border-radius: 6px;
    }
    .modal-close:hover { background: hsla(0,0%,100%,0.1); }
    .modal-body { padding: 20px; }
    
    /* Attachment list */
    .attachment-list { display: flex; flex-direction: column; gap: 12px; }
    .attachment-item {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 12px;
      background: hsla(0,0%,100%,0.05);
      border-radius: 8px;
    }
    .attachment-name { font-weight: 500; font-size: 14px; }
    .attachment-image {
      max-width: 100%;
      max-height: 400px;
      object-fit: contain;
      border-radius: 6px;
    }
    .attachment-link {
      color: hsl(var(--primary));
      text-decoration: none;
      word-break: break-all;
    }
    .attachment-link:hover { text-decoration: underline; }
    
    /* Controls info */
    .controls-info {
      position: fixed;
      bottom: 20px;
      left: 20px;
      background: hsl(var(--card));
      padding: 12px 16px;
      border-radius: 8px;
      font-size: 12px;
      color: hsl(var(--muted-foreground));
      border: 1px solid hsl(var(--border));
      z-index: 100;
    }
    
    /* Hide ReactFlow handles in viewer */
    .react-flow__handle { display: none; }
  </style>
</head>
<body>
  <div id="root"></div>
  <script>
    const diagramData = ${diagramJson};
    
    const { useState, useCallback, createElement: h } = React;
    const { ReactFlow, Background, Controls, MiniMap } = window.ReactFlow;
    
    // Icon mapping using Lucide
    const iconMap = {
      'Target': 'target',
      'Shield': 'shield',
      'Key': 'key',
      'Lock': 'lock',
      'Unlock': 'unlock',
      'AlertTriangle': 'alert-triangle',
      'Terminal': 'terminal',
      'Server': 'server',
      'Database': 'database',
      'Cloud': 'cloud',
      'Wifi': 'wifi',
      'Globe': 'globe',
      'Mail': 'mail',
      'User': 'user',
      'Users': 'users',
      'FileText': 'file-text',
      'Folder': 'folder',
      'HardDrive': 'hard-drive',
      'Cpu': 'cpu',
      'Bug': 'bug',
      'Zap': 'zap',
      'Eye': 'eye',
      'EyeOff': 'eye-off',
      'Search': 'search',
      'Download': 'download',
      'Upload': 'upload',
      'Code': 'code',
      'Link': 'link',
      'ExternalLink': 'external-link',
      'Settings': 'settings',
      'Tool': 'wrench',
      'Trash': 'trash-2',
      'Plus': 'plus',
      'Minus': 'minus',
      'Check': 'check',
      'X': 'x',
      'ChevronRight': 'chevron-right',
      'ChevronLeft': 'chevron-left',
      'ArrowRight': 'arrow-right',
      'ArrowLeft': 'arrow-left',
      'Play': 'play',
      'Pause': 'pause',
      'RefreshCw': 'refresh-cw',
      'RotateCcw': 'rotate-ccw',
      'Copy': 'copy',
      'Clipboard': 'clipboard',
      'Calendar': 'calendar',
      'Clock': 'clock',
      'MapPin': 'map-pin',
      'Phone': 'phone',
      'Smartphone': 'smartphone',
      'Monitor': 'monitor',
      'Laptop': 'laptop',
      'Printer': 'printer',
      'Camera': 'camera',
      'Image': 'image',
      'Video': 'video',
      'Music': 'music',
      'Mic': 'mic',
      'Volume2': 'volume-2',
      'Bell': 'bell',
      'MessageSquare': 'message-square',
      'Send': 'send',
      'Inbox': 'inbox',
      'Archive': 'archive',
      'Bookmark': 'bookmark',
      'Star': 'star',
      'Heart': 'heart',
      'ThumbsUp': 'thumbs-up',
      'Flag': 'flag',
      'Award': 'award',
      'Gift': 'gift',
      'ShoppingCart': 'shopping-cart',
      'CreditCard': 'credit-card',
      'DollarSign': 'dollar-sign',
      'Briefcase': 'briefcase',
      'Building': 'building',
      'Home': 'home',
      'Truck': 'truck',
      'Plane': 'plane',
      'Navigation': 'navigation',
      'Compass': 'compass',
      'Sun': 'sun',
      'Moon': 'moon',
      'CloudRain': 'cloud-rain',
      'Thermometer': 'thermometer',
      'Droplet': 'droplet',
      'Wind': 'wind',
      'Feather': 'feather',
      'Leaf': 'leaf',
      'Flower': 'flower',
      'Mountain': 'mountain'
    };
    
    // Create icon element
    function createIcon(iconName, color) {
      const lucideName = iconMap[iconName] || 'circle';
      const iconEl = document.createElement('div');
      iconEl.innerHTML = '<i data-lucide="' + lucideName + '"></i>';
      setTimeout(() => lucide.createIcons(), 0);
      return h('div', { 
        className: 'node-icon',
        style: { color },
        dangerouslySetInnerHTML: { __html: '<i data-lucide="' + lucideName + '" style="width:20px;height:20px;"></i>' }
      });
    }
    
    // Attachment Modal Component
    function AttachmentModal({ attachments, onClose }) {
      return h('div', { className: 'modal-overlay', onClick: onClose },
        h('div', { className: 'modal-content', onClick: e => e.stopPropagation() },
          h('div', { className: 'modal-header' },
            h('span', { className: 'modal-title' }, 'Attachments (' + attachments.length + ')'),
            h('button', { className: 'modal-close', onClick: onClose }, '✕')
          ),
          h('div', { className: 'modal-body' },
            h('div', { className: 'attachment-list' },
              attachments.map(att => 
                h('div', { key: att.id, className: 'attachment-item' },
                  h('div', { className: 'attachment-name' }, att.name),
                  att.type === 'image' && att.data
                    ? h('img', { className: 'attachment-image', src: att.data, alt: att.name })
                    : att.type === 'link' && att.url
                      ? h('a', { 
                          className: 'attachment-link', 
                          href: att.url, 
                          target: '_blank',
                          rel: 'noopener noreferrer'
                        }, att.url)
                      : null
                )
              )
            )
          )
        )
      );
    }
    
    // Custom Node Component
    function CustomNode({ data }) {
      const [showModal, setShowModal] = useState(false);
      const hasAttachments = data.attachments && data.attachments.length > 0;
      const urlAttachments = (data.attachments || []).filter(att => att.type === 'link');
      const isTransparent = data.color === 'transparent';
      
      return h('div', null,
        h('div', { 
          className: 'node-container' + (isTransparent ? ' transparent' : ''),
          style: isTransparent ? {} : { 
            borderColor: data.color,
            boxShadow: '0 0 20px ' + data.color + '40, 0 0 40px ' + data.color + '20'
          }
        },
          hasAttachments && h('div', { 
            className: 'attachment-badge',
            onClick: () => setShowModal(true)
          }, data.attachments.length),
          h('div', { className: 'node-content' },
            createIcon(data.icon, isTransparent ? 'hsl(var(--foreground))' : data.color),
            h('div', null,
              h('div', { className: 'node-label' }, data.label),
              data.description && h('div', { className: 'node-description' }, data.description),
              urlAttachments.length > 0 && h('div', { className: 'node-links' },
                urlAttachments.map(att => 
                  h('a', { 
                    key: att.id,
                    className: 'node-link',
                    href: att.url,
                    target: '_blank',
                    rel: 'noopener noreferrer'
                  }, att.url)
                )
              )
            )
          )
        ),
        showModal && hasAttachments && h(AttachmentModal, {
          attachments: data.attachments,
          onClose: () => setShowModal(false)
        })
      );
    }
    
    const nodeTypes = { custom: CustomNode };
    
    // Main App Component
    function App() {
      const nodes = diagramData.nodes.map(node => ({
        ...node,
        data: { ...node.data, onEdit: undefined, onClone: undefined, onDelete: undefined }
      }));
      const edges = diagramData.edges;
      
      return h('div', { style: { width: '100%', height: '100%' } },
        h(ReactFlow, {
          nodes,
          edges,
          nodeTypes,
          fitView: true,
          nodesDraggable: true,
          nodesConnectable: false,
          elementsSelectable: true,
          panOnScroll: true,
          zoomOnScroll: true,
          defaultEdgeOptions: { type: 'smoothstep' }
        },
          h(Background, { color: '#374151', gap: 20 }),
          h(Controls, {}),
          h(MiniMap, { nodeColor: '#3b82f6', maskColor: 'rgba(0,0,0,0.8)' })
        ),
        h('div', { className: 'controls-info' },
          'Pan: Click + Drag | Zoom: Scroll | Click attachment badges to view images'
        )
      );
    }
    
    // Render
    ReactDOM.createRoot(document.getElementById('root')).render(h(App));
    
    // Initialize Lucide icons after render
    setTimeout(() => lucide.createIcons(), 100);
  </script>
</body>
</html>`;
};
